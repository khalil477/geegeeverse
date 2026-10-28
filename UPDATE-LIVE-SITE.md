# Updating your currently-live GeeGeeVerse

1. Keep your current Render web service, GitHub repository, and secret INVITE_CODE.
2. Download and **extract** `GeeGeeVerse-Geographic-Campus-v0.5.zip`.
3. Upload the files **inside** that extracted folder via GitHub Add file → Upload files to `khalil477/geegeeverse`. Preserve subfolders; replace matching filenames. Do not upload the ZIP file alone.
4. Commit changes. Wait for Render auto deploy to show `Live`.
5. Reload https://geegeeverse.onrender.com and enter your existing invite code.
6. Check the bottom map status. If it says `City footprints loaded`, real GIS footprint geometry loaded. If it says `Approximate fallback`, the City API could not be reached and the visible shapes are NOT real footprints.

You are not changing the login/rooms/community system here—this is the first geographic map layer. No promise of pixel-identical building facades, roof shapes, trees, or interiors. The map is still a work in progress.
