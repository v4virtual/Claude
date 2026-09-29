# Caesar Shift

An animated, interactive explainer of the Caesar cipher in a single HTML file. No build step and no dependencies apart from Google Fonts.

Open `index.html` in a browser. It plays through ten chapters on its own:

| # | Chapter | What it shows |
|---|---------|---------------|
| I | Prologue | `FDHVDU` rolls back three letters to `CAESAR` |
| II | Orders on the road | A courier is intercepted, first carrying plaintext, then ciphertext |
| III | Slide the alphabet | Two alphabet strips offset by the key, including the wrap-around |
| IV | The cipher wheel | The strips bent into a rotating disk (Alberti, c. 1467) |
| V | Encrypt a message | `VENI VIDI VICI` → `YHQL YLGL YLFL`, letter by letter on the wheel |
| VI | The arithmetic | `E(x) = (x + k) mod 26`, with Z + 3 wrapping to C on a number ruler |
| VII | Decrypt it again | The same wheel run backwards |
| VIII | Try every key | Brute force over all 25 keys finds `THE DIE IS CAST` |
| IX | Count the letters | Frequency analysis: slide the English letter profile to find the key (χ² fit) |
| X | Your turn | Interactive workbench: drag the wheel, pick a key, encrypt or decrypt your own text |

## Controls

- **Space**: play / pause
- **← / →**: previous / next chapter
- **Speed button**: 1× · 1.5× · 2× · 0.5×
- Deep-link to a chapter with a hash, e.g. `index.html#frequency`

It honours `prefers-reduced-motion` and `prefers-color-scheme`, and works down to phone width.

## Publishing with GitHub Pages

Settings → Pages → Deploy from branch → `main` / root (the repository must be public on a free plan).
