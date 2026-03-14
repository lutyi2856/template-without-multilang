---
name: wpgraphql-schema-conflicts
description: Resolve WPGraphQL schema conflicts between ACF auto-registration and manual field registration. Use when encountering GraphQL errors like "Cannot query field X on type AcfConnectionEdge", type mismatches, or when fields are nested incorrectly in GraphQL schema.
---

# WPGraphQL Schema Conflicts Resolution

## When to Use

**Use this skill when:**

- Use Context7 (resolve-library-id → query-docs) for latest API before relying on examples.
- GraphQL query returns errors like `Cannot query field "sourceUrl" on type "AcfMediaItemConnectionEdge"`
- Fields are nested in unexpected types (e.g., `AcfContentNodeConnection` instead of direct `Doctor` type)
- WPGraphQL auto-registers ACF fields but you also have manual registration
- Type structure doesn't match between frontend types and GraphQL schema
- Need to migrate from nested field groups to flat structure

**Example scenarios:**

- "Our Works" section shows no data due to schema conflict
- Frontend expects `work.photoBefore` but GraphQL returns `work.workFields.photoBefore`
- ACF Relationship fields return wrapped types instead of direct post types
- Need to disable auto-registration for specific field groups

---

## Quick Reference

### Disable Auto-Registration for Field Group

```php
add_filter('wpgraphql_acf_should_register_field_group', function($should_register, $field_group) {
    if (isset($field_group['graphql_field_name']) && $field_group['graphql_field_name'] === 'workFields') {
        return false;
    }
    return $should_register;
}, 10, 2);
```

### Register Fields Directly on Type

```php
register_graphql_field('OurWork', 'photoBefore', [
    'type' => 'MediaItem',
    'description' => 'Photo before treatment',
    'resolve' => function($post, $args, $context) {
        $image = get_field('photo_before', $post->ID);
        if ($image && isset($image['ID'])) {
            return \WPGraphQL\Data\DataSource::resolve_post_object($image['ID'], $context);
        }
        return null;
    }
]);
```

---

## Detailed Instructions

### Step 1: Identify the Conflict

**Symptoms:**

1. GraphQL query errors mentioning `Acf*` types:

   ```
   Cannot query field "sourceUrl" on type "AcfMediaItemConnectionEdge"
   Cannot query field "id" on type "AcfContentNodeConnection"
   ```

2. Unexpected nesting in GraphQL response:

   ```graphql
   # Expected:
   ourWork {
     photoBefore { sourceUrl }
   }

   # Got:
   ourWork {
     workFields {
       photoBefore { sourceUrl }
     }
   }
   ```

3. Type mismatch between frontend and GraphQL:

   ```typescript
   // Frontend expects:
   interface OurWork {
     photoBefore?: Image;
   }

   // But GraphQL returns:
   interface OurWork {
     workFields: {
       photoBefore?: Image;
     };
   }
   ```

**Check for conflict:**

```bash
# In WordPress container
docker exec wp-new-wordpress wp graphql get-type OurWork --allow-root

# Look for:
# - Fields nested in custom object types (e.g., workFields)
# - Acf* connection types
# - Duplicate field registrations
```

### Step 2: Choose Resolution Strategy

**Strategy A: Disable Auto-Registration + Manual Registration (RECOMMENDED)**

Use when:

- You want flat structure (fields directly on type, not nested)
- You need full control over field resolution
- Following pattern from working implementations (e.g., Reviews)

**Strategy B: Remove Manual Registration + Use Auto-Registration**

Use when:

- Auto-registered structure is acceptable
- You don't need custom resolvers
- Can update frontend to match nested structure

**For УниДент project: Always use Strategy A** (matches Reviews pattern)

### Step 3: Implement Strategy A (Recommended)

**1. Disable auto-registration for field group:**

