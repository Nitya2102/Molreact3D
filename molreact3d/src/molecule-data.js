import { getElement, ELEMENT_DATA } from "./elements.js";
import { parsePDB, computeBondsGrid } from "./parsers/pdb-parser.js";

export const ELEMENT_INFO = ELEMENT_DATA;
export function elementInfo(symbol) {
  const el = getElement(symbol);
  return {
    color: el.color,
    radius: el.covRadius,
    drawRadius: el.drawRadius
  };
}

export { parsePDB };
export const computeBondsByDistance = computeBondsGrid;
