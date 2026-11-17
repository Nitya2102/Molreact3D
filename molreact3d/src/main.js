import * as THREE from "three";
import { SceneManager } from "./graphics/scene-manager.js";
import { RepresentationBuilder } from "./graphics/representations.js";
import { MeasurementTool } from "./graphics/measurement.js";
import { AnnotationOverlay } from "./graphics/annotation-overlay.js";
import { ReactionEngine } from "./reactions/reaction-engine.js";
import { REACTIONS } from "./reactions/reaction-data.js";
import { EnergyChart } from "./ui/energy-chart.js";
import { fetchFromRCSB, fetchFromPubChem } from "./api-service.js";
import { parseCIF } from "./parsers/cif-parser.js";
import { parsePDB } from "./parsers/pdb-parser.js";

// ---------- App Initialization ----------
const container = document.getElementById("canvas-container");
const sm = new SceneManager(container);
const repBuilder = new RepresentationBuilder(sm);
const annotationOverlay = new AnnotationOverlay(sm);

let currentMode = "reactions"; // "reactions" | "explorer"
let currentRepresentation = "ball_stick"; // "ball_stick" | "space_fill" | "stick" | "ribbon"
let explorerModelData = null;

// ---------- UI Element References ----------
const tabReactions = document.getElementById("tabReactions");
const tabExplorer = document.getElementById("tabExplorer");
const panelReactions = document.getElementById("panelReactions");
const panelExplorer = document.getElementById("panelExplorer");

const reactionSelect = document.getElementById("reactionSelect");
const reactionDesc = document.getElementById("reactionDesc");
const reactionEq = document.getElementById("reactionEq");

const playBtn = document.getElementById("playBtn");
const resetBtn = document.getElementById("resetBtn");
const speedSelect = document.getElementById("speedSelect");
const progressSlider = document.getElementById("progressSlider");
const timeDisplay = document.getElementById("timeDisplay");

// Dynamic Bottom Caption Elements
const captionBar = document.getElementById("caption-bar");
const captionStage = document.getElementById("captionStage");
const captionProgress = document.getElementById("captionProgress");
const captionText = document.getElementById("captionText");

const repSelect = document.getElementById("repSelect");
const shadingSelect = document.getElementById("shadingSelect");

const apiInput = document.getElementById("apiInput");
const fetchPdbBtn = document.getElementById("fetchPdbBtn");
const fetchPubchemBtn = document.getElementById("fetchPubchemBtn");
const statusEl = document.getElementById("status");

const measureBadge = document.getElementById("measureBadge");
const clearMeasureBtn = document.getElementById("clearMeasureBtn");
const caliperBar = document.getElementById("caliper-bar");

const energyCanvas = document.getElementById("energyCanvas");

// ---------- Setup Energy Chart & Reaction Engine ----------
const energyChart = new EnergyChart(energyCanvas, (t) => {
  reactionEngine.setProgress(t);
  progressSlider.value = t;
  timeDisplay.textContent = `${(t * 100).toFixed(0)}%`;
});

function updateCaptions(reaction, progress) {
  if (!reaction || !reaction.captions) return;
  const cap = reaction.captions.find(c => progress >= c.tStart && progress <= c.tEnd) || reaction.captions[0];
  if (cap) {
    captionStage.textContent = cap.stage;
    captionProgress.textContent = `${(progress * 100).toFixed(0)}%`;
    captionText.textContent = cap.text;

    // Stage color accents
    if (cap.stage.includes("Transition")) {
      captionStage.style.borderColor = "rgba(245, 158, 11, 0.6)";
      captionStage.style.color = "#f59e0b";
      captionStage.style.backgroundColor = "rgba(245, 158, 11, 0.15)";
    } else if (cap.stage.includes("Product")) {
      captionStage.style.borderColor = "rgba(16, 185, 129, 0.6)";
      captionStage.style.color = "#10b981";
      captionStage.style.backgroundColor = "rgba(16, 185, 129, 0.15)";
    } else {
      captionStage.style.borderColor = "rgba(56, 189, 248, 0.4)";
      captionStage.style.color = "#38bdf8";
      captionStage.style.backgroundColor = "rgba(56, 189, 248, 0.15)";
    }
  }
}

