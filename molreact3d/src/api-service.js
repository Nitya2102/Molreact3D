import { parsePDB } from "./parsers/pdb-parser.js";
import { parseSDF } from "./parsers/sdf-parser.js";

const pdbCache = new Map();
const pubchemCache = new Map();

/**
 * Fetch macromolecule structure from RCSB Protein Data Bank API.
 * - Downloads raw .pdb coordinate file from files.rcsb.org
 * - Fetches biological metadata from data.rcsb.org REST API
 */
export async function fetchFromRCSB(pdbId) {
  const cleanId = pdbId.trim().toUpperCase();
  if (pdbCache.has(cleanId)) {
    return pdbCache.get(cleanId);
  }

  // Fetch coordinates
  const pdbUrl = `https://files.rcsb.org/download/${cleanId}.pdb`;
  const pdbRes = await fetch(pdbUrl);
  if (!pdbRes.ok) {
    throw new Error(`RCSB PDB entry "${cleanId}" not found (HTTP ${pdbRes.status}). Ensure the 4-character ID is valid.`);
  }
  const text = await pdbRes.text();
  const parsed = parsePDB(text);

  // Fetch entry metadata asynchronously
  let metadata = {
    id: cleanId,
    title: `PDB ID: ${cleanId}`,
    method: "X-RAY DIFFRACTION",
    resolution: null,
    organism: "Biological source"
  };

  try {
    const metaRes = await fetch(`https://data.rcsb.org/rest/v1/core/entry/${cleanId}`);
    if (metaRes.ok) {
      const data = await metaRes.json();
      metadata.title = data.struct?.title || metadata.title;
      metadata.method = data.exptl?.[0]?.method || metadata.method;
      metadata.resolution = data.rcsb_entry_info?.resolution_combined?.[0] || null;
    }
  } catch (err) {
    // Non-critical: metadata fetch failure doesn't block visualization
    console.warn("Could not fetch RCSB metadata:", err);
  }

  const result = {
    ...parsed,
    metadata,
    source: "RCSB PDB API"
  };

  pdbCache.set(cleanId, result);
  return result;
}

/**
 * Fetch small molecule 3D conformer from NCBI PubChem PUG REST API.
 * - Downloads authentic 3D SDF conformer by compound name or CID
 * - Extracts chemical bonds, coordinates, atom types, and partial charges
 */
export async function fetchFromPubChem(query) {
  const cleanQuery = query.trim().toLowerCase();
  if (pubchemCache.has(cleanQuery)) {
    return pubchemCache.get(cleanQuery);
  }

  const isNumeric = /^\d+$/.test(cleanQuery);
  const url = isNumeric
    ? `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cleanQuery}/SDF?record_type=3d`
    : `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(cleanQuery)}/SDF?record_type=3d`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`PubChem compound "${query}" not found or lacks a 3D conformer (HTTP ${res.status}).`);
  }

  const text = await res.text();
  const parsed = parseSDF(text);

  const result = {
    ...parsed,
    metadata: {
      id: parsed.title,
      title: `${query.charAt(0).toUpperCase() + query.slice(1)} (PubChem 3D Conformer)`,
      formula: parsed.atoms.map(a => a.element).join(""),
      atomCount: parsed.atoms.length,
      bondCount: parsed.bonds.length
    },
    source: "NCBI PubChem REST API"
  };

  pubchemCache.set(cleanQuery, result);
  return result;
}
