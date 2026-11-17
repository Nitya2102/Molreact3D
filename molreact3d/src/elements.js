/**
 * Comprehensive chemical element definitions:
 * - CPK (Corey-Pauling-Koltun) coloring standard
 * - Covalent radii (Cordero et al. 2008) in Angstroms for bond computation
 * - Van der Waals radii (Bondi 1964 / Rowland & Taylor 1996) in Angstroms for CPK space-filling models
 * - Atomic number and element full name
 */

export const ELEMENT_DATA = {
  H:  { name: "Hydrogen",   atomicNumber: 1,  color: 0xffffff, covRadius: 0.31, vdwRadius: 1.20, drawRadius: 0.28 },
  He: { name: "Helium",     atomicNumber: 2,  color: 0xd9ffff, covRadius: 0.28, vdwRadius: 1.40, drawRadius: 0.30 },
  Li: { name: "Lithium",    atomicNumber: 3,  color: 0xcc80ff, covRadius: 1.28, vdwRadius: 1.82, drawRadius: 0.45 },
  Be: { name: "Beryllium",  atomicNumber: 4,  color: 0xc2ff00, covRadius: 0.96, vdwRadius: 1.53, drawRadius: 0.40 },
  B:  { name: "Boron",      atomicNumber: 5,  color: 0xffb5b5, covRadius: 0.84, vdwRadius: 1.92, drawRadius: 0.42 },
  C:  { name: "Carbon",     atomicNumber: 6,  color: 0x333333, covRadius: 0.76, vdwRadius: 1.70, drawRadius: 0.42 },
  N:  { name: "Nitrogen",   atomicNumber: 7,  color: 0x3050f8, covRadius: 0.71, vdwRadius: 1.55, drawRadius: 0.40 },
  O:  { name: "Oxygen",     atomicNumber: 8,  color: 0xff0d0d, covRadius: 0.66, vdwRadius: 1.52, drawRadius: 0.38 },
  F:  { name: "Fluorine",   atomicNumber: 9,  color: 0x90e050, covRadius: 0.57, vdwRadius: 1.47, drawRadius: 0.36 },
  Ne: { name: "Neon",       atomicNumber: 10, color: 0xb3e3f5, covRadius: 0.58, vdwRadius: 1.54, drawRadius: 0.38 },
  Na: { name: "Sodium",     atomicNumber: 11, color: 0xab5cf2, covRadius: 1.66, vdwRadius: 2.27, drawRadius: 0.50 },
  Mg: { name: "Magnesium",  atomicNumber: 12, color: 0x8aff00, covRadius: 1.41, vdwRadius: 1.73, drawRadius: 0.48 },
  Al: { name: "Aluminum",   atomicNumber: 13, color: 0xbfa6a6, covRadius: 1.21, vdwRadius: 1.84, drawRadius: 0.45 },
  Si: { name: "Silicon",    atomicNumber: 14, color: 0xf0c8a0, covRadius: 1.11, vdwRadius: 2.10, drawRadius: 0.45 },
  P:  { name: "Phosphorus", atomicNumber: 15, color: 0xff8000, covRadius: 1.07, vdwRadius: 1.80, drawRadius: 0.45 },
  S:  { name: "Sulfur",     atomicNumber: 16, color: 0xffff30, covRadius: 1.05, vdwRadius: 1.80, drawRadius: 0.45 },
  Cl: { name: "Chlorine",   atomicNumber: 17, color: 0x1ff01f, covRadius: 1.02, vdwRadius: 1.75, drawRadius: 0.42 },
  Ar: { name: "Argon",      atomicNumber: 18, color: 0x80d1e3, covRadius: 1.06, vdwRadius: 1.88, drawRadius: 0.44 },
  K:  { name: "Potassium",  atomicNumber: 19, color: 0x8f40d4, covRadius: 2.03, vdwRadius: 2.75, drawRadius: 0.55 },
  Ca: { name: "Calcium",    atomicNumber: 20, color: 0x3dff00, covRadius: 1.76, vdwRadius: 2.31, drawRadius: 0.52 },
  Sc: { name: "Scandium",   atomicNumber: 21, color: 0xe6e6e6, covRadius: 1.70, vdwRadius: 2.11, drawRadius: 0.50 },
  Ti: { name: "Titanium",   atomicNumber: 22, color: 0xbfc2c7, covRadius: 1.60, vdwRadius: 2.00, drawRadius: 0.50 },
  V:  { name: "Vanadium",   atomicNumber: 23, color: 0xa6a6ab, covRadius: 1.53, vdwRadius: 2.00, drawRadius: 0.50 },
  Cr: { name: "Chromium",   atomicNumber: 24, color: 0x8a99c7, covRadius: 1.39, vdwRadius: 2.00, drawRadius: 0.48 },
  Mn: { name: "Manganese",  atomicNumber: 25, color: 0x9c7ac7, covRadius: 1.39, vdwRadius: 2.00, drawRadius: 0.48 },
  Fe: { name: "Iron",       atomicNumber: 26, color: 0xe06633, covRadius: 1.32, vdwRadius: 2.00, drawRadius: 0.48 },
  Co: { name: "Cobalt",     atomicNumber: 27, color: 0xf090a0, covRadius: 1.26, vdwRadius: 2.00, drawRadius: 0.48 },
  Ni: { name: "Nickel",     atomicNumber: 28, color: 0x50d050, covRadius: 1.24, vdwRadius: 1.63, drawRadius: 0.48 },
  Cu: { name: "Copper",     atomicNumber: 29, color: 0xc88033, covRadius: 1.32, vdwRadius: 1.40, drawRadius: 0.48 },
  Zn: { name: "Zinc",       atomicNumber: 30, color: 0x7d80b0, covRadius: 1.22, vdwRadius: 1.39, drawRadius: 0.48 },
  Ga: { name: "Gallium",    atomicNumber: 31, color: 0xc28f8f, covRadius: 1.22, vdwRadius: 1.87, drawRadius: 0.46 },
  Ge: { name: "Germanium",  atomicNumber: 32, color: 0x668f8f, covRadius: 1.20, vdwRadius: 2.11, drawRadius: 0.46 },
  As: { name: "Arsenic",    atomicNumber: 33, color: 0xbd80e3, covRadius: 1.19, vdwRadius: 1.85, drawRadius: 0.46 },
  Se: { name: "Selenium",   atomicNumber: 34, color: 0xffa100, covRadius: 1.20, vdwRadius: 1.90, drawRadius: 0.46 },
  Br: { name: "Bromine",    atomicNumber: 35, color: 0xa62929, covRadius: 1.20, vdwRadius: 1.85, drawRadius: 0.46 },
  Kr: { name: "Krypton",    atomicNumber: 36, color: 0x5cb8d1, covRadius: 1.16, vdwRadius: 2.02, drawRadius: 0.46 },
  Rb: { name: "Rubidium",   atomicNumber: 37, color: 0x702eb8, covRadius: 2.20, vdwRadius: 3.03, drawRadius: 0.58 },
  Sr: { name: "Strontium",  atomicNumber: 38, color: 0x00ff00, covRadius: 1.95, vdwRadius: 2.49, drawRadius: 0.54 },
  I:  { name: "Iodine",     atomicNumber: 53, color: 0x940094, covRadius: 1.39, vdwRadius: 1.98, drawRadius: 0.50 },
  DEFAULT: { name: "Unknown", atomicNumber: 0, color: 0xaaaaaa, covRadius: 1.00, vdwRadius: 1.70, drawRadius: 0.40 },
};

export function getElement(symbol) {
  if (!symbol) return ELEMENT_DATA.DEFAULT;
  const clean = symbol.trim().toUpperCase();
  const formatted = clean.length > 1 ? clean[0] + clean.slice(1).toLowerCase() : clean;
  return ELEMENT_DATA[formatted] || ELEMENT_DATA[clean] || ELEMENT_DATA.DEFAULT;
}
