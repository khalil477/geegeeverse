import { CAMPUS_BOUNDS } from './public/geo-utils.mjs';
const SOURCE_BASE='https://maps.ottawa.ca/arcgis/rest/services/TopographicMapping/MapServer';
const LAYERS=[['buildings',3],['sidewalks',5],['paths',6]];
const MAX_ITEMS={buildings:1000,sidewalks:550,paths:350};
let cache=null,cacheUntil=0,inProgress=null;
function tileBoxes(){const b=CAMPUS_BOUNDS,midx=(b.west+b.east)/2,midy=(b.south+b.north)/2;
 return [[b.west,b.south,midx,midy],[midx,b.south,b.east,midy],[b.west,midy,midx,b.north],[midx,midy,b.east,b.north]];}
async function fetchLayer(name,id,request=fetch){const out=[],seen=new Set();let successes=0,errors=0;
 // Four geographic tiles avoid truncation by the City's 1000-feature per-query limit.
 const chunks=await Promise.all(tileBoxes().map(async box=>{
  const params=new URLSearchParams({where:'1=1',geometry:box.join(','),geometryType:'esriGeometryEnvelope',inSR:'4326',spatialRel:'esriSpatialRelIntersects',outFields:'OBJECTID',outSR:'4326',returnGeometry:'true',f:'geojson',resultRecordCount:'1000'});
  const signal=AbortSignal.timeout(12000);
  try{const resp=await request(`${SOURCE_BASE}/${id}/query?${params}`,{signal,headers:{accept:'application/geo+json,application/json'}});if(!resp.ok)throw Error(`HTTP ${resp.status}`);const json=await resp.json();if(!Array.isArray(json.features))throw Error('Invalid GeoJSON');successes++;return json.features;}catch(e){errors++;return[];}
 }));
 for(const rows of chunks)for(const f of rows){if(!['Polygon','MultiPolygon'].includes(f?.geometry?.type))continue;const id=f?.properties?.OBJECTID ?? f.id ?? JSON.stringify(f.geometry.coordinates[0]?.[0]);if(seen.has(id))continue;seen.add(id);if(out.length>=MAX_ITEMS[name])break;out.push({type:'Feature',geometry:f.geometry,properties:{id}});}
 return {features:out,successes,errors};
}
export async function getCampusGeodata(request=fetch){if(request===fetch&&cache&&Date.now()<cacheUntil)return cache;
 if(request===fetch&&inProgress)return inProgress;
 const work=(async()=>{const results=await Promise.all(LAYERS.map(async ([name,id])=>[name,await fetchLayer(name,id,request)]));
 const layers=Object.fromEntries(results.map(([k,v])=>[k,v.features]));
 const failures=Object.fromEntries(results.map(([k,v])=>[k,{successfulTiles:v.successes,failedTiles:v.errors}]));
 const ok=layers.buildings.length>0;
 const data={ok,source:'City of Ottawa Open Data — TopographicMapping',bounds:CAMPUS_BOUNDS,layers,failures,updated:new Date().toISOString()};
 if(request===fetch){cache=data;cacheUntil=Date.now()+(ok?3600000:120000);inProgress=null;}return data;})();
 if(request===fetch)inProgress=work;
 return work;
}
