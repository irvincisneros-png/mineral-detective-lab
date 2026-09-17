# Mineral Detective Lab — Interactive Rebuild Specification

Status: historical planning specification. Irvin approved implementation, then requested the primary agent take over and publish the improved version on 18 September 2026. The current canvas implementation and documented limits are described in README.md; earlier review-only restrictions below are superseded by that request.

Implementation owner: `gpt-5.6-luna` with reasoning effort `xhigh`.

## 1. Product intent

Rebuild Mineral Detective Lab as a direct-manipulation virtual laboratory. Students must perform observable procedures, read instruments, record measurements and interpret evidence. A test must never be a button that simply reveals a stored property.

The experience should feel like a bright, tactile school science laboratory rather than a dark software dashboard or a quiz wrapped in cards.

### Non-negotiable principles

1. **Do the procedure:** students move specimens and tools, operate equipment and control the viewpoint.
2. **Read the evidence:** instrument values, graduations, scratches, streaks and reactions appear in the simulated world. Students enter what they observe into the notebook.
3. **Reason before answering:** the identification is made from a completed evidence set and identification key, not from obvious colours or answer-revealing feedback.
4. **No timer:** students can repeat, inspect and correct procedures without a time penalty.
5. **Scientifically coherent:** measurement ranges and mineral properties must agree across every test and every representation.
6. **Original work:** do not reproduce ExploreLearning layouts, copy, artwork, animation, code or branded elements.

## 2. Audience and learning goals

Primary audience: Years 7–10 science students using school laptops, with a teacher projecting the same simulation when demonstrating.

Students should be able to:

- determine mass using a balance;
- determine volume by water displacement;
- calculate density from their own measurements;
- observe crystal form, luster, hardness, streak and acid reaction;
- compare several properties in an identification key;
- make and justify a mineral identification using evidence.

## 3. Visual direction

### Design thesis

**A sunlit, practical Australian school laboratory bench.** The interface should use physical space, equipment and a paper field notebook as its organising metaphor.

### Palette

- warm white and pale stone backgrounds;
- light timber or pale grey laboratory bench;
- deep ink/navy only for readable text, not large background fields;
- cobalt blue for active controls;
- eucalyptus/teal for completed observations;
- safety yellow used sparingly for hazards and procedural warnings;
- natural mineral colours in the specimens.

### Avoid

- dark-mode-first presentation;
- neon cyan on navy;
- glassmorphism, glowing outlines and oversized rounded cards;
- dashboard statistics dominating the workspace;
- generic sparkle, robot or magic-wand imagery;
- gradients used as decoration rather than light/material behaviour;
- excessive pills, badges and micro-labels;
- AI-sounding slogans or explanatory filler.

### Typography and UI character

Use one humanist sans-serif for instructions and controls, with a restrained monospaced face only for digital instrument readings. Controls should resemble real lab controls where appropriate. The notebook can use ruled paper and handwritten-style marks only if legibility remains excellent.

## 4. Primary layout

Desktop and school-laptop view:

- **Top strip:** title, current case and a compact help button.
- **Main workbench (approximately 70% width):** one persistent 3D scene containing the specimen tray, active equipment and contextual controls.
- **Lab notebook (approximately 30% width):** student-entered observations, density working and identification claim.
- **Equipment rail:** balance, cylinder, lamp/magnifier, hardness kit, streak plate and acid dropper. Selecting equipment changes the bench setup without navigating away.
- **Identification key:** opens as a wide drawer or fold-out reference and never covers the active measurement completely.

The physical lab is the first and largest element. Do not lead with a marketing header or a grid of test buttons.

On narrow screens, place the workbench above the notebook and keep the active equipment controls sticky beneath the simulation. The simulation must remain usable rather than becoming a static illustration.

## 5. Technical approach

The current static HTML/CSS/JavaScript implementation may be replaced where necessary.

Recommended stack:

