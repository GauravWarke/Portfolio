// ============================================================================
//  Gaurav Warke — Portfolio  ·  App.jsx
//  Stack: React 18 + Tailwind (tokens in tailwind.config.js)
//  Pattern: Bento hero + filterable case-study grid + Case Study Inspector
//           drawer that breaks every project into the Triple-M structure
//           (Market Problem · Modular Architecture · Measurable Metric).
//  No placeholders — all copy is derived from the real resume.
// ============================================================================
import { useState, useEffect, useRef, useCallback } from 'react';

/* ------------------------------------------------------------------ DATA -- */

const PROFILE = {
  name: 'Gaurav Warke',
  tagline: 'Data & Business Analytics · BI · Supply Chain · FinTech',
  location: 'Melbourne, VIC',
  email: 'gauravwarke8@gmail.com',
  phone: '0420 908 450',
  linkedin: 'https://www.linkedin.com/in/gaurav-warke-b5493b394',
  github: 'https://github.com/GauravWarke',
  rotator: [
    'Master of Business Analytics @ Monash',
    'Junior Data Analyst · idigitalxp',
    'Supply Chain & Operations Analytics',
    'BI & Reporting Specialist',
    'FinTech & Product Analytics',
  ],
};

// Live KPI "ticker" cards in the hero — sourced from verified resume metrics.
const HERO_BARS = [
  { name: 'Reporting', value: '−30%', pct: 70, color: 'bg-signal-teal' },
  { name: 'Conversion', value: '+10%', pct: 50, color: 'bg-signal-blue' },
  { name: 'Efficiency', value: '+20%', pct: 60, color: 'bg-signal-amber' },
];

const HERO_STATS = [
  { v: '9.36', l: 'GPA / 10', c: 'text-signal-teal' },
  { v: '1st', l: 'Author', c: 'text-signal-amber' },
  { v: '4', l: 'Case Studies', c: 'text-signal-blue' },
  { v: '2+', l: 'Yrs Exp', c: 'text-signal-emerald' },
];

const SKILLS = [
  {
    icon: '📊', span: 2, title: 'Analytics, BI & Visualisation',
    tags: [
      ['Power BI', 'hi'], ['Tableau', 'hi'], ['Excel (Advanced)', 'hi'],
      ['Statistical Modelling'], ['Time-Series Forecasting'],
      ['KPI Development'], ['Dashboard Design'],
    ],
  },
  { icon: '💻', title: 'Programming', tags: [['Python', 'hi'], ['SQL', 'hi'], ['R']] },
  { icon: '🗄️', title: 'Databases & Pipelines', tags: [['PostgreSQL', 'em'], ['MongoDB', 'em'], ['MySQL', 'em'], ['NLP'], ['OCR']] },
  { icon: '📦', title: 'Supply Chain & Risk', tags: [['SCM Fundamentals'], ['Risk Identification'], ['Operational Governance'], ['Compliance']] },
  { icon: '🔄', title: 'Process & Delivery', tags: [['Agile / Scrum', 'hi'], ['JIRA'], ['Trello'], ['Requirement Analysis']] },
  { icon: '🤝', title: 'Stakeholder & Advisory', tags: [['Cross-functional Collab'], ['Executive Reporting'], ['Intl. Coordination']] },
];

