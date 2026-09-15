/* ============================================================================
   WORK — the single source of truth for everything on this site.

   TO ADD A NEW DASHBOARD, append one object to the WORK array below.
   Nothing else needs editing. The hero picker, the numbered capability strip,
   the bento gallery, the case-study inspector and the ⌘K search all build
   themselves from this list, in this order.

   Only `id`, `label`, `title` and `blurb` are required. Everything else is
   optional — leave a field out and that part of the UI quietly omits it
   (e.g. no `dash` means no "Live ↗" button, so work-in-progress is fine).

   FIELD REFERENCE
     id        unique slug, no spaces                        (required)
     label     short domain name for the pill + strip         (required)
     title     full project title                             (required)
     blurb     one line for the capability strip              (required)
     span      bento tile width: 's2' | 's3' | 's4'           (default 's3')
     chart     mini-visual: 'scatter'|'bars'|'line'|'treemap'|'area'
     cat       category line on the tile
     csub      data-source line under the tile title
     kpi       headline number
     kpiSub    what the number measures
     dash      path to the live dashboard
     repo      source link for this project
     accent    CSS var for the inspector accent colour
     hero      { headline, num, numLbl, pct, center, sub } for the hero panel
     market    why this question matters (inspector)
     arch      array of build/method bullet points (inspector)
     metric    the headline finding, in one sentence (inspector)
     tags      array of skill tags (inspector)
============================================================================ */

