

export interface Vector2 {
  x: number;
  y: number;
}

export interface JoystickState {
  active: boolean;
  origin: Vector2;
  current: Vector2;
  vector: Vector2;
}

// --- ANIMATION SYSTEM ---
export interface SpriteConfig {
    src: string;        // Base64 or URL
    frameWidth: number; // Width of a single frame
    frameHeight: number;// Height of a single frame
    frameCount: number; // Total frames (assumed horizontal strip)
    frameRate: number;  // Seconds per frame (e.g., 0.1)
    loop: boolean;      // Should animation loop
}

export interface Entity {
  id: number;
  active: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  
  // Animation State (Optional for backward compatibility)
  direction?: 'left' | 'right';
  animState?: 'idle' | 'run' | 'attack';
  animFrame?: number;
  animTimer?: number;
}

// --- VISUAL EFFECTS ---
export interface Particle {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    color: string;
    size: number;
}

export type XPOrbTier = 'blue' | 'purple' | 'pink' | 'gold';

export interface XPOrb {
    id: number;
    active: boolean;
    x: number;
    y: number;
    value: number;
    magnetized: boolean;
    tier: XPOrbTier;
}

// --- NPC SYSTEM ---
export type NpcType = 'merchant' | 'blacksmith';

export interface NPC extends Entity {
    name: string;
    type: NpcType;
    interactionRadius: number;
}

export type InteractableType = 'map_device' | 'portal_next' | 'portal_return';

export interface Interactable extends Entity {
  type: InteractableType;
  interactionRadius: number;
  label: string;
}

export type WorldState = 'HIDEOUT' | 'RUN';

export type EnemyType = 'basic' | 'fast' | 'tank' | 'boss';
// Expanded Enemy Modifiers
export type EnemyModifier = 
  'regenerator' | 'berserker' | 'ghostly' | 
  'extra_proj' | 
  'chaos_res' | 'cold_res' | 'fire_res' | 'lightning_res' | 
  'evasive' | 'armoured' | 'proximal' |
  'trail_fire' | 'trail_ice' | 'trail_lightning' | 'periodic_blast' | 'temporal';

// New Damage Types
export type DamageType = 'physical' | 'fire' | 'cold' | 'lightning' | 'chaos';

// New Status Types
export type EnemyStatus = 'ignited' | 'chilled' | 'shocked';

export interface Enemy extends Entity {
  hp: number;
  speed: number;
  maxHp?: number;
  type?: EnemyType;
  attackTimer?: number;
  modifiers: EnemyModifier[];
  isElite: boolean;
  resistances: Record<DamageType, number>;
  statuses: Partial<Record<EnemyStatus, number>>; // Key: Status, Value: Duration (seconds)
  // Ability Timers
  trailTimer?: number;
  blastTimer?: number;
}

export type BulletOwner = 'player' | 'enemy';

export interface Bullet extends Entity {
  vx: number;
  vy: number;
  lifeTime: number;
  owner?: BulletOwner;
  hitIds: number[];
  damageType: DamageType; 
  damage?: number; 
  pierce: number;
  ailmentChance?: number; // New: Snapshot chance to apply ailment
}

// --- GROUND EFFECTS ---
export type GroundEffectType = 'fire_ground' | 'ice_ground' | 'lightning_ground' | 'bubble' | 'blast_warning';

export interface GroundEffect {
    id: string;
    x: number;
    y: number;
    radius: number;
    type: GroundEffectType;
    duration: number; // Remaining time
    damageType?: DamageType;
    sourceId?: number; // For temporal bubble to follow enemy
}

export interface Loot extends Entity {
  itemData: ItemInstance;    
  rarity: ItemRarity;        
  autoCollectRadius: number; 
  lifeTime: number;
}

export interface FloatingText {
  id: number;
  active: boolean;
  x: number;
  y: number;
  text: string;
  color: string;
  lifeTime: number;
  velocityY: number;
  scale: number;
}

export type UpgradeType = 'base' | 'increased' | 'more';
export type StatKey = 'moveSpeed' | 'attackSpeed' | 'bulletDamage' | 'projectileCount' | 'projectileSpread' | 'maxHp' | 'hpRegen' | 'critChance' | 'critMultiplier' | 'defense' | 'areaOfEffect' | 'projectileSpeed' | 'ailmentChance';

