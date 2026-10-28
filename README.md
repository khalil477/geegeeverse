# GeeGeeVerse 3D Geographic Campus — v0.5 (first data-driven mapping pass)

The **new map replaces the random positions from v0.4** with georeferenced, named university building centres. Its building, sidewalk and pathway geometry are fetched from **City of Ottawa Open Data** at runtime, passed through the Node server, projected into metres and rendered in Three.js. No API key is needed for these public GIS layers.

## Important accuracy limitations

This is an architectural **massing map**, not a fully identical/photorealistic recreation of uOttawa. When the City GIS service works, horizontal building footprints and walking-surface polygons come from City of Ottawa surveying/topographic data. Heights are **estimates**, not measured. Windows, roof structures, signage, entrance points, interiors, landscaping, and classroom placements are not surveyed replicas. Building centres are based on openly listed geocoordinates and may not represent exact entrance coordinates. When the City service fails, the UI explicitly shows an **approximate fallback**, with rectangular buildings at georeferenced centres. No fictional detail is presented as surveyed.

The underlying v0.4 features are preserved: multiplayer lobby and room chat, optional beta voice, virtual professors, CHM 1311/ BIO 1140 / PSY 1101 / MAT 1320 learning, quizzes, solo quests and browser-saved XP. Testing real campus geometry needs internet access from your hosting server.

## Updated map controls

- Walk with WASD or arrow keys; Shift to sprint, Space to jump; mouse drag rotates the camera and wheel changes zoom.
- The **Real map** button opens a north-up mini map drawn from the same city shapes as the 3D scene.
- The **REAL CAMPUS LANDMARKS** section lists buildings with known geocoordinates and lets you move near them. For the initial beta, this is fast travel, not a real-world routing engine.
- Green circular classroom portals are GAMEPLAY markers only, placed near the approximate building centre, not actual uOttawa entrances. Press E when near a portal to enter a fictional learning room.
- The in-game status always reports whether City footprint data loaded or whether a fallback is displayed.

## GIS data source and attribution

**City of Ottawa** (Open Data, TopographicMapping MapServer) Building Footprints layer 3, Sidewalks layer 5, Pathways layer 6.
https://maps.ottawa.ca/arcgis/rest/services/TopographicMapping/MapServer
https://ottawa.ca/en/city-hall/get-know-your-city/open-data

Site/location cross-checks: University of Ottawa official campus map https://www.uottawa.ca/about-us/administration-services/facilities/campus-maps and building centres from OpenStreetMap (ODbL) via Mapcarta (not bulk imported as shape data). Credit OpenStreetMap contributors for referenced point locations https://www.openstreetmap.org/copyright.

## Run locally

Requirements: Node.js 20+ and internet access for Three.js CDN and City GIS.
`npm start` and visit http://localhost:3030.
Production requires `NODE_ENV=production` and a 12+ character `INVITE_CODE`.
Check locally: `npm test`.

## Deploy to existing GitHub/Render

1. Extract this ZIP. Upload **all the extracted files and folders**, not the ZIP, to the root of your existing GitHub `geegeeverse` repository, replacing matching files.
2. Render should automatically build latest commit. Existing Render settings remain: Node; build `npm install --omit=dev`, start `npm start`; `INVITE_CODE` should remain private.
3. Visit the live game and verify the bottom map status reads **City footprints loaded**. If it reads **Approximate fallback**, check the server's access to City of Ottawa GIS and try again later.

New files include `campus-data.mjs`, `public/geo-utils.mjs` and `tests/geo.test.mjs`. Existing learning and multiplayer functions remain.

## Map development roadmap

1. Validate individual footprints and course building entrances on the official uOttawa map.
2. Integrate measured LiDAR heights (City LOD1 datasets), visual details from approved reference photos.
3. Build detailed outdoor assets manually, prioritize Tabaret, Morisset, STEM, UCU.
4. Build accurate interiors only from authorized floorplans/measurements; the current rooms are fictional learning spaces.
5. Add automatic route finding, accessible routes, higher-quality animations, voice moderation and persistence before public launch.

*Independent student project, not endorsed or operated by uOttawa.*
