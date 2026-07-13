# Failure diagnostics (FDM)

Use as a quick reference after capturing material, nozzle, and symptoms. Always confirm first-layer quality before chasing mid-print defects.

## Warping / bed adhesion

**Likely causes:** cold bed, dirty surface, wrong Z offset, no brim/raft when needed, draft/cooling on corners, PETG on unsuitable surface, large flat base.

**Checks:** clean bed → Z offset / first-layer squish → bed temp for material → brim for large bases → enclosure/drafts → slow first layer.

**Fixes:** increase bed temp within material range; brim/raft; mouse ears on corners; reduce part cooling early layers; for PETG prefer textured PEI and careful release.

## Under-extrusion

**Likely causes:** partial clog, wet filament, low temp, wrong diameter/flow, grinded filament, loose extruder tension, long Bowden + soft filament.

**Checks:** extrude manually → cold pull / nozzle → dry filament → temp +10 °C test → flow/e-steps → hob tension.

## Layer shift

**Likely causes:** loose belts, crash into warp/curl, high acceleration, clogged nozzle dragging, unstable bed/gantry, cable snag.

**Checks:** belt tension → obstacles on bed → accel/jerk limits → nozzle wipe → mechanical play.

## Nozzle clog

**Likely causes:** debris, heat creep, wrong temp, mixing materials, carbonized PLA, wet filament swelling.

**Checks:** unload → cold pull → higher temp purge → replace nozzle if stubborn.

## Overheating / heat creep (soft filament in melt zone)

**Likely causes:** weak hotend cooling, too high temp + low speed, retraction too aggressive in Bowden, long dwell.

**Fixes:** improve heatsink fan; lower temp slightly; increase min layer time carefully; shorten retractions; ensure filament path is cool.

## Stringing / oozing

**Likely causes:** wet filament, high temp, low retraction, slow travel, PETG tendency.

**Fixes:** dry filament; lower temp; tune retraction (shorter for TPU); increase travel; wipe/coasting sparingly.

## Design fail (print OK process, part fails use)

**Likely causes:** stress along layer lines, thin walls, sharp internal corners, insufficient infill/perimeters for load, wrong material.

**Fixes:** reorient; add fillets; more walls; denser infill; switch PLA→PETG/TPU as needed; redesign for FDM anisotropy.

## Filament runout / power loss

Process/ops: check sensors, pause/resume reliability, spool end detection; document partial progress for customer communication.

## Mechanical failure

Belts, pulleys, bearings, leadscrew, cracked mounts — inspect after unexplained shifts or noise; do not keep reprinting the same G-code until mechanics are cleared.
