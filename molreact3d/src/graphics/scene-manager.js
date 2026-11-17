import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { VRButton } from "three/examples/jsm/webxr/VRButton.js";

/**
 * SceneManager encapsulates:
 * - Three.js WebGLRenderer with optional WebXR VR support
 * - OrbitControls for pan, rotate, zoom
 * - Computer Graphics illumination models: Phong/Blinn-Phong, PBR, and Toon
 * - Camera auto-framing on molecular bounding spheres
 */
export class SceneManager {
  constructor(container) {
    this.container = container;
    this.shadingModel = "phong"; // "phong" | "pbr" | "toon"
    
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0c16);
    this.scene.fog = new THREE.FogExp2(0x0a0c16, 0.005);

    // Camera setup
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 8, 22);

    // Renderer setup with anti-aliasing and color management
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.xr.enabled = true; // Enable WebXR for VR assessment
    this.container.appendChild(this.renderer.domElement);

    // Add VR Button to DOM if WebXR is available
    const vrBtn = VRButton.createButton(this.renderer);
    vrBtn.id = "vrButton";
    vrBtn.style.position = "absolute";
    vrBtn.style.bottom = "20px";
    vrBtn.style.right = "20px";
    vrBtn.style.zIndex = "100";
    this.container.appendChild(vrBtn);

    // OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.rotateSpeed = 0.8;
    this.controls.zoomSpeed = 1.0;
    this.controls.panSpeed = 0.8;

    // Molecular content root group
    this.contentGroup = new THREE.Group();
    this.scene.add(this.contentGroup);

    // Overlay elements (labels, distance lines)
    this.overlayGroup = new THREE.Group();
    this.scene.add(this.overlayGroup);

    this.setupLighting();
    this.setupResize();
  }

  setupLighting() {
    this.lightsGroup = new THREE.Group();
    this.scene.add(this.lightsGroup);

    // 1. Ambient Light (balanced base illumination)
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.lightsGroup.add(this.ambientLight);

    // 2. Primary Key Light (upper right)
    this.keyLight = new THREE.DirectionalLight(0xffffff, 1.3);
    this.keyLight.position.set(15, 25, 20);
    this.lightsGroup.add(this.keyLight);

    // 3. Fill Light (soft warm side light)
    this.fillLight = new THREE.DirectionalLight(0xaaccff, 0.6);
    this.fillLight.position.set(-15, -5, 10);
    this.lightsGroup.add(this.fillLight);

    // 4. Rim / Back Light (creates subtle edge highlights on molecular spheres)
    this.rimLight = new THREE.DirectionalLight(0x7799ff, 0.8);
    this.rimLight.position.set(0, -15, -20);
    this.lightsGroup.add(this.rimLight);

    // 5. Dynamic Reaction Spotlight / Point Light (focal glow at transition center)
    this.reactionLight = new THREE.PointLight(0xffaa44, 0.0, 30);
    this.reactionLight.position.set(0, 0, 0);
    this.lightsGroup.add(this.reactionLight);
  }

  setShadingModel(model) {
    this.shadingModel = model;
  }

  createAtomMaterial(colorHex, isHighlighted = false) {
    if (this.shadingModel === "pbr") {
      return new THREE.MeshStandardMaterial({
        color: colorHex,
        roughness: isHighlighted ? 0.2 : 0.35,
        metalness: 0.15,
        emissive: isHighlighted ? 0x442200 : 0x000000,
        emissiveIntensity: isHighlighted ? 0.6 : 0.0
      });
    } else if (this.shadingModel === "toon") {
      return new THREE.MeshToonMaterial({
        color: colorHex,
      });
    } else {
      // Classic Blinn-Phong (MeshPhongMaterial) - Primary CG requirement
      return new THREE.MeshPhongMaterial({
        color: colorHex,
        shininess: isHighlighted ? 120 : 65,
        specular: 0x444444,
        emissive: isHighlighted ? 0x552200 : 0x000000
      });
    }
  }

  createBondMaterial(colorHex = 0x9e9e9e, opacity = 1.0) {
    if (this.shadingModel === "pbr") {
      return new THREE.MeshStandardMaterial({
        color: colorHex,
        roughness: 0.4,
        metalness: 0.1,
        transparent: opacity < 0.99,
        opacity: opacity
      });
    } else if (this.shadingModel === "toon") {
      return new THREE.MeshToonMaterial({
        color: colorHex,
        transparent: opacity < 0.99,
        opacity: opacity
      });
    } else {
      // Classic Blinn-Phong
      return new THREE.MeshPhongMaterial({
        color: colorHex,
        shininess: 40,
        specular: 0x222222,
        transparent: opacity < 0.99,
        opacity: opacity
      });
    }
  }

  clearContent() {
    while (this.contentGroup.children.length > 0) {
      const obj = this.contentGroup.children[0];
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
      this.contentGroup.remove(obj);
    }

    while (this.overlayGroup.children.length > 0) {
      const obj = this.overlayGroup.children[0];
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
      this.overlayGroup.remove(obj);
    }
  }

  focusOnBounds(boxOrSphere) {
    const sphere = boxOrSphere.isSphere ? boxOrSphere : new THREE.Sphere();
    if (!boxOrSphere.isSphere) {
      boxOrSphere.getBoundingSphere(sphere);
    }
    const radius = Math.max(sphere.radius, 4.0);
    const center = sphere.center;

    this.controls.target.copy(center);
    const dist = radius * 2.5;
    this.camera.position.set(center.x + dist * 0.4, center.y + dist * 0.6, center.z + dist * 0.9);
    this.camera.near = 0.1;
    this.camera.far = Math.max(1000, dist * 10);
    this.camera.updateProjectionMatrix();
    this.controls.update();
  }

  setupResize() {
    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  render() {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
