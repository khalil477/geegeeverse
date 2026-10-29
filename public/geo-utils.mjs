// GeeGeeVerse geographic coordinates in approximate real-world metres at the uOttawa main campus.
// X increases east, Z increases south. Origin is fixed and shared by all multiplayer clients.
export const ORIGIN = Object.freeze({latitude:45.4225,longitude:-75.6831});
export const METRES_PER_LAT=111195;
export const METRES_PER_LON=111195*Math.cos(ORIGIN.latitude*Math.PI/180);
export const CAMPUS_BOUNDS={west:-75.6895,south:45.4180,east:-75.6770,north:45.4261};
export const WORLD_BOUND=610;
export function project(lon,lat){return {x:(lon-ORIGIN.longitude)*METRES_PER_LON,z:(ORIGIN.latitude-lat)*METRES_PER_LAT};}
export function unproject(x,z){return {lon:ORIGIN.longitude+x/METRES_PER_LON,lat:ORIGIN.latitude-z/METRES_PER_LAT};}
export function flatPolygons(geo){if(!geo||!Array.isArray(geo.coordinates))return[];if(geo.type==='Polygon')return [geo.coordinates];if(geo.type==='MultiPolygon')return geo.coordinates;return[];}
export function projectedPolygons(feature){return flatPolygons(feature?.geometry).map(rings=>rings.map(ring=>ring.map(([lon,lat])=>project(lon,lat)))).filter(rings=>rings[0]?.length>=4);}
export function polygonBounds(ring){const xs=ring.map(p=>p.x),zs=ring.map(p=>p.z);return {minx:Math.min(...xs),maxx:Math.max(...xs),minz:Math.min(...zs),maxz:Math.max(...zs)};}
export function pointInRing(x,z,ring){let hit=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if(((a.z>z)!==(b.z>z))&&(x<(b.x-a.x)*(z-a.z)/(b.z-a.z)+a.x))hit=!hit;}return hit;}
export function pointInPolygon(x,z,rings){return !!rings?.[0]&&pointInRing(x,z,rings[0])&&!rings.slice(1).some(r=>pointInRing(x,z,r));}
export function simplifyRing(ring,minDistance=1.15){if(ring.length<=8)return ring;const out=[ring[0]];for(let i=1;i<ring.length-1;i++){const p=ring[i],q=out.at(-1);if(Math.hypot(p.x-q.x,p.z-q.z)>=minDistance)out.push(p);}out.push(ring.at(-1));return out.length>=4?out:ring;}
// Verified building centres from OpenStreetMap descriptions; NOT entrance coordinates.
export const CAMPUS_LANDMARKS=[
 {id:'tbt',name:'Tabaret Hall',abbr:'TBT',lat:45.42453,lon:-75.68641,h:19,w:54,d:38,kind:'heritage',color:0xe9d5bd,room:'tabaret'},
 {id:'dms',name:'Desmarais Hall',abbr:'DMS',lat:45.42389,lon:-75.68720,h:36,w:39,d:34,color:0x9eb9b4},
 {id:'sim',name:'Simard Hall',abbr:'SMD',lat:45.42346,lon:-75.68570,h:22,w:37,d:28,color:0xc7ab96},
 {id:'mrt',name:'Morisset Library',abbr:'MRT',lat:45.42318,lon:-75.68419,h:23,w:42,d:34,color:0xaebcb6,room:'study'},
 {id:'ucu',name:'University Centre',abbr:'UCU',lat:45.42260,lon:-75.68378,h:14,w:42,d:32,color:0xb3ccbe,room:'lounge'},
 {id:'stn',name:'90 University',abbr:'90U',lat:45.42225,lon:-75.68460,h:29,w:31,d:28,color:0xb9aaa2},
 {id:'fss',name:'Social Sciences',abbr:'FSS',lat:45.42157,lon:-75.68384,h:48,w:40,d:31,color:0xaec8c2,room:'psy1101'},
 {id:'mnt',name:'Montpetit Hall',abbr:'MNT',lat:45.42267,lon:-75.68278,h:19,w:41,d:34,color:0xb9bbad},
 {id:'crx',name:'Learning Crossroads',abbr:'CRX',lat:45.42206,lon:-75.68182,h:26,w:35,d:32,color:0xd0c9b8},
 {id:'lmx',name:'Lamoureux',abbr:'LMX',lat:45.42194,lon:-75.68206,h:22,w:31,d:30,color:0xb6c6c6},
 {id:'stm',name:'STEM Complex',abbr:'STM',lat:45.42026,lon:-75.68045,h:29,w:51,d:49,color:0xb3cbc9,room:'chm1311'},
 {id:'gnn',name:'Gendron / Biosciences',abbr:'GNN',lat:45.42110,lon:-75.68152,h:22,w:34,d:29,color:0xabccc2,room:'bio1140'},
 {id:'ste',name:'SITE Building',abbr:'STE',lat:45.41934,lon:-75.67867,h:25,w:42,d:44,color:0xa8c0c8,room:'mat1320'}
].map(b=>({...b,...project(b.lon,b.lat)}));
export const CAMPUS_SQUARE={latitude:45.42186,longitude:-75.68294,...project(-75.68294,45.42186)};
