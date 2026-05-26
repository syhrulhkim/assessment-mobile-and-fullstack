# WSAD Spacing Policy

This project uses a practical spacing system based on Tailwind utilities and a 4px base unit.

## Core Rule
- Base unit: 4px (`1` in Tailwind scale).
- Prefer spacing values from this set for margin, padding, and gaps: `1, 2, 3, 4, 6, 8, 10, 12`.
- Avoid custom pixel spacing (for example `mt-[13px]`) unless there is a strict visual requirement.

## Practical Tiers
- Compact: `1` (4px), `2` (8px)
- Comfortable: `3` (12px), `4` (16px)
- Roomy: `6` (24px), `8` (32px)
- Section-level: `10` (40px), `12` (48px)

## Component Defaults
- Page shell padding: `px-4 py-6` with `sm:px-6`
- Card padding: `p-4` or `p-6`
- Form stack spacing: `space-y-4`
- Field label/input spacing: `space-y-2`
- Inline controls/actions: `gap-2`
- Content groups/list items: `gap-3`

## Consistency Notes
- Use one spacing tier per context; avoid mixing too many sizes in a single section.
- If a component needs tighter density, reduce by one tier before introducing custom values.
- Keep mobile-first spacing; only increase spacing at breakpoints when readability improves.
