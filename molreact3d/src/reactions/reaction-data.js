/**
 * Authentic Biochemical and Chemical Reaction Datasets
 * Each reaction defines:
 * - name, description, chemical equation, category
 * - atoms: list of { id, element, name, resName, x, y, z }
 * - baseBonds: list of [atomA, atomB]
 * - trajectory: function(t) returning [x, y, z] for each atom at progress t in [0, 1]
 * - dynamicBonds: { breaking: [...], forming: [...] }
 * - energyProfile: { activationEnergy, deltaG, unit }
 * - captions: array of { tStart, tEnd, stage, text } synchronized with reaction progress
 */

export const REACTIONS = {
  atp_hydrolysis: {
    id: "atp_hydrolysis",
    name: "ATP Hydrolysis",
    category: "Biochemical Energy Transfer",
    equation: "ATP⁴⁻ + H₂O  ⟶  ADP³⁻ + HPO₄²⁻ + H⁺",
    description: "The primary biochemical energy reaction of life. Nucleophilic attack of water on the terminal γ-phosphate of ATP forms a pentacoordinate transition state, followed by cleavage of the high-energy phosphoanhydride bond to yield ADP and inorganic phosphate (Pi).",
    energyProfile: {
      activationEnergy: 52,
      deltaG: -30.5,
      unit: "kJ/mol"
    },
    captions: [
      { tStart: 0.00, tEnd: 0.25, stage: "Reactants: ATP + H₂O", text: "Nucleophilic water molecule aligns toward the electrophilic terminal γ-phosphate of ATP." },
      { tStart: 0.25, tEnd: 0.45, stage: "Nucleophilic Attack", text: "Water oxygen approaches within bonding distance; bridging Pγ—O3β phosphoanhydride bond stretches under strain." },
      { tStart: 0.45, tEnd: 0.65, stage: "Transition State [‡]", text: "Pentacoordinate phosphorane transition state reached at peak activation barrier (+52 kJ/mol)." },
      { tStart: 0.65, tEnd: 0.85, stage: "Bond Scission", text: "High-energy phosphoanhydride bond cleaves; proton transfers to solution as Pi separates from ADP³⁻." },
      { tStart: 0.85, tEnd: 1.00, stage: "Products: ADP + Pi", text: "Free ADP and inorganic phosphate diffuse apart, releasing -30.5 kJ/mol of biochemical energy." }
    ],
    atoms: [
      { id: 0, element: "N", name: "N9", x: -4.5, y: 0.0, z: 0.0 },
      { id: 1, element: "C", name: "C8", x: -4.0, y: 1.1, z: 0.0 },
      { id: 2, element: "N", name: "N7", x: -2.8, y: 0.8, z: 0.0 },
      { id: 3, element: "C", name: "C5", x: -2.5, y: -0.5, z: 0.0 },
      { id: 4, element: "C", name: "C6", x: -1.3, y: -1.2, z: 0.0 },
      { id: 5, element: "N", name: "N6", x: -1.2, y: -2.5, z: 0.0 },
      { id: 6, element: "C", name: "C1'", x: -4.0, y: -1.3, z: 0.2 },
      { id: 7, element: "C", name: "C2'", x: -4.8, y: -2.4, z: 0.5 },
      { id: 8, element: "O", name: "O2'", x: -4.5, y: -3.5, z: -0.2 },
      { id: 9, element: "C", name: "C3'", x: -6.2, y: -1.9, z: 0.4 },
      { id: 10, element: "C", name: "C4'", x: -6.0, y: -0.5, z: -0.2 },
      { id: 11, element: "O", name: "O4'", x: -4.7, y: -0.1, z: 0.1 },
      { id: 12, element: "C", name: "C5'", x: -6.9, y: 0.6, z: 0.1 },
      { id: 13, element: "O", name: "O5'", x: -6.5, y: 1.8, z: -0.5 },
      { id: 14, element: "P", name: "PA", x: -5.3, y: 2.8, z: -0.3 },
      { id: 15, element: "O", name: "O1A", x: -5.7, y: 3.9, z: 0.5 },
      { id: 16, element: "O", name: "O2A", x: -5.1, y: 3.2, z: -1.7 },
      { id: 17, element: "O", name: "O3A", x: -3.9, y: 2.1, z: 0.2 },
      { id: 18, element: "P", name: "PB", x: -2.5, y: 2.5, z: -0.4 },
      { id: 19, element: "O", name: "O1B", x: -2.6, y: 3.7, z: -1.2 },
      { id: 20, element: "O", name: "O2B", x: -2.2, y: 2.7, z: 1.0 },
      { id: 21, element: "O", name: "O3B", x: -1.3, y: 1.6, z: -0.9 },
      { id: 22, element: "P", name: "PG", x: 0.2, y: 1.5, z: -0.3 },
      { id: 23, element: "O", name: "O1G", x: 0.5, y: 2.7, z: 0.5 },
      { id: 24, element: "O", name: "O2G", x: 0.3, y: 0.3, z: 0.6 },
      { id: 25, element: "O", name: "O3G", x: 0.7, y: 1.3, z: -1.7 },
      { id: 26, element: "O", name: "OW", x: 2.8, y: 1.8, z: -0.2 },
      { id: 27, element: "H", name: "HW1", x: 3.3, y: 2.6, z: 0.0 },
      { id: 28, element: "H", name: "HW2", x: 3.1, y: 1.1, z: 0.4 },
    ],
    baseBonds: [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [3, 0], [0, 6],
      [6, 7], [7, 8], [7, 9], [9, 10], [10, 11], [11, 6], [10, 12], [12, 13],
      [13, 14], [14, 15], [14, 16], [14, 17],
      [17, 18], [18, 19], [18, 20], [18, 21],
      [22, 23], [22, 24], [22, 25],
      [26, 27], [26, 28]
    ],
    dynamicBonds: {
      breaking: [{ atomA: 21, atomB: 22, name: "Pγ — O3β Phosphoanhydride Bond" }],
      forming: [{ atomA: 22, atomB: 26, name: "Pγ — O(water) Hydroxyl Bond" }]
    },
    trajectory: (t) => {
      return [
        [-4.5, 0.0, 0.0], [-4.0, 1.1, 0.0], [-2.8, 0.8, 0.0], [-2.5, -0.5, 0.0],
        [-1.3, -1.2, 0.0], [-1.2, -2.5, 0.0], [-4.0, -1.3, 0.2], [-4.8, -2.4, 0.5],
        [-4.5, -3.5, -0.2], [-6.2, -1.9, 0.4], [-6.0, -0.5, -0.2], [-4.7, -0.1, 0.1],
        [-6.9, 0.6, 0.1], [-6.5, 1.8, -0.5],
        [-5.3, 2.8, -0.3], [-5.7, 3.9, 0.5], [-5.1, 3.2, -1.7], [-3.9, 2.1, 0.2],
        [-2.5, 2.5, -0.4], [-2.6, 3.7, -1.2], [-2.2, 2.7, 1.0],
        [-1.3 - 0.2 * t, 1.6 - 0.1 * t, -0.9],
        [0.2 + 2.2 * (t * t), 1.5 + 0.3 * t, -0.3],
        [0.5 + 2.2 * (t * t), 2.7 + 0.2 * t, 0.5],
        [0.3 + 2.2 * (t * t), 0.3 + 0.4 * t, 0.6],
        [0.7 + 2.2 * (t * t), 1.3 + 0.3 * t, -1.7],
        [2.8 - 1.2 * t + 2.2 * (t * t), 1.8 + 0.1 * t, -0.2],
        [3.3 + 1.8 * t, 2.6 + 1.5 * t, 0.0 + 0.5 * t],
        [3.1 - 1.1 * t + 2.2 * (t * t), 1.1 + 0.1 * t, 0.4]
      ];
    }
  },

  sn2_substitution: {
    id: "sn2_substitution",
    name: "SN2 Nucleophilic Substitution",
    category: "Organic & Enzymatic Mechanism",
    equation: "OH⁻ + CH₃Br  ⟶  [HO···CH₃···Br]‡  ⟶  CH₃OH + Br⁻",
    description: "Classic bimolecular nucleophilic substitution. Hydroxide attacks bromomethane directly from the backside (180°), causing planar inversion of the methyl group (Walden inversion) through a trigonal bipyramidal transition state.",
    energyProfile: {
      activationEnergy: 84,
      deltaG: -55,
      unit: "kJ/mol"
    },
    captions: [
      { tStart: 0.00, tEnd: 0.25, stage: "Reactants: OH⁻ + CH₃Br", text: "Hydroxide nucleophile approaches bromomethane from the backside at 180° along the C—Br axis." },
      { tStart: 0.25, tEnd: 0.45, stage: "Backside Approach", text: "Incoming OH⁻ donates electron density into C—Br σ* antibonding orbital; methyl hydrogens begin flattening." },
      { tStart: 0.45, tEnd: 0.65, stage: "Transition State [‡]", text: "Trigonal bipyramidal [HO···CH₃···Br]‡ transition state with planar sp² carbon and simultaneous partial bonds." },
      { tStart: 0.65, tEnd: 0.85, stage: "Walden Inversion", text: "C—Br bond cleaves completely while C—O bond forms; methyl umbrella inverts stereochemistry." },
      { tStart: 0.85, tEnd: 1.00, stage: "Products: CH₃OH + Br⁻", text: "Methanol forms with inverted configuration; bromide leaving group departs into solvent." }
    ],
    atoms: [
      { id: 0, element: "C", name: "C1", x: 0.0, y: 0.0, z: 0.0 },
      { id: 1, element: "H", name: "H1", x: -0.36, y: 1.02, z: 0.0 },
      { id: 2, element: "H", name: "H2", x: -0.36, y: -0.51, z: 0.88 },
      { id: 3, element: "H", name: "H3", x: -0.36, y: -0.51, z: -0.88 },
      { id: 4, element: "Br", name: "Br", x: 1.94, y: 0.0, z: 0.0 },
      { id: 5, element: "O", name: "O_nuc", x: -3.2, y: 0.0, z: 0.0 },
      { id: 6, element: "H", name: "H_nuc", x: -3.8, y: 0.8, z: 0.0 },
    ],
    baseBonds: [
      [0, 1], [0, 2], [0, 3],
      [5, 6]
    ],
    dynamicBonds: {
      breaking: [{ atomA: 0, atomB: 4, name: "C — Br Leaving Bond" }],
      forming: [{ atomA: 0, atomB: 5, name: "C — O Nucleophilic Bond" }]
    },
    trajectory: (t) => {
      const hX = -0.36 + 0.72 * t;
      const oX = -3.2 + 1.78 * t;
      const brX = 1.94 + 2.56 * (t * t);
      return [
        [0.0, 0.0, 0.0],
        [hX, 1.02, 0.0],
        [hX, -0.51, 0.88],
        [hX, -0.51, -0.88],
        [brX, 0.0, 0.0],
        [oX, 0.0, 0.0],
        [oX - 0.6, 0.8, 0.0]
      ];
    }
  },

  retinal_isomerization: {
    id: "retinal_isomerization",
    name: "Retinal Cis-Trans Isomerization",
    category: "Biophysical Phototransduction",
    equation: "11-cis-Retinal + hν  ⟶  all-trans-Retinal",
    description: "The primary biophysical event triggering human vision in Rhodopsin. Absorption of a photon causes ultrafast (200 femtosecond) photoisomerization about the C11=C12 double bond, converting the kinked 11-cis conformation into the elongated all-trans structure.",
    energyProfile: {
      activationEnergy: 45,
      deltaG: -20,
      unit: "kJ/mol"
    },
    captions: [
      { tStart: 0.00, tEnd: 0.25, stage: "11-cis Conformation", text: "Ground-state 11-cis-retinal chromophore fitted inside the rhodopsin binding pocket with its kinked polyene tail." },
      { tStart: 0.25, tEnd: 0.45, stage: "Photoexcitation", text: "Absorption of a photon excites π-electrons into π*, weakening the C11=C12 double bond and enabling rotation." },
      { tStart: 0.45, tEnd: 0.65, stage: "Transition State [‡]", text: "90° perpendicular twisted transition state with biradical character and maximum steric displacement." },
      { tStart: 0.65, tEnd: 0.85, stage: "Torsional Relaxation", text: "Chain continues 180° rotation, relaxing downward toward the lower energy planar all-trans conformation." },
      { tStart: 0.85, tEnd: 1.00, stage: "all-trans Retinal", text: "Elongated all-trans retinal pushes against rhodopsin helices, triggering neural visual signaling." }
    ],
    atoms: [
      { id: 0, element: "C", name: "C9", x: -2.8, y: -0.6, z: 0.0 },
      { id: 1, element: "C", name: "C10", x: -1.5, y: -0.1, z: 0.0 },
      { id: 2, element: "C", name: "C11", x: -0.3, y: -0.8, z: 0.0 },
      { id: 3, element: "C", name: "C12", x: 0.9, y: -0.2, z: 0.0 },
      { id: 4, element: "C", name: "C13", x: 1.9, y: -1.0, z: 0.0 },
      { id: 5, element: "C", name: "C14", x: 3.1, y: -0.4, z: 0.0 },
      { id: 6, element: "O", name: "O15", x: 4.1, y: -1.1, z: 0.0 },
      { id: 7, element: "H", name: "H10", x: -1.5, y: 1.0, z: 0.0 },
      { id: 8, element: "H", name: "H11", x: -0.3, y: -1.9, z: 0.0 },
      { id: 9, element: "H", name: "H12", x: 0.9, y: 0.9, z: 0.0 },
    ],
    baseBonds: [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6],
      [1, 7], [2, 8], [3, 9]
    ],
    dynamicBonds: {
      breaking: [],
      forming: [],
      isomerizationBond: [2, 3]
    },
    trajectory: (t) => {
      const angle = t * Math.PI;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      return [
        [-2.8, -0.6, 0.0],
        [-1.5, -0.1, 0.0],
        [-0.3, -0.8, 0.0],
        [0.9, -0.2, 0.0],
        [0.9 + 1.0 * cosA + 0.3 * (1 - cosA), -0.2 - 0.8 * cosA, 0.9 * sinA],
        [0.9 + 2.2 * cosA + 0.5 * (1 - cosA), -0.2 - 0.2 * cosA, 1.4 * sinA],
        [0.9 + 3.2 * cosA + 0.8 * (1 - cosA), -0.2 - 0.9 * cosA, 1.8 * sinA],
        [-1.5, 1.0, 0.0],
        [-0.3, -1.9, 0.0],
        [0.9, 0.9 * cosA, 0.9 * sinA]
      ];
    }
  },

  petase_catalysis: {
    id: "petase_catalysis",
    name: "PETase Enzymatic Cleavage",
    category: "Enzyme Catalytic Triad",
    equation: "PET-Ester + Ser160-Oγ  ⟶  Acyl-Enzyme Intermediate + Ethylene Glycol",
    description: "Bacterial PETase (Ideonella sakaiensis) active site mechanism. The Ser160 catalytic nucleophile, activated by His237 and Asp206, attacks the carbonyl ester of polyethylene terephthalate, breaking the polymer chain ester bond.",
    energyProfile: {
      activationEnergy: 38,
      deltaG: -18,
      unit: "kJ/mol"
    },
    captions: [
      { tStart: 0.00, tEnd: 0.25, stage: "Enzyme-Substrate Docking", text: "PET plastic ester bond positions in catalytic pocket adjacent to Ser160, His237, and Asp206 triad." },
      { tStart: 0.25, tEnd: 0.45, stage: "General Base Activation", text: "His237 acts as a base, deprotonating Ser160-Oγ to form a potent oxyanion nucleophile." },
      { tStart: 0.45, tEnd: 0.65, stage: "Transition State [‡]", text: "Tetrahedral oxyanion transition state forms; Ser160-Oγ bonds to ester carbonyl carbon." },
      { tStart: 0.65, tEnd: 0.85, stage: "Ester Cleavage", text: "Ester C—O bond breaks; proton transfers from His237 to release the ethylene glycol leaving group." },
      { tStart: 0.85, tEnd: 1.00, stage: "Acyl-Enzyme Intermediate", text: "Covalent acyl-enzyme intermediate formed on Ser160, awaiting hydrolytic turnover." }
    ],
    atoms: [
      { id: 0, element: "C", name: "CB_Ser", x: -2.5, y: -0.5, z: -0.2 },
      { id: 1, element: "O", name: "OG_Ser", x: -1.3, y: -0.2, z: 0.1 },
      { id: 2, element: "H", name: "HG_Ser", x: -1.1, y: 0.7, z: 0.1 },
      { id: 3, element: "N", name: "ND1_His", x: -0.9, y: 1.8, z: 0.2 },
      { id: 4, element: "C", name: "CE1_His", x: -1.6, y: 2.8, z: 0.1 },
      { id: 5, element: "N", name: "NE2_His", x: -1.0, y: 3.8, z: 0.2 },
      { id: 6, element: "C", name: "C_ester", x: 0.8, y: -0.2, z: 0.0 },
      { id: 7, element: "O", name: "O_carbonyl", x: 1.0, y: 1.0, z: -0.2 },
      { id: 8, element: "C", name: "C_phenyl", x: 1.9, y: -1.1, z: 0.1 },
      { id: 9, element: "O", name: "O_leaving", x: 0.2, y: -1.2, z: 0.2 },
      { id: 10, element: "C", name: "C_glycol1", x: 0.5, y: -2.5, z: 0.3 },
      { id: 11, element: "C", name: "C_glycol2", x: -0.6, y: -3.4, z: 0.2 }
    ],
    baseBonds: [
      [0, 1], [1, 2],
      [3, 4], [4, 5],
      [6, 7], [6, 8],
      [9, 10], [10, 11]
    ],
    dynamicBonds: {
      breaking: [{ atomA: 6, atomB: 9, name: "Ester C—O Cleavage" }],
      forming: [{ atomA: 1, atomB: 6, name: "Ser160 Oγ — Carbonyl Acyl Bond" }]
    },
    trajectory: (t) => {
      const serOX = -1.3 + 0.7 * t;
      const serOY = -0.2;
      const protonX = -1.1 + 0.2 * t;
      const protonY = 0.7 + 0.9 * t;
      const leavingOX = 0.2 - 1.2 * (t * t);
      const leavingOY = -1.2 - 1.5 * (t * t);
      return [
        [-2.5, -0.5, -0.2],
        [serOX, serOY, 0.1],
        [protonX, protonY, 0.15],
        [-0.9, 1.8, 0.2],
        [-1.6, 2.8, 0.1],
        [-1.0, 3.8, 0.2],
        [0.8 - 0.2 * t, -0.2, 0.0],
        [1.0 - 0.1 * t, 1.0, -0.2],
        [1.9, -1.1, 0.1],
        [leavingOX, leavingOY, 0.2],
        [leavingOX + 0.3, leavingOY - 1.3, 0.3],
        [leavingOX - 0.8, leavingOY - 2.2, 0.2]
      ];
    }
  },

  crispr_dna_cleavage: {
    id: "crispr_dna_cleavage",
    name: "CRISPR-Cas9 DNA Backbone Cleavage",
    category: "Biotechnology & Genome Editing",
    equation: "Target-DNA-Backbone + H₂O · [Mg²⁺]  ⟶  3'-OH + 5'-Phosphate",
    description: "The targeted endonuclease mechanism of Cas9. Guided by sgRNA, the HNH nuclease active site coordinates a catalytic divalent Magnesium ion (Mg²⁺), activating a nucleophilic water molecule to hydrolyze the phosphodiester backbone of the target DNA strand.",
    energyProfile: {
      activationEnergy: 42,
      deltaG: -24,
      unit: "kJ/mol"
    },
    captions: [
      { tStart: 0.00, tEnd: 0.25, stage: "Target DNA Recognition", text: "Cas9 HNH active site binds target DNA phosphodiester backbone guided by single-guide RNA." },
      { tStart: 0.25, tEnd: 0.45, stage: "Mg²⁺ Cofactor Activation", text: "Catalytic Mg²⁺ ion polarizes scissile phosphate oxygen and activates nucleophilic water molecule." },
      { tStart: 0.45, tEnd: 0.65, stage: "Transition State [‡]", text: "Bipyramidal pentacoordinate phosphorane transition state stabilized by divalent magnesium coordination." },
      { tStart: 0.65, tEnd: 0.85, stage: "Phosphodiester Scission", text: "Scissile O3'—P backbone bond cleaves, breaking the target DNA strand." },
      { tStart: 0.85, tEnd: 1.00, stage: "Cleaved DNA Ends", text: "DNA backbone severed, yielding 3'-OH and 5'-phosphate ends ready for cellular repair mechanisms." }
    ],
    atoms: [
      { id: 0, element: "Mg", name: "MG1", x: 0.0, y: 2.2, z: 0.0 },
      { id: 1, element: "C", name: "C3'", x: -2.8, y: -0.8, z: 0.0 },
      { id: 2, element: "O", name: "O3'", x: -1.6, y: -0.2, z: 0.0 },
      { id: 3, element: "P", name: "P_scissile", x: 0.0, y: -0.1, z: 0.0 },
      { id: 4, element: "O", name: "OP1", x: 0.4, y: 1.0, z: -0.9 },
      { id: 5, element: "O", name: "OP2", x: 0.3, y: -1.1, z: 0.9 },
      { id: 6, element: "O", name: "O5'", x: 1.4, y: -0.3, z: -0.3 },
      { id: 7, element: "C", name: "C5'", x: 2.6, y: -0.9, z: -0.1 },
      { id: 8, element: "O", name: "O_water", x: -0.5, y: -2.5, z: -0.2 },
      { id: 9, element: "H", name: "H_water", x: -1.3, y: -3.0, z: 0.0 },
      { id: 10, element: "N", name: "ND1_His840", x: -1.8, y: 3.0, z: 0.2 },
      { id: 11, element: "C", name: "CE1_His840", x: -2.4, y: 4.1, z: 0.1 }
    ],
    baseBonds: [
      [1, 2], [3, 4], [3, 5], [3, 6], [6, 7],
      [8, 9], [10, 11]
    ],
    dynamicBonds: {
      breaking: [{ atomA: 2, atomB: 3, name: "O3' — P Phosphodiester Cleavage" }],
      forming: [{ atomA: 3, atomB: 8, name: "P — OH Nucleophilic Bond" }]
    },
    trajectory: (t) => {
      const wY = -2.5 + 1.2 * t;
      const leavingX = -1.6 - 1.6 * (t * t);
      return [
        [0.0, 2.2, 0.0],
        [-2.8 - 1.6 * (t * t), -0.8, 0.0],
        [leavingX, -0.2, 0.0],
        [0.0, -0.1, 0.0],
        [0.4, 1.0, -0.9],
        [0.3, -1.1, 0.9],
        [1.4 + 0.3 * t, -0.3, -0.3],
        [2.6 + 0.3 * t, -0.9, -0.1],
        [-0.5 * (1 - t), wY, -0.2],
        [-1.3 - 0.5 * t, -3.0 + 0.5 * t, 0.0],
        [-1.8, 3.0, 0.2],
        [-2.4, 4.1, 0.1]
      ];
    }
  },

  peptide_bond_formation: {
    id: "peptide_bond_formation",
    name: "Peptide Bond Formation",
    category: "Ribosomal Protein Synthesis",
    equation: "Peptidyl-tRNA + Aminoacyl-tRNA  ⟶  Extended-Peptide + tRNA + H₂O",
    description: "The fundamental reaction of life that synthesizes all proteins inside the ribosome. The alpha-amino group (—NH₂) of the incoming amino acid attacks the ester carbonyl carbon of the peptidyl-tRNA, forming a planar peptide (amide) bond with expulsion of water/tRNA.",
    energyProfile: {
      activationEnergy: 48,
      deltaG: -12,
      unit: "kJ/mol"
    },
    captions: [
      { tStart: 0.00, tEnd: 0.25, stage: "Ribosomal A & P Sites", text: "Peptidyl-tRNA in P-site and incoming aminoacyl-tRNA in A-site positioned in peptidyl transferase center." },
      { tStart: 0.25, tEnd: 0.45, stage: "Amine Nucleophilic Attack", text: "Incoming α-amino group (—NH₂) executes nucleophilic attack on the ester carbonyl of peptidyl-tRNA." },
      { tStart: 0.45, tEnd: 0.65, stage: "Transition State [‡]", text: "Six-membered tetrahedral proton-shuttling transition state catalyzed by ribosomal 23S rRNA." },
      { tStart: 0.65, tEnd: 0.85, stage: "Amide Bond Formation", text: "Ester C—O linkage to P-site tRNA cleaves while new planar C—N peptide amide bond solidifies." },
      { tStart: 0.85, tEnd: 1.00, stage: "Extended Peptide Chain", text: "Polypeptide chain extended by one amino acid residue; deacylated tRNA released." }
    ],
    atoms: [
      { id: 0, element: "C", name: "C_alpha1", x: -2.8, y: 1.2, z: 0.0 },
      { id: 1, element: "C", name: "C_carbonyl", x: -1.4, y: 0.6, z: 0.0 },
      { id: 2, element: "O", name: "O_carbonyl", x: -1.3, y: -0.6, z: 0.0 },
      { id: 3, element: "O", name: "O_tRNA", x: -0.4, y: 1.4, z: 0.1 },
      { id: 4, element: "C", name: "C_tRNA", x: -0.1, y: 2.7, z: 0.2 },
      { id: 5, element: "N", name: "N_amino", x: 2.6, y: 0.2, z: 0.0 },
      { id: 6, element: "H", name: "H_amino1", x: 2.8, y: -0.7, z: 0.3 },
      { id: 7, element: "H", name: "H_amino2", x: 3.1, y: 0.9, z: -0.4 },
      { id: 8, element: "C", name: "C_alpha2", x: 3.3, y: 0.2, z: 1.3 },
      { id: 9, element: "C", name: "C_carboxyl", x: 4.7, y: -0.3, z: 1.1 },
      { id: 10, element: "O", name: "O_carboxyl", x: 5.6, y: 0.4, z: 0.9 },
    ],
    baseBonds: [
      [0, 1], [1, 2], [3, 4],
      [5, 6], [5, 7], [5, 8], [8, 9], [9, 10]
    ],
    dynamicBonds: {
      breaking: [{ atomA: 1, atomB: 3, name: "Carbonyl C — O(tRNA) Ester Bond" }],
      forming: [{ atomA: 1, atomB: 5, name: "Peptide Amide Bond (C — N)" }]
    },
    trajectory: (t) => {
      const nX = 2.6 - 2.6 * t;
      const leavingOX = -0.4 - 1.8 * (t * t);
      const leavingOY = 1.4 + 1.2 * (t * t);
      return [
        [-2.8, 1.2, 0.0],
        [-1.4, 0.6, 0.0],
        [-1.3, -0.6, 0.0],
        [leavingOX, leavingOY, 0.1],
        [leavingOX + 0.3, leavingOY + 1.3, 0.2],
        [nX, 0.2, 0.0],
        [nX + 0.2, -0.7, 0.3],
        [nX + 0.5 + 1.5 * t, 0.9 + 1.0 * t, -0.4],
        [nX + 0.7, 0.2, 1.3],
        [nX + 2.1, -0.3, 1.1],
        [nX + 3.0, 0.4, 0.9]
      ];
    }
  },

  diels_alder: {
    id: "diels_alder",
    name: "Diels-Alder [4+2] Cycloaddition",
    category: "Pericyclic Chemical Synthesis",
    equation: "1,3-Butadiene + Ethylene  ⟶  [Aromatic Transition State]‡  ⟶  Cyclohexene",
    description: "The premier concerted pericyclic reaction. 1,3-Butadiene (diene, 4 π electrons) reacts with ethylene (dienophile, 2 π electrons) through a cyclic, 6-electron aromatic transition state to form a stable 6-membered cyclohexene ring with two new C—C single bonds.",
    energyProfile: {
      activationEnergy: 92,
      deltaG: -115,
      unit: "kJ/mol"
    },
    captions: [
      { tStart: 0.00, tEnd: 0.25, stage: "Reactants: Diene + Dienophile", text: "1,3-Butadiene (4 π electrons) and ethylene (2 π electrons) align in parallel planes." },
      { tStart: 0.25, tEnd: 0.45, stage: "Orbital Overlap (HOMO-LUMO)", text: "Frontier molecular orbitals overlap constructively between terminal carbons C1-C5 and C4-C6." },
      { tStart: 0.45, tEnd: 0.65, stage: "Aromatic Transition State [‡]", text: "Concerted 6-electron pericyclic aromatic transition state with simultaneous electron redistribution." },
      { tStart: 0.65, tEnd: 0.85, stage: "Sigma Bond Formation", text: "Two π-bonds convert into two new strong C—C σ-bonds as terminal carbons connect." },
      { tStart: 0.85, tEnd: 1.00, stage: "Product: Cyclohexene", text: "Stable 6-membered cyclohexene ring with one remaining double bond forms exothermically (-115 kJ/mol)." }
    ],
    atoms: [
      { id: 0, element: "C", name: "C1", x: -1.2, y: 1.5, z: 0.0 },
      { id: 1, element: "C", name: "C2", x: -0.6, y: 0.6, z: 0.0 },
      { id: 2, element: "C", name: "C3", x: 0.6, y: 0.6, z: 0.0 },
      { id: 3, element: "C", name: "C4", x: 1.2, y: 1.5, z: 0.0 },
      { id: 4, element: "C", name: "C5", x: -0.7, y: 2.8, z: 0.0 },
      { id: 5, element: "C", name: "C6", x: 0.7, y: 2.8, z: 0.0 },
      { id: 6, element: "H", name: "H1a", x: -2.1, y: 1.8, z: 0.0 },
      { id: 7, element: "H", name: "H4a", x: 2.1, y: 1.8, z: 0.0 },
      { id: 8, element: "H", name: "H5a", x: -1.4, y: 3.5, z: 0.0 },
      { id: 9, element: "H", name: "H6a", x: 1.4, y: 3.5, z: 0.0 },
    ],
    baseBonds: [
      [0, 1], [1, 2], [2, 3],
      [4, 5],
      [0, 6], [3, 7], [4, 8], [5, 9]
    ],
    dynamicBonds: {
      breaking: [],
      forming: [
        { atomA: 0, atomB: 4, name: "New C1 — C5 σ Bond" },
        { atomA: 3, atomB: 5, name: "New C4 — C6 σ Bond" }
      ]
    },
    trajectory: (t) => {
      const eY = 2.8 - 0.8 * t;
      const c1X = -1.2 + 0.4 * t;
      const c4X = 1.2 - 0.4 * t;
      return [
        [c1X, 1.5, 0.2 * Math.sin(t * Math.PI)],
        [-0.6, 0.6, -0.1 * Math.sin(t * Math.PI)],
        [0.6, 0.6, -0.1 * Math.sin(t * Math.PI)],
        [c4X, 1.5, 0.2 * Math.sin(t * Math.PI)],
        [-0.7, eY, 0.1 * Math.sin(t * Math.PI)],
        [0.7, eY, 0.1 * Math.sin(t * Math.PI)],
        [c1X - 0.9, 1.8, 0.0],
        [c4X + 0.9, 1.8, 0.0],
        [-1.4, eY + 0.7, 0.0],
        [1.4, eY + 0.7, 0.0]
      ];
    }
  }
};
