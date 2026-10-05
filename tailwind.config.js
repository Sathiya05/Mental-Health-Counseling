/** @type {import('tailwindcss').Config} */

/* Every colour resolves through a CSS variable, so the light/dark themes can be
   swapped at runtime by flipping the variables on :root / [data-theme='dark'].
   <alpha-value> keeps every existing /opacity modifier working unchanged. */
var token = function (name) {
  return 'rgb(var(--' + name + ') / <alpha-value>)';
};

var ramp = function (prefix, steps) {
  var out = {};
  steps.forEach(function (step) {
    out[step] = token(prefix + '-' + step);
  });
  return out;
};

module.exports = {
  content: ['./*.html', './dashboard/*.html', './js/*.js'],
  theme: {
    extend: {
      /* extended opacity scale so /6, /12 etc. also work inside @apply */
      opacity: {
        2: '0.02', 3: '0.03', 4: '0.04', 6: '0.06', 8: '0.08', 12: '0.12',
        14: '0.14', 15: '0.15', 16: '0.16', 18: '0.18', 22: '0.22', 24: '0.24',
        35: '0.35', 45: '0.45', 55: '0.55', 62: '0.62', 65: '0.65', 72: '0.72',
        78: '0.78', 82: '0.82', 85: '0.85', 86: '0.86', 88: '0.88', 92: '0.92', 94: '0.94'
      },
      colors: {
        /* brand ramps */
        serenity: ramp('c-serenity', [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]),
        sand: ramp('c-sand', [50, 100, 200, 300, 400, 500, 600]),
        clay: ramp('c-clay', [400, 500, 600]),
        sage: ramp('c-sage', [400, 500, 600]),

        /* text */
        ink: token('c-ink'),
        mute: token('c-mute'),

        /* semantic surfaces */
        canvas: token('c-canvas'),   /* page background            */
        surface: token('c-surface'), /* cards, panels, header      */
        raised: token('c-raised'),   /* chips, inputs, inset areas */
        scrim: token('c-scrim')      /* modal / drawer backdrop    */
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif'
        ],
        display: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif']
      },
      boxShadow: {
        soft: '0 1px 2px rgba(17,17,17,0.04), 0 8px 24px -12px rgba(17,17,17,0.14)',
        card: '0 2px 4px rgba(17,17,17,0.03), 0 18px 40px -24px rgba(17,17,17,0.22)',
        lift: '0 8px 16px -8px rgba(63,124,133,0.28), 0 24px 48px -24px rgba(63,124,133,0.32)',
        nav: '0 1px 0 rgba(17,17,17,0.06), 0 10px 30px -22px rgba(17,17,17,0.35)'
      },
      borderRadius: {
        '4xl': '2rem'
      },
      maxWidth: {
        shell: '80rem'
      },
      transitionTimingFunction: {
        soft: 'cubic-bezier(0.22, 1, 0.36, 1)'
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        fadeDown: {
          '0%': { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        drawLine: {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' }
        }
      },
      animation: {
        fadeUp: 'fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both',
        fadeDown: 'fadeDown 0.25s cubic-bezier(0.22,1,0.36,1) both',
        fadeIn: 'fadeIn 0.5s ease both',
        drawLine: 'drawLine 0.9s cubic-bezier(0.22,1,0.36,1) both'
      }
    }
  },
  plugins: []
};