const reactionEngine = new ReactionEngine(sm, (progress, energy) => {
  progressSlider.value = progress;
  timeDisplay.textContent = `${(progress * 100).toFixed(0)}%`;
  energyChart.setProgress(progress, energy);
  updateCaptions(reactionEngine.reaction, progress);
});

// ---------- Setup Measurement & Annotation Tool ----------
const measurementTool = new MeasurementTool(
  sm,
  annotationOverlay,
  (measure) => {
    if (!measure) {
      caliperBar.style.display = "none";
      return;
    }
    caliperBar.style.display = "flex";
    if (measure.distance !== null) {
      measureBadge.innerHTML = `
        <span class="highlight">${measure.atom1.element}</span> ⇄ <span class="highlight">${measure.atom2.element}</span>: 
        <strong style="color: #00f0ff;">${measure.distance.toFixed(3)} Å</strong>
      `;
      clearMeasureBtn.style.display = "inline-block";
    } else {
      measureBadge.innerHTML = `Selected 1st atom (${measure.atom1.element}). Click 2nd atom...`;
      clearMeasureBtn.style.display = "none";
    }
  }
);

clearMeasureBtn.addEventListener("click", () => measurementTool.clearMeasurements());

// ---------- Mode Switching ----------
function setMode(mode) {
  currentMode = mode;
  tabReactions.classList.toggle("active", mode === "reactions");
  tabExplorer.classList.toggle("active", mode === "explorer");
  panelReactions.classList.toggle("hidden", mode !== "reactions");
  panelExplorer.classList.toggle("hidden", mode !== "explorer");

  measurementTool.clearMeasurements();
  annotationOverlay.hide();

  if (mode === "reactions") {
    captionBar.style.display = "flex";
    loadSelectedReaction();
  } else {
    captionBar.style.display = "none";
    reactionEngine.clear();
    if (!explorerModelData) {
      loadPresetPdb("PETase (9V6M)", "/9v6m.cif", "cif");
    } else {
      renderExplorerModel();
    }
  }
}

tabReactions.addEventListener("click", () => setMode("reactions"));
tabExplorer.addEventListener("click", () => setMode("explorer"));

// ---------- Reaction Handlers ----------
function loadSelectedReaction() {
  const reactionKey = reactionSelect.value;
  const reaction = REACTIONS[reactionKey];
  if (!reaction) return;

  statusEl.textContent = `Active: ${reaction.name} (${reaction.category})`;
  reactionEq.textContent = reaction.equation;
  reactionDesc.textContent = reaction.description;

  energyChart.setReaction(reaction);
  reactionEngine.setRepresentation(currentRepresentation);
  reactionEngine.loadReaction(reaction);
  playBtn.textContent = "Play";
  playBtn.classList.remove("playing");

  updateCaptions(reaction, 0.0);
}

reactionSelect.addEventListener("change", loadSelectedReaction);

playBtn.addEventListener("click", () => {
  reactionEngine.playing = !reactionEngine.playing;
  playBtn.textContent = reactionEngine.playing ? "Pause" : "Play";
  playBtn.classList.toggle("playing", reactionEngine.playing);
});

resetBtn.addEventListener("click", () => {
  reactionEngine.playing = false;
  playBtn.textContent = "Play";
  playBtn.classList.remove("playing");
  reactionEngine.setProgress(0.0);
});

speedSelect.addEventListener("change", (e) => {
  reactionEngine.speed = parseFloat(e.target.value);
});

progressSlider.addEventListener("input", (e) => {
  const t = parseFloat(e.target.value);
  reactionEngine.playing = false;
  playBtn.textContent = "Play";
  playBtn.classList.remove("playing");
  reactionEngine.setProgress(t);
});

// ---------- Shading Model Control ----------
shadingSelect.addEventListener("change", (e) => {
  sm.setShadingModel(e.target.value);
  if (currentMode === "reactions") {
    loadSelectedReaction();
  } else if (explorerModelData) {
    renderExplorerModel();
  }
});

// ---------- Representation Control (Applies to BOTH Reactions & Explorer!) ----------
repSelect.addEventListener("change", (e) => {
  currentRepresentation = e.target.value;
  if (currentMode === "reactions") {
    reactionEngine.setRepresentation(currentRepresentation);
  } else if (currentMode === "explorer" && explorerModelData) {
    renderExplorerModel();
  }
});

