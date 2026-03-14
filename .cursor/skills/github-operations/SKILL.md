---
name: github-operations
description: Work with GitHub using direct API calls (PowerShell) and MCP server. Use when creating PRs, merging branches, managing repos, or when GitHub MCP has issues.
---

# GitHub Operations - API & MCP

## When to Use

Use this skill when:
- Creating Pull Requests
- Merging branches
- Managing repositories (create, fork, delete)
- Working with issues and comments
- GitHub MCP authentication fails
- Need direct control over API calls
- Batch operations on multiple repos

## Two Approaches

### 1. GitHub MCP Server (Preferred)
**Pros:**
- ✅ Native Cursor integration
- ✅ Type-safe tool calls
- ✅ Automatic error handling
- ✅ Supports OAuth and PAT

**Cons:**
- ❌ Requires Docker running
- ❌ Configuration can break
- ❌ Limited to available tools

### 2. Direct GitHub API (Fallback)
**Pros:**
- ✅ Always works if token is valid
- ✅ Full GitHub API access
- ✅ No dependencies
- ✅ Easy debugging

**Cons:**
- ❌ Manual error handling
- ❌ Requires PowerShell knowledge
- ❌ No type safety

---

## GitHub MCP Server Setup

### Configuration File

**Location:** `~/.cursor/mcp.json` (Windows: `C:\Users\USERNAME\.cursor\mcp.json`)

**Correct Configuration:**

```json
{
  "mcpServers": {
    "github": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "GITHUB_PERSONAL_ACCESS_TOKEN",
        "ghcr.io/github/github-mcp-server"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "YOUR_GITHUB_PAT"
      }
    }
  }
}
```

**⚠️ IMPORTANT:**
- Use official Docker image: `ghcr.io/github/github-mcp-server`
- DO NOT use deprecated npm package: `@modelcontextprotocol/server-github` (stopped working April 2025)

### Prerequisites

1. **Docker running:**
   ```powershell
   docker ps
   # Should show running containers (or empty list, but no error)
   ```

2. **Pull Docker image:**
   ```powershell
   docker pull ghcr.io/github/github-mcp-server:latest
   ```

3. **GitHub PAT with scopes:**
   - `repo` - Repository operations
   - `workflow` - GitHub Actions (if needed)
   - `read:org` - Organization access (if needed)

### Available MCP Tools

**Check available tools:**

```bash
# List all GitHub MCP tools
ls C:\Users\USERNAME\.cursor\projects\PROJECT\mcps\user-github\tools
```

**Common tools:**
- `get_me` - Current user info
- `list_pull_requests` - List PRs
- `create_pull_request` - Create PR
- `merge_pull_request` - Merge PR
- `pull_request_read` - Get PR details
- `list_branches` - List branches
- `create_branch` - Create branch
- `list_commits` - List commits
- `issue_read` / `issue_write` - Work with issues
- `search_code` / `search_issues` / `search_repositories`

### MCP Usage Examples

#### Example 1: Get Current User

```typescript
await CallMcpTool({
  server: "user-github",
  toolName: "get_me",
  arguments: {}
});
```

**Result:**
```json
{
  "login": "username",
  "id": 12345,
  "public_repos": 10
}
```

#### Example 2: List Pull Requests

```typescript
await CallMcpTool({
  server: "user-github",
  toolName: "list_pull_requests",
  arguments: {
    "owner": "username",
    "repo": "repository-name",
    "state": "all",
    "perPage": 5
  }
});
```

#### Example 3: Create Pull Request

**IMPORTANT:** Always read the tool schema first!

```typescript
// 1. Read schema
await Read({
  path: "C:\\Users\\USERNAME\\.cursor\\projects\\PROJECT\\mcps\\user-github\\tools\\create_pull_request.json"
});

// 2. Create PR
await CallMcpTool({
  server: "user-github",
  toolName: "create_pull_request",
  arguments: {
    "owner": "username",
    "repo": "repository-name",
    "title": "feat: Add new feature",
    "head": "feature/branch-name",
    "base": "main",
    "body": "## Summary\n\nDescription here"
  }
});
```

#### Example 4: Merge Pull Request

