#!/bin/bash

# 🧹 Cleanup Remote Branches Script
# This script deletes unwanted remote branches, keeping only essential ones

set -e

echo "🧹 Home Hub - Remote Branch Cleanup Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Essential branches to keep
ESSENTIAL_BRANCHES=(
    "main"
    "main2"
    "production"
    "production-backup"
)

echo -e "${BLUE}📋 Essential branches to keep:${NC}"
for branch in "${ESSENTIAL_BRANCHES[@]}"; do
    echo -e "  ${GREEN}✅ $branch${NC}"
done

echo ""
echo -e "${BLUE}🔍 Fetching all remote branches...${NC}"

# Fetch all remote branches
git fetch --all --prune

# Get all remote branches
echo -e "${BLUE}📋 Current remote branches:${NC}"
REMOTE_BRANCHES=$(git branch -r | grep -v 'HEAD' | sed 's/origin\///' | sort)

if [ -z "$REMOTE_BRANCHES" ]; then
    echo -e "${GREEN}✅ No remote branches found${NC}"
    exit 0
fi

echo "$REMOTE_BRANCHES"

echo ""
echo -e "${BLUE}🛡️ Checking which branches to delete...${NC}"

# Find branches to delete
BRANCHES_TO_DELETE=""
for branch in $REMOTE_BRANCHES; do
    is_essential=false
    for essential in "${ESSENTIAL_BRANCHES[@]}"; do
        if [ "$branch" = "$essential" ]; then
            is_essential=true
            break
        fi
    done
    
    if [ "$is_essential" = false ]; then
        echo -e "${RED}🗑️  WILL DELETE: $branch${NC}"
        BRANCHES_TO_DELETE="$BRANCHES_TO_DELETE $branch"
    else
        echo -e "${GREEN}🛡️  KEEP: $branch${NC}"
    fi
done

if [ -z "$BRANCHES_TO_DELETE" ]; then
    echo -e "${GREEN}✅ No branches to delete - all are essential${NC}"
    exit 0
fi

echo ""
echo -e "${YELLOW}🗑️  Branches to delete:${NC}"
for branch in $BRANCHES_TO_DELETE; do
    echo "  - $branch"
done

echo ""
echo -e "${RED}⚠️  WARNING: This will permanently delete remote branches!${NC}"
echo -e "${YELLOW}Make sure you have backups of any important work.${NC}"
echo ""

read -p "Do you want to proceed with deleting these remote branches? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}🗑️  Deleting remote branches...${NC}"
    
    SUCCESS_COUNT=0
    FAILED_COUNT=0
    
    for branch in $BRANCHES_TO_DELETE; do
        echo -n "Deleting remote branch '$branch'... "
        
        if git push origin --delete "$branch" 2>/dev/null; then
            echo -e "${GREEN}✓${NC}"
            ((SUCCESS_COUNT++))
        else
            echo -e "${RED}✗${NC}"
            ((FAILED_COUNT++))
        fi
    done
    
    echo ""
    echo -e "${GREEN}✅ Remote cleanup completed!${NC}"
    echo -e "${GREEN}Successfully deleted: $SUCCESS_COUNT branches${NC}"
    if [ $FAILED_COUNT -gt 0 ]; then
        echo -e "${RED}Failed to delete: $FAILED_COUNT branches${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}📊 Final remote branches:${NC}"
    git branch -r | grep -v 'HEAD' | sed 's/origin\///' | sort
    
else
    echo -e "${YELLOW}❌ Cleanup cancelled${NC}"
fi

echo ""
echo -e "${BLUE}📋 Summary:${NC}"
echo "Essential branches preserved: ${#ESSENTIAL_BRANCHES[@]}"
echo "Branches found: $(echo "$REMOTE_BRANCHES" | wc -l)"
echo "Branches deleted: $SUCCESS_COUNT"
echo "Branches failed: $FAILED_COUNT"
