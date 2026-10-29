# GeeGeeVerse v0.7 — Spawn and camera repair

This patch fixes a specific bug reported from the previous GIS version: the player spawned at hard-coded game coordinates `(-42,110)`, which overlap the Social Sciences (FSS) building footprint in the geographic map. Once the map finishes loading, movement collision can trap the player inside the footprint. A third-person camera may also wind up inside nearby walls.

## Changes

- Removed the hard-coded FSS-area spawn. Default entry now starts near the project-defined campus square and automatically finds clear outdoor space when GIS footprint polygons are available.
- If GIS finishes loading *after* login and your current position falls inside a building, it relocates you outside.
- Added a prominent `↺ Unstuck` button in the HUD (also keyboard `R`) to teleport back to a safe campus position with the camera reset.
- When navigating to a landmark, choose a clear outdoor point instead of blindly placing the player in a guessed door location.
- Added basic third-person camera wall occlusion handling (camera moves toward the avatar when a simplified building model would obstruct it).
- Added deterministic unit tests for the former bad spawn position and safe spawn selection.
- Preserved existing multiplayer, quests, classes, and optional opt-in voice signalling. No backend schema or invite-code changes.

## How to update your live Render site

1. Download and unzip the v0.7 archive **on your computer**.
2. Open your existing private GitHub repository `khalil477/geegeeverse`.
3. Use **Add file → Upload files** and upload the extracted **contents**, not the zip. Preserve `public/` and `tests/`, and replace files with the same names. In particular, make sure `public/spawn-utils.mjs` is added and `public/world3d.js` is replaced.
4. Click **Commit changes**; Render should deploy the updated `main` branch automatically.
5. Wait for **Live**, then press **Ctrl + Shift + R** in the game. Open your account with your existing invite code. You do not need to create another Web Service or change environment variables.
6. Click **↺ Unstuck** at the top of the 3D view if you are stuck, or press **R** (not while typing in chat).

## Verification and limits

- `npm test`: nine tests pass, including collision search and multiplayer server integration.
- `node --check public/world3d.js`: syntax is valid.
- Full interactive browser rendering and a real-world live Render playtest were *not* completed; verify in Chrome/Edge after deployment.
- This patch fixes spawning and camera obstruction. **It does not add photorealistic building models** or turn City GIS footprints into a 1:1 uOttawa digital twin. Building elevations, façades, interiors, entrances, and trees still need accurate source models and detailed work.
- Geographic data from City of Ottawa may fail or be incomplete; without its footprint layer, the game uses a labelled fallback, so the camera wall detection cannot use unseen 3D building geometry.
- Render Free instances may cold start; posts and multiplayer progress aren't durable until a database is added.

## Development

Requires Node.js 20+. `npm install` is optional because runtime has no external npm packages. `npm test`; `npm start`. Set `INVITE_CODE` (12+ chars) when `NODE_ENV=production`.
