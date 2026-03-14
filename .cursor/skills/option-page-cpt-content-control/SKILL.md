---
name: option-page-cpt-content-control
description: Control block/section content via global Option Page and per-post CPT overrides. Use when implementing editable blocks (show/hide, title, text, relationship lists) where global defaults apply to all pages and CPT overrides apply to specific posts (services, doctors, etc.).
---

# Option Page + CPT Content Control Pattern

## When to Use

**Use when you need:**

- Editable blocks on CPT pages (services, doctors, promotions) with global defaults
- Show/hide toggles for sections (e.g. «Показать блок услуг», «Показать секцию врачей»)
- Title, description, text fields with fallback: CPT → Option Page → hardcoded default
- Relationship lists (doctors, services) with fallback: CPT → Option Page → API fetch

**Reference implementations in УниДент:**

- Exact price block (showPriceBlock, icon, text, link)
- Doctors section (doctorsSectionShow, title, description, relatedDoctors)
- STA block (title, description, phone, images)
- Services block (servicesBlockShow, title, blockServices/selectedServices)

---

## Quick Reference

| Element | Formula | Example |
|---------|---------|---------|
| **showBlock** | `cpt?.showField ?? optionPage?.showField ?? true` | `service.servicePageBlocks?.servicesBlockShow ?? servicePagesSettings?.servicesBlockShow ?? true` |
| **Text field** | `cpt?.field?.trim() \|\| optionPage?.field?.trim() \|\| default` | `service.servicePageBlocks?.servicesBlockTitle?.trim() \|\| servicePagesSettings?.servicesBlockTitle?.trim() \|\| "Другие услуги"` |
| **Relationship list** | `cpt?.list?.length ? cpt.list : optionPage?.list?.length ? optionPage.list : fetchFallback()` | `blockServices ?? selectedServices ?? getServicesForServicePageSlider(...)` |

**Priority:** CPT (post) → Option Page (global) → hardcoded/default.

---

## Detailed Instructions

### Step 1: ACF — Option Page and CPT fields

**Option Page** (e.g. `service_pages_settings`):

- Add tab + fields in `unident-acf-fields.php`
- For show/hide: `true_false`, default 1, `graphql_field_name: 'blockShow'`
- For text: `text`/`textarea`, `show_in_graphql: 1`
- For relationships: `relationship` with `post_type`, `return_format: 'object'`

**CPT** (e.g. Service `servicePageBlocks`):

- Mirror the same fields in the CPT field group
- Same `name` and `graphql_field_name` for consistency
- Place in the same logical tab (e.g. «Блок услуг»)

```php
// Option Page — show toggle
array(
    'key' => 'field_service_pages_show_services_block',
    'label' => 'Показать блок услуг',
    'name' => 'show_services_block',
    'type' => 'true_false',
    'default_value' => 1,
    'ui' => 1,
    'show_in_graphql' => 1,
    'graphql_field_name' => 'servicesBlockShow',
),

// Service CPT — same structure
array(
    'key' => 'field_service_blocks_show_services_block',
    'label' => 'Показать блок услуг',
    'name' => 'show_services_block',
    'type' => 'true_false',
    'default_value' => 1,
    'ui' => 1,
    'show_in_graphql' => 1,
    'graphql_field_name' => 'servicesBlockShow',
),
```

### Step 2: GraphQL — manual registration

**Option Page** (e.g. `ServicePagesSettings`):

- `register_graphql_object_type` with all fields
- `register_graphql_field('RootQuery', 'servicePagesSettings', ...)` 
- Resolve: `$post_id = 'service_pages_options'` (or your option page slug)
- `get_field('field_name', $post_id)` for each field

**CPT** (e.g. `ServicePageBlocks` on `Service`):

- `register_graphql_field('Service', 'servicePageBlocks', ...)`
- Resolve: `$post_id = $service->databaseId ?? $service->ID`
- For relationships: map `WP_Post` to GraphQL types via `DataSource::resolve_post_object`

```php
// In resolve for Option Page
'servicesBlockShow' => (bool) get_field('show_services_block', $post_id),

// In resolve for Service.servicePageBlocks
'servicesBlockShow' => (bool) get_field('show_services_block', $post_id),
```

### Step 3: Next.js — queries and types

**Queries** (`queries/services.ts`):

- Add new fields to `GET_SERVICE_PAGES_SETTINGS`
- Add new fields to `GET_SERVICE_BY_SLUG` → `servicePageBlocks`

**Types** (`types/services.ts`, `api.ts`):

