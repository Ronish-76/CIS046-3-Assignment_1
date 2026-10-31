/**
 * PuzzleGenerator — Generates verified, self-contained SVG logic puzzle cards.
 * Zero external HTTP requests. 100% resilient offline data URI images.
 */

class PuzzleGenerator {
  generateSvg({ title, eq1, eq2, questionEq, hint }) {
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 320" width="540" height="320">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f8fafc"/>
    </linearGradient>
  </defs>

  <!-- Card Background -->
  <rect width="540" height="320" rx="16" fill="url(#bgGrad)" stroke="#e2e8f0" stroke-width="2"/>

  <!-- Top Dark Header Banner -->
  <rect x="0" y="0" width="540" height="44" rx="16" fill="#0f172a"/>
  <rect x="0" y="24" width="540" height="20" fill="#0f172a"/>
  <text x="270" y="28" fill="#f59e0b" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="800" text-anchor="middle" letter-spacing="1.5">
    ${title || '🍌 BANANA PUZZLE CHALLENGE'}
  </text>

  <!-- Equation Line 1 -->
  <g transform="translate(48, 80)">
    ${eq1}
  </g>

  <!-- Equation Line 2 -->
  <g transform="translate(48, 142)">
    ${eq2}
  </g>

  <!-- Question Line 3 Banner -->
  <rect x="36" y="200" width="468" height="68" rx="12" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
  <g transform="translate(52, 218)">
    ${questionEq}
  </g>

  <!-- Bottom Helper Caption -->
  <text x="270" y="302" fill="#64748b" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="500" text-anchor="middle">
    ${hint || 'Calculate the value for the question mark (0-9) and submit'}
  </text>
</svg>`.trim();

    return 'data:image/svg+xml;charset=utf-8;base64,' + Buffer.from(svg, 'utf-8').toString('base64');
  }

  get20OfflinePuzzles() {
    return [
      // 1. Solution: 2
      {
        question: this.generateSvg({
          title: '🍌 BANANA PUZZLE #1',
          eq1: '<text x="0" y="26" font-size="32">🍌</text><text x="56" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">+</text><text x="96" y="26" font-size="32">🍌</text><text x="160" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">=</text><text x="200" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">6</text>',
          eq2: '<text x="0" y="26" font-size="32">🍌</text><text x="56" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">-</text><text x="96" y="26" font-size="32">🍎</text><text x="160" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">=</text><text x="200" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">1</text>',
          questionEq: '<text x="0" y="28" font-size="36">🍎</text><text x="64" y="28" font-family="monospace" font-size="30" font-weight="700" fill="#92400e">=</text><rect x="110" y="2" width="54" height="40" rx="8" fill="#f59e0b"/><text x="137" y="32" font-family="monospace" font-size="30" font-weight="900" fill="#000" text-anchor="middle">?</text>'
        }),
        solution: 2
      },

      // 2. Solution: 1
      {
        question: this.generateSvg({
          title: '🍌 BANANA PUZZLE #2',
          eq1: '<text x="0" y="26" font-size="32">🍌</text><text x="56" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">+</text><text x="96" y="26" font-size="32">🍌</text><text x="152" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">+</text><text x="192" y="26" font-size="32">🍌</text><text x="256" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">=</text><text x="296" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">9</text>',
          eq2: '<text x="0" y="26" font-size="32">🍌</text><text x="56" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">-</text><text x="96" y="26" font-size="32">🥥</text><text x="160" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">=</text><text x="200" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">2</text>',
          questionEq: '<text x="0" y="28" font-size="36">🥥</text><text x="64" y="28" font-family="monospace" font-size="30" font-weight="700" fill="#92400e">=</text><rect x="110" y="2" width="54" height="40" rx="8" fill="#f59e0b"/><text x="137" y="32" font-family="monospace" font-size="30" font-weight="900" fill="#000" text-anchor="middle">?</text>'
        }),
        solution: 1
      },

      // 3. Solution: 3
      {
        question: this.generateSvg({
          title: '🍌 BANANA PUZZLE #3',
          eq1: '<text x="0" y="26" font-size="32">🍌</text><text x="56" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">+</text><text x="96" y="26" font-size="32">🍌</text><text x="160" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">=</text><text x="200" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">8</text>',
          eq2: '<text x="0" y="26" font-size="32">🍌</text><text x="56" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">-</text><text x="96" y="26" font-size="32">🍎</text><text x="160" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">=</text><text x="200" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">1</text>',
          questionEq: '<text x="0" y="28" font-size="36">🍎</text><text x="64" y="28" font-family="monospace" font-size="30" font-weight="700" fill="#92400e">=</text><rect x="110" y="2" width="54" height="40" rx="8" fill="#f59e0b"/><text x="137" y="32" font-family="monospace" font-size="30" font-weight="900" fill="#000" text-anchor="middle">?</text>'
        }),
        solution: 3
      },

      // 4. Solution: 4
      {
        question: this.generateSvg({
          title: '🍌 BANANA PUZZLE #4',
          eq1: '<text x="0" y="26" font-size="32">🍌</text><text x="56" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">+</text><text x="96" y="26" font-size="32">🍌</text><text x="160" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">=</text><text x="200" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">10</text>',
          eq2: '<text x="0" y="26" font-size="32">🍌</text><text x="56" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">-</text><text x="96" y="26" font-size="32">🥥</text><text x="160" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">=</text><text x="200" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">1</text>',
          questionEq: '<text x="0" y="28" font-size="36">🥥</text><text x="64" y="28" font-family="monospace" font-size="30" font-weight="700" fill="#92400e">=</text><rect x="110" y="2" width="54" height="40" rx="8" fill="#f59e0b"/><text x="137" y="32" font-family="monospace" font-size="30" font-weight="900" fill="#000" text-anchor="middle">?</text>'
        }),
        solution: 4
      },

      // 5. Solution: 5
      {
        question: this.generateSvg({
          title: '🍌 BANANA PUZZLE #5',
          eq1: '<text x="0" y="26" font-size="32">🍌</text><text x="56" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">+</text><text x="96" y="26" font-size="32">🍌</text><text x="160" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">=</text><text x="200" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">8</text>',
          eq2: '<text x="0" y="26" font-size="32">🍌</text><text x="56" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">+</text><text x="96" y="26" font-size="32">🍎</text><text x="160" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">=</text><text x="200" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">9</text>',
          questionEq: '<text x="0" y="28" font-size="36">🍎</text><text x="64" y="28" font-family="monospace" font-size="30" font-weight="700" fill="#92400e">=</text><rect x="110" y="2" width="54" height="40" rx="8" fill="#f59e0b"/><text x="137" y="32" font-family="monospace" font-size="30" font-weight="900" fill="#000" text-anchor="middle">?</text>'
        }),
        solution: 5
      },

      // 6. Solution: 6
      {
        question: this.generateSvg({
          title: '🍌 BANANA PUZZLE #6',
          eq1: '<text x="0" y="26" font-size="32">🍌</text><text x="56" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">+</text><text x="96" y="26" font-size="32">🍌</text><text x="160" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">=</text><text x="200" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">6</text>',
          eq2: '<text x="0" y="26" font-size="32">🍌</text><text x="56" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">+</text><text x="96" y="26" font-size="32">🍍</text><text x="160" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">=</text><text x="200" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">9</text>',
          questionEq: '<text x="0" y="28" font-size="36">🍍</text><text x="64" y="28" font-family="monospace" font-size="30" font-weight="700" fill="#92400e">=</text><rect x="110" y="2" width="54" height="40" rx="8" fill="#f59e0b"/><text x="137" y="32" font-family="monospace" font-size="30" font-weight="900" fill="#000" text-anchor="middle">?</text>'
        }),
        solution: 6
      },

      // 7. Solution: 7
      {
        question: this.generateSvg({
          title: '🍌 BANANA PUZZLE #7',
          eq1: '<text x="0" y="26" font-size="32">🍌</text><text x="56" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">+</text><text x="96" y="26" font-size="32">🍌</text><text x="160" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">=</text><text x="200" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">4</text>',
          eq2: '<text x="0" y="26" font-size="32">🍌</text><text x="56" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">+</text><text x="96" y="26" font-size="32">🍉</text><text x="160" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">=</text><text x="200" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">9</text>',
          questionEq: '<text x="0" y="28" font-size="36">🍉</text><text x="64" y="28" font-family="monospace" font-size="30" font-weight="700" fill="#92400e">=</text><rect x="110" y="2" width="54" height="40" rx="8" fill="#f59e0b"/><text x="137" y="32" font-family="monospace" font-size="30" font-weight="900" fill="#000" text-anchor="middle">?</text>'
        }),
        solution: 7
      },

      // 8. Solution: 8
      {
        question: this.generateSvg({
          title: '🍌 BANANA PUZZLE #8',
          eq1: '<text x="0" y="26" font-size="32">🍌</text><text x="56" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">+</text><text x="96" y="26" font-size="32">🍌</text><text x="160" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">=</text><text x="200" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">2</text>',
          eq2: '<text x="0" y="26" font-size="32">🍌</text><text x="56" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">+</text><text x="96" y="26" font-size="32">🍇</text><text x="160" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">=</text><text x="200" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">9</text>',
          questionEq: '<text x="0" y="28" font-size="36">🍇</text><text x="64" y="28" font-family="monospace" font-size="30" font-weight="700" fill="#92400e">=</text><rect x="110" y="2" width="54" height="40" rx="8" fill="#f59e0b"/><text x="137" y="32" font-family="monospace" font-size="30" font-weight="900" fill="#000" text-anchor="middle">?</text>'
        }),
        solution: 8
      },

      // 9. Solution: 9
      {
        question: this.generateSvg({
          title: '🍌 BANANA PUZZLE #9',
          eq1: '<text x="0" y="26" font-size="32">🍌</text><text x="56" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">+</text><text x="96" y="26" font-size="32">🍌</text><text x="160" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">=</text><text x="200" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">6</text>',
          eq2: '<text x="0" y="26" font-size="32">🍌</text><text x="56" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">×</text><text x="96" y="26" font-size="32">🍌</text><text x="160" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">=</text><text x="200" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">9</text>',
          questionEq: '<text x="0" y="28" font-size="36">🍌</text><text x="56" y="28" font-family="monospace" font-size="30" font-weight="700" fill="#92400e">×</text><text x="96" y="28" font-size="36">🍌</text><text x="156" y="28" font-family="monospace" font-size="30" font-weight="700" fill="#92400e">=</text><rect x="200" y="2" width="54" height="40" rx="8" fill="#f59e0b"/><text x="227" y="32" font-family="monospace" font-size="30" font-weight="900" fill="#000" text-anchor="middle">?</text>'
        }),
        solution: 9
      },

      // 10. Solution: 0
      {
        question: this.generateSvg({
          title: '🍌 BANANA PUZZLE #10',
          eq1: '<text x="0" y="26" font-size="32">🍌</text><text x="56" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">+</text><text x="96" y="26" font-size="32">🍌</text><text x="160" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">=</text><text x="200" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">6</text>',
          eq2: '<text x="0" y="26" font-size="32">🍌</text><text x="56" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">-</text><text x="96" y="26" font-size="32">🍌</text><text x="160" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">=</text><text x="200" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">0</text>',
          questionEq: '<text x="0" y="28" font-size="36">🍌</text><text x="56" y="28" font-family="monospace" font-size="30" font-weight="700" fill="#92400e">-</text><text x="96" y="28" font-size="36">🍌</text><text x="156" y="28" font-family="monospace" font-size="30" font-weight="700" fill="#92400e">=</text><rect x="200" y="2" width="54" height="40" rx="8" fill="#f59e0b"/><text x="227" y="32" font-family="monospace" font-size="30" font-weight="900" fill="#000" text-anchor="middle">?</text>'
        }),
        solution: 0
      },

      // 11. Solution: 2
      {
        question: this.generateSvg({
          title: '🍌 BANANA PUZZLE #11',
          eq1: '<text x="0" y="26" font-size="32">🥥</text><text x="56" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">+</text><text x="96" y="26" font-size="32">🥥</text><text x="160" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">=</text><text x="200" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">8</text>',
          eq2: '<text x="0" y="26" font-size="32">🥥</text><text x="56" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">-</text><text x="96" y="26" font-size="32">🍌</text><text x="160" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">=</text><text x="200" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">2</text>',
          questionEq: '<text x="0" y="28" font-size="36">🍌</text><text x="64" y="28" font-family="monospace" font-size="30" font-weight="700" fill="#92400e">=</text><rect x="110" y="2" width="54" height="40" rx="8" fill="#f59e0b"/><text x="137" y="32" font-family="monospace" font-size="30" font-weight="900" fill="#000" text-anchor="middle">?</text>'
        }),
        solution: 2
      },

      // 12. Solution: 4
      {
        question: this.generateSvg({
          title: '🍌 BANANA PUZZLE #12',
          eq1: '<text x="0" y="26" font-size="32">🥑</text><text x="56" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">+</text><text x="96" y="26" font-size="32">🥑</text><text x="160" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">=</text><text x="200" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">6</text>',
          eq2: '<text x="0" y="26" font-size="32">🥑</text><text x="56" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">+</text><text x="96" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">1</text><text x="150" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">=</text><text x="190" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">4</text>',
          questionEq: '<text x="0" y="28" font-size="36">🥑</text><text x="56" y="28" font-family="monospace" font-size="30" font-weight="700" fill="#92400e">+</text><text x="96" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">1</text><text x="146" y="28" font-family="monospace" font-size="30" font-weight="700" fill="#92400e">=</text><rect x="190" y="2" width="54" height="40" rx="8" fill="#f59e0b"/><text x="217" y="32" font-family="monospace" font-size="30" font-weight="900" fill="#000" text-anchor="middle">?</text>'
        }),
        solution: 4
      },

      // 13. Solution: 6
      {
        question: this.generateSvg({
          title: '🍌 BANANA PUZZLE #13',
          eq1: '<text x="0" y="26" font-size="32">🍌</text><text x="56" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">+</text><text x="96" y="26" font-size="32">🍌</text><text x="152" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">+</text><text x="192" y="26" font-size="32">🍌</text><text x="256" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">=</text><text x="296" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">9</text>',
          eq2: '<text x="0" y="26" font-size="32">🍌</text><text x="56" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">+</text><text x="96" y="26" font-size="32">🍌</text><text x="160" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">=</text><text x="200" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">6</text>',
          questionEq: '<text x="0" y="28" font-size="36">🍌</text><text x="56" y="28" font-family="monospace" font-size="30" font-weight="700" fill="#92400e">+</text><text x="96" y="28" font-size="36">🍌</text><text x="156" y="28" font-family="monospace" font-size="30" font-weight="700" fill="#92400e">=</text><rect x="200" y="2" width="54" height="40" rx="8" fill="#f59e0b"/><text x="227" y="32" font-family="monospace" font-size="30" font-weight="900" fill="#000" text-anchor="middle">?</text>'
        }),
        solution: 6
      },

      // 14. Solution: 8
      {
        question: this.generateSvg({
          title: '🍌 BANANA PUZZLE #14',
          eq1: '<text x="0" y="26" font-size="32">🍎</text><text x="56" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">+</text><text x="96" y="26" font-size="32">🍎</text><text x="160" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">=</text><text x="200" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">10</text>',
          eq2: '<text x="0" y="26" font-size="32">🍎</text><text x="56" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">+</text><text x="96" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">3</text><text x="150" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">=</text><text x="190" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">8</text>',
          questionEq: '<text x="0" y="28" font-size="36">🍎</text><text x="56" y="28" font-family="monospace" font-size="30" font-weight="700" fill="#92400e">+</text><text x="96" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">3</text><text x="146" y="28" font-family="monospace" font-size="30" font-weight="700" fill="#92400e">=</text><rect x="190" y="2" width="54" height="40" rx="8" fill="#f59e0b"/><text x="217" y="32" font-family="monospace" font-size="30" font-weight="900" fill="#000" text-anchor="middle">?</text>'
        }),
        solution: 8
      },

      // 15. Solution: 0
      {
        question: this.generateSvg({
          title: '🍌 BANANA PUZZLE #15',
          eq1: '<text x="0" y="26" font-size="32">🍍</text><text x="56" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">+</text><text x="96" y="26" font-size="32">🍍</text><text x="160" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">=</text><text x="200" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">8</text>',
          eq2: '<text x="0" y="26" font-size="32">🍍</text><text x="56" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">-</text><text x="96" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">4</text><text x="150" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">=</text><text x="190" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">0</text>',
          questionEq: '<text x="0" y="28" font-size="36">🍍</text><text x="56" y="28" font-family="monospace" font-size="30" font-weight="700" fill="#92400e">-</text><text x="96" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">4</text><text x="146" y="28" font-family="monospace" font-size="30" font-weight="700" fill="#92400e">=</text><rect x="190" y="2" width="54" height="40" rx="8" fill="#f59e0b"/><text x="217" y="32" font-family="monospace" font-size="30" font-weight="900" fill="#000" text-anchor="middle">?</text>'
        }),
        solution: 0
      },

      // 16. Solution: 3
      {
        question: this.generateSvg({
          title: '🍌 BANANA PUZZLE #16',
          eq1: '<text x="0" y="26" font-size="32">🍉</text><text x="56" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">+</text><text x="96" y="26" font-size="32">🍉</text><text x="160" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">=</text><text x="200" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">10</text>',
          eq2: '<text x="0" y="26" font-size="32">🍉</text><text x="56" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">-</text><text x="96" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">2</text><text x="150" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">=</text><text x="190" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">3</text>',
          questionEq: '<text x="0" y="28" font-size="36">🍉</text><text x="56" y="28" font-family="monospace" font-size="30" font-weight="700" fill="#92400e">-</text><text x="96" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">2</text><text x="146" y="28" font-family="monospace" font-size="30" font-weight="700" fill="#92400e">=</text><rect x="190" y="2" width="54" height="40" rx="8" fill="#f59e0b"/><text x="217" y="32" font-family="monospace" font-size="30" font-weight="900" fill="#000" text-anchor="middle">?</text>'
        }),
        solution: 3
      },

      // 17. Solution: 5
      {
        question: this.generateSvg({
          title: '🍌 BANANA PUZZLE #17',
          eq1: '<text x="0" y="26" font-size="32">🍌</text><text x="56" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">+</text><text x="96" y="26" font-size="32">🍌</text><text x="160" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">=</text><text x="200" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">4</text>',
          eq2: '<text x="0" y="26" font-size="32">🍌</text><text x="56" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">+</text><text x="96" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">3</text><text x="150" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">=</text><text x="190" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">5</text>',
          questionEq: '<text x="0" y="28" font-size="36">🍌</text><text x="56" y="28" font-family="monospace" font-size="30" font-weight="700" fill="#92400e">+</text><text x="96" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">3</text><text x="146" y="28" font-family="monospace" font-size="30" font-weight="700" fill="#92400e">=</text><rect x="190" y="2" width="54" height="40" rx="8" fill="#f59e0b"/><text x="217" y="32" font-family="monospace" font-size="30" font-weight="900" fill="#000" text-anchor="middle">?</text>'
        }),
        solution: 5
      },

      // 18. Solution: 7
      {
        question: this.generateSvg({
          title: '🍌 BANANA PUZZLE #18',
          eq1: '<text x="0" y="26" font-size="32">🥝</text><text x="56" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">+</text><text x="96" y="26" font-size="32">🥝</text><text x="160" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">=</text><text x="200" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">8</text>',
          eq2: '<text x="0" y="26" font-size="32">🥝</text><text x="56" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">+</text><text x="96" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">3</text><text x="150" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">=</text><text x="190" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">7</text>',
          questionEq: '<text x="0" y="28" font-size="36">🥝</text><text x="56" y="28" font-family="monospace" font-size="30" font-weight="700" fill="#92400e">+</text><text x="96" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">3</text><text x="146" y="28" font-family="monospace" font-size="30" font-weight="700" fill="#92400e">=</text><rect x="190" y="2" width="54" height="40" rx="8" fill="#f59e0b"/><text x="217" y="32" font-family="monospace" font-size="30" font-weight="900" fill="#000" text-anchor="middle">?</text>'
        }),
        solution: 7
      },

      // 19. Solution: 9
      {
        question: this.generateSvg({
          title: '🍌 BANANA PUZZLE #19',
          eq1: '<text x="0" y="26" font-size="32">🍇</text><text x="56" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">+</text><text x="96" y="26" font-size="32">🍇</text><text x="160" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">=</text><text x="200" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">10</text>',
          eq2: '<text x="0" y="26" font-size="32">🍇</text><text x="56" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">+</text><text x="96" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">4</text><text x="150" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">=</text><text x="190" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">9</text>',
          questionEq: '<text x="0" y="28" font-size="36">🍇</text><text x="56" y="28" font-family="monospace" font-size="30" font-weight="700" fill="#92400e">+</text><text x="96" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">4</text><text x="146" y="28" font-family="monospace" font-size="30" font-weight="700" fill="#92400e">=</text><rect x="190" y="2" width="54" height="40" rx="8" fill="#f59e0b"/><text x="217" y="32" font-family="monospace" font-size="30" font-weight="900" fill="#000" text-anchor="middle">?</text>'
        }),
        solution: 9
      },

      // 20. Solution: 1
      {
        question: this.generateSvg({
          title: '🍌 BANANA PUZZLE #20',
          eq1: '<text x="0" y="26" font-size="32">🍒</text><text x="56" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">+</text><text x="96" y="26" font-size="32">🍒</text><text x="160" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">=</text><text x="200" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">6</text>',
          eq2: '<text x="0" y="26" font-size="32">🍒</text><text x="56" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">-</text><text x="96" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">2</text><text x="150" y="26" font-family="monospace" font-size="28" font-weight="700" fill="#334155">=</text><text x="190" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">1</text>',
          questionEq: '<text x="0" y="28" font-size="36">🍒</text><text x="56" y="28" font-family="monospace" font-size="30" font-weight="700" fill="#92400e">-</text><text x="96" y="28" font-family="monospace" font-size="30" font-weight="800" fill="#0f172a">2</text><text x="146" y="28" font-family="monospace" font-size="30" font-weight="700" fill="#92400e">=</text><rect x="190" y="2" width="54" height="40" rx="8" fill="#f59e0b"/><text x="217" y="32" font-family="monospace" font-size="30" font-weight="900" fill="#000" text-anchor="middle">?</text>'
        }),
        solution: 1
      }
    ];
  }
}

module.exports = new PuzzleGenerator();
