# Bay Housing Math

A buy-vs-rent calculator for the San Francisco East Bay. It models the *true* long-run
cost of buying a home against renting and investing the difference — with the local tax
rules that generic online calculators get wrong.

**Live:** https://ahorning.github.io/bay-housing-math/

## What it models

- **30-year cost curves** — net cost of buying (after sale proceeds) vs. cumulative rent,
  drawn with Chart.js. A "years to stay" slider moves a reference line so you can read
  the crossover point for any horizon without redrawing.
- **California Prop 13** — property tax is assessed at *purchase price* and capped at 2%/yr
  growth, not pegged to market appreciation. This is the single biggest thing most
  calculators miss, and it materially changes the long-horizon math. Toggle off to model
  other states.
- **Invest the difference** — when buying costs more month-to-month, the renter can invest
  the gap at a configurable return; optionally taxes the gains at sale.
- **Tax benefits** — mortgage interest deduction (with SALT cap by filing status),
  capital gains exclusion on sale, and federal long-term cap gains modeling.
- **One-time refinance** — pick a future year and rate; the payment recomputes from there.
- **Gone-forever vs. recoverable** breakdown panels for both scenarios, plus a summary table.

## Presets (East Bay–calibrated)

| Preset | Home price | Notes |
|---|---|---|
| East Bay starter | $1.0M | 10% down, mortgage insurance, $3,800 rent |
| Berkeley / hills | $1.5M | 20% down, $400/mo insurance (wildfire), $5,000 rent |
| Rockridge / Piedmont | $1.8M | 20% down, higher appreciation, longer default horizon |
| Alameda | $1.25M | 20% down, older housing stock (higher maintenance), $3,600 rent |
| Livermore | $1.15M | 20% down, Mello-Roos (1.35% tax), $3,800 rent |

All presets use a 5.8% mortgage rate, matching the default. Defaults are otherwise
deliberately conservative: investment return is 0%, "invest the difference" and tax
benefits are off, and refinance is off — so the first view isn't overwhelming. Turn
features on as you need them.

## Running it

It's a single self-contained HTML file. Just open `index.html` in a browser — no build
step, no install. The only external dependency is Chart.js from a CDN.

Every slider value is also click-to-edit — click the number to type an exact figure
(`1.4m`, `375k`, `5.8%`, `$2,800` all work). Light and dark themes follow your OS setting.

State persists to `localStorage`, and the current configuration encodes into the URL hash
so you can share a specific scenario by copying the link.

## Deploying

Served from GitHub Pages off the `main` branch (root) at the live URL above — pushing to
`main` redeploys automatically. To change the source: Settings → Pages.

## Caveats

This is a decision aid, not financial advice. It can't know your actual marginal rates,
future market returns, or whether you'll really stay the horizon you pick — those
assumptions drive the result more than anything the tool computes.
