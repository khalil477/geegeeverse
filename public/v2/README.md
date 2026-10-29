# GeeGeeVerse V2 — Realistic Browser Reboot

V2 is an independent, isolated browser game prototype. The original GeeGeeVerse remains at the main website and keeps its multiplayer, avatars, chat, classes, quizzes and quests.

## Play
Open /v2/index.html after this branch is merged and deployed. Press Enter the world, walk using WASD or arrow keys, drag the canvas to look, hold Shift to sprint, and press E near the front entrance to visit the Rotunda. Use E at the Rotunda entrance to return.
Use the quality dropdown to adapt performance. Touch directional buttons appear on touch devices.

## Files
- index.html: standalone V2 entry point
- main.mjs: Three.js renderer, first-person controls, graphics presets and transitions
- world.mjs: original, procedural Tabaret and Rotunda scene geometry with physically based-style materials
- game-config.mjs: testable movement, collisions, interaction proximity
- style.css: V2-only responsive HUD and landing page

## Accuracy
This is a photo-inspired architectural study, NOT a surveyed or verified 1:1 digital twin. Dimensions, textures, window positions and circulation routes are approximate. No copyrighted photos or artwork are copied as textures. GeeGeeVerse is an independent student project, not an official University of Ottawa product.

Official building reference: https://www.uottawa.ca/about-us/administration-services/facilities/campus-maps/building/tabaret-hall
uOttawa campus map: https://www.uottawa.ca/about-us/administration-services/facilities/campus-maps
Rotunda photo reference: https://www.uottawa.ca/en/news-all/celebrating-indigenous-art-heart-tabaret-hall

## Next milestones
1. Add properly licensed GLB building assets and measured exterior footprints.
2. Improve shadows, lighting, PBR textures, performance, and accurate collision geometry.
3. Add realistic character models and animations.
4. Reintegrate the existing WebSocket multiplayer and education mechanics.
5. Add surveyed public interior floor plans and accessibility routes.

Run npm test in the repository to check existing tests and the new V2 gameplay tests. A full visual browser test is still required before V2 becomes the default experience.