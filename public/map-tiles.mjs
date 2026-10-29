/** OSM Slippy tile helpers; no bulk tiles and no server-side tile downloads. */
export function tilePosition(lon,lat,z){
  const n=2**z;
  const p=Math.PI*lat/180;
  return {x:(lon+180)/360*n,y:(1-Math.asinh(Math.tan(p))/Math.PI)/2*n};
}
export function tileLon(x,z){return x/(2**z)*360-180;}
export function tileLat(y,z){return Math.atan(Math.sinh(Math.PI*(1-2*y/(2**z))))*180/Math.PI;}
export function tileWorldBounds(z,x,y,project){
  const nw=project(tileLon(x,z),tileLat(y,z));
  const se=project(tileLon(x+1,z),tileLat(y+1,z));
  return {west:nw.x,east:se.x,north:nw.z,south:se.z};
}
export function tilesNear(lon,lat,z,edgeMetres=50){
  const tile=tilePosition(lon,lat,z),xx=Math.floor(tile.x),yy=Math.floor(tile.y);
  const pxPerLon=111195*Math.cos(lat*Math.PI/180),pxPerLat=111195;
  const centerMetresX=(tileLon(xx+1,z)-tileLon(xx,z))*pxPerLon;
  const centerMetresY=(tileLat(yy,z)-tileLat(yy+1,z))*pxPerLat;
  const fx=tile.x-xx,fy=tile.y-yy;
  const xs=[xx],ys=[yy];
  if(fx*centerMetresX<edgeMetres)xs.unshift(xx-1);
  if((1-fx)*centerMetresX<edgeMetres)xs.push(xx+1);
  if(fy*centerMetresY<edgeMetres)ys.unshift(yy-1);
  if((1-fy)*centerMetresY<edgeMetres)ys.push(yy+1);
  const out=[];for(const x of xs)for(const y of ys)out.push({x,y,z});return out;
}
