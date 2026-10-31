# Programming troubleshooting notes

- **Cross-realm test values:** Arrays/objects created inside Node `vm` have different prototypes; strict deep equality can fail despite identical contents. Normalize at the boundary (for example, `Array.from(vmArray)`) before asserting.
- **Keep quiz feedback safe:** Render generated element data with `textContent` and DOM nodes, not `innerHTML`; this avoids accidental HTML interpretation and keeps feedback accessible.
- **Random quiz coverage:** Shuffle a copied data array (`slice()` first) before selecting questions/options; avoid mutating the reference list so replay and study mode stay correct.