```php
// In mu-plugins/register-{cpt}-fields-graphql.php

add_filter('wpgraphql_acf_should_register_field_group', function($should_register, $field_group) {
    // Disable auto-registration for specific field group
    if (isset($field_group['graphql_field_name']) && $field_group['graphql_field_name'] === 'workFields') {
        return false;
    }
    return $should_register;
}, 10, 2);
```

**2. Register all fields directly on CPT type:**

```php
function unident_register_{cpt}_fields_graphql() {
    if (!function_exists('register_graphql_field')) {
        return;
    }

    // Image fields
    register_graphql_field('OurWork', 'photoBefore', [
        'type' => 'MediaItem',
        'description' => 'Photo before treatment',
        'resolve' => function($post, $args, $context) {
            $image = get_field('photo_before', $post->ID);
            if ($image && isset($image['ID'])) {
                return \WPGraphQL\Data\DataSource::resolve_post_object($image['ID'], $context);
            }
            return null;
        }
    ]);

    // Relationship fields
    register_graphql_field('OurWork', 'relatedDoctors', [
        'type' => ['list_of' => 'Doctor'],
        'description' => 'Related doctors',
        'resolve' => function($work, $args, $context) {
            $doctors = get_field('related_doctors', $work->ID);

            if (!$doctors || !is_array($doctors)) {
                return null;
            }

            $resolved = [];
            foreach ($doctors as $doctor_post) {
                if ($doctor_post instanceof \WP_Post) {
                    $resolved_doctor = \WPGraphQL\Data\DataSource::resolve_post_object(
                        $doctor_post->ID,
                        $context
                    );
                    if ($resolved_doctor) {
                        $resolved[] = $resolved_doctor;
                    }
                }
            }

            return !empty($resolved) ? $resolved : null;
        }
    ]);

    // Boolean fields
    register_graphql_field('OurWork', 'useGeneralPhoto', [
        'type' => 'Boolean',
        'description' => 'Use general photo',
        'resolve' => function($post) {
            return (bool) get_field('use_general_photo', $post->ID);
        }
    ]);
}
add_action('graphql_register_types', 'unident_register_{cpt}_fields_graphql', 10);
```

**3. Update GraphQL query (remove nesting):**

```typescript
// Before (with nesting):
fragment OurWorkFields on OurWork {
  workFields {
    photoBefore { sourceUrl }
    relatedDoctors { id title }
  }
}

// After (flat structure):
fragment OurWorkFields on OurWork {
  photoBefore { sourceUrl }
  relatedDoctors { id title }
}
```

**4. Update TypeScript types:**

```typescript
// Before:
interface OurWork {
  workFields: {
    photoBefore?: Image;
    relatedDoctors?: Doctor[];
  };
}

// After:
interface OurWork {
  photoBefore?: Image;
  relatedDoctors?: Doctor[];
}
```

**5. Update API/Component code:**

```typescript
// Before:
const imageUrl = work.workFields?.photoBefore?.sourceUrl;
const doctors = work.workFields?.relatedDoctors;

// After:
const imageUrl = work.photoBefore?.sourceUrl;
const doctors = work.relatedDoctors;
```

### Step 4: Restart WordPress & Clear Caches

```bash
# Restart WordPress
docker restart wp-new-wordpress

# Flush WordPress cache
docker exec wp-new-wordpress wp cache flush --allow-root

# Clear Next.js cache
rm -rf nextjs/.next/cache

# Restart Next.js
# Stop: Get-Process -Name node | Stop-Process -Force
# Start: cd nextjs; npm run dev
```

### Step 5: Verify Resolution

**1. Check GraphQL schema:**

```graphql
query TestOurWork {
  ourWorks(first: 1) {
    nodes {
      id
      title
      photoBefore {
        sourceUrl
      }
      relatedDoctors {
        id
        title
      }
    }
  }
}
```

**2. Check Next.js logs for errors:**

- No `Cannot query field` errors
- Data structure matches TypeScript types

**3. Check browser:**

- Section renders correctly
- Data displays properly

