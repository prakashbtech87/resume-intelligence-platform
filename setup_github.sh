#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Target Repo Info
REPO_OWNER="prakashbtech87"
REPO_NAME="resume-intelligence-platform"
DEFAULT_BRANCH="main"

# Check if git is installed
if ! command -v git >/dev/null 2>&1; then
  echo "Error: git is not installed. Please install git." >&2
  exit 1
fi

# 1. Initialize local repository
if [ ! -d .git ]; then
  echo "Initializing local Git repository..."
  git init
fi

# Set default branch
git checkout -B "$DEFAULT_BRANCH"

# Check if git user name/email are configured, set local defaults if not
if ! git config user.name >/dev/null 2>&1; then
  echo "Setting local Git user.name..."
  git config --local user.name "$REPO_OWNER"
fi
if ! git config user.email >/dev/null 2>&1; then
  echo "Setting local Git user.email..."
  git config --local user.email "$REPO_OWNER@users.noreply.github.com"
fi

# 2. Stage and commit files
echo "Staging files..."
git add .

if git diff --cached --quiet; then
  echo "No changes to commit."
else
  echo "Creating initial commit..."
  git commit -m "Initial commit with GitHub integration"
fi

# Retrieve commit hash
COMMIT_HASH=$(git rev-parse HEAD)

# 3. Determine Authentication Method
USE_CLI=false
if command -v gh >/dev/null 2>&1; then
  echo "GitHub CLI (gh) is installed. Checking authentication status..."
  if gh auth status >/dev/null 2>&1; then
    echo "GitHub CLI is authenticated."
    USE_CLI=true
  else
    echo "GitHub CLI is not authenticated."
  fi
fi

# If CLI is not authenticated, check GITHUB_TOKEN
TOKEN=""
if [ "$USE_CLI" = false ]; then
  if [ -n "$GITHUB_TOKEN" ]; then
    echo "Using GITHUB_TOKEN environment variable for authentication."
    TOKEN="$GITHUB_TOKEN"
  else
    echo "=================================================================" >&2
    echo "Error: GitHub authentication token is missing." >&2
    echo "Please set the GITHUB_TOKEN environment variable before running:" >&2
    echo "  export GITHUB_TOKEN=\"your_personal_access_token\"" >&2
    echo "Alternatively, log in using the GitHub CLI:" >&2
    echo "  gh auth login" >&2
    echo "=================================================================" >&2
    exit 1
  fi
fi

# 4. Check if repository exists and create/connect
REPO_EXISTS=false
REMOTE_URL=""

if [ "$USE_CLI" = true ]; then
  if gh repo view "$REPO_OWNER/$REPO_NAME" >/dev/null 2>&1; then
    echo "Repository $REPO_OWNER/$REPO_NAME exists on GitHub."
    REPO_EXISTS=true
  else
    echo "Repository does not exist. Creating via GitHub CLI..."
    gh repo create "$REPO_OWNER/$REPO_NAME" --public --description "AI-powered Resume Intelligence Platform"
  fi
  REMOTE_URL="https://github.com/prakashbtech87/resume-intelligence-platform.git"
else
  # Use REST API
  echo "Checking repository existence via GitHub REST API..."
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Authorization: token $TOKEN" \
    "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME")

  if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "Repository $REPO_OWNER/$REPO_NAME exists on GitHub."
    REPO_EXISTS=true
  elif [ "$HTTP_STATUS" -eq 404 ]; then
    echo "Repository does not exist. Creating via GitHub REST API..."
    CREATE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
      -H "Authorization: token $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"name": "'"$REPO_NAME"'", "private": false, "description": "AI-powered Resume Intelligence Platform"}' \
      "https://api.github.com/user/repos")
    
    if [ "$CREATE_STATUS" -ne 201 ]; then
      echo "Error: Failed to create repository via REST API (HTTP Status: $CREATE_STATUS)." >&2
      exit 1
    fi
  else
    echo "Error: Unexpected response checking repository existence (HTTP Status: $HTTP_STATUS)." >&2
    exit 1
  fi
  
  # Mask credentials in remote URL configuration by setting token
  REMOTE_URL="https://x-oauth-basic:$TOKEN@github.com/$REPO_OWNER/$REPO_NAME.git"
fi

# 5. Connect to remote repository
if git remote | grep -q "^origin$"; then
  echo "Updating origin remote URL..."
  git remote set-url origin "$REMOTE_URL"
else
  echo "Adding origin remote..."
  git remote add origin "$REMOTE_URL"
fi

# 6. Push local code
echo "Pushing code to $DEFAULT_BRANCH branch..."
git push -u origin "$DEFAULT_BRANCH"

# Clean up/mask token in git remote url config to avoid credentials leakage
if [ "$USE_CLI" = false ]; then
  # Replace authenticated URL with the clean public URL in local git config
  git remote set-url origin "https://github.com/$REPO_OWNER/$REPO_NAME.git"
fi

# 7. Print Repository and Status Details
echo ""
echo "========================================================"
echo "GitHub Integration Complete Successfully!"
echo "--------------------------------------------------------"
echo "Repository URL : https://github.com/$REPO_OWNER/$REPO_NAME"
echo "Commit Hash    : $COMMIT_HASH"
echo "Branch Name    : $DEFAULT_BRANCH"

# Get Build Status / Workflow run status
BUILD_STATUS="Pending (Workflow Triggered)"
if [ "$USE_CLI" = true ]; then
  # Wait 2 seconds for GitHub Actions to trigger
  sleep 2
  RUN_STATUS=$(gh run list --repo "$REPO_OWNER/$REPO_NAME" --limit 1 --json status -q '.[0].status' 2>/dev/null || echo "")
  if [ -n "$RUN_STATUS" ]; then
    BUILD_STATUS="$RUN_STATUS"
  fi
else
  if [ -n "$TOKEN" ]; then
    sleep 2
    RUN_STATUS=$(curl -s -H "Authorization: token $TOKEN" \
      "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/runs?per_page=1" \
      | grep -m 1 '"status":' | sed -E 's/.*"status": "([^"]*)".*/\1/')
    if [ -n "$RUN_STATUS" ]; then
      BUILD_STATUS="$RUN_STATUS"
    fi
  fi
fi

echo "Build Status   : $BUILD_STATUS"
echo "========================================================"
