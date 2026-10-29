// Shared, server-validated appearance choices. No personal traits inferred or ranked.
export const AVATAR_OPTIONS = Object.freeze({
  color: ['coral','mint','lavender','gold','sky'],
  skin: ['sunrise','peach','olive','amber','cocoa','deep'],
  hair: ['short','bob','curls','bun','cap'],
  style: ['hoodie','jacket','tee'],
  accessory: ['none','backpack','glasses','headphones'],
  pants: ['denim','forest','charcoal']
});
export const AVATAR_DEFAULTS = Object.freeze({color:'coral',skin:'amber',hair:'short',style:'hoodie',accessory:'backpack',pants:'denim'});
export function normalizeAppearance(input={}){
 const out={};for(const [key,allowed] of Object.entries(AVATAR_OPTIONS))
   out[key]=allowed.includes(input?.[key])?input[key]:AVATAR_DEFAULTS[key];
 return out;
}
export function appearanceKey(input){const a=normalizeAppearance(input);return Object.keys(AVATAR_OPTIONS).map(k=>a[k]).join('|');}
