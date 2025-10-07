# 🛡️ Branch Protection Guide

## Overview

This guide outlines the branch protection strategy for the Home Hub repository to ensure code quality, prevent accidental deletions, and maintain proper development workflows.

## 🎯 Critical Branches to Protect

### **Primary Branches**
- **`main`** - Primary development branch
- **`production`** - Production deployment branch
- **`main2`** - Backup/stable branch
- **`production-backup`** - Production backup branch

## 🔒 Branch Protection Rules

### **1. Main Branch Protection**

#### **Required Settings:**
- ✅ **Require a pull request before merging**
  - Require approvals: **2 reviewers**
  - Dismiss stale PR approvals when new commits are pushed
  - Require review from code owners
- ✅ **Require status checks to pass before merging**
  - Require branches to be up to date before merging
  - Status checks: **ESLint, Tests, Build**
- ✅ **Require conversation resolution before merging**
- ✅ **Require signed commits**
- ✅ **Require linear history**
- ✅ **Restrict pushes that create files**
- ✅ **Include administrators**

#### **Restrictions:**
- ❌ **Do not allow force pushes**
- ❌ **Do not allow deletions**
- ❌ **Do not allow bypassing the above settings**

### **2. Production Branch Protection**

#### **Required Settings:**
- ✅ **Require a pull request before merging**
  - Require approvals: **3 reviewers** (higher than main)
  - Dismiss stale PR approvals when new commits are pushed
  - Require review from code owners
- ✅ **Require status checks to pass before merging**
  - Require branches to be up to date before merging
  - Status checks: **ESLint, Tests, Build, Security Scan**
- ✅ **Require conversation resolution before merging**
- ✅ **Require signed commits**
- ✅ **Require linear history**
- ✅ **Restrict pushes that create files**
- ✅ **Include administrators**

#### **Restrictions:**
- ❌ **Do not allow force pushes**
- ❌ **Do not allow deletions**
- ❌ **Do not allow bypassing the above settings**

### **3. Main2 Branch Protection**

#### **Required Settings:**
- ✅ **Require a pull request before merging**
  - Require approvals: **2 reviewers**
  - Dismiss stale PR approvals when new commits are pushed
- ✅ **Require status checks to pass before merging**
  - Require branches to be up to date before merging
  - Status checks: **ESLint, Tests, Build**
- ✅ **Require conversation resolution before merging**
- ✅ **Require signed commits**
- ✅ **Include administrators**

#### **Restrictions:**
- ❌ **Do not allow force pushes**
- ❌ **Do not allow deletions**
- ❌ **Do not allow bypassing the above settings**

### **4. Production-Backup Branch Protection**

#### **Required Settings:**
- ✅ **Require a pull request before merging**
  - Require approvals: **2 reviewers**
  - Dismiss stale PR approvals when new commits are pushed
- ✅ **Require status checks to pass before merging**
  - Require branches to be up to date before merging
  - Status checks: **ESLint, Tests, Build**
- ✅ **Require conversation resolution before merging**
- ✅ **Require signed commits**
- ✅ **Include administrators**

#### **Restrictions:**
- ❌ **Do not allow force pushes**
- ❌ **Do not allow deletions**
- ❌ **Do not allow bypassing the above settings**

## 🔧 Implementation Steps

### **Step 1: Access Repository Settings**
1. Go to your GitHub repository
2. Click on **Settings** tab
3. Click on **Branches** in the left sidebar

### **Step 2: Add Branch Protection Rules**
1. Click **Add rule** or **Add branch protection rule**
2. Enter branch name pattern (e.g., `main`, `production`, `main2`, `production-backup`)
3. Configure the protection settings as outlined above
4. Click **Create** or **Save changes**

### **Step 3: Configure Status Checks**
1. Go to **Settings** → **Branches**
2. Click on the branch protection rule
3. Under **Status checks**, add:
   - `ESLint`
   - `Tests`
   - `Build`
   - `Security Scan` (for production)

### **Step 4: Set Up Required Status Checks**
1. Create GitHub Actions workflows for:
   - ESLint checking
   - Test running
   - Build verification
   - Security scanning

## 📋 Required GitHub Actions Workflows

### **ESLint Workflow**
```yaml
name: ESLint
on: [push, pull_request]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
```

### **Test Workflow**
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
```

### **Build Workflow**
```yaml
name: Build
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
```

### **Security Scan Workflow**
```yaml
name: Security Scan
on: [push, pull_request]
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm audit
```

## 🚨 Emergency Procedures

### **Bypassing Protection (Emergency Only)**
If you need to bypass branch protection in an emergency:

1. **Temporary Disable Protection:**
   - Go to repository settings
   - Navigate to branch protection rules
   - Temporarily disable the rule
   - Make necessary changes
   - Re-enable protection immediately

2. **Use Admin Override:**
   - Only repository administrators can bypass
   - Use sparingly and document the reason
   - Follow up with proper PR process

### **Recovery Procedures**
- **Accidental Force Push:** Use `git reflog` to recover commits
- **Deleted Branch:** Restore from backup or recreate from main
- **Corrupted History:** Use `git fsck` and recovery tools

## 📊 Monitoring and Alerts

### **Branch Protection Status**
- Monitor branch protection status in repository insights
- Set up notifications for protection rule violations
- Regular audits of branch protection effectiveness

### **Compliance Reporting**
- Track PR approval times
- Monitor status check pass rates
- Report on branch protection compliance

## 🔄 Workflow Integration

### **Development Workflow**
1. **Feature Development:**
   - Create feature branch from `main`
   - Develop and test locally
   - Push to remote feature branch
   - Create PR to `main`
   - Wait for required approvals and status checks
   - Merge after all requirements met

2. **Production Deployment:**
   - Create PR from `main` to `production`
   - Require additional approvals (3 reviewers)
   - Pass all status checks including security scan
   - Merge after approval

3. **Hotfixes:**
   - Create hotfix branch from `production`
   - Apply fix and test
   - Create PR to `production`
   - After merge, create PR to `main` to sync changes

## 📚 Best Practices

### **Branch Naming Conventions**
- **Feature branches:** `feature/description`
- **Bug fixes:** `fix/description`
- **Hotfixes:** `hotfix/description`
- **Release branches:** `release/version`

### **PR Requirements**
- **Clear descriptions** of changes
- **Screenshots** for UI changes
- **Test instructions** for reviewers
- **Breaking changes** clearly documented

### **Review Guidelines**
- **Code quality** review
- **Security implications** check
- **Performance impact** assessment
- **Documentation updates** verification

## 🎯 Success Metrics

### **Protection Effectiveness**
- **Zero accidental deletions** of protected branches
- **No force pushes** to protected branches
- **100% PR approval** rate for protected branches
- **All status checks passing** before merges

### **Development Velocity**
- **Average PR approval time** < 24 hours
- **Status check pass rate** > 95%
- **Merge conflict rate** < 5%

This branch protection strategy ensures your Home Hub repository maintains high code quality, prevents accidental damage, and enforces proper development workflows.