- Vite + React + TypeScript;
- Three.js through `@react-three/fiber` and `@react-three/drei`;
- lightweight tweening or `framer-motion` for UI transitions;
- deterministic scripted object motion for reliability—do not introduce a full physics engine unless it materially improves manipulation;
- deployable as a static GitHub Pages build at `/mineral-detective-lab/`;
- no account, analytics, advertising, backend or student data collection.

The 3D scene must use real geometry and lighting. Do not fake all equipment movement with pre-rendered videos. Scripted camera transitions are acceptable, but students must retain meaningful control.

Provide a WebGL capability check and a clear accessible fallback for unsupported devices. The fallback may use an interactive 2D instrument view, but it must preserve student measurement rather than reveal answers.

## 6. Core simulation model

### Mineral set

Retain at least these eight specimens:

- Calcite
- Fluorite
- Gypsum
- Halite
- Magnetite
- Pyrite
- Quartz
- Talc

Each mineral record must define:

- accepted density and a narrow sample variation range;
- luster category;
- Mohs hardness or bounded range;
- streak colour;
- acid reaction;
- crystal form/habit;
- physically coherent PBR material settings;
- geometry family or crystal habit;
- a set of possible sample sizes so mass and volume vary between cases.

Use a deterministic session seed so every observation for one specimen remains internally consistent. The correct identity must never be encoded in visible DOM labels, asset filenames or easily read accessibility text before the case is solved.

### Specimen rendering

Create distinct low-to-medium-poly specimen meshes appropriate to the major crystal habits. Use physically based materials to communicate metallic versus non-metallic luster. Colour alone must not make identification trivial.

ImageGen can create source textures and visual references, but generated images must not be treated as scientifically authoritative mineral photographs. The final specimen behaviour—luster, transparency, roughness, crystal form and streak—must be controlled in the 3D material/data model.

## 7. Required interactive stations

### A. Mass — electronic balance

Student flow:

1. Select the electronic balance from the equipment rail.
2. The bench camera moves smoothly to a three-quarter view of the balance and specimen tray.
3. The display may begin slightly off zero; the student presses **Tare**.
4. The student drags the mineral from the tray to the balance pan.
5. The mineral follows the pointer in 3D, casts a moving shadow, lowers onto the pan and settles with believable weight/easing.
6. The scale display fluctuates briefly, then stabilises to one decimal place.
7. The student reads the display and enters the mass in the notebook.
8. The notebook validates unit and tolerance without revealing the answer prematurely. A wrong entry prompts the student to reread the display.

Acceptance details:

- the pan depresses slightly when loaded;
- the display is readable at common 1366×768 laptop resolution;
- the student can zoom the view or enlarge the display;
- the specimen cannot be recorded as measured until it is on the pan and the reading is stable;
- keyboard users can select the specimen and choose “place on balance”.

### B. Volume — water displacement

Student flow:

1. Select the graduated cylinder.
2. Read and enter the initial water volume from the bottom of the meniscus.
3. Drag the mineral above the cylinder and release it.
4. The specimen drops into the water with a small splash and ripple; the water level rises smoothly.
5. Read and enter the final volume.
6. Calculate displaced volume in the notebook.

Acceptance details:

- cylinder graduations and numerical labels remain sharp at zoom;
- the meniscus is visibly curved and read at eye level;
- parallax encourages using the view control to align the eye with the water level;
- initial volume, final volume and displacement are separate student entries;
- water rise is derived from the same hidden sample volume used by the mass/density model;
- no floating-point mismatch between displayed graduations and accepted answers.

### C. Density — student calculation

The notebook supplies the formula but not the result. Students substitute their recorded mass and volume and enter a density with units. Accept reasonable rounding. The simulation should then show whether the calculation is consistent, not identify the mineral automatically.

### D. Luster and crystal form — light and magnifier

Student flow:

1. Place the sample on a rotating observation stage.
2. Drag to rotate the specimen through 360 degrees.
3. Move a lamp around an arc and adjust intensity.
4. Use a magnifier control to inspect faces, cleavage and crystal habit.
5. Record luster and crystal form from constrained scientific choices.

Acceptance details:

