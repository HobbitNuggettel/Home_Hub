#!/bin/bash

# 🧹 Cleanup Merged Branches Script
# This script helps clean up merged feature/fix branches

set -e

echo "🧹 Home Hub - Branch Cleanup Script"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MAIN_BRANCH="main"
PROTECTED_BRANCHES=(
    "main"
    "master" 
    "production"
    "production-backup"
    "develop"
    "development"
    "staging"
    "release"
    "hotfix"
    "main2"
    "main3"
    "backup"
)

# Function to check if branch is protected
is_protected() {
    local branch="$1"
    for protected in "${PROTECTED_BRANCHES[@]}"; do
        if [[ "$branch" == "$protected" ]] || [[ "$branch" =~ ^$protected- ]]; then
            return 0
        fi
    done
    return 1
}

# Function to check if branch should be deleted
should_delete() {
    local branch="$1"
    if [[ "$branch" =~ ^(feature|fix)/ ]]; then
        return 0
    fi
    return 1
}

echo -e "${BLUE}📋 Checking for merged branches...${NC}"

# Fetch latest changes
git fetch --prune

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${YELLOW}Current branch: $CURRENT_BRANCH${NC}"

# Switch to main branch
if [ "$CURRENT_BRANCH" != "$MAIN_BRANCH" ]; then
    echo -e "${YELLOW}Switching to $MAIN_BRANCH branch...${NC}"
    git checkout "$MAIN_BRANCH"
    git pull origin "$MAIN_BRANCH"
fi

# Find merged branches
echo -e "${BLUE}🔍 Finding merged branches...${NC}"
MERGED_BRANCHES=$(git branch --merged | grep -E '^\s*(feature|fix)/' | sed 's/^\s*//' | grep -v '^\*')

if [ -z "$MERGED_BRANCHES" ]; then
    echo -e "${GREEN}✅ No merged feature/fix branches found${NC}"
    exit 0
fi

echo -e "${YELLOW}Found merged branches:${NC}"
echo "$MERGED_BRANCHES"

echo ""
echo -e "${BLUE}🛡️ Checking branch protection...${NC}"

# Filter out protected branches
BRANCHES_TO_DELETE=""
for branch in $MERGED_BRANCHES; do
    if is_protected "$branch"; then
        echo -e "${RED}🛡️  PROTECTED: $branch${NC}"
    elif should_delete "$branch"; then
        echo -e "${GREEN}✅  CAN DELETE: $branch${NC}"
        BRANCHES_TO_DELETE="$BRANCHES_TO_DELETE $branch"
    else
        echo -e "${YELLOW}❓  SKIP: $branch (doesn't match pattern)${NC}"
    fi
done

if [ -z "$BRANCHES_TO_DELETE" ]; then
    echo -e "${GREEN}✅ No branches to delete${NC}"
    exit 0
fi

echo ""
echo -e "${YELLOW}🗑️  Branches to delete:${NC}"
for branch in $BRANCHES_TO_DELETE; do
    echo "  - $branch"
done

echo ""
read -p "Do you want to delete these branches? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}🗑️  Deleting branches...${NC}"
    
    for branch in $BRANCHES_TO_DELETE; do
        echo -n "Deleting $branch... "
        
        # Delete local branch
        if git branch -D "$branch" 2>/dev/null; then
            echo -e "${GREEN}local ✓${NC}"
        else
            echo -e "${YELLOW}local (not found)${NC}"
        fi
        
        # Delete remote branch
        if git push origin --delete "$branch" 2>/dev/null; then
            echo -e "${GREEN}remote ✓${NC}"
        else
            echo -e "${YELLOW}remote (not found)${NC}"
        fi
    done
    
    echo -e "${GREEN}✅ Cleanup completed!${NC}"
else
    echo -e "${YELLOW}❌ Cleanup cancelled${NC}"
fi

echo ""
echo -e "${BLUE}📊 Summary:${NC}"
echo "Protected branches: ${#PROTECTED_BRANCHES[@]}"
echo "Branches found: $(echo "$MERGED_BRANCHES" | wc -l)"
echo "Branches deleted: $(echo "$BRANCHES_TO_DELETE" | wc -w)"
