---
name: context7-documentation
description: Fetch up-to-date library docs via Context7 MCP. Use when answering questions about Next.js, Apollo, Radix, WPGraphQL, Tailwind, nuqs, zod, or when API might have changed.
---

# Context7 Documentation Lookup

## When to Use

- User asks about Next.js (App Router, Server Components, caching)
- User asks about Apollo Client (fetchPolicy, cache, mutations)
- User asks about Radix/Shadcn (Dialog, Select, DropdownMenu)
- User asks about WPGraphQL (where, taxQuery, metaQuery)
- User asks about Tailwind, nuqs, zod
- Skill examples may be outdated — verify via Context7

## Workflow

1. **resolve-library-id**: query (user question), libraryName (e.g. "next.js")
2. **query-docs**: libraryId (from step 1), question (user question)
3. Use returned snippets in answer

## Server

- **Server:** `plugin-context7-plugin-context7`
