# Card images

Static artwork for cards and leaders, served as-is by Vite from `/cards/<filename>`.

## Naming

Filename must match the card's `id` from the data files (`packages/shared/src/data/cards.*.ts`,
`cards.leaders.ts`) exactly, kebab-case, plus extension:

```
<card-id>.png
```

Examples: `lumber-yard.png`, `east-trading-post.png`, `alexander.png` (leader).

## Format

- **PNG**, no spaces/uppercase in the filename.
- Aspect ratio ~5:7 (portrait, matching a physical card), e.g. **500x700px**.
- Keep files reasonably optimized (<300KB each) since all cards may load on one screen.

## Wiring up

Once files are dropped in here, set the `image` field on the matching entry in the data files to
the filename (e.g. `image: "lumber-yard.png"`). The `image` field is optional — cards without one
should fall back to a placeholder in the UI.
