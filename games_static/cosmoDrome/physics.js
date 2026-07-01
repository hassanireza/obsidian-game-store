/*
  physics.js
  Pure math used by the Cosmodrome game engine.
  No DOM, no canvas, no globals besides Math/Date - this file is identical
  in the browser and in Node, which is what lets it be unit tested headlessly.
*/
(function (root) {
  'use strict';

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  // Exponential approach toward a target value. Used for damping/smoothing.
  // `rate` is a per-second smoothing strength; dt is delta time in seconds.
  function approach(current, target, dt, rate) {
    var t = 1 - Math.exp(-rate * dt);
    return lerp(current, target, clamp(t, 0, 1));
  }

  // Eases a value from 0 toward 1 over time using a half-life style curve.
  function easeToward(t, tau) {
    if (tau <= 0) return 1;
    return 1 - Math.exp(-t / tau);
  }

  // Speed ramps from minSpeed to maxSpeed over elapsed time t (seconds),
  // governed by time-constant tau. Always returns a value in [minSpeed, maxSpeed].
  function speedAtTime(t, minSpeed, maxSpeed, tau) {
    var k = easeToward(Math.max(0, t), tau);
    return minSpeed + (maxSpeed - minSpeed) * k;
  }

  // Pseudo-3D perspective: returns a scale factor in (0, 1], where 1 means
  // "at the player's plane" (z = 0) and values shrink smoothly toward 0 as
  // z grows toward the horizon. This is the classic focal-length projection.
  function projectScale(z, focal) {
    var safeZ = Math.max(0, z);
    var safeFocal = Math.max(1, focal);
    return safeFocal / (safeZ + safeFocal);
  }

  // Converts a normalized lane position (-1 left .. 1 right) plus the track's
  // current curve offset into a screen-space x coordinate, given a perspective
  // scale. Curve influence fades in close (scale -> 1) and is strongest far
  // away (scale -> 0), matching how a bending corridor's vanishing point swings.
  function laneToX(lane, centerX, halfWidth, curveOffset, scale, curveAmplitude) {
    var center = centerX + curveOffset * (1 - scale) * curveAmplitude;
    return center + lane * halfWidth * scale;
  }

  // Simple 1D interval overlap test, used for lateral collision checks.
  function overlap1D(aMin, aMax, bMin, bMax) {
    return aMin < bMax && bMin < aMax;
  }

  // Smoothly moves a curve value toward a target. Returns the new value.
  function updateCurveOffset(current, target, dt, smoothing) {
    return approach(current, target, dt, smoothing);
  }

  // How many clean overtakes are required to clear sector `index` (0-based).
  function sectorQuota(index, base, growth) {
    return Math.round(base + index * growth);
  }

  // Picks a random lane within a safe inset of the corridor using an
  // injectable RNG (so it is deterministic and testable).
  function pickSpawnLane(rng, inset) {
    var i = typeof inset === 'number' ? inset : 0.85;
    return (rng() * 2 - 1) * i;
  }

  function clampLane(l) {
    return clamp(l, -1, 1);
  }

  // Maps elapsed seconds to a spawn interval (seconds between obstacles),
  // shrinking from `slow` to `fast` over `rampSeconds`, then holding at `fast`.
  function spawnInterval(t, slow, fast, rampSeconds) {
    var k = clamp(t / Math.max(1, rampSeconds), 0, 1);
    return lerp(slow, fast, k);
  }

  // Steering velocity model: given which direction keys are held (-1, 0, 1),
  // the current lateral velocity, and tuning constants, returns the new
  // velocity for this frame. Uses direct acceleration/deceleration (not an
  // exponential approach) so input feels immediate at low dt without the
  // multi-frame lag exp-smoothing introduces, while still ramping instead
  // of snapping instantly to max speed.
  //   input: -1 (left), 0 (none), 1 (right)
  //   vel: current lateral velocity (lanes/sec)
  //   dt: delta time in seconds
  //   accel: lanes/sec^2 applied while input is held
  //   decel: lanes/sec^2 applied (toward 0) while no input is held
  //   maxSpeed: cap on |vel|
  function steerVelocity(input, vel, dt, accel, decel, maxSpeed) {
    var v = vel;
    if (input !== 0) {
      v += input * accel * dt;
      v = clamp(v, -maxSpeed, maxSpeed);
    } else if (v !== 0) {
      var sign = v > 0 ? 1 : -1;
      var mag = Math.abs(v) - decel * dt;
      v = mag > 0 ? sign * mag : 0;
    }
    return v;
  }

  var Physics = {
    clamp: clamp,
    lerp: lerp,
    approach: approach,
    easeToward: easeToward,
    speedAtTime: speedAtTime,
    projectScale: projectScale,
    laneToX: laneToX,
    overlap1D: overlap1D,
    updateCurveOffset: updateCurveOffset,
    sectorQuota: sectorQuota,
    pickSpawnLane: pickSpawnLane,
    clampLane: clampLane,
    spawnInterval: spawnInterval,
    steerVelocity: steerVelocity
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Physics;
  }
  if (typeof window !== 'undefined') {
    window.Physics = Physics;
  }
  if (typeof root !== 'undefined') {
    root.Physics = Physics;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
