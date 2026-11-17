import { getElement } from "../elements.js";

/**
 * Robust PDB Parser:
 * - Extracts ATOM / HETATM records with coordinates, residue, chain, temp factor
 * - Extracts CONECT records for explicit connectivity
 * - Extracts HELIX and SHEET records for secondary structure ribbon/tube assignment
 * - Extracts C-alpha (CA) backbone coordinates for protein ribbon representation
 */
export function parsePDB(text) {
  const atoms = [];
  const serialToIndex = new Map();
  const explicitBonds = new Set();
  const secondaryStructure = {
    helices: [],
    sheets: []
  };
  const caBackbone = []; // For ribbon rendering

  const lines = text.split(/\r?\n/);
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    const tag = line.slice(0, 6).trim();

    if (tag === "ATOM" || tag === "HETATM") {
      const serial = parseInt(line.slice(6, 11).trim(), 10) || (atoms.length + 1);
      const rawName = line.slice(12, 16).trim();
      const altLoc = line.slice(16, 17).trim();
      if (altLoc && altLoc !== "A" && altLoc !== "1") continue; // skip alt conformations

      const resName = line.slice(17, 20).trim();
      const chain = line.slice(21, 22).trim() || "A";
      const resSeq = parseInt(line.slice(22, 26).trim(), 10) || 0;
      const x = parseFloat(line.slice(30, 38));
      const y = parseFloat(line.slice(38, 46));
      const z = parseFloat(line.slice(46, 54));

      if (isNaN(x) || isNaN(y) || isNaN(z)) continue;

      let element = line.length >= 78 ? line.slice(76, 78).trim() : "";
      if (!element) {
        element = rawName.replace(/[0-9]/g, "").slice(0, 2);
      }
      element = element.length > 1 ? element[0].toUpperCase() + element.slice(1).toLowerCase() : element.toUpperCase();

      const atomIndex = atoms.length;
      serialToIndex.set(serial, atomIndex);

      const atom = {
        index: atomIndex,
        serial,
        name: rawName,
        element,
        resName,
        chain,
        resSeq,
        x, y, z,
        isHetero: tag === "HETATM"
      };
      atoms.push(atom);

      // Track CA for protein backbone ribbon
      if (rawName === "CA" && tag === "ATOM") {
        caBackbone.push({
          atomIndex,
          x, y, z,
          chain,
          resSeq,
          resName
        });
      }
    } else if (tag === "CONECT") {
      const nums = [];
      for (let i = 6; i + 5 <= line.length; i += 5) {
        const chunk = line.slice(i, i + 5).trim();
        if (chunk) nums.push(parseInt(chunk, 10));
      }
      if (nums.length >= 2) {
        const from = nums[0];
        for (let k = 1; k < nums.length; k++) {
          const to = nums[k];
          const key = from < to ? `${from}_${to}` : `${to}_${from}`;
          explicitBonds.add(key);
        }
      }
    } else if (tag === "HELIX") {
      const chain = line.slice(19, 20).trim();
      const startSeq = parseInt(line.slice(21, 25).trim(), 10);
      const endSeq = parseInt(line.slice(33, 37).trim(), 10);
      secondaryStructure.helices.push({ chain, startSeq, endSeq });
    } else if (tag === "SHEET") {
      const chain = line.slice(21, 22).trim();
      const startSeq = parseInt(line.slice(22, 26).trim(), 10);
      const endSeq = parseInt(line.slice(33, 37).trim(), 10);
      secondaryStructure.sheets.push({ chain, startSeq, endSeq });
    }
  }

  let bonds = [];
  if (explicitBonds.size > 0) {
    for (const key of explicitBonds) {
      const [sA, sB] = key.split("_").map(Number);
      const iA = serialToIndex.get(sA);
      const iB = serialToIndex.get(sB);
      if (iA !== undefined && iB !== undefined && iA !== iB) {
        bonds.push([iA, iB]);
      }
    }
  }

  // If no explicit bonds or very few, compute via spatial distance grid
  if (bonds.length === 0 && atoms.length > 0) {
    bonds = computeBondsGrid(atoms);
  }

  return {
    atoms,
    bonds,
    caBackbone,
    secondaryStructure
  };
}

/**
 * Grid-accelerated bond detection using covalent radii + tolerance.
 * Operates in O(N) average time complexity using a 3D spatial hash map.
 */
export function computeBondsGrid(atoms, tolerance = 0.45) {
  const cellSize = 2.4;
  const grid = new Map();
  const key = (cx, cy, cz) => `${cx},${cy},${cz}`;
  const cellOf = (a) => [
    Math.floor(a.x / cellSize),
    Math.floor(a.y / cellSize),
    Math.floor(a.z / cellSize)
  ];

  for (let i = 0; i < atoms.length; i++) {
    const [cx, cy, cz] = cellOf(atoms[i]);
    const k = key(cx, cy, cz);
    if (!grid.has(k)) grid.set(k, []);
    grid.get(k).push(i);
  }

  const bonds = [];
  for (let i = 0; i < atoms.length; i++) {
    const a = atoms[i];
    const rA = getElement(a.element).covRadius;
    const [cx, cy, cz] = cellOf(a);

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dz = -1; dz <= 1; dz++) {
          const bucket = grid.get(key(cx + dx, cy + dy, cz + dz));
          if (!bucket) continue;
          for (const j of bucket) {
            if (j <= i) continue;
            const b = atoms[j];
            const ddx = a.x - b.x;
            const ddy = a.y - b.y;
            const ddz = a.z - b.z;
            const distSq = ddx * ddx + ddy * ddy + ddz * ddz;
            const maxBond = rA + getElement(b.element).covRadius + tolerance;
            if (distSq <= maxBond * maxBond && distSq > 0.04) {
              bonds.push([i, j]);
            }
          }
        }
      }
    }
  }

  return bonds;
}
