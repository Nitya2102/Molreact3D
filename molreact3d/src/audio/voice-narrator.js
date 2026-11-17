/**
 * Voice & Sound Synthesis Engine for MolReact3D
 * Provides:
 * 1. Web Speech API narration with custom scripts for all 7 reactions
 * 2. Web Audio API procedural sound cues (strain hum, bond snap chime)
 */

export class VoiceNarrator {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voiceEnabled = true;
    this.soundFxEnabled = true;
    this.currentUtterance = null;

    // Web Audio Context for spatial sound effects
    this.audioCtx = null;

    this.scripts = {
      atp_hydrolysis: "ATP Hydrolysis. The universal biochemical energy reaction. A nucleophilic water molecule attacks the terminal gamma-phosphate of ATP, passing through a pentacoordinate transition state. The high-energy phosphoanhydride bond cleaves, yielding ADP and inorganic phosphate, releasing thirty point five kilojoules per mole.",
      crispr_dna_cleavage: "CRISPR-Cas9 DNA Backbone Cleavage. Inside the Cas9 active site, a catalytic Magnesium two-plus cofactor activates a nucleophilic water molecule. This attacks the scissile phosphodiester bond on the target DNA strand, hydrolyzing the backbone and releasing three-prime hydroxyl and five-prime phosphate ends.",
      peptide_bond_formation: "Ribosomal Peptide Bond Formation. The core engine of protein synthesis. The alpha-amino group of an incoming aminoacyl-tRNA attacks the activated ester carbonyl of the peptidyl-tRNA, forming a planar peptide bond with tRNA release.",
      petase_catalysis: "PETase Enzymatic Cleavage. In the plastic-degrading enzyme PETase, the catalytic triad activates Serine-160 to attack the carbonyl ester of polyethylene terephthalate, breaking the polymer chain into soluble fragments.",
      retinal_isomerization: "Retinal Photochemical Isomerization. The molecular trigger of human vision. Absorption of light triggers ultrafast torsional rotation around the Carbon-11 Carbon-12 double bond, switching eleven-cis retinal into the elongated all-trans conformation.",
      sn2_substitution: "SN2 Nucleophilic Substitution. Hydroxide attacks bromomethane directly from the backside at one hundred and eighty degrees. The methyl hydrogens invert like an umbrella in the wind through a trigonal bipyramidal transition state, expelling bromide.",
      diels_alder: "Diels-Alder Cycloaddition. A concerted pericyclic reaction. Butadiene and ethylene synchronously redistribute six pi-electrons through an aromatic transition state ring, forming two new carbon-carbon sigma bonds and a cyclohexene ring."
    };
  }

  initAudio() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
  }

  speakReaction(reactionId) {
    if (!this.voiceEnabled || !this.synth) return;
    const text = this.scripts[reactionId];
    if (!text) return;

    this.stopVoice();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95; // slightly slower for clear scientific comprehension
    utterance.pitch = 1.0;

    // Select natural voice if available
    const voices = this.synth.getVoices();
    const naturalVoice = voices.find(v => v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Samantha") || v.name.includes("David")));
    if (naturalVoice) utterance.voice = naturalVoice;

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  stopVoice() {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  // Procedural Sound Effects for VR Immersion
  playTransitionChime() {
    if (!this.soundFxEnabled) return;
    try {
      this.initAudio();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = "sine";
      // Harmonic chime (A4 to E5)
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  playBondSnap() {
    if (!this.soundFxEnabled) return;
    try {
      this.initAudio();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.2);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {
      // Audio fallback
    }
  }
}