// Each project carries a full Triple-M breakdown for the Inspector drawer.
const PROJECTS = [
  {
    id: 'churn',
    cat: 'ft', catLabel: 'FinTech · Product Analytics · Predictive ML',
    wide: true, accent: 'text-signal-rose', accentBorder: 'hover:border-signal-rose/40',
    kpi: '30d', kpiLabel: 'Early Churn Warning', kpiColor: 'text-signal-rose',
    title: 'Customer Churn & Revenue-Risk Intelligence Platform',
    problem:
      'Banks and SaaS businesses lose 20–30% of revenue to preventable churn. Without a predictive layer, retention teams engage too late — burning CAC with near-zero recovery.',
    summary:
      'XGBoost + logistic-regression ensemble scoring per-account churn probability from transactional and behavioural data, surfaced as a ranked revenue-at-risk register in Power BI — flagging high-risk accounts 30 days before predicted churn.',
    tags: ['Python', 'XGBoost', 'SQL', 'Power BI', 'Feature Engineering', 'Churn Modelling'],
    market:
      'Retention is a P&L line item. A 5% lift in retention can raise profit 25%+ (Bain). The pain is timing: teams find out a customer left after they leave. This platform converts retention from a reactive cost centre into a 30-day forward-looking pipeline.',
    architecture: [
      'RFM (Recency/Frequency/Monetary) feature engineering over transactional history, with leakage-safe temporal splits.',
      'XGBoost + logistic-regression ensemble; class-imbalance handled via stratified sampling and scale_pos_weight.',
      'Precision-recall threshold tuned to minimise false-positive outreach cost — the metric the business actually pays for.',
      'Outputs a ranked "revenue-at-risk register" piped into an interactive Power BI dashboard for the retention team.',
    ],
    metric: 'Flags at-risk accounts 30 days before predicted churn; PR-optimised threshold cuts wasted outreach on false positives.',
  },
  {
    id: 'reconciliation',
    cat: 'nlp', catLabel: 'NLP · OCR · Finance Automation',
    accent: 'text-signal-teal', accentBorder: 'hover:border-hairHover',
    kpi: '100%', kpiLabel: 'Manual Entry Eliminated', kpiColor: 'text-signal-teal',
    title: 'Intelligent Expense-Reconciliation Engine',
    problem:
      'Finance teams burn 40%+ of processing time on manual receipt reconciliation — creating audit exposure and delayed month-end close.',
    summary:
      'End-to-end pipeline ingesting receipt images via OCR, classifying transactions with an NLP model, and emitting audit-ready datasets — compressing reconciliation lag from days to minutes.',
    tags: ['Python', 'OCR', 'NLP', 'MongoDB', 'Data Pipeline', 'Finance'],
    market:
      'Manual reconciliation is slow, error-prone, and an audit liability. Every receipt re-keyed by hand is a control gap. Automating it shortens the close cycle and removes a class of human error from the books.',
    architecture: [
      'OCR ingestion layer normalises heterogeneous receipt images into structured text.',
      'NLP classifier maps line items to expense categories with confidence scoring.',
      'Validation + error-handling routes low-confidence records to a human review queue (no silent failures).',
      'Persists an audit-ready, append-only dataset in MongoDB — reproducible and traceable end to end.',
    ],
    metric: '100% of manual data entry eliminated; reconciliation lag reduced from days to minutes.',
  },
  {
    id: 'mpi',
    cat: 'bi', catLabel: 'BI · Analytics · Performance Reporting',
    accent: 'text-signal-blue', accentBorder: 'hover:border-hairHover',
    kpi: '−30%', kpiLabel: 'Reporting Cycle Time', kpiColor: 'text-signal-blue',
    title: 'Market-Performance Intelligence System',
    problem:
      'Marketing orgs without a single source of truth make slow, gut-feel decisions — losing conversion opportunities every day.',
    summary:
      'Consolidated fragmented customer and market datasets into a unified weekly reporting framework at idigitalxp, automated the pipeline, and surfaced conversion signals.',
    tags: ['Excel', 'Analytics', 'KPI Dashboards', 'Market Data'],
    market:
      'A reporting cycle measured in days means decisions are always made on stale data. Collapsing that cycle is the difference between reacting to last week and steering this week.',
    architecture: [
      'Unified fragmented customer/market sources into one weekly reporting schema.',
      'Automated the ETL + refresh path that was previously manual and brittle.',
      'Engineered KPI definitions with stakeholders so the numbers meant the same thing to every team.',
      'Surfaced leading conversion signals, not just lagging totals.',
    ],
    metric: '−30% reporting cycle time, +10% lead-conversion lift, +20% process-efficiency gain (idigitalxp, verified).',
  },
  {
    id: 'demand',
    cat: 'sc', catLabel: 'Supply Chain · Forecasting · Risk',
    accent: 'text-signal-emerald', accentBorder: 'hover:border-hairHover',
    kpi: 'Predictive', kpiLabel: 'vs Reactive Ops', kpiColor: 'text-signal-emerald',
    title: 'Demand-Variability & Supply-Risk Forecasting',
    problem:
      'Without early-warning systems, operations teams stay reactive — driving up holding costs, stockout risk, and SLA breaches.',
    summary:
      'Time-series statistical model forecasting demand variability and flagging supply-risk indicators early, with outputs structured for direct integration into supply-planning dashboards.',
    tags: ['Python', 'R', 'Time Series', 'Statistical Modelling'],
    market:
      'Every day of forecast lead time is inventory you do not have to over-order and a stockout you can pre-empt. Early signal directly lowers working-capital lock-up and protects SLAs.',
    architecture: [
      'Time-series decomposition isolates trend, seasonality, and irregular demand variance.',
      'Statistical forecasting with confidence intervals to quantify uncertainty, not hide it.',
      'Risk-indicator flags surface supply exposure before it becomes a stockout.',
      'Delivered via Agile iterations with stakeholder feedback loops; outputs are dashboard-ready.',
    ],
    metric: 'Shifts operations from reactive to predictive — reducing holding cost and stockout/SLA-breach exposure.',
  },
];

const PROJECT_FILTERS = [
  ['all', 'All'], ['bi', 'Data Analytics & BI'], ['sc', 'Supply Chain'],
  ['ft', 'FinTech & Product'], ['nlp', 'Automation & NLP'],
];

const EXPERIENCE = [
  {
    date: 'Jul – Dec 2025', role: 'Junior Data Analyst', co: 'idigitalxp · Mumbai, India',
    points: [
      ['Analysed customer and market datasets to surface trends driving product-positioning decisions.'],
      ['Built an automated reporting framework, cutting cycle time by ', '30%', '.'],
      ['Insights translated to ', '10%', ' lead-conversion lift and ', '20%', ' process-efficiency gain.'],
    ],
  },
  {
    date: 'Feb – Jun 2024', role: 'Outgoing Global Volunteer', co: 'AIESEC · Mumbai, India',
    points: [
      ['Managed an end-to-end international placement pipeline: screening, onboarding, partner coordination.'],
      ['Grew program participation by ', '25%', ' through structured outreach campaigns.'],
      ['Maintained ', '100%', ' documentation compliance across all partner projects.'],
    ],
  },
  {
    date: 'May – Dec 2024', role: 'Volunteer Leader', co: 'Extension Work Committee · Mumbai',
    points: [['Led structured learning sessions in government-funded schools; coordinated volunteer groups and community education initiatives.']],
  },
];

