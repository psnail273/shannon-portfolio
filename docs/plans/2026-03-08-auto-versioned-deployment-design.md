# Auto-versioned Dev Deployment with Cleanup

## Problem

Each deploy to dev should increment the patch version, clean up the previous container and image, and delete the old registry tag. Currently the workflow only pushes `latest` with no versioning or cleanup.

## Design

### 1. Git pre-push hook (`scripts/bump-version.sh`)

- Triggers only on pushes to `dev`
- Reads current version from `package.json`
- Increments patch version (e.g., `0.1.0` -> `0.1.1`)
- Updates `package.json`
- Commits with `[skip ci]` to avoid triggering a redundant build
- The push carries this new commit along

### 2. Simplified `dev.yaml` workflow

- Reads version from `package.json` (already bumped by hook)
- Builds and pushes image with two tags: `X.Y.Z` and `latest`
- Attempts to delete the previous version's tag from Gitea registry via API
- Deploys: stops old container, removes it, prunes dangling images, runs new container

### 3. Hook installation

- Script stored at `scripts/bump-version.sh` (checked into repo)
- Symlinked or copied to `.git/hooks/pre-push` (one-time setup per clone)

### What doesn't change

- `Dockerfile` — no modifications needed
- `package.json` structure — only the `version` field gets bumped

### Data flow

```
git push dev
  -> pre-push hook fires
  -> bumps package.json version, commits [skip ci]
  -> push goes through with new commit
  -> Gitea Actions picks up the push
  -> reads version from package.json
  -> builds image, tags X.Y.Z + latest
  -> deletes old version tag from registry (best-effort)
  -> stops/removes old container
  -> runs new container
  -> prunes dangling images
```

### New secrets needed

- `REGISTRY_TOKEN` — Gitea API token with package delete permissions (for registry cleanup). Could reuse `PASSWORD` if it has sufficient scope.
