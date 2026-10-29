# Updating your existing GeeGeeVerse on Render

1. **Keep the current Render Web Service**; do not create another service.
2. On GitHub `khalil477/geegeeverse`, create a backup branch before changing anything, if possible.
3. Extract `GeeGeeVerse-Cartoon-Avatars-v1.0.zip` locally.
4. Upload the **contents of the extracted folder**, not the ZIP itself, to the root of your GitHub repository. Include the new `public/avatar-system.mjs`, `public/avatar-options.mjs`, `public/avatar-creator.mjs`, `public/avatar-studio.css`, and the updated existing files and server.mjs.
5. Click **Commit changes** and inspect that the new files appear under `public/` and `package.json` remains at the root.
6. Render should automatically deploy the commit. Keep the Build Command `npm install --omit=dev`, Start Command `npm start`, and existing private `INVITE_CODE` environment variable. You do not need to change the invite code.
7. When Render displays **Live**, visit https://geegeeverse.onrender.com and hard refresh (Ctrl+Shift+R).
8. Confirm the header reads `CARTOON AVATARS · v1.0` and the new 3D Avatar Studio appears. Choose a look and enter the campus. Change your look again via **My avatar**.
9. With two browser windows, use two separate characters and verify that changing an outfit in one appears in the other. If it doesn't, open Render Logs and your browser console.

**Rollback:** Use the repository's last working commit in GitHub or Render if anything fails. Do not delete the whole project or change service types.

## Testing status

`npm test` (23 automated tests) passed, including existing multiplayer and new appearance-synchronization tests. All changed JS passed `node --check`. A full visual 3D browser playtest was unavailable due to a local browser networking restriction; test the Render deployment before sharing it with students.
