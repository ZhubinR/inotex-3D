// src/components/3d/HeroLogoModel.ts
import * as THREE from "three";
import type { LegoModel } from "../lego/LegoBuilder";

const BLUE = 0x385dae;
const TEAL = 0x00956e;
const YELLOW = 0xffb81d;
const NAVY = 0x023d5b;
const GLASS = 0x8fd3f0;

/**
 * High-precision 3D Sculptural Emblem of the INOTEX Brand
 * - Extruded mathematically from the official brand vector paths
 * - Smooth beveled PBR solid materials (no toy Lego studs or staircase steps)
 * - Complete, unmistakable INOTEX Wordmark (I · N · O · T · E · X)
 * - Monumental Point-Up Hexagonal "O" jewel centerpiece in radiant INOTEX Yellow
 * - Dual kinetic hexagonal orbital rings (Brandbook page 22 cover motif)
 * - Architectural navy titanium pedestal with yellow metallic trim
 * - Precision floating geometric innovation nodes
 */
export function buildHeroLogoModel(fitSize = 3.85): LegoModel {
  const root = new THREE.Group();
  const content = new THREE.Group();

  // Premium Physical Materials
  const matYellow = new THREE.MeshPhysicalMaterial({
    color: YELLOW,
    roughness: 0.16,
    metalness: 0.12,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
  });

  const matBlue = new THREE.MeshPhysicalMaterial({
    color: BLUE,
    roughness: 0.2,
    metalness: 0.1,
    clearcoat: 0.95,
    clearcoatRoughness: 0.12,
  });

  const matTeal = new THREE.MeshPhysicalMaterial({
    color: TEAL,
    roughness: 0.18,
    metalness: 0.08,
    clearcoat: 0.9,
    clearcoatRoughness: 0.14,
  });

  const matNavy = new THREE.MeshPhysicalMaterial({
    color: NAVY,
    roughness: 0.32,
    metalness: 0.28,
    clearcoat: 0.65,
    clearcoatRoughness: 0.2,
  });

  const matGlass = new THREE.MeshPhysicalMaterial({
    color: GLASS,
    roughness: 0.08,
    metalness: 0.05,
    transparent: true,
    opacity: 0.72,
    clearcoat: 1.0,
    ior: 1.5,
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
    bevelSegments: 4,
    bevelSize: 2.2,
    bevelThickness: 2.2,
  });
  hexGeo.center();

  const hexMesh = new THREE.Mesh(hexGeo, matYellow);
  hexMesh.castShadow = true;
  hexMesh.receiveShadow = true;
  hexMesh.position.set(6, 32, 0);
  layer2.add(hexMesh);

  // Inner floating Technology facet (Translucent teal prism in the hollow center)
  const innerFacetGeo = new THREE.CylinderGeometry(14, 14, 14, 6);
  innerFacetGeo.rotateY(Math.PI / 6);
  const innerFacet = new THREE.Mesh(innerFacetGeo, matGlass);
  innerFacet.castShadow = true;
  innerFacet.position.set(6, 32, 0);
  layer3.add(innerFacet);

  // Center golden energy node
  const coreNodeGeo = new THREE.OctahedronGeometry(6, 1);
  const coreNode = new THREE.Mesh(coreNodeGeo, matTeal);
  coreNode.position.set(6, 32, 0);
  layer3.add(coreNode);

  // =========================================================================
  // 2. KINETIC HEXAGONAL ORBITAL RINGS (Brandbook Page 22 Cover Motif)
  // Two overlapping thin hexagonal contours at complementary angles
  // =========================================================================
  const ring1Geo = new THREE.TorusGeometry(62, 1.2, 8, 6);
  const ring1Mat = new THREE.MeshStandardMaterial({
    color: TEAL,
    roughness: 0.25,
    metalness: 0.65,
  });
  const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
  ring1.rotation.x = Math.PI / 2.3;
  ring1.rotation.y = Math.PI / 6;
  ring1.position.set(6, 32, -4);
  layer0.add(ring1);

  const ring2Geo = new THREE.TorusGeometry(74, 1.0, 8, 6);
  const ring2Mat = new THREE.MeshStandardMaterial({
    color: BLUE,
    roughness: 0.25,
    metalness: 0.65,
  });
  const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
  ring2.rotation.x = Math.PI / 2.1;
  ring2.rotation.y = -Math.PI / 4;
  ring2.position.set(6, 32, -8);
  layer0.add(ring2);

  // =========================================================================
  // 3. OFFICIAL 3D INOTEX WORDMARK (I · N · O · T · E · X)
  // Precision letters with correct spacing, vertical spine for E, and bold I
  // =========================================================================
  const letterDepth = 12;
  const extrudeLetter = (shape: THREE.Shape, depth = letterDepth) => {
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: 1.0,
      bevelThickness: 1.0,
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

  const mO = new THREE.Mesh(extrudeLetter(sO, 14), matYellow);
  mO.castShadow = true;
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
  mX.position.set(136, LETTER_Y, 2);
  layer1.add(mX);

  // =========================================================================
  // 4. ARCHITECTURAL PEDESTAL & ACCENT INSETS
  // Chamfered navy titanium base holding the wordmark
  // =========================================================================
  const plinthGeo = new THREE.BoxGeometry(290, 8, 38);
  const plinth = new THREE.Mesh(plinthGeo, matNavy);
  plinth.castShadow = true;
  plinth.receiveShadow = true;
  plinth.position.set(9, LETTER_Y - 42, 0);
  layer0.add(plinth);

  // Accent metallic groove in brand yellow
  const grooveGeo = new THREE.BoxGeometry(274, 1.8, 40);
  const groove = new THREE.Mesh(grooveGeo, matYellow);
  groove.position.set(9, LETTER_Y - 42, 0);
  layer0.add(groove);

  // =========================================================================
  // 5. FLOATING GEOMETRIC INNOVATION NODES
  // Clean crystal prisms and hexagonal chips orbiting the emblem
  // =========================================================================
  const nodeDefs = [
    { pos: [-94, 48, 16], r: 7, mat: matTeal },
    { pos: [102, 42, -12], r: 8, mat: matYellow },
    { pos: [-70, 76, -20], r: 6, mat: matBlue },
    { pos: [82, 80, 18], r: 7.5, mat: matTeal },
    { pos: [6, 88, -14], r: 6, mat: matGlass },
  ];

  nodeDefs.forEach(({ pos, r, mat }) => {
    const geo = new THREE.CylinderGeometry(r, r, r * 0.7, 6);
    geo.rotateX(0.4);
    geo.rotateZ(0.3);
    const node = new THREE.Mesh(geo, mat);
    node.castShadow = true;
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
