# Decimal Quiz

A practice quiz for IB MYP Year 8 (MYP 2) Mathematics on decimal operations. Every question is built around a small detail that is easy to miss, and every answer is followed by a step-by-step explanation. Single HTML file, no build step, no dependencies apart from Google Fonts.

Open `index.html` in a browser.

| Topic | Questions | The detail it trains |
|-------|-----------|----------------------|
| Comparing | 2 | Give both numbers the same number of decimal places (0.5 = 0.50 > 0.45) |
| Ordering | 2 | Pad every number to the same length, then compare place by place |
| Adding | 2 | Line up the decimal points, not the last digits |
| Subtracting | 2 | Fill empty places with zeros (5 = 5.00), then borrow |
| Multiplying | 2 | Multiply without the points, then count the decimal places |
| Dividing | 2 | Make the divisor a whole number by moving both points |

Two of the twelve questions in each round are word problems (money, distance, area, sharing). Numbers are generated fresh every round with exact decimal arithmetic, so a retake is new practice rather than memory.

A difficulty slider sets the level before each round. It locks once the first question is answered and unlocks on the results screen for the next round. New visitors start on Stretch.

| Level | What changes |
|-------|--------------|
| Warm-up | One or two decimal places and small numbers |
| Core | The Year 8 standard: up to three decimal places |
| Stretch | Three decimal places, bigger numbers, borrowing across zeros (500.05 − 237.9), dividing by decimals (3.015 ÷ 0.67) |
| Challenge | Four decimal places, four-number sums, tiny decimals (0.04 × 0.03), two-step word problems |
| Expert | Negative decimals (−0.5 vs −0.45, 2.8 − 4.25), comparing whole calculations (0.4 × 0.5 vs 0.4 ÷ 0.5), three-factor products |

- A wrong first answer gets a targeted nudge instead of the answer (for example "the digits are right, but the decimal point is in the wrong place"), and one more try.
- After each question the explanation shows the working: column layouts with the decimal points in a highlighted stripe and filled-in zeros in blue, or the multiply/divide steps with an estimate or check.
- The results screen breaks the score down by topic, offers a practice round on the missed topics, and can copy a text summary to send to someone.
- Finished rounds are kept in the browser's local storage. Inside a Claude artifact the page can also save every answer to a shared, live results log; on a plain web page that part stays off.

Gentle sound effects are synthesised with the Web Audio API and can be switched off. It honours `prefers-reduced-motion` and `prefers-color-scheme`, and works down to phone width.
