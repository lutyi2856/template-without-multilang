---
name: playwright-browser-testing
description: Browser testing and UI verification using Playwright MCP. Use when need to visually verify UI changes, test interactions, debug frontend issues, or capture screenshots for reporting.
---

# Playwright Browser Testing via MCP

## When to Use

**Use this skill when:**
- Need to **visually verify** UI changes (dropdown, modal, hover states)
- **Testing interactions** (click, hover, type, navigate)
- **Debugging frontend issues** (why doesn't dropdown show?)
- **Capturing screenshots** for reporting work done
- **Verifying console logs** and errors
- **Testing responsive design** (resize viewport)
- **Checking accessibility tree** (semantic HTML structure)

**Example scenario:** After implementing service dropdown, verify that all 7 categories show on hover.

---

## Quick Reference

### Essential Playwright MCP Tools

```typescript
// Navigate to page
browser_navigate({ url: "http://localhost:3000" })

// Get page snapshot (accessibility tree)
browser_snapshot()

// Hover over element
browser_hover({ element: "Services link", ref: "e81" })

// Click element
browser_click({ element: "button", ref: "e120" })

// Take screenshot
browser_take_screenshot({ filename: "services-dropdown.png" })

// Check console messages
browser_console_messages()
```

---

## Step-by-Step Workflow

### Step 1: Start Next.js Dev Server

```bash
# Check if already running
ls C:\Users\Sergey\.cursor\projects\d-template\terminals\

# Start if needed
npm run dev  # in nextjs/ folder
```

**Wait 5-10 seconds** for server to fully start.

### Step 2: Navigate to Page

```typescript
CallMcpTool({
  server: "user-playwright",
  toolName: "browser_navigate",
  arguments: { url: "http://localhost:3000" }
})
```

**Returns:**
- Console messages (React DevTools, errors)
- Page URL and title
- **Page Snapshot** (accessibility tree)

### Step 3: Inspect Page Snapshot

**Page Snapshot = Accessibility Tree:**

```yaml
- generic [ref=e1]:
  - banner [ref=e2]:
    - navigation [ref=e77]:
      - link "Услуги" [ref=e81] [cursor=pointer]:
        - /url: /services
```

**What to look for:**
- Element references (`ref=e81`)
- Element types (`link`, `button`, `generic`)
- Text content
- Cursor states (`[cursor=pointer]`)

### Step 4: Interact with Elements

#### Hover (for dropdowns, tooltips)

```typescript
CallMcpTool({
  server: "user-playwright",
  toolName: "browser_hover",
  arguments: { 
    element: "Services link", 
    ref: "e81" 
  }
})
```

#### Click (for buttons, links)

```typescript
CallMcpTool({
  server: "user-playwright",
  toolName: "browser_click",
  arguments: { 
    element: "button Записаться", 
    ref: "e120" 
  }
})
```

#### Type (for inputs)

```typescript
CallMcpTool({
  server: "user-playwright",
  toolName: "browser_type",
  arguments: { 
    element: "searchbox", 
    ref: "e103",
    text: "Имплантация"
  }
})
```

### Step 5: Capture Screenshot

```typescript
CallMcpTool({
  server: "user-playwright",
  toolName: "browser_take_screenshot",
  arguments: { 
    filename: "feature-name.png" 
  }
})
```

**Saves to:** `d:\template\.playwright-mcp\feature-name.png`

### Step 6: Check Console Logs

```typescript
CallMcpTool({
  server: "user-playwright",
  toolName: "browser_console_messages",
  arguments: {}
})
```

**Look for:**
- `[LOG]` - debug messages
- `[WARNING]` - warnings (non-critical)
- `[ERROR]` - errors (critical)

---

## Available Playwright MCP Tools

### Navigation

**browser_navigate**
```typescript
{ url: "http://localhost:3000/services" }
```

**browser_navigate_back**
```typescript
{} // Go back in history
```

### Inspection

**browser_snapshot**
```typescript
{} // Get accessibility tree
```

**browser_console_messages**
```typescript
{} // Get all console logs
```

**browser_network_requests**
```typescript
{} // Get network activity
```

### Interaction

**browser_hover**
```typescript
{ element: "link text", ref: "e81" }
```

**browser_click**
```typescript
{ element: "button", ref: "e120" }
```

**browser_type**
```typescript
{ element: "input", ref: "e103", text: "search query" }
```

**browser_fill_form**
```typescript
{
  fields: [
    { element: "input name", ref: "e10", value: "John" },
    { element: "input email", ref: "e11", value: "john@example.com" }
  ]
}
```

**browser_press_key**
```typescript
{ key: "Enter" } // or "Escape", "Tab", etc.
```

**browser_select_option**
```typescript
{ element: "select", ref: "e50", value: "option-value" }
```

### Visual

**browser_take_screenshot**
```typescript
{ filename: "screenshot.png" }
```

**browser_resize**
```typescript
{ width: 375, height: 667 } // iPhone SE size
```

### Advanced

**browser_evaluate**
```typescript
{ code: "document.querySelectorAll('.dropdown').length" }
```

**browser_wait_for**
```typescript
{ 
  selector: ".dropdown", 
  state: "visible", 
  timeout: 5000 
}
```

---

## Common Testing Scenarios

### Scenario 1: Verify Dropdown Shows All Items

```typescript
// 1. Navigate
browser_navigate({ url: "http://localhost:3000" })

// 2. Get initial snapshot (no dropdown)
browser_snapshot()

// 3. Hover to trigger dropdown
browser_hover({ element: "Services link", ref: "e81" })

// 4. Get snapshot with dropdown visible
browser_snapshot()
// → Check: Should show all 7 categories

// 5. Take screenshot
browser_take_screenshot({ filename: "services-dropdown-open.png" })
```

### Scenario 2: Test Form Submission

```typescript
// 1. Navigate to form page
browser_navigate({ url: "http://localhost:3000/contact" })

// 2. Fill form fields
browser_fill_form({
  fields: [
    { element: "input name", value: "Иван Иванов" },
    { element: "input phone", value: "+79991234567" }
  ]
})

// 3. Submit
browser_click({ element: "button Отправить" })

// 4. Wait for success message
browser_wait_for({ selector: ".success-message", state: "visible" })

// 5. Screenshot result
browser_take_screenshot({ filename: "form-submitted.png" })
```

### Scenario 3: Mobile Responsive Testing

```typescript
// 1. Resize to mobile
browser_resize({ width: 375, height: 667 }) // iPhone SE

// 2. Navigate
browser_navigate({ url: "http://localhost:3000" })

// 3. Screenshot mobile view
browser_take_screenshot({ filename: "mobile-homepage.png" })

// 4. Test mobile menu
browser_click({ element: "button menu toggle" })
browser_snapshot() // Check menu items

// 5. Resize back to desktop
browser_resize({ width: 1920, height: 1080 })
```

### Scenario 4: Debug Console Errors

```typescript
// 1. Navigate
browser_navigate({ url: "http://localhost:3000" })

// 2. Perform action that may cause error
browser_click({ element: "problematic button" })

// 3. Check console
browser_console_messages()
// Look for [ERROR] messages

// 4. Check network requests
browser_network_requests()
// Look for failed API calls
```

---

## Reading Page Snapshots

### Accessibility Tree Format

```yaml
- element_type [attributes] [ref=eXX]:
  - child_element [attributes] [ref=eYY]:
    - text: "Element text"
```

### Example:

```yaml
- navigation [ref=e77]:
  - generic [ref=e79]:
    - link "Услуги" [ref=e81] [cursor=pointer]:
      - /url: /services
      - text: Услуги
      - img [ref=e82]
```

**What this tells us:**
- Navigation container at `ref=e77`
- Link element at `ref=e81`
- Link goes to `/services`
- Link contains text "Услуги" and an image
- Hoverable (`cursor=pointer`)

### Finding Element References

**To interact with an element, you need its `ref`:**

1. Run `browser_snapshot()`
2. Find your element in the tree (search for text/type)
3. Note the `ref=eXX` value
4. Use in interaction: `browser_hover({ ref: "e81" })`

---

## Troubleshooting

### Issue 1: "ERR_CONNECTION_REFUSED"

**Cause:** Next.js not running

**Fix:**
```bash
# Check terminals
ls C:\Users\Sergey\.cursor\projects\d-template\terminals\

# Start Next.js
npm run dev  # in nextjs/ folder
```

### Issue 2: "Ref eXX not found"

**Cause:** Page changed, snapshot stale

**Fix:**
```typescript
// Get fresh snapshot
browser_snapshot()
// Find new ref and use it
```

### Issue 3: Element Not Visible for Interaction

**Cause:** Element hidden/covered, wrong timing

**Fix:**
```typescript
// Wait for element
browser_wait_for({ 
  selector: ".dropdown", 
  state: "visible",
  timeout: 5000 
})

// Then interact
browser_hover({ ref: "e81" })
```

### Issue 4: Hover Doesn't Trigger Dropdown

**Cause:** 
- CSS transition timing
- JavaScript event timing
- Browser tool limitations with `onMouseEnter`

**Workaround:**
```typescript
// If hover doesn't work, try click for testing
browser_click({ element: "Services button" })
```

---

## Best Practices

### ✅ DO:

1. **Always get fresh snapshot before interacting:**
   ```typescript
   browser_snapshot()  // Get refs
   browser_hover({ ref: "e81" })  // Use ref
   ```

2. **Wait for page to load:**
   ```typescript
   browser_navigate({ url: "..." })
   // Wait 1-2 seconds or check snapshot
   browser_snapshot()
   ```

3. **Take screenshots for reporting:**
   ```typescript
   browser_take_screenshot({ 
     filename: "feature-working.png" 
   })
   ```

4. **Check console for errors:**
   ```typescript
   browser_console_messages()
   // Look for [ERROR] or [WARNING]
   ```

5. **Use descriptive filenames:**
   ```typescript
   // ✅ Good
   "services-dropdown-7-categories.png"
   
   // ❌ Bad
   "screenshot.png"
   ```

### ❌ DON'T:

1. ❌ Use stale refs (always get fresh snapshot)
2. ❌ Interact before page loads (wait for navigation)
3. ❌ Skip screenshots when reporting work
4. ❌ Ignore console errors
5. ❌ Test only desktop (check mobile too)

---

## Integration with Quality Checks

**Before reporting "Done":**

```typescript
// 1. Visual verification
browser_navigate({ url: "http://localhost:3000" })
browser_hover({ element: "feature element" })
browser_take_screenshot({ filename: "feature-working.png" })

// 2. Check console for errors
browser_console_messages()
// → No [ERROR] messages

// 3. Test interaction
browser_click({ element: "button" })
browser_snapshot()
// → Verify expected result

// 4. Mobile check (optional)
browser_resize({ width: 375, height: 667 })
browser_snapshot()
// → Verify mobile layout

// 5. Report to user WITH screenshot
```

---

## Example: Complete Dropdown Test

```typescript
// Test: Service Dropdown shows all 7 categories

// Step 1: Navigate
browser_navigate({ url: "http://localhost:3000" })

// Step 2: Get initial state
browser_snapshot()
// → Find Services link ref (e.g., e81)

// Step 3: Trigger dropdown
browser_hover({ 
  element: "Services link", 
  ref: "e81" 
})

// Step 4: Get dropdown state
browser_snapshot()
// → Verify in tree:
//   - Детская стоматология
//   - Имплантация
//   - Лечение
//   - Ортодонтия
//   - Отбеливание
//   - Протезирование
//   - Хирургия

// Step 5: Screenshot
browser_take_screenshot({ 
  filename: "services-dropdown-7-categories.png" 
})

// Step 6: Check console
browser_console_messages()
// → Look for data loading logs:
//   "[Navigation] DEBUG: {categoriesCount: 7, ...}"

// ✅ Result: All 7 categories visible, no errors
```

---

## Related Skills

- **project-workflow** - quality checks before reporting
- **wordpress-nextjs-cache-clearing** - if data doesn't update
- **design-system-usage** - verifying component styling

---

**Status:** ✅ Активно применять
**Version:** 1.0.0
**Created:** 2026-01-21
