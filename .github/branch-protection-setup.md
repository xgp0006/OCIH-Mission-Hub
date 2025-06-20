# GitHub Branch Protection Setup

This document provides instructions for setting up branch protection rules to enforce hardware safety validation.

## Required Branch Protection Rules

### Main Branch Protection

Configure these settings for the `main` branch in GitHub repository settings:

1. **Require a pull request before merging**
   - ✅ Require approvals: 1
   - ✅ Dismiss stale PR approvals when new commits are pushed
   - ✅ Require review from code owners

2. **Require status checks to pass before merging**
   - ✅ Require branches to be up to date before merging
   - ✅ Required status checks:
     - `Hardware Safety Tests`
     - `MAVLink Protocol Safety` 
     - `Security & Safety Scan`
     - `Deployment Safety Gate`

3. **Require conversation resolution before merging**
   - ✅ All conversations must be resolved

4. **Require signed commits**
   - ✅ Require signed commits for safety traceability

5. **Include administrators**
   - ✅ Apply rules to administrators

6. **Restrict pushes that create files**
   - ✅ Block force pushes
   - ✅ Block deletions

## Automated Setup Script

Use the GitHub CLI to configure branch protection:

```bash
# Install GitHub CLI if not already installed
# curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
# echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
# sudo apt update && sudo apt install gh

# Authenticate with GitHub
gh auth login

# Create branch protection rule for main branch
gh api repos/xgp0006/OCIH-Mission-Hub/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["Hardware Safety Tests","MAVLink Protocol Safety","Security & Safety Scan","Deployment Safety Gate"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true,"require_code_owner_reviews":true}' \
  --field restrictions=null \
  --field required_conversation_resolution=true \
  --field block_creations=false
```

## Safety Gate Rules

The following safety checks MUST pass before any code can be merged:

### 1. Emergency Stop Validation
- Response time < 50ms
- Command acknowledgment required
- Motors disarmed verification

### 2. Real-time Latency Testing
- Average latency < 10ms
- Maximum latency < 15ms
- Failure rate < 5%

### 3. Connection Loss Simulation
- Detection time < 5 seconds
- Failsafe activation required
- Appropriate safety action taken

### 4. Rate Limiting Verification
- Command rate ≤ 50Hz
- Burst handling validated
- Dropped command tracking

## Rollback Procedures

### Automatic Rollback Triggers

If any hardware safety test fails in production:

1. **Immediate Actions** (automated):
   - Stop all drone operations
   - Activate emergency protocols
   - Revert to last known good commit
   - Send alerts to operations team

2. **Rollback Workflow**:
   ```yaml
   # Triggered by safety test failures
   - name: Emergency Rollback
     if: ${{ failure() && contains(github.event.head_commit.message, 'hardware') }}
     run: |
       echo "🚨 EMERGENCY ROLLBACK INITIATED"
       git checkout HEAD~1
       npm run build:tauri
       npm run deploy:emergency
   ```

### Manual Rollback Process

1. **Identify Last Safe Commit**:
   ```bash
   git log --oneline --grep="safety-validated"
   ```

2. **Create Rollback Branch**:
   ```bash
   git checkout -b emergency-rollback-$(date +%Y%m%d-%H%M%S)
   git reset --hard <last-safe-commit>
   ```

3. **Deploy Emergency Fix**:
   ```bash
   npm run build:tauri
   npm run test:safety
   npm run deploy:emergency
   ```

4. **Create Emergency PR**:
   ```bash
   gh pr create --title "🚨 Emergency Rollback" \
     --body "Emergency rollback due to hardware safety failure" \
     --reviewer @safety-team \
     --label emergency
   ```

## Monitoring and Alerts

### Safety Test Monitoring

Configure monitoring for:
- Test execution time trends
- Failure rate patterns  
- Performance degradation
- Hardware timeout occurrences

### Alert Channels

1. **Critical Alerts** (immediate response required):
   - Slack: #hardware-safety-critical
   - Email: safety-team@ocih.gov
   - SMS: On-call engineer

2. **Warning Alerts** (monitor closely):
   - Slack: #hardware-safety-warnings
   - Email: dev-team@ocih.gov

3. **Info Alerts** (trend monitoring):
   - Dashboard: safety-metrics.ocih.gov
   - Weekly reports: operations@ocih.gov

## Compliance Requirements

### NASA JPL Power of 10 Rules

All code changes must maintain compliance with:
- Rule 1: No complex flow constructs
- Rule 2: Fixed loop bounds
- Rule 3: No dynamic memory allocation in critical paths
- Rule 4: Functions ≤ 60 lines
- Rule 5: Minimum 2 assertions per function
- Rule 6: Minimal variable scope
- Rule 7: Check all return values
- Rule 8: Limited preprocessor use
- Rule 9: Restricted pointer use
- Rule 10: All warnings treated as errors

### Documentation Requirements

All safety-critical changes require:
- Technical review documentation
- Safety impact assessment
- Test coverage verification
- Rollback plan documentation

## Implementation Checklist

- [ ] Configure branch protection rules
- [ ] Set up automated safety tests
- [ ] Configure monitoring alerts
- [ ] Document rollback procedures
- [ ] Train team on safety protocols
- [ ] Establish on-call rotation
- [ ] Create emergency contact list
- [ ] Test rollback procedures
- [ ] Validate monitoring systems
- [ ] Schedule quarterly safety reviews