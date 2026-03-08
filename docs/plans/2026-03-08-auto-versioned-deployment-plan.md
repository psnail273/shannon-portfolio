# Auto-versioned Dev Deployment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Auto-increment patch version on push to dev, tag Docker images with version numbers, and clean up old containers/images/registry tags on deploy.

**Architecture:** A git pre-push hook bumps `package.json` version and commits with `[skip ci]`. The Gitea Actions workflow reads that version, builds/tags the image, deletes the old registry tag, and deploys with full cleanup.

**Tech Stack:** Bash (pre-push hook), Gitea Actions YAML, Gitea Packages API

---

### Task 1: Create the pre-push hook script

**Files:**
- Create: `scripts/bump-version.sh`

**Step 1: Create the script**

```bash
#!/usr/bin/env bash
# Pre-push hook: bumps patch version in package.json when pushing to dev

while read local_ref local_sha remote_ref remote_sha; do
  if [ "$remote_ref" = "refs/heads/dev" ]; then
    # Read current version
    CURRENT_VERSION=$(node -p "require('./package.json').version")

    # Split into parts and bump patch
    IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"
    NEW_PATCH=$((PATCH + 1))
    NEW_VERSION="${MAJOR}.${MINOR}.${NEW_PATCH}"

    # Update package.json using node to preserve formatting
    node -e "
      const fs = require('fs');
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      pkg.version = '${NEW_VERSION}';
      fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
    "

    # Commit the version bump
    git add package.json
    git commit -m "chore: bump version to ${NEW_VERSION} [skip ci]"

    echo "Version bumped: ${CURRENT_VERSION} -> ${NEW_VERSION}"
  fi
done

exit 0
```

**Step 2: Make the script executable**

Run: `chmod +x scripts/bump-version.sh`

**Step 3: Install the hook**

Run: `ln -sf ../../scripts/bump-version.sh .git/hooks/pre-push`

**Step 4: Verify the hook is linked**

Run: `ls -la .git/hooks/pre-push`
Expected: symlink pointing to `../../scripts/bump-version.sh`

**Step 5: Commit**

```bash
git add scripts/bump-version.sh
git commit -m "feat: add pre-push hook for automatic version bumping"
```

---

### Task 2: Update dev.yaml — version extraction and image tagging

**Files:**
- Modify: `.gitea/workflows/dev.yaml`

**Step 1: Add version extraction step after checkout**

After the "Checkout code" step, add:

```yaml
      - name: Get version
        id: version
        run: |
          VERSION=$(node -p "require('./package.json').version")
          echo "VERSION=$VERSION" >> "$GITHUB_OUTPUT"

          # Calculate previous version for cleanup
          IFS='.' read -r MAJOR MINOR PATCH <<< "$VERSION"
          PREV_PATCH=$((PATCH - 1))
          if [ "$PREV_PATCH" -ge 0 ]; then
            echo "PREV_VERSION=${MAJOR}.${MINOR}.${PREV_PATCH}" >> "$GITHUB_OUTPUT"
          else
            echo "PREV_VERSION=" >> "$GITHUB_OUTPUT"
          fi
```

**Step 2: Update Build and Push step to use version tags**

Replace the `tags` section in the "Build and Push Docker image" step:

```yaml
          tags: |
            git.stuffworks.net/psnail273/shannon-portfolio-dev:${{ steps.version.outputs.VERSION }}
            git.stuffworks.net/psnail273/shannon-portfolio-dev:latest
```

**Step 3: Verify the YAML is valid**

Run: `node -e "const yaml = require('yaml'); yaml.parse(require('fs').readFileSync('.gitea/workflows/dev.yaml','utf8')); console.log('Valid YAML')"` or manually review.

**Step 4: Commit**

```bash
git add .gitea/workflows/dev.yaml
git commit -m "feat: tag docker images with version from package.json"
```

---

### Task 3: Update dev.yaml — registry cleanup

