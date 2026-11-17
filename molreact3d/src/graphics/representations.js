import * as THREE from "three";
import { getElement } from "../elements.js";

/**
 * Visualization Models Builder:
 * Supports:
 * - Ball-and-Stick (Instanced or Discrete)
 * - Space-Filling (CPK van der Waals radii)
 * - Licorice / Stick
 * - Protein Backbone Ribbon / Cartoon (Tube spline through C-alpha coordinates)
 */
export class RepresentationBuilder {
  constructor(sceneManager) {
    this.sm = sceneManager;
  }

  build(modelData, mode = "ball_stick") {
    const group = new THREE.Group();
    const { atoms, bonds, caBackbone, secondaryStructure } = modelData;

    if (!atoms || atoms.length === 0) return group;

    const isLarge = atoms.length > 80;

    switch (mode) {
      case "space_fill":
        this.buildSpaceFilling(group, atoms, isLarge);
        break;

      case "stick":
        this.buildLicoriceStick(group, atoms, bonds, isLarge);
        break;

      case "ribbon":
        if (caBackbone && caBackbone.length > 3) {
          this.buildRibbon(group, caBackbone, secondaryStructure);
          // Also show ligands / heteroatoms as ball-and-stick
          const heteroAtoms = atoms.filter(a => a.isHetero);
          if (heteroAtoms.length > 0) {
            this.buildBallAndStick(group, heteroAtoms, bonds, false, 0.45, 0.12);
          }
        } else {
          // Fallback if no CA backbone is available (e.g., small molecule)
          this.buildBallAndStick(group, atoms, bonds, isLarge);
        }
        break;

      case "ball_stick":
      default:
        this.buildBallAndStick(group, atoms, bonds, isLarge);
        break;
    }

    return group;
  }

