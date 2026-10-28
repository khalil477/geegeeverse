# GeeGeeVerse v0.4 · Campus Adventure

An early, playable university-themed **3D browser game** with live multiplayer and a complete solo learning prototype. This project is **independent and unofficial**. The campus is an imaginary, simplified layout inspired by uOttawa landmarks, not a georeferenced architectural reconstruction.

## What's new in v0.4

- Redesigned light, friendly, game-first UI, clearer directories and quests, improved mobile controls.
- Camera-relative WASD/arrow-key movement, smooth acceleration, Shift sprint, Space jump, drag-to-orbit camera, wheel zoom, simple wall collisions.
- Stylized campus with named buildings, benches, lampposts, animated NPC students, and classroom portals; quickly enter any room through the directory.
- **Solo mode** works even when nobody else is connected: meet scripted professors, complete CHM 1311, BIO 1140, PSY 1101, and MAT 1320 question sets with hints and explanations.
- **CHM 1311 lab** guides learners through four interactive gravity-filtration choices. This is a simplified educational simulation, not a realistic lab physics simulator.
- An XP quest book and a customizable personal dorm study nook.
- Solo XP, quest completion, lesson mastery and dorm colour are stored in **this browser's localStorage**. They don't follow you to another device and are not synchronized between players.
- Previous features retained: multiplayer avatars and rooms, shared classroom solution wall, live room text chat, campus posts, optional experimental WebRTC voice.

## Fastest route: update your existing GitHub and Render site

1. Unzip this archive onto your computer.
2. Open the extracted `GeeGeeVerse-Playful-3D-v04` folder. Select its **contents** (not the ZIP or enclosing folder).
3. Open your existing GitHub repository `khalil477/geegeeverse` and use **Add file → Upload files**. Drag the contents (including `public/`, `package.json`, `server.mjs`, and `render.yaml`) into GitHub. Confirm replacing files with the same names if asked, then click **Commit changes**.
4. Render normally auto-deploys changes from the `main` branch. If it doesn't: Render → GeeGeeVerse → Manual Deploy → Deploy latest commit.
5. Keep your existing Render `INVITE_CODE` environment variable. Do **not** commit the secret to GitHub.
6. When the deployment says **Live**, refresh `https://geegeeverse.onrender.com` (hard refresh with Ctrl+Shift+R if the old UI persists).

The new static assets use `/solo.js` and `/playful.css`; verify they exist in your GitHub `public/` folder after upload.

## Run locally (optional)

Requires Node.js 20.11+.

```sh
npm start
```

Open `http://localhost:3030`. If production mode is set, the server requires an `INVITE_CODE` of at least 12 characters. To test with friends use private hosting and an invite code; for example, on Render set `NODE_ENV=production` and `INVITE_CODE` in Environment Variables.

## Controls

- WASD or arrow keys: walk relative to camera
- Hold Shift: sprint
- Space: jump
- Drag on 3D scene: turn camera
- Mouse wheel: zoom
- E near a doorway: enter the building / leave the classroom
- F near the professor in a class: talk
- Map button: view or hide campus minimap
- Class directory: teleport directly to any available class
- Mobile: touch movement pad, E, jump and sprint toggle

## Activity walkthrough

1. Enter the campus and select CHM 1311 from the left directory (or walk to the STEM door).
2. Press F close to Professor Nova, or use **Talk** in the Learn tab.
3. Answer the three Board problems; each has a hint and an explanation.
4. Change to **Virtual lab** and complete the four filtration stages.
5. Select **My Study Nook** in the directory and pick a desk colour.
6. Open **✨ Quests** at the top to view your saved progress.

## Tests

```sh
npm test
```

Includes a WebSocket multiplayer smoke test (joining, classrooms, solution wall, quiz XP, WebRTC signaling). Solo lessons were tested separately in headless browser DOM tests. Full WebGL rendering and live microphone-to-microphone audio have **not** been verified in this environment.

## Important limitations / safety

- This is a **stylized prototype**, not a high-fidelity Roblox-level world, an accurate uOttawa campus map, or a commercial game.
- NPC dialogue is scripted, not a generative AI professor. Lesson problems are practice content, not university-approved curricula.
- Quest progress is saved only in the current browser's localStorage; clearing browser data resets it.
- Render Free can sleep when inactive. Posts written to an ephemeral server filesystem may be lost across deployments; add a real database before public launch.
- Voice chat is experimental and opt-in. Browser permission is requested before microphone use. WebRTC currently uses STUN without a TURN relay, so it may fail on some networks. Build reporting, blocking, mute controls, user authentication, safeguards and moderation before any wider student launch.
- The invite code limits beta access, but is not a robust replacement for user identity or moderation.
- External 3D engine loaded through jsDelivr; players need internet to load it. If blocked, the game may show the loading screen.

## Files

- `server.mjs`: Node zero-dependency HTTP + WebSocket server, room messages, chat, posts, voice signaling.
- `public/world3d.js`: Three.js world, camera, player movement, NPCs, audio peer connections.
- `public/solo.js`: solo activities, scripted mentor hints, lab stages, quests and local progress.
- `public/playful.css`: updated game-first user interface.
- `public/index.html`: page and accessible fallback navigation.
- `tests/server.test.mjs`: multiplayer smoke test.

Built as a private, experimental learning-world alpha.