- metallic minerals show broad, strong reflections distinct from vitreous, pearly, silky and greasy responses;
- luster changes are created through lighting and PBR parameters, not a text reveal;
- the sample remains rotatable while the lamp is adjusted;
- terms include short optional definitions without telling students which to choose.

### E. Hardness — scratch kit

Provide a progression of familiar tools with known hardness values, such as fingernail, copper coin, steel nail and glass plate.

Student flow:

1. Select a tool and drag it across the specimen, or drag the specimen across the reference surface where scientifically appropriate.
2. A mark appears only if the scratching object is harder.
3. The student can inspect whether the mark is a true groove or loose powder and wipe powder away.
4. Students repeat with different tools to bound the Mohs hardness.
5. They record the supported range rather than receiving the mineral's exact hardness as a reveal.

Acceptance details:

- scratch/no-scratch behaviour follows the data model;
- audible and visual feedback differs for a groove versus powder;
- the interface makes the direction of the test scientifically clear;
- repeated scratches do not corrupt the specimen or make later tests unreadable; reset is available.

### F. Streak — porcelain plate

Student flow:

1. Drag the mineral across an unglazed porcelain plate with sufficient distance and pressure.
2. The specimen rotates and moves with the pointer while a particle/trail effect appears behind it.
3. The deposited streak uses the mineral's streak colour, which may differ from its surface colour.
4. The student records the observed streak colour.

Acceptance details:

- merely clicking the plate does not complete the test;
- the trail follows the actual drag path;
- light/white streaks remain visible through lighting, plate tone and shadow rather than an unrealistic saturated outline.

### G. Acid reaction — dropper

Student flow:

1. Select safety glasses/PPE acknowledgement before activating the dilute acid station.
2. Pick up the dropper, position it above a clean face of the specimen and squeeze one drop.
3. The droplet falls and contacts the precise point selected.
4. Reactive samples fizz with localised, time-based bubble animation and a subtle sound; non-reactive samples remain visibly wet without bubbles.
5. Students record the observed reaction.

Acceptance details:

- the result is spatial and animated, not a text popup;
- repeated drops behave consistently;
- the acid station contains a clear simulated-laboratory safety note without turning into a lengthy warning screen;
- no implication that students should handle real acid without teacher supervision.

## 8. Notebook and reasoning flow

The notebook is a working record, not an automatically populated answer panel.

It must include:

- editable mass with unit;
- initial and final cylinder readings;
- calculated volume;
- density working and rounded result;
- luster;
- crystal form;
- bounded hardness evidence;
- streak;
- acid reaction;
- chosen mineral;
- a short claim-evidence statement using at least two observations.

Validation should distinguish:

- procedure not yet completed;
- value outside reading tolerance;
- missing or incorrect unit;
- mathematically inconsistent density;
- identification not supported by the recorded evidence.

Do not score students for speed. If points are retained, base them on evidence completeness, calculation accuracy and quality of reasoning. Prefer a clear case-completion summary over arcade-style point bursts.

## 9. Identification key

The key should be an interactive comparison table using the same terminology students record. It may filter as evidence is entered, but it must show why specimens remain or are eliminated.

Requirements:

- students can pin two or three candidate minerals for comparison;
- matching properties are highlighted gently;
- conflicting properties are identified explicitly;
- density ranges account for realistic measurement rounding;
- the correct answer is not automatically selected;
- after submission, show a concise evidence-based explanation and allow review of the completed procedures.

## 10. Motion, sound and interaction quality

Motion should clarify physical cause and effect:

- 250–500 ms camera/equipment transitions;
- spring/ease-out settling when objects are placed;
- short scale-display stabilisation;
- water ripple and meniscus movement tied to immersion;
- lamp reflections respond continuously;
- scratch and streak trails follow pointer velocity;
- acid bubbles originate at the droplet contact point.

Avoid constant ambient motion. Support `prefers-reduced-motion` with shortened transitions and no camera swooping. Sound is optional, muted by default and always paired with visible feedback.

Target smooth interaction on ordinary school laptops. Prefer stable 45–60 fps over excessive mesh detail. Cap device pixel ratio and pause rendering when the tab is hidden.

