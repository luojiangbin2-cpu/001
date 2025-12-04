

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
   * @param contextTags Tags describing the context (e.g. ['projectile', 'fire'] for a Fireball skill)
   * @returns The final calculated number
   */
  getStatValue(stat: StatKey, contextTags: SkillTag[] = []): number {
    const base = this._bases.get(stat) || 0;
    
    let added = 0;
    let increased = 0;
    let more = 1;

    for (const mod of this._modifiers) {
      if (mod.stat !== stat) continue;
      
      // Tag Filtering Logic:
      // If the modifier has specific tags (e.g. ['fire']), it ONLY applies if 
      // the contextTags (e.g. ['projectile', 'fire']) contains ALL of them.
      // A modifier with NO tags is Global and applies to everything.
      if (mod.tags && mod.tags.length > 0) {
        const matches = mod.tags.every(t => contextTags.includes(t));
        if (!matches) continue;
      }

      switch (mod.type) {
        case 'base':
          added += mod.value;
          break;
        case 'increased':
          increased += mod.value;
          break;
        case 'more':
          more *= (1 + mod.value);
          break;
      }
    }

    // Protection against negative multipliers making stats weird
    const totalIncreased = Math.max(0, 1 + increased);
    
    return (base + added) * totalIncreased * more;
  }
}