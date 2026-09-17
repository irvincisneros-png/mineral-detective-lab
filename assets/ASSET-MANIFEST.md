# Mineral Detective Lab assets

## Current photographic build — 18 September 2026

The active application uses these two original atlases generated with the built-in ImageGen tool. These are generated educational illustrations, not photographs of measured specimens. The original files are retained in the Codex generated-images folder; project copies are self-contained.

| File | Source | Rendering |
| --- | --- | --- |
| `specimen-atlas.png` | `exec-520f9f8c-e91f-447a-a33a-50123f155541.png` | 4 × 2 atlas, eight minerals in row order: calcite, fluorite, gypsum, halite, magnetite, pyrite, quartz, talc. Exterior near-white pixels are flood-filled to transparent at runtime; mineral interiors retain their highlights. |
| `equipment-atlas.png` | `exec-2bd64f85-2d7d-4a14-abce-20b11a7edf98.png` | Balance, ceramic tile, pipette and hardness stylus. Canvas crops and positions the assets; readings, tracks, droplets and bubbles are live, separately rendered. |

### Mineral prompt (built-in ImageGen)

Create one high resolution photorealistic scientific mineral specimen atlas for an interactive school laboratory. Exactly 8 separate specimens in an evenly spaced 4 columns by 2 rows grid. Each equal cell has generous pure white background margins, no text, no labels, no borders, no hands, no tools. All specimens individually centered, do not overlap cells. Row 1 left to right: translucent honey-white calcite rhombohedral cleavage chunk; purple fluorite octahedral crystal cluster; white silky bladed gypsum selenite cluster; translucent pale pink halite cubic crystal chunk. Row 2 left to right: black metallic granular magnetite lump; brass gold pyrite striated cubic crystal cluster; colourless milky quartz hexagonal prismatic crystal cluster; pale green talc soft micaceous flaky chunk. Authentic geological textures, natural imperfect edges, fine striations, microfractures, realistic highlights, museum mineral macro photography with focus stacking. Consistent three-quarter frontal view with overhead soft daylight. No stylized polygons, no CGI cartoon look. Pure white backgrounds with minimal contact shadow so individual cells can be displayed as sprites. Landscape 3:2 or 2:1 composition, highest detail.

### Equipment prompt (built-in ImageGen)

Use case: product-mockup. Create a photorealistic laboratory equipment sprite atlas on pure white background, exactly 2 by 2 equally sized cells with generous white gutters. Top left: modern white precision digital laboratory balance, stainless circular weighing pan, three quarter very slight elevated FRONT view, blank dark green rectangular LCD on front and small blue tare button. Top right: clean unglazed porcelain rectangular streak tile, pale neutral grey ceramic, broad landscape rectangle viewed almost straight from above with very slight perspective, no marks. Bottom left: glass Pasteur pipette with black rubber bulb, oriented vertically with bulb at top and fine tip at bottom, faint clear liquid inside. Bottom right: a long steel hardness testing stylus, orange rubber handle at upper right and exposed pointed steel tip at lower left, diagonal. Scientific equipment catalogue photography, exceptionally detailed materials and reflections, studio soft light from upper left. Isolated objects no people, no labels, no text, no shadows outside the cell. No background lab scene. Square 2048 pixels if possible.

Both atlases were visually inspected. The application makes generated-image provenance and the 2D view limitations available in its About dialog. Scientific measurements come from the explicit simulation data, not from the generated pictures.

## Previous build assets (retained locally; not deployed)

These supporting surfaces were generated with the built-in ImageGen tool for this project on 17 September 2026. They are visual atmosphere only: specimen identity, measurements, instrument displays and safety text remain controlled by `app.js` and the DOM.

| File | Use | Source and treatment |
| --- | --- | --- |
| `lab-backdrop.jpg` | Sunlit school laboratory backdrop inside the interactive scene | Generated from a wide, uncluttered secondary-school lab brief; resized to 1280px wide and JPEG quality 5 for web delivery. |
| `bench-texture.jpg` | Pale benchtop texture behind the CSS bench plane and page edge | Cropped from the generated three-strip material sheet; resized to 1024px wide and JPEG quality 6. |
| `porcelain-texture.jpg` | Unglazed streak plate surface | Cropped from the middle strip of the material sheet; resized to 1024px wide and JPEG quality 6. |
| `notebook-paper.jpg` | Working-record paper texture | Cropped from the bottom strip of the material sheet; resized to 1024px wide and JPEG quality 6. |

The generated files were inspected at full resolution before cropping. No generated image is used as a scientific mineral photograph or as a source of measurement data. The original generated PNGs remain in the Codex generated-images folder for provenance and are not required at runtime.
