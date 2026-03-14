---
name: typing-components
description: TypeScript typing for React components - props interfaces, JSDoc, destructuring, defaults. Use when creating React components, defining props interfaces, or typing component parameters.
---

# Typing React Components

- Use Context7 (resolve-library-id → query-docs) for latest API before relying on examples.

## Core Principles

### Use `interface` (not `type`)

```typescript
// ✅ Correct
interface ButtonProps {
  variant: 'primary' | 'secondary';
  onClick: () => void;
}

// ❌ Wrong
type ButtonProps = { ... }
```

**Why:** Interface better for objects, supports extension.

## Structure

### Simple Components (2-5 props): Inline Interface

```typescript
interface HeadingProps {
  children: React.ReactNode;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
}

export function Heading({ children, level, className }: HeadingProps) {
  // ...
}
```

### Complex Components (6+ props): Separate types.ts

```
components/
  doctor-card/
    doctor-card.tsx
    types.ts          ← Exported interfaces
    index.ts
```

**types.ts:**
```typescript
export interface DoctorCardProps {
  /** Full name */
  name?: string;
  /** Years of experience */
  experience?: number;
  /** Click handler */
  onBookAppointment?: () => void;
}
```

## JSDoc Comments (REQUIRED)

```typescript
interface DoctorCardProps {
  /** Full doctor name */
  name?: string;
  
  /** Years of work experience */
  experience?: number;
  
  /** Doctor image URL */
  imageUrl?: string;
  
  /** Handler for appointment booking */
  onBookAppointment?: () => void;
}
```

## Standard Types

| Prop | Type | Example |
|------|------|---------|
| Children | `React.ReactNode` | `children: React.ReactNode` |
| CSS classes | `string` (optional) | `className?: string` |
| Click handler | `() => void` | `onClick?: () => void` |
| Callback with param | `(value: T) => void` | `onChange?: (value: string) => void` |
| Styles | `React.CSSProperties` | `style?: React.CSSProperties` |

## Union Types (for Limited Values)

```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline';  // ✅
  size: 'sm' | 'md' | 'lg';  // ✅
  
  // ❌ Wrong (too broad)
  // variant: string;
}
```

## Destructuring with Defaults

```typescript
export function DoctorCard({
  name = 'Default Name',
  experience = 0,
  rating = 4.5,
  imageUrl = 'https://i.pravatar.cc/500',
  onBookAppointment,
}: DoctorCardProps) {
  // Guaranteed values for name, experience, rating
}
```

## Nested Interfaces

```typescript
export interface WorkingHours {
  weekdays: string;
  weekend: string;
}

export interface ContactInfo {
  phone: string;
  workingHours: WorkingHours;  // Composition
}

export interface HeaderProps {
  contactInfo?: ContactInfo;  // Nested composition
}
```

## Extending Interfaces

```typescript
interface BaseButtonProps {
  onClick?: () => void;
  disabled?: boolean;
}

interface PrimaryButtonProps extends BaseButtonProps {
  variant: 'solid' | 'outline';
  loading?: boolean;
}
```

## Export Public Interfaces

```typescript
// Always export
export interface DoctorCardProps { ... }
export interface WorkingHours { ... }
```

## DON'Ts

❌ `any` for props  
❌ `type` instead of `interface`  
❌ Broad types instead of unions (`string` vs `'primary' | 'secondary'`)  
❌ Props without JSDoc  
❌ Props-spreading without typing  

## Common Errors

**Build fails (TypeScript errors):** The application will not build until all type errors are fixed. Before reporting task complete or pushing to GitHub, run `npm run build` in nextjs and resolve any TypeScript errors.

## Checklist

- [ ] Used `interface` for props
- [ ] JSDoc comments for all props
- [ ] Optional props marked with `?:`
- [ ] Union types for limited values
- [ ] Interface exported with `export`
- [ ] Defaults for optional props
- [ ] Destructuring in function params
- [ ] `children` typed as `React.ReactNode`
- [ ] No `any` or `unknown`
- [ ] Complex components have separate `types.ts`
