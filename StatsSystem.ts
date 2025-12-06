import { StatKey, UpgradeType, SkillTag } from './types';

interface Modifier {
  stat: StatKey;
  type: UpgradeType;
  value: number;
  tags?: SkillTag[];
}

export class StatsSystem {
  private _bases: Map<StatKey, number> = new Map();
  private _modifiers: Modifier[] = [];

  constructor() {}

  /**
   * Clears all modifiers and base values.
   */
  reset() {
    this._bases.clear();
    this._modifiers = [];
    // Initialize default ailment chance as requested (15%)
    this.setBase('ailmentChance', 0.15);
    this.setBase('xpGain', 1.0);
  }

  /**
   * Sets the base value for a stat (e.g. Player Base Health = 100).
   * This is the value before any modifiers.
   */
  setBase(stat: StatKey, value: number) {
    this._bases.set(stat, value);
  }

  /**
   * Adds a modifier to the calculation pipeline.
   * @param stat The stat to modify
   * @param type 'base' (Added Flat), 'increased' (% Additive), or 'more' (% Multiplicative)
   * @param value The value (e.g. 10 for Flat, 0.1 for 10% Increased)
   * @param tags Optional tags. If provided, modifier only applies if context matches.
   */
  addModifier(stat: StatKey, type: UpgradeType, value: number, tags?: SkillTag[]) {
    this._modifiers.push({ stat, type, value, tags });
  }

  /**
   * Calculates the final value of a stat given a context of tags.
   * Formula: (Base + Sum(Flat)) * (1 + Sum(Increased)) * Product(1 + More)
   * 
   * @param stat The stat to calculate
   * @param tags Context tags (e.g. from the active skill)
   */
  getStatValue(stat: StatKey, tags: SkillTag[] = []): number {
    const base = this._bases.get(stat) || 0;
    
    let flatSum = 0;
    let increasedSum = 0;
    let moreProduct = 1.0;

    for (const mod of this._modifiers) {
      if (mod.stat !== stat) continue;

      // Check tags compatibility
      if (mod.tags && mod.tags.length > 0) {
        if (!tags || tags.length === 0) continue; // Specific modifier, no context -> skip
        
        // Check if any of the modifier's tags are present in the context
        const hasMatch = mod.tags.some(t => tags.includes(t));
        if (!hasMatch) continue;
      }

      if (mod.type === 'base') flatSum += mod.value;
      if (mod.type === 'increased') increasedSum += mod.value;
      if (mod.type === 'more') moreProduct *= (1 + mod.value);
    }

    return (base + flatSum) * (1 + increasedSum) * moreProduct;
  }
}