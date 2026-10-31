# Implementation changes

## Initial design → structure and styling
- Implemented the single-page welcome, quiz, field guide, and results views using semantic HTML, responsive CSS, visible focus states, live feedback, and reduced-motion support.
- Kept the field-lab visual direction, replacing decorative image dependencies with CSS and text-based motifs.
- Removed a proposed Google Fonts import so the game remains fully usable offline and has no runtime network dependency; system sans/monospace fallbacks preserve the intended hierarchy.

## Structure → interaction
- Added a vetted 20-element data set, balanced rotating clue types, shuffled unique choices, a 10-question no-repeat session, speed bonus, streak, explanations, and replay.
- Added A–D keyboard shortcuts, search by name/symbol/number, and context-aware back navigation from the guide.
- Implemented feedback through DOM text nodes rather than injecting answer content as HTML.

## Verification adjustments
- Added a dependency-free Node test harness that simulates the required DOM controls and checks data integrity, session flow, choice uniqueness, scoring, study search, and wrong-answer behavior.
- Normalized cross-VM arrays in one test assertion with `Array.from`; Node’s strict deep comparison distinguishes arrays with different realm prototypes even when their contents match. This was a test issue, not a game defect.
- Browser-level visual verification is not included; automated logic and static structure checks are used instead.
- Final accessibility review moves focus to each view’s heading after navigation (with `tabindex="-1"`), while study search remains one Tab away; automated tests verify all navigation destinations exist.
