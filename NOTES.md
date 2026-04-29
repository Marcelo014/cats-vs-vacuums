# Cats vs Vacuums — Dev Notes

A running list of planned features, improvements, and reminders for future development.
These are not in any particular order — just things to come back to.

---

## Upgrade Flavor Text
Each upgrade level should display a short sentence explaining what changed, written
in the voice/lore of the game. Even simple stat boosts should feel like they belong
in the world.

Examples:
- Kitten Level 1: "Sharpened claws. Slightly less lazy."
- Tabby Level 2: "Ate a whole fish. Feeling powerful."
- Chonk Level 3: "Somehow got even bigger. Physics concerned."
- Persian Level 4: "The slow aura now carries a faint smell of disdain."

Every cat x every level (50 total lines) needs one of these. Write them when the
upgrade system is fully built out so the stat context is clear.

---

## Visuals — Full Pixel Art Overhaul (End of Project)
All current visuals are placeholders (colored circles + emoji).
The full pixel art pass is a major part of the final week of development.
The game currently has very little visual life — everything needs personality.

Scope of the pixel art overhaul:
- Sprite for every cat type (10 total), idle + attack animation frames
- Sprite for every vacuum type (6 total), idle + death animation frames
- Pixel art attack effects for every cat attack style
  (melee swipe, hairball projectile, belly flop shockwave, arc launch, etc.)
- Pixel art maps for all 5 levels (Living Room, Kitchen, Hallway, Bedroom, Backyard)
- UI pixel art elements — buttons, panels, icons
- Intro cutscene frames (5 frames, silent pixel art)
- Background details per level — furniture, walls, decorations, floor texture
- Particle effects — scrap pickups, damage numbers, death explosions, dirt puffs
- Screen transitions between scenes

Tools: Aseprite for creation and modification.
Asset sources: itch.io Free Assets + OpenGameArt for base packs to modify.
All assets should feel cohesive — same pixel density, same color palette approach.

---

## Visual Life — Immediate Improvements (Before Pixel Art Pass)
Even before sprites, the game needs more visual energy. Things to add soon:
- Screen shake on vacuum death, not just on dirt loss
- Particle burst on vacuum death
- Color flash on cat attack
- Damage numbers floating up from vacuums when hit
- Dirt meter should pulse/flash when critically low
- Wave start announcement — big text flies in from the side
- Between wave summary — scraps earned, vacuums killed
- Path should have animated arrows showing vacuum direction
- Background should have a rough room sketch even before full pixel art

---

## Multiple Levels
5 levels total, each set in a different room of the cat's home.
The vacuum invasion starts at the front door and pushes deeper each level.

Level overview:
- Level 1 — Living Room: Simple layout, few turns, open placement
- Level 2 — Kitchen: Tighter spaces, counters block placement, path winds around island
- Level 3 — Hallway: Long and narrow, placement areas squeezed
- Level 4 — Bedroom: Multiple entry points, bed creates awkward zones
- Level 5 — Backyard: Outdoor finale, most complex layout, 2-3 entry points

Each level needs:
- Its own waypoint path (or multiple paths on harder difficulties)
- Its own background art (room sketch → full pixel art later)
- A level select screen between main menu and game
- Difficulty lock — must beat Easy before Medium unlocks per level

Currently only TEST_PATH_WAYPOINTS exists. Real level paths come after
core mechanics are stable and playtested.

---

## Wave Structure Overhaul
Current waves are placeholder values for testing only.
Needs a full redesign once all vacuum types are confirmed working.

Target structure per difficulty:
- Easy:   10 waves — gradual introduction, accessible economy
- Medium: 15 waves — faster vacuums, more variety per wave
- Hard:   20 waves — higher vacuum HP, tighter scraps
- Expert: 30 waves — maximum challenge, brutal scaling

Wave design rules:
- Early waves: Zoombas only
- Mid waves: introduce Turbo Zoombas, then Aquacleans
- Later waves: Gulpers and Phantavacs mixed in
- Final wave of EVERY level: always ends with a Megaclean
- Each wave should have a clear identity — a tank wave, a speed wave, a swarm wave
- Vacuum HP and speed should scale slightly per level
  (Level 3 vacuums are tougher than Level 1 vacuums at the same wave number)

---

## Special Cat Mechanics (Not Yet Implemented)
These cats are in the game but their unique mechanics are not built yet:
- Persian — should apply a slow aura to vacuums in range, not just deal damage
- Tuxedo Cat — should buff adjacent cats, currently does nothing
- Alley Cat — Better Together passive (bonus per nearby Alley Cat) not implemented
- Ragdoll — should launch itself as a boomerang, currently fires a projectile
- Chonk — should do AOE shockwave, currently single target
- Bengal — map-wide range works but piercing shots not implemented at Level 4

These are Week 2+ features. Build them one at a time after the core loop is stable.

---
## Triggerables
Several cats have a special player-triggered ability that unlocks at Level 5.
None of these are implemented yet — build after base mechanics are stable.

Triggerable overview:
- Kitten L5 — Mega rapid swipe: all Level 5 kittens on the map attack simultaneously
  for 3 seconds. Limit: 5-10 kittens participate per trigger.
- Persian L5 — Shield wall: projects a wall onto the path that absorbs damage
  until a threshold is hit, then goes on cooldown.
- Siamese L5 — Sticky hairball: player places it anywhere on the path, it rolls
  toward the start dragging vacuums with it.
- Bengal L5 — Speed frenzy: 15 seconds of dramatically faster attack speed
  plus a damage boost.
- Ragdoll L5 — Mega arc launch: player selects a target, Ragdoll launches in a
  massive arc across an entire section of the path.
- Chonk L5 — Bomb drop: player selects a point on the path, shadow appears,
  Chonk drops from above with screen shake, massive damage and long stun.

How triggerables should work in the UI:
- At Level 5 a trigger button appears when that cat is selected
- Player clicks the button then clicks the map to target (where applicable)
- Each triggerable has its own cooldown before it can be used again
- Cooldown values TBD during playtesting

Note: Tuxedo Cat and Maine Coon have no triggerables.
Alley Cat and Tabby also have no triggerables.


--


## Economy Overhaul
Current economy is rough and unbalanced — built for testing, not for fun.
Dev mode (99999 scraps) is active — remember to set back to 200 before shipping.

Things to revisit:
- Starting scraps per difficulty need playtesting
- Scrap drop values per vacuum type need balancing against cat costs
- Upgrade costs may need scaling depending on how fast scraps accumulate
- Adoption refund should probably scale with upgrade level spent
  (right now always returns 10% of base cost regardless of upgrades)
- Tuxedo at 300 base may be too expensive or too cheap depending on buff strength
- Economy should feel tight but fair — real decisions, never feels stuck

---

## Sound
No audio currently. Needed before shipping:
- Attack SFX per cat type (swipe, hairball, belly flop, etc.)
- Vacuum death SFX
- Vacuum reaching end SFX (alarming)
- Wave start jingle
- Wave complete jingle
- Win / lose music sting
- Background music loop per level (cozy + tense versions)
- UI click sounds

Decide on audio tone first — silly and lighthearted matches the game's personality.

---

## Other Future Features
- Level select screen with difficulty lock per level
- Result screen with full stats (vacuums killed, scraps earned, waves survived)
- Vacuum Mode (attack mode) — deploy vacuums, clean the dirt
  Design this after Cat Mode is fully stable
- Settings menu — music volume, SFX volume, UI side preference
- Tips system for first-time players (contextual, toggleable)
- itch.io deployment + portfolio integration
- Steam via Electron (post-summer, no code changes needed to game logic)