const WORK = [
  {
    id: 'churn',
    label: 'FinTech & Retention',
    title: 'Australian Business Churn',
    blurb: 'Business churn: entries, exits and survival, ABS data.',
    span: 's4',
    chart: 'scatter',
    cat: 'FinTech · Retention · Open Data',
    csub: 'ABS entries, exits & survival',
    kpi: '13.8%',
    kpiSub: 'annual exit rate',
    dash: 'dashboards/churn.html',
    repo: 'https://github.com/GauravWarke/churn-revenue-risk-platform',
    accent: 'var(--rose)',
    hero: {
      headline: 'Reads business churn at the scale of a whole economy: who opens, who closes, who survives.',
      num: '13.8%', numLbl: 'annual exit (churn) rate',
      pct: 68, center: '68.1%', sub: 'SURVIVE 3Y'
    },
    market: 'Attrition is the quiet killer of value: the same retention question a bank or SaaS firm asks of its customers, asked here of a whole economy. About 1 in 7 Australian businesses exits every year, and 68.1% survive to year three.',
    arch: [
      'Parses ABS datacube 8165DC01.xlsx directly: entries, exits and survival by state and industry.',
      'Frames exits as a churn rate and entries as gross adds to read the net movement of the base.',
      'Segments survival by industry and state, from Agriculture at 74.5% down to Transport at 47.3%, to locate where retention effort pays.',
      'Presents the takeaway in plain English first, with the interactive detail underneath.'
    ],
    metric: '375,331 exits (13.8%) against 460,461 entries in 2025-26, a net +85,130; 68.1% of businesses reach year three and 61.9% reach year four.',
    tags: ['ABS Open Data', 'Python', 'SQL', 'Retention Analytics', 'Data Storytelling']
  },
  {
    id: 'mpi',
    label: 'Data & BI',
    title: 'Government Ad Spend',
    blurb: 'Government advertising spend: channels, trends, states.',
    span: 's2',
    chart: 'bars',
    cat: 'Data & BI · Media',
    csub: 'Commonwealth + state open data',
    kpi: '$250.6M',
    kpiSub: 'ad spend analysed',
    dash: 'dashboards/market.html',
    repo: 'https://github.com/GauravWarke/market-performance-intelligence',
    accent: 'var(--blue)',
    hero: {
      headline: 'Tracks where government advertising money actually goes, and how fast it is shifting to digital.',
      num: '$250.6M', numLbl: 'gov ad spend, 2023-24',
      pct: 44, center: '44%', sub: 'DIGITAL'
    },
    market: 'Public advertising money is scrutinised but rarely made legible. This unifies the Commonwealth and state advertising reports to show how much governments spend reaching citizens, on which media, and how fast the mix is shifting to digital.',
    arch: [
      'Ingests the Dept of Finance campaign-advertising reports plus NSW and QLD open data.',
      'Splits placement vs development and breaks media down by real channel: digital, TV, radio, out-of-home, cinema, press.',
      'Adds a cross-jurisdiction comparison so Commonwealth and state spend read on one scale.',
      'Leads with a plain-English takeaway for non-technical readers.'
    ],
    metric: '$250.6M total in 2023-24 ($173.8M placed in media); digital is now 44% of the media budget, ahead of television.',
    tags: ['Open Data', 'Data & BI', 'Media Analytics', 'Data Storytelling']
  },
  {
    id: 'demand',
    label: 'Supply Chain',
    title: 'Australian Retail Demand',
    blurb: 'Retail demand by category and state, ABS turnover.',
    span: 's3',
    chart: 'line',
    cat: 'Supply Chain · Demand',
    csub: 'ABS retail turnover',
    kpi: '$37.9bn',
    kpiSub: 'monthly demand',
    dash: 'dashboards/demand.html',
    repo: 'https://github.com/GauravWarke/demand-supply-risk-forecasting',
    accent: 'var(--emerald)',
    hero: {
      headline: 'Reads national retail demand: what Australians are buying, by category and by state, each month.',
      num: '$37.9bn', numLbl: 'monthly retail turnover',
      pct: 80, center: '+4.9%', sub: 'YEAR ON YEAR'
    },
    market: 'Demand is the signal under every inventory and staffing call. This reads the ABS retail turnover series to show what Australians are actually spending, by category and by state, and where the mix is rotating.',
    arch: [
      'Pulls the ABS Retail Trade release: seasonally adjusted turnover, real monthly readings.',
      'Reconciles the category split (food, household goods, cafés and the rest) exactly to the national total.',
      'Tracks a rolling trend and month-on-month growth by state.',
      'Surfaces the takeaway in plain language ahead of the interactive detail.'
    ],
    metric: '$37.9bn in June 2025, +4.9% year on year; household goods rising (+2.3%) while cafés & takeaway slipped (-0.4%).',
    tags: ['ABS Open Data', 'Forecasting', 'Supply Chain', 'Data Storytelling']
  },
  {
    id: 'reconciliation',
    label: 'Public Finance',
    title: 'GST Reconciliation',
    blurb: 'How the national GST pool is reconciled to the states.',
    span: 's3',
    chart: 'treemap',
    cat: 'Public Finance · FinTech',
    csub: 'CGC state distribution',
    kpi: '$102bn',
    kpiSub: 'GST pool',
    dash: 'dashboards/reconciliation.html',
    repo: 'https://github.com/GauravWarke/expense-reconciliation-engine',
    accent: 'var(--teal)',
    hero: {
      headline: 'Shows how the national GST pool is reconciled out to the states by need, not by where it was raised.',
      num: '$102bn', numLbl: 'GST pool reconciled',
      pct: 100, center: '8', sub: 'STATES'
    },
    market: 'GST is one national pool, reconciled out to eight states and territories by need, not by where it was raised. It is the fairness mechanism sitting under the federation, and it is rarely shown clearly.',
    arch: [
      'Uses the Commonwealth Grants Commission distribution figures for all eight states and territories.',
      'Reconciles each jurisdiction’s share against the total pool so the split is legible on one scale.',
      'Tracks the pool’s growth over time and flags the legislated WA 0.75 relativity floor.',
      'Explains horizontal fiscal equalisation in plain English before the interactive detail.'
    ],
    metric: '≈$102bn reconciled in 2026-27: Victoria $27.9bn and NSW $26.1bn lead, while the NT receives $5.1bn for under a million people.',
    tags: ['Open Data', 'Public Finance', 'FinTech', 'Data Storytelling']
  }
];

/* Derived lookups used by site.js — do not edit, these follow WORK. */
const WORK_BY_ID = WORK.reduce(function (m, w) { m[w.id] = w; return m; }, {});
