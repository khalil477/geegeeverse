// Geographical shapes are unsuitable as player physics in the current alpha.
// In v0.8: movement must remain possible, even inside an unverified building footprint.
import {WORLD_BOUND} from './geo-utils.mjs';
import {findSafePosition} from './spawn-utils.mjs';
export function canWalkInBounds(x,z,bound=WORLD_BOUND){
  return Number.isFinite(x)&&Number.isFinite(z)&&Math.abs(x)<=bound&&Math.abs(z)<=bound;
}
export function shouldHideNearbyBuilding(x,z,bounds,margin=18){
  if(!bounds)return false;
  return x>=bounds.minx-margin&&x<=bounds.maxx+margin && z>=bounds.minz-margin&&z<=bounds.maxz+margin;
}
export function outdoorLanding(x,z,polygons=[],options={}){
  const safe=findSafePosition(x,z,polygons,options);
  // Always return a usable coordinate even when a malformed dataset covers everything.
  return safe.found?safe:{x,z,moved:false,found:false};
}