**Files:**
- Modify: `.gitea/workflows/dev.yaml`

**Step 1: Add registry cleanup step after Build and Push**

Insert this step between "Build and Push Docker image" and "Deploy container":

```yaml
      - name: Delete previous version from registry
        if: steps.version.outputs.PREV_VERSION != ''
        continue-on-error: true
        run: |
          PREV_VERSION="${{ steps.version.outputs.PREV_VERSION }}"
          echo "Attempting to delete version ${PREV_VERSION} from registry..."

          # List package versions and find the one matching PREV_VERSION
          PACKAGE_ID=$(curl -s \
            -H "Authorization: token ${{ secrets.REGISTRY_TOKEN }}" \
            "https://git.stuffworks.net/api/v1/packages/psnail273?type=container&q=shannon-portfolio-dev" \
            | jq -r ".[] | select(.version == \"${PREV_VERSION}\") | .id")

          if [ -n "$PACKAGE_ID" ] && [ "$PACKAGE_ID" != "null" ]; then
            curl -s -X DELETE \
              -H "Authorization: token ${{ secrets.REGISTRY_TOKEN }}" \
              "https://git.stuffworks.net/api/v1/packages/psnail273/${PACKAGE_ID}"
            echo "Deleted version ${PREV_VERSION} (package ID: ${PACKAGE_ID})"
          else
            echo "Previous version ${PREV_VERSION} not found in registry, skipping"
          fi
```

**Step 2: Commit**

```bash
git add .gitea/workflows/dev.yaml
git commit -m "feat: delete previous version from Gitea registry on deploy"
```

---

### Task 4: Update dev.yaml — container deploy with image pruning

**Files:**
- Modify: `.gitea/workflows/dev.yaml`

**Step 1: Update the Deploy container step**

Replace the existing "Deploy container" step with:

```yaml
      - name: Deploy container
        run: |
          VERSION="${{ steps.version.outputs.VERSION }}"
          IMAGE="git.stuffworks.net/psnail273/shannon-portfolio-dev:${VERSION}"

          docker pull "$IMAGE"
          docker stop shannon-portfolio-dev || true
          docker rm shannon-portfolio-dev || true

          # Remove dangling images to free disk space
          docker image prune -f

          docker run -d \
            --name shannon-portfolio-dev \
            --restart unless-stopped \
            --network caddy-network \
            -e AUTH_SECRET="${{ secrets.DEV_AUTH_SECRET }}" \
            -e PASSWORD="${{ secrets.DEV_PASSWORD }}" \
            -e DATABASE_URL="${{ secrets.DEV_DATABASE_URL }}" \
            "$IMAGE"

          echo "Deployed version ${VERSION}"
```

**Step 2: Commit**

```bash
git add .gitea/workflows/dev.yaml
git commit -m "feat: deploy with versioned image and prune old images"
```

---

### Task 5: Manual setup and verification

**Step 1: Create `REGISTRY_TOKEN` secret in Gitea**

In your Gitea repo settings (Settings > Actions > Secrets), add:
- `REGISTRY_TOKEN` — a Gitea personal access token with `package` scope (or `write:package` / `delete:package` if available)

**Step 2: Verify pre-push hook works locally**

Run: `cat package.json | grep version`
Expected: `"version": "0.1.0"` (current version)

The hook will fire on the next `git push origin dev`, bumping to `0.1.1`.

**Step 3: Push to dev and monitor**

Run: `git push origin dev`
Expected:
1. Hook output: `Version bumped: 0.1.0 -> 0.1.1`
2. Push succeeds with the bump commit
3. Gitea Actions workflow triggers
4. Image tagged as `0.1.1` and `latest`
5. Container redeployed

---

## Final file state

```
scripts/bump-version.sh          (new — pre-push hook script)
.git/hooks/pre-push              (symlink — not committed)
.gitea/workflows/dev.yaml        (modified — versioned tags + cleanup + prune)
```
