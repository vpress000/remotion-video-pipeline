# Architecture — remotion-video-pipeline

Companion to [README.md](README.md). Describes the system design, the `VideoSpec`
contract, the agent pipeline, the Remotion rendering layer, and operational concerns.

## 1. System overview

Two decoupled layers communicate through a single Zod-validated artifact, the
**`VideoSpec`**:

```mermaid
flowchart TB
    subgraph Plan["Planning layer — src/agents, src/pipeline"]
        direction LR
        B["Brief JSON"] --> ORCH["orchestrator.ts"]
        ORCH --> LLM["LLM client<br/>(Anthropic | OpenAI)"]
    end
    ORCH --> SPEC[("VideoSpec JSON<br/>src/schema/video-spec.ts")]
    subgraph Render["Rendering layer — src/remotion"]
        direction LR
        SPEC --> ROOT["Root.tsx<br/>Composition x2"]
        ROOT --> COMP["ProductVideo.tsx"]
        COMP --> SCENES["SceneView + components"]
    end
    SCENES --> OUT["MP4 (9:16 & 16:9)"]
```

**Key property:** the rendering layer never imports the agents or the LLM client.
You can render from any `VideoSpec` JSON with no network access and no API key.

## 2. The VideoSpec contract

Defined in [src/schema/video-spec.ts](src/schema/video-spec.ts). It is the only
coupling point between planning and rendering, which makes each side independently
testable and replaceable.

- `title`, `callToAction`
- `brand`: `{ name, primary, secondary, background, text, fontFamily, logoSrc }`
- `fps`
- `scenes[]`: `{ id, type, durationInSeconds, headline, subtext?, bullets[], footageSrc, backgroundColor?, transition }`
- `captions`: `{ enabled, vttSrc, cues[] }` where a cue is `{ startMs, endMs, text }`
- `music`: `{ mood, trackSrc, volume }`

Remotion consumes it directly: each `<Composition>` declares `schema={videoSpecSchema}`,
so Remotion Studio renders an editable form and validates props at render time.
`calculateMetadata` derives `durationInFrames` from the sum of scene durations.

## 3. Planning pipeline

Orchestrated by [src/pipeline/orchestrator.ts](src/pipeline/orchestrator.ts).

```mermaid
sequenceDiagram
    autonumber
    participant CLI as run.ts
    participant O as orchestrator
    participant SC as ScriptCopywriting (LLM)
    participant CD as CreativeDirector (LLM)
    participant AB as AudioBGM (LLM)
    participant CE as ClipEditing (LLM)
    participant SUB as SubtitleCaption (code)
    participant RA as RemotionAgent (code)
    participant QR as QualityReview (LLM)

    CLI->>O: runPipeline(brief)
    O->>SC: brief -> Script
    O->>CD: (brief, Script) -> CreativeDirection
    par
        O->>AB: (brief, CreativeDirection) -> MusicPlan
    and
        O->>CE: (brief, Script) -> EditPlan
    end
    O->>SUB: (Script, EditPlan) -> CaptionCue[]
    O->>RA: assemble -> VideoSpec (Zod-validated)
    O->>QR: (brief, VideoSpec) -> Review{pass, score, issues, fixes}
    alt review fails
        O->>SC: regenerate once with reviewer fixes folded into the brief
    end
    O-->>CLI: { spec, review, attempts }
```

**LLM client** ([src/agents/llm/client.ts](src/agents/llm/client.ts)):
- Selects provider from `LLM_PROVIDER`; reads the key from the environment (never hard-coded).
- `generateJSON({ system, user, schema })` extracts JSON from the reply, validates it with the
  agent's Zod schema, and on failure retries with the validation error appended to the prompt.
- Throws `MissingApiKeyError` with actionable text when no key is present.

**Why some agents are deterministic:** caption timing and final assembly are exact,
mechanical transforms. Implementing them as code (not prompts) removes a class of
LLM failure modes and makes them unit-testable. They remain modeled as `Agent`s so
they can be swapped for LLM implementations later without touching the orchestrator.

## 4. Rendering layer

- [Root.tsx](src/remotion/Root.tsx) registers two `<Composition>`s that differ only in
  `width`/`height` (from [config/pipeline.config.ts](config/pipeline.config.ts)).
- [ProductVideo.tsx](src/remotion/compositions/ProductVideo.tsx) places each scene on the
  timeline via `<Sequence>`, overlays timed captions, and plays music across the whole video.
- [SceneView.tsx](src/remotion/scenes/SceneView.tsx) renders one scene with a spring-based
  enter + fade-out and its `transition` (fade/slide/zoom/none). Type sizes scale off
  `min(width, height)` so the same component looks right in both orientations.
- Components: `Background` (footage or animated gradient), `Captions`, `BrandLogo`
  (image or wordmark), `MusicTrack` (silent until a track is supplied).

## 5. Data flow & lineage

`Brief → Script → {CreativeDirection, MusicPlan, EditPlan} → CaptionCue[] → VideoSpec → MP4`.
Captions can alternatively originate from an external `.vtt` (the Bee Naturals subtitle
pipeline) via `npm run prep:captions`, which parses the file with
[src/captions/vtt.ts](src/captions/vtt.ts) and inlines cues into the spec.

## 6. Dependencies

| Dependency | Role |
|---|---|
| `remotion`, `@remotion/cli` | rendering engine + Studio/CLI |
| `@remotion/google-fonts`, `@remotion/zod-types` | fonts; `zColor` for schema-driven color controls |
| `zod` | the `VideoSpec` contract + all agent I/O validation |
| `@anthropic-ai/sdk`, `openai` | interchangeable LLM providers |
| `commander`, `dotenv` | CLI + env loading |
| `tsx` | run the TypeScript CLIs without a build step |

## 7. Security considerations

| Area | Note |
|---|---|
| API keys | Read only from env (`.env` is git-ignored). Never logged or committed. |
| Copyrighted media | `.gitignore` excludes `*.mp3/*.wav/*.mp4/*.mov`; only sample `.vtt` and JSON are committed. |
| LLM output | Never `eval`'d — only parsed as JSON and validated by Zod before use. |
| Prompt-injection surface | Briefs are operator-authored today; treat any third-party brief text as untrusted input. |
| Renders | Remotion runs headless Chromium locally; no spec data leaves the machine during rendering. |

## 8. Scalability & extension

- **Batch:** wrap `runPipeline` in a queue worker to process many briefs concurrently; specs and renders are independent and parallelizable.
- **Rendering at scale:** use `@remotion/renderer` programmatically or Remotion Lambda for horizontal, serverless renders.
- **New formats:** add a `<Composition>` (e.g. 1:1) — scenes already adapt responsively.
- **Richer transitions:** adopt `@remotion/transitions` inside `ProductVideo`.
- **Caching:** memoize agent outputs by a hash of the brief to avoid re-spending tokens.

## 9. Testing

Deterministic units are covered by Vitest (no API key required):
- `tests/vtt.test.ts` — timestamp parsing, cue extraction, active-cue lookup.
- `tests/video-spec.test.ts` — schema defaults, sample-spec validity, duration math.
- `tests/assembler.test.ts` — caption timing + duration normalization in `assembleVideoSpec`.

CI ([.github/workflows/ci.yml](.github/workflows/ci.yml)) runs typecheck + lint + tests
on Node 20. Rendering is intentionally excluded from CI (it needs a browser download).
