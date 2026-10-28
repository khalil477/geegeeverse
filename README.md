# GeeGeeVerse 3D Alpha (v0.3)

**A 3D third-person multiplayer university playground for the browser.** A campus-inspired uOttawa map with 18 recognizable labeled buildings, walkable paths, classrooms, a 3D question board, a shared solution wall, chat/forum, customizable low-poly avatar and optional, peer-to-peer voice chat.

## Try it locally (developer/owner)

Requirements: Node.js 22+, modern browser with WebGL and internet connection for the Three.js module (loaded from jsDelivr). On Windows, double-click `start-windows.bat`. Or use:

```bash
npm start
```

Open `http://localhost:3030`, enter a nickname and choose an outfit. Walk using **WASD / arrow keys**, drag to rotate your view, scroll to zoom. Walk near a glowing building doorway and press **E**. You can also choose any classroom using the left-hand directory. Use two browser windows to test multiplayer. `npm test` runs a backend integration test without third-party npm dependencies.

## Deploy privately as a website

This is a **server-rendered static UI + single Node.js WebSocket server**. Deploy the complete repository using `render.yaml` as a Render Blueprint (or another hosting service that supports persistent Node.js WebSockets). Set `NODE_ENV=production` and choose a long random `INVITE_CODE` as a secret environment variable. The server refuses to start in production without a 12+ character invite code. Your players then open the HTTPS URL in a browser — **no download**.

On Render, the owner puts the source code in a Git repository, creates a Blueprint from that repo, sets `INVITE_CODE` in environment variables and deploys. Use HTTPS, not a standalone static-page host: multiplayer and WebRTC signaling depend on the Node server.

### Example playable loop

1. Walk through an approximately laid-out section of uOttawa, with visual landmarks such as Tabaret, Morisset, UCU, STEM, CRX, Desmarais, FSS, and SITE.
2. Enter **STEM / CHM 1311** with E at the front doorway, or choose it from the directory.
3. Read a chemistry question on the large in-world board and in the classroom panel. Choose an answer to see explanatory feedback.
4. Post a reasoning step or hint to the **shared solution wall**. Other players in the same room see your comment immediately.
5. Chat or voluntarily join room voice to discuss the problem, then visit Biology, Psychology or Calculus rooms.

## Reality check / limits

- This is **real browser 3D** using Three.js. The low-poly geometry, signboards and avatar are original placeholder assets, not a Roblox-quality finished 3D world.
- Building arrangement is a **stylized approximation** using public uOttawa building information, **not a georeferenced or 1:1 replica**. Neither building interiors nor the course-to-room assignments represent actual class schedules. Do not use it for navigation.
- Three.js loads from a CDN in the browser and requires an internet connection. For fully offline play, self-host the open-source Three.js library after obtaining it from the official distribution.
- Voice chat uses **WebRTC and browser permission**, is **off by default**, works only with other volunteers in your current room and currently uses a small peer-to-peer mesh capped at eight. Uses a public STUN server; some networks will need a TURN relay. Voice may fail across restrictive networks. There is **no voice recording feature**.
- **Not ready for a public release**, especially to minors: add reporting, blocking, abuse moderation, verified accounts, anti-spam safeguards, accessibility improvements, privacy documents and security testing before inviting strangers.
- Posts save only to a local JSON file; free cloud hosting may lose the file after a restart. Shared whiteboard comments, XP, player positions and chat exist only in server memory. Add an external database for persistence.
- No official university affiliation. No official curriculum assignments or exam questions are imported; practice questions are fictional.

## Verified

`npm test` tests that two players can join the same classroom, send a shared board note, receive validated question feedback, opt into voice, and exchange WebRTC signaling messages. Frontend 3D graphics and browser microphone access must be checked in a real browser when deployed; backend tests are **not** visual/voice-call acceptance tests.

Sources for approximate campus building names/locations: [Official uOttawa Campus Maps](https://www.uottawa.ca/about-us/administration-services/facilities/campus-maps) and [uOttawa classrooms listing](https://www.uottawa.ca/about-us/explore-classrooms-campus).
