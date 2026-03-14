---
name: project-workflow
description: УниДент project workflow - quality checks before reporting, Figma cache management, font handling, browser testing. Use when completing tasks, reporting work done, or implementing features from Figma.
---

# Project Workflow - УниДент

## Critical: Quality Checks Before Reporting

**BEFORE saying "Done" or "Ready":**

1. ✅ **Check data in WordPress first** (if WordPress involved)
   ```bash
   docker exec wp-new-wordpress php /var/www/html/scripts/check-[feature].php
   ```
2. ✅ **Clear Next.js cache** (if data changed in WordPress)
   ```bash
   Remove-Item nextjs\.next\cache -Recurse -Force
   Get-Process -Name node | Stop-Process -Force
   ```
3. ✅ Start dev server
4. ✅ **Run build:** `cd nextjs && npm run build`. If build fails (TypeScript or other errors), fix all errors before reporting "Done" or "Ready". The application must build successfully.
5. ✅ Open in browser
6. ✅ Take screenshot (`browser_take_screenshot`)
7. ✅ Show screenshot to user
8. ✅ Check `read_lints` for changed files
9. ✅ Check logs for GraphQL/errors
10. ✅ Only after checks - report completion

**Example:**

```
✅ Good:
Changed component. Starting server...
[takes screenshot]
Checked:
- ✅ Component displays correctly
- ✅ No console errors
- ✅ Linter clean
Done!

❌ Bad:
Changed component. Done!
```

---

## WordPress + GraphQL Debugging Workflow

**When implementing WordPress features:**

### 1. ALWAYS Start with WordPress Data Check

```bash
# Create check script FIRST
docker cp scripts/check-[feature].php wp-new-wordpress:/var/www/html/scripts/
docker exec wp-new-wordpress php /var/www/html/scripts/check-[feature].php
```

### 2. Test GraphQL in GraphiQL

Open `http://localhost:8002/graphql` and verify:

- Fields exist in autocomplete
- Query returns data
- Relationships work

### 3. Clear Next.js Cache Before Testing

```powershell
# ALWAYS do this after WordPress changes!
Remove-Item -Path "nextjs\.next\cache" -Recurse -Force -ErrorAction SilentlyContinue
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
cd nextjs; npm run dev
```

### 4. Check Next.js Logs

```powershell
Get-Content terminals/[id].txt | Select-String -Pattern "GraphQL|Error" -Context 2,5
```

### 5. Test Frontend with Screenshots

```typescript
browser_navigate("http://localhost:3000");
browser_search("Your Feature");
browser_take_screenshot();
```

**Common Issues:**

- Data NULL → Check WordPress first!
- GraphQL errors → Check schema in GraphiQL
- Stale data → Clear Next.js cache
- Empty arrays → Check filters in query

---

## Figma Cache Management

### Before Any Figma MCP Request:

1. Open `nextjs/figma-data/FIGMA_CACHE.md`
2. Check if component data exists
3. If YES → use cache
4. If NO → request Figma

**Reasons:**

- Save API calls
- Avoid rate limits (429 errors)
- Faster workflow

### Pixel-Perfect Implementation

- ✅ Exact sizes from Figma (px)
- ✅ Exact colors (hex codes)
- ✅ Exact fonts and weights
- ✅ Exact border-radius
- ✅ Check details (droplet direction, corners)

**Example:**

```typescript
// Rating badge should be droplet with sharp corner TOP RIGHT:
rounded-tl-[61px] rounded-tr-none  // ✅ Correct
rounded-tl-none rounded-tr-[61px]  // ❌ Wrong
```

## Font Handling

### Use next/font (ALWAYS)

```typescript
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"], // ✅ REQUIRED for Russian
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap", // ✅ REQUIRED for performance
});
```

**NEVER:**

- ❌ CDN in `@font-face`
- ❌ `@import url('https://fonts.googleapis.com/...')`

### Free Font Alternatives

| Commercial | Free Alternative | Similarity         |
| ---------- | ---------------- | ------------------ |
| Gilroy     | Montserrat       | 80% (current)      |
| Gilroy     | Red Hat Display  | 90% (slow compile) |
| Circular   | Nunito Sans      | 75%                |

## Server Management

### Stop Stuck Servers (Windows)

```powershell
taskkill /F /IM node.exe
cd nextjs
npm run dev
```

**Signs of problem:**

- Port 3000 in use, trying 3001...
- Server compiles >30 sec

## Browser Testing Workflow

1. `browser_navigate` - open page
2. `browser_snapshot` - check elements
3. `browser_take_screenshot` - visual check
4. Show screenshot to user

**DON'T say "Done" without screenshot for UI changes!**

## Linter Checks

After each change:

```typescript
read_lints(["path/to/changed/file.tsx"]);
```

