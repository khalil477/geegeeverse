/**
 * Original GeeGeeVerse animation pose math. No runtime dependencies so it can be tested
 * without the game renderer and shared with the avatar studio preview.
 */
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(n)?n:0));
export const lerp=(a,b,t)=>a+(b-a)*clamp(t);
export function locomotionBlend(speed,{walkSpeed=9,runSpeed=26}={}){
 const s=Math.max(0,Number(speed)||0);
 return {walk:clamp(s/Math.max(1,walkSpeed)),run:clamp((s-walkSpeed)/Math.max(1,runSpeed-walkSpeed)),moving:s>.35};
}
export function cameraSettings({distance=13,pitch=.31}={}){
 return {distance:clamp(distance,7.5,28),pitch:clamp(pitch,.12,.82)};
}
export function animationPose({speed=0,dt=1/60,phase=0,elapsed=0,airborne=false,verticalVelocity=0,runSpeed=26}={}){
 const blend=locomotionBlend(speed,{runSpeed});
 const stride=.43*blend.walk+.30*blend.run;
 const frequency=lerp(5.5,11.2,blend.run);
 const nextPhase=phase+clamp(dt,0,.08)*frequency*(blend.moving?Math.max(.55,blend.walk):.12);
 const air=airborne?1:0;
 const lift=clamp(verticalVelocity/8,-1,1);
 const sway=Math.sin(nextPhase),bounce=Math.abs(Math.sin(nextPhase));
 return {
  phase:nextPhase,blend,
  legSwing:stride*sway*(1-air*.8),
  legLift:stride*Math.max(0,-sway)*(1-air*.8),
  armSwing:-stride*sway*.78*(1-air),
  bodyBob:blend.walk*blend.walk*.05*bounce+Math.sin(elapsed*1.75)*.017*(1-blend.walk),
  torsoLean:-.045*blend.walk-.115*blend.run+air*.035,
  torsoTwist:Math.sin(nextPhase)*(.035*blend.walk+.035*blend.run),
  headTilt:Math.sin(elapsed*1.1)*.035*(1-blend.walk),
  armJump:air*(lift>=-.1?-.85:-.28),
  legJump:air*(lift>=-.1?.30:-.16),
  squash:1-air*.07,
  // Blink windows are short, aperiodic and deterministic per avatar phase seed.
  blink:Math.max(0,1-Math.abs(((elapsed+1.3)%4.65)-.08)/.105),
  expression: air ? .32 : (.06 + blend.run*.12)
 };
}
