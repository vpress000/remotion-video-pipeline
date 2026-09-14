# public/footage

Drop product **b-roll clips** here (`.mp4` / `.mov` / `.webm`).

- Reference a clip from a scene via `footageSrc` (just the filename, e.g. `"nectar-pour.mp4"`).
- The renderer loads it with Remotion's `staticFile("footage/<filename>")` and renders it with `<OffthreadVideo>`.
- When a scene has no `footageSrc`, an on-brand animated gradient is shown instead, so the video always renders.
- Video files are **git-ignored** to keep the repo small.

To pull footage from your existing Bee Naturals library, copy clips from
`C:\Users\patel\Downloads\BeeNaturals\Video Work\Videos to Cut` into this folder.
