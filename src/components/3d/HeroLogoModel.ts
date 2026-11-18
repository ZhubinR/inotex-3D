// src/components/3d/HeroLogoModel.ts
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { LegoModel } from "../lego/LegoBuilder";

const BLUE = 0x385dae;
const TEAL = 0x00956e;
const YELLOW = 0xffb81d;
const NAVY = 0x023d5b;
const GLASS = 0x8fd3f0;

/**
 * High-precision 3D Sculptural Emblem of the INOTEX Brand
 * - Extruded mathematically from the official brand vector paths
 * - Smooth beveled PBR solid materials with fine specular response & clearcoat
 * - Complete, unmistakable INOTEX Wordmark (I · N · O · T · E · X)
 * - Monumental Point-Up Hexagonal "O" jewel centerpiece in radiant INOTEX Yellow
 * - Dual kinetic hexagonal orbital rings (Brandbook page 22 cover motif)
 * - Architectural stepped titanium pedestal with chamfered metallic trim
 * - Precision floating hexagonal innovation nodes at calibrated depth planes
 */
export function buildHeroLogoModel(fitSize = 3.85): LegoModel {
  const root = new THREE.Group();
  const content = new THREE.Group();

  // Premium Physical Materials — Calibrated Studio PBR
  const matYellow = new THREE.MeshPhysicalMaterial({
    color: YELLOW,
    roughness: 0.14,
    metalness: 0.14,
    clearcoat: 1.0,
    clearcoatRoughness: 0.06,
    reflectivity: 0.75,
    sheen: 0.35,
    sheenColor: new THREE.Color(0xffe89e),
    sheenRoughness: 0.28,
  });

  const matBlue = new THREE.MeshPhysicalMaterial({
    color: BLUE,
    roughness: 0.18,
    metalness: 0.12,
    clearcoat: 0.95,
    clearcoatRoughness: 0.08,
    reflectivity: 0.65,
    sheen: 0.3,
    sheenColor: new THREE.Color(0x6595ff),
    sheenRoughness: 0.32,
  });

  const matTeal = new THREE.MeshPhysicalMaterial({
    color: TEAL,
    roughness: 0.16,
    metalness: 0.1,
    clearcoat: 0.95,
    clearcoatRoughness: 0.08,
    reflectivity: 0.65,
    sheen: 0.3,
    sheenColor: new THREE.Color(0x2fe0b0),
    sheenRoughness: 0.32,
  });

  const matNavy = new THREE.MeshPhysicalMaterial({
    color: NAVY,
    roughness: 0.28,
    metalness: 0.42,
    clearcoat: 0.55,
    clearcoatRoughness: 0.18,
    reflectivity: 0.8,
  });

  const matGoldTrim = new THREE.MeshPhysicalMaterial({
    color: YELLOW,
    roughness: 0.12,
    metalness: 0.68,
    clearcoat: 0.9,
    clearcoatRoughness: 0.08,
  });

  const matGlass = new THREE.MeshPhysicalMaterial({
    color: GLASS,
    roughness: 0.06,
    metalness: 0.05,
    transparent: true,
    opacity: 0.62,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    ior: 1.52,
    reflectivity: 0.85,
    depthWrite: false,
  });

  // Layer groups for entrance transitions
  const layers: THREE.Group[] = [];
  const layer0 = new THREE.Group(); // Base plinth & kinetic hexagonal orbital rings
  const layer1 = new THREE.Group(); // 3D Extruded Letters (I · N · O · T · E · X)
  const layer2 = new THREE.Group(); // Giant 3D Hexagonal "O" Monument
  const layer3 = new THREE.Group(); // Inner Faceted Technology Core & Accents
  const layer4 = new THREE.Group(); // Floating Innovation Geometric Nodes

  // =========================================================================
  // 1. MONUMENTAL POINT-UP HEXAGONAL "O" EMBLEM (The Crown Jewel of INOTEX)
  // Exact 30° / 60° regular point-up hexagon with concentric hexagonal hole
  // =========================================================================
  const hexShape = new THREE.Shape();
  // Outer regular hexagon (radius 48)
  hexShape.moveTo(0, 48);
  hexShape.lineTo(41.57, 24);
  hexShape.lineTo(41.57, -24);
  hexShape.lineTo(0, -48);
  hexShape.lineTo(-41.57, -24);
  hexShape.lineTo(-41.57, 24);
  hexShape.closePath();

  // Inner regular hexagon cutout (radius 24.5)
  const hexHole = new THREE.Path();
  hexHole.moveTo(0, 24.5);
  hexHole.lineTo(-21.22, 12.25);
  hexHole.lineTo(-21.22, -12.25);
  hexHole.lineTo(0, -24.5);
  hexHole.lineTo(21.22, -12.25);
  hexHole.lineTo(21.22, 12.25);
  hexHole.closePath();
  hexShape.holes.push(hexHole);

  const hexGeo = new THREE.ExtrudeGeometry(hexShape, {
    depth: 18,
    bevelEnabled: true,
    bevelSegments: 5,
    bevelSize: 2.6,
    bevelThickness: 2.6,
  });
  hexGeo.center();

  const hexMesh = new THREE.Mesh(hexGeo, matYellow);
  hexMesh.castShadow = true;
  hexMesh.receiveShadow = true;
  hexMesh.position.set(6, 32, 0);
  layer2.add(hexMesh);

  // Concentric interior chamfer ring: nested inside the inner hollow to add architectural depth
  const innerTrimShape = new THREE.Shape();
  innerTrimShape.moveTo(0, 24.0);
  innerTrimShape.lineTo(20.78, 12.0);
  innerTrimShape.lineTo(20.78, -12.0);
  innerTrimShape.lineTo(0, -24.0);
  innerTrimShape.lineTo(-20.78, -12.0);
  innerTrimShape.lineTo(-20.78, 12.0);
  innerTrimShape.closePath();

  const innerTrimHole = new THREE.Path();
  innerTrimHole.moveTo(0, 21.0);
  innerTrimHole.lineTo(-18.18, 10.5);
  innerTrimHole.lineTo(-18.18, -10.5);
  innerTrimHole.lineTo(0, -21.0);
  innerTrimHole.lineTo(18.18, -10.5);
  innerTrimHole.lineTo(18.18, 10.5);
  innerTrimHole.closePath();
  innerTrimShape.holes.push(innerTrimHole);

  const innerTrimGeo = new THREE.ExtrudeGeometry(innerTrimShape, {
    depth: 14,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: 0.8,
    bevelThickness: 0.8,
  });
  innerTrimGeo.center();
  const innerTrimMesh = new THREE.Mesh(innerTrimGeo, matGoldTrim);
  innerTrimMesh.position.set(6, 32, 0);
  layer3.add(innerTrimMesh);

  // Inner floating Technology facet (Translucent optical teal prism in the hollow center)
  const innerFacetGeo = new THREE.CylinderGeometry(13.5, 13.5, 13.5, 6);
  innerFacetGeo.rotateY(Math.PI / 6);
  const innerFacet = new THREE.Mesh(innerFacetGeo, matGlass);
  innerFacet.castShadow = true;
  innerFacet.position.set(6, 32, 0);
  layer3.add(innerFacet);

  // Center golden energy node — faceted octahedron with high specular bounce
  const coreNodeGeo = new THREE.OctahedronGeometry(6.2, 1);
  const coreNode = new THREE.Mesh(coreNodeGeo, matTeal);
  coreNode.position.set(6, 32, 0);
  layer3.add(coreNode);

  // =========================================================================
  // 2. KINETIC HEXAGONAL ORBITAL RINGS (Brandbook Page 22 Cover Motif)
  // Two overlapping thin hexagonal contours at complementary angles
  // =========================================================================
  const matRingTeal = new THREE.MeshPhysicalMaterial({
    color: TEAL,
    roughness: 0.16,
    metalness: 0.72,
    clearcoat: 0.85,
    clearcoatRoughness: 0.1,
  });
  const ring1Geo = new THREE.TorusGeometry(62, 1.35, 10, 6);
  const ring1 = new THREE.Mesh(ring1Geo, matRingTeal);
  ring1.rotation.x = Math.PI / 2.3;
  ring1.rotation.y = Math.PI / 6;
  ring1.position.set(6, 32, -4);
  layer0.add(ring1);

  const matRingBlue = new THREE.MeshPhysicalMaterial({
    color: BLUE,
    roughness: 0.16,
    metalness: 0.72,
    clearcoat: 0.85,
    clearcoatRoughness: 0.1,
  });
  const ring2Geo = new THREE.TorusGeometry(74, 1.15, 10, 6);
  const ring2 = new THREE.Mesh(ring2Geo, matRingBlue);
  ring2.rotation.x = Math.PI / 2.1;
  ring2.rotation.y = -Math.PI / 4;
  ring2.position.set(6, 32, -8);
  layer0.add(ring2);

  // =========================================================================
  // 3. OFFICIAL 3D INOTEX WORDMARK (I · N · O · T · E · X)
  // Precision letters with correct spacing, vertical spine for E, and bold I
  // =========================================================================
  const letterDepth = 12.5;
  const extrudeLetter = (shape: THREE.Shape, depth = letterDepth) => {
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelSegments: 4,
      bevelSize: 1.25,
      bevelThickness: 1.25,
    });
    geo.center();
    return geo;
  };

  const LETTER_Y = -42;

  // Letter I (Bold, tall, proud column clearly positioned before N)
  const sI = new THREE.Shape();
  sI.moveTo(0, 38);
  sI.lineTo(18, 38);
  sI.lineTo(18, -38);
  sI.lineTo(0, -38);
  sI.closePath();
  const mI = new THREE.Mesh(extrudeLetter(sI), matBlue);
  mI.castShadow = true;
  mI.receiveShadow = true;
  mI.position.set(-118, LETTER_Y, 2);
  layer1.add(mI);

  // Letter N (Dual vertical pillars with diagonal traverse)
  const sN = new THREE.Shape();
  sN.moveTo(0, 38);
  sN.lineTo(18, 38);
  sN.lineTo(44, 4);
  sN.lineTo(44, 38);
  sN.lineTo(60, 38);
  sN.lineTo(60, -38);
  sN.lineTo(42, -38);
  sN.lineTo(16, -4);
  sN.lineTo(16, -38);
  sN.lineTo(0, -38);
  sN.closePath();
  const mN = new THREE.Mesh(extrudeLetter(sN), matBlue);
  mN.castShadow = true;
  mN.receiveShadow = true;
  mN.position.set(-74, LETTER_Y, 2);
  layer1.add(mN);

  // Letter O (Iconic Point-Up Hexagon in Brand Yellow)
  const sO = new THREE.Shape();
  sO.moveTo(0, 38);
  sO.lineTo(32.9, 19);
  sO.lineTo(32.9, -19);
  sO.lineTo(0, -38);
  sO.lineTo(-32.9, -19);
  sO.lineTo(-32.9, 19);
  sO.closePath();

  const hO = new THREE.Path();
  hO.moveTo(0, 19);
  hO.lineTo(-16.4, 9.5);
  hO.lineTo(-16.4, -9.5);
  hO.lineTo(0, -19);
  hO.lineTo(16.4, -9.5);
  hO.lineTo(16.4, 9.5);
  hO.closePath();
  sO.holes.push(hO);

  const mO = new THREE.Mesh(extrudeLetter(sO, 14.5), matYellow);
  mO.castShadow = true;
  mO.receiveShadow = true;
  mO.position.set(-18, LETTER_Y, 3);
  layer1.add(mO);

  // Letter T (Wide crossbar with central trunk)
  const sT = new THREE.Shape();
  sT.moveTo(0, 38);
  sT.lineTo(48, 38);
  sT.lineTo(48, 24);
  sT.lineTo(31, 24);
  sT.lineTo(31, -38);
  sT.lineTo(17, -38);
  sT.lineTo(17, 24);
  sT.lineTo(0, 24);
  sT.closePath();
  const mT = new THREE.Mesh(extrudeLetter(sT), matBlue);
  mT.castShadow = true;
  mT.receiveShadow = true;
  mT.position.set(36, LETTER_Y, 2);
  layer1.add(mT);

  // Letter E (Unified solid geometry: vertical spine + 3 angled speed bars)
  const sE = new THREE.Shape();
  sE.moveTo(0, 38);
  sE.lineTo(44, 38);
  sE.lineTo(36, 24);
  sE.lineTo(15, 24);
  sE.lineTo(15, 8);
  sE.lineTo(40, 8);
  sE.lineTo(32, -6);
  sE.lineTo(15, -6);
  sE.lineTo(15, -24);
  sE.lineTo(44, -24);
  sE.lineTo(36, -38);
  sE.lineTo(0, -38);
  sE.closePath();
  const mE = new THREE.Mesh(extrudeLetter(sE), matTeal);
  mE.castShadow = true;
  mE.receiveShadow = true;
  mE.position.set(86, LETTER_Y, 2);
  layer1.add(mE);

  // Letter X (Precision crossing diagonals)
  const sX = new THREE.Shape();
  sX.moveTo(0, 38);
  sX.lineTo(16, 38);
  sX.lineTo(30, 16);
  sX.lineTo(44, 38);
  sX.lineTo(60, 38);
  sX.lineTo(38, 0);
  sX.lineTo(60, -38);
  sX.lineTo(44, -38);
  sX.lineTo(30, -16);
  sX.lineTo(16, -38);
  sX.lineTo(0, -38);
  sX.lineTo(22, 0);
  sX.closePath();
  const mX = new THREE.Mesh(extrudeLetter(sX), matBlue);
  mX.castShadow = true;
  mX.receiveShadow = true;
  mX.position.set(136, LETTER_Y, 2);
  layer1.add(mX);

  // =========================================================================
  // 4. ARCHITECTURAL STEPPED PEDESTAL & ACCENT INSETS
  // Chamfered navy titanium base holding the wordmark with metallic gold trim
  // =========================================================================
  // Upper deck with rounded bevels catching light highlights
  const plinthDeckGeo = new RoundedBoxGeometry(292, 8, 40, 3, 1.2);
  const plinthDeck = new THREE.Mesh(plinthDeckGeo, matNavy);
  plinthDeck.castShadow = true;
  plinthDeck.receiveShadow = true;
  plinthDeck.position.set(9, LETTER_Y - 42, 0);
  layer0.add(plinthDeck);

  // Accent metallic groove in brand yellow gold
  const grooveGeo = new RoundedBoxGeometry(278, 2.2, 42.4, 2, 0.6);
  const groove = new THREE.Mesh(grooveGeo, matGoldTrim);
  groove.position.set(9, LETTER_Y - 42, 0);
  layer0.add(groove);

  // Foundation plinth grounding the sculpture
  const plinthSubGeo = new RoundedBoxGeometry(306, 5, 46, 3, 1.2);
  const plinthSub = new THREE.Mesh(plinthSubGeo, matNavy);
  plinthSub.castShadow = true;
  plinthSub.receiveShadow = true;
  plinthSub.position.set(9, LETTER_Y - 48.5, 0);
  layer0.add(plinthSub);

  // =========================================================================
  // 5. FLOATING GEOMETRIC INNOVATION NODES
  // Clean beveled hexagonal prisms orbiting the emblem at layered depth planes
  // =========================================================================
  const nodeDefs = [
    { pos: [-96, 48, 18], r: 7.2, h: 4.8, mat: matTeal, rx: 0.35, rz: 0.25 },
    { pos: [104, 42, -14], r: 8.0, h: 5.2, mat: matYellow, rx: -0.25, rz: 0.4 },
    { pos: [-72, 78, -22], r: 6.2, h: 4.0, mat: matBlue, rx: 0.4, rz: -0.3 },
    { pos: [84, 82, 20], r: 7.6, h: 5.0, mat: matTeal, rx: -0.3, rz: 0.35 },
    { pos: [6, 92, -16], r: 6.4, h: 4.2, mat: matGlass, rx: 0.2, rz: -0.2 },
    { pos: [-124, 12, 10], r: 5.5, h: 3.6, mat: matGoldTrim, rx: 0.5, rz: 0.15 },
    { pos: [132, 16, -10], r: 5.8, h: 3.8, mat: matBlue, rx: -0.4, rz: 0.45 },
  ];

  nodeDefs.forEach(({ pos, r, h, mat, rx, rz }) => {
    // Regular hexagonal prism with smooth top/bottom bevel
    const hexNodeGeo = new THREE.CylinderGeometry(r, r, h, 6);
    hexNodeGeo.rotateX(rx);
    hexNodeGeo.rotateZ(rz);
    const node = new THREE.Mesh(hexNodeGeo, mat);
    node.castShadow = true;
    node.receiveShadow = true;
    node.position.set(pos[0], pos[1], pos[2]);
    layer4.add(node);
  });

  // Assemble layers into content
  layers.push(layer0, layer1, layer2, layer3, layer4);
  layers.forEach((l) => content.add(l));

  // Compute bounding box and center
  const box = new THREE.Box3().setFromObject(content);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  // Center all geometry perfectly around (0, 0, 0)
  layers.forEach((l) => {
    l.position.sub(center);
  });

  root.add(content);

  // Scale to fit target dimensions
  const maxDim = Math.max(size.x * 0.94, size.y * 1.04, size.z * 0.9);
  root.scale.setScalar(fitSize / Math.max(maxDim, 0.001));

  const palette = [YELLOW, BLUE, TEAL, NAVY];

  return { root, layers, size, palette };
}

