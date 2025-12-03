

import { ItemSlot, ItemRarity, ItemInstance, AffixDefinition, AffixType, ItemAffixInstance, UpgradeDefinition, SkillDefinition } from './types';
import { SKILL_DATABASE } from './SkillSystem';

// Simple ID generator
const uuid = () => Math.random().toString(36).substring(2, 9);

// --- STAT UPGRADES POOL ---
export const STAT_UPGRADES: UpgradeDefinition[] = [
  { id: 'multishot', name: 'Multi-Shot', description: 'Projectiles +1', stat: 'projectileCount', value: 1, type: 'base', color: 'bg-yellow-500' },
  { id: 'haste', name: 'Haste', description: 'Attack Speed +20%', stat: 'attackSpeed', value: 0.2, type: 'increased', color: 'bg-green-500' },
  { id: 'giant', name: 'Giant', description: 'Damage +50%', stat: 'bulletDamage', value: 0.5, type: 'increased', color: 'bg-red-500' },
  { id: 'swift', name: 'Swift', description: 'Move Speed +20%', stat: 'moveSpeed', value: 0.2, type: 'increased', color: 'bg-blue-500' },
  { id: 'vitality', name: 'Vitality', description: 'Max HP +50', stat: 'maxHp', value: 50, type: 'base', color: 'bg-rose-500' },
  { id: 'precision', name: 'Precision', description: 'Crit Chance +10%', stat: 'critChance', value: 0.1, type: 'base', color: 'bg-purple-500' },
  { id: 'iron_skin', name: 'Iron Skin', description: 'Defense +30', stat: 'defense', value: 30, type: 'base', color: 'bg-stone-500' },
  { id: 'regen', name: 'Troll Blood', description: 'HP Regen +2/s', stat: 'hpRegen', value: 2, type: 'base', color: 'bg-emerald-500' },
];

