# Updating your existing GeeGeeVerse site

1. Make a copy of your current project or a GitHub branch so you can roll back.
2. Extract GeeGeeVerse-Movement-v0.9-beta.zip locally.
3. Upload the **files and folders inside** it to your existing GitHub repository, replacing matching files. Do not upload just the ZIP or replace the repository with the third-party demo.
4. Render will normally auto-deploy. Use its original service and the existing `npm start` start command.
5. After Render says Live, hard-refresh the page (Ctrl+Shift+R). Confirm header shows `MOTION BETA · v0.9`.
6. Test W/A/S/D, diagonal movement, Space, Shift, R, a CHM 1311 classroom and two-player presence.
7. If controls malfunction, revert the GitHub commit via GitHub's history; the previous v0.8 project will deploy again.

This is an adapted movement beta. The full upstream Rapier+Vite project is not imported because its build/runtime cannot be dropped into the existing Node client directly.
