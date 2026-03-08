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
