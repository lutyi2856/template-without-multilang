---
name: git-github-operations
description: Git workflow and basic GitHub CLI operations. Use when working with git commands (add, commit, push, branch), GitHub CLI (gh), or basic GitHub setup. For advanced GitHub API/MCP operations, see github-operations skill.
---

# Git & GitHub Operations

## GitHub MCP Setup

### ⚠️ ОБЯЗАТЕЛЬНО: Использовать GitHub MCP для PR

**GitHub MCP должен быть настроен и работать для всех операций с PR!**

### Required: Personal Access Token

GitHub MCP requires `GITHUB_PERSONAL_ACCESS_TOKEN` environment variable.

**Step 1: Create Token**

1. Go to: https://github.com/settings/tokens/new
2. Settings:
   - **Note:** `Cursor MCP GitHub`
   - **Expiration:** `90 days`
   - **Scopes:** ✅ `repo` (all), ✅ `workflow`
3. Generate and copy token (shown only once!)

**Step 2: Set Environment Variable**

```powershell
# PowerShell (as User)
[Environment]::SetEnvironmentVariable("GITHUB_PERSONAL_ACCESS_TOKEN", "ghp_your_token_here", "User")

# Verify
[Environment]::GetEnvironmentVariable("GITHUB_PERSONAL_ACCESS_TOKEN", "User")
```

**Step 3: Restart Cursor**

GitHub MCP loads token at startup - must restart Cursor after setting!

## Проверка GitHub MCP

**Перед использованием проверь, что MCP работает:**

```typescript
// Проверка доступности GitHub MCP
call_mcp_tool({
  server: "user-github",
  toolName: "get_me",
  arguments: {},
});
// Если работает → получишь данные пользователя
// Если не работает → используй PowerShell fallback ниже
```

## GitHub API Fallback (If MCP Fails)

**Используй только если GitHub MCP не работает!** В первую очередь пробуй MCP.

### Create Pull Request

```powershell
$headers = @{
    "Authorization" = "token $env:GITHUB_PERSONAL_ACCESS_TOKEN"
    "Accept" = "application/vnd.github+json"
}

$body = @{
    title = "feat: Your feature title"
    head = "feature/your-branch"
    base = "main"
    body = "PR description here"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://api.github.com/repos/OWNER/REPO/pulls" -Method Post -Headers $headers -Body $body -ContentType "application/json"
```

### Merge Pull Request

```powershell
$headers = @{
    "Authorization" = "token $env:GITHUB_PERSONAL_ACCESS_TOKEN"
    "Accept" = "application/vnd.github+json"
}

$body = @{
    commit_title = "feat: Your feature (#PR_NUMBER)"
    merge_method = "squash"  # or "merge", "rebase"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://api.github.com/repos/OWNER/REPO/pulls/PR_NUMBER/merge" -Method Put -Headers $headers -Body $body -ContentType "application/json"
```

## 🚨 КРИТИЧЕСКОЕ ПРАВИЛО: ВСЕГДА через PR

**❌ ЗАПРЕЩЕНО делать локальный merge:**

```bash
# ❌ НЕПРАВИЛЬНО - локальный merge
git checkout main
git merge feature/branch --no-ff
```

**✅ ПРАВИЛЬНО - через GitHub MCP:**

1. Создать PR через GitHub MCP
2. Смержить PR через GitHub MCP
3. Обновить локальный main через `git pull`

**Почему через PR:**

- ✅ История видна в GitHub (code review)
- ✅ Чистая история коммитов (squash merge)
- ✅ Соответствует best practices
- ✅ Можно откатить через GitHub UI

---

## Deploy-Triggered Workflow

Push в `main` запускает автоматический deploy (GitHub Actions). Полный цикл до production:

```
branch → commit → push → create PR → merge PR → deploy (triggers on merge)
```

При формулировке "commit, push, connect with main" — подразумевать полный цикл до merge. Без merge deploy не запустится.

## Complete Git Workflow (Через GitHub MCP)

### 1. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes & Commit

```bash
git add .
git commit -m "$(cat <<'EOF'
feat: Add dynamic promo block with WordPress integration

- Add Custom Post Type 'prices' with GraphQL support
- Create ACF field groups for relationships
- Update frontend components
EOF
)"
```

### 3. Verify build

Run `cd nextjs && npm run build`. If build fails, fix TypeScript/build errors. Do not push until build passes. This protects the repository from broken main.

### 4. Push to Remote

```bash
git push -u origin feature/your-feature-name
```

### 5. Create PR через GitHub MCP

**Примечание:** Если цель — довести код до production и запустить deploy, после создания PR выполни шаг 6 (merge). Merge в main запускает GitHub Actions deploy. Останавливаться только на PR, если нужен code review.

**Используй GitHub MCP инструмент `create_pull_request`:**

```typescript
// Пример вызова через MCP
call_mcp_tool({
  server: "user-github",
  toolName: "create_pull_request",
  arguments: {
    owner: "username",
    repo: "repository-name",
    title: "feat: Your feature title",
    head: "feature/your-feature-name",
    base: "main",
    body: "## 🎯 Goal\n\nBrief description...\n\n## ✨ Changes\n\n- ✅ Change 1\n- ✅ Change 2",
  },
});
```

**Получить owner/repo из remote:**