## 11. ImageGen asset plan

Use ImageGen deliberately for the following supporting graphics after implementation begins:

1. **Laboratory environment backdrop:** a clean, sunlit secondary-school science laboratory bench, neutral and uncluttered, no people, no labels, no logos, no equipment that conflicts with the interactive 3D props. Wide landscape composition.
2. **Subtle material textures:** a small coherent set for pale benchtop, unglazed porcelain and recycled notebook paper. Generate flat, evenly lit, tileable or easily cropped surfaces with no baked shadows or text.
3. **Optional case-completion illustration:** only if it helps the teacher/student summary. It must not become a decorative hero or delay the simulator.

Do not generate screenshots of an interface. Do not generate the measurement displays, labels, mineral property data or safety text as images. Do not rely on ImageGen to create scientifically exact mineral specimens; use controlled 3D geometry and PBR materials for those.

Every integrated generated asset must be inspected at full resolution, cropped locally, optimised for web delivery and documented in an asset manifest.

## 12. Accessibility

- All drag operations have keyboard equivalents.
- Every instrument has an enlarged-reading option.
- Do not encode results by colour alone.
- Meet WCAG AA contrast for text and controls.
- Focus order follows the physical procedure.
- Screen-reader announcements describe actions and instrument state without leaking the hidden mineral identity.
- Pointer targets are at least 44×44 CSS pixels.
- Canvas interactions provide accessible DOM controls and current-state summaries.
- Reduced-motion mode preserves cause-and-effect understanding.

## 13. Performance and deployment

- Initial compressed transfer target: under 4 MB excluding optional audio, with progressive loading for heavier textures/models.
- Lazy-load inactive equipment models.
- Use compressed GLB/GLTF assets where authored models are required.
- Correct Vite base path for GitHub Pages.
- Preserve HTTPS and the existing repository/site URL.
- The GitHub Actions deployment must succeed from a clean checkout.
- No runtime dependence on private services or expiring asset URLs.

## 14. Implementation sequence for Luna

Luna must implement in reviewable stages and must not push or deploy until instructed:

1. Create a branch and migrate the shell to the chosen 3D-capable stack.
2. Build the bright lab visual system and persistent bench scene.
3. Implement the specimen model and deterministic mineral data model.
4. Complete mass interaction end to end, including notebook validation.
5. Complete volume and density interaction end to end.
6. Add luster/crystal form observation.
7. Add hardness, streak and acid stations.
8. Add identification key and evidence-based case completion.
9. Add keyboard alternatives, reduced motion and WebGL fallback.
10. Integrate approved ImageGen assets.
11. Run full desktop, school-laptop and mobile browser QA.
12. Present the local build for Irvin's approval before merging, pushing or redeploying.

## 15. Acceptance gate

The rebuild is ready for Irvin's review only when all of the following are true:

- each test requires a visible procedure and student observation;
- the mass specimen visibly moves onto the scale and the student reads the stabilised display;
- the water-displacement readings produce the same volume used by the density model;
- mineral luster is observable through interactive lighting;
- hardness is inferred from multiple scratch tools;
- streak requires a physical drag and leaves the correct trail;
- acid reaction is a localised animated result;
- the notebook does not auto-fill the answers;
- the identification key supports comparison without choosing for the student;
- the design is predominantly light, calm and recognisably laboratory-based;
- there are no dark AI-dashboard motifs, decorative neon or generic marketing sections;
- keyboard and reduced-motion paths work;
- the site is tested at 1366×768, 1440×900, 390×844 and 200% browser zoom;
- no console errors, missing assets or deployment-path failures remain;
- a teacher can complete a case from start to finish without instructions from the developer.

## 16. Explicit exclusions for this rebuild

- no user accounts or student names;
- no leaderboards;
- no countdown timer;
- no copied ExploreLearning content or assets;
- no multiplayer mode;
- no teacher analytics backend;
- no chat assistant;
- no decorative landing page before the lab;
- no deployment until Irvin approves the local interactive rebuild.
