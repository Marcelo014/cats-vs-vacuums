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

Scope of the pixel art overhaul:
- Sprite for every cat type (10 total), idle + attack animation frames
- Sprite for every vacuum type (6 total), idle + death animation frames
- Pixel art attack effects for every cat attack style
  (melee swipe, hairball projectile, belly flop shockwave, arc launch, etc.)
- Pixel art maps for all 5 levels (Living Room, Kitchen, Hallway, Bedroom, Backyard)
- UI pixel art elements — buttons, panels, icons
- Intro cutscene frames (5 frames, silent pixel art)

Tools: Aseprite for creation and modification.
Asset sources: itch.io Free Assets + OpenGameArt for base packs to modify.
All assets should feel cohesive — same pixel density, same color palette approach.

---

## Wave Balancing
Current wave definitions are placeholder values for testing only.
Needs a full pass once all vacuum types are in the game.

Things to revisit:
- Wave count per difficulty (Easy: 10, Medium: 15, Hard: 20, Expert: 30)
- Gradual introduction of vacuum types — early waves Zoombas only,
  Phantavacs and Gulpers appearing in later waves
- Spacing and interval between spawns needs playtesting
- Final wave of every level should always be a Megaclean
- Difficulty modifier on vacuum HP and speed per level (Level 1 easiest, Level 5 hardest)

---

## Economy Overhaul
Current economy is rough and unbalanced — built for testing, not for fun.

Things to revisit:
- Starting scraps per difficulty need playtesting
- Scrap drop values per vacuum type need balancing against cat costs
- Upgrade costs may need scaling depending on how fast scraps accumulate
- Consider whether selling cats (adoption) refund should scale with upgrade level
  (right now it always returns 10% of base cost regardless of upgrades spent)
- Tuxedo Cat at 300 scraps base may be too expensive or too cheap depending
  on how strong the global butler buff ends up being
- Economy should feel tight but fair — player should rarely feel stuck,
  but should have to make real decisions about placement vs upgrading

---

## Other Future Features
- Main menu scene with background animation (Zoomba crossing, cat watching)
- Result screen (win/lose) with stats summary
- Vacuum Mode (attack mode) — deploy vacuums, clean the dirt
  Design this after Cat Mode is fully stable
- Sound effects and music — decide on audio tone before implementing
- Settings menu — music volume, SFX volume, UI side preference
- Tips system for first-time players
- itch.io deployment + portfolio integration
- Steam via Electron (post-summer, no code changes needed to game logic)