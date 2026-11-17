import * as THREE from "three";
import { getElement } from "../elements.js";

/**
 * 3D Floating Annotation & Hover Tag System
 * Renders sleek, modern HUD callouts anchored directly to hovered atoms and bonds
 * in 3D scene space, implementing the 'Immersion' & 'Interaction' of the 3I's of VR.
 */
export class AnnotationOverlay {
  constructor(sceneManager) {
    this.sm = sceneManager;
    this.targetVector = new THREE.Vector3();
    this.activeTarget = null; // { type: 'atom'|'bond', obj: mesh, data: any }
    this.currentDistance = null;

    // Create the floating DOM element
    this.tagEl = document.createElement("div");
    this.tagEl.id = "hover-annotation-tag";
    this.tagEl.style.position = "absolute";
    this.tagEl.style.pointerEvents = "none";
    this.tagEl.style.zIndex = "1000";
    this.tagEl.style.transform = "translate(-50%, -120%)";
    this.tagEl.style.transition = "opacity 0.15s ease, transform 0.15s ease";
    this.tagEl.style.opacity = "0";
    this.tagEl.style.display = "none";
    this.tagEl.className = "floating-annotation";

    // Style the floating card
    this.tagEl.innerHTML = `
      <div class="tag-card">
        <div class="tag-header">
          <span class="tag-badge" id="tagBadge">C</span>
          <span class="tag-title" id="tagTitle">Atom</span>
        </div>
        <div class="tag-body" id="tagBody">Details</div>
        <div class="tag-arrow"></div>
      </div>
    `;

    document.body.appendChild(this.tagEl);

    // Add CSS styles for the 3D annotation card
    const style = document.createElement("style");
    style.textContent = `
      .floating-annotation {
        filter: drop-shadow(0 4px 16px rgba(0, 0, 0, 0.6));
      }
      .tag-card {
        background: rgba(13, 18, 32, 0.92);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(56, 189, 248, 0.4);
        border-radius: 8px;
        padding: 8px 12px;
        color: #f1f5f9;
        font-family: 'Inter', system-ui, sans-serif;
        font-size: 11.5px;
        line-height: 1.4;
        min-width: 140px;
        max-width: 240px;
        position: relative;
        box-shadow: 0 0 16px rgba(56, 189, 248, 0.2);
      }
      .tag-header {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 4px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        padding-bottom: 4px;
      }
      .tag-badge {
        background: #38bdf8;
        color: #04101a;
        font-weight: 700;
        font-size: 10.5px;
        padding: 2px 6px;
        border-radius: 4px;
      }
      .tag-title {
        font-weight: 600;
        color: #f8fafc;
        font-size: 12px;
      }
      .tag-body {
        color: #94a3b8;
        font-size: 11px;
      }
      .tag-body b {
        color: #38bdf8;
      }
      .tag-arrow {
        position: absolute;
        bottom: -6px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 6px solid rgba(13, 18, 32, 0.92);
      }
    `;
    document.head.appendChild(style);
  }

  showAtom(atom, mesh) {
    this.activeTarget = { type: "atom", atom, mesh };
    const info = getElement(atom.element);

    const badge = this.tagEl.querySelector("#tagBadge");
    const title = this.tagEl.querySelector("#tagTitle");
    const body = this.tagEl.querySelector("#tagBody");

    badge.textContent = atom.element;
    badge.style.backgroundColor = `#${info.color.toString(16).padStart(6, "0")}`;
    badge.style.color = (atom.element === "H" || atom.element === "C" || atom.element === "N") ? "#fff" : "#000";

    title.textContent = `${info.name} ${atom.name ? `(${atom.name})` : ""}`;

    const pos = `(${atom.x.toFixed(1)}, ${atom.y.toFixed(1)}, ${atom.z.toFixed(1)}) Å`;
    const res = atom.resName ? `<div>Residue: <b>${atom.resName} ${atom.resSeq || ""}</b></div>` : "";
    const charge = atom.partialCharge !== undefined ? `<div>Charge: <b>${atom.partialCharge.toFixed(2)} e</b></div>` : "";
    const radii = `<div>Cov: <b>${info.covRadius} Å</b> | vdW: <b>${info.vdwRadius} Å</b></div>`;

    body.innerHTML = `
      <div>Pos: <b>${pos}</b></div>
      ${res}
      ${charge}
      ${radii}
    `;

    this.tagEl.style.display = "block";
    this.tagEl.style.opacity = "1";
    this.updatePosition();
  }

  showBond(bondData, mesh, pA, pB) {
    this.activeTarget = { type: "bond", bondData, mesh, pA, pB };

    const badge = this.tagEl.querySelector("#tagBadge");
    const title = this.tagEl.querySelector("#tagTitle");
    const body = this.tagEl.querySelector("#tagBody");

    const dist = pA.distanceTo(pB);
    const bondName = bondData.name || "Covalent Bond";

    badge.textContent = "—";
    badge.style.backgroundColor = "#f43f5e";
    badge.style.color = "#fff";

    title.textContent = bondName;

    let status = "Intact";
    let statusColor = "#10b981";

    if (bondData.type === "breaking_bond") {
      if (dist > 2.5) {
        status = "Broken / Dissociated";
        statusColor = "#64748b";
      } else if (dist > 1.8) {
        status = "High Strain / Transition State [‡]";
        statusColor = "#f59e0b";
      } else {
        status = "Stretching";
        statusColor = "#f43f5e";
      }
    } else if (bondData.type === "forming_bond") {
      if (dist > 2.6) {
        status = "Approaching (Pre-Reaction)";
        statusColor = "#38bdf8";
      } else if (dist > 1.8) {
        status = "Coordinating Transition State [‡]";
        statusColor = "#f59e0b";
      } else {
        status = "Formed Covalent Linkage";
        statusColor = "#10b981";
      }
    }

    body.innerHTML = `
      <div>Length: <b>${dist.toFixed(3)} Å</b></div>
      <div>State: <b style="color: ${statusColor};">${status}</b></div>
    `;

    this.tagEl.style.display = "block";
    this.tagEl.style.opacity = "1";
    this.updatePosition();
  }

  hide() {
    this.activeTarget = null;
    this.tagEl.style.opacity = "0";
    setTimeout(() => {
      if (!this.activeTarget) this.tagEl.style.display = "none";
    }, 150);
  }

  updatePosition() {
    if (!this.activeTarget) return;

    if (this.activeTarget.type === "atom") {
      this.activeTarget.mesh.getWorldPosition(this.targetVector);
      // Lift slightly above the sphere
      this.targetVector.y += 0.4;
    } else if (this.activeTarget.type === "bond") {
      if (this.activeTarget.pA && this.activeTarget.pB) {
        this.targetVector.copy(this.activeTarget.pA).add(this.activeTarget.pB).multiplyScalar(0.5);
      } else {
        this.activeTarget.mesh.getWorldPosition(this.targetVector);
      }
      this.targetVector.y += 0.3;
    }

    // Project 3D coordinate into 2D screen coordinate
    const vector = this.targetVector.clone();
    vector.project(this.sm.camera);

    // Behind camera check
    if (vector.z > 1.0) {
      this.tagEl.style.opacity = "0";
      return;
    }

    const halfW = window.innerWidth / 2;
    const halfH = window.innerHeight / 2;
    const x = (vector.x * halfW) + halfW;
    const y = -(vector.y * halfH) + halfH;

    this.tagEl.style.left = `${x}px`;
    this.tagEl.style.top = `${y}px`;
    this.tagEl.style.opacity = "1";
  }
}
