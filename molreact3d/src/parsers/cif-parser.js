import { getElement } from "../elements.js";
import { computeBondsGrid } from "./pdb-parser.js";

function splitCifRow(line) {
  const tokens = [];
  let i = 0;
  const n = line.length;
  while (i < n) {
    while (i < n && /\s/.test(line[i])) i++;
    if (i >= n) break;
    if (line[i] === "'" || line[i] === '"') {
      const quote = line[i];
      i++;
      const start = i;
      while (i < n && line[i] !== quote) i++;
      tokens.push(line.slice(start, i));
      i++;
    } else {
      const start = i;
      while (i < n && !/\s/.test(line[i])) i++;
      tokens.push(line.slice(start, i));
    }
  }
  return tokens;
}

export function parseCIF(text) {
  const lines = text.split(/\r?\n/);
  let atomSiteStart = -1;
  let columns = [];

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === "loop_") {
      let j = i + 1;
      const cols = [];
      while (j < lines.length && lines[j].trim().startsWith("_atom_site.")) {
        cols.push(lines[j].trim().slice("_atom_site.".length));
        j++;
      }
      if (cols.length > 0) {
        atomSiteStart = j;
        columns = cols;
        break;
      }
    }
  }
  if (atomSiteStart === -1) throw new Error("No _atom_site loop found in CIF file");

  const col = (name) => columns.indexOf(name);
  const idxGroup = col("group_PDB");
  const idxSymbol = col("type_symbol");
  const idxAtomId = col("label_atom_id");
  const idxCompId = col("label_comp_id");
  const idxAsym = col("auth_asym_id") !== -1 ? col("auth_asym_id") : col("label_asym_id");
  const idxSeq = col("auth_seq_id") !== -1 ? col("auth_seq_id") : col("label_seq_id");
  const idxX = col("Cartn_x");
  const idxY = col("Cartn_y");
  const idxZ = col("Cartn_z");
  const idxAltId = col("label_alt_id");
  const idxModel = col("pdbx_PDB_model_num");

  const atoms = [];
  const caBackbone = [];
  let firstModel = null;

  for (let k = atomSiteStart; k < lines.length; k++) {
    const raw = lines[k];
    const trimmed = raw.trim();
    if (trimmed === "" || trimmed === "#") break;
    if (trimmed.startsWith("_") || trimmed === "loop_") break;

    const fields = splitCifRow(raw);
    if (fields.length < columns.length) continue;

    const model = idxModel !== -1 ? fields[idxModel] : "1";
    if (firstModel === null) firstModel = model;
    if (model !== firstModel) continue; // first model only

    const altId = idxAltId !== -1 ? fields[idxAltId] : ".";
    if (altId !== "." && altId !== "A" && altId !== "?") continue;

    const element = fields[idxSymbol];
    const x = parseFloat(fields[idxX]);
    const y = parseFloat(fields[idxY]);
    const z = parseFloat(fields[idxZ]);
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) continue;

    const atomName = idxAtomId !== -1 ? fields[idxAtomId] : "";
    const resName = idxCompId !== -1 ? fields[idxCompId] : "";
    const chain = idxAsym !== -1 ? fields[idxAsym] : "A";
    const resSeq = idxSeq !== -1 ? parseInt(fields[idxSeq], 10) : 0;
    const isHetero = idxGroup !== -1 ? fields[idxGroup] === "HETATM" : false;

    const atomIndex = atoms.length;
    atoms.push({
      index: atomIndex,
      element: element[0].toUpperCase() + element.slice(1).toLowerCase(),
      name: atomName,
      resName,
      chain,
      resSeq,
      x, y, z,
      isHetero,
    });

    if (atomName === "CA" && !isHetero) {
      caBackbone.push({
        atomIndex,
        x, y, z,
        chain,
        resSeq,
        resName
      });
    }
  }

  const bonds = computeBondsGrid(atoms);
  return { atoms, bonds, caBackbone };
}

export { computeBondsGrid as computeBondsByDistanceGrid };