---

## Common Errors & Fixes

### Error: `Cannot query field "sourceUrl" on type "AcfMediaItemConnectionEdge"`

**Cause:** WPGraphQL ACF auto-registers image field but wraps it in connection type

**Fix:**

1. Disable auto-registration for field group
2. Register field directly on type as `MediaItem`
3. Update GraphQL query to not use nested structure

### Error: `Cannot query field "id" on type "AcfContentNodeConnection"`

**Cause:** Relationship field auto-registered with connection wrapper

**Fix:**

1. Disable auto-registration
2. Register relationship directly with `['list_of' => 'Doctor']`
3. Remove `edges { node { } }` wrapping from query

### Error: Fields showing as `null` in frontend but data exists in WordPress

**Cause:** Mismatch between GraphQL query structure and manual registration

**Fix:**

1. Check that ACF field names match in resolver: `get_field('photo_before')` matches ACF field name
2. Verify field group is not auto-registered (would cause duplicate with different structure)
3. Clear all caches (WordPress + Next.js)

---

## Best Practices

### ✅ DO:

1. **Follow working patterns** - copy from successful implementations (e.g., Reviews)
2. **Disable auto-registration explicitly** - use `wpgraphql_acf_should_register_field_group` filter
3. **Register fields directly on CPT type** - not in intermediate object types
4. **Use flat structure** - avoid nesting unless absolutely necessary
5. **Clear caches after changes** - WordPress cache + Next.js cache
6. **Test GraphQL query first** - before updating frontend code
7. **Match field names exactly** - `get_field('photo_before')` must match ACF field name

### ❌ DON'T:

1. ❌ Mix auto-registration and manual registration for same field group
2. ❌ Create intermediate object types (e.g., `OurWorkFields`) when fields can be flat
3. ❌ Forget to update TypeScript types after changing GraphQL schema
4. ❌ Assume auto-registration structure - always check actual schema
5. ❌ Skip cache clearing - stale cache causes confusing bugs

---

## Pattern: Reviews as Reference

**Working implementation in УниДент project:**

```php
// register-reviews-graphql.php - REFERENCE PATTERN

// ✅ Fields registered directly on Review type
register_graphql_field('Review', 'authorImage', [...]);
register_graphql_field('Review', 'platformLogo', [...]);
register_graphql_field('Review', 'rating', [...]);
register_graphql_field('Review', 'relatedDoctors', [...]);

// ✅ No intermediate ReviewFields object type
// ✅ No auto-registration conflicts
```

**GraphQL Query:**

```graphql
# ✅ Flat structure
fragment ReviewCardFields on Review {
  id
  title
  authorImage {
    sourceUrl
  }
  relatedDoctors {
    id
    title
  }
}
```

**TypeScript:**

```typescript
// ✅ Matches GraphQL structure
interface Review {
  id: string;
  title: string;
  authorImage?: Image;
  relatedDoctors?: Doctor[];
}
```

---

## Checklist

**Before manual registration:**

- [ ] Check if field group auto-registers (`show_in_graphql: true` in ACF)
- [ ] Check existing working implementations for pattern
- [ ] Decide: flat or nested structure?
- [ ] Plan field names (match between ACF, GraphQL, TypeScript)

**During implementation:**

- [ ] Add filter to disable auto-registration
- [ ] Register all fields directly on CPT type
- [ ] Use correct types: `MediaItem`, `['list_of' => 'Doctor']`
- [ ] Test resolvers with sample data

**After implementation:**

- [ ] Update GraphQL query (remove nesting)
- [ ] Update TypeScript types (match GraphQL structure)
- [ ] Update API/Component code (access fields directly)
- [ ] Clear all caches
- [ ] Restart WordPress & Next.js
- [ ] Verify in browser

---

**Status:** ✅ Production-ready pattern
**Priority:** 🔴 HIGH - Critical for data display
**Version:** 1.0.0
