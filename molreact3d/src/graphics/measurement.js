import * as THREE from "three";

/**
 * Interactive Raycaster & Distance Measurement Tool
 * Coordinates 3D atom and bond raycasting, communicates with AnnotationOverlay
 * for floating callouts, and manages the distance measurement caliper.
 */
export class MeasurementTool {
  constructor(sceneManager, annotationOverlay, onMeasureUpdate) {
    this.sm = sceneManager;
    this.overlay = annotationOverlay;
    this.onMeasureUpdate = onMeasureUpdate;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-1000, -1000);
    this.selectedAtoms = [];
    this.hoveredMesh = null;

    this.setupEvents();
  }

  setupEvents() {
    const dom = this.sm.renderer.domElement;

    dom.addEventListener("pointermove", (e) => {
      const rect = dom.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      this.checkHover();
    });

    dom.addEventListener("pointerleave", () => {
      this.resetHover();
      if (this.overlay) this.overlay.hide();
    });

    dom.addEventListener("click", () => {
      this.checkClick();
    });
  }

  checkHover() {
    this.raycaster.setFromCamera(this.mouse, this.sm.camera);
    const intersects = this.raycaster.intersectObjects(this.sm.contentGroup.children, true);
    
    // Find closest atom or bond hit (ignore pulses or background objects)
    const validHit = intersects.find(hit => {
      const type = hit.object.userData?.type;
      return type === "atom" || type === "bond" || type === "base_bond" || type === "breaking_bond" || type === "forming_bond";
    });

    if (validHit) {
      const mesh = validHit.object;
      const uData = mesh.userData;

      if (this.hoveredMesh !== mesh) {
        this.resetHover();
        this.hoveredMesh = mesh;
        if (mesh.material?.emissive) {
          mesh.material.emissive.setHex(0x38bdf8);
          if (mesh.material.emissiveIntensity !== undefined) {
            mesh.material.emissiveIntensity = 0.5;
          }
        }
      }

      if (this.overlay) {
        if (uData.type === "atom" && uData.atom) {
          this.overlay.showAtom(uData.atom, mesh);
        } else if (uData.type === "bond" || uData.bondType) {
          // Compute bond endpoint positions
          let pA = null, pB = null;
          if (uData.atomA !== undefined && uData.atomB !== undefined) {
            const root = this.sm.contentGroup;
            // Find positions if atom meshes exist
            const atoms = [];
            root.traverse(child => {
              if (child.userData?.type === "atom") atoms.push(child);
            });
            if (atoms[uData.atomA] && atoms[uData.atomB]) {
              pA = atoms[uData.atomA].position;
              pB = atoms[uData.atomB].position;
            }
          }
          if (!pA) pA = mesh.position.clone();
          if (!pB) pB = mesh.position.clone();
          this.overlay.showBond(uData, mesh, pA, pB);
        }
      }
    } else {
      this.resetHover();
      if (this.overlay) this.overlay.hide();
    }
  }

  resetHover() {
    if (this.hoveredMesh) {
      const isSelected = this.selectedAtoms.some(s => s.mesh === this.hoveredMesh);
      if (!isSelected && this.hoveredMesh.material?.emissive) {
        this.hoveredMesh.material.emissive.setHex(0x000000);
      }
      this.hoveredMesh = null;
    }
  }

  checkClick() {
    this.raycaster.setFromCamera(this.mouse, this.sm.camera);
    const intersects = this.raycaster.intersectObjects(this.sm.contentGroup.children, true);
    const atomHit = intersects.find(hit => hit.object.userData?.type === "atom");

    if (!atomHit) return;

    const mesh = atomHit.object;
    const atom = mesh.userData.atom;

    if (this.selectedAtoms.length >= 2) {
      this.clearMeasurements();
    }

    this.selectedAtoms.push({ mesh, atom, pos: mesh.position.clone() });
    if (mesh.material?.emissive) {
      mesh.material.emissive.setHex(0x00f0ff);
      mesh.material.emissiveIntensity = 0.8;
    }

    if (this.selectedAtoms.length === 2) {
      this.renderMeasurement();
    } else {
      if (this.onMeasureUpdate) {
        this.onMeasureUpdate({
          atom1: atom,
          atom2: null,
          distance: null
        });
      }
    }
  }

  renderMeasurement() {
    const [s1, s2] = this.selectedAtoms;
    const p1 = s1.mesh.position;
    const p2 = s2.mesh.position;
    const dist = p1.distanceTo(p2);

    // 1. Create 3D dashed line
    const points = [p1, p2];
    const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
    const lineMat = new THREE.LineDashedMaterial({
      color: 0x00f0ff,
      dashSize: 0.25,
      gapSize: 0.12,
      linewidth: 2
    });
    const line = new THREE.Line(lineGeom, lineMat);
    line.computeLineDistances();
    this.sm.overlayGroup.add(line);

    // 2. Create Canvas Sprite badge for distance
    const midPoint = p1.clone().add(p2).multiplyScalar(0.5);
    const badgeSprite = this.createDistanceBadge(`${dist.toFixed(2)} Å`);
    badgeSprite.position.copy(midPoint).add(new THREE.Vector3(0, 0.45, 0));
    this.sm.overlayGroup.add(badgeSprite);

    if (this.onMeasureUpdate) {
      this.onMeasureUpdate({
        atom1: s1.atom,
        atom2: s2.atom,
        distance: dist
      });
    }
  }

  createDistanceBadge(text) {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "rgba(10, 20, 35, 0.88)";
    ctx.strokeStyle = "#00f0ff";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(16, 24, 224, 80, 24);
    ctx.fill();
    ctx.stroke();

    ctx.font = "bold 36px 'Inter', sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 128, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, depthTest: false });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(1.4, 0.7, 1.0);
    return sprite;
  }

  clearMeasurements() {
    this.selectedAtoms.forEach(s => {
      if (s.mesh?.material?.emissive) {
        s.mesh.material.emissive.setHex(0x000000);
      }
    });
    this.selectedAtoms = [];
    while (this.sm.overlayGroup.children.length > 0) {
      const obj = this.sm.overlayGroup.children[0];
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
      this.sm.overlayGroup.remove(obj);
    }
    if (this.onMeasureUpdate) {
      this.onMeasureUpdate(null);
    }
  }
}
