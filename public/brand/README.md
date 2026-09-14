# public/brand

Place brand assets here (e.g. `logo.png`, `logo.svg`).

- Reference the logo from a VideoSpec via `brand.logoSrc` (just the filename, e.g. `"logo.png"`).
- The renderer loads it with Remotion's `staticFile("brand/<filename>")`.
- When `brand.logoSrc` is null, a text wordmark of `brand.name` is rendered instead.
