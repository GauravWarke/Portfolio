/** @type {import('tailwindcss').Config} */
// ============================================================================
//  GAURAV WARKE — PORTFOLIO DESIGN SYSTEM
//  Target tier: B2B SaaS / FinTech / Supply-Chain BI
//  Aesthetic: "Bloomberg Terminal meets Linear" — data-dense, dark, premium.
//  The palette is engineered for trust (deep ink), signal (teal/emerald = up,
//  rose = risk), and density (mono numerals). No decorative color — every hue
//  encodes a business meaning, exactly how a trading desk or BI tool would.
// ============================================================================
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    // ----- Responsive breakpoints (mobile-first, BI-dashboard density) -----
    screens: {
      sm: '480px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      // ----- Structural font pairing -----
      // Sora       → display / KPIs (geometric, confident, "fintech product")
      // Inter      → body copy (neutral, high legibility at small sizes)
      // JetBrains  → data, labels, metrics (tabular numerals = aligned columns)
      fontFamily: {
        display: ['Sora', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      // ----- Premium FinTech color tokens (precise HEX) -----
      colors: {
        ink: {
          950: '#080C18', // page background — deep, near-black navy
          900: '#0C1120', // alt section band
          800: '#101828', // elevated band
        },
        surface: {
          DEFAULT: '#0F1624', // card base
          raised: '#141D2E',  // hovered / nested card
        },
        signal: {
          teal: '#0D9488',    // primary brand / "efficiency"
          tealBright: '#14B8A6',
          blue: '#3B82F6',    // analytics / neutral metric
          amber: '#F59E0B',   // emphasis / highlighted skill
          emerald: '#10B981', // positive delta ("up and to the right")
          rose: '#F43F5E',    // risk / churn / downside
        },
        content: {
          primary: '#F0F4FF',   // headings, key numbers
          secondary: '#94A3B8', // body copy
          muted: '#475569',     // labels, captions
        },
        hair: 'rgba(13,148,136,.15)',      // default border
        hairHover: 'rgba(13,148,136,.40)', // active border
      },
      letterSpacing: {
        tightest: '-0.045em',
        widestc: '0.2em',
      },
      maxWidth: {
        shell: '1100px',
      },
      boxShadow: {
        card: '0 12px 35px rgba(0,0,0,.30)',
        glowTeal: '0 0 25px rgba(13,148,136,.18)',
        glowAmber: '0 0 25px rgba(245,158,11,.10)',
      },
      backgroundImage: {
        'grid-lines':
          'linear-gradient(rgba(13,148,136,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(13,148,136,.04) 1px,transparent 1px)',
        'hair-x':
          'linear-gradient(90deg,transparent,rgba(13,148,136,.15),transparent)',
      },
      backgroundSize: {
        grid: '48px 48px',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseDot: {
          '0%,100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '.3', transform: 'scale(1.3)' },
        },
        blink: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0' } },
      },
      animation: {
        fadeUp: 'fadeUp .5s ease forwards',
        pulseDot: 'pulseDot 2s infinite',
        blink: 'blink .7s steps(1) infinite',
      },
    },
  },
  plugins: [],
};