// --- 1. AFFIX DATABASE ---
export const AFFIX_DATABASE: AffixDefinition[] = [
  // Prefix: Heavy (Damage)
  {
    id: 'prefix_heavy',
    name: 'Heavy',
    type: 'prefix',
    stat: 'bulletDamage',
    validSlots: ['weapon', 'offhand', 'ring1', 'ring2', 'amulet', 'gloves'],
    minVal: 10,
    maxVal: 30,
    valueType: 'increased'
  },
  // Prefix: Quick (Move Speed)
  {
    id: 'prefix_quick',
    name: 'Quick',
    type: 'prefix',
    stat: 'moveSpeed',
    validSlots: ['boots'],
    minVal: 0.1,
    maxVal: 0.25,
    valueType: 'increased'
  },
  // Suffix: of Alacrity (Attack Speed)
  {
    id: 'suffix_alacrity',
    name: 'of Alacrity',
    type: 'suffix',
    stat: 'attackSpeed',
    validSlots: ['weapon', 'gloves', 'ring1', 'ring2', 'amulet'],
    minVal: 0.1,
    maxVal: 0.3,
    valueType: 'increased'
  },
  // Prefix: Vital (Max HP)
  {
    id: 'prefix_vital',
    name: 'Vital',
    type: 'prefix',
    stat: 'maxHp',
    validSlots: ['helmet', 'body', 'ring1', 'ring2', 'amulet', 'offhand'],
    minVal: 20,
    maxVal: 100,
    valueType: 'base'
  },
  // Prefix: Sharp (Crit Chance)
  {
    id: 'prefix_sharp',
    name: 'Sharp',
    type: 'prefix',
    stat: 'critChance',
    validSlots: ['weapon', 'helmet', 'amulet'],
    minVal: 0.05,
    maxVal: 0.15,
    valueType: 'base'
  },
  // Suffix: of Iron (Defense)
  {
    id: 'suffix_iron',
    name: 'of Iron',
    type: 'suffix',
    stat: 'defense',
    validSlots: ['helmet', 'body', 'boots', 'gloves', 'offhand'],
    minVal: 10,
    maxVal: 50,
    valueType: 'base'
  },
  // NEW TAG-SPECIFIC AFFIXES
  {
    id: 'prefix_pyromancer',
    name: "Pyromancer's",
    type: 'prefix',
    stat: 'bulletDamage',
    validSlots: ['ring1', 'ring2', 'amulet', 'weapon'],
    minVal: 0.30,
    maxVal: 0.30,
    valueType: 'increased',
    tags: ['fire']
  },
  {
    id: 'prefix_sniper',
    name: "Sniper's",
    type: 'prefix',
    stat: 'bulletDamage',
    validSlots: ['weapon', 'gloves', 'amulet'],
    minVal: 0.30,
    maxVal: 0.30,
    valueType: 'increased',
    tags: ['projectile']
  },
  {
    id: 'suffix_giant',
    name: "of the Giant",
    type: 'suffix',
    stat: 'areaOfEffect',
    validSlots: ['weapon', 'amulet', 'gloves'],
    minVal: 0.20,
    maxVal: 0.20,
    valueType: 'increased',
    tags: ['area']
  },
  // --- MAP AFFIXES ---
  {
    id: 'map_prefix_deadly',
    name: 'Deadly',
    type: 'prefix',
    stat: 'monsterDamage',
    validSlots: ['map'],
    minVal: 0.2,
    maxVal: 0.5,
    valueType: 'increased'
  },
  {
    id: 'map_prefix_armored',
    name: 'Armored',
    type: 'prefix',
    stat: 'monsterHealth',
    validSlots: ['map'],
    minVal: 0.3,
    maxVal: 0.8,
    valueType: 'increased'
  },
  {
    id: 'map_suffix_hordes',
    name: 'of Hordes',
    type: 'suffix',
    stat: 'monsterPackSize',
    validSlots: ['map'],
    minVal: 0.2,
    maxVal: 0.5,
    valueType: 'increased'
  },
  {
    id: 'map_suffix_wealth',
    name: 'of Wealth',
    type: 'suffix',
    stat: 'itemRarity',
    validSlots: ['map'],
    minVal: 0.5,
    maxVal: 1.0,
    valueType: 'increased'
  },
  {
    id: 'map_suffix_learning',
    name: 'of Learning',
    type: 'suffix',
    stat: 'xpGain',
    validSlots: ['map'],
    minVal: 0.3,
    maxVal: 0.6,
    valueType: 'increased'
  }
];

const BASE_NAMES: Record<string, string> = {
  weapon: 'Blade',
  offhand: 'Shield',
  helmet: 'Helm',
  body: 'Armor',
  gloves: 'Gauntlets',
  boots: 'Greaves',
  amulet: 'Amulet',
  ring1: 'Ring',
  ring2: 'Ring',
  map: 'Map'
};

const MAP_TIER_NAMES = ["Desert", "Caves", "Ruins", "Temple", "Citadel", "Void"];
const RARE_NAMES_PREFIX = ["Viper", "Dragon", "Eagle", "Phoenix", "Bear", "Wolf", "Raven", "Lion"];
const RARE_NAMES_SUFFIX = ["Bane", "Fist", "Claw", "Heart", "Soul", "Wish", "Guard", "Song"];

// --- IMPLICIT SYSTEM ---
const getImplicitAffix = (slot: ItemSlot, level: number): ItemAffixInstance | null => {
    let stat: any = null;
    let value = 0;
    let name = 'Base Property';

    switch (slot) {
        case 'weapon':
            stat = 'bulletDamage';
            value = 5 + level * 2;
            name = 'Physical Damage';
            break;
        case 'offhand':
            stat = 'defense';
            value = 2 + level * 1;
            name = 'Block Chance'; // Flavor name
            break;
        case 'body':
            stat = 'maxHp';
            value = 20 + level * 5;
            name = 'Base Health';
            break;
        case 'helmet':
            stat = 'defense';
            value = 5 + level * 1;
            name = 'Armor';
            break;
        case 'boots':
            stat = 'moveSpeed';
            value = 0.1; 
            name = 'Movement Speed';
            break;
        case 'gloves':
            stat = 'attackSpeed';
            value = 0.05;
            name = 'Attack Speed';
            break;
        case 'amulet':
        case 'ring1':
        case 'ring2':
            stat = 'maxHp';
            value = 10 + level * 2;
            name = 'Health';
            break;
    }

    if (!stat) return null;

    return {
        definitionId: `implicit_${slot}`,
        name: name,
        stat: stat,
        value: value,
        valueType: 'base'
    };
};

