<div align="center">

# Cash Mechanics

### The vocabulary of money, made touchable.

A live field guide to the **20 numbers investors actually read**: CAC, LTV, Rule of 40, burn multiple, runway and more. Drag a slider and watch the gauge, the formula and the diagram move together.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Dependencies](https://img.shields.io/badge/dependencies-none-2f8f79)
![Build](https://img.shields.io/badge/build_step-none-2f8f79)

</div>

---

## Table of contents

1. [The idea](#the-idea)
2. [What it does](#what-it-does)
3. [The 20 metrics](#the-20-metrics)
4. [How it works](#how-it-works)
5. [Tech stack](#tech-stack)
6. [Project structure](#project-structure)
7. [Run it locally](#run-it-locally)
8. [Add your own metric](#add-your-own-metric)
9. [Design notes](#design-notes)
10. [Limitations](#limitations)
11. [Roadmap](#roadmap)

---

## The idea

Startup and finance jargon is usually taught as a glossary: a definition, a formula, done. That's the wrong way round. Nobody feels what "burn multiple" means from a sentence, but the moment you drag *net burn* up and *new ARR* down and watch the gauge go red, it clicks.

Cash Mechanics treats every metric as a small machine with **inputs → formula → result → picture**. You operate the machine instead of reading about it.

Each card also answers the three questions a glossary skips:

- **Touchpoint**: what real business activity does this number measure?
- **Watch out**: how does this number get flattered or misread?
- **Benchmark**: what does "good" look like, if anything?

## What it does

- Shows **20 metrics in 5 sections**, each as an interactive card.
- Every card has **live sliders**. Changing an input recalculates the result instantly.
- Each card renders **four things at once**: a gauge, the formula with your numbers substituted in, an SVG diagram of the mechanism, and plain-English notes.
- A **navigation pill bar** and a colour-coded legend jump you between sections.
- Respects `prefers-reduced-motion` for users who don't want animation.
- Runs **entirely in the browser** with no server and no dependencies.

## The 20 metrics

| Section | Metrics |
|---|---|
| **Unit Economics** | CAC, LTV, CAC Payback, Magic Number |
| **Growth & Revenue** | ARR, Net Dollar Retention, Revenue Churn, Rule of 40 |
| **Margins & Efficiency** | Gross Margin, Contribution Margin, Burn Multiple |
| **Cash Mechanics** | Runway, Cash Conversion Cycle, DSO, DPO, DIO, Working Capital, Negative Working Capital, Deferred Revenue Float |
| **Accounting Lens** | Cash vs Accrual |

A taste of the formulas built in:

```text
CAC      = sales + marketing spend ÷ new customers won
LTV      = ARPA × gross margin ÷ monthly churn
```

## How it works

The whole page is **data-driven**. There is almost no hand-written HTML for the cards. `script.js` holds a `METRICS` array, and a small render engine turns each entry into a card.

Each metric is one JavaScript object:

```js
{
  id: 'cac', section: 'unit', name: 'CAC', sub: 'Customer Acquisition Cost',
  inputs: [ { key:'spend', label:'Sales + marketing spend', type:'range',
              min:10000, max:200000, step:5000, def:50000, fmt:money }, ... ],
  compute:  v => ({ value, text, gaugeFrac }),   // the maths
  formula:  (v, c) => `CAC = ${money(v.spend)} ÷ ${num(v.newCust)} = ${c.text}`,
  diagram:  (v, c) => flowDiagram([...], '1 customer', c.text),  // SVG
  notes:    { touchpoint, watch, benchmark },
  caption:  'Everything you spent to get one stranger to say yes.'
}
```

**The render loop:**

1. `SECTIONS` and `METRICS` are read on page load.
2. For every metric, `cardMarkup()` builds the card, and `fieldMarkup()` builds one slider per input.
3. `wireCard()` attaches `input` listeners to the sliders.
4. On every slider move, `updateCard()` calls `compute()`, then redraws the gauge, the formula string and the SVG diagram.
5. State for every card lives in a single `state` object, keyed by metric id.

**The diagrams** are generated SVG, not images. A small library of reusable diagram builders draws them from the numbers:

| Builder | Used for |
|---|---|
| `flowDiagram` | Many sources merging into one output (CAC) |
| `renewalStrip` | Renewal ticks with an X where the customer churns (LTV) |
| `multiplyDiagram` | Small bar → ×N → big bar |
| `timelineDiagram` | Bracketed day spans that can go negative (payback, DSO/DPO) |
| `cccDiagram` | The cash conversion cycle: days cash is tied up vs days suppliers cover |
| `stockCompare` | Two stacked bars with a delta bracket |
| `tankDiagram` | A tank filling or draining (runway) |
| `compareDiagram` | Cash vs accrual timelines side by side |
| `gaugeMarkup` | The three-quarter-ring gauge on every card |

Because the diagrams are functions of the inputs, they redraw on every slider tick with no canvas and no chart library.

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Markup | HTML5 | One static page, no framework needed |
| Styling | CSS3 with custom properties | Section colour-coding and a consistent theme |
| Logic | Vanilla JavaScript (ES6) | Small enough that a framework would cost more than it saves |
| Graphics | Inline generated SVG | Crisp at any size, animatable, no assets to load |
| Type | Archivo, IBM Plex Sans, IBM Plex Mono (Google Fonts) | Editorial headlines, readable body, monospaced numbers |

No npm, no bundler, no CDN scripts. The only network request is the font stylesheet.

## Project structure

```text
cash-mechanics/
├── index.html   # page shell: hero, nav pills, empty #sections container
├── styles.css   # theme, layout, card and gauge styling, reduced-motion rules
├── script.js    # helpers, diagram builders, METRICS data, render engine
└── README.md
```

## Run it locally

No build step.

```bash
git clone https://github.com/4pfanas/cash-mechanics.git
cd cash-mechanics
open index.html          # macOS; or just double-click the file
```

Or serve it if you prefer:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Add your own metric

Because the page is data-driven, a new metric is one object in `METRICS` in `script.js`:

1. Pick a `section` id from `SECTIONS`.
2. Define `inputs` (each slider needs `key`, `label`, `min`, `max`, `step`, `def`, `fmt`).
3. Write `compute(v)` returning `{ value, text, gaugeFrac }`.
4. Write `formula(v, c)` and choose or write a `diagram(v, c)`.
5. Fill in `notes` and `caption`.

Save and refresh. The card, the nav entry and the wiring appear automatically.

## Design notes

- **Colour by section.** Each of the five sections has its own accent (`SEC_COLORS`), so you always know which family of metric you're in.
- **One source of truth per card.** The formula string is built from the same numbers the gauge uses, so the words and the picture can never disagree.
- **Honest framing.** The page states that all figures are illustrative, and that a few metrics (CAC, NDR, churn) have common variants. Always check the exact definition your board or investors use.

## Limitations

- Figures are illustrative, not financial advice.
- Formulas are the standard textbook definitions, not company-specific variants.
- Currency is fixed to USD.
- No saving of slider positions between visits.

## Roadmap

- [ ] Shareable URLs that encode slider positions
- [ ] "Compare two companies" mode
- [ ] Light and dark theme toggle
- [ ] More metrics: gross retention, quick ratio, Rule of 40 variants
- [ ] Export a card as an image for sharing

---

<div align="center">

Built by **[Anas Aslam](https://github.com/4pfanas)** · Made to make finance feel less like jargon.

</div>