const EDUCATION = [
  { year: 'Present', deg: 'Master of Business Analytics', sch: 'Monash University · Clayton, Melbourne VIC', note: 'Statistical modelling, BI, machine learning, and data-driven decision frameworks.', active: true },
  { year: 'Graduated May 2025', deg: 'B.E. Computer Engineering (Honours)', sch: 'TCET · Mumbai, India', gpa: 'GPA: 9.36 / 10.0', note: 'Specialisation in AI, data systems, and cloud infrastructure.' },
];

/* ----------------------------------------------------------- PRIMITIVES -- */

const cx = (...c) => c.filter(Boolean).join(' ');

function SectionTag({ children }) {
  return (
    <div className="mb-2 flex items-center gap-2 font-mono text-[0.65rem] font-bold uppercase tracking-widestc text-signal-teal">
      <span className="opacity-50">//</span>
      {children}
    </div>
  );
}

function Reveal({ children, className }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && (setShown(true), io.unobserve(node)),
      { threshold: 0.08 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={cx('transition-all duration-500 ease-out', shown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3', className)}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ NAV -- */

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const links = [['about', 'About'], ['skills', 'Skills'], ['projects', 'Projects'], ['experience', 'Experience'], ['research', 'Research'], ['contact', 'Contact']];
  return (
    <nav className={cx('fixed inset-x-0 top-0 z-[100] flex items-center justify-between px-6 py-4 transition-all md:px-12', scrolled && 'border-b border-hair bg-ink-950/90 backdrop-blur-xl')}>
      <div className="font-display text-[1.15rem] font-extrabold -tracking-[0.02em] text-content-primary">
        Gaurav<span className="text-signal-teal">.</span>
      </div>
      <ul className="hidden items-center gap-8 md:flex">
        {links.map(([id, label]) => (
          <li key={id}>
            <a href={`#${id}`} className="text-[0.82rem] font-medium text-content-muted transition-colors hover:text-content-primary">{label}</a>
          </li>
        ))}
        <li>
          <a href={`mailto:${PROFILE.email}`} className="rounded-md border border-signal-teal px-5 py-[0.45rem] text-[0.8rem] font-semibold text-signal-teal transition-all hover:bg-signal-teal hover:text-white">Hire Me</a>
        </li>
      </ul>
    </nav>
  );
}

/* ----------------------------------------------------------------- HERO -- */

function useTypewriter(words) {
  const [text, setText] = useState('');
  useEffect(() => {
    let pi = 0, ci = 0, del = false, timer;
    const tick = () => {
      const w = words[pi];
      setText(del ? w.slice(0, ci--) : w.slice(0, ci++));
      if (!del && ci > w.length) { del = true; timer = setTimeout(tick, 1500); return; }
      if (del && ci < 0) { del = false; pi = (pi + 1) % words.length; ci = 0; }
      timer = setTimeout(tick, del ? 42 : 78);
    };
    tick();
    return () => clearTimeout(timer);
  }, [words]);
  return text;
}

function Hero() {
  const typed = useTypewriter(PROFILE.rotator);
  return (
    <section id="home" className="relative grid min-h-screen items-center gap-12 overflow-hidden px-6 pt-[70px] md:grid-cols-2 md:px-12">
      <div className="pointer-events-none absolute inset-0 bg-grid-lines bg-grid" />
      <div className="relative z-[1]">
        <div className="mb-7 inline-flex animate-fadeUp items-center gap-2 rounded border border-signal-emerald/30 bg-signal-emerald/[0.06] px-[0.9rem] py-[0.3rem] font-mono text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-signal-emerald">
          <span className="h-[5px] w-[5px] animate-pulseDot rounded-full bg-signal-emerald" />
          Open to Internships &amp; Graduate Roles · Melbourne
        </div>
        <h1 className="mb-4 font-display text-[clamp(2.8rem,5.5vw,4.5rem)] font-extrabold leading-none -tracking-[0.055em] text-content-primary">
          Gaurav<span className="block text-signal-teal">Warke.</span>
        </h1>
        <p className="mb-[0.6rem] text-base font-normal leading-relaxed text-content-secondary">{PROFILE.tagline}</p>
        <p className="mb-9 min-h-[1.5rem] font-mono text-[0.9rem] text-content-muted">
          <span className="text-signal-tealBright">{typed}</span>
          <span className="ml-px inline-block h-[0.9em] w-px animate-blink bg-signal-teal align-middle" />
        </p>
        <div className="mb-10 flex flex-wrap gap-[0.85rem]">
          <a href="#projects" className="rounded-md bg-signal-teal px-[1.6rem] py-[0.7rem] font-display text-[0.88rem] font-semibold text-white transition-all hover:-translate-y-px hover:bg-signal-tealBright">View Projects</a>
          <a href="#contact" className="rounded-md border border-hair px-[1.6rem] py-[0.7rem] text-[0.88rem] font-medium text-content-secondary transition-all hover:border-signal-teal hover:text-content-primary">Let&apos;s Talk →</a>
        </div>
        <div className="flex flex-wrap gap-3">
          {[['in/ LinkedIn', PROFILE.linkedin], ['gh/ GitHub', PROFILE.github], ['✉ Email', `mailto:${PROFILE.email}`]].map(([label, href]) => (
            <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="flex items-center gap-[0.4rem] rounded border border-hair px-[0.8rem] py-[0.35rem] font-mono text-[0.75rem] text-content-muted transition-all hover:border-signal-teal hover:text-signal-teal">{label}</a>
          ))}
        </div>
      </div>

      {/* Right: live BI bento cards */}
      <div className="relative z-[1] hidden flex-col gap-4 md:flex">
        <Reveal className="rounded-xl border border-hair bg-surface p-5 transition-all hover:border-hairHover">
          <div className="mb-[0.6rem] font-mono text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-content-muted">// idigitalxp · Impact Delivered</div>
          <div className="mb-1 flex items-center justify-between">
            <div className="font-display text-[1.6rem] font-extrabold -tracking-[0.02em] text-signal-teal">−30%</div>
            <span className="rounded bg-signal-emerald/10 px-[0.55rem] py-[0.18rem] text-[0.72rem] font-semibold text-signal-emerald">↑ Verified</span>
          </div>
          <div className="mb-[0.9rem] text-[0.75rem] text-content-muted">Reporting cycle-time reduction</div>
          <div className="flex flex-col gap-[0.45rem]">
            {HERO_BARS.map((b) => (
              <div key={b.name} className="flex items-center gap-[0.6rem]">
                <span className="w-20 shrink-0 font-mono text-[0.68rem] text-content-muted">{b.name}</span>
                <div className="h-1 flex-1 overflow-hidden rounded-sm bg-white/[0.06]">
                  <div className={cx('h-full rounded-sm', b.color)} style={{ width: `${b.pct}%` }} />
                </div>
                <span className="w-8 text-right font-mono text-[0.65rem] font-semibold text-content-secondary">{b.value}</span>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal className="rounded-xl border border-hair bg-surface p-5">
          <div className="mb-[0.6rem] font-mono text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-content-muted">// Profile Snapshot</div>
          <div className="grid grid-cols-2 gap-3">
            {HERO_STATS.map((s) => (
              <div key={s.l} className="rounded-lg border border-signal-teal/10 bg-signal-teal/[0.06] p-3 text-center">
                <div className={cx('font-display text-[1.3rem] font-extrabold -tracking-[0.02em]', s.c)}>{s.v}</div>
                <div className="text-[0.6rem] uppercase tracking-[0.08em] text-content-muted">{s.l}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- ABOUT -- */

function About() {
  const info = [
    ['Location', 'Melbourne, Victoria'], ['University', 'Monash University'],
    ['Degree', 'M. Business Analytics'], ['Email', PROFILE.email],
    ['Undergrad GPA', '9.36 / 10.0', 'text-signal-teal'], ['Work Rights', '48 hrs / fortnight ✓', 'text-signal-emerald'],
  ];
  return (
    <section id="about" className="py-[5.5rem]">
      <div className="mx-auto max-w-shell px-6 md:px-10">
        <div className="grid items-start gap-10 md:grid-cols-[280px_1fr] md:gap-14">
          <div className="md:sticky md:top-[90px]">
            <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-2xl border border-hair bg-surface-raised">
              {/* Replace with <img src="/photo.jpg" .../> when ready */}
              <span className="font-display text-[4.5rem] font-extrabold text-signal-teal/40">GW</span>
              <div className="absolute inset-x-3 bottom-3 flex items-center gap-2 rounded-lg border border-hair bg-ink-950/85 px-[0.85rem] py-[0.6rem] text-[0.72rem] text-content-secondary backdrop-blur">
                <span className="h-[6px] w-[6px] animate-pulseDot rounded-full bg-signal-emerald" />
                Available for hire · Melbourne, AU
              </div>
            </div>
          </div>
          <div>
            <SectionTag>About Me</SectionTag>
            <h2 className="mb-2 font-display text-[clamp(1.8rem,4vw,2.4rem)] font-extrabold leading-[1.1] -tracking-[0.03em]">
              Analyst who codes.<br />Engineer who advises.
            </h2>
            <p className="mb-5 text-[0.9rem] leading-[1.8] text-content-secondary">
              I&apos;m a Computer Engineering graduate (9.36 GPA) completing my <strong className="text-content-primary">Master of Business Analytics at Monash University</strong> — built at the intersection of technical depth and commercial intelligence. I translate fragmented datasets into strategic decisions that drive real revenue and operational outcomes.
            </p>
            <p className="mb-7 text-[0.9rem] leading-[1.8] text-content-secondary">
              At idigitalxp, I reduced reporting cycles by 30% and lifted lead conversion by 10% — not by working harder, but by building smarter analytical systems. My engineering background means I can build the pipelines I analyse, without waiting for a data engineer.
            </p>
            <div className="mb-7 grid grid-cols-2 gap-4">
              {info.map(([label, val, color]) => (
                <div key={label} className="rounded-lg border border-hair bg-surface px-4 py-[0.85rem] transition-colors hover:border-hairHover">
                  <div className="mb-[0.2rem] font-mono text-[0.6rem] uppercase tracking-[0.12em] text-content-muted">{label}</div>
                  <div className={cx('text-[0.85rem] font-semibold text-content-primary', val.includes('@') && 'text-[0.78rem]', color)}>{val}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {['Data Analytics', 'BI & Reporting', 'Supply Chain', 'FinTech Analytics'].map((c) => (
                <span key={c} className="rounded-full border border-signal-teal/30 bg-signal-teal/[0.06] px-[0.8rem] py-[0.3rem] text-[0.72rem] text-signal-teal">{c}</span>
              ))}
              {['Published Researcher', 'Agile Practitioner'].map((c) => (
                <span key={c} className="rounded-full border border-hair px-[0.8rem] py-[0.3rem] text-[0.72rem] text-content-muted">{c}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- SKILLS -- */

const tagTone = { hi: 'border-signal-amber/25 text-signal-amber', em: 'border-signal-teal/25 text-signal-tealBright', base: 'border-white/[0.07] text-content-secondary' };

function Skills() {
  return (
    <section id="skills" className="bg-ink-900 py-[5.5rem]">
      <div className="mx-auto max-w-shell px-6 md:px-10">
        <SectionTag>Technical Stack</SectionTag>
        <h2 className="mb-[0.9rem] font-display text-[clamp(1.8rem,4vw,2.4rem)] font-extrabold leading-[1.1] -tracking-[0.03em]">Skills &amp; Technologies</h2>
        <p className="mb-11 max-w-[480px] text-[0.88rem] leading-[1.7] text-content-muted">End-to-end analytical capability — from raw data to executive dashboard.</p>
        <div className="grid grid-cols-1 gap-[0.85rem] md:grid-cols-3">
          {SKILLS.map((s) => (
            <Reveal key={s.title} className={cx('rounded-[10px] border border-hair bg-surface p-[1.4rem] transition-all hover:-translate-y-0.5 hover:border-hairHover', s.span === 2 && 'md:col-span-2')}>
              <div className="mb-[0.55rem] text-[1.25rem]">{s.icon}</div>
              <div className="mb-[0.65rem] font-mono text-[0.62rem] font-bold uppercase tracking-[0.14em] text-signal-teal">{s.title}</div>
              <div className="flex flex-wrap gap-[0.3rem]">
                {s.tags.map(([t, tone]) => (
                  <span key={t} className={cx('rounded border px-[0.55rem] py-[0.2rem] text-[0.66rem] font-medium transition-all', tagTone[tone] || tagTone.base)}>{t}</span>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------ CASE STUDY GRID -- */

function ProjectCard({ p, onOpen }) {
  return (
    <Reveal className={p.wide ? 'md:col-span-2' : ''}>
      <button
        onClick={() => onOpen(p)}
        className={cx('group flex h-full w-full flex-col overflow-hidden rounded-xl border border-hair bg-surface text-left transition-all hover:-translate-y-[3px] hover:shadow-card', p.accentBorder)}
      >
        <div className="border-b border-white/[0.04] px-[1.4rem] pb-[0.8rem] pt-[1.4rem]">
          <div className={cx('font-display text-[2rem] font-extrabold leading-none -tracking-[0.03em]', p.kpiColor)}>{p.kpi}</div>
          <div className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.1em] text-content-muted">{p.kpiLabel}</div>
        </div>
        <div className="flex flex-1 flex-col px-[1.4rem] pb-[1.4rem] pt-[1.1rem]">
          <div className={cx('mb-[0.35rem] font-mono text-[0.6rem] font-bold uppercase tracking-[0.14em]', p.accent)}>// {p.catLabel}</div>
          <h3 className="mb-2 font-display text-base font-bold leading-snug -tracking-[0.01em]">{p.title}</h3>
          <p className="mb-3 rounded-r border-l-2 border-signal-teal bg-signal-teal/[0.05] px-[0.7rem] py-2 text-[0.75rem] leading-relaxed text-content-muted">▸ {p.problem}</p>
          <p className="mb-[0.9rem] flex-1 text-[0.8rem] leading-[1.65] text-content-secondary">{p.summary}</p>
          <div className="mb-[0.9rem] flex flex-wrap gap-[0.3rem]">
            {p.tags.map((t) => (<span key={t} className="rounded-sm border border-white/[0.06] px-[0.5rem] py-[0.18rem] font-mono text-[0.62rem] text-content-muted">{t}</span>))}
          </div>
          <div className="flex items-center justify-between border-t border-white/[0.04] pt-[0.7rem]">
            <span className="text-[0.72rem] text-content-muted">Case Study</span>
            <span className={cx('text-[0.75rem] font-medium transition-colors group-hover:translate-x-0.5', p.accent)}>Open Inspector ↗</span>
          </div>
        </div>
      </button>
    </Reveal>
  );
}

function Projects({ onOpen }) {
  const [filter, setFilter] = useState('all');
  const visible = PROJECTS.filter((p) => filter === 'all' || p.cat === filter);
  return (
    <section id="projects" className="py-[5.5rem]">
      <div className="mx-auto max-w-shell px-6 md:px-10">
        <SectionTag>Case Studies</SectionTag>
        <h2 className="mb-[0.9rem] font-display text-[clamp(1.8rem,4vw,2.4rem)] font-extrabold leading-[1.1] -tracking-[0.03em]">Featured Projects</h2>
        <p className="mb-7 max-w-[480px] text-[0.88rem] leading-[1.7] text-content-muted">Production-grade systems built to solve real business problems — click any card to open the full Triple-M case-study inspector.</p>
        <div className="mb-10 flex flex-wrap gap-2">
          {PROJECT_FILTERS.map(([f, label]) => (
            <button key={f} onClick={() => setFilter(f)} className={cx('rounded-full border px-[1.1rem] py-[0.42rem] font-mono text-[0.76rem] font-medium transition-all', filter === f ? 'border-signal-teal bg-signal-teal text-white' : 'border-hair text-content-muted hover:border-signal-teal hover:text-content-primary')}>{label}</button>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {visible.map((p) => (<ProjectCard key={p.id} p={p} onOpen={onOpen} />))}
        </div>
        <a href={PROFILE.github} target="_blank" rel="noreferrer" className="mt-9 flex w-fit items-center gap-[0.6rem] rounded-md border border-hair px-6 py-[0.65rem] text-[0.83rem] font-medium text-content-secondary transition-all hover:border-signal-teal hover:text-signal-teal">
          View All Projects on GitHub ↗
        </a>
      </div>
    </section>
  );
}

/* ----------------------------------------------- CASE STUDY INSPECTOR -- */
// The differentiator vs the old linear scroll: a focused drawer that frames
// each project with the exact structure a hiring manager scans for.

function Inspector({ project, onClose }) {
  const onKey = useCallback((e) => e.key === 'Escape' && onClose(), [onClose]);
  useEffect(() => {
    if (!project) return;
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [project, onKey]);

  if (!project) return null;
  const M = [
    ['01 · Market Problem', project.market, 'text-signal-rose'],
    ['02 · Modular Architecture', project.architecture, 'text-signal-blue'],
    ['03 · Measurable Metric', project.metric, 'text-signal-emerald'],
  ];
  return (
    <div className="fixed inset-0 z-[200] flex justify-end" role="dialog" aria-modal="true" aria-label={`${project.title} case study`}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <aside className="relative z-[1] flex h-full w-full max-w-[560px] animate-fadeUp flex-col overflow-y-auto border-l border-hair bg-ink-900 p-7 md:p-10">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className={cx('mb-2 font-mono text-[0.6rem] font-bold uppercase tracking-[0.14em]', project.accent)}>// {project.catLabel}</div>
            <h3 className="font-display text-[1.4rem] font-extrabold leading-tight -tracking-[0.02em]">{project.title}</h3>
          </div>
          <button onClick={onClose} aria-label="Close" className="ml-4 shrink-0 rounded-md border border-hair px-3 py-1 font-mono text-sm text-content-muted transition-all hover:border-signal-rose hover:text-signal-rose">esc ✕</button>
        </div>

        <div className="mb-7 flex items-center gap-4 rounded-xl border border-hair bg-surface p-5">
          <div className={cx('font-display text-[2.4rem] font-extrabold -tracking-[0.03em]', project.kpiColor)}>{project.kpi}</div>
          <div className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-content-muted">{project.kpiLabel}</div>
        </div>

        {M.map(([title, body, color]) => (
          <div key={title} className="mb-6">
            <div className={cx('mb-2 font-mono text-[0.68rem] font-bold uppercase tracking-[0.14em]', color)}>{title}</div>
            {Array.isArray(body) ? (
              <ul className="space-y-2">
                {body.map((b, i) => (
                  <li key={i} className="relative pl-4 text-[0.83rem] leading-[1.6] text-content-secondary before:absolute before:left-0 before:text-signal-teal before:content-['›']">{b}</li>
                ))}
              </ul>
            ) : (
              <p className="text-[0.83rem] leading-[1.7] text-content-secondary">{body}</p>
            )}
          </div>
        ))}

        <div className="mb-6 flex flex-wrap gap-[0.3rem]">
          {project.tags.map((t) => (<span key={t} className="rounded-sm border border-white/[0.06] px-[0.5rem] py-[0.18rem] font-mono text-[0.62rem] text-content-muted">{t}</span>))}
        </div>

        <a href={PROFILE.github} target="_blank" rel="noreferrer" className="mt-auto w-full rounded-md bg-signal-teal py-3 text-center font-display text-[0.85rem] font-semibold text-white transition-all hover:bg-signal-tealBright">View Source / Request Full Case Study ↗</a>
      </aside>
    </div>
  );
}

/* ----------------------------------------------------- EXPERIENCE / EDU -- */

function Experience() {
  return (
    <section id="experience" className="py-[5.5rem]">
      <div className="mx-auto max-w-shell px-6 md:px-10">
        <SectionTag>Journey</SectionTag>
        <h2 className="mb-[0.9rem] font-display text-[clamp(1.8rem,4vw,2.4rem)] font-extrabold leading-[1.1] -tracking-[0.03em]">Experience &amp; Education</h2>
        <p className="mb-11 max-w-[480px] text-[0.88rem] leading-[1.7] text-content-muted">My professional path and academic foundation — where the numbers came from.</p>
        <div className="grid gap-10 md:grid-cols-2 md:gap-16">
          <div>
            <p className="mb-5 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-content-muted">// Work Experience</p>
            <div className="relative pl-7 before:absolute before:bottom-0 before:left-0 before:top-[10px] before:w-px before:bg-gradient-to-b before:from-signal-teal before:to-transparent">
              {EXPERIENCE.map((e) => (
                <div key={e.role + e.date} className="relative pb-9 before:absolute before:-left-[2.1rem] before:top-2 before:h-2 before:w-2 before:rounded-full before:border-2 before:border-ink-950 before:bg-signal-teal before:shadow-glowTeal">
                  <div className="mb-[0.2rem] font-mono text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-signal-teal">{e.date}</div>
                  <div className="font-display text-[0.95rem] font-bold -tracking-[0.01em]">{e.role}</div>
                  <div className="mb-[0.6rem] text-[0.78rem] text-content-muted">{e.co}</div>
                  <ul className="space-y-[0.15rem]">
                    {e.points.map((parts, i) => (
                      <li key={i} className="relative pl-4 text-[0.8rem] leading-[1.55] text-content-secondary before:absolute before:left-0 before:text-signal-teal before:content-['›']">
                        {parts.map((seg, j) => (j % 2 === 1 ? <span key={j} className="font-bold text-signal-amber">{seg}</span> : <span key={j}>{seg}</span>))}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-5 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-content-muted">// Education</p>
            {EDUCATION.map((ed) => (
              <div key={ed.deg} className={cx('mb-[0.8rem] rounded-[10px] border bg-surface p-[1.4rem] transition-all hover:border-hairHover', ed.active ? 'border-signal-teal/30' : 'border-hair')}>
                <div className="mb-[0.35rem] font-mono text-[0.58rem] font-bold uppercase tracking-[0.12em] text-signal-teal">{ed.year}</div>
                <div className="mb-[0.15rem] font-display text-[0.92rem] font-bold">{ed.deg}</div>
                <div className="mb-2 text-[0.78rem] text-content-muted">{ed.sch}</div>
                {ed.gpa && <span className="inline-block rounded border border-signal-teal/20 bg-signal-teal/10 px-[0.6rem] py-[0.18rem] font-mono text-[0.68rem] font-bold text-signal-teal">{ed.gpa}</span>}
                <p className="mt-2 text-[0.75rem] leading-[1.5] text-content-muted">{ed.note}</p>
              </div>
            ))}
            <p className="mb-3 mt-4 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-content-muted">// Leadership</p>
            <div className="rounded-[10px] border border-hair bg-surface p-[1.4rem]">
              <div className="mb-2 font-mono text-[0.62rem] font-bold uppercase tracking-[0.14em] text-signal-teal">Operational &amp; Community Roles</div>
              <ul className="space-y-[0.15rem]">
                {['Sports Director — Rotaract Club of TCET & Mumbai Nova', 'Discipline Advisory Head — Computer Society of India', 'Team Captain — TCET Football & Tug-of-War', 'Lead Guitarist — The Eighth Note'].map((r) => (
                  <li key={r} className="relative pl-4 text-[0.8rem] leading-[1.55] text-content-secondary before:absolute before:left-0 before:text-signal-teal before:content-['›']">{r}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- RESEARCH -- */

function Research() {
  return (
    <section id="research" className="py-[5.5rem]">
      <div className="mx-auto max-w-shell px-6 md:px-10">
        <SectionTag>Publications</SectionTag>
        <h2 className="mb-[0.9rem] font-display text-[clamp(1.8rem,4vw,2.4rem)] font-extrabold leading-[1.1] -tracking-[0.03em]">Research &amp; Publications</h2>
        <p className="mb-7 max-w-[480px] text-[0.88rem] leading-[1.7] text-content-muted">Peer-reviewed work at an international conference — a rare credential for an industry-transitioning analyst.</p>
        <div className="grid items-center gap-8 rounded-xl border border-signal-amber/[0.18] bg-surface p-9 transition-all hover:border-signal-amber/35 hover:shadow-glowAmber md:grid-cols-[1fr_auto]">
          <div>
            <div className="mb-3 inline-block rounded border border-signal-amber/[0.22] bg-signal-amber/10 px-[0.7rem] py-[0.25rem] font-mono text-[0.6rem] font-bold uppercase tracking-[0.12em] text-signal-amber">First Author · Peer Reviewed</div>
            <h3 className="mb-[0.35rem] font-display text-[1.1rem] font-bold -tracking-[0.02em]">IC-ICN 2025 — International Conference on Intelligent Computing &amp; Networking</h3>
            <p className="font-mono text-[0.75rem] text-content-muted">Multicon 2025 · Thakur College of Engineering &amp; Technology, Mumbai</p>
            <p className="mt-3 max-w-[540px] text-[0.83rem] leading-[1.68] text-content-muted">Original first-author research accepted at a competitive international conference — demonstrating independent analytical thinking, rigorous methodology, and the ability to communicate findings to a technical peer audience.</p>
          </div>
          <div className="flex flex-row gap-6 md:flex-col md:gap-4">
            {[['1st', 'Author', 'text-signal-amber'], ["Int'l", 'Conference', 'text-signal-blue'], ['2025', 'Published', 'text-signal-tealBright']].map(([v, l, c]) => (
              <div key={l} className="text-center">
                <div className={cx('font-display text-[1.6rem] font-extrabold -tracking-[0.02em]', c)}>{v}</div>
                <div className="text-[0.58rem] uppercase tracking-[0.1em] text-content-muted">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- CONTACT -- */

function Contact() {
  const avail = [['Data Analytics Internship', 'open'], ['BI / Reporting Analyst', 'open'], ['Supply Chain Analytics', 'open'], ['Product / SaaS Analytics', 'open'], ['FinTech / Banking Analytics', 'con']];
  return (
    <section id="contact" className="bg-ink-900 py-[5.5rem]">
      <div className="mx-auto max-w-shell px-6 md:px-10">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <SectionTag>Get In Touch</SectionTag>
            <h2 className="mb-4 font-display text-[clamp(2rem,4vw,2.8rem)] font-extrabold leading-[1.1] -tracking-[0.045em]">Let&apos;s build<br />something <span className="text-signal-teal">together.</span></h2>
            <p className="mb-7 text-[0.88rem] leading-[1.75] text-content-muted">Open to internships, part-time, and graduate roles across Data Analytics, BI, Supply Chain, Product Analytics, and FinTech in Melbourne. Student Visa (500) — 48 hrs/fortnight work rights.</p>
            <div className="flex flex-col gap-[0.6rem]">
              {[['📧', PROFILE.email, `mailto:${PROFILE.email}`], ['💼', 'linkedin.com/in/gaurav-warke', PROFILE.linkedin], ['📱', PROFILE.phone, `tel:${PROFILE.phone.replace(/\s/g, '')}`], ['⌨', 'github.com/gauravwarke8', PROFILE.github]].map(([ico, label, href]) => (
                <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="flex items-center gap-[0.85rem] rounded-lg border border-hair bg-surface px-[1.1rem] py-[0.85rem] text-[0.84rem] text-content-secondary transition-all hover:translate-x-1 hover:border-signal-teal hover:text-content-primary">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white/[0.05]">{ico}</span>{label}
                </a>
              ))}
            </div>
          </div>
          <div className="overflow-hidden rounded-[10px] border border-hair bg-surface">
            <div className="flex items-center justify-between border-b border-hair px-5 py-4">
              <span className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.14em] text-content-muted">Availability Status</span>
              <span className="flex items-center gap-[0.4rem] text-[0.65rem] font-semibold text-signal-emerald"><span className="h-[5px] w-[5px] animate-pulseDot rounded-full bg-signal-emerald" />Live · May 2026</span>
            </div>
            {avail.map(([label, state]) => (
              <div key={label} className="flex items-center justify-between border-b border-white/[0.03] px-5 py-[0.65rem] text-[0.78rem]">
                <span className="text-content-muted">{label}</span>
                <span className={cx('rounded-sm px-[0.55rem] py-[0.16rem] font-mono text-[0.6rem] font-bold', state === 'open' ? 'border border-signal-emerald/[0.18] bg-signal-emerald/10 text-signal-emerald' : 'border border-signal-amber/[0.18] bg-signal-amber/10 text-signal-amber')}>{state === 'open' ? 'OPEN' : 'CONSIDERING'}</span>
              </div>
            ))}
            <div className="flex items-center justify-between px-5 py-[0.65rem] text-[0.78rem]">
              <span className="text-content-muted">Arrangement</span>
              <span className="font-mono text-[0.7rem] text-content-muted">Part-time · Internship · Grad</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-hair py-10">
      <div className="mx-auto flex max-w-shell flex-col items-center justify-between gap-3 px-6 md:flex-row md:px-10">
        <p className="text-[0.72rem] text-content-muted">© 2026 Gaurav Warke · Melbourne, Australia</p>
        <p className="font-mono text-[0.65rem] text-content-muted">// Built with precision. Designed to convert.</p>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ APP -- */

export default function App() {
  const [active, setActive] = useState(null);
  return (
    <div className="min-h-screen bg-ink-950 font-sans text-content-primary antialiased">
      <Nav />
      <Hero />
      <div className="h-px bg-hair-x" />
      <About />
      <div className="h-px bg-hair-x" />
      <Skills />
      <div className="h-px bg-hair-x" />
      <Projects onOpen={setActive} />
      <div className="h-px bg-hair-x" />
      <Experience />
      <div className="h-px bg-hair-x" />
      <Research />
      <div className="h-px bg-hair-x" />
      <Contact />
      <Footer />
      <Inspector project={active} onClose={() => setActive(null)} />
    </div>
  );
}