```typescript
await CallMcpTool({
  server: "user-github",
  toolName: "merge_pull_request",
  arguments: {
    "owner": "username",
    "repo": "repository-name",
    "pull_number": 2,
    "merge_method": "merge" // or "squash", "rebase"
  }
});
```

#### Example 5: List Branches

```typescript
await CallMcpTool({
  server: "user-github",
  toolName: "list_branches",
  arguments: {
    "owner": "username",
    "repo": "repository-name"
  }
});
```

---

## Direct GitHub API (PowerShell)

### Prerequisites

1. **GitHub PAT stored in environment:**
   ```powershell
   $env:GITHUB_PERSONAL_ACCESS_TOKEN
   # Should output: ghp_xxxxx...
   ```

2. **Base API URL:**
   ```powershell
   $apiUrl = "https://api.github.com"
   ```

### API Usage Examples

#### Example 1: Get Current User

```powershell
$token = $env:GITHUB_PERSONAL_ACCESS_TOKEN
$headers = @{
    "Authorization" = "Bearer $token"
    "Accept" = "application/vnd.github+json"
}

$user = Invoke-RestMethod -Uri "https://api.github.com/user" -Headers $headers -Method Get
Write-Host "User: $($user.login)"
```

#### Example 2: List Pull Requests

```powershell
$token = $env:GITHUB_PERSONAL_ACCESS_TOKEN
$owner = "username"
$repo = "repository-name"

$headers = @{
    "Authorization" = "Bearer $token"
    "Accept" = "application/vnd.github+json"
}

$prs = Invoke-RestMethod `
    -Uri "https://api.github.com/repos/$owner/$repo/pulls?state=all&per_page=5" `
    -Headers $headers `
    -Method Get

foreach ($pr in $prs) {
    Write-Host "PR #$($pr.number): $($pr.title) [$($pr.state)]"
}
```

#### Example 3: Create Pull Request

```powershell
$token = $env:GITHUB_PERSONAL_ACCESS_TOKEN
$owner = "username"
$repo = "repository-name"

$headers = @{
    "Authorization" = "Bearer $token"
    "Accept" = "application/vnd.github+json"
}

$prData = @{
    title = "feat: Add new feature"
    head = "feature/branch-name"
    base = "main"
    body = "## Summary`n`nDescription here"
} | ConvertTo-Json

$pr = Invoke-RestMethod `
    -Uri "https://api.github.com/repos/$owner/$repo/pulls" `
    -Headers $headers `
    -Method Post `
    -Body $prData `
    -ContentType "application/json"

Write-Host "PR created: $($pr.html_url)"
```

#### Example 4: Merge Pull Request

```powershell
$token = $env:GITHUB_PERSONAL_ACCESS_TOKEN
$owner = "username"
$repo = "repository-name"
$prNumber = 2

$headers = @{
    "Authorization" = "Bearer $token"
    "Accept" = "application/vnd.github+json"
}

$mergeData = @{
    merge_method = "merge" # or "squash", "rebase"
} | ConvertTo-Json

$result = Invoke-RestMethod `
    -Uri "https://api.github.com/repos/$owner/$repo/pulls/$prNumber/merge" `
    -Headers $headers `
    -Method Put `
    -Body $mergeData `
    -ContentType "application/json"

Write-Host "PR merged: $($result.message)"
```

#### Example 5: Get Pull Request Status

```powershell
$token = $env:GITHUB_PERSONAL_ACCESS_TOKEN
$owner = "username"
$repo = "repository-name"
$prNumber = 2

$headers = @{
    "Authorization" = "Bearer $token"
    "Accept" = "application/vnd.github+json"
}

$pr = Invoke-RestMethod `
    -Uri "https://api.github.com/repos/$owner/$repo/pulls/$prNumber" `
    -Headers $headers `
    -Method Get

Write-Host "PR #$($pr.number): $($pr.title)"
Write-Host "State: $($pr.state)"
Write-Host "Mergeable: $($pr.mergeable)"
Write-Host "Merged: $($pr.merged)"
```

#### Example 6: List Branches

