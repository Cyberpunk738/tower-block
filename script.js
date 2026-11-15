(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  if (!window.THREE || !window.TowerLogic) { $('error').hidden = false; return; }
  const Logic = window.TowerLogic;
  const modes = { classic: 'Classic', zen: 'Zen', timed: 'Time attack' };
  const settingsKey = 'tower-block-settings-v1';
  const scoresKey = 'tower-block-scores-v1';
  function read(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (_) { return fallback; } }
  function write(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) { /* Game remains playable without storage. */ } }
  let settings = read(settingsKey, {}), bests = read(scoresKey, {});
  let soundEnabled = settings.sound === true, audio;
  const soundButton = $('sound');
  function syncSound() { soundButton.setAttribute('aria-pressed', String(soundEnabled)); soundButton.querySelector('span').textContent = soundEnabled ? 'Sound on' : 'Sound off'; }
  function beep(perfect) {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      audio = audio || new AudioContext();
      if (audio.state === 'suspended') audio.resume();
      const oscillator = audio.createOscillator(), gain = audio.createGain();
      oscillator.type = 'sine'; oscillator.frequency.value = perfect ? 660 : 330;
      gain.gain.setValueAtTime(0.045, audio.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.15);
      oscillator.connect(gain); gain.connect(audio.destination); oscillator.start(); oscillator.stop(audio.currentTime + 0.15);
    } catch (_) { /* Audio is optional. */ }
  }
  soundButton.addEventListener('click', () => { soundEnabled = !soundEnabled; settings.sound = soundEnabled; write(settingsKey, settings); syncSound(); }); syncSound();
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true }); } catch (_) { $('error').hidden = false; return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); renderer.setClearColor(0xffd51b); $('game').appendChild(renderer.domElement);
  const scene = new THREE.Scene(); scene.fog = new THREE.Fog(0xffd51b, 40, 120);
  const camera = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 200);
  scene.add(new THREE.AmbientLight(0xffffff, 0.72));
  const light = new THREE.DirectionalLight(0xffffff, 0.75); light.position.set(8, 18, 12); scene.add(light);
  const tower = new THREE.Group(), debris = new THREE.Group(), scenery = new THREE.Group(); scene.add(tower); scene.add(debris); scene.add(scenery);
  const floor = new THREE.Mesh(new THREE.BoxGeometry(90, 0.5, 90), new THREE.MeshLambertMaterial({ color: 0x7b24bc })); floor.position.y = -0.8; scenery.add(floor);
  // Decorative skyline is deliberately deterministic and does not affect play.
  for (let i = 0; i < 50; i++) { const h = 1 + ((i * 17) % 11) * 0.35; const building = new THREE.Mesh(new THREE.BoxGeometry(1.3, h, 1.3), new THREE.MeshLambertMaterial({ color: i % 3 ? 0xf247b3 : 0x8a37c2 })); const a = i * 2.39996, radius = 11 + (i % 6) * 2; building.position.set(Math.cos(a) * radius, h / 2 - 0.5, Math.sin(a) * radius); scenery.add(building); }
  function resize() { const width = $('game').clientWidth, height = $('game').clientHeight; const aspect = width / Math.max(1, height), view = width < 700 ? 15 : 12; camera.left = -view * aspect; camera.right = view * aspect; camera.top = view; camera.bottom = -view; camera.updateProjectionMatrix(); renderer.setSize(width, height); }
  addEventListener('resize', resize); resize();
  function dispose(mesh) { if (mesh.geometry) mesh.geometry.dispose(); if (mesh.material) mesh.material.dispose(); }
  function clear(group) { while (group.children.length) { const child = group.children[0]; group.remove(child); dispose(child); } }
  function meshFor(block, color) { const mesh = new THREE.Mesh(new THREE.BoxGeometry(block.w, 0.8, block.d), new THREE.MeshLambertMaterial({ color: color })); mesh.position.set(block.x, block.y, block.z); return mesh; }
  function blockColor(n) { const color = new THREE.Color(); color.setHSL((0.47 + n * 0.033) % 1, 0.62, 0.62); return color; }
  let mode = 'classic', state = 'menu', blocks = [], active = null, score = 0, streak = 0, bestStreak = 0, timeLeft = 60, cameraY = 0, cameraX = 0, cameraZ = 0, last = 0, feedbackUntil = 0;
  function setMode(value) { mode = value; document.querySelectorAll('.mode').forEach(button => { const selected = button.dataset.mode === mode; button.classList.toggle('selected', selected); button.setAttribute('aria-pressed', String(selected)); }); }
  document.querySelectorAll('.mode').forEach(button => button.addEventListener('click', () => setMode(button.dataset.mode)));
  function updateHud() { $('score').textContent = score; $('best').textContent = bests[mode] || 0; $('metric-label').textContent = mode === 'timed' ? 'TIME' : 'STREAK'; $('metric').textContent = mode === 'timed' ? Math.ceil(timeLeft) + 's' : streak; }
  function showFeedback(text) { $('feedback').textContent = text; feedbackUntil = performance.now() + 900; }
  function spawn() {
    const previous = blocks[blocks.length - 1], axis = score % 2 ? 'z' : 'x';
    active = { x: previous.x, z: previous.z, y: previous.y + 0.8, w: previous.w, d: previous.d, axis: axis, direction: 1, color: blockColor(score + 1) };
    active[axis] = previous[axis] - 6.5; active.mesh = meshFor(active, active.color); tower.add(active.mesh);
  }
  function reset() {
    clear(tower); clear(debris); blocks = []; score = 0; streak = 0; bestStreak = 0; timeLeft = 60; cameraY = 1;
    const base = { x: 0, y: 0, z: 0, w: 5, d: 5 }; blocks.push(base); tower.add(meshFor(base, 0xcfff62)); spawn(); updateHud();
  }
  function start() { reset(); $('app').classList.add('in-game'); state = 'playing'; last = 0; $('menu').hidden = true; $('results').hidden = true; $('paused').hidden = true; $('hud').hidden = false; $('pause').hidden = false; $('hint').hidden = false; $('feedback').textContent = ''; $('pause').focus(); }
  function end(reason) {
    if (state !== 'playing') return; state = 'ended'; $('pause').hidden = true; $('hint').hidden = true;
    const previousBest = Number(bests[mode]) || 0, newBest = score > previousBest; if (newBest) { bests[mode] = score; write(scoresKey, bests); }
    updateHud(); $('result-title').textContent = newBest ? 'A new personal best.' : 'Nice building.';
    $('result-detail').textContent = (reason === 'time' ? 'Time is up. ' : 'Your tower reached ' + score + (score === 1 ? ' floor. ' : ' floors. ')) + modes[mode] + ' mode';
    $('final-score').textContent = score; $('final-streak').textContent = bestStreak; $('final-best').textContent = bests[mode] || 0; $('results').hidden = false; $('again').focus();
  }
  function pause() { if (state !== 'playing') return; state = 'paused'; $('paused').hidden = false; $('resume').focus(); }
  function resume() { if (state !== 'paused') return; state = 'playing'; last = 0; $('paused').hidden = true; $('pause').focus(); }
  function menu() { $('app').classList.remove('in-game'); state = 'menu'; clear(tower); clear(debris); $('paused').hidden = true; $('results').hidden = true; $('hud').hidden = true; $('pause').hidden = true; $('hint').hidden = true; $('feedback').textContent = ''; $('menu').hidden = false; cameraY = 1; reset(); $('start').focus(); }
  function place() {
    if (state !== 'playing' || !active) return;
    const previous = blocks[blocks.length - 1], axis = active.axis, sizeKey = axis === 'x' ? 'w' : 'd';
    const result = Logic.intersect(previous[axis], active[axis], previous[sizeKey], Math.min(0.13, previous[sizeKey] * 0.15));
    if (result.kind === 'miss') {
      streak = 0; beep(false);
      if (mode === 'zen') { active[axis] = previous[axis] - 6.5; active.direction = 1; active.mesh.position[axis] = active[axis]; showFeedback('Take another shot'); updateHud(); return; }
      end('miss'); return;
    }
    tower.remove(active.mesh); dispose(active.mesh);
    const oldSize = active[sizeKey]; active[axis] = result.center; active[sizeKey] = result.size;
    const placed = { x: active.x, y: active.y, z: active.z, w: active.w, d: active.d }; blocks.push(placed); tower.add(meshFor(placed, active.color));
    if (result.kind === 'placed') { const cut = { x: active.x, y: active.y, z: active.z, w: active.w, d: active.d }; cut[axis] = result.offcutCenter; cut[sizeKey] = oldSize - result.size; const piece = meshFor(cut, active.color); piece.userData.velocity = 0; piece.userData.spin = Math.sign(result.offcutCenter - previous[axis]) * 1.3; debris.add(piece); streak = 0; }
    else { streak++; bestStreak = Math.max(bestStreak, streak); showFeedback(streak > 1 ? 'PERFECT × ' + streak : 'PERFECT'); }
    beep(result.kind === 'perfect'); score++; updateHud(); if (score >= 3) $('hint').hidden = true; spawn();
  }
  $('start').addEventListener('click', start); $('again').addEventListener('click', start); $('pause').addEventListener('click', pause); $('resume').addEventListener('click', resume); document.querySelectorAll('.menu-return').forEach(button => button.addEventListener('click', menu));
  $('game').addEventListener('pointerdown', event => { if (event.button === 0) place(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') { if (state === 'playing') pause(); else if (state === 'paused') resume(); return; }
    if (event.code === 'Space' && state === 'playing' && !event.repeat) { event.preventDefault(); place(); }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden && state === 'playing') pause(); });
  renderer.domElement.addEventListener('webglcontextlost', event => { event.preventDefault(); if (state === 'playing') pause(); $('error').hidden = false; });
  renderer.domElement.addEventListener('webglcontextrestored', () => { $('error').hidden = true; });
  function frame(now) {
    requestAnimationFrame(frame); const elapsed = last ? Math.max(0, (now - last) / 1000) : 0; const dt = Math.min(elapsed, 0.05); last = now;
    if (state === 'playing') {
      if (mode === 'timed') { timeLeft = Math.max(0, timeLeft - elapsed); updateHud(); if (timeLeft <= 0) end('time'); }
      if (state === 'playing' && active) { const target = blocks[blocks.length - 1][active.axis]; const motion = Logic.advance(active[active.axis], active.direction, Math.min(13, 7.2 + score * 0.14), dt, target - 6.5, target + 6.5); active[active.axis] = motion.position; active.direction = motion.direction; active.mesh.position[active.axis] = motion.position; }
      for (let i = debris.children.length - 1; i >= 0; i--) { const piece = debris.children[i]; piece.userData.velocity += 14 * dt; piece.position.y -= piece.userData.velocity * dt; piece.rotation.z += piece.userData.spin * dt; if (piece.position.y < cameraY - 25) { debris.remove(piece); dispose(piece); } }
    }
    const targetY = state === 'menu' ? 2 : Math.max(2, (active ? active.y : 0) - 1); cameraY += (targetY - cameraY) * Math.min(1, dt * 3); const targetBlock = blocks[blocks.length - 1] || { x: 0, z: 0 }; const ease = Math.min(1, dt * 3); cameraX += (targetBlock.x - cameraX) * ease; cameraZ += (targetBlock.z - cameraZ) * ease; camera.position.set(cameraX + 16, cameraY + 14, cameraZ + 16); camera.lookAt(new THREE.Vector3(cameraX, cameraY, cameraZ));
    if (feedbackUntil && now > feedbackUntil) { $('feedback').textContent = ''; feedbackUntil = 0; }
    renderer.render(scene, camera);
  }
  reset(); requestAnimationFrame(frame);
})();