- Extend `ServicePagesSettings` and `servicePageBlocks` with new fields
- Use `ServiceSliderItem[]` or `Doctor[]` for relationship lists

### Step 4: Wrapper component (Server Component)

Create a section component (e.g. `ServiceServicesSection`) that:

1. Accepts `service` and `servicePagesSettings`
2. Resolves `showBlock`; if `!showBlock` → `return null`
3. Resolves title, description, list items with fallback chain
4. For lists: exclude current item by slug when needed
5. Renders existing client component with resolved data

```tsx
// service-services-section.tsx
export async function ServiceServicesSection({
  service,
  servicePagesSettings,
}: Props) {
  const showBlock =
    service.servicePageBlocks?.servicesBlockShow ??
    servicePagesSettings?.servicesBlockShow ??
    true;

  if (!showBlock) return null;

  const title =
    service.servicePageBlocks?.servicesBlockTitle?.trim() ||
    servicePagesSettings?.servicesBlockTitle?.trim() ||
    "Другие услуги";

  const serviceBlockServices = service.servicePageBlocks?.blockServices;
  const globalSelectedServices = servicePagesSettings?.selectedServices;

  let services: ServiceSliderItem[] = [];
  if (serviceBlockServices?.length) {
    services = serviceBlockServices
      .filter((s) => s.slug !== service.slug)
      .map(toSliderItem);
  } else if (globalSelectedServices?.length) {
    services = globalSelectedServices
      .filter((s) => s.slug !== service.slug)
      .map(toSliderItem);
  } else {
    services = await getServicesForServicePageSlider(service.slug, categorySlugs, 12);
  }

  if (services.length === 0) return null;

  return (
    <Section>
      <ServicesSliderSectionClient services={services} title={title} />
    </Section>
  );
}
```

### Step 5: Page — pass data and use wrapper

```tsx
// app/services/[slug]/page.tsx
const [service, servicePagesSettings] = await Promise.all([
  getServiceBySlug(slug),
  getServicePagesSettings(),
]);

<ServiceServicesSection
  service={service}
  servicePagesSettings={servicePagesSettings}
/>
```

---

## Common Errors

### Error: "Cannot query field X on type ServicePagesSettings"

**Cause:** Field not registered in GraphQL or not in resolve return.

**Fix:** Add `'fieldName' => ['type' => 'Boolean']` to type and `'fieldName' => get_field('field_name', $post_id)` to resolve.

### Error: Option Page returns null for all fields

**Cause:** Wrong `$post_id` for Option Page. ACF uses `'options'` or custom slug like `'service_pages_options'`.

**Fix:** Use the correct option page slug: `$post_id = 'service_pages_options'` (check `acf_add_options_page` post_id).

### Error: Relationship list empty in GraphQL

**Cause:** Resolve returns raw `WP_Post[]`; WPGraphQL expects resolved types.

**Fix:** Map each post: `\WPGraphQL\Data\DataSource::resolve_post_object($post->ID, $context)`.

### Error: showBlock always true when CPT field is false

**Cause:** Using `||` instead of `??` — `false ?? true` is `true`, but `false || true` is also `true`. For booleans, `??` correctly handles explicit `false`.

**Fix:** `service.servicePageBlocks?.servicesBlockShow ?? servicePagesSettings?.servicesBlockShow ?? true`

---

## Best Practices

### ✅ DO:

1. **Use `??` for showBlock** — preserves explicit `false` from CPT/global.
2. **Use `?.trim()` for text** — empty string = «not filled» → use fallback.
3. **Exclude current item** from relationship lists when relevant (e.g. current service in «Другие услуги»).
4. **Create wrapper component** — keep logic separate from presentation client component.
5. **Fetch Option Page and CPT in parallel** — `Promise.all([getServiceBySlug(), getServicePagesSettings()])`.

### ❌ DON'T:

1. **Don't use `||` for optional booleans** — `false || true` yields `true`.
2. **Don't forget GraphQL registration** — ACF `show_in_graphql` alone may not be enough for Option Page; manual resolve often needed.
3. **Don't mix field names** — CPT and Option Page should use same `name` (e.g. `show_services_block`) for consistency.
4. **Don't skip fallback** — always provide a default when both CPT and global are empty.

---

## Related Skills

- [acf-option-pages-workflow](.cursor/skills/acf-option-pages-workflow/SKILL.md) — Option Page creation and structure
- [acf-option-pages-manual-graphql](.cursor/skills/acf-option-pages-manual-graphql/SKILL.md) — Manual GraphQL for Option Page
- [acf-relationships](.cursor/skills/acf-relationships/SKILL.md) — Relationship fields and bidirectional sync