```powershell
$token = $env:GITHUB_PERSONAL_ACCESS_TOKEN
$owner = "username"
$repo = "repository-name"

$headers = @{
    "Authorization" = "Bearer $token"
    "Accept" = "application/vnd.github+json"
}

$branches = Invoke-RestMethod `
    -Uri "https://api.github.com/repos/$owner/$repo/branches" `
    -Headers $headers `
    -Method Get

foreach ($branch in $branches) {
    Write-Host "- $($branch.name) [$($branch.commit.sha.Substring(0,7))]"
}
```

#### Example 7: Create Issue

```powershell
$token = $env:GITHUB_PERSONAL_ACCESS_TOKEN
$owner = "username"
$repo = "repository-name"

$headers = @{
    "Authorization" = "Bearer $token"
    "Accept" = "application/vnd.github+json"
}

$issueData = @{
    title = "Bug: Something is broken"
    body = "## Description`n`nDetailed description..."
    labels = @("bug", "high-priority")
} | ConvertTo-Json

$issue = Invoke-RestMethod `
    -Uri "https://api.github.com/repos/$owner/$repo/issues" `
    -Headers $headers `
    -Method Post `
    -Body $issueData `
    -ContentType "application/json"

Write-Host "Issue created: $($issue.html_url)"
```

---

## Collaborator Management

GitHub MCP does **not** have a tool for adding collaborators. Use direct API.

### Add Collaborator

```powershell
$token = $env:GITHUB_PERSONAL_ACCESS_TOKEN
$owner = "username"
$repo = "repository-name"
$collaborator = "github-username"

$headers = @{
    "Authorization" = "Bearer $token"
    "Accept" = "application/vnd.github+json"
    "X-GitHub-Api-Version" = "2022-11-28"
}

$body = @{
    permission = "maintain"  # "pull", "push", "maintain", "admin"
} | ConvertTo-Json

Invoke-RestMethod `
    -Uri "https://api.github.com/repos/$owner/$repo/collaborators/$collaborator" `
    -Headers $headers `
    -Method Put `
    -Body $body `
    -ContentType "application/json"
# Sends invitation; collaborator must accept via email or GitHub notifications
```

### Permission Levels

| Level | Permissions |
|---|---|
| `pull` | Read-only |
| `push` | Read + write (push code) |
| `maintain` | Push + manage issues/PRs/settings (no destructive actions) |
| `admin` | Full access including settings and deletion |

---

## Repository Secrets Management

Manage GitHub Actions secrets programmatically. Requires `libsodium` encryption.

### List Secrets

```powershell
$token = $env:GITHUB_PERSONAL_ACCESS_TOKEN
$headers = @{
    "Authorization" = "Bearer $token"
    "Accept" = "application/vnd.github+json"
    "X-GitHub-Api-Version" = "2022-11-28"
}

$secrets = Invoke-RestMethod `
    -Uri "https://api.github.com/repos/$owner/$repo/actions/secrets" `
    -Headers $headers -Method Get

foreach ($s in $secrets.secrets) {
    Write-Host "$($s.name) (updated: $($s.updated_at))"
}
```

### Create/Update Secret

Secrets must be encrypted with the repo's public key (libsodium sealed box).

**Step 1: Get public key**

```powershell
$pubKeyData = Invoke-RestMethod `
    -Uri "https://api.github.com/repos/$owner/$repo/actions/secrets/public-key" `
    -Headers $headers -Method Get
# $pubKeyData.key — base64-encoded NaCl public key
# $pubKeyData.key_id — key identifier for upload
```

**Step 2: Encrypt with Node.js**

```bash
mkdir /tmp/gh-secrets && cd /tmp/gh-secrets
npm init -y && npm install libsodium-wrappers
```

```javascript
// encrypt.js
const sodium = require('libsodium-wrappers');
async function run() {
    await sodium.ready;
    const secretValue = 'VALUE_TO_ENCRYPT';
    const publicKey = sodium.from_base64('REPO_PUBLIC_KEY', sodium.base64_variants.ORIGINAL);
    const messageBytes = sodium.from_string(secretValue);
    const encrypted = sodium.crypto_box_seal(messageBytes, publicKey);
    process.stdout.write(sodium.to_base64(encrypted, sodium.base64_variants.ORIGINAL));
}
run();
```

**Step 3: Upload**

```powershell
$body = @{
    encrypted_value = $encryptedBase64
    key_id = $pubKeyData.key_id
} | ConvertTo-Json

