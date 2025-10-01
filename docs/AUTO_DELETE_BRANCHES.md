# 🗑️ Auto Delete Branches Documentation

## Overview

This feature automatically deletes `feature/` and `fix/` branches when their associated Pull Requests are merged, keeping your repository clean and organized.

## 🎯 What Gets Deleted

### ✅ **Branches That Will Be Deleted:**
- `feature/*` - All feature branches
- `fix/*` - All fix branches

### 🛡️ **Branches That Are Protected:**
- `main` - Main development branch
- `master` - Alternative main branch
- `production` - Production branch
- `production-backup` - Production backup branch
- `develop` - Development branch
- `development` - Alternative development branch
- `staging` - Staging branch
- `release` - Release branch
- `hotfix` - Hotfix branch
- `backup-*` - Any backup branches
- `release-*` - Any release branches
- `hotfix-*` - Any hotfix branches
- `staging-*` - Any staging branches
- `develop-*` - Any develop branches
- `production-*` - Any production branches

## 🔧 How It Works

### 1. **Automatic Deletion (GitHub Workflow)**
- **Trigger**: When a PR is merged (`pull_request: closed`)
- **File**: `.github/workflows/auto-delete-branches.yml`
- **Process**:
  1. Checks if PR was actually merged (not just closed)
  2. Verifies branch matches deletion pattern (`feature/*` or `fix/*`)
  3. Confirms branch is not in protected list
  4. Deletes both local and remote branches
  5. Provides summary in GitHub Actions

### 2. **Manual Cleanup (Script)**
- **Command**: `npm run cleanup:branches`
- **File**: `scripts/cleanup-merged-branches.sh`
- **Process**:
  1. Finds all merged branches
  2. Filters by pattern and protection rules
  3. Shows preview of what will be deleted
  4. Asks for confirmation before deletion
  5. Provides detailed summary

## 🚀 Usage

### **Automatic (Recommended)**
No action needed! Branches are automatically deleted when PRs are merged.

### **Manual Cleanup**
```bash
# Run the cleanup script
npm run cleanup:branches

# Or run directly
bash scripts/cleanup-merged-branches.sh
```

### **Scheduled Cleanup**
The workflow also includes a scheduled cleanup job that runs weekly to catch any missed branches.

## 📋 Configuration

### **Adding Protected Branches**
Edit `.github/workflows/auto-delete-branches.yml` and add to the `PROTECTED_PATTERNS` array:

```yaml
PROTECTED_PATTERNS=(
  "main"
  "master"
  "production"
  "production-backup"
  "your-custom-branch"  # Add here
)
```

### **Changing Deletion Patterns**
Edit the workflow file and modify the pattern check:

```yaml
# Current pattern (feature/* and fix/*)
if [[ "$BRANCH_NAME" =~ ^(feature|fix)/.* ]]; then

# Example: Add support for chore/* branches
if [[ "$BRANCH_NAME" =~ ^(feature|fix|chore)/.* ]]; then
```

## 🔍 Troubleshooting

### **Branch Not Deleted?**
1. Check if branch matches pattern (`feature/*` or `fix/*`)
2. Verify branch is not in protected list
3. Ensure PR was actually merged (not just closed)
4. Check GitHub Actions logs for errors

### **Accidentally Deleted Branch?**
1. Check if branch exists in PR history
2. Restore from merge commit if needed
3. Add branch to protected list to prevent future deletion

### **Workflow Not Running?**
1. Ensure workflow file is in `.github/workflows/`
2. Check GitHub Actions permissions
3. Verify workflow syntax is correct

## 📊 Monitoring

### **GitHub Actions Summary**
Each deletion shows:
- Branch name
- PR number
- Deletion status
- Protection status

### **Manual Script Output**
- List of found branches
- Protection status for each
- Confirmation prompt
- Deletion summary

## 🛡️ Safety Features

1. **Pattern Matching**: Only deletes `feature/*` and `fix/*` branches
2. **Protection List**: Comprehensive list of protected branches
3. **Confirmation**: Manual script asks for confirmation
4. **Logging**: Detailed logs of all actions
5. **Error Handling**: Graceful handling of missing branches

## 📈 Benefits

- **Clean Repository**: No accumulation of merged branches
- **Better Organization**: Clear separation of active vs merged work
- **Reduced Clutter**: Easier to find active branches
- **Automated**: No manual intervention required
- **Safe**: Protected branches are never deleted

## 🔄 Workflow Diagram

```
PR Merged → Check Pattern → Check Protection → Delete Branch
    ↓              ↓              ↓              ↓
  feature/*    ✅ Match      ❌ Not Protected  🗑️ Deleted
  fix/*        ✅ Match      ❌ Not Protected  🗑️ Deleted
  main         ❌ No Match   🛡️ Protected     🛡️ Protected
  production   ❌ No Match   🛡️ Protected     🛡️ Protected
```

## 📝 Examples

### **Will Be Deleted:**
- `feature/user-authentication`
- `feature/dashboard-redesign`
- `fix/login-bug`
- `fix/mobile-responsive`

### **Will NOT Be Deleted:**
- `main`
- `production`
- `production-backup`
- `develop`
- `staging`
- `release/v1.2.0`
- `hotfix/critical-security`
- `backup/old-version`

---

**Note**: This feature is designed to be safe and conservative. When in doubt, branches are protected rather than deleted.
