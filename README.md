# MolReact3D

Interactive 3D biomolecular visualizer and reaction simulation engine built with Three.js and WebGL.

MolReact3D animates chemical reaction pathways, tracks bond transformations, and synchronizes 3D molecular trajectories with 2D thermodynamic energy profiles.

## Features

- Real-time 3D simulation of reaction pathways and intermediate states.
- Bidirectional synchronization between 3D scene and 2D potential energy diagrams.
- Multiple representations: Ball-and-Stick, Space-Filling (CPK), and Stick.
- In-browser parsing for PDB, CIF, and SDF file formats.
- Direct structure fetching via RCSB PDB and PubChem APIs.
- Interactive distance caliper tool for interatomic measurement (in Angstroms).

## Prerequisites

- Node.js (v18 or higher recommended)
- npm

## Setup & Run Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```
   Open the displayed local URL (typically `http://localhost:5173`) in your browser.

3. Build for production (optional):
   ```bash
   npm run build
   npm run preview
   ```

## Tech Stack

- Three.js / WebGL
- Vite
- Vanilla JavaScript (ES6+), HTML5, CSS3
