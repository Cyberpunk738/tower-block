# 🏙️ Tower Block.

An interactive 3D block-stacking browser game built with **Three.js** and **GSAP (TweenMax)**. Test your precision and timing as you stack blocks to build the tallest tower possible!

---

## 🎮 Gameplay & Features

- **3D Block Cutting Mechanics**: Blocks move back and forth along alternating axes ($X$ and $Z$). Clicking or pressing the spacebar slices off any overhang that isn't aligned with the block below.
- **Perfect Stack Alignment**: Align a block cleanly over the target block to avoid trimming and maintain full block size.
- **Dynamic Color Gradient**: As the tower grows higher, block colors smoothly shift through a procedurally generated spectrum.
- **Smooth Orthographic Camera**: Smooth camera motion (powered by GSAP `TweenLite`) follows the tower as it rises higher into the sky.
- **Physics Falling Chopped Blocks**: Off-cut block pieces fall away off the sides when placed imperfectly.
- **Responsive Controls & UI**: Play using mouse clicks or spacebar on desktop or touch on mobile devices.

---

## 🕹️ How to Play

1. **Start Game**: Click **Start** or press the **Spacebar** on the initial screen.
2. **Place Block**: Press the **Spacebar** or **Click** the screen when the moving block is aligned over the tower stack.
3. **Build High**: Keep stacking blocks as they move faster and shrink down if not placed perfectly.
4. **Game Over**: If a block completely misses the tower stack below, it's game over! Try again to beat your high score.

---

## 📁 Project Structure

```text
Tower Block/
├── index.html     # Game layout, WebGL viewport, UI overlays, script imports
├── style.css      # Modern typography, game UI state styles, and layout overlay
├── script.js      # Game loop, Three.js 3D rendering engine, Stage, Block, and Game classes
└── README.md      # Project documentation
```

### Key Files & Components

- [index.html](file:///c:/Users/cyberdev/Desktop/Tower%20Block/index.html): Defines the markup structure, score counter, instructions, start button, game over overlay, and loads Three.js & GSAP dependencies.
- [style.css](file:///c:/Users/cyberdev/Desktop/Tower%20Block/style.css): Styles the Google Font (*Comfortaa*), dynamic transitions, and HUD overlays.
- [script.js](file:///c:/Users/cyberdev/Desktop/Tower%20Block/script.js): Contains core logic:
  - `Stage` class: Initializes the Three.js WebGL renderer, scene, lights, and orthographic camera handling.
  - `Block` class: Handles block geometry creation, placement slicing math, falling physics animations, and color calculations.
  - `Game` class: Manages overall game lifecycle states (`ready`, `playing`, `ended`, `resetting`), input handlers, block spawning, and score tracking.

---

## 🛠️ Technologies Used

- **[Three.js (r83)](https://threejs.org/)**: 3D graphics rendering engine using WebGL (Orthographic Camera, Box Geometry, Flat-Shaded Toon Materials, Directional/Ambient Lighting).
- **[GSAP / TweenMax](https://greensock.com/gsap/)**: Smooth tweening animations for camera movements and falling block pieces.
- **HTML5 & CSS3**: Custom typography with Google Fonts (*Comfortaa*) and flexible overlay UI layout.

---

## 🚀 How to Run Locally

No build step or node package installations are required!

1. **Option 1: Direct File Opening**
   - Double-click or open [index.html](file:///c:/Users/cyberdev/Desktop/Tower%20Block/index.html) directly in any modern web browser.

2. **Option 2: Local Web Server (Recommended)**
   - Using VS Code Live Server extension, or run:
     ```bash
     npx serve .
     ```
   - Open `http://localhost:3000` in your browser.

---

## 📄 License

This project is open-source and free to use for educational and personal projects.
