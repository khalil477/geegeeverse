# GeeGeeVerse — Cartoon Avatars v1.0

A drop-in upgrade to the existing GeeGeeVerse v0.9 browser-based campus game, not a standalone avatar demo.

## New

- Original stylized 3D characters made in code with rounded meshes, faces, shoes, and articulated arms/legs.
- Live 3D avatar studio with six customizable groups: outfit colour, skin-tone palette, hairstyle, clothing, accessory and pants.
- Five hairstyles (short, bob, curls, bun, cap), three outfit types (hoodie, jacket, tee), and four accessory choices (none, backpack, glasses, headphones).
- Walking arm/leg animation and character rotation; other players' appearances update through existing WebSocket presence messages.
- Appearance choices save locally on the same browser using localStorage. The server does not currently provide persistent avatar accounts.
- Campus map, quests, classroom boards, chat, optional voice signaling, Render service and `INVITE_CODE` remain in the project.

## Run

Node.js 20.11+:

```bash
npm start
```

Open http://localhost:3030 (or the selected PORT). For private deployment, set `NODE_ENV=production` and a 12+ character `INVITE_CODE` in Render. Keep the existing Render **Web Service**, build `npm install --omit=dev`, start `npm start`.

## Files changed or added

- `public/avatar-options.mjs` — shared validated customizations
- `public/avatar-system.mjs` — procedural Three.js cartoon characters and animations
- `public/avatar-creator.mjs` — preview and character editor
- `public/avatar-studio.css` — responsive editor styling
- `public/world3d.js` — integrates new avatars with existing map, NPC and multiplayer
- `public/index.html` — adds creator to welcome/profile modal
- `server.mjs` — synchronizes validated avatar appearance across multiplayer sessions
- `tests/avatar*.test.mjs` — appearance and server integration tests

## Known limitations

- Character animation uses a procedural walk cycle, **not a full motion-captured rig**; no photorealistic external 3D model is included.
- Three.js is currently imported from jsDelivr, so the 3D world requires the CDN to be reachable.
- Real uOttawa buildings and campus-map accuracy are unchanged in this avatar update.
- Browser-side visual rendering could not be verified from the testing environment, though source syntax checks and automated server tests pass.
- Guest profiles save only on the player's local browser; they do not sync between devices or survive cleared browser storage.
- The game remains a private alpha; voice/chat require moderation, blocking/reporting and consent controls before public launch.

## Credits and licensing

See `ATTRIBUTION.md` and `LICENSES.md`. Three.js source code is MIT licensed. Every avatar component is newly created using original geometries in `public/avatar-system.mjs`; **no third-party 3D model or texture pack is redistributed here**. Previous motion code uses permission described in ATTRIBUTION.md.
