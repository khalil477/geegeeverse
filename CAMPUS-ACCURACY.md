# GeeGeeVerse — Campus Fidelity Tracker

## Goal
A recognizable, eventually survey-calibrated virtual uOttawa campus that preserves avatar customization, multiplayer, educational games and accessibility. The game is an **independent student prototype**, not an official uOttawa product.

### Important interpretation of 1:1
The world coordinate projection uses approximate real-world metres. A true 1:1 *digital twin* would additionally require surveyed geometry, photogrammetry/model licensing, current public circulation plans, texture permissions and detailed visual review. **The current models must not be described as exact replicas.**

## Verified reference sources

- uOttawa building information (Tabaret Hall): https://www.uottawa.ca/about-us/administration-services/facilities/campus-maps/building/tabaret-hall
- uOttawa public campus map: https://www.uottawa.ca/about-us/administration-services/facilities/campus-maps
- uOttawa official classroom views (including TBT333): https://www.uottawa.ca/about-us/information-technology/services/classrooms-and-equipment/tabaret-hall-teaching-spaces-layout-0
- uOttawa Huguette Labelle public event space (TBT112): https://www.uottawa.ca/about-us/reservations/spaces/special-event/huguette-labelle
- uOttawa Rotunda photo (artwork is NOT reproduced): https://www.uottawa.ca/en/news-all/celebrating-indigenous-art-heart-tabaret-hall
- Architectural photographer's public reference photos: https://dominikgehl.com/canada/ottawa/university-of-ottawa-tabaret-hall
- uOttawa's campus photo locations: https://www.uottawa.ca/alumni/campus-photo-locations

## Current, October 2026

| Space | Implemented | Verified details | Currently approximate |
| --- | --- | --- | --- |
| Main-campus landmarks | Geolocated labels, stylized exteriors, multiplayer | Geographic landmark centre estimates | Footprints in the final cartoon renderer, walkways, heights, most façades |
| Tabaret exterior | East-facing 6-column portico, pediment, large stairs | Neoclassical appearance, six columns, lawn orientation | Entrance scale, wing footprints, proportions, finishes |
| Tabaret Rotunda | Floor tile texture, grand-stair study, circular well and gallery rings, skylight, columns, benches | Circular interior, skylight, columns, curved railings, seating/stair motifs | Precise gallery geometry, stair navigability, room dimensions and interior artwork |
| Huguette Labelle (TBT112) | Walkable public event hall, stage, ornamented ceiling, stained glass-style windows, gallery and rows of seating | **Published area 287.3 m²**, former chapel, pilasters, stained glass, stage | The 18 × 16 m illustrative footprint, seating and door positions |
| Tabaret classroom TBT333 | Photo-inspired curved white desks, blue chairs, projection screen, fluorescent ceiling panels | Layout motifs from uOttawa's published panorama | Dimensions, seat count, doors, floor location within the larger building |

## Playable routing
- From campus: visit Tabaret Hall and press **E** by the marked entrance.
- From the Rotunda: visit TBT112 using the **east-side in-game marker**.
- From the Rotunda: use **TBT333 preview** by the staircase; this is **fast travel to a teaching-space visualization**, not a claim of a real corridor.
- From TBT112 / TBT333: press **E** at the marked exit to return to the Rotunda.
- **← Campus** returns the avatar to Tabaret Lawn from any Tabaret room.
- All three interiors use shared multiplayer room membership. Original classrooms and their learning features remain separate and accessible.

## Next fidelity requirements (not yet complete)
1. Obtain architectural/site survey or appropriately licensed public measurements for exact footprints, elevations and façade dimensions.
2. Ground-truth doors, ramps, pedestrian routes, floor transitions and accessibility in the actual current campus.
3. Refine Morisset, University Centre, STEM, FSS, SITE and other buildings using original 3D meshes derived from verifiable photo references. Do not invent private offices or restricted areas.
4. Make second-storey galleries physically navigable when actual public route information and collision-safe traversal are modelled.
5. Profile rendering and add mesh batching/instancing for large scenes.
6. Test multiplayer positions and room transitions with multiple simultaneous browsers and mobile controls.
7. Preserve references and licensing records. **Do not copy third-party photos or displayed artwork into textures without suitable permission.**

A trustworthy virtual campus labels what is observed, inferred or fictional rather than suggesting every geometry has been surveyed.
