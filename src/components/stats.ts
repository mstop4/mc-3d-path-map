import Stats from 'three/addons/libs/stats.module.js';
import { getSceneObjects } from '../setup';

let statsPanel: Stats;
let trisPanel: Stats.Panel;
let drawsPanel: Stats.Panel;
let renderer: THREE.WebGLRenderer;

export function addStatsPanel() {
  statsPanel = new Stats();
  trisPanel = new Stats.Panel('TRIS', '#E8F', '#222');
  drawsPanel = new Stats.Panel('DRAWS', '#FC4', '#222');

  statsPanel.addPanel(trisPanel);
  statsPanel.addPanel(drawsPanel);
  document.body.appendChild(statsPanel.dom);

  statsPanel.showPanel(0);

  renderer = getSceneObjects().renderer;
}

export function updateStatsPanel() {
  const { triangles, calls } = renderer.info.render;
  trisPanel.update(triangles, 10000);
  drawsPanel.update(calls, 1000);
  statsPanel.update();
}
