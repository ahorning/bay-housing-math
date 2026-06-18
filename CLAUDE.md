# CLAUDE.md

Context for working on this repo with Claude Code.

## What this is

A buy-vs-rent calculator for the SF East Bay, built as a **single self-contained
`index.html`**. No build step, no framework, no package manager. The only external
dependency is Chart.js loaded from a CDN. Open the file in a browser and it runs.

Do not introduce a build system, bundler, or framework unless explicitly asked. The
zero-dependency, single-file architecture is a deliberate constraint — it's what makes
the thing trivially hostable on GitHub Pages and easy to reason about.

## How to make changes

**Prefer targeted edits over rewrites.** The file is ~1,300 lines. When changing
something, find the specific lines and edit them surgically — do not regenerate the whole
file. Full rewrites lose subtle hand-tuned details and make diffs unreadable. This is the
established workflow and should be maintained.

After any change, sanity-check that the calculation still runs (open in a browser; the
chart should render without console errors).

## Code shape

- A single `state` object holds all inputs. `DEFAULT` defines initial values; `PRESETS`
  is an array of named configurations.
- `generateData(...)` computes the 30-year cost curves. **It destructures many fields off
  `state`.** When you add a new state field that the calculation uses, you MUST add it to
  that destructuring — a missing field throws a silent `ReferenceError` that breaks the
  chart with no obvious cause. (This has bitten us before, e.g. a missing `investCgTax`.)
- `updateUI()` redraws everything. Sliders bind via `data-key` attributes.
- Persistence: `localStorage` for save/load, plus the current config encodes into the URL
  hash for shareable links.

## Design principles (don't violate without asking)

- **Complex features are OFF by default.** Investment return starts at 0%, "invest the
  difference" is unchecked, tax benefits are off (section visible), refinance is off. The
  goal is a calm first view for a first-time user, with depth available on demand. Don't
  silently flip these on.
- **Plain language in the UI.** Spell things out — "mortgage insurance," not "PMI."
- **Key inputs are visually weighted.** Home price and monthly rent are larger than the
  rest. Sliders show both percentage and dollar value where it helps.
- The mortgage stats bar sits **above** the chart, where it's contextually relevant.

## Domain notes

- **Prop 13 is the whole point.** California assesses property tax at purchase price and
  caps assessed-value growth at 2%/yr — it does NOT track market appreciation. The
  `prop13` flag in `generateData` handles this. Generic calculators get this wrong; this
  one shouldn't.
- Presets are calibrated to real East Bay conditions (Oakland/Berkeley/Rockridge-Piedmont
  price points, local insurance costs reflecting wildfire risk). If you update them, keep
  them grounded in current market data, not round-number guesses.
