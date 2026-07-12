#!/usr/bin/env bash
set -euo pipefail

REPO_OWNER="${REPO_OWNER:-prakashbtech87}"
REPO_NAME="${REPO_NAME:-resume-intelligence-platform}"
BRANCH="${BRANCH:-main}"

if [[ -z "${GITHUB_TOKEN:-}" ]]; then
  echo "Error: GITHUB_TOKEN is not set."
  echo "Set it in your shell before running this script:"
  echo "  export GITHUB_TOKEN=your_token_here"
  echo "If you prefer GitHub CLI authentication, install gh and run: gh auth login"
  exit 1
fi

cd "$(dirname "$0")/.."

if [[ ! -d .git ]]; then
  git init -b "$BRANCH"
fi

git add .
git commit -m "chore: scaffold resume intelligence platform" >/dev/null 2>&1 || true

if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  echo "Using GitHub CLI authentication"
  if gh repo view "$REPO_OWNER/$REPO_NAME" >/dev/null 2>&1; then
    echo "Repository already exists: $REPO_OWNER/$REPO_NAME"
  else
    gh repo create "$REPO_OWNER/$REPO_NAME" --public --source=. --remote=origin --push --branch="$BRANCH"
  fi
  git remote add origin "https://github.com/$REPO_OWNER/$REPO_NAME.git" 2>/dev/null || true
  git push -u origin "$BRANCH"
else
  echo "Using GitHub REST API authentication"
  repo_status=$(curl -fsSL -H "Authorization: Bearer $GITHUB_TOKEN" -H "Accept: application/vnd.github+json" "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME" 2>/dev/null || true)

  if [[ -z "$repo_status" ]]; then
    echo "Creating repository $REPO_OWNER/$REPO_NAME"
    curl -fsSL -X POST -H "Authorization: Bearer $GITHUB_TOKEN" -H "Accept: application/vnd.github+json" \
      -d "{\"name\":\"$REPO_NAME\",\"private\":false,\"auto_init\":true}" \
      "https://api.github.com/user/repos" >/dev/null
  fi

  git remote add origin "https://github.com/$REPO_OWNER/$REPO_NAME.git" 2>/dev/null || true
  git push -u origin "$BRANCH"
fi

COMMIT_HASH=$(git rev-parse --short HEAD)
REPO_URL=$(git remote get-url origin | tr -d '\n')

printf "Repository URL: %s\n" "$REPO_URL"
printf "Commit Hash: %s\n" "$COMMIT_HASH"
printf "Branch Name: %s\n" "$BRANCH"
printf "Build Status: pending (GitHub Actions will start after the push)\n"
