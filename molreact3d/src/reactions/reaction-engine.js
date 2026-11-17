import * as THREE from "three";
import { getElement } from "../elements.js";

/**
 * ReactionEngine
 * Animates reaction structural transitions, supports multiple visualization models
 * (Ball-and-Stick, Space-Filling CPK, Stick, Ribbon), and implements the 3I's of VR
 * (Immersion, Interaction, Imagination) with quantum electron pulses and bond strain mechanics.
 */
export class ReactionEngine {
  constructor(sceneManager, onProgressUpdate) {
    this.sm = sceneManager;
    this.onProgressUpdate = onProgressUpdate;

    this.reaction = null;
    this.progress = 0.0;
    this.playing = false;
    this.speed = 0.08; // Slower, deliberate motion for clear visual inspection
    this.loop = true;
    this.representation = "ball_stick"; // "ball_stick" | "space_fill" | "stick" | "ribbon"

    this.atomMeshes = [];
    this.baseBondMeshes = [];
    this.breakingBondMeshes = [];
    this.formingBondMeshes = [];
    this.quantumPulses = []; // 3I's of VR: glowing electron wavepackets traveling along bonds

    this.pulsePhase = 0;

    this.group = new THREE.Group();
    this.sm.contentGroup.add(this.group);
  }

  setRepresentation(repMode) {
    if (this.representation === repMode) return;
    this.representation = repMode;
    if (this.reaction) {
      const currentT = this.progress;
      const wasPlaying = this.playing;
      this.loadReaction(this.reaction, false);
      this.setProgress(currentT);
      this.playing = wasPlaying;
    }
  }

  loadReaction(reactionData, autoFrame = true) {
    this.reaction = reactionData;
    this.clear();

    const { atoms, baseBonds, dynamicBonds } = reactionData;
    const isSpaceFill = this.representation === "space_fill";
    const isStick = this.representation === "stick";

    // 1. Create Atom Meshes according to visualization model
    this.atomMeshes = atoms.map((a) => {
      const info = getElement(a.element);
      let radius = info.drawRadius;
      if (isSpaceFill) {
        radius = info.vdwRadius * 0.72; // Van der Waals steric volume
      } else if (isStick) {
        radius = 0.16; // Uniform stick joint
      }

      const geom = new THREE.SphereGeometry(radius, isSpaceFill ? 28 : 20, isSpaceFill ? 22 : 16);
      const mat = this.sm.createAtomMaterial(info.color);
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(a.x, a.y, a.z);
      mesh.userData = { atom: a, type: "atom" };
      this.group.add(mesh);
      return mesh;
    });

    // Determine bond cylinder radius based on model
    let cylRadius = 0.09;
    if (isStick) cylRadius = 0.15;
    else if (isSpaceFill) cylRadius = 0.04; // subtle core bonds

    const cylGeom = new THREE.CylinderGeometry(cylRadius, cylRadius, 1, 12);

    // 2. Create Base (Stable) Bonds
    this.baseBondMeshes = baseBonds.map(([i, j]) => {
      const mat = this.sm.createBondMaterial(0x888888);
      const mesh = new THREE.Mesh(cylGeom, mat);
      mesh.userData = {
        atomA: i,
        atomB: j,
        type: "bond",
        bondType: "base_bond",
        name: `${atoms[i].element}${i + 1} — ${atoms[j].element}${j + 1} Covalent Bond`
      };
      this.group.add(mesh);
      return { mesh, i, j, name: mesh.userData.name };
    });

    // 3. Create Breaking Bonds (Dynamic with stress coloration)
    this.breakingBondMeshes = (dynamicBonds.breaking || []).map((b) => {
      const mat = new THREE.MeshPhongMaterial({
        color: 0xff3322,
        shininess: 90,
        transparent: true,
        opacity: 1.0
      });
      const mesh = new THREE.Mesh(cylGeom, mat);
      mesh.userData = {
        ...b,
        type: "bond",
        bondType: "breaking_bond",
        name: b.name
      };
      this.group.add(mesh);
      return { mesh, atomA: b.atomA, atomB: b.atomB, name: b.name };
    });

    // 4. Create Forming Bonds (Dynamic with glowing nucleophile attachment)
    this.formingBondMeshes = (dynamicBonds.forming || []).map((b) => {
      const mat = new THREE.MeshPhongMaterial({
        color: 0x00f0ff,
        shininess: 90,
        transparent: true,
        opacity: 0.0
      });
      const mesh = new THREE.Mesh(cylGeom, mat);
      mesh.userData = {
        ...b,
        type: "bond",
        bondType: "forming_bond",
        name: b.name
      };
      this.group.add(mesh);
      return { mesh, atomA: b.atomA, atomB: b.atomB, name: b.name };
    });

    // 5. 3I's of VR: Quantum Electron Pulse wavepackets
    this.setupQuantumPulses();

    if (autoFrame) {
      const box = new THREE.Box3().setFromObject(this.group);
      this.sm.focusOnBounds(box);
      this.setProgress(0.0);
    }
  }

