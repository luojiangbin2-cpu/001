
export interface Vector2 {
    x: number;
    y: number;
}

export type ItemSlot = 'helmet' | 'weapon' | 'offhand' | 'body' | 'gloves' | 'boots' | 'amulet' | 'ring1' | 'ring2';
export type ItemRarity = 'normal' | 'magic' | 'rare' | 'unique';
export type UpgradeType = 'base' | 'increased' | 'more';
export type SkillTag = 'projectile' | 'melee' | 'area' | 'fire' | 'cold' | 'lightning' | 'physical' | 'duration' | 'movement' | 'defense';

export type StatKey = 
    | 'bulletDamage' 
    | 'attackSpeed' 
    | 'moveSpeed' 
    | 'maxHp' 
    | 'hpRegen' 
    | 'defense' 
    | 'critChance' 
    | 'critMultiplier' 
    | 'projectileCount' 
    | 'projectileSpread' 
    | 'ailmentChance' 
    | 'areaOfEffect' 
    | 'knockback' 
    | 'monsterHealth' 
    | 'monsterDamage' 
    | 'monsterPackSize' 
    | 'xpGain' 
    | 'itemRarity' 
    | 'projectileSpeed' 
    | 'range' 
    | 'duration' 
    | 'cooldown'
    | 'attackRate'
    | 'pierceCount';

export interface ItemAffixInstance {
    definitionId: string;
    name: string;
    stat: StatKey | string;
    value: number;
    valueType: UpgradeType;
    tags?: SkillTag[];
}

export interface ItemInstance {
    id: string;
    name: string;
    type: 'equipment' | 'map' | 'gem';
    slot: ItemSlot | 'map' | 'gem' | string; 
    rarity: ItemRarity;
    level: number;
    affixes: ItemAffixInstance[];
    gemDefinitionId?: string;
    stackSize?: number;
}

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
    ailmentChance: number;
    knockback: number;
    pierceCount: number;
}

export interface SkillDefinition {
    id: string;
    name: string;
    type: 'active' | 'support';
    tags: SkillTag[];
    supportedTags?: SkillTag[];
    description: string;
    baseStats: Partial<SkillStats>;
    statMultipliers?: Partial<SkillStats>;
}

export interface ResolvedSkill {
    definition: SkillDefinition;
    stats: SkillStats;
    tags: SkillTag[];
}

export interface ActiveSkillInstance {
    instanceId: string;
    activeGem: ItemInstance | null;
    supportGems: (ItemInstance | null)[];
    cooldownTimer: number;
}

export interface UpgradeDefinition {
    id: string;
    name: string;
    description: string;
    color: string;
    stat?: StatKey;
    value?: number;
    type?: UpgradeType;
    tags?: SkillTag[];
    gemItem?: ItemInstance;
}

export interface AffixDefinition {
    id: string;
    name: string;
    type: 'prefix' | 'suffix';
    stat: StatKey | string;
    validSlots: (ItemSlot | 'map')[];
    minVal: number;
    maxVal: number;
    valueType: UpgradeType;
    tags?: SkillTag[];
}

export type AffixType = 'prefix' | 'suffix';

export const MAX_SKILL_SLOTS = 4;

export interface Entity {
    id: number | string;
    active: boolean;
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
}

export type EnemyType = 'basic' | 'fast' | 'tank' | 'boss';
export type EnemyModifier = 'regenerator' | 'berserker' | 'ghostly' | 'extra_proj' | 'chaos_res' | 'cold_res' | 'fire_res' | 'lightning_res' | 'evasive' | 'armoured' | 'proximal' | 'trail_fire' | 'trail_ice' | 'trail_lightning' | 'periodic_blast' | 'temporal';

export interface Enemy extends Entity {
    type: EnemyType;
    hp: number;
    maxHp?: number;
    speed: number;
    attackTimer?: number;
    modifiers: EnemyModifier[];
    isElite: boolean;
    resistances: { physical: number; fire: number; cold: number; lightning: number; chaos: number };
    statuses: Record<string, number>;
    knockbackVelocity?: Vector2;
    trailTimer?: number;
    blastTimer?: number;
}

export type BulletOwner = 'player' | 'enemy';
export type DamageType = 'physical' | 'fire' | 'cold' | 'lightning' | 'chaos';

export interface Bullet extends Entity {
    vx: number;
    vy: number;
    lifeTime: number;
    owner: BulletOwner;
    hitIds: (number|string)[];
    damageType: DamageType;
    pierce: number;
    ailmentChance: number;
    damage?: number;
}

export interface Loot extends Entity {
    lifeTime: number;
    itemData: ItemInstance;
    rarity: ItemRarity;
    autoCollectRadius: number;
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

export type InteractableType = 'map_device' | 'portal_next' | 'portal_return';

export interface Interactable extends Entity {
    type: InteractableType;
    interactionRadius: number;
    label: string;
}

export interface NPC extends Entity {
    type: 'merchant';
    name: string;
    interactionRadius: number;
}

export type GroundEffectType = 'fire_ground' | 'ice_ground' | 'lightning_ground' | 'bubble' | 'blast_warning';

export interface GroundEffect {
    id: string;
    x: number;
    y: number;
    radius: number;
    type: GroundEffectType;
    duration: number;
    sourceId?: number | string;
    damageType?: DamageType;
}

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

export interface MapStats {
    tier: number;
    monsterHealthMult: number;
    monsterDamageMult: number;
    packSizeMult: number;
    xpMult: number;
    rarityMult: number;
}

export interface EquipmentMap {
    helmet: ItemInstance | null;
    amulet: ItemInstance | null;
    weapon: ItemInstance | null;
    offhand: ItemInstance | null;
    body: ItemInstance | null;
    gloves: ItemInstance | null;
    ring1: ItemInstance | null;
    ring2: ItemInstance | null;
    boots: ItemInstance | null;
}

export interface GameState {
    worldState: 'HIDEOUT' | 'RUN';
    gold: number;
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
    equipment: EquipmentMap;
    shakeTimer: number;
    activeSkills: ActiveSkillInstance[];
    gemInventory: ItemInstance[];
    interactables: Interactable[];
    npcs: NPC[];
    currentMapStats: MapStats;
    pendingSupportGem: ItemInstance | null;
    isSelectingSupport: boolean;
    currentFloor: number;
    targetKills: number;
    currentKills: number;
    currentMaxEnemies: number;
    expeditionActive: boolean;
    groundEffects: GroundEffect[];
    particles: Particle[];
    xpOrbs: XPOrb[];
    isEndlessMode?: boolean;
}

export interface JoystickState {
    active: boolean;
    origin: Vector2;
    current: Vector2;
    vector: Vector2;
}

export interface SpriteConfig {
    src: string;
    width?: number;
    height?: number;
}

export interface VisualEffect {
    id: number;
    active: boolean;
    type: 'cyclone' | 'hit' | 'portal' | 'shockwave' | 'flame_ring_visual' | 'falling_ice';
    x: number;
    y: number;
    radius?: number;
    lifeTime: number;
    maxLifeTime: number;
    color: string;
    // Cyclone Props
    angle?: number;
    spinSpeed?: number;
    // Follow Props
    followPlayer?: boolean;
    // Physics Props
    expansionRate?: number;
}