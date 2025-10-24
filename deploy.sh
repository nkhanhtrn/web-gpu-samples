#!/bin/bash

# Deploy to GitHub Pages
# This script builds and deploys the current directory to gh-pages branch

set -e  # Exit on any error

echo "🚀 Starting deployment to GitHub Pages..."


# Get current branch name
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "📍 Current branch: $CURRENT_BRANCH"

# Ensure working directory is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Error: Working directory is not clean. Please commit or stash changes first."
    exit 1
fi

# Create a temporary directory for the build
BUILD_DIR=$(mktemp -d)
echo "📁 Using temporary directory: $BUILD_DIR"

# Copy files to build directory (excluding .git, node_modules, etc.)
rsync -av --exclude='.git' --exclude='node_modules' --exclude='deploy.sh' --exclude='.gitignore' . "$BUILD_DIR/"

# Navigate to build directory
cd "$BUILD_DIR"

# Initialize git if needed
if [ ! -d .git ]; then
    git init
fi

# Add remote if it doesn't exist
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "❌ Error: No origin remote found. Please add origin remote first."
    exit 1
fi

# Create gh-pages branch and switch to it
git checkout gh-pages

# Add all files
git add .

# Create commit
COMMIT_MSG="Deploy to GitHub Pages - $(date)"
git commit -m "$COMMIT_MSG"

echo "📤 Pushing to gh-pages branch..."

# Push to gh-pages branch (force push since it's an orphan branch)
git push -f origin gh-pages

echo "✅ Successfully deployed to GitHub Pages!"
echo "🌐 Your site should be available at: https://$USER.github.io/web-gpu-samples"

# Clean up
cd - > /dev/null
rm -rf "$BUILD_DIR"

# Switch back to original branch
echo "🔄 Switching back to $CURRENT_BRANCH branch..."
git checkout "$CURRENT_BRANCH"

echo "🧹 Cleanup completed"