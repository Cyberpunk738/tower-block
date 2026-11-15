# Tower Block

A precision block-stacking game built with Three.js. Place each moving block on the tower: the overlapping portion stays, and the overhang falls away. Build as high as you can.

## Play

Serve this directory with any static server, for example `python3 -m http.server 8000`, and open `http://localhost:8000`. A WebGL-capable browser and an internet connection are needed to load Three.js from cdnjs. Fonts are optional. No build step is required.

- **Classic:** a complete miss ends the run.
- **Zen:** a miss gives you another attempt.
- **Time attack:** build as many floors as possible in 60 seconds; a complete miss also ends the run.
- Click or tap the game area, or press Space, to place a block. Escape pauses or resumes. The game also pauses when its tab is hidden.
- Personal bests are stored separately for each mode in the browser's local storage. Sound is optional and its setting is remembered. Clearing browser data clears these records; restricted storage is handled without preventing play.

## Implementation

`game-logic.js` contains intersection and reflected movement calculations; `script.js` controls rendering, timing, input, audio, and state; `style.css` and `index.html` provide the interface. Block geometry and materials are disposed when they are no longer needed. Motion uses elapsed time, with a capped physics step for stability; the timed mode uses elapsed wall time while active.

## Tests

With Node.js 18 or later:

```sh
node --test tests/*.test.js
```

The tests exercise placement, misses, boundary reflection, frame-rate-independent motion, modes, input handling and pause/timer state using a simulated DOM and renderer. Browser and device testing is still recommended when changing rendering or controls.

## Attribution and rights

The original repository predates this revision. This revision was developed with AI assistance and should be disclosed where relevant. Three.js is a third-party dependency; its separate license applies. Confirm ownership and permissions for all project code and assets before licensing the repository.
