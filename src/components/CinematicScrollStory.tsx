import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { ChevronDown, Plus, Check } from 'lucide-react';

interface CinematicScrollStoryProps {
  onNavigate?: (path: string) => void;
  onScrollToSection?: (id: string) => void;
}

export const CinematicScrollStory: React.FC<CinematicScrollStoryProps> = ({
  onNavigate,
  onScrollToSection,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasMountRef = useRef<HTMLDivElement>(null);

  // Active hotspot state (one active at a time)
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);

  // Hotspots projected screen coordinates (in vw % and vh %)
  const [projectedCoords, setProjectedCoords] = useState<
    Array<{ x: number; y: number; visible: boolean }>
  >([
    { x: 18, y: 56, visible: true },
    { x: 35, y: 42, visible: true },
    { x: 68, y: 64, visible: true },
    { x: 82, y: 48, visible: true },
  ]);

  // Smoothed scroll progress and pointer coordinates
  const [scrollProgress, setScrollProgress] = useState(0);
  const [pointer, setPointer] = useState({ sx: 0, sy: 0 });

  // Responsive check & reduced motion check
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const checkViewport = () => {
      setIsMobile(window.innerWidth <= 820);
    };
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    motionQuery.addEventListener('change', handleMotionChange);

    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => {
      window.removeEventListener('resize', checkViewport);
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  // Hotspot definitions (matching section 10)
  const hotspotsData = useMemo(
    () => [
      {
        id: 0,
        name: 'Cultural Auditorium',
        spec: '450 seats · 2:00 PM',
        anchor: new THREE.Vector3(-16, 7.5, -4),
      },
      {
        id: 1,
        name: 'Computer Laboratory',
        spec: '30 workstations · 1:00 PM',
        anchor: new THREE.Vector3(15, 6.8, -6),
      },
      {
        id: 2,
        name: 'Sports Arena',
        spec: '800 capacity · 3:30 PM',
        anchor: new THREE.Vector3(-7, 6.0, 14),
      },
      {
        id: 3,
        name: 'Varsity Courts',
        spec: '60 capacity · 4:00 PM',
        anchor: new THREE.Vector3(17, 4.5, 10),
      },
    ],
    []
  );

  // -------------------------------------------------------------
  // THREE.JS SCENE SETUP & ANIMATION LOOP
  // -------------------------------------------------------------
  useEffect(() => {
    const mount = canvasMountRef.current;
    if (!mount) return;

    // Detect software WebGL per Three.js guidelines
    const isSoftwareGl = (() => {
      const probe = document.createElement('canvas').getContext('webgl2');
      if (!probe) return true;
      const ext = probe.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : probe.RENDERER;
      const gpu = String(probe.getParameter(param));
      probe.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const fogColor = new THREE.Color(0xdfe5ec);
    scene.fog = new THREE.FogExp2(0xdfe5ec, 0.013);

    const camera = new THREE.PerspectiveCamera(
      42,
      mount.clientWidth / mount.clientHeight,
      0.1,
      600
    );

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mount.appendChild(renderer.domElement);

    // 2. Studio Lighting & Environment Reflection (RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Directional Key Light with soft shadows
    const keyLight = new THREE.DirectionalLight(0xfff5ea, 2.2);
    keyLight.position.set(38, 55, 30);
    keyLight.castShadow = !isSoftwareGl;
    if (keyLight.castShadow) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.camera.near = 5;
      keyLight.shadow.camera.far = 160;
      keyLight.shadow.camera.left = -40;
      keyLight.shadow.camera.right = 40;
      keyLight.shadow.camera.top = 40;
      keyLight.shadow.camera.bottom = -40;
      keyLight.shadow.bias = -0.0004;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    // Cool Hemisphere Fill Light
    const hemiLight = new THREE.HemisphereLight(0xdfe5ec, 0x1e3350, 1.2);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    // Blue and Amber Accent Lights
    const bluePointLight = new THREE.PointLight(0x0077c8, 3.5, 45);
    bluePointLight.position.set(-16, 12, -4);
    scene.add(bluePointLight);

    const amberPointLight = new THREE.PointLight(0xfdb813, 3.0, 45);
    amberPointLight.position.set(16, 10, -6);
    scene.add(amberPointLight);

    // 3. Procedural Materials
    const grassMat = new THREE.MeshStandardMaterial({
      color: 0x5a8638,
      roughness: 0.85,
      metalness: 0.05,
    });
    const stonePathMat = new THREE.MeshStandardMaterial({
      color: 0xd4dbdf,
      roughness: 0.7,
      metalness: 0.1,
    });
    const islandRockMat = new THREE.MeshStandardMaterial({
      color: 0x1e3350,
      roughness: 0.9,
      metalness: 0.15,
    });
    const buildingWallMat = new THREE.MeshStandardMaterial({
      color: 0xf5f7fa,
      roughness: 0.35,
      metalness: 0.1,
    });
    const blueTrimMat = new THREE.MeshStandardMaterial({
      color: 0x0077c8,
      roughness: 0.25,
      metalness: 0.4,
    });
    const domeMat = new THREE.MeshStandardMaterial({
      color: 0x0077c8,
      roughness: 0.3,
      metalness: 0.5,
    });
    const glassAmberMat = new THREE.MeshStandardMaterial({
      color: 0xfdb813,
      emissive: 0xfdb813,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.2,
    });
    const courtGreenMat = new THREE.MeshStandardMaterial({
      color: 0x3d7041,
      roughness: 0.6,
      metalness: 0.05,
    });
    const steelMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.2,
      metalness: 0.85,
    });
    const qrGlowMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 1.6,
      roughness: 0.1,
    });

    // 4. Construct Campus Floating Island Group
    const campusGroup = new THREE.Group();
    scene.add(campusGroup);

    // A. Main Island Base
    const islandShape = new THREE.Shape();
    const r = 32;
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const rad = r + (Math.sin(angle * 3) * 4 + Math.cos(angle * 5) * 2.5);
      const px = Math.cos(angle) * rad;
      const py = Math.sin(angle) * rad;
      if (i === 0) islandShape.moveTo(px, py);
      else islandShape.lineTo(px, py);
    }
    islandShape.closePath();

    const islandBaseGeo = new THREE.ExtrudeGeometry(islandShape, {
      depth: 5,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 2,
      bevelSize: 3,
      bevelThickness: 3,
    });
    islandBaseGeo.rotateX(Math.PI / 2);
    const islandBaseMesh = new THREE.Mesh(islandBaseGeo, grassMat);
    islandBaseMesh.position.set(0, 0, 0);
    islandBaseMesh.receiveShadow = !isSoftwareGl;
    campusGroup.add(islandBaseMesh);

    // Rock underbelly
    const underbellyGeo = new THREE.ConeGeometry(30, 22, 16);
    underbellyGeo.rotateX(Math.PI);
    const underbellyMesh = new THREE.Mesh(underbellyGeo, islandRockMat);
    underbellyMesh.position.set(0, -11, 0);
    campusGroup.add(underbellyMesh);

    // Central Quad Paver Plaza
    const quadGeo = new THREE.CylinderGeometry(14, 15, 0.4, 24);
    const quadMesh = new THREE.Mesh(quadGeo, stonePathMat);
    quadMesh.position.set(0, 0.22, 0);
    quadMesh.receiveShadow = !isSoftwareGl;
    campusGroup.add(quadMesh);

    // B. Cultural Auditorium (Left / Dome Structure)
    const audGroup = new THREE.Group();
    audGroup.position.set(-16, 0.4, -4);

    const audBaseGeo = new THREE.CylinderGeometry(9, 10, 4.5, 32);
    const audBaseMesh = new THREE.Mesh(audBaseGeo, buildingWallMat);
    audBaseMesh.position.y = 2.25;
    audBaseMesh.castShadow = !isSoftwareGl;
    audBaseMesh.receiveShadow = !isSoftwareGl;
    audGroup.add(audBaseMesh);

    const audDomeGeo = new THREE.SphereGeometry(7, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const audDomeMesh = new THREE.Mesh(audDomeGeo, domeMat);
    audDomeMesh.position.y = 4.5;
    audDomeMesh.castShadow = !isSoftwareGl;
    audGroup.add(audDomeMesh);

    // Auditorium Grand Portico Columns
    for (let i = -2; i <= 2; i++) {
      const colGeo = new THREE.CylinderGeometry(0.35, 0.4, 4, 12);
      const colMesh = new THREE.Mesh(colGeo, buildingWallMat);
      colMesh.position.set(i * 1.8, 2, 8.8);
      colMesh.castShadow = !isSoftwareGl;
      audGroup.add(colMesh);
    }
    campusGroup.add(audGroup);

    // C. University Gymnasium & Sports Arena (Back-Left Curved Roof)
    const gymGroup = new THREE.Group();
    gymGroup.position.set(-7, 0.4, 14);

    const gymBaseGeo = new THREE.BoxGeometry(16, 5, 11);
    const gymBaseMesh = new THREE.Mesh(gymBaseGeo, buildingWallMat);
    gymBaseMesh.position.y = 2.5;
    gymBaseMesh.castShadow = !isSoftwareGl;
    gymBaseMesh.receiveShadow = !isSoftwareGl;
    gymGroup.add(gymBaseMesh);

    const gymRoofGeo = new THREE.CylinderGeometry(6, 6, 16.2, 24, 1, false, 0, Math.PI);
    gymRoofGeo.rotateZ(Math.PI / 2);
    const gymRoofMesh = new THREE.Mesh(gymRoofGeo, blueTrimMat);
    gymRoofMesh.position.set(0, 5, 0);
    gymRoofMesh.castShadow = !isSoftwareGl;
    gymGroup.add(gymRoofMesh);
    campusGroup.add(gymGroup);

    // D. High-Performance Computer Laboratory (Right / Amber Lit Windows)
    const labGroup = new THREE.Group();
    labGroup.position.set(15, 0.4, -6);

    const labBaseGeo = new THREE.BoxGeometry(10, 6.5, 9);
    const labBaseMesh = new THREE.Mesh(labBaseGeo, buildingWallMat);
    labBaseMesh.position.y = 3.25;
    labBaseMesh.castShadow = !isSoftwareGl;
    labBaseMesh.receiveShadow = !isSoftwareGl;
    labGroup.add(labBaseMesh);

    // Amber lit window strips
    for (let floor = 1; floor <= 3; floor++) {
      const winGeo = new THREE.BoxGeometry(8.5, 0.9, 0.2);
      const winMesh = new THREE.Mesh(winGeo, glassAmberMat);
      winMesh.position.set(0, floor * 1.7, 4.6);
      labGroup.add(winMesh);

      const winMeshSide = new THREE.BoxGeometry(0.2, 0.9, 7.5);
      const winMeshSideMesh = new THREE.Mesh(winMeshSide, glassAmberMat);
      winMeshSideMesh.position.set(5.1, floor * 1.7, 0);
      labGroup.add(winMeshSideMesh);
    }
    campusGroup.add(labGroup);

    // E. Varsity Tennis & Athletic Courts (Right Foreground)
    const courtGroup = new THREE.Group();
    courtGroup.position.set(17, 0.4, 10);

    const courtSlabGeo = new THREE.BoxGeometry(14, 0.4, 11);
    const courtSlabMesh = new THREE.Mesh(courtSlabGeo, courtGreenMat);
    courtSlabMesh.position.y = 0.2;
    courtSlabMesh.receiveShadow = !isSoftwareGl;
    courtGroup.add(courtSlabMesh);

    // Floodlight Pylons (4 corner poles with lights)
    const pylonOffsets = [
      [-6.5, -5],
      [6.5, -5],
      [-6.5, 5],
      [6.5, 5],
    ];
    pylonOffsets.forEach(([px, pz]) => {
      const poleGeo = new THREE.CylinderGeometry(0.12, 0.15, 7, 8);
      const poleMesh = new THREE.Mesh(poleGeo, steelMat);
      poleMesh.position.set(px, 3.5, pz);
      poleMesh.castShadow = !isSoftwareGl;
      courtGroup.add(poleMesh);

      const lampGeo = new THREE.BoxGeometry(0.6, 0.3, 0.6);
      const lampMesh = new THREE.Mesh(lampGeo, glassAmberMat);
      lampMesh.position.set(px, 7, pz);
      courtGroup.add(lampMesh);
    });
    campusGroup.add(courtGroup);

    // F. Tiered Lecture Hall (Front-Center Amphitheater Block)
    const lectureGroup = new THREE.Group();
    lectureGroup.position.set(4, 0.4, -14);

    const lecBaseGeo = new THREE.CylinderGeometry(7, 8, 3.5, 16, 1, false, 0, Math.PI);
    const lecBaseMesh = new THREE.Mesh(lecBaseGeo, buildingWallMat);
    lecBaseMesh.position.y = 1.75;
    lecBaseMesh.castShadow = !isSoftwareGl;
    lectureGroup.add(lecBaseMesh);
    campusGroup.add(lectureGroup);

    // G. The QR Gate-Pass Pillar (Campus Quad Focal Point)
    const gatePillarGroup = new THREE.Group();
    gatePillarGroup.position.set(0, 0.4, 0);

    const pillarBaseGeo = new THREE.BoxGeometry(1.6, 0.4, 1.6);
    const pillarBaseMesh = new THREE.Mesh(pillarBaseGeo, steelMat);
    pillarBaseMesh.position.y = 0.2;
    gatePillarGroup.add(pillarBaseMesh);

    const pillarBodyGeo = new THREE.BoxGeometry(0.7, 4.4, 0.7);
    const pillarBodyMesh = new THREE.Mesh(pillarBodyGeo, steelMat);
    pillarBodyMesh.position.y = 2.4;
    pillarBodyMesh.castShadow = !isSoftwareGl;
    gatePillarGroup.add(pillarBodyMesh);

    // Glowing QR Scanner Panel
    const qrPanelGeo = new THREE.BoxGeometry(0.55, 0.8, 0.1);
    const qrPanelMesh = new THREE.Mesh(qrPanelGeo, qrGlowMat);
    qrPanelMesh.position.set(0, 3.2, 0.38);
    gatePillarGroup.add(qrPanelMesh);

    // Lit Blue Ribbon / Emblem
    const emblemGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.08, 16);
    emblemGeo.rotateX(Math.PI / 2);
    const emblemMesh = new THREE.Mesh(emblemGeo, blueTrimMat);
    emblemMesh.position.set(0, 4.0, 0.38);
    gatePillarGroup.add(emblemMesh);

    campusGroup.add(gatePillarGroup);

    // H. Campus Foliage Trees (Instanced procedural trees)
    const treeTrunkGeo = new THREE.CylinderGeometry(0.2, 0.35, 1.8, 8);
    const treeLeavesGeo = new THREE.DodecahedronGeometry(1.3, 1);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3525, roughness: 0.9 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x3d6a2a, roughness: 0.8 });

    const treePositions = [
      [-10, 0, -12],
      [-5, 0, -10],
      [-14, 0, 7],
      [-12, 0, 11],
      [4, 0, 12],
      [8, 0, 11],
      [10, 0, 2],
      [11, 0, -2],
      [3, 0, 4],
      [-3, 0, 4],
      [-6, 0, -2],
      [6, 0, -6],
    ];

    treePositions.forEach(([tx, ty, tz]) => {
      const tree = new THREE.Group();
      tree.position.set(tx, ty + 0.4, tz);

      const trunk = new THREE.Mesh(treeTrunkGeo, trunkMat);
      trunk.position.y = 0.9;
      trunk.castShadow = !isSoftwareGl;
      tree.add(trunk);

      const leaves = new THREE.Mesh(treeLeavesGeo, leafMat);
      leaves.position.y = 2.4;
      leaves.castShadow = !isSoftwareGl;
      tree.add(leaves);

      campusGroup.add(tree);
    });

    // 5. Drifting Side Venue Slabs (3 floating rocks)
    const slabs: THREE.Group[] = [];

    // Slab 1: Tennis slab
    const slab1 = new THREE.Group();
    slab1.position.set(-38, 8, -12);
    const slab1Base = new THREE.Mesh(new THREE.ConeGeometry(5, 6, 8), islandRockMat);
    slab1Base.rotateX(Math.PI);
    slab1.add(slab1Base);
    const slab1Top = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 0.8, 8), courtGreenMat);
    slab1Top.position.y = 0.4;
    slab1.add(slab1Top);
    scene.add(slab1);
    slabs.push(slab1);

    // Slab 2: Mini lecture hall
    const slab2 = new THREE.Group();
    slab2.position.set(36, 12, 16);
    const slab2Base = new THREE.Mesh(new THREE.ConeGeometry(6, 7, 8), islandRockMat);
    slab2Base.rotateX(Math.PI);
    slab2.add(slab2Base);
    const slab2Top = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 0.8, 8), grassMat);
    slab2Top.position.y = 0.4;
    slab2.add(slab2Top);
    const slab2Building = new THREE.Mesh(new THREE.BoxGeometry(4, 2.5, 4), buildingWallMat);
    slab2Building.position.y = 1.6;
    slab2.add(slab2Building);
    scene.add(slab2);
    slabs.push(slab2);

    // Slab 3: Mini gymnasium
    const slab3 = new THREE.Group();
    slab3.position.set(-25, -6, 28);
    const slab3Base = new THREE.Mesh(new THREE.ConeGeometry(4.5, 5.5, 7), islandRockMat);
    slab3Base.rotateX(Math.PI);
    slab3.add(slab3Base);
    const slab3Top = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 4.5, 0.8, 7), grassMat);
    slab3Top.position.y = 0.4;
    slab3.add(slab3Top);
    scene.add(slab3);
    slabs.push(slab3);

    // Distant background islands in haze
    for (let i = 0; i < 7; i++) {
      const distIsland = new THREE.Group();
      const angle = (i / 7) * Math.PI * 2;
      const distRadius = 85 + (i % 3) * 20;
      distIsland.position.set(
        Math.cos(angle) * distRadius,
        15 + (i % 4) * 8,
        Math.sin(angle) * distRadius
      );
      const distMesh = new THREE.Mesh(
        new THREE.DodecahedronGeometry(7 + (i % 3) * 3, 0),
        islandRockMat
      );
      distIsland.add(distMesh);
      scene.add(distIsland);
    }

    // Atmospheric mist dust particles
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 120;
      particlePos[i * 3 + 1] = Math.random() * 50 - 5;
      particlePos[i * 3 + 2] = (Math.random() - 0.5) * 120;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.6,
      transparent: true,
      opacity: 0.4,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 6. Camera Curve on CatmullRomCurve3
    // Points: Wide hero -> push in -> over rooftops -> campus quad landing facing QR pillar
    const cameraPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 48, 88), // sp = 0: Hero wide
      new THREE.Vector3(14, 30, 54), // sp = 0.25: Push in
      new THREE.Vector3(6, 15, 26), // sp = 0.5: Mid-flight rooftops
      new THREE.Vector3(-2, 5.5, 12), // sp = 0.75: Approach quad
      new THREE.Vector3(0, 2.3, 4.8), // sp = 1.0: Eye-level facing pillar
    ]);

    const cameraLookPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 6, 0), // Look at island center
      new THREE.Vector3(2, 5, 0),
      new THREE.Vector3(1, 4, -2),
      new THREE.Vector3(0, 2.8, 0),
      new THREE.Vector3(0, 2.8, 0), // Eye-level at QR scanner
    ]);

    // 7. Scroll & Pointer state tracking
    let targetP = 0;
    let smoothedSp = 0;
    let targetSx = 0;
    let targetSy = 0;
    let smoothedSx = 0;
    let smoothedSy = 0;
    let lastTime = performance.now();

    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const scrollableHeight = container.offsetHeight - window.innerHeight;
      if (scrollableHeight <= 0) return;
      const p = Math.min(1, Math.max(0, -rect.top / scrollableHeight));
      targetP = p;
    };

    const handlePointerMove = (e: MouseEvent) => {
      targetSx = (e.clientX / window.innerWidth - 0.5) * 2;
      targetSy = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handlePointerMove, { passive: true });

    // Handle Window Resize
    const handleResize = () => {
      if (!mount) return;
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // 8. Animation Render Loop (Section 12)
    let animationFrameId: number;
    const tempProjVector = new THREE.Vector3();

    const tick = (currentTime: number) => {
      const dt = Math.min(64, currentTime - lastTime);
      lastTime = currentTime;

      // Smooth scroll progress: sp += (p - sp) * (1 - 0.86^(dt/16.7))
      const alpha = 1 - Math.pow(0.86, dt / 16.7);
      smoothedSp += (targetP - smoothedSp) * alpha;
      if (Math.abs(targetP - smoothedSp) < 0.0002) {
        smoothedSp = targetP;
      }

      // Smooth pointer at 6%/frame
      smoothedSx += (targetSx - smoothedSx) * 0.06;
      smoothedSy += (targetSy - smoothedSy) * 0.06;

      setScrollProgress(smoothedSp);
      setPointer({ sx: smoothedSx, sy: smoothedSy });

      // Camera position on curve
      const camPos = cameraPath.getPointAt(smoothedSp);
      const camLook = cameraLookPath.getPointAt(smoothedSp);

      // Subtle sway from pointer
      camPos.x += smoothedSx * (1 - smoothedSp * 0.8) * 2.5;
      camPos.y += -smoothedSy * (1 - smoothedSp * 0.8) * 1.5;

      camera.position.copy(camPos);
      camera.lookAt(camLook);

      // Gentle bobbing of side slabs
      const timeSec = currentTime * 0.001;
      slabs.forEach((slab, i) => {
        slab.position.y += Math.sin(timeSec * 0.8 + i * 2) * 0.015;
        slab.rotation.y += 0.001 * (i + 1);
      });

      // Render 3D Scene
      renderer.render(scene, camera);

      // 9. Update Screen Projection for Hotspots (Section 10)
      if (smoothedSp >= 0.38 && smoothedSp <= 0.72) {
        const nextCoords = hotspotsData.map((hs) => {
          tempProjVector.copy(hs.anchor).project(camera);
          const x = (tempProjVector.x * 0.5 + 0.5) * 100;
          const y = (-(tempProjVector.y * 0.5) + 0.5) * 100;
          const inFront = tempProjVector.z < 1;
          return {
            x: Math.round(x * 10) / 10,
            y: Math.round(y * 10) / 10,
            visible: inFront && x > 2 && x < 98 && y > 2 && y < 98,
          };
        });
        setProjectedCoords(nextCoords);
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('resize', handleResize);

      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      islandBaseGeo.dispose();
      underbellyGeo.dispose();
      quadGeo.dispose();
      audBaseGeo.dispose();
      audDomeGeo.dispose();
      gymBaseGeo.dispose();
      gymRoofGeo.dispose();
      labBaseGeo.dispose();
      courtSlabGeo.dispose();
      lecBaseGeo.dispose();
      particleGeo.dispose();
    };
  }, [hotspotsData]);

  // Utility segment calculator from specification: seg(p, a, b) = clamp((p-a)/(b-a))
  const seg = (p: number, a: number, b: number) => Math.min(1, Math.max(0, (p - a) / (b - a)));
  const cubicInOut = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  // -------------------------------------------------------------
  // BEAT CALCULATIONS
  // -------------------------------------------------------------
  const sp = scrollProgress;

  // Beat 1: Hero (sp 0 -> 0.12)
  const h = seg(sp, 0.02, 0.1);
  const heroOpacity = 1 - h;
  const heroTranslateY = -h * 80;
  const heroBlur = h * 14;

  // Beat 2: Vision (sp 0.16 -> 0.42)
  const vIn = seg(sp, 0.16, 0.27);
  const vOut = seg(sp, 0.34, 0.42);
  const visionWords = [
    'From',
    'Lost',
    'Paper',
    'Slips',
    'to',
    'Real-Time,',
    'Conflict-Free',
    'Campus',
    'Booking',
  ];

  // Beat 3: Hotspots (sp 0.45 -> 0.68)
  const aIn = seg(sp, 0.45, 0.55);
  const aOut = seg(sp, 0.63, 0.68);
  const storyNarrativeWords =
    'Every request moves through a clear approval pipeline — Department Chair, College Dean, Physical Plant Director and Safety Officer — so organizers get answers, not runarounds.'.split(
      ' '
    );

  // Beat 4: Gate Pass Station (sp 0.72 -> 1.0)
  const sIn = seg(sp, 0.72, 0.82);
  const countNumber = Math.round(82 * seg(sp, 0.76, 0.9));
  const sparklineProgress = seg(sp, 0.77, 0.92);

  return (
    <div
      ref={containerRef}
      id="story"
      className="relative w-full h-[640vh] bg-[#dfe5ec] text-[#0B1528] select-none"
    >
      {/* ------------------------------------------------------------- */}
      {/* STICKY STAGE (100vh)                                          */}
      {/* ------------------------------------------------------------- */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#dfe5ec]">
        {/* 1. THREE.JS 3D FLY-IN CANVAS */}
        <div
          ref={canvasMountRef}
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            transform: `translate3d(${-pointer.sx * 14}px, ${-pointer.sy * 8}px, 0)`,
            transition: 'transform 0.1s ease-out',
          }}
        />

        {/* 2. ATMOSPHERIC DRIFTING MIST OVERLAY */}
        <div
          className="absolute inset-0 pointer-events-none z-10 opacity-30 mix-blend-screen"
          style={{
            background:
              'radial-gradient(circle at 30% 40%, rgba(255,255,255,0.7) 0%, transparent 60%), radial-gradient(circle at 75% 65%, rgba(223,229,236,0.6) 0%, transparent 65%)',
          }}
        />

        {/* 3. FOG BANK (sp 0.38 -> 0.47) */}
        {sp >= 0.35 && sp <= 0.68 && (
          <div
            className="absolute -left-[8vw] -top-[6vh] w-[56vw] h-[60vh] pointer-events-none z-10 transition-opacity duration-300"
            style={{
              opacity: cubicInOut(seg(sp, 0.38, 0.47)) * (1 - seg(sp, 0.62, 0.68)),
              background: 'radial-gradient(ellipse at center, rgba(217,222,222,0.85) 0%, rgba(207,213,217,0.4) 60%, transparent 80%)',
              filter: 'blur(12px)',
            }}
          />
        )}

        {/* ------------------------------------------------------------- */}
        {/* BEAT 1: HERO LAYER (L0 + L1)                                  */}
        {/* ------------------------------------------------------------- */}
        {heroOpacity > 0.01 && (
          <div
            className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-center items-center text-center px-4"
            style={{
              opacity: heroOpacity,
              transform: `translate3d(${-pointer.sx * 8}px, ${heroTranslateY}px, 0)`,
              filter: `blur(${heroBlur}px)`,
              visibility: heroOpacity <= 0.01 ? 'hidden' : 'visible',
            }}
          >
            {/* Tagline Chip */}
            <div className="mb-4 inline-flex items-center gap-2">
              <span className="story-chip shadow-sm">
                Book It, Track It, Use It.
              </span>
            </div>

            {/* Masked Rising Headline: Every Campus Space. */}
            <div className="overflow-hidden py-1">
              <h1
                className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.92] text-[#0B1528] font-sans drop-shadow-sm"
                style={{
                  transform: 'translateY(0%)',
                  transition: 'transform 1.1s cubic-bezier(0.2, 0.8, 0.2, 1)',
                }}
              >
                Every Campus Space.
              </h1>
            </div>

            {/* Sub-headline */}
            <p className="mt-4 text-base sm:text-lg md:text-xl text-slate-700 max-w-xl font-medium drop-shadow-xs">
              One smarter way to book.
            </p>

            {/* HUD (Live Availability Matrix) */}
            <div className="hidden md:block absolute left-[53.5%] top-[62%] p-3.5 rounded-lg bg-[#0B1528]/80 text-white backdrop-blur-md border border-white/20 shadow-xl text-left pointer-events-auto">
              <div className="flex items-center justify-between gap-3 pb-2 border-b border-white/10">
                <span className="story-chip text-[9.5px] px-2 py-0.5">
                  Live availability
                </span>
                <span className="w-2 h-2 rounded-full bg-[#8CC63F] animate-pulse" />
              </div>
              <pre className="story-mono text-[10px] sm:text-[11px] text-white/95 mt-2.5 leading-[1.65] tracking-[0.12em]">
                {`WORKSPACE  CEBU PILOT\nVENUES     SAMPLE PREVIEW\nCONFLICTS  0`}
              </pre>
            </div>

            {/* Caption (Bottom-Left) */}
            <div className="absolute bottom-8 left-6 sm:left-9 text-left max-w-xs border-l-2 border-[#FDB813] pl-3">
              <p className="story-mono text-[11px] text-[#1E3350] leading-relaxed font-semibold">
                Discover, reserve and manage
                <br />
                university facilities across
                <br />
                participating campuses.
              </p>
            </div>

            {/* Scroll Hint (Bottom-Right) */}
            <div className="absolute bottom-8 right-6 sm:right-9 flex items-center gap-2 text-[#0B1528]">
              <span className="story-mono text-[11px] font-bold">
                SCROLL TO EXPLORE
              </span>
              <div className="w-5 h-5 rounded-full border border-[#0B1528]/40 flex items-center justify-center animate-bounce">
                <ChevronDown className="w-3 h-3 text-[#0B1528]" />
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* BEAT 2: VISION LAYER (L2, sp 0.16 -> 0.42)                    */}
        {/* ------------------------------------------------------------- */}
        {vIn > 0 && vOut < 1 && (
          <div
            className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-center items-center text-center px-4"
            style={{
              visibility: vIn > 0 && vOut < 1 ? 'visible' : 'hidden',
            }}
          >
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Chip */}
              <div
                style={{
                  opacity: Math.min(1, Math.max(0, vIn * 2 - 0.6)) * (1 - vOut),
                  transition: 'opacity 0.2s',
                }}
              >
                <span className="story-chip shadow-md">Our vision</span>
              </div>

              {/* H2 staggered words */}
              <h2 className="text-3xl sm:text-5xl lg:text-7xl font-black text-[#0B1528] tracking-tight leading-tight flex flex-wrap justify-center gap-x-3 gap-y-1">
                {visionWords.map((word, i) => {
                  const k = Math.min(1, Math.max(0, vIn * 1.6 - i * 0.08));
                  const translateY = (1 - k) * 30 - vOut * 60;
                  const blur = (1 - k) * 12 + vOut * 14;
                  const opacity = k * (1 - vOut);
                  return (
                    <span
                      key={i}
                      className="inline-block"
                      style={{
                        transform: `translateY(${translateY}px)`,
                        filter: `blur(${blur}px)`,
                        opacity,
                      }}
                    >
                      {word}
                    </span>
                  );
                })}
              </h2>

              {/* Paragraph */}
              <p
                className="text-sm sm:text-lg text-slate-700 max-w-2xl mx-auto font-normal"
                style={{
                  opacity: Math.min(1, Math.max(0, vIn * 2 - 0.6)) * (1 - vOut),
                  transform: `translateY(${(1 - vIn) * 20}px)`,
                }}
              >
                One platform for every auditorium, gym, court, laboratory and hall — eliminating double bookings and scheduling confusion.
              </p>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* BEAT 3: FACILITIES HOTSPOTS (L3, sp 0.45 -> 0.68)             */}
        {/* ------------------------------------------------------------- */}
        {aIn > 0 && aOut < 1 && (
          <div
            className="absolute inset-0 z-20 pointer-events-none"
            style={{
              visibility: aIn > 0 && aOut < 1 ? 'visible' : 'hidden',
            }}
          >
            {/* Story Narrative Paragraph (Left Top) */}
            <div
              className="absolute left-6 sm:left-9 top-[14vh] max-w-md sm:max-w-xl text-left pointer-events-auto"
              style={{
                opacity: aIn * (1 - aOut),
                transform: `translateY(${(1 - aIn) * 25}px)`,
              }}
            >
              <span className="story-chip mb-3">Approval pipeline</span>
              <p className="text-lg sm:text-2xl font-bold text-[#0B1528] leading-snug drop-shadow-sm">
                {storyNarrativeWords.map((word, i) => {
                  const count = storyNarrativeWords.length;
                  const k = Math.min(1, Math.max(0, aIn * 2.2 - (i / count) * 1.2));
                  const op = (0.15 + 0.85 * k) * (1 - aOut);
                  const blur = (1 - k) * 6 + aOut * 10;
                  return (
                    <span
                      key={i}
                      className="inline-block mr-1.5"
                      style={{
                        opacity: op,
                        filter: `blur(${blur}px)`,
                      }}
                    >
                      {word}
                    </span>
                  );
                })}
              </p>
            </div>

            {/* 4 Projected Building Hotspots */}
            {hotspotsData.map((hs, idx) => {
              const coords = projectedCoords[idx] || { x: 50, y: 50, visible: true };
              const k = seg(sp, 0.49 + idx * 0.02, 0.53 + idx * 0.02);
              const scale = k * (1 - aOut);
              const isActive = activeHotspot === idx;

              if (!coords.visible || scale <= 0.05) return null;

              return (
                <div
                  key={hs.id}
                  style={{
                    left: `${coords.x}%`,
                    top: `${coords.y}%`,
                    transform: `translate(-50%, -50%) scale(${scale})`,
                    transition: 'transform 0.15s ease-out',
                  }}
                  className="absolute pointer-events-auto z-30 flex items-center gap-2"
                >
                  <button
                    type="button"
                    onClick={() => setActiveHotspot(isActive ? null : idx)}
                    className="group relative flex items-center gap-2 p-1 rounded-full bg-[#0B1528]/85 text-white backdrop-blur-md border border-white/30 shadow-2xl cursor-pointer hover:scale-105 transition-transform"
                    aria-label={`Inspect ${hs.name}`}
                  >
                    {/* Accent circle with plus icon */}
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#FDB813] text-[#0B1528] flex items-center justify-center font-bold text-xs shadow-sm">
                      {isActive ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    </div>

                    {/* Label pill */}
                    <span className="story-mono text-[10px] sm:text-[11px] font-bold text-white pr-2.5">
                      {hs.name}
                    </span>

                    {/* Expandable Spec Pill */}
                    {(isActive || scale > 0.85) && (
                      <em className="not-italic text-[10px] font-bold text-[#8CC63F] bg-emerald-950/70 border border-emerald-700/60 px-2 py-0.5 rounded-full pr-2">
                        {hs.spec}
                      </em>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* BEAT 4: GATE PASS STATION (L4, sp 0.72 -> 1.0)               */}
        {/* ------------------------------------------------------------- */}
        {sIn > 0 && (
          <div
            className="absolute inset-0 z-20 pointer-events-none"
            style={{
              opacity: sIn,
              visibility: sIn > 0 ? 'visible' : 'hidden',
            }}
          >
            {/* Heading (Left Top) */}
            <div
              className="absolute left-6 sm:left-9 top-[13vh] max-w-[380px] text-left pointer-events-auto"
              style={{
                transform: `translateY(${(1 - sIn) * 30}px)`,
              }}
            >
              <div className="story-mono text-[11px] text-[#0077C8] font-bold mb-1.5 flex items-center gap-1.5">
                <span>✕</span>
                <span>Gate Pass 07</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-[#0B1528] tracking-tight leading-snug">
                Approval, access and audit in one trusted system
              </h3>
            </div>

            {/* Glass Utilization Card (Left-Center) */}
            <div
              className="absolute left-6 sm:left-[36%] top-[34vh] w-[260px] p-5 rounded-[10px] bg-[#1E3350]/40 backdrop-blur-md border border-white/30 shadow-2xl text-white pointer-events-auto transition-transform duration-200"
              style={{
                transform: `rotateY(${pointer.sx * 8}deg) rotateX(${-pointer.sy * 8}deg)`,
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white tracking-wide">
                    Venue utilization
                  </h4>
                  <span className="story-mono text-[9px] text-slate-300 block">
                    Sample data · Auditorium · this semester
                  </span>
                </div>
                <span className="story-mono text-[9.5px] font-bold text-[#8CC63F] bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-500/40">
                  +6 pts
                </span>
              </div>

              {/* Big Counter */}
              <div className="my-3 flex items-baseline gap-1">
                <span className="text-5xl font-black text-white font-sans">
                  {countNumber}
                </span>
                <span className="story-mono text-xl text-[#FDB813] font-bold">%</span>
              </div>

              {/* SVG Sparkline (220 x 70) */}
              <div className="w-full h-14 relative">
                <svg viewBox="0 0 220 70" className="w-full h-full overflow-visible">
                  <polyline
                    fill="none"
                    stroke="#FDB813"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="300"
                    strokeDashoffset={300 * (1 - sparklineProgress)}
                    points="0,60 30,55 60,57 90,44 120,46 150,30 180,24 214,10"
                  />
                  {sparklineProgress > 0.45 && <circle cx="90" cy="44" r="3" fill="#ffffff" />}
                  {sparklineProgress > 0.7 && <circle cx="150" cy="30" r="3" fill="#ffffff" />}
                  {sparklineProgress > 0.95 && <circle cx="214" cy="10" r="4" fill="#8CC63F" />}
                </svg>
              </div>

              <div className="story-mono text-[9px] text-slate-300 pt-2 border-t border-white/15 flex justify-between">
                <span>Q1</span>
                <span>Q2</span>
                <span>Q3</span>
                <span>Q4</span>
              </div>
            </div>

            {/* Feature List (Right-Center) */}
            <div
              className="absolute right-6 sm:right-9 top-[28vh] w-full max-w-[340px] sm:max-w-[400px] p-5 rounded-[10px] bg-[#f6f8fb]/80 backdrop-blur-md border border-white/60 shadow-xl pointer-events-auto text-left"
              style={{
                transform: `translateX(${(1 - sIn) * 35}px)`,
              }}
            >
              <span className="story-mono text-[10px] text-[#0077C8] font-bold block mb-3">
                Key platform capabilities
              </span>
              <div className="divide-y divide-slate-200/80">
                {[
                  'Sub-second conflict engine',
                  'Multi-tier endorsements',
                  'Digital QR gate pass',
                  'Cross-university reservations',
                  'Utilization reports and audit trail',
                ].map((feat, idx) => {
                  const k = cubicInOut(seg(sp, 0.76 + idx * 0.025, 0.82 + idx * 0.025));
                  return (
                    <div
                      key={idx}
                      style={{
                        transform: `translateX(${(1 - k) * 35}px)`,
                        opacity: k,
                      }}
                      className="py-2.5 flex items-center justify-between text-xs font-bold text-[#0B1528] hover:text-[#0a6f3a] transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="story-mono text-[10px] text-slate-400">
                          0{idx + 1}
                        </span>
                        <span className="text-slate-800 group-hover:text-emerald-800 transition-colors">
                          {feat}
                        </span>
                      </div>
                      <span className="transition-transform group-hover:translate-x-1 text-slate-400 group-hover:text-emerald-700">
                        →
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STORY PROGRESS BAR (Centered at Bottom)                       */}
        {/* ------------------------------------------------------------- */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-[120px] h-[2px] bg-slate-400/40 rounded-full overflow-hidden z-30 pointer-events-none">
          <div
            className="h-full bg-[#FDB813] transition-all duration-75"
            style={{
              width: `${Math.round(sp * 100)}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
