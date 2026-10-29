# GeeGeeVerse v0.8 — Movement Recovery

**What's fixed:** The old GIS building polygons are no longer player colliders. They were blocking movement when spawn placed a character in or near extruded shapes. The camera is free-moving outdoors, and nearby generic building blocks are hidden automatically to keep the view usable. An always-available **↺ Unstuck / R** rescue teleports to the nearest calculated outdoor location. **👁 Show nearby walls** toggles visibility if you want to inspect the geometry.

This is a stability/debugging patch, **not** an accurate uOttawa 3D campus reconstruction. It intentionally allows walking through unfinished buildings. Learning/game modes and server features remain.

## Update on GitHub + Render

1. Extract the ZIP.
2. Upload the **contents** of the extracted folder to the top level of `khalil477/geegeeverse` on GitHub, replacing matching files. Keep folder structure and include `public/recovery-utils.mjs`.
3. Commit the changes.
4. Check that Render auto-deploys the **new commit** and shows **Live**.
5. Open your site and hard-refresh (Ctrl+Shift+R). **Look for `MOVEMENT PATCH · v0.8` in the header.** If it says something else, you're still seeing an older deployment or cached page.
6. Use WASD/arrow keys to move, **R** or **↺ Unstuck** to return outdoors.

Run locally: `npm start`; test: `npm test`.

Real building collision and accurate exterior architecture should be re-introduced only after proper walkable path and entrance models are created.
