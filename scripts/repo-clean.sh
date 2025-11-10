#!/usr/bin/env bash
set -euo pipefail

# Remove generated artifacts and large archives from index and working tree cache
printf "Cleaning tracked build artifacts and large archives...\n"

# Update .gitignore entries (idempotent)
awk '1; END{print "\n# build artifacts\ndist/\nbuild/\n.next/\n.turbo/\nnode_modules/\ncoverage/\n\n# large archives\npublic/fonts/*.zip\ndist/fonts/*.zip\nbackups/*.bundle.lock\n"}' .gitignore 2>/dev/null | sort -u > .gitignore.tmp && mv .gitignore.tmp .gitignore

# Untrack
( git rm -r --cached dist build .next .turbo node_modules 2>/dev/null || true )
( git ls-files | grep -E '^(public/fonts/.*\.zip|dist/fonts/.*\.zip|backups/.*\.bundle\.lock)$' | xargs -I{} git rm --cached -- '{}' 2>/dev/null || true )

echo "Done. Review changes with: git status -sb"
