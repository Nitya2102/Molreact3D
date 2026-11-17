/**
 * Interactive Potential Energy Surface (PES) Chart
 * Visualizes the reaction energy barrier, transition state [‡], and thermodynamic Delta G,
 * with a real-time synchronized marker tracking the 3D molecular simulation.
 */
export class EnergyChart {
  constructor(canvas, onSeek) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.onSeek = onSeek;
    this.reaction = null;
    this.currentProgress = 0.0;
    this.currentEnergy = 0.0;

    this.setupInteractions();
  }

  setReaction(reaction) {
    this.reaction = reaction;
    this.render();
  }

  setProgress(t, energy) {
    this.currentProgress = t;
    this.currentEnergy = energy;
    this.render();
  }

  setupInteractions() {
    let isDragging = false;

    const updateSeek = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const padLeft = 40;
      const padRight = 20;
      const width = rect.width - padLeft - padRight;
      const t = Math.min(Math.max((x - padLeft) / width, 0.0), 1.0);
      if (this.onSeek) this.onSeek(t);
    };

    this.canvas.addEventListener("pointerdown", (e) => {
      isDragging = true;
      updateSeek(e);
    });

    window.addEventListener("pointermove", (e) => {
      if (isDragging) updateSeek(e);
    });

    window.addEventListener("pointerup", () => {
      isDragging = false;
    });
  }

  render() {
    const { canvas, ctx } = this;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    if (!this.reaction) {
      ctx.fillStyle = "#666";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Select a reaction to view energy profile", w / 2, h / 2);
      return;
    }

    const padLeft = 45;
    const padRight = 25;
    const padTop = 30;
    const padBottom = 30;

    const chartW = w - padLeft - padRight;
    const chartH = h - padTop - padBottom;

    const { activationEnergy, deltaG } = this.reaction.energyProfile;
    const maxE = Math.max(activationEnergy * 1.25, 40);
    const minE = Math.min(deltaG * 1.3, -20);
    const rangeE = maxE - minE;

    const getX = (t) => padLeft + t * chartW;
    const getY = (e) => padTop + chartH * (1 - (e - minE) / rangeE);

    // 1. Grid & Axes
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;

    // Zero energy line
    const yZero = getY(0);
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.moveTo(padLeft, yZero);
    ctx.lineTo(w - padRight, yZero);
    ctx.stroke();
    ctx.setLineDash([]);

    // Baseline labels
    ctx.fillStyle = "#888";
    ctx.font = "10px monospace";
    ctx.textAlign = "right";
    ctx.fillText("0 kJ/mol", padLeft - 6, yZero + 3);
    ctx.fillText(`${maxE.toFixed(0)}`, padLeft - 6, padTop + 10);
    ctx.fillText(`${minE.toFixed(0)}`, padLeft - 6, h - padBottom);

    // 2. Draw Potential Energy Curve
    const samples = 100;
    ctx.beginPath();
    for (let i = 0; i <= samples; i++) {
      const t = i / samples;
      const peak = Math.exp(-Math.pow((t - 0.5) / 0.18, 2));
      const step = t * t * (3 - 2 * t);
      const e = activationEnergy * peak + deltaG * step;
      const px = getX(t);
      const py = getY(e);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }

    // Glow under curve
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 3. Labels for Key States
    ctx.font = "bold 10px sans-serif";
    ctx.fillStyle = "#94a3b8";
    ctx.textAlign = "left";
    ctx.fillText("Reactants", padLeft, getY(0) - 8);

    ctx.textAlign = "right";
    ctx.fillText("Products", w - padRight, getY(deltaG) - 8);

    ctx.textAlign = "center";
    ctx.fillStyle = "#f59e0b";
    ctx.fillText("Transition State [‡]", getX(0.5), padTop + 12);

    // 4. Current Progress Marker (Pulsing Bead)
    const currentX = getX(this.currentProgress);
    const currentY = getY(this.currentEnergy);

    // Vertical tracking needle
    ctx.beginPath();
    ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
    ctx.setLineDash([2, 2]);
    ctx.moveTo(currentX, padTop);
    ctx.lineTo(currentX, h - padBottom);
    ctx.stroke();
    ctx.setLineDash([]);

    // Glowing outer ring
    ctx.beginPath();
    ctx.arc(currentX, currentY, 8, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(56, 189, 248, 0.25)";
    ctx.fill();

    // Solid core
    ctx.beginPath();
    ctx.arc(currentX, currentY, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    // Current energy value tooltip
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 11px monospace";
    ctx.textAlign = "center";
    ctx.fillText(
      `${this.currentEnergy >= 0 ? "+" : ""}${this.currentEnergy.toFixed(1)} kJ/mol`,
      currentX,
      Math.max(currentY - 14, 14)
    );
  }
}
