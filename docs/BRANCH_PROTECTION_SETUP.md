# 🛡️ Branch Protection Setup Guide

## Quick Setup Instructions

### **Option 1: Automated Setup (Recommended)**

If you have GitHub CLI installed:

```bash
# Run the automated setup script
./scripts/setup-branch-protection.sh
```

### **Option 2: Manual Setup via GitHub Web Interface**

1. **Go to Repository Settings**
   - Navigate to your GitHub repository
   - Click on **Settings** tab
   - Click on **Branches** in the left sidebar

2. **Add Branch Protection Rules**
   - Click **Add rule** or **Add branch protection rule**
   - Configure each branch as follows:

## 🔒 Branch Protection Configuration

### **Main Branch Protection**

**Branch name pattern:** `main`

**Protection Settings:**
- ✅ **Require a pull request before merging**
  - Require approvals: **2**
  - Dismiss stale PR approvals when new commits are pushed: **✅**
  - Require review from code owners: **✅**
- ✅ **Require status checks to pass before merging**
  - Require branches to be up to date before merging: **✅**
  - Status checks: **ESLint, Tests, Build**
- ✅ **Require conversation resolution before merging**
- ✅ **Require signed commits**
- ✅ **Require linear history**
- ✅ **Restrict pushes that create files**
- ✅ **Include administrators**

**Restrictions:**
- ❌ **Do not allow force pushes**
- ❌ **Do not allow deletions**
- ❌ **Do not allow bypassing the above settings**

### **Production Branch Protection**

**Branch name pattern:** `production`

**Protection Settings:**
- ✅ **Require a pull request before merging**
  - Require approvals: **3** (higher than main)
  - Dismiss stale PR approvals when new commits are pushed: **✅**
  - Require review from code owners: **✅**
- ✅ **Require status checks to pass before merging**
  - Require branches to be up to date before merging: **✅**
  - Status checks: **ESLint, Tests, Build, Security Scan**
- ✅ **Require conversation resolution before merging**
- ✅ **Require signed commits**
- ✅ **Require linear history**
- ✅ **Restrict pushes that create files**
- ✅ **Include administrators**

**Restrictions:**
- ❌ **Do not allow force pushes**
- ❌ **Do not allow deletions**
- ❌ **Do not allow bypassing the above settings**

### **Main2 Branch Protection**

**Branch name pattern:** `main2`

**Protection Settings:**
- ✅ **Require a pull request before merging**
  - Require approvals: **2**
  - Dismiss stale PR approvals when new commits are pushed: **✅**
- ✅ **Require status checks to pass before merging**
  - Require branches to be up to date before merging: **✅**
  - Status checks: **ESLint, Tests, Build**
- ✅ **Require conversation resolution before merging**
- ✅ **Require signed commits**
- ✅ **Include administrators**

**Restrictions:**
- ❌ **Do not allow force pushes**
- ❌ **Do not allow deletions**
- ❌ **Do not allow bypassing the above settings**

### **Production-Backup Branch Protection**

**Branch name pattern:** `production-backup`

**Protection Settings:**
- ✅ **Require a pull request before merging**
  - Require approvals: **2**
  - Dismiss stale PR approvals when new commits are pushed: **✅**
- ✅ **Require status checks to pass before merging**
  - Require branches to be up to date before merging: **✅**
  - Status checks: **ESLint, Tests, Build**
- ✅ **Require conversation resolution before merging**
- ✅ **Require signed commits**
- ✅ **Include administrators**

**Restrictions:**
- ❌ **Do not allow force pushes**
- ❌ **Do not allow deletions**
- ❌ **Do not allow bypassing the above settings**

## 🔧 Required GitHub Actions Workflows

The following workflows are already created and will be required for status checks:

### **1. ESLint Workflow** (`.github/workflows/eslint.yml`)
- Runs on: `main`, `production`, `main2`, `production-backup`
- Checks: Code quality and linting

### **2. Tests Workflow** (`.github/workflows/tests.yml`)
- Runs on: `main`, `production`, `main2`, `production-backup`
- Checks: Frontend and API tests
- Generates coverage reports

### **3. Build Workflow** (`.github/workflows/build.yml`)
- Runs on: `main`, `production`, `main2`, `production-backup`
- Checks: Application builds successfully

### **4. Security Scan Workflow** (`.github/workflows/security.yml`)
- Runs on: `production` only
- Checks: Security vulnerabilities
- Requires: `npm audit` to pass

## 📋 CODEOWNERS Configuration

The `CODEOWNERS` file has been created to define who should review code changes:

- **Global owners:** All files require review from `@HobbitNuggettel`
- **Security files:** Require review from security team
- **API files:** Require review from backend maintainers
- **Documentation:** Require review from maintainers

## 🚨 Emergency Procedures

### **Bypassing Protection (Emergency Only)**

If you need to bypass branch protection in an emergency:

1. **Temporary Disable Protection:**
   - Go to repository settings → Branches
   - Click on the branch protection rule
   - Temporarily disable the rule
   - Make necessary changes
   - Re-enable protection immediately

2. **Admin Override:**
   - Only repository administrators can bypass
   - Use sparingly and document the reason
   - Follow up with proper PR process

### **Recovery Procedures**

- **Accidental Force Push:** Use `git reflog` to recover commits
- **Deleted Branch:** Restore from backup or recreate from main
- **Corrupted History:** Use `git fsck` and recovery tools

## ✅ Verification Steps

After setting up branch protection:

1. **Test with a PR:**
   - Create a test branch
   - Make a small change
   - Create a PR to `main`
   - Verify that status checks are required
   - Verify that approvals are required

2. **Test Force Push Prevention:**
   - Try to force push to `main`
   - Should be blocked

3. **Test Branch Deletion Prevention:**
   - Try to delete `main` branch
   - Should be blocked

4. **Test Status Checks:**
   - Create a PR with failing tests
   - Verify it cannot be merged

## 📊 Monitoring

### **Branch Protection Status**
- Monitor in repository insights
- Set up notifications for protection violations
- Regular audits of protection effectiveness

### **Key Metrics**
- PR approval times
- Status check pass rates
- Protection rule compliance
- Emergency bypass frequency

## 🎯 Benefits

### **Code Quality**
- ✅ Prevents accidental deletions
- ✅ Enforces code review process
- ✅ Ensures all tests pass
- ✅ Maintains code quality standards

### **Security**
- ✅ Prevents force pushes
- ✅ Requires signed commits
- ✅ Enforces security scans
- ✅ Protects production branches

### **Workflow**
- ✅ Enforces linear history
- ✅ Requires conversation resolution
- ✅ Prevents bypassing protections
- ✅ Maintains audit trail

## 📚 Additional Resources

- [GitHub Branch Protection Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [CODEOWNERS Documentation](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)

## 🆘 Support

If you encounter issues with branch protection setup:

1. Check the GitHub Actions logs
2. Verify status check names match exactly
3. Ensure all required workflows are enabled
4. Check repository permissions
5. Contact repository administrators

---

**Remember:** Branch protection is a safety net, not a barrier. It ensures code quality and prevents accidents while maintaining development velocity.