// ---------- Structure Explorer & API Handlers ----------
function renderExplorerModel() {
  if (!explorerModelData) return;
  sm.clearContent();

  const group = repBuilder.build(explorerModelData, currentRepresentation);
  sm.contentGroup.add(group);

  const box = new THREE.Box3().setFromObject(group);
  sm.focusOnBounds(box);

  const { atoms, bonds, caBackbone } = explorerModelData;
  const ribbonNote = (currentRepresentation === "ribbon" && (!caBackbone || caBackbone.length < 3))
    ? " (Note: Molecule has no protein C-alpha backbone, showing Ball-and-Stick)"
    : "";
  statusEl.textContent = `Loaded ${atoms.length} atoms, ${bonds.length} bonds.${ribbonNote}`;
}

async function loadPresetPdb(name, url, format = "pdb") {
  try {
    statusEl.textContent = `Loading preset ${name}...`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Could not load ${url}`);
    const text = await res.text();

    if (format === "cif") {
      explorerModelData = parseCIF(text);
    } else {
      explorerModelData = parsePDB(text);
    }

    renderExplorerModel();
  } catch (err) {
    console.error(err);
    statusEl.textContent = `Error loading ${name}: ${err.message}`;
  }
}

// Online API Query: RCSB PDB
fetchPdbBtn.addEventListener("click", async () => {
  const id = apiInput.value.trim();
  if (!id) {
    statusEl.textContent = "Please enter a 4-character PDB ID (e.g., 1CRN, 4HHB, 1BNA, 1ATP)";
    return;
  }
  try {
    statusEl.textContent = `Querying RCSB PDB REST API for "${id}"...`;
    fetchPdbBtn.disabled = true;
    const data = await fetchFromRCSB(id);
    explorerModelData = data;
    renderExplorerModel();
    statusEl.textContent = `RCSB PDB [${data.metadata.id}]: ${data.metadata.title} (${data.atoms.length} atoms)`;
  } catch (err) {
    console.error(err);
    statusEl.textContent = `RCSB API Error: ${err.message}`;
  } finally {
    fetchPdbBtn.disabled = false;
  }
});

// Online API Query: PubChem
fetchPubchemBtn.addEventListener("click", async () => {
  const query = apiInput.value.trim();
  if (!query) {
    statusEl.textContent = "Please enter a chemical name (e.g., ATP, Aspirin, Caffeine, Glucose, Benzene)";
    return;
  }
  try {
    statusEl.textContent = `Querying NCBI PubChem REST API for "${query}" (3D conformer)...`;
    fetchPubchemBtn.disabled = true;
    const data = await fetchFromPubChem(query);
    explorerModelData = data;
    renderExplorerModel();
    statusEl.textContent = `PubChem [${data.title}]: 3D Conformer with ${data.atoms.length} atoms and ${data.bonds.length} bonds`;
  } catch (err) {
    console.error(err);
    statusEl.textContent = `PubChem API Error: ${err.message}`;
  } finally {
    fetchPubchemBtn.disabled = false;
  }
});

// Quick Preset Chips
document.querySelectorAll(".chip[data-action]").forEach((chip) => {
  chip.addEventListener("click", () => {
    const action = chip.dataset.action;
    const val = chip.dataset.val;
    apiInput.value = val;
    if (action === "rcsb") {
      fetchPdbBtn.click();
    } else if (action === "pubchem") {
      fetchPubchemBtn.click();
    } else if (action === "local-petase") {
      loadPresetPdb("PETase (9V6M)", "/9v6m.cif", "cif");
    } else if (action === "local-ethanol") {
      loadPresetPdb("Ethanol", "/ethanol.pdb", "pdb");
    }
  });
});

// ---------- Main Render Loop ----------
const clock = new THREE.Clock();

sm.renderer.setAnimationLoop(() => {
  const dt = clock.getDelta();
  if (currentMode === "reactions") {
    reactionEngine.update(dt);
  }
  // Smoothly track 3D positions of hovered annotations
  annotationOverlay.updatePosition();
  sm.render();
});

// Start in Reactions mode with ATP Hydrolysis
setMode("reactions");
