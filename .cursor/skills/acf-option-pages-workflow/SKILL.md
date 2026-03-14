---
name: acf-option-pages-workflow
description: Complete workflow for ACF Option Pages - creation, GraphQL registration, data filling, and Next.js integration. Use when creating global settings, site-wide data, or configuration that should be editable in WordPress admin.
---

# ACF Option Pages Complete Workflow

## When to Use

**Use when you need:**

- Global site settings (contacts, social links, header/footer data)
- Configuration that applies site-wide (selected promotion, featured items)
- Non-post data that admins should edit (phone numbers, emails, addresses)
- Settings for specific sections (block settings, page settings)

**NOT for:**

- Post-specific data (use CPT with ACF fields)
- Taxonomies (use WordPress taxonomies)
- User-specific data (use User meta)

---

## Complete Workflow

### Phase 1: WordPress - Create Option Page

**Step 1: Register Option Page**

```php
// wp-content/mu-plugins/unident-acf-fields.php

function unident_register_option_pages() {
    if (function_exists('acf_add_options_page')) {
        // Main option page
        acf_add_options_page([
            'page_title'    => 'Site Contacts',
            'menu_title'    => 'Contacts',
            'menu_slug'     => 'contacts-settings',
            'capability'    => 'edit_posts',
            'post_id'       => 'options',
            'autoload'      => true,
            'icon_url'      => 'dashicons-phone',
        ]);
    }
}
add_action('acf/init', 'unident_register_option_pages');
```

**Step 2: Create ACF Field Group**

```php
function unident_register_contacts_fields() {
    if (function_exists('acf_add_local_field_group')) {
        acf_add_local_field_group([
            'key' => 'group_contacts_settings',
            'title' => 'Contacts Settings',
            'fields' => [
                [
                    'key' => 'field_site_email',
                    'label' => 'Site Email',
                    'name' => 'site_email',
                    'type' => 'email',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'siteEmail',
                ],
                [
                    'key' => 'field_site_phone',
                    'label' => 'Site Phone',
                    'name' => 'site_phone',
                    'type' => 'text',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'sitePhone',
                ],
                [
                    'key' => 'field_social_contacts',
                    'label' => 'Social Contacts',
                    'name' => 'social_contacts',
                    'type' => 'repeater',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'socialContacts',
                    'sub_fields' => [
                        [
                            'key' => 'field_social_text',
                            'label' => 'Social Network',
                            'name' => 'social_text',
                            'type' => 'text',
                            'show_in_graphql' => 1,
                        ],
                        [
                            'key' => 'field_social_url',
                            'label' => 'URL',
                            'name' => 'social_url',
                            'type' => 'url',
                            'show_in_graphql' => 1,
                        ],
                    ],
                ],
            ],
            'location' => [
                [
                    [
                        'param' => 'options_page',
                        'operator' => '==',
                        'value' => 'contacts-settings',
                    ],
                ],
            ],
        ]);
    }
}
add_action('acf/init', 'unident_register_contacts_fields');
```

**Step 3: Manual GraphQL Registration**

```php
// CRITICAL: ACF Option Pages REQUIRE manual GraphQL registration!

function unident_register_contacts_graphql() {
    // Register custom type
    register_graphql_object_type('ContactsSettings', [
        'description' => 'Site contacts settings',
        'fields' => [
            'siteEmail' => ['type' => 'String'],
            'sitePhone' => ['type' => 'String'],
            'socialContacts' => [
                'type' => ['list_of' => 'SocialContact'],
            ],
        ],
    ]);

    // Register sub-type for repeater
    register_graphql_object_type('SocialContact', [
        'fields' => [
            'socialText' => ['type' => 'String'],
            'socialUrl' => ['type' => 'String'],
        ],
    ]);

    // Register root query field
    register_graphql_field('RootQuery', 'contactsSettings', [
        'type' => 'ContactsSettings',
        'description' => 'Get site contacts settings',
        'resolve' => function() {
            return [
                'siteEmail' => get_field('site_email', 'option'),
                'sitePhone' => get_field('site_phone', 'option'),
                'socialContacts' => get_field('social_contacts', 'option') ?: [],
            ];
        }
    ]);
}
add_action('graphql_register_types', 'unident_register_contacts_graphql');
```

---

