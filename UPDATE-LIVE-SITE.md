# Updating live Render game

1. Extract `GeeGeeVerse-Movement-Recovery-v0.8.zip`.
2. In GitHub, upload all *contents* at the repository root, replacing files. Verify `package.json` and `server.mjs` are root files and `public/world3d.js`, `public/recovery-utils.mjs`, and `public/index.html` are under `public/`.
3. Commit. Wait for Render deployment for that commit to finish.
4. On the site press Ctrl+Shift+R; check header says `MOVEMENT PATCH · v0.8`.
5. Test movement with WASD, `R`, `↺ Unstuck`, and `👁 Show nearby walls`.

If header does not say v0.8, troubleshoot deployment/caching before changing game code again. If it says v0.8 but keys still do nothing, report that alongside your browser console error messages.
