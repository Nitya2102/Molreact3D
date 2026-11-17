import { getElement } from "../elements.js";

/**
 * SDF/MOL Parser (Supports V2000 format, standard for PubChem 3D conformers)
 * Extracts:
 * - Title and metadata
 * - 3D atomic coordinates (x, y, z)
 * - Atom elements, partial charges
 * - Explicit chemical bond orders (single, double, triple, aromatic)
 */
export function parseSDF(text) {
  const lines = text.split(/\r?\n/);
  if (lines.length < 4) {
    throw new Error("Invalid SDF/MOL file: too few lines");
  }

  const title = lines[0].trim() || "Molecule";
  const countsLine = lines[3];
  
  // Format V2000: columns 0-3: numAtoms, 3-6: numBonds
  const numAtoms = parseInt(countsLine.slice(0, 3).trim(), 10);
  const numBonds = parseInt(countsLine.slice(3, 6).trim(), 10);

  if (isNaN(numAtoms)) {
    throw new Error("Unable to parse atom counts in SDF header");
  }

  const atoms = [];
  let linePtr = 4;

  for (let i = 0; i < numAtoms && linePtr < lines.length; i++, linePtr++) {
    const line = lines[linePtr];
    const x = parseFloat(line.slice(0, 10).trim());
    const y = parseFloat(line.slice(10, 20).trim());
    const z = parseFloat(line.slice(20, 30).trim());
    let element = line.slice(31, 34).trim();
    if (!element) element = "C";
    element = element.length > 1 ? element[0].toUpperCase() + element.slice(1).toLowerCase() : element.toUpperCase();

    // Formal charge if specified in columns 36-39
    const chargeCode = parseInt(line.slice(36, 39).trim(), 10) || 0;
    let charge = 0;
    if (chargeCode === 1) charge = 3;
    else if (chargeCode === 2) charge = 2;
    else if (chargeCode === 3) charge = 1;
    else if (chargeCode === 5) charge = -1;
    else if (chargeCode === 6) charge = -2;
    else if (chargeCode === 7) charge = -3;

    atoms.push({
      index: i,
      serial: i + 1,
      name: `${element}${i + 1}`,
      element,
      x, y, z,
      charge,
      isHetero: element !== "C" && element !== "H"
    });
  }

  const bonds = [];
  const bondOrders = [];
  for (let j = 0; j < numBonds && linePtr < lines.length; j++, linePtr++) {
    const line = lines[linePtr];
    // 1-indexed atom references
    const a1 = parseInt(line.slice(0, 3).trim(), 10) - 1;
    const a2 = parseInt(line.slice(3, 6).trim(), 10) - 1;
    const order = parseInt(line.slice(6, 9).trim(), 10) || 1;

    if (a1 >= 0 && a1 < atoms.length && a2 >= 0 && a2 < atoms.length) {
      bonds.push([a1, a2]);
      bondOrders.push(order);
    }
  }

  // Parse PubChem partial charges if present in data properties
  const partialChargeTagIdx = lines.findIndex(l => l.includes("<PUBCHEM_MMFF94_PARTIAL_CHARGES>"));
  if (partialChargeTagIdx !== -1) {
    const count = parseInt(lines[partialChargeTagIdx + 1]?.trim(), 10) || 0;
    for (let k = 0; k < count; k++) {
      const chargeLine = lines[partialChargeTagIdx + 2 + k];
      if (!chargeLine || chargeLine.startsWith(">") || chargeLine.startsWith("$$$$")) break;
      const parts = chargeLine.trim().split(/\s+/);
      if (parts.length >= 2) {
        const atomIdx = parseInt(parts[0], 10) - 1;
        const pCharge = parseFloat(parts[1]);
        if (atoms[atomIdx]) {
          atoms[atomIdx].partialCharge = pCharge;
        }
      }
    }
  }

  return {
    title,
    atoms,
    bonds,
    bondOrders,
    caBackbone: []
  };
}