// --- 2. GENERATE ITEM FUNCTION ---
export const generateItem = (targetSlot: ItemSlot | 'random' | 'map', level: number, rarity: ItemRarity): ItemInstance => {
  let slot: ItemSlot | 'map';
  let type: 'equipment' | 'map' = 'equipment';

  if (targetSlot === 'map') {
      slot = 'map';
      type = 'map';
  } else if (targetSlot === 'random') {
      const slots: ItemSlot[] = ['helmet', 'amulet', 'weapon', 'offhand', 'body', 'gloves', 'ring1', 'ring2', 'boots'];
      slot = slots[Math.floor(Math.random() * slots.length)];
      if (Math.random() < 0.1) {
          slot = 'map';
          type = 'map';
      }
  } else {
      slot = targetSlot;
  }

  const item: ItemInstance = {
    id: uuid(),
    name: slot === 'map' ? `${MAP_TIER_NAMES[Math.min(level - 1, MAP_TIER_NAMES.length-1)] || 'Zone'} Map (T${level})` : BASE_NAMES[slot],
    type: type,
    slot,
    rarity,
    level,
    affixes: []
  };

  // ADD IMPLICIT FOR EQUIPMENT
  if (type === 'equipment') {
      const implicit = getImplicitAffix(slot as ItemSlot, level);
      if (implicit) {
          item.affixes.push(implicit);
      }
  }

  if (rarity === 'normal') return item;

  let prefixCount = 0;
  let suffixCount = 0;

  if (rarity === 'magic') {
    const roll = Math.random();
    if (roll < 0.4) prefixCount = 1;
    else if (roll < 0.8) suffixCount = 1;
    else { prefixCount = 1; suffixCount = 1; }
  } else if (rarity === 'rare') {
    prefixCount = 1 + Math.floor(Math.random() * 2);
    suffixCount = 1 + Math.floor(Math.random() * 2);
  }

  const validPrefixes = AFFIX_DATABASE.filter(a => a.type === 'prefix' && a.validSlots.includes(slot));
  const validSuffixes = AFFIX_DATABASE.filter(a => a.type === 'suffix' && a.validSlots.includes(slot));

  const pickRandom = (pool: AffixDefinition[], count: number) => {
    if (pool.length === 0) return [];
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const selectedPrefixes = pickRandom(validPrefixes, prefixCount);
  const selectedSuffixes = pickRandom(validSuffixes, suffixCount);

  [...selectedPrefixes, ...selectedSuffixes].forEach(def => {
    const range = def.maxVal - def.minVal;
    const roll = Math.random();
    let rawValue = def.minVal + (range * roll);
    if (type === 'equipment') rawValue = rawValue * (1 + level * 0.02);

    let finalValue = rawValue;
    if (def.valueType === 'base') finalValue = Math.round(rawValue);
    else finalValue = Math.round(rawValue * 100) / 100;

    const affixInstance: ItemAffixInstance = {
      definitionId: def.id,
      name: def.name,
      stat: def.stat,
      value: finalValue,
      valueType: def.valueType,
      tags: def.tags 
    };
    item.affixes.push(affixInstance);
  });

  if (rarity === 'magic') {
    const p = item.affixes.find(a => a.definitionId.includes('prefix'));
    const s = item.affixes.find(a => a.definitionId.includes('suffix'));
    if (type === 'map') {
        let n = `${MAP_TIER_NAMES[Math.min(level - 1, MAP_TIER_NAMES.length-1)] || 'Zone'}`;
        if (p) n = `${p.name} ${n}`;
        if (s) n = `${n} ${s.name}`;
        item.name = `${n} (T${level})`;
    } else {
        let name = BASE_NAMES[slot];
        if (p) name = `${p.name} ${name}`;
        if (s) name = `${name} ${s.name}`;
        item.name = name;
    }
  } else if (rarity === 'rare') {
    const p = RARE_NAMES_PREFIX[Math.floor(Math.random() * RARE_NAMES_PREFIX.length)];
    const s = RARE_NAMES_SUFFIX[Math.floor(Math.random() * RARE_NAMES_SUFFIX.length)];
    if (type === 'map') item.name = `${p} ${s} ${MAP_TIER_NAMES[Math.min(level - 1, MAP_TIER_NAMES.length-1)] || 'Zone'} (T${level})`;
    else item.name = `${p} ${s} ${BASE_NAMES[slot]}`;
  }

  return item;
};

// --- ROGUELIKE REWARDS ---

export const createGemItem = (definitionId: string): ItemInstance => {
    const def = SKILL_DATABASE[definitionId];
    return {
        id: uuid(),
        name: def ? def.name : definitionId,
        type: 'gem',
        slot: 'weapon', 
        rarity: 'normal',
        level: 1,
        affixes: [],
        gemDefinitionId: definitionId
    };
};

export const createSpecificItem = (slot: ItemSlot, affixId: string): ItemInstance => {
    const affixDef = AFFIX_DATABASE.find(a => a.id === affixId);
    if (!affixDef) throw new Error("Affix not found");

    const item: ItemInstance = {
        id: uuid(),
        name: `${affixDef.name} ${BASE_NAMES[slot]}`,
        type: 'equipment',
        slot,
        rarity: 'magic',
        level: 1,
        affixes: []
    };

    // Add implicit
    const implicit = getImplicitAffix(slot, 1);
    if (implicit) item.affixes.push(implicit);

    item.affixes.push({
        definitionId: affixDef.id,
        name: affixDef.name,
        stat: affixDef.stat,
        value: affixDef.minVal, // Use min for static creation
        valueType: affixDef.valueType,
        tags: affixDef.tags
    });
    
    return item;
}

export const generateRewards = (level: number, excludedActiveGemIds: string[] = []): UpgradeDefinition[] => {
    const rewards: UpgradeDefinition[] = [];
    const allSkillKeys = Object.keys(SKILL_DATABASE);
    
    // Separate pools
    // Filter out active skills that are in the excluded list (already owned)
    const activeSkills = allSkillKeys.filter(k => SKILL_DATABASE[k].type === 'active' && !excludedActiveGemIds.includes(k));
    const supportSkills = allSkillKeys.filter(k => SKILL_DATABASE[k].type === 'support');

    for (let i = 0; i < 3; i++) {
        const roll = Math.random();
        
        // 40% Stat, 30% Active, 30% Support
        // If no active skills available (collected all), fallback to Stat or Support
        let typeRoll = roll;
        if (activeSkills.length === 0 && typeRoll >= 0.4 && typeRoll < 0.7) {
            typeRoll = 0.8; // Force into support or (if unlucky logic) just skip.
        }

        if (typeRoll < 0.4) {
            const stat = STAT_UPGRADES[Math.floor(Math.random() * STAT_UPGRADES.length)];
            rewards.push({ ...stat, id: uuid() }); // Clone to avoid ref issues
        } else if (typeRoll < 0.7 && activeSkills.length > 0) {
            const gemId = activeSkills[Math.floor(Math.random() * activeSkills.length)];
            const def = SKILL_DATABASE[gemId];
            const item = createGemItem(gemId);
            rewards.push({
                id: item.id,
                name: def.name,
                description: def.description,
                color: 'bg-cyan-600',
                gemItem: item
            });
        } else {
            const gemId = supportSkills[Math.floor(Math.random() * supportSkills.length)];
            const def = SKILL_DATABASE[gemId];
            const item = createGemItem(gemId);
            rewards.push({
                id: item.id,
                name: def.name,
                description: def.description,
                color: 'bg-zinc-600',
                gemItem: item
            });
        }
    }
    return rewards;
};