Fix ALL new errors before reporting.

## Documentation Updates

### When to Update:

- Added significant component
- Changed architecture
- Added new feature
- User explicitly asks

**DON'T create extra MD files without request!**

## Git Workflow

### DON'T Commit Without Request

**Only if user explicitly asks:**

```bash
# ✅ Good commit messages:
git commit -m "feat: add doctor card component with video support"
git commit -m "fix: correct rating badge direction"

# ❌ Bad commit messages:
git commit -m "update files"
git commit -m "changes"
```

**NEVER:**

- ❌ `--force` push to main/master
- ❌ `--no-verify` without permission
- ❌ Skip hooks

## GitHub Automation

### Build check before Push / PR

Before `git push` or creating a PR, run `npm run build` in `nextjs`. If the build fails, fix TypeScript and other errors first. Do not push or open a PR with a broken build; this protects the main branch.

### Full Workflow (When User Asks)

1. **Create feature branch:**

   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make changes & commit:**

   ```bash
   git add .
   git commit -m "feat: description"
   ```

3. **Push to GitHub:**

   ```bash
   git push -u origin feature/your-feature
   ```

4. **Create PR via GitHub API:**

   ```powershell
   $headers = @{
       "Authorization" = "token $env:GITHUB_PERSONAL_ACCESS_TOKEN"
       "Accept" = "application/vnd.github+json"
   }
   $body = @{
       title = "feat: Your title"
       head = "feature/your-feature"
       base = "main"
       body = "PR description"
   } | ConvertTo-Json
   Invoke-RestMethod -Uri "https://api.github.com/repos/OWNER/REPO/pulls" -Method Post -Headers $headers -Body $body -ContentType "application/json"
   ```

5. **Merge PR:**

   ```powershell
   $body = @{
       commit_title = "feat: Your title (#PR_NUMBER)"
       merge_method = "squash"
   } | ConvertTo-Json
   Invoke-RestMethod -Uri "https://api.github.com/repos/OWNER/REPO/pulls/PR_NUMBER/merge" -Method Put -Headers $headers -Body $body -ContentType "application/json"
   ```

6. **Cleanup:**
   ```bash
   git checkout main
   git pull origin main
   git branch -d feature/your-feature
   git push origin --delete feature/your-feature
   ```

### GitHub MCP Setup (Required Once)

```powershell
# Set token in environment
[Environment]::SetEnvironmentVariable("GITHUB_PERSONAL_ACCESS_TOKEN", "ghp_your_token", "User")

# Restart Cursor after setting!
```

See **git-github-operations** skill for full details

## Figma API Rate Limit (429)

**When error occurs:**

1. ✅ Use cache (`figma-data/FIGMA_CACHE.md`)
2. ✅ Use already downloaded images
3. ✅ DON'T retry immediately
4. ✅ Explain to user

## Colors and Design System

### Use CSS Variables

```css
/* globals.css */
:root {
  --unident-primary: #526ac2;
  --unident-dark: #191e35;
  --unident-bg-light-blue: #d9e4f7;
}
```

```typescript
// In components:
className = "bg-unident-primary"; // ✅ Correct
className = "bg-[#526AC2]"; // ✅ Also OK for specific cases

className = "bg-blue-500"; // ❌ Wrong (generic, not from design)
```

## Final Checklist Before Completion

- [ ] Server running and works
- [ ] Build passes (`npm run build` in nextjs) if changes touch TypeScript/Next.js
- [ ] Opened page in browser
- [ ] Screenshot taken
- [ ] Linter checked (`read_lints`)
- [ ] Console checked (no errors)
- [ ] Compared with Figma design (if applicable)
- [ ] Checked responsive (if UI changes)
- [ ] Updated documentation (if needed)

**Only after this:**

```
✅ Done! [show screenshot]
```

## Common Errors

### Too Many Running Servers

**Fix:** `taskkill /F /IM node.exe`

### Figma Rate Limit 429

**Fix:** Use cache

### Fonts via CDN

**Fix:** Replace with next/font

### Wrong Element Direction

**Fix:** Check Figma design exactly

### No Cyrillic

**Fix:** Check `subsets: ['cyrillic']`

## Performance Expectations

After optimization:

| Metric                 | Expected |
| ---------------------- | -------- |
| Lighthouse Performance | 90+      |
| FCP                    | < 1s     |
| External Font Requests | 0        |

## Useful Commands

```bash
# Stop all Node processes (Windows)
taskkill /F /IM node.exe

# Clear Next.js cache
rm -rf .next

# Check linter
npm run lint

# Build for production
npm run build
```

## Key Files

- `FIGMA_CACHE.md` - Figma data cache
- `DESIGN_SYSTEM.md` - colors and fonts
- `nextjs/figma-data/` - Figma components