### Phase 2: Fill Test Data

**Create fill script:**

```php
// scripts/fill-contacts-data.php
<?php
require_once('/var/www/html/wp-load.php');

echo "\n=== Filling Contacts Data ===\n\n";

// Email
update_field('site_email', 'info@example.com', 'option');
echo "✓ Email: info@example.com\n";

// Phone
update_field('site_phone', '+7 (495) 123-45-67', 'option');
echo "✓ Phone: +7 (495) 123-45-67\n";

// Social contacts (repeater)
$social_contacts = [
    [
        'social_text' => 'Telegram',
        'social_url' => 'https://t.me/example',
    ],
    [
        'social_text' => 'WhatsApp',
        'social_url' => 'https://wa.me/74951234567',
    ],
];
update_field('social_contacts', $social_contacts, 'option');
echo "✓ Social contacts: " . count($social_contacts) . " items\n";

echo "\n=== Fill Complete ===\n\n";

// Verify
$email = get_field('site_email', 'option');
$phone = get_field('site_phone', 'option');
$socials = get_field('social_contacts', 'option');

echo "Verification:\n";
echo "  Email: " . ($email ?: "NULL") . "\n";
echo "  Phone: " . ($phone ?: "NULL") . "\n";
echo "  Socials: " . (is_array($socials) ? count($socials) . " items" : "NULL") . "\n";
```

**Run:**

```bash
docker cp scripts/fill-contacts-data.php wp-new-wordpress:/var/www/html/scripts/
docker exec wp-new-wordpress php /var/www/html/scripts/fill-contacts-data.php
```

---

### Phase 3: Test GraphQL

**Open GraphiQL:** `http://localhost:8002/graphql`

```graphql
query TestContactsSettings {
  contactsSettings {
    siteEmail
    sitePhone
    socialContacts {
      socialText
      socialUrl
    }
  }
}
```

**Expected result:**

```json
{
  "data": {
    "contactsSettings": {
      "siteEmail": "info@example.com",
      "sitePhone": "+7 (495) 123-45-67",
      "socialContacts": [
        {
          "socialText": "Telegram",
          "socialUrl": "https://t.me/example"
        },
        {
          "socialText": "WhatsApp",
          "socialUrl": "https://wa.me/74951234567"
        }
      ]
    }
  }
}
```

---

### Phase 4: Next.js - TypeScript Types

```typescript
// nextjs/src/types/contacts.ts

export interface SocialContact {
  socialText: string;
  socialUrl: string;
}

export interface ContactsSettings {
  siteEmail?: string;
  sitePhone?: string;
  socialContacts?: SocialContact[];
}
```

---

### Phase 5: Next.js - GraphQL Query

```typescript
// nextjs/src/lib/wordpress/queries/contacts.ts

import { gql } from "@apollo/client";

export const GET_CONTACTS_SETTINGS = gql`
  query GetContactsSettings {
    contactsSettings {
      siteEmail
      sitePhone
      socialContacts {
        socialText
        socialUrl
      }
    }
  }
`;
```

---

### Phase 6: Next.js - API Function

```typescript
// nextjs/src/lib/wordpress/api.ts

import { GET_CONTACTS_SETTINGS } from "./queries/contacts";
import type { ContactsSettings } from "@/types/contacts";

export async function getContactsSettings(): Promise<ContactsSettings | null> {
  try {
    const client = getApolloClient();

    const { data } = await client.query({
      query: GET_CONTACTS_SETTINGS,
    });

    return data?.contactsSettings || null;
  } catch (error) {
    console.error("[getContactsSettings] Error:", error);
    return null;
  }
}
```

---

### Phase 7: Next.js - Use in Component

```typescript
// nextjs/src/components/sections/contact-section.tsx

import { getContactsSettings } from "@/lib/wordpress";
import { Text } from "@/components/design-system";

export async function ContactSection() {
  const contacts = await getContactsSettings();

  if (!contacts) {
    return null;
  }

  return (
    <section>
      <Text>Email: {contacts.siteEmail}</Text>
      <Text>Phone: {contacts.sitePhone}</Text>

      {contacts.socialContacts?.map((social, idx) => (
        <a key={idx} href={social.socialUrl}>
          {social.socialText}
        </a>
      ))}
    </section>
  );
}
```

