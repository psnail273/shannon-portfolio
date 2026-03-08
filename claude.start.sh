#!/usr/bin/env bash
set -euo pipefail

# claude-start — Launch Claude Code in a container with the current repo mounted
# Drop this + Dockerfile.claude into any repo (or keep them on your PATH).

IMAGE_NAME="claude-code"
CONTAINER_NAME="claude-session-$$"
DOCKERFILE="Dockerfile.claude"

# ---------- Find container runtime (prefer podman for rootless) ----------
if command -v podman &>/dev/null; then
    RUNTIME="podman"
elif command -v docker &>/dev/null; then
    RUNTIME="docker"
else
    echo "Error: Neither podman nor docker found. Install one first." >&2
    exit 1
fi

echo "Using runtime: $RUNTIME"

# ---------- Locate the Dockerfile ----------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [[ -f "./${DOCKERFILE}" ]]; then
    DOCKERFILE_PATH="./${DOCKERFILE}"
else
    echo "Error: ${DOCKERFILE} not found in current dir" >&2
    exit 1
fi

# ---------- Build image if it doesn't exist (or if --build passed) ----------
BUILD=false
if [[ "${1:-}" == "--build" ]]; then
    BUILD=true
    shift
fi

IMAGE_EXISTS=$($RUNTIME image ls -q "$IMAGE_NAME" 2>/dev/null | head -1)
if [[ -z "$IMAGE_EXISTS" ]] || $BUILD; then
    echo "Building ${IMAGE_NAME} image..."
    $RUNTIME build \
        -t "$IMAGE_NAME" \
        -f "$DOCKERFILE_PATH" \
        "$(dirname "$DOCKERFILE_PATH")"
fi

# ---------- Mount args ----------
# Bind-mount current directory into /workspace (read-write, live sync)
MOUNT_ARGS=(
    -v "$(pwd):/workspaces:z"
)

# Mount ~/.claude user-level config (auth/credentials) — uses a separate dir
# from the project's .claude/ to avoid skills appearing twice.
mkdir -p ".claude-home"
MOUNT_ARGS+=(-v "$(pwd)/.claude-home:/home/node/.claude:z")

# Mount .claude.json so auth config persists across sessions
[[ -s ".claude.json" ]] || echo '{}' > ".claude.json"
MOUNT_ARGS+=(-v ".claude.json:/home/node/.claude.json:z")

# Mount git config so commits inside container have correct identity
if [[ -f "$HOME/.gitconfig" ]]; then
    MOUNT_ARGS+=(-v "$HOME/.gitconfig:/home/node/.gitconfig:ro,z")
fi

# ---------- Run ----------
echo "Launching Claude Code in: $(pwd)"
echo "Files are live-synced between host and container."
echo "---"

exec $RUNTIME run \
    --rm \
    -it \
    --name "$CONTAINER_NAME" \
    "${MOUNT_ARGS[@]}" \
    "$IMAGE_NAME" \
    "$@"