Invoke-RestMethod `
    -Uri "https://api.github.com/repos/$owner/$repo/actions/secrets/SECRET_NAME" `
    -Headers $headers -Method Put -Body $body -ContentType "application/json"
```

**Gotcha:** PowerShell's `Set-Content -Encoding UTF8` adds BOM on Windows (PS 5.x). For SSH keys, write the value as a literal string inside the JS file or use `[System.IO.File]::WriteAllText()` with a BOM-less UTF8 encoding.

---

## Decision Tree: When to Use What

```
Need GitHub operation?
│
├─ MCP server configured and working?
│  ├─ YES → Use MCP (preferred)
│  │      ✓ Native integration
│  │      ✓ Type-safe
│  │      ✓ Better error messages
│  │
│  └─ NO → Check issue:
│         │
│         ├─ Docker not running?
│         │  → Start Docker, use MCP
│         │
│         ├─ Config broken?
│         │  → Fix ~/.cursor/mcp.json
│         │  → Use official Docker image
│         │
│         ├─ Token expired?
│         │  → Generate new PAT
│         │  → Update config
│         │
│         └─ Can't fix quickly?
│            → Use Direct API (fallback)
│               ✓ Always works
│               ✓ No dependencies
```

---

## Common Workflows

### Workflow 1: Create PR and Merge

**Using MCP:**

```typescript
// 1. Create branch (already done via git)
// 2. Create PR
const pr = await CallMcpTool({
  server: "user-github",
  toolName: "create_pull_request",
  arguments: {
    owner: "username",
    repo: "repository",
    title: "feat: New feature",
    head: "feature/branch",
    base: "main",
    body: "## Summary\n\nChanges..."
  }
});

// 3. Merge PR
await CallMcpTool({
  server: "user-github",
  toolName: "merge_pull_request",
  arguments: {
    owner: "username",
    repo: "repository",
    pull_number: pr.number,
    merge_method: "merge"
  }
});
```

**Using Direct API:**

```powershell
$token = $env:GITHUB_PERSONAL_ACCESS_TOKEN
$owner = "username"
$repo = "repository"
$headers = @{
    "Authorization" = "Bearer $token"
    "Accept" = "application/vnd.github+json"
}

# 1. Create PR
$prData = @{
    title = "feat: New feature"
    head = "feature/branch"
    base = "main"
    body = "## Summary`n`nChanges..."
} | ConvertTo-Json

$pr = Invoke-RestMethod `
    -Uri "https://api.github.com/repos/$owner/$repo/pulls" `
    -Headers $headers -Method Post -Body $prData `
    -ContentType "application/json"

Write-Host "PR created: #$($pr.number)"

# 2. Merge PR
$mergeData = @{ merge_method = "merge" } | ConvertTo-Json
Invoke-RestMethod `
    -Uri "https://api.github.com/repos/$owner/$repo/pulls/$($pr.number)/merge" `
    -Headers $headers -Method Put -Body $mergeData `
    -ContentType "application/json"

Write-Host "PR merged!"
```

### Workflow 2: Check PR Status Before Merge

```powershell
$token = $env:GITHUB_PERSONAL_ACCESS_TOKEN
$owner = "username"
$repo = "repository"
$prNumber = 2
$headers = @{
    "Authorization" = "Bearer $token"
    "Accept" = "application/vnd.github+json"
}

# Get PR details
$pr = Invoke-RestMethod `
    -Uri "https://api.github.com/repos/$owner/$repo/pulls/$prNumber" `
    -Headers $headers -Method Get

Write-Host "PR #$($pr.number): $($pr.title)"
Write-Host "State: $($pr.state)"
Write-Host "Mergeable: $($pr.mergeable)"