---

## Common Patterns

### Pattern 1: Post Object Field in Option Page

```php
// ACF Field
[
    'key' => 'field_selected_promotion',
    'label' => 'Selected Promotion',
    'name' => 'selected_promotion',
    'type' => 'post_object',
    'post_type' => ['promotions'],
    'show_in_graphql' => 1,
]

// GraphQL Registration
register_graphql_field('RootQuery', 'blockPricesSettings', [
    'type' => 'BlockPricesSettings',
    'resolve' => function() {
        $promotion_id = get_field('selected_promotion', 'option');

        return [
            'selectedPromotion' => $promotion_id ? get_post($promotion_id) : null,
        ];
    }
]);

// GraphQL Query
query GetBlockPricesSettings {
  blockPricesSettings {
    selectedPromotion {
      id
      title
      excerpt
    }
  }
}
```

### Pattern 2: Complex Nested Repeater

```php
// ACF Field
[
    'key' => 'field_header_menu',
    'name' => 'header_menu',
    'type' => 'repeater',
    'sub_fields' => [
        [
            'key' => 'field_menu_item_text',
            'name' => 'menu_item_text',
            'type' => 'text',
        ],
        [
            'key' => 'field_menu_item_submenu',
            'name' => 'submenu',
            'type' => 'repeater',
            'sub_fields' => [
                [
                    'key' => 'field_submenu_text',
                    'name' => 'submenu_text',
                    'type' => 'text',
                ],
            ],
        ],
    ],
]

// GraphQL Registration
register_graphql_object_type('MenuItem', [
    'fields' => [
        'menuItemText' => ['type' => 'String'],
        'submenu' => ['type' => ['list_of' => 'SubMenuItem']],
    ],
]);

register_graphql_object_type('SubMenuItem', [
    'fields' => [
        'submenuText' => ['type' => 'String'],
    ],
]);
```

---

## Troubleshooting

### Problem: Option Page fields return NULL

**Причина:** Не заполнены данные

**Solution:**

```php
// 1. Проверить
$value = get_field('your_field', 'option');
var_dump($value);

// 2. Заполнить
update_field('your_field', 'test value', 'option');

// 3. Проверить снова
$value = get_field('your_field', 'option');
var_dump($value);
```

### Problem: GraphQL returns NULL for Option Page

**Причина:** Не зарегистрирован GraphQL field

**Solution:**

```php
// Добавить manual registration
register_graphql_field('RootQuery', 'yourSettings', [
    'type' => 'YourSettingsType',
    'resolve' => function() {
        return [
            'yourField' => get_field('your_field', 'option'),
        ];
    }
]);
```

### Problem: Repeater shows as string, not array

**Причина:** Не правильный тип в GraphQL registration

**Solution:**

```php
// ❌ НЕПРАВИЛЬНО
'yourRepeater' => ['type' => 'String']

// ✅ ПРАВИЛЬНО
'yourRepeater' => ['type' => ['list_of' => 'YourSubType']]
```

---

## Best Practices

### ✅ DO:

1. **ВСЕГДА создавать manual GraphQL registration** для Option Pages
2. **Использовать `list_of`** для repeater полей
3. **Создавать fill-скрипты** для тестовых данных
4. **Проверять данные перед тестированием** Next.js
5. **Использовать TypeScript types** для type safety
6. **Handle NULL values** в компонентах

### ❌ DON'T:

1. ❌ Не полагаться на ACF auto-registration для Option Pages
2. ❌ Не забывать про `'option'` в `get_field('field', 'option')`
3. ❌ Не использовать connection format для простых полей
4. ❌ Не пропускать phase тестирования в GraphiQL
5. ❌ Не забывать про ISR cache в Next.js

---

## Quick Reference

### Create Option Page Checklist

- [ ] Register option page (`acf_add_options_page`)
- [ ] Create ACF field group with `location => options_page`
- [ ] Add manual GraphQL registration (`register_graphql_field`)
- [ ] Create fill script and run
- [ ] Test in GraphiQL
- [ ] Create TypeScript types
- [ ] Create GraphQL query
- [ ] Create API function
- [ ] Use in component
- [ ] Test on frontend

---

**Статус:** ✅ Production-ready
**Версия:** 1.0.0
**Дата:** 2026-02-04
