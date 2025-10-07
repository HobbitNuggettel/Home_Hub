#!/bin/bash

# 🛡️ Branch Protection Setup Script for Home Hub
# This script helps configure branch protection rules for critical branches

echo "🛡️ Setting up Branch Protection for Home Hub Repository"
echo "=================================================="

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo "Please install it from: https://cli.github.com/"
    echo "Or run: brew install gh"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub CLI."
    echo "Please run: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI is installed and authenticated"

# Get repository information
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
echo "📁 Repository: $REPO"

# Function to create branch protection rule
create_branch_protection() {
    local branch=$1
    local required_reviews=$2
    local status_checks=$3
    
    echo "🔒 Setting up protection for branch: $branch"
    
    # Create branch protection rule with proper JSON format
    gh api repos/$REPO/branches/$branch/protection \
        --method PUT \
        --field required_status_checks="$status_checks" \
        --field enforce_admins=true \
        --field required_pull_request_reviews="$required_reviews" \
        --field restrictions=null \
        --field allow_force_pushes=false \
        --field allow_deletions=false \
        --field required_linear_history=true \
        --field allow_squash_merge=true \
        --field allow_merge_commit=false \
        --field allow_rebase_merge=true \
        --field allow_auto_merge=false \
        --field delete_branch_on_merge=true
    
    if [ $? -eq 0 ]; then
        echo "✅ Branch protection configured for $branch"
    else
        echo "❌ Failed to configure protection for $branch"
    fi
}

# Configure protection for each critical branch
echo ""
echo "🔧 Configuring branch protection rules..."

# Main branch - 2 reviewers, all status checks
create_branch_protection "main" '{"required_approving_review_count":2,"dismiss_stale_reviews":true,"require_code_owner_reviews":true}' '{"strict":true,"contexts":["ESLint","Tests","Build"]}'

# Production branch - 3 reviewers, all status checks including security
create_branch_protection "production" '{"required_approving_review_count":3,"dismiss_stale_reviews":true,"require_code_owner_reviews":true}' '{"strict":true,"contexts":["ESLint","Tests","Build","Security Scan"]}'

# Main2 branch - 2 reviewers, basic status checks
create_branch_protection "main2" '{"required_approving_review_count":2,"dismiss_stale_reviews":true,"require_code_owner_reviews":true}' '{"strict":true,"contexts":["ESLint","Tests","Build"]}'

# Production-backup branch - 2 reviewers, basic status checks
create_branch_protection "production-backup" '{"required_approving_review_count":2,"dismiss_stale_reviews":true,"require_code_owner_reviews":true}' '{"strict":true,"contexts":["ESLint","Tests","Build"]}'

echo ""
echo "🎉 Branch protection setup completed!"
echo ""
echo "📋 Summary of protection rules:"
echo "  • main: 2 reviewers, ESLint + Tests + Build"
echo "  • production: 3 reviewers, ESLint + Tests + Build + Security Scan"
echo "  • main2: 2 reviewers, ESLint + Tests + Build"
echo "  • production-backup: 2 reviewers, ESLint + Tests + Build"
echo ""
echo "⚠️  Important Notes:"
echo "  • Force pushes are disabled on all protected branches"
echo "  • Branch deletions are disabled"
echo "  • Linear history is required"
echo "  • All status checks must pass before merging"
echo "  • Administrators are included in protection rules"
echo ""
echo "🔧 Next Steps:"
echo "  1. Ensure GitHub Actions workflows are set up"
echo "  2. Test the protection rules with a test PR"
echo "  3. Configure CODEOWNERS file for code review requirements"
echo "  4. Set up branch protection notifications"
echo ""
echo "📚 For more information, see: docs/BRANCH_PROTECTION_GUIDE.md"