  /**
   * Ball-and-Stick Representation:
   * Spheres for atoms + Cylinders for bonds
   */
  buildBallAndStick(group, atoms, bonds, useInstancing = false, sphereScale = 1.0, cylinderRadius = 0.09) {
    if (useInstancing) {
      this.buildInstancedAtoms(group, atoms, (info) => info.drawRadius * sphereScale);
      if (bonds && bonds.length > 0) {
        this.buildInstancedBonds(group, atoms, bonds, cylinderRadius);
      }
    } else {
      // Discrete meshes for interactive reaction animation and raycasting
      const sphereGeomCache = new Map();
      const getSphereGeom = (radius) => {
        const key = radius.toFixed(2);
        if (!sphereGeomCache.has(key)) {
          sphereGeomCache.set(key, new THREE.SphereGeometry(radius, 24, 18));
        }
        return sphereGeomCache.get(key);
      };

      const atomMeshes = [];
      atoms.forEach((a) => {
        const info = getElement(a.element);
        const radius = info.drawRadius * sphereScale;
        const mat = this.sm.createAtomMaterial(info.color);
        const mesh = new THREE.Mesh(getSphereGeom(radius), mat);
        mesh.position.set(a.x, a.y, a.z);
        mesh.userData = { atom: a, type: "atom" };
        group.add(mesh);
        atomMeshes.push(mesh);
      });

      if (bonds && bonds.length > 0) {
        const cylGeom = new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, 1, 12);
        const up = new THREE.Vector3(0, 1, 0);

        bonds.forEach(([i, j]) => {
          if (!atoms[i] || !atoms[j]) return;
          const a = atoms[i], b = atoms[j];
          const pA = new THREE.Vector3(a.x, a.y, a.z);
          const pB = new THREE.Vector3(b.x, b.y, b.z);
          const dist = pA.distanceTo(pB);

          const mat = this.sm.createBondMaterial(0xaaaaaa);
          const mesh = new THREE.Mesh(cylGeom, mat);
          mesh.position.copy(pA).add(pB).multiplyScalar(0.5);
          mesh.scale.set(1, dist, 1);
          mesh.quaternion.setFromUnitVectors(up, pB.clone().sub(pA).normalize());
          mesh.userData = { atomA: i, atomB: j, type: "bond" };
          group.add(mesh);
        });
      }
    }
  }

  /**
   * Space-Filling (CPK) Representation:
   * Van der Waals spheres demonstrating true molecular steric volume
   */
  buildSpaceFilling(group, atoms, useInstancing = false) {
    const scale = 0.65; // scaled vdW radii for balanced visual density
    if (useInstancing) {
      this.buildInstancedAtoms(group, atoms, (info) => info.vdwRadius * scale, 18, 14);
    } else {
      atoms.forEach((a) => {
        const info = getElement(a.element);
        const radius = info.vdwRadius * scale;
        const geom = new THREE.SphereGeometry(radius, 24, 20);
        const mat = this.sm.createAtomMaterial(info.color);
        const mesh = new THREE.Mesh(geom, mat);
        mesh.position.set(a.x, a.y, a.z);
        mesh.userData = { atom: a, type: "atom" };
        group.add(mesh);
      });
    }
  }

  /**
   * Licorice / Stick Representation:
   * Equal thickness cylinders and small sphere joints
   */
  buildLicoriceStick(group, atoms, bonds, useInstancing = false) {
    this.buildBallAndStick(group, atoms, bonds, useInstancing, 0.45, 0.16);
  }

  /**
   * High-Performance Instanced Rendering for Atoms
   * Groups atoms by element type to execute a single draw call per element
   */
  buildInstancedAtoms(group, atoms, radiusFn, widthSegments = 16, heightSegments = 12) {
    const byElement = new Map();
    atoms.forEach((a, idx) => {
      const el = a.element || "C";
      if (!byElement.has(el)) byElement.set(el, []);
      byElement.get(el).push(idx);
    });

    const dummy = new THREE.Object3D();

    for (const [element, indices] of byElement.entries()) {
      const info = getElement(element);
      const radius = radiusFn(info);
      const geom = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
      const mat = this.sm.createAtomMaterial(info.color);
      const instancedMesh = new THREE.InstancedMesh(geom, mat, indices.length);
      instancedMesh.castShadow = true;
      instancedMesh.receiveShadow = true;

      indices.forEach((atomIdx, i) => {
        const a = atoms[atomIdx];
        dummy.position.set(a.x, a.y, a.z);
        dummy.scale.set(1, 1, 1);
        dummy.quaternion.identity();
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);
      });

      instancedMesh.instanceMatrix.needsUpdate = true;
      instancedMesh.userData = { element, count: indices.length, type: "instanced_atoms" };
      group.add(instancedMesh);
    }
  }

  /**
   * High-Performance Instanced Rendering for Bonds
   */
  buildInstancedBonds(group, atoms, bonds, radius = 0.08) {
    const validBonds = bonds.filter(([i, j]) => atoms[i] && atoms[j]);
    if (validBonds.length === 0) return;

    const cylGeom = new THREE.CylinderGeometry(radius, radius, 1, 8);
    const mat = this.sm.createBondMaterial(0x999999);
    const instancedBonds = new THREE.InstancedMesh(cylGeom, mat, validBonds.length);

    const dummy = new THREE.Object3D();
    const up = new THREE.Vector3(0, 1, 0);
    const pA = new THREE.Vector3(), pB = new THREE.Vector3(), dir = new THREE.Vector3();

    validBonds.forEach(([i, j], idx) => {
      pA.set(atoms[i].x, atoms[i].y, atoms[i].z);
      pB.set(atoms[j].x, atoms[j].y, atoms[j].z);
      dir.subVectors(pB, pA);
      const dist = dir.length();

      dummy.position.copy(pA).add(pB).multiplyScalar(0.5);
      dummy.scale.set(1, dist, 1);
      dummy.quaternion.setFromUnitVectors(up, dir.normalize());
      dummy.updateMatrix();
      instancedBonds.setMatrixAt(idx, dummy.matrix);
    });

    instancedBonds.instanceMatrix.needsUpdate = true;
    instancedBonds.userData = { count: validBonds.length, type: "instanced_bonds" };
    group.add(instancedBonds);
  }

  /**
   * Protein Backbone Ribbon / Cartoon Representation:
   * Generates a 3D tubular spline along consecutive alpha-carbon (C-alpha) positions
   * Colored by secondary structure (Helices = Red/Pink, Sheets = Yellow, Loops = Cyan)
   */
  buildRibbon(group, caBackbone, secondaryStructure) {
    if (caBackbone.length < 3) return;

    const points = caBackbone.map(c => new THREE.Vector3(c.x, c.y, c.z));
    const curve = new THREE.CatmullRomCurve3(points, false, "centripetal", 0.5);

    const tubeSegments = Math.max(points.length * 5, 64);
    const tubeGeom = new THREE.TubeGeometry(curve, tubeSegments, 0.45, 10, false);

    // Color vertices based on secondary structure classification
    const colors = [];
    const count = tubeGeom.attributes.position.count;
    const colorHelix = new THREE.Color(0xff2a6d); // Vivid magenta/rose for alpha helix
    const colorSheet = new THREE.Color(0xffb703); // Golden yellow for beta sheet
    const colorLoop  = new THREE.Color(0x00b4d8); // Cyan/sky blue for loops/turns

    const helices = secondaryStructure?.helices || [];
    const sheets = secondaryStructure?.sheets || [];

    for (let i = 0; i < count; i++) {
      // Find approximate residue along the spline curve
      const ratio = i / count;
      const resIdx = Math.min(Math.floor(ratio * caBackbone.length), caBackbone.length - 1);
      const ca = caBackbone[resIdx];
      const seq = ca.resSeq;
      const chain = ca.chain;

      const isHelix = helices.some(h => h.chain === chain && seq >= h.startSeq && seq <= h.endSeq);
      const isSheet = sheets.some(s => s.chain === chain && seq >= s.startSeq && seq <= s.endSeq);

      if (isHelix) {
        colors.push(colorHelix.r, colorHelix.g, colorHelix.b);
      } else if (isSheet) {
        colors.push(colorSheet.r, colorSheet.g, colorSheet.b);
      } else {
        colors.push(colorLoop.r, colorLoop.g, colorLoop.b);
      }
    }

    tubeGeom.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

    const tubeMat = new THREE.MeshPhongMaterial({
      vertexColors: true,
      shininess: 70,
      side: THREE.DoubleSide
    });

    const ribbonMesh = new THREE.Mesh(tubeGeom, tubeMat);
    ribbonMesh.castShadow = true;
    ribbonMesh.receiveShadow = true;
    ribbonMesh.userData = { type: "protein_ribbon" };
    group.add(ribbonMesh);
  }
}
