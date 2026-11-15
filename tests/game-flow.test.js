'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const logic = require('../game-logic');

// Exercise the actual controller with a simulated DOM and renderer. Rendering and
// real browser input are deliberately outside the scope of this test harness.
function setup() {
  const elements = {}, docEvents = {}, windowEvents = {}, store = {}; let callback, now = 0;
  function element(id) { return elements[id] ||= { id, hidden: false, textContent: '', dataset: {}, clientWidth: 1280, clientHeight: 800, classList: { toggle() {}, add() {}, remove() {} }, events: {}, addEventListener(type, fn) { this.events[type] = fn; }, setAttribute() {}, querySelector() { return element(id + '-span'); }, appendChild() {}, focus() {}, click() { if (this.events.click) this.events.click({ button: 0 }); } }; }
  const modes = ['classic', 'zen', 'timed'].map(name => { const el = element(name); el.dataset.mode = name; return el; });
  const menus = [element('menu1'), element('menu2')];
  const document = { hidden: false, getElementById: element, querySelectorAll: s => s === '.mode' ? modes : menus, addEventListener: (name, fn) => { docEvents[name] = fn; } };
  class Vec { constructor(x=0,y=0,z=0) { this.set(x,y,z); } set(x,y,z) { this.x=x; this.y=y; this.z=z; } }
  class Group { constructor() { this.children=[]; this.position=new Vec(); this.rotation=new Vec(); this.userData={}; } add(x) { this.children.push(x); } remove(x) { this.children.splice(this.children.indexOf(x),1); } }
  class Mesh extends Group { constructor(geometry, material) { super(); this.geometry=geometry; this.material=material; } }
  class Geometry { dispose() {} }
  class Material { dispose() {} }
  class Renderer { constructor() { this.domElement=element('canvas'); } setPixelRatio() {} setClearColor() {} setSize() {} render() {} }
  class Camera { constructor() { this.position=new Vec(); } updateProjectionMatrix() {} lookAt() {} }
  class Color { setHSL() {} }
  const THREE = { WebGLRenderer:Renderer, Scene:Group, Group, Mesh, BoxGeometry:Geometry, MeshLambertMaterial:Material, AmbientLight:Group, DirectionalLight:Group, OrthographicCamera:Camera, Fog:class {}, Vector3:Vec, Color };
  const context = { window: { THREE, TowerLogic:logic, devicePixelRatio:1 }, THREE, document, innerWidth:1280, innerHeight:800, localStorage:{ getItem:k=>store[k], setItem:(k,v)=>{store[k]=v;} }, performance:{now:()=>now}, requestAnimationFrame:fn=>{callback=fn;}, addEventListener:(n,f)=>{windowEvents[n]=f;}, Math, JSON, String, Number };
  vm.runInNewContext(fs.readFileSync(require.resolve('../script.js'),'utf8'), context);
  function tick(ms) { const end=now+ms; while(now<end) { now=Math.min(end,now+16); callback(now); } }
  function key(code) { docEvents.keydown({code, key:code === 'Space' ? ' ' : code, repeat:false, preventDefault(){}}); }
  return { element, modes, tick, key, store, docEvents, document };
}
test('classic: first block reaches target quickly and a miss ends the run', () => { const a=setup(); a.element('start').click(); a.tick(920); a.key('Space'); assert.equal(a.element('score').textContent,1); a.key('Space'); assert.equal(a.element('results').hidden,false); assert.equal(a.element('final-score').textContent,1); assert.equal(JSON.parse(a.store['tower-block-scores-v1']).classic,1); });
test('zen: missed block remains playable without adding a floor', () => { const a=setup(); a.modes[1].click(); a.element('start').click(); a.key('Space'); assert.equal(a.element('results').hidden,true); assert.equal(a.element('score').textContent,0); a.tick(920); a.key('Space'); assert.equal(a.element('score').textContent,1); });
test('pause freezes timed mode; resume continues countdown', () => { const a=setup(); a.modes[2].click(); a.element('start').click(); a.tick(1200); assert.equal(a.element('metric').textContent,'59s'); a.key('Escape'); const paused=a.element('metric').textContent; a.tick(3000); assert.equal(a.element('metric').textContent,paused); a.key('Escape'); a.tick(1500); assert.notEqual(a.element('metric').textContent,paused); });
test('pointer action places a block and hidden tab pauses', () => { const a=setup(); a.element('start').click(); a.tick(920); a.element('game').events.pointerdown({button:0}); assert.equal(a.element('score').textContent,1); a.document.hidden=true; a.docEvents.visibilitychange(); assert.equal(a.element('paused').hidden,false); });

test('time attack ends at zero and reports the result', () => { const a=setup(); a.modes[2].click(); a.element('start').click(); a.tick(60500); assert.equal(a.element('results').hidden,false); assert.match(a.element('result-detail').textContent, /Time is up/); });