// New StatKeys for Maps
export type MapStatKey = 'monsterPackSize' | 'monsterHealth' | 'monsterDamage' | 'xpGain' | 'itemRarity';

export interface UpgradeDefinition {
  id: string;
  name: string;
  description: string;
  stat?: StatKey;
  value?: number;
  type?: UpgradeType;
  color: string;
  tags?: SkillTag[]; 
  gemItem?: ItemInstance; // New: For Gem Cards
}

// --- Equipment & Affix System ---

export type ItemSlot = 'helmet' | 'amulet' | 'weapon' | 'offhand' | 'body' | 'gloves' | 'ring1' | 'ring2' | 'boots';
export type ItemType = 'equipment' | 'gem' | 'map'; 

export type ItemRarity = 'normal' | 'magic' | 'rare' | 'unique';
export type AffixType = 'prefix' | 'suffix';

export interface AffixDefinition {
  id: string;
  name: string;
  type: AffixType;
  stat: StatKey | MapStatKey; 
  validSlots: (ItemSlot | 'map')[]; 
  minVal: number;
  maxVal: number;
  valueType: UpgradeType;
  tags?: SkillTag[]; 
}

export interface ItemAffixInstance {
  definitionId: string;
  name: string;
  stat: StatKey | MapStatKey;
  value: number;
  valueType: UpgradeType;
  tags?: SkillTag[]; 
}

export interface ItemInstance {
  id: string;
  name: string;
  type: ItemType; 
  slot: ItemSlot | 'map'; 
  rarity: ItemRarity;
  level: number;
  affixes: ItemAffixInstance[];
  gemDefinitionId?: string; 
}

// --- SKILL GEM SYSTEM ---

export const MAX_SKILL_SLOTS = 4;

export type SkillTag = 'projectile' | 'melee' | 'area' | 'fire' | 'cold' | 'lightning' | 'physical' | 'duration' | 'movement';
export type GemType = 'active' | 'support';

export interface SkillStats {
    damage: number;
    attackRate: number; 
    cooldown: number;   
    range: number;
    areaOfEffect: number; 
    projectileCount: number;
    projectileSpeed: number;
    projectileSpread: number; 
    duration: number;
    ailmentChance: number; // New: Chance to apply status (0-1)
}

export interface SkillDefinition {
    id: string;
    name: string;
    type: GemType;
    tags: SkillTag[];
    baseStats: Partial<SkillStats>;
    description: string;
    supportedTags?: SkillTag[];
    statMultipliers?: Partial<SkillStats>;
}

export interface ActiveSkillInstance {
    instanceId: string;
    // Sockets
    activeGem: ItemInstance | null;
    supportGems: (ItemInstance | null)[]; 
    
    // Runtime State
    cooldownTimer: number; 
}

export interface ResolvedSkill {
    definition: SkillDefinition;
    stats: SkillStats;
    tags: SkillTag[];
}

export interface MapStats {
    tier: number;
    monsterHealthMult: number;
    monsterDamageMult: number;
    packSizeMult: number;
    xpMult: number;
    rarityMult: number;
}

export interface GameState {
  worldState: WorldState;
  gold: number; // New Economy
  playerWorldPos: Vector2;
  playerInvulnerabilityTimer: number; 
  velocity: Vector2;
  lastFrameTime: number;
  isGameOver: boolean;
  isPaused: boolean;
  score: number;
  level: number;
  xp: number;
  nextLevelXp: number;
  backpack: ItemInstance[];
  equipment: Record<ItemSlot, ItemInstance | null>;
  shakeTimer: number;
  
  // Skills
  activeSkills: ActiveSkillInstance[];
  gemInventory: ItemInstance[]; 
  
  // Map System
  interactables: Interactable[];
  npcs: NPC[]; // New: NPC System
  currentMapStats: MapStats;

  // Roguelike Build State
  pendingSupportGem: ItemInstance | null;
  isSelectingSupport: boolean;

  // Expedition Loop
  currentFloor: number; // 0 = Hideout, 1-5 = Run
  targetKills: number;
  currentKills: number;
  currentMaxEnemies?: number; // Dynamic limit
  expeditionActive: boolean;

  // Ground Effects & Particles
  groundEffects: GroundEffect[];
  particles: Particle[];
  xpOrbs: XPOrb[];
}