import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeAppearance,appearanceKey,AVATAR_DEFAULTS,AVATAR_OPTIONS} from '../public/avatar-options.mjs';
test('all appearance options have defaults and normalize to a safe value',()=>{
 for(const [key,choices] of Object.entries(AVATAR_OPTIONS)) {
   assert.ok(choices.includes(AVATAR_DEFAULTS[key]));
   for(const option of choices) assert.equal(normalizeAppearance({[key]:option})[key],option);
 }
});
test('invalid user-supplied avatar fields are rejected',()=>{
 assert.deepEqual(normalizeAppearance({skin:'<img>',hair:'../../outside',style:{broken:1},color:'xxx',accessory:'../../',pants:100}),AVATAR_DEFAULTS);
});
test('two visually distinct outfits have distinct multiplayer keys',()=>{
 assert.notEqual(appearanceKey({color:'gold',hair:'curls'}),appearanceKey({color:'coral',hair:'bob'}));
});
