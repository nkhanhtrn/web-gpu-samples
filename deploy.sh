#!/bin/bash

# Deploy to GitHub Pages
# This script builds and deploys the current directory to gh-pages branch

set -e  # Exit on any error

echo "🚀 Starting deployment to GitHub Pages..."


echo "🚀 Deploying everything from master to gh-pages..."

# Ensure working directory is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Error: Working directory is not clean. Please commit or stash changes first."
    exit 1
fi

# Push all files from master to gh-pages (force update)
git push origin master:gh-pages --force

echo "✅ Successfully deployed all files to gh-pages!"
echo "🌐 Your site should be available at: https://$USER.github.io/web-gpu-samples"D

git checkout master