if ($pr.mergeable -and $pr.state -eq "open") {
    Write-Host "✓ Can merge safely"
    
    # Merge
    $mergeData = @{ merge_method = "merge" } | ConvertTo-Json
    $result = Invoke-RestMethod `
        -Uri "https://api.github.com/repos/$owner/$repo/pulls/$prNumber/merge" `
        -Headers $headers -Method Put -Body $mergeData `
        -ContentType "application/json"
    
    Write-Host "✓ Merged: $($result.message)"
} else {
    Write-Host "✗ Cannot merge: conflicts or already merged"
}
```

---

## Troubleshooting

### Problem 1: MCP "Authentication Failed: Bad credentials"

**Cause:** Invalid or expired PAT, or MCP not reading token

**Solution:**

1. **Check token validity:**
   ```powershell
   $token = $env:GITHUB_PERSONAL_ACCESS_TOKEN
   $headers = @{
       "Authorization" = "Bearer $token"
       "Accept" = "application/vnd.github+json"
   }
   Invoke-RestMethod -Uri "https://api.github.com/user" -Headers $headers
   # Should return user info
   ```

2. **Update MCP config:**
   - Open `~/.cursor/mcp.json`
   - Replace token with fresh one
   - **Restart Cursor** (critical!)

3. **Verify Docker image:**
   ```powershell
   docker pull ghcr.io/github/github-mcp-server:latest
   ```

4. **Use Direct API as fallback**

### Problem 2: MCP "Tool not found"

**Cause:** Wrong tool name or server name

**Solution:**

1. **List available tools:**
   ```typescript
   await LS({
     target_directory: "C:\\Users\\USERNAME\\.cursor\\projects\\PROJECT\\mcps\\user-github\\tools"
   });
   ```

2. **Read tool schema:**
   ```typescript
   await Read({
     path: "C:\\Users\\USERNAME\\.cursor\\projects\\PROJECT\\mcps\\user-github\\tools\\TOOL_NAME.json"
   });
   ```

3. **Use correct names:**
   - Server: `user-github` (not just `github`)
   - Tool: Exact name from tools folder

### Problem 3: Docker not running

**Error:** `Cannot connect to the Docker daemon`

**Solution:**

```powershell
# Start Docker Desktop (Windows)
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"

# Wait and check
Start-Sleep -Seconds 10
docker ps
```

**Fallback:** Use Direct API

### Problem 4: Rate Limiting

**Error:** `API rate limit exceeded`

**Solution:**

1. **Check rate limit:**
   ```powershell
   $token = $env:GITHUB_PERSONAL_ACCESS_TOKEN
   $headers = @{
       "Authorization" = "Bearer $token"
       "Accept" = "application/vnd.github+json"
   }
   $rate = Invoke-RestMethod -Uri "https://api.github.com/rate_limit" -Headers $headers
   Write-Host "Remaining: $($rate.rate.remaining) / $($rate.rate.limit)"
   Write-Host "Reset: $(Get-Date -UnixTimeSeconds $rate.rate.reset)"
   ```

2. **Solutions:**
   - Wait until reset time
   - Use authenticated requests (5000/hour vs 60/hour)
   - Use GraphQL API (separate limit)

### Problem 5: PR not mergeable

**Error:** `"mergeable": false` or `"mergeable": null`

**Causes:**
- Merge conflicts
- Required checks not passing
- GitHub still computing mergeability (`null`)

**Solution:**

```powershell
# Check PR status
$pr = Invoke-RestMethod -Uri "..." -Headers $headers -Method Get

if ($pr.mergeable -eq $null) {
    Write-Host "⏳ GitHub computing mergeability, wait 1-2 seconds"
    Start-Sleep -Seconds 2
    $pr = Invoke-RestMethod -Uri "..." -Headers $headers -Method Get
}

if ($pr.mergeable -eq $false) {
    Write-Host "✗ Has conflicts, resolve manually"
    Write-Host "  1. Pull main: git pull origin main"
    Write-Host "  2. Merge into branch: git merge main"
    Write-Host "  3. Resolve conflicts"
    Write-Host "  4. Push: git push"
}
```

---

## Best Practices

### 1. Token Management

**DO:**
- ✅ Store token in environment variable
- ✅ Use minimal required scopes
- ✅ Rotate tokens regularly (3-6 months)
- ✅ Test token after generation

**DON'T:**
- ❌ Hardcode token in scripts
- ❌ Commit token to git
- ❌ Use `admin` scope unless necessary
- ❌ Share tokens between projects

### 2. Error Handling

**Always wrap API calls:**

```powershell
try {
    $result = Invoke-RestMethod -Uri $apiUrl -Headers $headers -Method Post
    Write-Host "✓ Success: $($result.message)"
} catch {
    $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "✗ Error: $($errorDetails.message)"
    
    # Handle specific errors
    if ($_.Exception.Response.StatusCode -eq 422) {
        Write-Host "  Validation failed"
    } elseif ($_.Exception.Response.StatusCode -eq 409) {
        Write-Host "  Conflict (already exists or merged)"
    }
}
```

### 3. MCP vs API Selection

**Use MCP when:**
- ✅ Standard operations (create PR, merge, list)
- ✅ Within Cursor workflow
- ✅ Need type safety
- ✅ Docker already running

**Use Direct API when:**
- ✅ MCP has issues
- ✅ Need custom/advanced operations
- ✅ Batch operations
- ✅ Scripting outside Cursor
- ✅ Need immediate result without MCP overhead

### 4. Always Read MCP Tool Schema

**Before EVERY MCP call:**

```typescript
// 1. Read schema
await Read({
  path: "C:\\Users\\USERNAME\\.cursor\\projects\\PROJECT\\mcps\\user-github\\tools\\TOOL_NAME.json"
});

// 2. Use tool with correct parameters
await CallMcpTool({
  server: "user-github",
  toolName: "TOOL_NAME",
  arguments: { /* from schema */ }
});
```

**Why:** Parameter names may differ from API (e.g., `perPage` vs `per_page`)

### 5. Verify Before Destructive Operations

```powershell
# Before merging/deleting
Write-Host "About to merge PR #$prNumber into $base"
Write-Host "Press Enter to continue or Ctrl+C to cancel"
Read-Host

# Then proceed with operation
```

---

## Reference

### GitHub API Documentation
- Base URL: `https://api.github.com`
- Auth: `Authorization: Bearer TOKEN`
- Accept: `application/vnd.github+json`
- Docs: https://docs.github.com/en/rest

### Common Endpoints

| Operation | Method | Endpoint |
|-----------|--------|----------|
| Get user | GET | `/user` |
| List repos | GET | `/user/repos` |
| List PRs | GET | `/repos/:owner/:repo/pulls` |
| Get PR | GET | `/repos/:owner/:repo/pulls/:number` |
| Create PR | POST | `/repos/:owner/:repo/pulls` |
| Merge PR | PUT | `/repos/:owner/:repo/pulls/:number/merge` |
| List branches | GET | `/repos/:owner/:repo/branches` |
| List issues | GET | `/repos/:owner/:repo/issues` |
| Create issue | POST | `/repos/:owner/:repo/issues` |
| Add collaborator | PUT | `/repos/:owner/:repo/collaborators/:username` |
| List secrets | GET | `/repos/:owner/:repo/actions/secrets` |
| Get public key | GET | `/repos/:owner/:repo/actions/secrets/public-key` |
| Create/update secret | PUT | `/repos/:owner/:repo/actions/secrets/:name` |

### Token Scopes

| Scope | Permissions |
|-------|-------------|
| `repo` | Full control of private repos |
| `public_repo` | Access public repos only |
| `workflow` | GitHub Actions workflows |
| `read:org` | Read org and team data |
| `admin:repo_hook` | Manage webhooks |

---

## Quick Start Checklist

### For MCP:
- [ ] Docker installed and running
- [ ] GitHub PAT generated with `repo` scope
- [ ] Updated `~/.cursor/mcp.json` with official Docker image
- [ ] Added PAT to config
- [ ] Restarted Cursor
- [ ] Tested with `get_me`

### For Direct API:
- [ ] GitHub PAT in environment: `$env:GITHUB_PERSONAL_ACCESS_TOKEN`
- [ ] Tested token with `Invoke-RestMethod` to `/user`
- [ ] Know owner and repo names
- [ ] PowerShell available

---

**Status:** ✅ Production Ready
**Last Updated:** 2026-01-15
**Version:** 1.0.0
