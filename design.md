# Element Expedition — Game Design

## Goal and audience
A friendly, fast-paced browser game that helps students in Grades 7–9 recognize the first 20 chemical elements, connect names to symbols and atomic numbers, and learn through immediate feedback. It runs locally in a modern browser with no account, network, or dependencies.

## Core experience
Players enter a mini “expedition” through the periodic table. Each round shows a clue and four answer cards. A clue asks for the element name from its symbol, the symbol from its name, or the element matching an atomic number. Choose an answer, receive a short explanation and a correct/incorrect response, then continue. Players can study the reference table between rounds.

## Session and rules
- A session has 10 questions, selected from the first 20 elements and shuffled; avoid repeating an element until the pool is exhausted.
- Three clue formats are mixed. Four options are unique and include one correct answer.
- Score: +100 for a correct answer, plus a small speed bonus; no penalty for a wrong answer. Track a 10-question progress bar and streak.
- End screen shows score, accuracy, and a friendly replay action. A “Study the elements” view provides a searchable/filterable reference table of all 20 elements.
- Explanations reinforce the element’s name, symbol, and atomic number after every choice.

## Learning content
Include Hydrogen through Calcium (atomic numbers 1–20), with correct capitalization and symbols. Display atomic number, symbol, and name prominently. Where helpful, include a simple memorable fact; avoid unverified claims and overly advanced chemistry. Use accessible language suitable for K7–K9.

## Visual and interaction design
- Visual theme: “field lab / space exploration”—deep navy backdrop, bright cyan and warm amber accents, crisp periodic-table tiles, subtle star/atom motifs. Keep the interface calm and readable rather than noisy.
- Responsive layout: one-column on narrow screens; clear centered game panel on desktop. Controls are large, keyboard reachable, and use visible focus states.
- Use semantic HTML, sufficient contrast, reduced-motion-aware transitions, and text labels in addition to color. Announce answer feedback with an accessible live region.
- Keep all screens in one page: welcome, quiz, reference table, and results. Clearly label navigation and provide a way back from study mode.

## Technical plan
Use plain HTML5, CSS, and vanilla JavaScript with no external assets or libraries. Keep content/data, presentation, and game logic in separate files (`index.html`, `styles.css`, `game.js`). Questions are generated from a single vetted array of 20 element records. State is local to the current session; no personal data or persistence is required.

## Verification plan
1. **Design stage:** check the learning goals, age fit, content scope, and rules are explicit before coding.
2. **Structure stage:** validate the page structure and asset references; confirm semantic landmarks and all intended views exist.
3. **Logic stage:** run automated checks for the 20 records, unique answer choices, question formats, session length, scoring, and safe end/replay behavior. Check browser console/runtime if an available browser is present.
4. **Responsive/accessibility stage:** inspect layout rules, keyboard interaction, focus visibility, live feedback, and reduced-motion handling; run available static checks.
5. **Final stage:** verify Git diff/status, update `changes.md` and `skill.md` with relevant implementation notes, and append a concise comparison of final design changes to this document.

## Final design changes (implementation summary)
The planned experience was delivered as a dependency-free, single-page game with welcome, 10-question quiz, searchable field guide, and results views. The key adjustment from the original design is that all graphics and typography use CSS/system-font treatments rather than remote fonts or image assets, preserving offline use. Feedback is implemented as one concise fact per element rather than a separate fact-discovery mechanic. Accessibility was strengthened with A–D answer shortcuts, live answer announcements, reduced-motion styles, focus-visible controls, and focus movement to each newly opened view. A Node-based mock-DOM verification suite covers data, round flow, scoring, replay, and study search. Firefox was available through the project’s launcher and used for desktop and narrow-mobile home-screen visual checks; game interactions were simulated rather than manually exercised in a visible browser session. The later deployment package adds a standalone PWA manifest, PNG/SVG install icons, secure-context service-worker registration, versioned offline app-shell caching, and static-host deployment documentation. Relative paths support subdirectory hosting without a build step. An Android WebView wrapper now packages those same web assets at build time, uses AndroidX WebViewAssetLoader on an app-local HTTPS origin, and has a GitHub Actions debug-APK workflow; release signing remains out of scope.