```bash
git remote -v
# origin  https://github.com/OWNER/REPO.git
```

### 6. Merge PR через GitHub MCP

**Используй GitHub MCP инструмент `merge_pull_request`:**

```typescript
// Пример вызова через MCP
call_mcp_tool({
  server: "user-github",
  toolName: "merge_pull_request",
  arguments: {
    owner: "username",
    repo: "repository-name",
    pullNumber: 10, // Номер PR из шага 4
    merge_method: "squash", // или "merge", "rebase"
    commit_title: "feat: Your feature (#10)",
  },
});
```

**Fallback через PowerShell (если MCP не работает):**

```powershell
$headers = @{
    "Authorization" = "token $env:GITHUB_PERSONAL_ACCESS_TOKEN"
    "Accept" = "application/vnd.github+json"
}

$body = @{
    commit_title = "feat: Your feature (#PR_NUMBER)"
    merge_method = "squash"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://api.github.com/repos/OWNER/REPO/pulls/PR_NUMBER/merge" -Method Put -Headers $headers -Body $body -ContentType "application/json"
```

### 7. Cleanup

```bash
# Update local main
git checkout main
git pull origin main

# Delete local feature branch
git branch -d feature/your-feature-name

# Delete remote feature branch (optional)
git push origin --delete feature/your-feature-name
```

---

## Пример полного workflow

**Шаг 1-3: Git команды**

```bash
git checkout -b feat/advantages-section
git add .
git commit -m "feat: add advantages section"
git push -u origin feat/advantages-section
```

**Шаг 4: Создать PR через MCP**

```typescript
call_mcp_tool({
  server: "user-github",
  toolName: "create_pull_request",
  arguments: {
    owner: "lutyi2856",
    repo: "headless-wp-nextjs",
    title: "feat: add advantages section",
    head: "feat/advantages-section",
    base: "main",
    body: "PR description...",
  },
});
// Результат: { id: 10, url: "https://github.com/..." }
```

**Шаг 5: Смержить PR через MCP**

```typescript
call_mcp_tool({
  server: "user-github",
  toolName: "merge_pull_request",
  arguments: {
    owner: "lutyi2856",
    repo: "headless-wp-nextjs",
    pullNumber: 10,
    merge_method: "squash",
    commit_title: "feat: add advantages section (#10)",
  },
});
// Результат: { merged: true, sha: "..." }
```

**Шаг 6: Cleanup**

```bash
git checkout main
git pull origin main
git branch -d feat/advantages-section
```

## Commit Message Format

**Use Conventional Commits:**

```
feat: Add new feature
fix: Fix bug in component
refactor: Restructure code without changing behavior
docs: Update documentation
style: Format code (no logic changes)
test: Add or update tests
chore: Update build scripts, dependencies
```

**Examples:**

```bash
# ✅ Good
git commit -m "feat: add doctor card component with video support"
git commit -m "fix: correct spacing in rating badge"
git commit -m "refactor: extract font configuration to design system"

# ❌ Bad
git commit -m "update files"
git commit -m "fix bug"
git commit -m "changes"
```

## PR Description Template

```markdown
## 🎯 Goal

Brief description of what this PR accomplishes.

## ✨ Changes

### Backend

- ✅ Change 1
- ✅ Change 2

### Frontend

- ✅ Change 1
- ✅ Change 2

## 📊 Statistics

- **X files changed**
- **Y insertions**
- **Z deletions**

## 🧪 Testing

- ✅ Test 1
- ✅ Test 2

## 🚀 Ready to merge
```

## Git Credential Manager (Windows)

If GitHub asks for password repeatedly:

```powershell
# Configure credential manager
git config --global credential.helper manager-core

# Next push will open browser for authentication
git push
```

## Safety Rules

### ✅ DO:

1. Create feature branches for changes
2. Use descriptive commit messages
3. Create PRs for code review
4. Delete branches after merge
5. Pull latest main before starting new work

### ❌ DON'T:

1. ❌ **Локальный merge в main** - ВСЕГДА через PR и GitHub MCP
2. ❌ Push or create PR when `npm run build` fails; fix build first
3. ❌ Force push to main/master
4. ❌ Skip hooks (`--no-verify`)
5. ❌ Commit secrets (API keys, tokens)
6. ❌ Use generic commit messages
7. ❌ Push directly to main without PR
8. ❌ Merge feature branch локально: `git merge feature/branch` на main

## Troubleshooting

### "Authentication Failed: Bad credentials"

**Cause:** GitHub MCP doesn't have valid token

**Fix:**

1. Set `GITHUB_PERSONAL_ACCESS_TOKEN` environment variable
2. Restart Cursor
3. Or use direct GitHub API via PowerShell

### "remote: Invalid username or token"

**Cause:** Git trying to use password auth (deprecated)

**Fix:**

```powershell
git config --global credential.helper manager-core
git push  # Will open browser for auth
```

### Branch Already Exists on Remote

```bash
# Force update remote branch (careful!)
git push -f origin feature/your-branch

# Or delete and recreate
git push origin --delete feature/your-branch
git push -u origin feature/your-branch
```

## Useful Commands

```bash
# Check current branch
git branch

# Check remote branches
git branch -r

# Check status
git status

# View commit history
git log --oneline -10

# Stash changes temporarily
git stash
git stash pop

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard all local changes
git checkout -- .
```