  setupQuantumPulses() {
    // Small glowing spheres that travel back and forth along bonds representing electron probability flow
    const pulseGeom = new THREE.SphereGeometry(0.07, 10, 8);
    const pulseMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85
    });

    // Add pulses to key bonds
    this.quantumPulses = [];
    const bondsToPulse = [...this.breakingBondMeshes, ...this.formingBondMeshes, ...this.baseBondMeshes.slice(0, 4)];
    
    bondsToPulse.forEach((b, idx) => {
      const pulseMesh = new THREE.Mesh(pulseGeom, pulseMat.clone());
      pulseMesh.userData = { type: "quantum_pulse" };
      this.group.add(pulseMesh);
      this.quantumPulses.push({
        mesh: pulseMesh,
        atomA: b.atomA ?? b.i,
        atomB: b.atomB ?? b.j,
        offset: idx * 0.35,
        speed: 1.5 + (idx % 3) * 0.5
      });
    });
  }

  clear() {
    while (this.group.children.length > 0) {
      const obj = this.group.children[0];
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
      this.group.remove(obj);
    }
    this.atomMeshes = [];
    this.baseBondMeshes = [];
    this.breakingBondMeshes = [];
    this.formingBondMeshes = [];
    this.quantumPulses = [];
  }

  setProgress(t) {
    if (!this.reaction) return;
    this.progress = THREE.MathUtils.clamp(t, 0.0, 1.0);

    const positions = this.reaction.trajectory(this.progress);

    // 1. Update atom positions
    for (let i = 0; i < this.atomMeshes.length; i++) {
      if (positions[i]) {
        const [x, y, z] = positions[i];
        this.atomMeshes[i].position.set(x, y, z);
      }
    }

    // 2. Update base bond cylinders
    const up = new THREE.Vector3(0, 1, 0);
    for (const { mesh, i, j } of this.baseBondMeshes) {
      const pA = this.atomMeshes[i].position;
      const pB = this.atomMeshes[j].position;
      const dir = pB.clone().sub(pA);
      const dist = dir.length();

      mesh.position.copy(pA).add(pB).multiplyScalar(0.5);
      mesh.scale.set(1, dist, 1);
      mesh.quaternion.setFromUnitVectors(up, dir.normalize());
    }

    // 3. Update breaking bonds with color stress cue (Grey -> Yellow -> Red -> Dissolves)
    for (const { mesh, atomA, atomB } of this.breakingBondMeshes) {
      const pA = this.atomMeshes[atomA].position;
      const pB = this.atomMeshes[atomB].position;
      const dir = pB.clone().sub(pA);
      const dist = dir.length();

      mesh.position.copy(pA).add(pB).multiplyScalar(0.5);
      mesh.scale.set(1, dist, 1);
      mesh.quaternion.setFromUnitVectors(up, dir.normalize());

      if (dist < 1.8) {
        mesh.material.color.setHex(0xaaaaaa);
        mesh.material.opacity = 1.0;
        mesh.visible = true;
      } else if (dist < 2.5) {
        const stress = (dist - 1.8) / 0.7;
        mesh.material.color.setRGB(1.0, 0.8 - 0.7 * stress, 0.1);
        mesh.material.opacity = 1.0 - 0.2 * stress;
        mesh.visible = true;
      } else {
        const fade = THREE.MathUtils.clamp(1.0 - (dist - 2.5) / 0.8, 0.0, 1.0);
        mesh.material.opacity = fade * 0.4;
        mesh.visible = mesh.material.opacity > 0.05;
      }
    }

    // 4. Update forming bonds with nucleophilic approach cue
    for (const { mesh, atomA, atomB } of this.formingBondMeshes) {
      const pA = this.atomMeshes[atomA].position;
      const pB = this.atomMeshes[atomB].position;
      const dir = pB.clone().sub(pA);
      const dist = dir.length();

      mesh.position.copy(pA).add(pB).multiplyScalar(0.5);
      mesh.scale.set(1, dist, 1);
      mesh.quaternion.setFromUnitVectors(up, dir.normalize());

      if (dist > 2.8) {
        mesh.visible = false;
        mesh.material.opacity = 0.0;
      } else if (dist > 1.8) {
        const approach = 1.0 - (dist - 1.8) / 1.0;
        mesh.material.color.setHex(0x00f0ff);
        mesh.material.opacity = approach * 0.8;
        mesh.visible = true;
      } else {
        mesh.material.color.setHex(0xaaaaaa);
        mesh.material.opacity = 1.0;
        mesh.visible = true;
      }
    }

    // Dynamic reaction spotlight at transition center
    if (this.sm.reactionLight) {
      const tsFactor = Math.sin(this.progress * Math.PI);
      this.sm.reactionLight.intensity = tsFactor * 1.8;
    }

    if (this.onProgressUpdate) {
      const energy = this.calculateEnergy(this.progress);
      this.onProgressUpdate(this.progress, energy);
    }
  }

  calculateEnergy(t) {
    if (!this.reaction) return 0;
    const { activationEnergy, deltaG } = this.reaction.energyProfile;
    const peak = Math.exp(-Math.pow((t - 0.5) / 0.18, 2));
    const step = t * t * (3 - 2 * t);
    return activationEnergy * peak + deltaG * step;
  }

  update(dt) {
    // 3I's of VR: Animate quantum electron pulse wavepackets
    this.pulsePhase += dt;
    for (const p of this.quantumPulses) {
      if (this.atomMeshes[p.atomA] && this.atomMeshes[p.atomB]) {
        const pA = this.atomMeshes[p.atomA].position;
        const pB = this.atomMeshes[p.atomB].position;
        // Ping-pong travel along the bond
        const alpha = (Math.sin((this.pulsePhase * p.speed) + p.offset) + 1) * 0.5;
        p.mesh.position.lerpVectors(pA, pB, alpha);
        // Pulse glow
        p.mesh.material.opacity = 0.4 + 0.5 * Math.sin(this.pulsePhase * 4.0);
      }
    }

    if (!this.playing || !this.reaction) return;

    this.progress += dt * this.speed;
    if (this.progress >= 1.0) {
      if (this.loop) {
        this.progress = 0.0;
      } else {
        this.progress = 1.0;
        this.playing = false;
      }
    }
    this.setProgress(this.progress);
  }
}
