import { 
    GameState, Vector2, ItemInstance, ItemSlot, ActiveSkillInstance, UpgradeDefinition, 
    Interactable, Enemy, Bullet, Loot, XPOrb, GroundEffect, Particle, MapStats, 
    VisualEffect, EquipmentMap, NPC, DamageType, ItemRarity, EnemyType, JoystickState,
    SkillTag, XPOrbTier, StatKey
} from './types';
import { StatsSystem } from './StatsSystem';
import { SkillManager, SKILL_DATABASE } from './SkillSystem';
import { generateItem, generateRewards, createEndlessKey, createGemItem, createSpecificItem, AFFIX_DATABASE } from './ItemSystem';
import { AssetManager } from './AssetManager';

// --- ASSETS (SVG Data URIs) ---
const ASSETS: { [key: string]: string } = {
  player: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj4KICA8Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0OCIgZmlsbD0iIzNiODJmNiIgc3Ryb2tlPSIjMjU2M2ViIiBzdHJva2Utd2lkdGg9IjQiLz4KICA8Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIyNSIgZmlsbD0iIzYwYTVmYSIgb3BhY2l0eT0iMC41Ii8+Cjwvc3ZnPg==`,
  enemy: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj4KICA8cmVjdCB4PSI1IiB5PSI1IiB3aWR0aD0iOTAiIGhlaWdodD0iOTAiIHJ4PSIyMCIgZmlsbD0iI2VmNDQ0NCIgc3Ryb2tlPSIjOTkxYjFiIiBzdHJva2Utd2lkdGg9IjQiLz4KICA8cGF0aCBkPSJNMzAgNDAgTDUwIDYwIEw3MCA0MCIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSI1IiBmaWxsPSJub25lIi8+CiAgPGNpcmNsZSBjeD0iMzUiIGN5PSI0MCIgcj0iNSIgZmlsbD0iYmxhY2siLz4KICA8Y2lyY2xlIGN4PSI2NSIgY3k9IjQwIiByPSI1IiBmaWxsPSJibGFjayIvPgo8L3N2Zz4=`,
  enemyFast: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj4KICA8cGF0aCBkPSJNIDUwIDUgTCA5NSA5NSBMIDUwIDc1IEwgNSA5NSBaIiBmaWxsPSIjMDZ1NmQ0IiBzdHJva2U9IiMxZTMhOGEiIHN0cm9rZS13aWR0aD0iNCIvPgogIDxjaXJjbGUgY3g9IjUwIiBjeT0iNDUiIHI9IjUiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==`,
  enemyTank: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj4KICA8cmVjdCB4PSI1IiB5PSI1IiB3aWR0aD0iOTAiIGhlaWdodD0iOTAiIGZpbGw9IiMxNTgwM2QiIHN0cm9rZT0iIzE0NTMyZCIgc3Ryb2tlLXdpZHRoPSI4Ii8+CiAgPHJlY3QgeD0iMjAiIHk9IjIwIiB3aWR0aD0iNjAiIGhlaWdodD0iMTUiIGZpbGw9ImJsYWNrIiBvcGFjaXR5PSIwLjMiLz4KPC9zdmc+`,
  enemyBoss: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj4KICA8cGF0aCBkPSJNIDUwIDUgQyAyMCA1IDIwIDQ1IDIwIDQ1IEwgMjAgNzAgQyAyMCA4NSAzNSA5NSA1MCA5NSBDIDY1IDk1IDgwIDg1IDgwIDcwIEwgODAgNDUgQyA4MCA0NSA4MCA1IDUwIDUgWiIgZmlsbD0iIzc5MzA5NCIgc3Ryb2tlPSIjNTgxYzhjIiBzdHJva2Utd2lkdGg9IjUiLz4KICA8Y2lyY2xlIGN4PSIzNSIgY3k9IjQwIiByPSI4IiBmaWxsPSIjZmZjMTA3Ii8+CiAgPGNpcmNsZSBjeD0iNjUiIGN5PSI0MCIgcj0iOCIgZmlsbD0iI2ZmYzEwNyIvPgogIDxwYXRoIGQ9Ik0gNDAgNzAgTCA1MCA2MCBMIDYwIDcwIiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjMiIGZpbGw9Im5vbmUiLz4KPC9zdmc+`,
  bullet: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj4KICA8Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0NSIgZmlsbD0iI2ZhY2MxNSIvPgogIDxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjI1IiBmaWxsPSIjZmZmZmZmIi8+Cjwvc3ZnPg==`,
  bulletBoss: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj4KICA8Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0NSIgZmlsbD0iI2RjMjYyNiIvPgogIDxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjI1IiBmaWxsPSIjN2YxZDFkIi8+Cjwvc3ZnPg==`,
  crate: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj4KICA8cmVjdCB4PSIxMCIgeT0iMjAiIHdpZHRoPSI4MCIgaGVpZ2h0PSI2MCIgZmlsbD0iI2ZiYmYyNCIgc3Ryb2tlPSIjYjQ1MzA5IiBzdHJva2Utd2lkdGg9IjUiLz4KICA8cmVjdCB4PSIxMCIgeT0iMzUiIHdpZHRoPSI4MCIgaGVpZ2h0PSIxMCIgZmlsbD0iI2I0NTMwOSIvPgogIDxyZWN0IHg9IjQwIiB5PSIzbCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiByeD0iNSIgZmlsbD0iIzQ1MWEwMyIvPgo8L3N2Zz4=`
};

// --- Configs & Constants ---
export const BACKPACK_CAPACITY = 100;
export const CAMERA_ZOOM = 0.5; // Zoom out to see more
const PLAYER_SIZE = 40; 
const PLAYER_COLOR = '#3b82f6';
const SPEED_SCALAR = 60;
const ENEMY_COLOR = '#ef4444';
const ELITE_COLOR = '#facc15';
const BULLET_BOSS_COLOR = '#dc2626';

const XP_PER_ENEMY = 10; 
const BASE_XP_TO_LEVEL = 150;
const MAX_ENEMIES_POOL_SIZE = 150; 
const MAX_XP_ORBS = 300; 

const BULLET_LIFETIME = 2.0; 
const MAX_BULLETS = 300; 

const LOOT_SIZE = 20;
const LOOT_CHANCE = 0.02; // Reduced drop chance
const ELITE_LOOT_CHANCE = 0.5;
const MAX_LOOT = 50;

const FLOATING_TEXT_POOL_SIZE = 50;
const FLOATING_TEXT_SPEED = 50;
const FLOATING_TEXT_LIFETIME = 0.8;

const GRID_SIZE = 50;
const GRID_COLOR = '#cbd5e1'; 
const JOYSTICK_MAX_RADIUS = 60;
const JOYSTICK_BASE_COLOR = 'rgba(0, 0, 0, 0.1)';
const JOYSTICK_HANDLE_COLOR = 'rgba(0, 0, 0, 0.3)';

const SAVE_KEY = 'poe_roguelite_save_v1';

const ENEMY_STATS: Record<EnemyType, { size: number; hp: number; speed: number }> = {
    basic: { size: 40, hp: 10, speed: 100 },
    fast: { size: 30, hp: 5, speed: 150 },
    tank: { size: 50, hp: 30, speed: 60 },
    boss: { size: 120, hp: 1000, speed: 40 },
};

const ENEMY_MODIFIERS: EnemyModifier[] = [
    'regenerator', 'berserker', 'ghostly', 
    'extra_proj', 
    'chaos_res', 'cold_res', 'fire_res', 'lightning_res',
    'evasive', 'armoured', 'proximal',
    'trail_fire', 'trail_ice', 'trail_lightning', 'periodic_blast', 'temporal'
];

export interface EngineCallbacks {
    onGameOver: (isOver: boolean) => void;
    onHudUpdate: (data: { level: number; xp: number; nextLevelXp: number; waveName: string; currentHp: number; maxHp: number; currentFloor: number; currentKills: number; targetKills: number; gold: number }) => void;
    onLevelUp: (options: UpgradeDefinition[]) => void;
    onNotification: (text: string) => void;
    onInventoryChange: () => void;
    onNearbyInteractable: (interactable: Interactable | null) => void;
    onOpenShop: () => void;
}

const uuid = () => Math.random().toString(36).substring(2, 9);

function createEmptySkillSlot(id: number): ActiveSkillInstance {
    return {
        instanceId: `skill_${id}`,
        activeGem: null,
        supportGems: [null, null, null],
        cooldownTimer: 0
    };
}

export class GameEngine {
    canvas: HTMLCanvasElement | null = null;
    ctx: CanvasRenderingContext2D | null = null;
    callbacks: EngineCallbacks;

    // Assets
    images: { [key: string]: HTMLImageElement } = {};
    assetsLoaded = false;

    // State
    gameState: GameState;
    joystickState: JoystickState;
    playerStats: StatsSystem; 
    chosenUpgrades: UpgradeDefinition[] = [];
    currentHp: number;

    // Director
    directorState = {
        gameTime: 0,
        spawnTimer: 0,
        bossSpawned: false
    };

    // Pools
    enemies: Enemy[] = [];
    bullets: Bullet[] = [];
    loot: Loot[] = [];
    floatingTexts: FloatingText[] = [];
    visualEffects: VisualEffect[] = [];
    xpOrbs: XPOrb[] = [];

    // Loop
    timers = { currentFps: 0, frames: 0, fpsUpdate: 0 };
    animationFrameId = 0;

    constructor(callbacks: EngineCallbacks) {
        this.callbacks = callbacks;
        this.playerStats = new StatsSystem();
        this.currentHp = 100;

        // Initialize Default State
        const loaded = this.loadGame();
        if (loaded) {
            this.gameState = loaded;
        } else {
            this.gameState = this.createInitialState();
        }

        this.joystickState = {
            active: false,
            origin: { x: 0, y: 0 },
            current: { x: 0, y: 0 },
            vector: { x: 0, y: 0 },
        };

        this.initPools();
        this.recalculateStats(); 
        
        // If loaded, respect saved HP, otherwise full
        if (!loaded) {
            this.currentHp = this.playerStats.getStatValue('maxHp');
        } else {
            this.currentHp = Math.min(this.currentHp, this.playerStats.getStatValue('maxHp')); // Safety
        }
    }

    private createInitialState(): GameState {
        // ROGUELIKE START
        // Pre-equip Fireball and Flame Ring
        const activeSkills: ActiveSkillInstance[] = [
            createEmptySkillSlot(0),
            createEmptySkillSlot(1),
            createEmptySkillSlot(2),
            createEmptySkillSlot(3)
        ];
        
        activeSkills[0].activeGem = createGemItem('fireball'); // Fireball in Slot 1
        activeSkills[1].activeGem = createGemItem('flame_ring'); // Flame Ring (Defense)

        // Give starter maps
        const starterMaps = [
            generateItem('map', 1, 'normal'),
            generateItem('map', 2, 'magic'),
            generateItem('map', 3, 'rare')
        ];
        
        // 🎁 赠送 10 张无尽门票
        const endlessKey = createEndlessKey();
        endlessKey.stackSize = 10;
        starterMaps.push(endlessKey);

        // Give Pyromancer's Ring for Debugging
        const debugRing = createSpecificItem('ring1', 'prefix_pyromancer');

        const mapDevice: Interactable = {
            id: 999,
            active: true,
            type: 'map_device',
            x: 0,
            y: -200,
            width: 80,
            height: 80,
            color: '#c026d3',
            interactionRadius: 100,
            label: 'Map Device'
        };

        const merchant: NPC = {
            id: 888,
            active: true,
            type: 'merchant',
            name: "Merchant",
            x: 100,
            y: -50,
            width: 50,
            height: 50,
            color: '#22c55e',
            interactionRadius: 80
        };

        return {
            worldState: 'HIDEOUT',
            gold: 0,
            playerWorldPos: { x: 0, y: 0 },
            playerInvulnerabilityTimer: 0,
            velocity: { x: 0, y: 0 },
            lastFrameTime: 0,
            isGameOver: false,
            isPaused: false,
            score: 0,
            level: 1,
            xp: 0,
            nextLevelXp: BASE_XP_TO_LEVEL,
            backpack: [...starterMaps],
            equipment: { 
                helmet: null, amulet: null, weapon: null, offhand: null, 
                body: null, gloves: null, ring1: debugRing, ring2: null, boots: null 
            },
            shakeTimer: 0,
            activeSkills: activeSkills,
            gemInventory: [], 
            interactables: [mapDevice],
            npcs: [merchant],
            currentMapStats: {
                tier: 0,
                monsterHealthMult: 1,
                monsterDamageMult: 1,
                packSizeMult: 1,
                xpMult: 1,
                rarityMult: 1
            },
            pendingSupportGem: null,
            isSelectingSupport: false,
            // Expedition Logic
            currentFloor: 0,
            targetKills: 0,
            currentKills: 0,
            currentMaxEnemies: 20,
            expeditionActive: false,
            groundEffects: [],
            particles: [],
            xpOrbs: []
        };
    }

    private saveGame() {
        const stateToSave = {
            ...this.gameState,
            // Exclude transient/scene objects
            isPaused: false,
            shakeTimer: 0,
            playerInvulnerabilityTimer: 0,
            velocity: {x:0, y:0},
            groundEffects: [], // Don't save transient ground effects
            particles: [], // Don't save transient particles
            xpOrbs: [] // Don't save orbs
        };
        localStorage.setItem(SAVE_KEY, JSON.stringify(stateToSave));
    }

    private loadGame(): GameState | null {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (!parsed.currentFloor) parsed.currentFloor = 0;
            if (parsed.gold === undefined) parsed.gold = 0;
            if (!parsed.npcs) parsed.npcs = [];
            if (!parsed.groundEffects) parsed.groundEffects = [];
            if (!parsed.particles) parsed.particles = [];
            if (!parsed.xpOrbs) parsed.xpOrbs = [];

            // Re-inject NPCs if in hideout
            if (parsed.worldState === 'HIDEOUT') {
                const merchant: NPC = {
                    id: 888,
                    active: true,
                    type: 'merchant',
                    name: "Merchant",
                    x: 100,
                    y: -50,
                    width: 50,
                    height: 50,
                    color: '#22c55e',
                    interactionRadius: 80
                };
                parsed.npcs = [merchant];
                // Ensure Map Device
                const hasDevice = parsed.interactables.some((i: Interactable) => i.type === 'map_device');
                if (!hasDevice) {
                    parsed.interactables.push({
                        id: 999,
                        active: true,
                        type: 'map_device',
                        x: 0,
                        y: -200,
                        width: 80,
                        height: 80,
                        color: '#c026d3',
                        interactionRadius: 100,
                        label: 'Map Device'
                    });
                }
            }

            return parsed as GameState;
        } catch (e) {
            console.error("Failed to load save", e);
            return null;
        }
    }

    private initPools() {
        for (let i = 0; i < MAX_ENEMIES_POOL_SIZE; i++) {
            this.enemies.push({ 
                id: i, active: false, x: 0, y: 0, width: 0, height: 0, color: ENEMY_COLOR, 
                hp: 0, speed: 0, type: 'basic', maxHp: 0, attackTimer: undefined,
                modifiers: [], isElite: false,
                resistances: { physical: 0, fire: 0, cold: 0, lightning: 0, chaos: 0 },
                statuses: {},
                knockbackVelocity: { x: 0, y: 0 }
            });
        }
        for (let i = 0; i < MAX_BULLETS; i++) {
            this.bullets.push({ 
                id: i, active: false, x: 0, y: 0, width: 0, height: 0, color: '#000', 
                vx: 0, vy: 0, lifeTime: 0, owner: 'player', hitIds: [], damageType: 'physical', pierce: 0, ailmentChance: 0
            });
        }
        
        const dummyItem: ItemInstance = { id: 'dummy', name: 'dummy', type: 'equipment', slot: 'weapon', rarity: 'normal', level: 1, affixes: [] };
        for (let i = 0; i < MAX_LOOT; i++) {
            this.loot.push({ 
                id: i, active: false, x: 0, y: 0, width: LOOT_SIZE, height: LOOT_SIZE, color: 'gold', 
                lifeTime: 0,
                itemData: dummyItem,
                rarity: 'normal',
                autoCollectRadius: 50
            });
        }

        for (let i = 0; i < FLOATING_TEXT_POOL_SIZE; i++) {
            this.floatingTexts.push({
                id: i, active: false, x: 0, y: 0, text: '', color: 'white', lifeTime: 0, velocityY: 0, scale: 1
            });
        }

        for (let i = 0; i < MAX_XP_ORBS; i++) {
            this.xpOrbs.push({
                id: i, active: false, x: 0, y: 0, value: 0, magnetized: false, tier: 'blue'
            });
        }

        this.visualEffects = [];
    }

    public async loadAssets() {
        const promises = Object.entries(ASSETS).map(([key, src]) => {
            return new Promise<void>((resolve) => {
                const img = new Image();
                img.src = src;
                img.onload = () => {
                    this.images[key] = img;
                    resolve();
                };
            });
        });
        await Promise.all(promises);
        this.assetsLoaded = true;
    }

    public setCanvas(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }

    public start() {
        this.gameState.lastFrameTime = performance.now();
        this.loop(performance.now());
    }

    public stop() {
        cancelAnimationFrame(this.animationFrameId);
    }

    public resetGame() {
        this.finalizeRun();
        
        this.gameState.isGameOver = false;
        this.recalculateStats();
        // Ensure maxHP is fresh
        this.currentHp = this.playerStats.getStatValue('maxHp');
        
        this.callbacks.onGameOver(false);
        this.updateHud();
        this.callbacks.onInventoryChange();
        this.gameState.lastFrameTime = performance.now();
        this.loop(performance.now());
    }

    private updateHud() {
        this.callbacks.onHudUpdate({ 
            level: this.gameState.level, 
            xp: this.gameState.xp, 
            nextLevelXp: this.gameState.nextLevelXp, 
            waveName: this.gameState.worldState === 'RUN' ? (this.gameState.currentFloor === 5 ? 'BOSS FLOOR' : `FLOOR ${this.gameState.currentFloor}`) : 'HIDEOUT',
            currentHp: this.currentHp,
            maxHp: this.playerStats.getStatValue('maxHp'),
            currentFloor: this.gameState.currentFloor,
            currentKills: this.gameState.currentKills,
            targetKills: this.gameState.targetKills,
            gold: this.gameState.gold
        });
    }

    public toggleInventory(isOpen: boolean) {
        if (this.gameState.isGameOver) return;
        this.gameState.isPaused = isOpen;
        if (!isOpen) {
            this.gameState.lastFrameTime = performance.now();
        } else {
            this.saveGame();
        }
    }

    private loop = (time: number) => {
        this.animationFrameId = requestAnimationFrame(this.loop);
        this.update(time);
        if (this.canvas) this.draw();
    };

    // --- LOGIC ---

    private getPointerPos(e: MouseEvent | TouchEvent): Vector2 {
        if (!this.canvas) return { x: 0, y: 0 };
        const rect = this.canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    }

    public handleStart = (e: any) => {
        if (this.gameState.isGameOver || this.gameState.isPaused) return;
        e.preventDefault();
        const pos = this.getPointerPos(e);

        // Check for NPC Click first
        if (this.gameState.worldState === 'HIDEOUT') {
            const camX = this.gameState.playerWorldPos.x + PLAYER_SIZE / 2;
            const camY = this.gameState.playerWorldPos.y + PLAYER_SIZE / 2;
            
            // Convert Screen Pos to World Pos (Roughly)
            // ScreenX = (WorldX - CamX) * Zoom + HalfWidth
            // WorldX = (ScreenX - HalfWidth) / Zoom + CamX
            const halfW = this.canvas!.width / 2;
            const halfH = this.canvas!.height / 2;
            const worldX = (pos.x - halfW) / CAMERA_ZOOM + camX;
            const worldY = (pos.y - halfH) / CAMERA_ZOOM + camY;
            for (const npc of this.gameState.npcs) {
                const cx = npc.x + npc.width/2;
                const cy = npc.y + npc.height/2;
                const dist = Math.sqrt((worldX - cx)**2 + (worldY - cy)**2);
                // Allow generous click radius
                if (dist < npc.interactionRadius) {
                    if (npc.type === 'merchant') {
                        this.callbacks.onOpenShop();
                        return; // Don't activate joystick
                    }
                }
            }
        }

        if (this.canvas && pos.y > this.canvas.height * 0.4) {
          this.joystickState.active = true;
          this.joystickState.origin = pos;
          this.joystickState.current = pos;
          this.joystickState.vector = { x: 0, y: 0 };
        }
    }

    public handleMove = (e: any) => {
        if (!this.joystickState.active || this.gameState.isPaused) return;
        e.preventDefault();
        const pos = this.getPointerPos(e);
        this.joystickState.current = pos;
        const dx = pos.x - this.joystickState.origin.x;
        const dy = pos.y - this.joystickState.origin.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
          const clamped = Math.min(dist, JOYSTICK_MAX_RADIUS);
          this.joystickState.vector = { x: (dx / dist) * (clamped / JOYSTICK_MAX_RADIUS), y: (dy / dist) * (clamped / JOYSTICK_MAX_RADIUS) };
        } else this.joystickState.vector = { x: 0, y: 0 };
    }

    public handleEnd = (e: any) => {
        if (this.joystickState.active) e.preventDefault();
        this.joystickState.active = false;
        this.joystickState.vector = { x: 0, y: 0 };
    }

    private update(time: number) {
        const now = time;
        const dt = Math.min((now - this.gameState.lastFrameTime) / 1000, 0.1);
        this.gameState.lastFrameTime = now;

        // FPS Calc
        this.timers.frames++;
        if (now > this.timers.fpsUpdate + 1000) {
            this.timers.currentFps = this.timers.frames;
            this.timers.frames = 0;
            this.timers.fpsUpdate = now;
        }

        if (this.gameState.isPaused || this.gameState.isGameOver) return;

        // --- 1. PLAYER MOVEMENT ---
        if (this.joystickState.active) {
            const speed = this.playerStats.getStatValue('moveSpeed') * SPEED_SCALAR;
            this.gameState.velocity.x = this.joystickState.vector.x * speed;
            this.gameState.velocity.y = this.joystickState.vector.y * speed;
            
            this.gameState.playerWorldPos.x += this.gameState.velocity.x * dt;
            this.gameState.playerWorldPos.y += this.gameState.velocity.y * dt;
        }

        // --- 2. SKILL COOLDOWNS & AUTO-CAST ---
        this.gameState.activeSkills.forEach((skill, index) => {
            if (!skill.activeGem) return;
            
            if (skill.cooldownTimer > 0) {
                skill.cooldownTimer -= dt;
            }

            // Simple Auto-Cast Logic
            if (skill.cooldownTimer <= 0) {
                const resolved = SkillManager.resolveSkill(skill, this.playerStats);
                if (resolved) {
                    // Cast
                    this.castSkill(resolved, 1.0);
                    skill.cooldownTimer = 1.0 / resolved.stats.attackRate;
                }
            }
        });

        // --- 3. ENTITY UPDATES ---
        
        // Enemies
        const playerRect = { x: this.gameState.playerWorldPos.x, y: this.gameState.playerWorldPos.y, width: PLAYER_SIZE, height: PLAYER_SIZE, id: 'player', active: true, color: '' };
        
        this.enemies.forEach(e => {
            if (!e.active) return;
            
            // Apply Status Effects
            if (e.statuses['ignited']) {
                e.hp -= 2 * dt; // Burn
                e.statuses['ignited'] -= dt;
                if (e.statuses['ignited'] <= 0) delete e.statuses['ignited'];
            }
            if (e.statuses['chilled']) {
                e.statuses['chilled'] -= dt;
                if (e.statuses['chilled'] <= 0) delete e.statuses['chilled'];
            }
            if (e.statuses['shocked']) {
                e.statuses['shocked'] -= dt;
                if (e.statuses['shocked'] <= 0) delete e.statuses['shocked'];
            }

            // Movement
            let speed = e.speed;
            if (e.statuses['chilled']) speed *= 0.5;
            
            const dx = this.gameState.playerWorldPos.x - e.x;
            const dy = this.gameState.playerWorldPos.y - e.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if (dist > 0) {
                e.x += (dx / dist) * speed * dt;
                e.y += (dy / dist) * speed * dt;
            }

            // Knockback Decay
            if (Math.abs(e.knockbackVelocity!.x) > 1 || Math.abs(e.knockbackVelocity!.y) > 1) {
                e.x += e.knockbackVelocity!.x * dt;
                e.y += e.knockbackVelocity!.y * dt;
                e.knockbackVelocity!.x *= 0.9;
                e.knockbackVelocity!.y *= 0.9;
            }

            // Player Collision (Damage)
            if (this.checkCollision(playerRect, e)) {
                if (this.gameState.playerInvulnerabilityTimer <= 0) {
                    // Take Damage
                    const dmg = 10 * this.gameState.currentMapStats.monsterDamageMult; // Simplified
                    // Defense calc
                    const def = this.playerStats.getStatValue('defense');
                    const mitigation = def / (def + 100); // Simple formula
                    const taken = Math.max(1, dmg * (1 - mitigation));
                    
                    this.currentHp -= taken;
                    this.triggerShake(0.2);
                    this.gameState.playerInvulnerabilityTimer = 0.5;
                    this.updateHud();
                    
                    if (this.currentHp <= 0) {
                        this.gameState.isGameOver = true;
                        this.callbacks.onGameOver(true);
                    }
                }
            }
            
            if (e.hp <= 0) {
                this.handleEnemyDeath(e);
            }
        });

        // Invulnerability Tick
        if (this.gameState.playerInvulnerabilityTimer > 0) {
            this.gameState.playerInvulnerabilityTimer -= dt;
        }

        // Bullets
        this.bullets.forEach(b => {
            if (!b.active) return;
            b.x += b.vx * dt;
            b.y += b.vy * dt;
            b.lifeTime -= dt;
            if (b.lifeTime <= 0) b.active = false;
            
            // Collisions
            if (b.owner === 'player') {
                for (const e of this.enemies) {
                    if (!e.active || b.hitIds.includes(e.id)) continue;
                    if (this.checkCollision(b, e)) {
                        // Hit!
                        b.hitIds.push(e.id);
                        if (b.damage) {
                            // Basic Attack or special
                            const isCrit = Math.random() < this.playerStats.getStatValue('critChance');
                            const mult = isCrit ? this.playerStats.getStatValue('critMultiplier') : 1.0;
                            this.applyDamage(e, b.damage * mult, isCrit, b.damageType, this.gameState.playerWorldPos, b.ailmentChance);
                        }
                        
                        // Pierce Logic
                        if (b.pierce > 0) {
                            b.pierce--;
                        } else {
                            b.active = false;
                            // Hit effect
                            this.visualEffects.push({
                                id: Math.random(), active: true, type: 'hit', x: b.x, y: b.y, radius: 15, lifeTime: 0.2, maxLifeTime: 0.2, color: 'white'
                            });
                            break;
                        }
                    }
                }
            }
        });

        // Floating Text
        this.floatingTexts.forEach(t => {
            if (!t.active) return;
            t.y -= t.velocityY * dt;
            t.lifeTime -= dt;
            if (t.lifeTime <= 0) t.active = false;
        });

        // Visual Effects
        this.visualEffects.forEach(e => {
            if (!e.active) return;
            e.lifeTime -= dt;
            if (e.followPlayer) {
                e.x = this.gameState.playerWorldPos.x + PLAYER_SIZE/2;
                e.y = this.gameState.playerWorldPos.y + PLAYER_SIZE/2;
            }
            if (e.expansionRate) {
                if (!e.radius) e.radius = 0;
                e.radius += e.expansionRate;
            }
            if (e.lifeTime <= 0) e.active = false;
        });

        // Loot Magnet & Pickup
        this.loot.forEach(l => {
            if (!l.active) return;
            const dx = (this.gameState.playerWorldPos.x + PLAYER_SIZE/2) - (l.x + l.width/2);
            const dy = (this.gameState.playerWorldPos.y + PLAYER_SIZE/2) - (l.y + l.height/2);
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if (dist < l.autoCollectRadius) {
                l.x += (dx/dist) * 300 * dt; // Magnet speed
                l.y += (dy/dist) * 300 * dt;
                
                if (dist < 20) {
                    // Collected
                    l.active = false;
                    if (this.gameState.backpack.length < BACKPACK_CAPACITY) {
                        this.gameState.backpack.push(l.itemData);
                        this.callbacks.onInventoryChange();
                        this.spawnFloatingText(this.gameState.playerWorldPos.x, this.gameState.playerWorldPos.y - 20, l.itemData.name, '#fbbf24', 0.8);
                    } else {
                        this.callbacks.onNotification("Bag Full!");
                    }
                }
            }
        });

        // XP Orbs Magnet & Pickup
        const pickupRange = 100; // Base pickup range
        this.xpOrbs.forEach(o => {
            if (!o.active) return;
            const dx = (this.gameState.playerWorldPos.x + PLAYER_SIZE/2) - o.x;
            const dy = (this.gameState.playerWorldPos.y + PLAYER_SIZE/2) - o.y;
            const dist = Math.sqrt(dx*dx + dy*dy);

            if (o.magnetized || dist < pickupRange) {
                o.magnetized = true;
                const speed = 400 + (1000 / (dist + 1)); // Accelerate as it gets closer
                o.x += (dx/dist) * speed * dt;
                o.y += (dy/dist) * speed * dt;

                if (dist < 15) {
                    o.active = false;
                    this.gainXp(o.value);
                }
            }
        });

        // Director (Spawning)
        if (this.gameState.worldState === 'RUN' && !this.directorState.bossSpawned) {
            this.directorState.spawnTimer -= dt;
            if (this.directorState.spawnTimer <= 0) {
                const enemiesCount = this.enemies.filter(e => e.active).length;
                if (enemiesCount < this.gameState.currentMaxEnemies) {
                    // Spawn logic based on difficulty?
                    const r = Math.random();
                    let type: EnemyType = 'basic';
                    if (r < 0.2) type = 'fast';
                    else if (r < 0.3) type = 'tank';
                    
                    this.spawnEnemy(type);
                }
                this.directorState.spawnTimer = 0.5 / this.gameState.currentMapStats.packSizeMult; 
            }
        }
        
        // Shake decay
        if (this.gameState.shakeTimer > 0) this.gameState.shakeTimer -= dt;
    }

    // --- MAP SYSTEM & EXPEDITION LOOP ---
    
    public activateMap(mapItem: ItemInstance) {
        if (mapItem.type !== 'map') return;
        
        // Remove map from bag (Simple consumption logic)
        const idx = this.gameState.backpack.findIndex(i => i.id === mapItem.id);
        if (idx > -1) {
             // If stack logic exists later
             if (mapItem.stackSize && mapItem.stackSize > 1) {
                 mapItem.stackSize--;
             } else {
                 this.gameState.backpack.splice(idx, 1);
             }
        }
        this.callbacks.onInventoryChange();

        // --- Endless Mode Check ---
        if (mapItem.id === 'map_endless_void') {
            this.gameState.isEndlessMode = true;
            this.gameState.currentFloor = 1;
            
            // Endless Mode Initial State: No bonuses, pure baseline
            this.gameState.currentMapStats = {
                tier: 1,
                monsterHealthMult: 1.0,
                monsterDamageMult: 1.0,
                packSizeMult: 1.0,
                xpMult: 1.0,
                rarityMult: 1.0
            };
            this.gameState.targetKills = 50; // Floor 1 target
            this.callbacks.onNotification("⚔️ ENDLESS MODE STARTED ⚔️");
        } else {
            // --- Normal Map Logic ---
            this.gameState.isEndlessMode = false;
            const mapStats: MapStats = {
                tier: mapItem.level,
                monsterHealthMult: 1 + (mapItem.level * 0.1), 
                monsterDamageMult: 1 + (mapItem.level * 0.1),
                packSizeMult: 1,
                xpMult: 1 + (mapItem.level * 0.05),
                rarityMult: 1
            };
            for (const affix of mapItem.affixes) {
                const val = affix.value;
                switch(affix.stat) {
                    case 'monsterHealth': mapStats.monsterHealthMult += val;
                    mapStats.xpMult += val * 0.5; break;
                    case 'monsterDamage': mapStats.monsterDamageMult += val; mapStats.xpMult += val * 0.5; break;
                    case 'monsterPackSize': mapStats.packSizeMult += val; break;
                    case 'xpGain': mapStats.xpMult += val; break;
                    case 'itemRarity': mapStats.rarityMult += val; break;
                }
            }

            // Rarity Bonuses
            if (mapItem.rarity === 'magic') { mapStats.rarityMult += 0.2;
            mapStats.packSizeMult += 0.1; }
            if (mapItem.rarity === 'rare') { mapStats.rarityMult += 0.5;
            mapStats.packSizeMult += 0.2; }
            if (mapItem.rarity === 'unique') { mapStats.rarityMult += 1.0;
            mapStats.xpMult += 0.5; }

            this.gameState.currentMapStats = mapStats;
            this.gameState.currentFloor = 1;
            this.gameState.targetKills = 50 + (1 * 50) + (mapStats.tier * 30); 
            
            this.callbacks.onNotification(`Expedition Started: Floor 1`);
        }

        // --- Common Initialization ---
        this.gameState.worldState = 'RUN';
        this.gameState.expeditionActive = true;
        this.gameState.currentKills = 0;
        this.gameState.playerWorldPos = { x: 0, y: 0 };
        this.directorState = { gameTime: 0, spawnTimer: 0, bossSpawned: false };
        
        // Clear Entities
        this.enemies.forEach(e => e.active = false);
        this.bullets.forEach(b => b.active = false);
        this.loot.forEach(l => l.active = false);
        this.xpOrbs.forEach(o => o.active = false);
        this.gameState.groundEffects = [];
        this.gameState.interactables = [];
        this.gameState.npcs = [];
        this.gameState.particles = [];

        this.saveGame();
        this.updateHud();
    }

    public activateFreeRun() {
        const freeMap = generateItem('map', 1, 'normal');
        this.activateMap(freeMap);
    }

    private enterNextFloor() {
        this.gameState.currentFloor += 1;
        this.gameState.currentKills = 0;
        this.gameState.playerWorldPos = { x: 0, y: 0 };
        this.directorState = { gameTime: 0, spawnTimer: 0, bossSpawned: false };
        // Clear Entities
        this.enemies.forEach(e => e.active = false);
        this.bullets.forEach(b => b.active = false);
        this.loot.forEach(l => l.active = false); 
        this.xpOrbs.forEach(o => o.active = false);
        this.gameState.groundEffects = [];
        this.gameState.interactables = [];
        this.gameState.particles = [];
        
        if (this.gameState.isEndlessMode) {
            // --- Endless Mode Logic ---
            const floor = this.gameState.currentFloor;
            // Infinite Scaling
            // HP +10% per floor, Damage +5% per floor
            this.gameState.currentMapStats.monsterHealthMult = 1 + (floor * 0.1);
            this.gameState.currentMapStats.monsterDamageMult = 1 + (floor * 0.05);
            this.gameState.currentMapStats.xpMult = 1 + (floor * 0.05);
            // Increase Kill Target
            this.gameState.targetKills = 50 + (floor * 10);
            
            // ☠️ 词缀污染 (每5层)
            if (floor % 5 === 0) {
                const badAffix = AFFIX_DATABASE.find(a => a.validSlots.includes('map') && a.type === 'prefix');
                if (badAffix) {
                    if (badAffix.stat === 'monsterHealth') this.gameState.currentMapStats.monsterHealthMult += badAffix.minVal;
                    if (badAffix.stat === 'monsterDamage') this.gameState.currentMapStats.monsterDamageMult += badAffix.minVal;
                    this.callbacks.onNotification(`⚠️ THE VOID CORRUPTS: ${badAffix.name} ⚠️`);
                }
            }

            this.callbacks.onNotification(`Endless Floor ${floor} (HP x${this.gameState.currentMapStats.monsterHealthMult.toFixed(1)})`);
        } else {
            // --- Normal Mode Logic ---
            this.gameState.currentMapStats.monsterHealthMult *= 1.1;
            this.gameState.currentMapStats.monsterDamageMult *= 1.1;
            
            // Floor 5 is Boss Floor
            if (this.gameState.currentFloor === 5) {
                 this.gameState.targetKills = 1;
                 this.spawnEnemy('boss');
                 this.directorState.bossSpawned = true;
                 this.callbacks.onNotification(`FLOOR 5: BOSS ENCOUNTER`);
            } else {
                 this.gameState.targetKills = 50 + (this.gameState.currentFloor * 50) + (this.gameState.currentMapStats.tier * 30);
                 this.callbacks.onNotification(`Descended to Floor ${this.gameState.currentFloor}`);
            }
        }

        this.saveGame();
        this.updateHud();
    }

    private finalizeRun() {
        this.gameState.worldState = 'HIDEOUT';
        this.gameState.playerWorldPos = { x: 0, y: 0 };
        this.currentHp = this.playerStats.getStatValue('maxHp');
        this.enemies.forEach(e => e.active = false);
        this.bullets.forEach(b => b.active = false);
        this.loot.forEach(l => l.active = false);
        this.xpOrbs.forEach(o => o.active = false);
        this.gameState.groundEffects = [];
        this.gameState.particles = [];
        this.gameState.expeditionActive = false;
        this.gameState.currentFloor = 0;
        
        // ROGUELIKE RESET
        this.gameState.activeSkills = [
            createEmptySkillSlot(0), createEmptySkillSlot(1),
            createEmptySkillSlot(2), createEmptySkillSlot(3)
        ];
        this.gameState.gemInventory = [];
        this.gameState.level = 1;
        this.gameState.xp = 0;
        this.gameState.nextLevelXp = BASE_XP_TO_LEVEL;
        this.chosenUpgrades = [];
        this.recalculateStats();
        this.currentHp = this.playerStats.getStatValue('maxHp');
        
        // Setup Hideout
        const mapDevice: Interactable = {
            id: 999,
            active: true,
            type: 'map_device',
            x: 0,
            y: -200,
            width: 80,
            height: 80,
            color: '#c026d3',
            interactionRadius: 100,
            label: 'Map Device'
        };
        const merchant: NPC = {
            id: 888,
            active: true,
            type: 'merchant',
            name: "Merchant",
            x: 100,
            y: -50,
            width: 50,
            height: 50,
            color: '#22c55e',
            interactionRadius: 80
        };
        this.gameState.interactables = [mapDevice];
        this.gameState.npcs = [merchant];

        // 🎁 赠送 10 张无尽门票 (Ensure they are available after reset too)
        const endlessKey = createEndlessKey();
        endlessKey.stackSize = 10;
        this.gameState.backpack.push(endlessKey);

        this.callbacks.onNotification("Run Complete - Character Reset");
        this.saveGame();
        this.updateHud();
        this.callbacks.onInventoryChange();
    }
    
    public returnToHideout() {
        this.finalizeRun();
    }

    // --- ITEM & STAT SYSTEM ---

    public sellBatch(mode: 'normal' | 'magic' | 'rare' | 'all_junk') {
        const backpack = this.gameState.backpack;
        let itemsToSell: ItemInstance[] = [];

        if (mode === 'all_junk') {
            itemsToSell = backpack.filter(i => (i.rarity === 'normal' || i.rarity === 'magic') && i.type === 'equipment');
        } else {
            itemsToSell = backpack.filter(i => i.rarity === mode && i.type === 'equipment');
        }

        if (itemsToSell.length === 0) {
            this.callbacks.onNotification("No matching equipment to sell.");
            return;
        }

        let totalValue = 0;
        const PRICES: Record<string, number> = { normal: 5, magic: 10, rare: 20, unique: 50 };
        itemsToSell.forEach(item => {
            totalValue += PRICES[item.rarity] || 1;
        });
        
        // Remove sold items
        this.gameState.backpack = this.gameState.backpack.filter(i => !itemsToSell.includes(i));
        this.gameState.gold += totalValue;
        this.callbacks.onNotification(`Sold ${itemsToSell.length} items for ${totalValue} Gold`);
        this.callbacks.onInventoryChange();
        this.updateHud();
        this.saveGame();
    }

    public sellSingleItem(item: ItemInstance) {
        const backpackIndex = this.gameState.backpack.findIndex(i => i.id === item.id);
        if (backpackIndex === -1) return;

        let price = 0;
        switch (item.rarity) {
            case 'normal': price = 5;
            break;
            case 'magic': price = 10; break;
            case 'rare': price = 20; break;
            case 'unique': price = 100; break;
        }

        this.gameState.backpack.splice(backpackIndex, 1);
        this.gameState.gold += price;

        this.callbacks.onNotification(`Sold ${item.name} for ${price} Gold`);
        this.callbacks.onInventoryChange();
        this.updateHud();
        this.saveGame();
    }

    private recalculateStats() {
        this.playerStats.reset();
        
        const level = this.gameState.level;
        this.playerStats.setBase('moveSpeed', 3.0);
        this.playerStats.setBase('attackSpeed', 1.0);
        
        // Base Damage = 10 + (Current Level * 2)
        this.playerStats.setBase('bulletDamage', 10 + (level * 2));
        this.playerStats.setBase('projectileCount', 1);
        this.playerStats.setBase('projectileSpread', 15);
        
        // Base HP = 100 + (Current Level * 10)
        this.playerStats.setBase('maxHp', 100 + (level * 10));
        this.playerStats.setBase('hpRegen', 0);
        this.playerStats.setBase('critChance', 0.05);
        this.playerStats.setBase('critMultiplier', 1.5);
        this.playerStats.setBase('defense', 0);
        // Base Ailment Chance = 15%
        this.playerStats.setBase('ailmentChance', 0.15);
        
        for (const upg of this.chosenUpgrades) {
            if (upg.stat && upg.type && upg.value) {
                this.playerStats.addModifier(upg.stat, upg.type, upg.value, upg.tags);
            }
        }
  
        const equipment = this.gameState.equipment;
        Object.keys(equipment).forEach((key) => {
            const slot = key as ItemSlot;
            const item = equipment[slot];
            if (!item) return;
  
            for (const affix of item.affixes) {
                if (['monsterHealth', 'monsterDamage', 'monsterPackSize'].includes(affix.stat)) continue;
                this.playerStats.addModifier(affix.stat as StatKey, affix.valueType, affix.value, affix.tags);
            }
        });
        
        // --- HP SYNC FIX ---
        const finalMaxHp = this.playerStats.getStatValue('maxHp');
        // Cap current health to new max health to prevent overflow
        if (this.currentHp > finalMaxHp) {
            this.currentHp = finalMaxHp;
        }

        // Notify UI immediately to update stats panel and HUD
        this.updateHud();
        this.callbacks.onInventoryChange();
    }

    public equipItem(item: ItemInstance) {
        if (item.type === 'gem' || item.type === 'map') return;
        // Smart Ring Logic: Auto-target empty slot or default to ring1
        if (item.slot === 'ring1' || item.slot === 'ring2') {
             if (!this.gameState.equipment.ring1) {
                 item.slot = 'ring1';
             } else if (!this.gameState.equipment.ring2) {
                 item.slot = 'ring2';
             } else {
                 item.slot = 'ring1';
                 // Default replace ring1
             }
        }

        const currentEquipped = this.gameState.equipment[item.slot as ItemSlot];
        const backpackIndex = this.gameState.backpack.findIndex(i => i.id === item.id);
        if (backpackIndex > -1) {
            this.gameState.backpack.splice(backpackIndex, 1);
        }
        if (currentEquipped) {
            this.gameState.backpack.push(currentEquipped);
        }
        this.gameState.equipment[item.slot as ItemSlot] = item;
        this.recalculateStats(); 
        this.saveGame();
        // onInventoryChange called inside recalculateStats now, but safe to call again or remove
        // Leaving it here ensures flow is clear
    }

    public unequipItem(slot: ItemSlot) {
        if (slot === 'gem' as any) return;
        const item = this.gameState.equipment[slot];
        if (!item) return;
        if (this.gameState.backpack.length >= BACKPACK_CAPACITY) {
            this.callbacks.onNotification("Backpack Full!");
            return;
        }
        this.gameState.backpack.push(item);
        this.gameState.equipment[slot] = null;
        this.recalculateStats(); 
        this.saveGame();
    }

    // --- GEM MANAGEMENT ---

    public equipGem(gemItem: ItemInstance, skillIndex: number, isSupport: boolean, subSlotIndex: number = -1) {
        const activeSkill = this.gameState.activeSkills[skillIndex];
        if (!activeSkill) return;

        const gemDef = SKILL_DATABASE[gemItem.gemDefinitionId || ''];
        if (!gemDef) return;
        
        if (isSupport) {
            if (gemDef.type !== 'support') {
                this.callbacks.onNotification("Must be Support Gem!");
                return;
            }
            if (!activeSkill.activeGem) {
                this.callbacks.onNotification("Active Skill Required!");
                return;
            }
            if (!SkillManager.checkCompatibility(activeSkill.activeGem.gemDefinitionId!, gemItem.gemDefinitionId!)) {
                this.callbacks.onNotification("Incompatible Gem Tags!");
                return;
            }
        } else {
            if (gemDef.type !== 'active') {
                this.callbacks.onNotification("Must be Active Gem!");
                return;
            }
        }

        let targetSubSlot = subSlotIndex;
        if (isSupport && targetSubSlot === -1) {
            targetSubSlot = activeSkill.supportGems.findIndex(g => g === null);
            if (targetSubSlot === -1) targetSubSlot = 0; 
        }

        if (isSupport && gemItem.gemDefinitionId) {
             const isDuplicate = activeSkill.supportGems.some((existingGem, idx) => {
                 if (idx === targetSubSlot) return false;
                 if (!existingGem) return false;
                 return existingGem.gemDefinitionId === gemItem.gemDefinitionId;
             });
             if (isDuplicate) {
                 this.callbacks.onNotification("Cannot stack identical Support Gems.");
                 return;
             }
        }

        const invIndex = this.gameState.gemInventory.findIndex(i => i.id === gemItem.id);
        if (invIndex > -1) this.gameState.gemInventory.splice(invIndex, 1);

        let existingItem: ItemInstance | null = null;
        if (isSupport) {
            existingItem = activeSkill.supportGems[targetSubSlot];
            activeSkill.supportGems[targetSubSlot] = gemItem;
        } else {
            existingItem = activeSkill.activeGem;
            activeSkill.activeGem = gemItem;
            activeSkill.cooldownTimer = 0; 
        }

        if (existingItem) {
            this.gameState.gemInventory.push(existingItem);
        }
        
        this.saveGame();
        this.callbacks.onInventoryChange();
    }

    public unequipGem(skillIndex: number, isSupport: boolean, subSlotIndex: number) {
        const activeSkill = this.gameState.activeSkills[skillIndex];
        if (!activeSkill) return;

        let itemToUnequip: ItemInstance | null = null;
        if (isSupport) {
            itemToUnequip = activeSkill.supportGems[subSlotIndex];
            activeSkill.supportGems[subSlotIndex] = null;
        } else {
            itemToUnequip = activeSkill.activeGem;
            activeSkill.activeGem = null;
        }

        if (itemToUnequip) {
            this.gameState.gemInventory.push(itemToUnequip);
        }
        this.saveGame();
        this.callbacks.onInventoryChange();
    }

    public equipSupportToSkill(skillIndex: number) {
        if (!this.gameState.pendingSupportGem) return;
        const skill = this.gameState.activeSkills[skillIndex];
        const gem = this.gameState.pendingSupportGem;
        
        let emptySlot = skill.supportGems.findIndex(g => g === null);
        if (emptySlot === -1) emptySlot = 0; 

        const isDuplicate = skill.supportGems.some((existingGem, idx) => {
             if (idx === emptySlot && skill.supportGems[idx] === null) return false; 
             if (idx === emptySlot) return false; 
             if (!existingGem) return false;
             return existingGem.gemDefinitionId === gem.gemDefinitionId;
        });
        if (isDuplicate) {
             this.callbacks.onNotification("Cannot stack identical Support Gems.");
             return;
        }

        skill.supportGems[emptySlot] = gem;
        this.gameState.pendingSupportGem = null;
        this.gameState.isSelectingSupport = false;
        this.gameState.isPaused = false;
        this.gameState.lastFrameTime = performance.now();
        this.saveGame();
        this.callbacks.onInventoryChange();
    }

    public stashPendingSupportGem() {
        if (!this.gameState.pendingSupportGem) return;
        this.gameState.gemInventory.push(this.gameState.pendingSupportGem);
        this.callbacks.onNotification("Gem moved to Pouch");
        this.gameState.pendingSupportGem = null;
        this.gameState.isSelectingSupport = false;
        this.gameState.isPaused = false;
        this.gameState.lastFrameTime = performance.now();
        this.saveGame();
        this.callbacks.onInventoryChange();
    }

    public selectUpgrade(upgrade: UpgradeDefinition) {
        if (upgrade.gemItem) {
            const gemDef = SKILL_DATABASE[upgrade.gemItem.gemDefinitionId!];
            if (gemDef.type === 'active') {
                const emptyIndex = this.gameState.activeSkills.findIndex(s => s.activeGem === null);
                if (emptyIndex !== -1) {
                    this.gameState.activeSkills[emptyIndex].activeGem = upgrade.gemItem;
                    this.gameState.activeSkills[emptyIndex].cooldownTimer = 0;
                    this.callbacks.onNotification(`Learned ${gemDef.name}!`);
                } else {
                    this.gameState.gemInventory.push(upgrade.gemItem);
                    this.callbacks.onNotification(`${gemDef.name} added to Bag`);
                }
            } else if (gemDef.type === 'support') {
                const hasActiveSkill = this.gameState.activeSkills.some(s => s.activeGem !== null);
                if (hasActiveSkill) {
                    this.gameState.pendingSupportGem = upgrade.gemItem;
                    this.gameState.isSelectingSupport = true;
                    return; 
                } else {
                    this.gameState.gemInventory.push(upgrade.gemItem);
                    this.callbacks.onNotification(`Stashed ${gemDef.name} (No Active Skills)`);
                }
            }
        } else {
            this.chosenUpgrades.push(upgrade);
            if (upgrade.stat === 'maxHp' && upgrade.value) {
                this.currentHp += upgrade.value;
            }
            this.recalculateStats();
        }

        this.gameState.level += 1;
        this.gameState.xp -= this.gameState.nextLevelXp;
        // Steep XP Curve: 150 * (1.25 ^ (Level - 1))
        this.gameState.nextLevelXp = Math.floor(150 * Math.pow(1.25, this.gameState.level - 1));
        this.gameState.isPaused = false;
        this.gameState.lastFrameTime = performance.now();
        
        this.saveGame();
        this.updateHud();
    }

    private triggerLevelUp() {
        this.gameState.isPaused = true;
        const ownedActiveGemIds: string[] = [];
        
        this.gameState.activeSkills.forEach(s => {
            if (s.activeGem && s.activeGem.gemDefinitionId) {
                ownedActiveGemIds.push(s.activeGem.gemDefinitionId);
            }
        });
        this.gameState.gemInventory.forEach(item => {
            if (item.gemDefinitionId) {
                const def = SKILL_DATABASE[item.gemDefinitionId];
                if (def && def.type === 'active') {
                    ownedActiveGemIds.push(item.gemDefinitionId);
                }
            }
        });

        const options = generateRewards(this.gameState.level, ownedActiveGemIds);
        this.callbacks.onLevelUp(options);
    }

    private gainXp(amount: number) {
        // Level Gap Penalty Logic
        let penaltyMultiplier = 1.0;
        // Default Tier 1 if hideout or unknown
        const mapTier = this.gameState.worldState === 'RUN' ?
        this.gameState.currentMapStats.tier : 1; 
        const playerLevel = this.gameState.level;
        
        // If Player is significantly higher than map tier
        if (playerLevel > mapTier + 3) {
            // Severe Penalty: (MapTier / PlayerLevel) ^ 4
            penaltyMultiplier = Math.pow(mapTier / playerLevel, 4);
        }

        // Apply Stats Multiplier (Wisdom, etc)
        const xpMult = this.playerStats.getStatValue('xpGain');
        const effectiveXp = Math.max(1, Math.floor(amount * penaltyMultiplier * xpMult));
        
        this.gameState.xp += effectiveXp;
        if (this.gameState.xp >= this.gameState.nextLevelXp) {
            this.triggerLevelUp();
        } else {
            this.updateHud();
        }
    }

    private spawnXPOrb(x: number, y: number, value: number) {
        const orb = this.xpOrbs.find(o => !o.active);
        if (orb) {
            orb.active = true;
            orb.x = x + (Math.random() - 0.5) * 20;
            orb.y = y + (Math.random() - 0.5) * 20;
            orb.value = value;
            orb.magnetized = false;
            
            // Tier Logic
            if (value >= 500) orb.tier = 'gold';
            else if (value >= 150) orb.tier = 'pink';
            else if (value >= 50) orb.tier = 'purple';
            else orb.tier = 'blue';
        }
    }

    // --- GAMEPLAY HELPERS ---

    private checkCollision(rect1: Entity, rect2: Entity) {
        return (rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x && rect1.y < rect2.y + rect2.height && rect1.y + rect1.height > rect2.y);
    }

    private generateLoot(x: number, y: number, minRarity: ItemRarity): Loot {
         const iLvl = this.gameState.worldState === 'RUN' ?
         this.gameState.currentMapStats.tier : 1;
         const item = generateItem('random', iLvl, minRarity);
         
         return {
             id: Math.random(), active: true, x, y, width: 20, height: 20, color: 'white',
             itemData: item,
             rarity: minRarity, lifeTime: 30, autoCollectRadius: 50
         };
    }

    private handleEnemyDeath(enemy: Enemy) {
        enemy.active = false;
        this.gameState.currentKills++;
        const isBoss = enemy.type === 'boss' || enemy.isElite;

        // 1. 掉落经验球 (所有模式)
        this.spawnXPOrb(enemy.x, enemy.y, 10);
        
        // 2. 掉落装备 (无尽模式仅 Boss 掉落，防卡顿)
        if (this.gameState.isEndlessMode) {
            if (isBoss) {
                for(let i=0; i<5; i++) this.loot.push(this.generateLoot(enemy.x, enemy.y, 'rare'));
            }
        } else {
            // 普通模式正常掉落
            const dropChance = 0.02 * (this.gameState.currentMapStats.rarityMult || 1);
            if (Math.random() < dropChance || isBoss) {
                this.loot.push(this.generateLoot(enemy.x, enemy.y, isBoss ? 'unique' : 'normal'));
            }
        }

        // Remove associated bubble if exists
        if (enemy.modifiers.includes('temporal')) {
            const bubbleIndex = this.gameState.groundEffects.findIndex(g => g.type === 'bubble' && g.sourceId === enemy.id);
            if (bubbleIndex > -1) {
                this.gameState.groundEffects.splice(bubbleIndex, 1);
            }
        }

        // Expedition Progress
        if (this.gameState.expeditionActive) {
            
            // Portal Logic
            const floorObjectiveMet = this.gameState.currentKills >= this.gameState.targetKills;
            const isBossKill = enemy.type === 'boss';
            
            const hasPortal = this.gameState.interactables.some(i => i.type.includes('portal'));
            if (!hasPortal) {
                if (this.gameState.currentFloor < 5 || this.gameState.isEndlessMode) {
                    if (floorObjectiveMet) {
                        this.gameState.interactables.push({
                            id: Math.random(),
                            active: true,
                            type: 'portal_next',
                            x: enemy.x,
                            y: enemy.y,
                            width: 60,
                            height: 80,
                            color: '#3b82f6',
                            interactionRadius: 80,
                            label: 'Descend'
                        });
                        this.callbacks.onNotification("Portal Opened");
                        // Auto-magnetize orbs
                        this.xpOrbs.forEach(o => { if (o.active) o.magnetized = true; });
                    }
                } else if (this.gameState.currentFloor === 5 && !this.gameState.isEndlessMode) {
                    if (isBossKill) {
                        this.gameState.interactables.push({
                            id: Math.random(),
                            active: true,
                            type: 'portal_return',
                            x: enemy.x,
                            y: enemy.y,
                            width: 60,
                            height: 80,
                            color: '#22c55e',
                            interactionRadius: 80,
                            label: 'Return'
                        });
                        this.callbacks.onNotification("Victory!");
                        this.xpOrbs.forEach(o => { if (o.active) o.magnetized = true; });
                    }
                }
            }
            this.updateHud();
        }
    }
  
    private spawnFloatingText(x: number, y: number, text: string, color: string = 'white', scale: number = 1.0) {
        const textObj = this.floatingTexts.find(t => !t.active);
        if (textObj) {
            textObj.active = true;
            textObj.x = x + Math.random() * 20 - 10;
            textObj.y = y;
            textObj.text = text;
            textObj.lifeTime = FLOATING_TEXT_LIFETIME;
            textObj.velocityY = FLOATING_TEXT_SPEED;
            textObj.color = color;
            textObj.scale = scale;
        }
    }
  
    private triggerShake(duration: number = 0.3) {
        this.gameState.shakeTimer = duration;
    }

    private spawnEnemy(type: EnemyType) {
        if (!this.canvas) return;
        const enemy = this.enemies.find(e => !e.active);
        if (!enemy) return; 
    
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        const angle = Math.random() * Math.PI * 2;
        const viewportRadius = Math.sqrt(Math.pow(canvasWidth / CAMERA_ZOOM / 2, 2) + Math.pow(canvasHeight / CAMERA_ZOOM / 2, 2));
        const radius = viewportRadius + 100;
        
        const stats = ENEMY_STATS[type];
        const mapStats = this.gameState.currentMapStats;
        const isElite = Math.random() < 0.05 && type !== 'boss'; 
        enemy.active = true;
        enemy.type = type;
        enemy.isElite = isElite;
        enemy.knockbackVelocity = { x: 0, y: 0 };
        
        const hpMult = isElite ? 2.0 : 1.0;
        const sizeMult = isElite ? 1.2 : 1.0;
        
        enemy.width = stats.size * sizeMult;
        enemy.height = stats.size * sizeMult;
        enemy.hp = stats.hp * mapStats.monsterHealthMult * hpMult;
        enemy.maxHp = enemy.hp;
        enemy.speed = stats.speed;
        // Modifiers Logic
        enemy.modifiers = [];
        enemy.resistances = { physical: 0, fire: 0, cold: 0, lightning: 0, chaos: 0 };
        enemy.statuses = {};
        // Reset statuses

        // Reset timers
        enemy.trailTimer = 0;
        enemy.blastTimer = 0;

        if (isElite || (type === 'boss') || this.gameState.currentFloor >= 3) {
            // Chance to add random modifiers
            const modCount = type === 'boss' ?
            3 : isElite ? 2 : 1;
            
            for(let i=0; i<modCount; i++) {
                if (Math.random() < 0.7) {
                    const mod = ENEMY_MODIFIERS[Math.floor(Math.random() * ENEMY_MODIFIERS.length)];
                    if (!enemy.modifiers.includes(mod)) {
                        enemy.modifiers.push(mod);
                        // Apply Stat changes immediately
                        if (mod === 'fire_res') enemy.resistances.fire = 0.5;
                        if (mod === 'cold_res') enemy.resistances.cold = 0.5;
                        if (mod === 'lightning_res') enemy.resistances.lightning = 0.5;
                        if (mod === 'chaos_res') enemy.resistances.chaos = 0.5;

                        // Temporal Bubble spawn logic
                        if (mod === 'temporal') {
                            this.gameState.groundEffects.push({
                                id: 
                                uuid(),
                                x: enemy.x + enemy.width/2,
                                y: enemy.y + enemy.height/2,
                                radius: 250,
                                type: 'bubble',
                                duration: 99999, // Permanent until death
                                sourceId: enemy.id
                            });
                        }
                    }
                }
            }
        }
        
        enemy.x = this.gameState.playerWorldPos.x + Math.cos(angle) * radius;
        enemy.y = this.gameState.playerWorldPos.y + Math.sin(angle) * radius;
    
        if (type === 'boss') {
            // Increased Attack Delay: Boss 2.0 -> 2.4
            enemy.attackTimer = 2.4;
            this.callbacks.onNotification("BOSS SPAWNED!");
        } else {
            // Ensure non-bosses don't have an attack timer
            enemy.attackTimer = undefined;
        }
    }

    private spawnBullet(x: number, y: number, angle: number, owner: 'player' | 'enemy', speed: number, size: number, color: string, damageType: DamageType, damage?: number, pierce: number = 0, ailmentChance: number = 0) {
        const bullet = this.bullets.find(b => !b.active);
        if (!bullet) return;
        bullet.active = true;
        bullet.x = x - size/2;
        bullet.y = y - size/2;
        bullet.width = size;
        bullet.height = size;
        bullet.vx = Math.cos(angle) * speed;
        bullet.vy = Math.sin(angle) * speed;
        bullet.lifeTime = BULLET_LIFETIME;
        bullet.owner = owner;
        bullet.color = color; 
        bullet.hitIds = [];
        bullet.damageType = damageType;
        bullet.damage = damage;
        bullet.pierce = pierce;
        bullet.ailmentChance = ailmentChance;
    }

    // --- SKILL CASTING SYSTEM ---

    private getDamageTypeFromTags(tags: SkillTag[]): DamageType {
        if (tags.includes('fire')) return 'fire';
        if (tags.includes('cold')) return 'cold';
        if (tags.includes('lightning')) return 'lightning';
        if (tags.includes('projectile') && !tags.includes('physical')) return 'physical';
        // Default proj
        return 'physical';
        // Fallback
    }

    private castSkill(skill: ResolvedSkill, speedMult: number) {
        const px = this.gameState.playerWorldPos.x + PLAYER_SIZE/2;
        const py = this.gameState.playerWorldPos.y + PLAYER_SIZE/2;
        const dmgType = this.getDamageTypeFromTags(skill.tags);

        // Slow affects cooldown, but visually impacts projectile speed slightly?
        // No, standard logic keeps speed constant.
        
        if (skill.definition.id === 'cyclone') {
            const radius = skill.stats.areaOfEffect;
            this.visualEffects.push({
                id: Math.random(),
                active: true,
                type: 'cyclone',
                x: px,
                y: py,
                radius: radius,
                lifeTime: 0.4, // Increased slightly for visual fade
                maxLifeTime: 0.4,
                color: '#00ffff',
                angle: Math.random() * Math.PI * 2,
                spinSpeed: 20
            });
            for (const enemy of this.enemies) {
                if (!enemy.active) continue;
                const cx = enemy.x + enemy.width/2;
                const cy = enemy.y + enemy.height/2;
                const dist = Math.sqrt((cx - px)**2 + (cy - py)**2);
                if (dist < radius + enemy.width/2) {
                     this.applySkillDamage(enemy, skill, dmgType);
                     this.applySkillDamage(enemy, skill, dmgType);
                     this.applySkillDamage(enemy, skill, dmgType);
                }
            }
            return;
        }

        // --- FLAME RING LOGIC ---
        if (skill.definition.id === 'flame_ring') {
            const radius = skill.stats.areaOfEffect;
            // Expanding Flame Ring Visual with Physics
            this.visualEffects.push({
                id: Math.random(),
                active: true,
                type: 'flame_ring_visual',
                x: px,
                y: py,
                radius: 10, // Start small
                lifeTime: 0.6,
                maxLifeTime: 0.6,
                color: '#f97316',
                followPlayer: true,
                expansionRate: 15 // Initial burst speed
            });
            for (const enemy of this.enemies) {
                if (!enemy.active) continue;
                const cx = enemy.x + enemy.width/2;
                const cy = enemy.y + enemy.height/2;
                const dist = Math.sqrt((cx - px)**2 + (cy - py)**2);
                if (dist < radius + enemy.width/2) {
                     this.applySkillDamage(enemy, skill, dmgType);
                     // KNOCKBACK LOGIC
                     const dx = cx - px;
                     const dy = cy - py;
                     const mag = Math.sqrt(dx*dx + dy*dy);
                     const nx = mag > 0 ?
                     dx/mag : 1;
                     const ny = mag > 0 ? dy/mag : 0;
                     
                     let force = skill.stats.knockback;
                     if (enemy.type === 'boss') force *= 0.1; // Boss resistance
                     if (enemy.type === 'tank') force *= 0.5;
                     // Tank resistance
                     
                     if (enemy.knockbackVelocity) {
                         enemy.knockbackVelocity.x += nx * force;
                         enemy.knockbackVelocity.y += ny * force;
                     }
                }
            }
            return;
        }

        let nearest: Enemy | null = null;
        let minDistSq = Infinity;
        // VISUAL RANGE TARGETING
        // Visual radius is canvas half-width / zoom + margin.
        // Assuming typical mobile width ~400px (though canvas width varies)
        const canvasWidth = this.canvas ?
        this.canvas.width : 400;
        const visualRadius = (canvasWidth / 2) / CAMERA_ZOOM + 100;
        // 100px buffer
        const visualRadiusSq = visualRadius * visualRadius;
        for (const enemy of this.enemies) {
          if (!enemy.active) continue;
          const cx = enemy.x + enemy.width/2;
          const cy = enemy.y + enemy.height/2;
          const distSq = (cx - px)**2 + (cy - py)**2;
          
          if (distSq > visualRadiusSq) continue;
          // Skip off-screen enemies

          if (distSq < minDistSq) { minDistSq = distSq;
          nearest = enemy; }
        }

        if (skill.tags.includes('projectile')) {
            if (!nearest && skill.definition.id !== 'nova') {
                 if (!this.joystickState.active) return;
            }

            let baseAngle = 0;
            if (nearest) {
                const tx = nearest.x + nearest.width/2;
                const ty = nearest.y + nearest.height/2;
                baseAngle = Math.atan2(ty - py, tx - px);
            } else {
                if (this.joystickState.active) {
                     const { vector } = this.joystickState;
                     baseAngle = Math.atan2(vector.y, vector.x);
                }
            }
            
            const count = Math.floor(skill.stats.projectileCount);
            const safeCount = Math.min(count, 50);

            const spreadRad = skill.stats.projectileSpread * (Math.PI / 180);
            const startAngle = baseAngle - ((safeCount - 1) * spreadRad) / 2;
            const size = 15;
            const color = skill.definition.id === 'fireball' ? '#f97316' : '#60a5fa';
            for (let i = 0; i < safeCount; i++) {
                this.spawnBullet(px, py, (safeCount > 1 ? startAngle + i * spreadRad : baseAngle), 'player', skill.stats.projectileSpeed, size, color, dmgType, undefined, 0, skill.stats.ailmentChance);
            }
        } 
        else if (skill.tags.includes('area')) {
             const radius = skill.stats.areaOfEffect ||
             60;
             for (const enemy of this.enemies) {
                 if (!enemy.active) continue;
                 const cx = enemy.x + enemy.width/2;
                 const cy = enemy.y + enemy.height/2;
                 const dist = Math.sqrt((cx - px)**2 + (cy - py)**2);
                 if (dist < radius + enemy.width/2) {
                      this.applySkillDamage(enemy, skill, dmgType);
                 }
             }
        }
    }

    private castBasicAttack(skillInstance: ActiveSkillInstance) {
        let nearest: Enemy |
        null = null;
        let minDistSq = Infinity;
        const px = this.gameState.playerWorldPos.x + PLAYER_SIZE/2;
        const py = this.gameState.playerWorldPos.y + PLAYER_SIZE/2;
        // VISUAL RANGE TARGETING for Basic Attack
        const canvasWidth = this.canvas ?
        this.canvas.width : 400;
        const visualRadius = (canvasWidth / 2) / CAMERA_ZOOM + 100; 
        const visualRadiusSq = visualRadius * visualRadius;
        for (const enemy of this.enemies) {
          if (!enemy.active) continue;
          const cx = enemy.x + enemy.width/2;
          const cy = enemy.y + enemy.height/2;
          const distSq = (cx - px)**2 + (cy - py)**2;

          if (distSq > visualRadiusSq) continue;
          // Skip off-screen

          if (distSq < minDistSq) { minDistSq = distSq;
          nearest = enemy; }
        }

        // Keep 400 range max limit if desired, or let visual range handle it.
        // Keeping legacy logic constraint:
        if (nearest && minDistSq > 400 * 400) nearest = null;
        if (!this.joystickState.active && !nearest) return;

        let angle = 0;
        if (nearest) {
            angle = Math.atan2((nearest.y + nearest.height/2) - py, (nearest.x + nearest.width/2) - px);
        } else {
            angle = Math.atan2(this.joystickState.vector.y, this.joystickState.vector.x);
        }

        const dmg = this.playerStats.getStatValue('bulletDamage');
        const count = Math.max(1, Math.floor(this.playerStats.getStatValue('projectileCount')));
        const ailmentChance = this.playerStats.getStatValue('ailmentChance'); // Base chance for basic attack

        const speed = 400;
        const spreadRad = 0.1; 
        const startAngle = angle - ((count - 1) * spreadRad) / 2;
        for (let i = 0; i < count; i++) {
            this.spawnBullet(px, py, startAngle + i * spreadRad, 'player', speed, 12, '#93c5fd', 'physical', dmg, 0, ailmentChance);
        }
    }

    private applySkillDamage(e: Enemy, skill: ResolvedSkill, type: DamageType) {
        const isCrit = Math.random() < this.playerStats.getStatValue('critChance');
        const mult = isCrit ? this.playerStats.getStatValue('critMultiplier') : 1.0;
        const damage = skill.stats.damage * mult;
        this.applyDamage(e, damage, isCrit, type, this.gameState.playerWorldPos, skill.stats.ailmentChance);
    }

    private applyDamage(e: Enemy, rawAmount: number, isCrit: boolean, type: DamageType, sourcePos?: Vector2, chance: number = 0) {
         // 1. Evasive Check (30% Dodge)
         if (e.modifiers.includes('evasive')) {
             if (Math.random() < 0.3) {
                 this.spawnFloatingText(e.x + e.width/2, e.y, "DODGE", "#9ca3af", 1.0);
                 return;
             }
         }

         const cx = e.x + e.width/2;
         const cy = e.y + e.height/2;

         if (sourcePos) {
             const sx = sourcePos.x + PLAYER_SIZE/2;
             const sy = sourcePos.y + PLAYER_SIZE/2;
             const dist = Math.sqrt((cx-sx)**2 + (cy-sy)**2);
             // 2. Proximal Tangibility (Distance > 200 = Immune)
             if (e.modifiers.includes('proximal')) {
                 if (dist > 200) {
                     this.spawnFloatingText(e.x + e.width/2, e.y, "IMMUNE", "#a855f7", 1.0);
                     return;
                 }
             }

             // 3. Temporal Bubble Defense
             if (e.modifiers.includes('temporal')) {
                 if (dist > 250) {
                     this.spawnFloatingText(e.x + e.width/2, e.y, "BLOCKED", "#d8b4fe", 1.0);
                     return;
                 }
             }
         }

         // 4. Resistance Calculation
         let res = e.resistances[type] ||
         0;
         
         // 5. Armor Logic (Only Physical)
         if (type === 'physical' && e.modifiers.includes('armoured')) {
             res += 0.5;
         }

         // Shock: 50% Increased Damage Taken
         let damageMultiplier = 1.0;
         if (e.statuses['shocked']) {
             damageMultiplier = 1.5;
         }

         const finalDamage = Math.max(0, rawAmount * (1 - res) * damageMultiplier);
         // 6. Apply
         e.hp -= finalDamage;
         // AILMENT APPLICATION LOGIC
         if (chance > 0 && Math.random() < chance) {
             if (type === 'fire') {
                 e.statuses['ignited'] = 4.0;
                 // 4s ignite
                 this.spawnFloatingText(e.x + e.width/2, e.y - 20, "IGNITE", "#fb923c", 0.8);
             } else if (type === 'cold') {
                 e.statuses['chilled'] = 2.0;
                 // 2s chill
                 this.spawnFloatingText(e.x + e.width/2, e.y - 20, "CHILL", "#67e8f9", 0.8);
             } else if (type === 'lightning') {
                 e.statuses['shocked'] = 4.0;
                 // 4s shock
                 this.spawnFloatingText(e.x + e.width/2, e.y - 20, "SHOCK", "#fde047", 0.8);
             }
         }

         // Color mapping
         let color = 'white';
         if (type === 'fire') color = '#f97316'; // Orange
         else if (type === 'cold') color = '#06b6d4';
         // Cyan
         else if (type === 'lightning') color = '#facc15';
         // Yellow
         else if (type === 'chaos') color = '#d946ef';
         // Purple

         if (isCrit) color = '#ef4444';
         this.spawnFloatingText(e.x + e.width/2, e.y, Math.floor(finalDamage).toString(), isCrit ? '#f87171' : color, isCrit ? 1.5 : 1.0);
         if (e.hp <= 0) {
             this.handleEnemyDeath(e);
         }
    }

    private drawPlayer(ctx: CanvasRenderingContext2D, x: number, y: number, dt: number) {
        const time = Date.now() / 1000;
        const isMoving = this.joystickState.active;
        const facingLeft = this.joystickState.vector.x < 0;

        ctx.save();
        ctx.translate(x + PLAYER_SIZE / 2, y + PLAYER_SIZE / 2);
        // -- 1. Draw Shadow/Aura (Stationary relative to feet) --
        ctx.save();
        ctx.scale(1, 0.4);
        // Flatten Y
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.arc(0, 50, 20 + Math.sin(time * 3) * 2, 0, Math.PI * 2);
        ctx.fill();
        // Aura Glow
        const auraColor = 'rgba(34, 211, 238, 0.15)';
        // Cyan glow low opacity
        ctx.fillStyle = auraColor;
        ctx.beginPath();
        ctx.arc(0, 50, 35 + Math.sin(time * 2) * 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        // -- 2. Animation Math --
        // Idle breathing vs Walking bob
        const bobSpeed = isMoving ?
        15 : 3;
        const bobAmp = isMoving ? 3 : 1.5;
        const bobY = Math.sin(time * bobSpeed) * bobAmp;
        const sway = isMoving ? Math.cos(time * 10) * 3 : Math.sin(time * 1.5) * 1;
        // Apply flip based on direction
        if (facingLeft) ctx.scale(-1, 1);
        // Apply Bobbing
        ctx.translate(0, bobY);
        // -- 3. Back Arm (Holding Staff) --
        // Pivot point near shoulder
        ctx.save();
        ctx.translate(10, -5); 
        const staffRot = isMoving ? Math.sin(time * 10) * 0.2 : Math.sin(time * 1) * 0.05;
        ctx.rotate(staffRot);
        // Shaft
        ctx.strokeStyle = '#4b3b2c';
        // Dark wood
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 20);
        // Bottom of staff
        ctx.lineTo(0, -35);
        // Top of staff
        ctx.stroke();
        // Staff Head (Gem)
        const gemColor = '#22d3ee';
        // Cyan
        ctx.fillStyle = gemColor;
        ctx.shadowColor = gemColor;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, -35, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        // Reset shadow

        // Hand
        ctx.fillStyle = '#1e1b4b';
        // Glove color
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
        // -- 4. Robe Body --
        const robeDark = '#1e1b4b';
        // Deep Indigo
        const robeLight = '#312e81';
        // Lighter Indigo for highlights

        ctx.fillStyle = robeDark;
        ctx.beginPath();
        // Hood Top
        ctx.moveTo(0, -25);
        // Right Shoulder curve
        ctx.bezierCurveTo(15, -20, 20, 0, 15, 25);
        // Bottom hem (Swaying)
        ctx.bezierCurveTo(5 + sway, 28, -5 + sway, 28, -15, 25);
        // Left Shoulder curve
        ctx.bezierCurveTo(-20, 0, -15, -20, 0, -25);
        ctx.fill();
        // -- 5. Hood/Head Area --
        ctx.fillStyle = '#0f172a';
        // Darker inner hood
        ctx.beginPath();
        ctx.moveTo(0, -22);
        ctx.bezierCurveTo(10, -20, 12, -10, 0, -5);
        // Opening shape
        ctx.bezierCurveTo(-12, -10, -10, -20, 0, -22);
        ctx.fill();
        // -- 6. Glowing Eyes --
        const eyeColor = '#22d3ee';
        // Cyan
        ctx.fillStyle = eyeColor;
        // Left Eye
        ctx.beginPath();
        ctx.ellipse(-4, -14, 1.5, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        // Right Eye
        ctx.beginPath();
        ctx.ellipse(4, -14, 1.5, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        // -- 7. Front Arm (Casting/Idle) --
        ctx.fillStyle = robeLight;
        ctx.beginPath();
        ctx.ellipse(-12, 0 + (isMoving ? -sway : 0), 4, 10, -0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    private draw() {
        if (!this.canvas || !this.ctx) return;
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;

        ctx.clearRect(0, 0, width, height);
        ctx.save();
        // --- CAMERA TRANSFORMS ---
        ctx.translate(width / 2, height / 2);
        if (this.gameState.shakeTimer > 0) {
            const shakeMagnitude = 5;
            const dx = (Math.random() - 0.5) * 2 * shakeMagnitude;
            const dy = (Math.random() - 0.5) * 2 * shakeMagnitude;
            ctx.translate(dx, dy);
        }
        ctx.scale(CAMERA_ZOOM, CAMERA_ZOOM);
        
        const camX = this.gameState.playerWorldPos.x + PLAYER_SIZE/2;
        const camY = this.gameState.playerWorldPos.y + PLAYER_SIZE/2;
        ctx.translate(-camX, -camY);

        // --- DRAW WORLD ---
        const visibleWidth = width / CAMERA_ZOOM;
        const visibleHeight = height / CAMERA_ZOOM;
        const startX = Math.floor((camX - visibleWidth/2) / GRID_SIZE) * GRID_SIZE;
        const endX = Math.floor((camX + visibleWidth/2) / GRID_SIZE) * GRID_SIZE + GRID_SIZE;
        const startY = Math.floor((camY - visibleHeight/2) / GRID_SIZE) * GRID_SIZE;
        const endY = Math.floor((camY + visibleHeight/2) / GRID_SIZE) * GRID_SIZE + GRID_SIZE;

        const isRun = this.gameState.worldState === 'RUN';
        ctx.fillStyle = isRun ? '#1a1a1e' : '#f8fafc'; 
        ctx.fillRect(camX - visibleWidth/2 - 50, camY - visibleHeight/2 - 50, visibleWidth + 100, visibleHeight + 100);
        ctx.beginPath();
        ctx.strokeStyle = isRun ? '#3f3f46' : GRID_COLOR;
        ctx.lineWidth = 1;
        for (let x = startX; x <= endX; x += GRID_SIZE) {
            ctx.moveTo(x, startY);
            ctx.lineTo(x, endY);
        }
        for (let y = startY; y <= endY; y += GRID_SIZE) {
            ctx.moveTo(startX, y);
            ctx.lineTo(endX, y);
        }
        ctx.stroke();
        const drawSprite = (key: string, x: number, y: number, w: number, h: number, color: string) => {
            const img = this.images[key];
            if (img && this.assetsLoaded) {
                ctx.drawImage(img, x, y, w, h);
            } else {
                ctx.fillStyle = color;
                ctx.fillRect(x, y, w, h);
            }
        };
        // --- DRAW GROUND EFFECTS ---
        for (const effect of this.gameState.groundEffects) {
            ctx.save();
            ctx.translate(effect.x, effect.y);
            
            if (effect.type === 'fire_ground') {
                ctx.fillStyle = `rgba(249, 115, 22, ${0.3 + Math.sin(Date.now()/200)*0.1})`;
                ctx.beginPath();
                ctx.arc(0, 0, Math.max(0, effect.radius), 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#f97316';
                ctx.lineWidth = 2;
                ctx.stroke();
            } 
            else if (effect.type === 'ice_ground') {
                ctx.fillStyle = `rgba(6, 182, 212, 0.3)`;
                ctx.beginPath();
                ctx.arc(0, 0, Math.max(0, effect.radius), 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#cffafe';
                ctx.lineWidth = 2;
                ctx.stroke();
                // Ice texture
                ctx.fillStyle = 'white';
                for(let k=0; k<3; k++) {
                    ctx.fillRect(Math.random()*effect.radius - effect.radius/2, Math.random()*effect.radius - effect.radius/2, 4, 4);
                }
            } 
            else if (effect.type === 'lightning_ground') {
                 ctx.fillStyle = `rgba(168, 85, 247, 0.2)`;
                 ctx.beginPath();
                 ctx.arc(0, 0, Math.max(0, effect.radius), 0, Math.PI * 2);
                 ctx.fill();
                 if (Math.random() > 0.5) {
                    ctx.beginPath();
                    ctx.strokeStyle = '#facc15';
                    ctx.lineWidth = 2;
                    ctx.moveTo(-10, -10); ctx.lineTo(10, 10);
                    ctx.stroke();
                 }
            }
            else if (effect.type === 'bubble') {
                // Large temporal bubble
                const rot = Date.now()/1000;
                ctx.strokeStyle = '#a855f7';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.arc(0, 0, Math.max(0, effect.radius), 0, Math.PI * 2);
                ctx.stroke();
                ctx.fillStyle = 'rgba(168, 85, 247, 0.1)';
                ctx.fill();

                // Rotating internal ring
                ctx.beginPath();
                ctx.arc(0, 0, Math.max(0, effect.radius * 0.9), rot, rot + Math.PI);
                ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
            else if (effect.type === 'blast_warning') {
                // Expanding circle logic relative to remaining duration
                const pct = 1.0 - effect.duration;
                // 0 to 1 as it nears expiry (assuming 1s duration)
                ctx.fillStyle = `rgba(239, 68, 68, ${0.2 + pct*0.3})`;
                ctx.beginPath();
                ctx.arc(0, 0, Math.max(0, effect.radius), 0, Math.PI * 2);
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(0, 0, Math.max(0, effect.radius * pct), 0, Math.PI * 2);
                // Inner expanding circle
                ctx.strokeStyle = '#ef4444';
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            ctx.restore();
        }

        // --- DRAW NPCs ---
        for (const npc of this.gameState.npcs) {
            ctx.save();
            ctx.translate(npc.x + npc.width/2, npc.y + npc.height/2);
            
            // Draw Range Circle (Subtle)
            ctx.beginPath();
            ctx.arc(0, 0, npc.interactionRadius, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(34, 197, 94, 0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();
            // Draw NPC Body
            ctx.fillStyle = npc.color;
            ctx.beginPath();
            ctx.arc(0, 0, npc.width/2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.shadowColor = 'black';
            ctx.shadowBlur = 10;
            ctx.font = '24px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText("💰", 0, 2);

            // Name Tag
            ctx.fillStyle = '#22c55e';
            ctx.font = 'bold 12px sans-serif';
            ctx.shadowBlur = 0;
            ctx.fillText(npc.name, 0, -npc.height/2 - 10);

            ctx.restore();
        }

        // --- DRAW INTERACTABLES ---
        for (const int of this.gameState.interactables) {
            if (int.type === 'map_device') {
                ctx.save();
                ctx.translate(int.x + int.width/2, int.y + int.height/2);
                ctx.fillStyle = '#1e293b';
                ctx.beginPath();
                ctx.arc(0, 0, 40, 0, Math.PI * 2);
                ctx.fill();
                const t = Date.now() / 1000;
                ctx.strokeStyle = '#c026d3';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(0, 0, 30, t, t + Math.PI * 1.5);
                ctx.stroke();

                ctx.strokeStyle = '#e879f9';
                ctx.beginPath();
                ctx.arc(0, 0, 20, -t * 1.5, -t * 1.5 + Math.PI);
                ctx.stroke();
                ctx.restore();
            } else if (int.type.includes('portal')) {
                ctx.save();
                ctx.translate(int.x + int.width/2, int.y + int.height/2);
                ctx.fillStyle = int.color;
                ctx.shadowBlur = 20;
                ctx.shadowColor = int.color;
                // Rotating Portal
                const t = Date.now() / 500;
                ctx.scale(1 + Math.sin(t)*0.1, 1 + Math.sin(t)*0.1);

                ctx.beginPath();
                ctx.ellipse(0, 0, 20, 40, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        // --- DRAW XP ORBS (BATCHED) ---
        const orbPulse = Math.sin(Date.now() / 200) * 1.5;
        const orbConfigs = [
            { tier: 'blue' as XPOrbTier, color: '#3b82f6', radius: 4 },
            { tier: 'purple' as XPOrbTier, color: '#a855f7', radius: 5 },
            { tier: 'pink' as XPOrbTier, color: '#ec4899', radius: 6 },
            { tier: 'gold' as XPOrbTier, color: '#eab308', radius: 8 }
        ];
        for (const config of orbConfigs) {
            ctx.fillStyle = config.color;
            ctx.beginPath();
            
            const currentRadius = Math.max(1, config.radius + orbPulse);
            let hasOrbs = false;
            for (const orb of this.xpOrbs) {
                if (!orb.active || orb.tier !== config.tier) continue;
                if (orb.x < camX - visibleWidth/2 - 20 || orb.x > camX + visibleWidth/2 + 20 ||
                    orb.y < camY - visibleHeight/2 - 20 || orb.y > camY + visibleHeight/2 + 20) {
                     continue;
                }

                ctx.moveTo(orb.x + currentRadius, orb.y);
                ctx.arc(orb.x, orb.y, currentRadius, 0, Math.PI * 2);
                hasOrbs = true;
            }

            if (hasOrbs) {
                ctx.fill();
            }
        }

        // --- RENDER VISUAL EFFECTS ---
        for (const eff of this.visualEffects) {
            if (eff.type === 'cyclone') {
                ctx.save();
                ctx.translate(eff.x, eff.y);
                
                const angle = eff.angle || 0;
                const radius = eff.radius || 100;
                const lifeRatio = eff.lifeTime / eff.maxLifeTime;
                // Blend mode
                ctx.globalCompositeOperation = 'lighter';
                ctx.globalAlpha = Math.max(0, lifeRatio);
                
                // LAYER 1: Main Blades (Divine / Aether Style)
                ctx.save();
                ctx.rotate(angle);
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#00ffff'; // Cyan Glow

                for (let k = 0; k < 3; k++) {
                    ctx.save();
                    ctx.rotate((Math.PI * 2 / 3) * k);

                    // Gradient: White -> Cyan -> DarkBlue -> Transparent
                    const grad = ctx.createLinearGradient(0, 0, radius, 0);
                    grad.addColorStop(0, 'white');
                    grad.addColorStop(0.3, '#00ffff');
                    grad.addColorStop(0.7, '#00008b'); // Dark Blue
                    grad.addColorStop(1, 'rgba(0,0,139,0)');
                    ctx.fillStyle = grad;
                    
                    // High-light edge
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
                    ctx.lineWidth = 1;

                    // "Slash" Shape
                    ctx.beginPath();
                    // Start near center
                    ctx.moveTo(radius * 0.2, 0);
                    // Curve OUT to tip (Upper Edge)
                    ctx.bezierCurveTo(radius * 0.5, radius * 0.4, radius * 0.9, radius * 0.2, radius, 0);
                    // Curve BACK (Lower/Inner Edge)
                    ctx.bezierCurveTo(radius * 0.8, -radius * 0.1, radius * 0.4, -radius * 0.1, radius * 0.2, 0);
                    ctx.closePath();

                    ctx.fill();
                    ctx.stroke();
                    ctx.restore();
                }
                ctx.restore();
                // LAYER 2: Outer Wind (Lagging slightly behind)
                ctx.save();
                ctx.rotate(angle - 0.5);
                ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
                ctx.lineWidth = 2;
                ctx.shadowBlur = 0;
                for (let i = 0; i < 4; i++) {
                    ctx.beginPath();
                    // Random arcs at edge
                    const r = radius * (0.8 + Math.random() * 0.3);
                    const start = Math.random() * Math.PI * 2;
                    const len = 0.5 + Math.random();
                    ctx.arc(0, 0, Math.max(0, r), start, start + len);
                    ctx.stroke();
                }
                ctx.restore();
                // LAYER 3: Inner Core (Counter-rotating)
                ctx.save();
                ctx.rotate(-angle * 0.5);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.lineWidth = 1.5;
                for (let i = 0; i < 3; i++) {
                    ctx.beginPath();
                    const r = radius * (0.15 + Math.random() * 0.1);
                    const start = Math.random() * Math.PI * 2;
                    ctx.arc(0, 0, Math.max(0, r), start, start + 1.5);
                    ctx.stroke();
                }
                ctx.restore();
                // Reset
                ctx.globalCompositeOperation = 'source-over';
                ctx.globalAlpha = 1.0;
                ctx.restore();

            } else if (eff.type === 'hit') {
                ctx.save();
                ctx.translate(eff.x, eff.y);
                const progress = eff.lifeTime / eff.maxLifeTime;
                ctx.globalAlpha = progress;
                ctx.fillStyle = eff.color;
                ctx.beginPath();
                ctx.arc(0, 0, Math.max(0, eff.radius! * (1.5 - progress)), 0, Math.PI * 2);
                // Expanding
                ctx.fill();
                ctx.restore();
            } else if (eff.type === 'flame_ring_visual') {
                ctx.save();
                ctx.translate(eff.x, eff.y);
                const lifeRatio = eff.lifeTime / eff.maxLifeTime;
                const alpha = Math.max(0, lifeRatio);
                const currentRadius = eff.radius || 100;
                // Radius calculated in physics

                ctx.globalCompositeOperation = 'lighter';
                // 1. Dark Orange Shockwave
                ctx.beginPath();
                ctx.arc(0, 0, Math.max(0, currentRadius), 0, Math.PI * 2);
                ctx.lineWidth = 15 * alpha;
                ctx.strokeStyle = `rgba(255, 100, 0, ${alpha})`; 
                ctx.stroke();
                // 2. Bright Yellow Core
                ctx.beginPath();
                ctx.arc(0, 0, Math.max(0, currentRadius * 0.95), 0, Math.PI * 2);
                ctx.lineWidth = 5 * alpha;
                ctx.strokeStyle = `rgba(255, 200, 50, ${alpha})`;
                ctx.stroke();

                // 3. Faint Red Heat Wave
                ctx.beginPath();
                ctx.arc(0, 0, Math.max(0, currentRadius * 1.1), 0, Math.PI * 2);
                ctx.lineWidth = 20 * alpha;
                ctx.strokeStyle = `rgba(255, 50, 0, ${alpha * 0.2})`; 
                ctx.stroke();

                ctx.restore();
            } else if (eff.type === 'shockwave') {
                ctx.save();
                ctx.translate(eff.x, eff.y);
                const lifeRatio = eff.lifeTime / eff.maxLifeTime;
                const alpha = Math.max(0, lifeRatio);
                // Expanding Ring Logic
                // Start from small, expand to max radius
                const progress = 1.0 - lifeRatio;
                const currentRadius = (eff.radius || 100) * progress;

                ctx.globalCompositeOperation = 'lighter';
                // Outer Ring
                ctx.lineWidth = 8 * alpha;
                ctx.strokeStyle = `rgba(249, 115, 22, ${alpha})`; // Orange
                ctx.beginPath();
                ctx.arc(0, 0, Math.max(0, currentRadius), 0, Math.PI * 2);
                ctx.stroke();
                
                // Inner Glow
                ctx.lineWidth = 4 * alpha;
                ctx.strokeStyle = `rgba(255, 200, 100, ${alpha})`; // Light Orange
                ctx.beginPath();
                ctx.arc(0, 0, Math.max(0, currentRadius * 0.8), 0, Math.PI * 2);
                ctx.stroke();

                ctx.restore();
            }
        }
        
        // --- RENDER PARTICLES ---
        for (const p of this.gameState.particles) {
            ctx.save();
            ctx.translate(p.x, p.y);
            const lifeRatio = p.life / p.maxLife;
            ctx.globalAlpha = lifeRatio;
            // Lighter blending for fire particles
            if (p.color === '#f97316' || p.color === '#ef4444' || p.color === '#00ffff') {
                ctx.globalCompositeOperation = 'lighter';
            }
            
            ctx.fillStyle = p.color;
            ctx.beginPath();
            // Scale size by life
            const size = p.size * lifeRatio;
            ctx.arc(0, 0, size, 0, Math.PI * 2); // Round particles
            ctx.fill();
            ctx.restore();
        }

        // --- RENDER LOOT ---
        const time = Date.now();
        for (const l of this.loot) {
            if (!l.active) continue;
            let color = '#d4d4d8'; 
            if (l.rarity === 'magic') color = '#3b82f6'; 
            else if (l.rarity === 'rare') color = '#eab308';
            else if (l.rarity === 'unique') color = '#f97316'; 

            const cx = l.x + l.width / 2;
            const cy = l.y + l.height / 2;

            ctx.save();
            
            if (l.rarity === 'rare' || l.rarity === 'unique') {
                 const beamHeight = 80;
                 const beamGrad = ctx.createLinearGradient(cx, cy, cx, cy - beamHeight);
                 beamGrad.addColorStop(0, color);
                 beamGrad.addColorStop(1, 'rgba(255,255,255,0)');
                 
                 ctx.globalAlpha = 0.3;
                 ctx.fillStyle = beamGrad;
                 ctx.beginPath();
                 ctx.moveTo(cx - 10, cy);
                 ctx.lineTo(cx + 10, cy);
                 ctx.lineTo(cx + 15, cy - beamHeight);
                 ctx.lineTo(cx - 15, cy - beamHeight);
                 ctx.closePath();
                 ctx.fill();
                 ctx.globalAlpha = 1.0;
            }

            const pulse = Math.sin(time / 200) * 2;
            const radius = 15 + pulse;
            
            ctx.shadowBlur = 15;
            ctx.shadowColor = color;
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = color;
            ctx.globalAlpha = 0.2;
            ctx.fill();
            
            ctx.globalAlpha = 1.0;
            ctx.shadowBlur = 0;
            ctx.fillStyle = 'white';
            ctx.font = '20px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            let icon = "📦";
            if (l.itemData.type === 'gem') {
                icon = "💎";
            } else if (l.itemData.type === 'map') {
                icon = "📜";
            } else {
                switch(l.itemData.slot) {
                    case 'weapon': icon = "⚔️";
                    break;
                    case 'offhand': icon = "🛡️"; break;
                    case 'helmet': icon = "🪖"; break;
                    case 'body': icon = "👕"; break;
                    case 'gloves': icon = "🧤"; break;
                    case 'boots': icon = "👢"; break;
                    case 'ring1': 
                    case 'ring2': 
                    case 'amulet': icon = "💍";
                    break;
                }
            }
            ctx.fillText(icon, cx, cy);
            ctx.restore();
        }

        // Enemies
        let activeBoss: Enemy | null = null;
        for (const e of this.enemies) {
            if (!e.active) continue;
            if (e.x + e.width < camX - visibleWidth/2 || e.x > camX + visibleWidth/2 ||
                e.y + e.height < camY - visibleHeight/2 || e.y > camY + visibleHeight/2) {
                 if (e.type === 'boss') activeBoss = e;
                 continue;
            }
            
            let key = 'enemy';
            if (e.type === 'fast') key = 'enemyFast';
            if (e.type === 'tank') key = 'enemyTank';
            if (e.type === 'boss') { key = 'enemyBoss'; activeBoss = e;
            }
            
            if (e.modifiers.includes('ghostly')) ctx.globalAlpha = 0.6;
            drawSprite(key, e.x, e.y, e.width, e.height, ENEMY_COLOR);
            
            ctx.globalAlpha = 1.0; 

            // DRAW STATUS EFFECTS
            if (Object.keys(e.statuses).length > 0) {
                const cx = e.x + e.width/2;
                const cy = e.y + e.height/2;
                
                if (e.statuses['ignited']) {
                    ctx.strokeStyle = '#f97316';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.arc(cx, cy, e.width/2 + 5, 0, Math.PI*2);
                    ctx.stroke();
                }
                if (e.statuses['chilled']) {
                    ctx.strokeStyle = '#22d3ee';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.arc(cx, cy, e.width/2 + 8, 0, Math.PI*2);
                    ctx.stroke();
                }
                if (e.statuses['shocked']) {
                    ctx.strokeStyle = '#facc15';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.arc(cx, cy, e.width/2 + 11, 0, Math.PI*2);
                    ctx.stroke();
                }
            }

            if (e.isElite) {
                ctx.strokeStyle = ELITE_COLOR;
                ctx.lineWidth = 3;
                ctx.strokeRect(e.x - 2, e.y - 2, e.width + 4, e.height + 4);
            }

            if (e.modifiers.includes('berserker') && e.hp < (e.maxHp || 100) * 0.5) {
                ctx.strokeStyle = '#ef4444';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(e.x + e.width/2, e.y + e.height/2, e.width/1.5, 0, Math.PI*2);
                ctx.stroke();
            }

            if (e.modifiers.includes('proximal')) {
                ctx.strokeStyle = '#a855f7';
                ctx.lineWidth = 2;
                ctx.beginPath();
                const t = Date.now()/300;
                ctx.arc(e.x + e.width/2, e.y + e.height/2, e.width + Math.sin(t)*5, 0, Math.PI*2);
                ctx.stroke();
            }

            if (e.type !== 'boss' && e.hp < (e.maxHp || e.hp)) {
                const barW = e.width;
                const barH = 4;
                const barX = e.x;
                const barY = e.y - 8;
                ctx.fillStyle = '#1f2937';
                ctx.fillRect(barX, barY, barW, barH);
                ctx.fillStyle = '#ef4444';
                ctx.fillRect(barX, barY, barW * (e.hp / (e.maxHp || 1)), barH);
            }
        }

        for (const b of this.bullets) {
            if (!b.active) continue;
            if (b.owner === 'player' && b.damageType === 'fire') {
                // --- FIREBALL RENDER ---
                const cx = b.x + b.width / 2;
                const cy = b.y + b.height / 2;
                
                ctx.save();
                ctx.globalCompositeOperation = 'lighter';
                // Projectile Head
                const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 15);
                grad.addColorStop(0, 'white');
                grad.addColorStop(0.4, 'yellow');
                grad.addColorStop(1, 'rgba(255, 0, 0, 0)');

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(cx, cy, 20, 0, Math.PI * 2);
                ctx.fill();

                ctx.globalCompositeOperation = 'source-over';
                ctx.restore();
            } else {
                const key = b.owner === 'enemy' ? 'bulletBoss' : 'bullet';
                const color = b.color ? b.color : (b.owner === 'enemy' ? BULLET_BOSS_COLOR : '#facc15');
                drawSprite(key, b.x, b.y, b.width, b.height, color);
            }
        }

        // Draw Player and Invulnerability Effect
        if (this.gameState.playerInvulnerabilityTimer > 0) {
            if (Math.floor(Date.now() / 100) % 2 === 0) {
                this.drawPlayer(ctx, this.gameState.playerWorldPos.x, this.gameState.playerWorldPos.y, 0);
            }
        } else {
             this.drawPlayer(ctx, this.gameState.playerWorldPos.x, this.gameState.playerWorldPos.y, 0);
        }

        for (const t of this.floatingTexts) {
            if (!t.active) continue;
            ctx.globalAlpha = t.lifeTime / FLOATING_TEXT_LIFETIME; 
            ctx.font = `900 ${14 * t.scale}px monospace`;
            ctx.fillStyle = 'black';
            ctx.fillText(t.text, t.x + 2, t.y + 2);
            ctx.fillStyle = t.color;
            ctx.fillText(t.text, t.x, t.y);
            ctx.globalAlpha = 1.0;
        }

        ctx.restore(); 

        if (activeBoss) {
            const barW = Math.min(width * 0.8, 400);
            const barH = 20;
            const barX = (width - barW) / 2;
            const barY = 80; 
    
            ctx.fillStyle = '#27272a';
            ctx.fillRect(barX, barY, barW, barH);
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#000';
            ctx.strokeRect(barX, barY, barW, barH);
            const pct = Math.max(0, activeBoss.hp / (activeBoss.maxHp || 1));
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(barX, barY, barW * pct, barH);
            ctx.fillStyle = 'white';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText("THE BUTCHER", width/2, barY - 5);
            ctx.textAlign = 'left';
        }
    
        if (this.joystickState.active && !this.gameState.isGameOver && !this.gameState.isPaused) {
            const { origin, current } = this.joystickState;
            ctx.beginPath();
            ctx.arc(origin.x, origin.y, JOYSTICK_MAX_RADIUS, 0, Math.PI*2);
            ctx.fillStyle = JOYSTICK_BASE_COLOR;
            ctx.fill();
            const dx = current.x - origin.x, dy = current.y - origin.y;
            const dist = Math.sqrt(dx*dx+dy*dy);
            let hx = current.x, hy = current.y;
            if (dist > JOYSTICK_MAX_RADIUS) {
                const a = Math.atan2(dy, dx);
                hx = origin.x + Math.cos(a)*JOYSTICK_MAX_RADIUS;
                hy = origin.y + Math.sin(a)*JOYSTICK_MAX_RADIUS;
            }
            ctx.beginPath();
            ctx.arc(hx, hy, 20, 0, Math.PI*2);
            ctx.fillStyle = JOYSTICK_HANDLE_COLOR;
            ctx.fill();
        }
    
        if (!this.gameState.isGameOver) {
            const activeGem = this.gameState.activeSkills[0].activeGem;
            const skillName = activeGem ? activeGem.name : "Unarmed";

            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(10, 50, 160, 65);
            ctx.fillStyle = 'white';
            ctx.font = '12px monospace';
            ctx.fillText(`FPS: ${this.timers.currentFps}`, 20, 65);
            
            const enemyCount = this.enemies.filter(e => e.active).length;
            ctx.fillText(`Enemies: ${enemyCount}${this.gameState.currentMaxEnemies ? '/' + this.gameState.currentMaxEnemies : ''}`, 20, 80);
            
            if (isRun) {
                ctx.fillStyle = '#fde047';
                ctx.fillText(`Map: +${Math.round((this.gameState.currentMapStats.packSizeMult-1)*100)}% Size`, 20, 95);
            } else {
                ctx.fillStyle = '#c026d3';
                ctx.fillText(`Hideout Safe Zone`, 20, 95);
            }
            
            ctx.fillStyle = '#fb923c';
            ctx.fillText(`Main: ${skillName}`, 20, 110);
        }
    }

    private update(time: number) {
        const now = time;
        const dt = Math.min((now - this.gameState.lastFrameTime) / 1000, 0.1);
        this.gameState.lastFrameTime = now;

        // FPS Calc
        this.timers.frames++;
        if (now > this.timers.fpsUpdate + 1000) {
            this.timers.currentFps = this.timers.frames;
            this.timers.frames = 0;
            this.timers.fpsUpdate = now;
        }

        if (this.gameState.isPaused || this.gameState.isGameOver) return;

        // --- 1. PLAYER MOVEMENT ---
        if (this.joystickState.active) {
            const speed = this.playerStats.getStatValue('moveSpeed') * SPEED_SCALAR;
            this.gameState.velocity.x = this.joystickState.vector.x * speed;
            this.gameState.velocity.y = this.joystickState.vector.y * speed;
            
            this.gameState.playerWorldPos.x += this.gameState.velocity.x * dt;
            this.gameState.playerWorldPos.y += this.gameState.velocity.y * dt;
        }

        // --- 2. SKILL COOLDOWNS & AUTO-CAST ---
        this.gameState.activeSkills.forEach((skill, index) => {
            if (!skill.activeGem) return;
            
            if (skill.cooldownTimer > 0) {
                skill.cooldownTimer -= dt;
            }

            // Simple Auto-Cast Logic
            if (skill.cooldownTimer <= 0) {
                const resolved = SkillManager.resolveSkill(skill, this.playerStats);
                if (resolved) {
                    // Cast
                    this.castSkill(resolved, 1.0);
                    skill.cooldownTimer = 1.0 / resolved.stats.attackRate;
                }
            }
        });

        // --- 3. ENTITY UPDATES ---
        
        // Enemies
        const playerRect = { x: this.gameState.playerWorldPos.x, y: this.gameState.playerWorldPos.y, width: PLAYER_SIZE, height: PLAYER_SIZE, id: 'player', active: true, color: '' };
        
        this.enemies.forEach(e => {
            if (!e.active) return;
            
            // Apply Status Effects
            if (e.statuses['ignited']) {
                e.hp -= 2 * dt; // Burn
                e.statuses['ignited'] -= dt;
                if (e.statuses['ignited'] <= 0) delete e.statuses['ignited'];
            }
            if (e.statuses['chilled']) {
                e.statuses['chilled'] -= dt;
                if (e.statuses['chilled'] <= 0) delete e.statuses['chilled'];
            }
            if (e.statuses['shocked']) {
                e.statuses['shocked'] -= dt;
                if (e.statuses['shocked'] <= 0) delete e.statuses['shocked'];
            }

            // Movement
            let speed = e.speed;
            if (e.statuses['chilled']) speed *= 0.5;
            
            const dx = this.gameState.playerWorldPos.x - e.x;
            const dy = this.gameState.playerWorldPos.y - e.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if (dist > 0) {
                e.x += (dx / dist) * speed * dt;
                e.y += (dy / dist) * speed * dt;
            }

            // Knockback Decay
            if (Math.abs(e.knockbackVelocity!.x) > 1 || Math.abs(e.knockbackVelocity!.y) > 1) {
                e.x += e.knockbackVelocity!.x * dt;
                e.y += e.knockbackVelocity!.y * dt;
                e.knockbackVelocity!.x *= 0.9;
                e.knockbackVelocity!.y *= 0.9;
            }

            // Player Collision (Damage)
            if (this.checkCollision(playerRect, e)) {
                if (this.gameState.playerInvulnerabilityTimer <= 0) {
                    // Take Damage
                    const dmg = 10 * this.gameState.currentMapStats.monsterDamageMult; // Simplified
                    // Defense calc
                    const def = this.playerStats.getStatValue('defense');
                    const mitigation = def / (def + 100); // Simple formula
                    const taken = Math.max(1, dmg * (1 - mitigation));
                    
                    this.currentHp -= taken;
                    this.triggerShake(0.2);
                    this.gameState.playerInvulnerabilityTimer = 0.5;
                    this.updateHud();
                    
                    if (this.currentHp <= 0) {
                        this.gameState.isGameOver = true;
                        this.callbacks.onGameOver(true);
                    }
                }
            }
            
            if (e.hp <= 0) {
                this.handleEnemyDeath(e);
            }
        });

        // Invulnerability Tick
        if (this.gameState.playerInvulnerabilityTimer > 0) {
            this.gameState.playerInvulnerabilityTimer -= dt;
        }

        // Bullets
        this.bullets.forEach(b => {
            if (!b.active) return;
            b.x += b.vx * dt;
            b.y += b.vy * dt;
            b.lifeTime -= dt;
            if (b.lifeTime <= 0) b.active = false;
            
            // Collisions
            if (b.owner === 'player') {
                for (const e of this.enemies) {
                    if (!e.active || b.hitIds.includes(e.id)) continue;
                    if (this.checkCollision(b, e)) {
                        // Hit!
                        b.hitIds.push(e.id);
                        if (b.damage) {
                            // Basic Attack or special
                            const isCrit = Math.random() < this.playerStats.getStatValue('critChance');
                            const mult = isCrit ? this.playerStats.getStatValue('critMultiplier') : 1.0;
                            this.applyDamage(e, b.damage * mult, isCrit, b.damageType, this.gameState.playerWorldPos, b.ailmentChance);
                        }
                        
                        // Pierce Logic
                        if (b.pierce > 0) {
                            b.pierce--;
                        } else {
                            b.active = false;
                            // Hit effect
                            this.visualEffects.push({
                                id: Math.random(), active: true, type: 'hit', x: b.x, y: b.y, radius: 15, lifeTime: 0.2, maxLifeTime: 0.2, color: 'white'
                            });
                            break;
                        }
                    }
                }
            }
        });

        // Floating Text
        this.floatingTexts.forEach(t => {
            if (!t.active) return;
            t.y -= t.velocityY * dt;
            t.lifeTime -= dt;
            if (t.lifeTime <= 0) t.active = false;
        });

        // Visual Effects
        this.visualEffects.forEach(e => {
            if (!e.active) return;
            e.lifeTime -= dt;
            if (e.followPlayer) {
                e.x = this.gameState.playerWorldPos.x + PLAYER_SIZE/2;
                e.y = this.gameState.playerWorldPos.y + PLAYER_SIZE/2;
            }
            if (e.expansionRate) {
                if (!e.radius) e.radius = 0;
                e.radius += e.expansionRate;
            }
            if (e.lifeTime <= 0) e.active = false;
        });

        // Loot Magnet & Pickup
        this.loot.forEach(l => {
            if (!l.active) return;
            const dx = (this.gameState.playerWorldPos.x + PLAYER_SIZE/2) - (l.x + l.width/2);
            const dy = (this.gameState.playerWorldPos.y + PLAYER_SIZE/2) - (l.y + l.height/2);
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if (dist < l.autoCollectRadius) {
                l.x += (dx/dist) * 300 * dt; // Magnet speed
                l.y += (dy/dist) * 300 * dt;
                
                if (dist < 20) {
                    // Collected
                    l.active = false;
                    if (this.gameState.backpack.length < BACKPACK_CAPACITY) {
                        this.gameState.backpack.push(l.itemData);
                        this.callbacks.onInventoryChange();
                        this.spawnFloatingText(this.gameState.playerWorldPos.x, this.gameState.playerWorldPos.y - 20, l.itemData.name, '#fbbf24', 0.8);
                    } else {
                        this.callbacks.onNotification("Bag Full!");
                    }
                }
            }
        });

        // XP Orbs Magnet & Pickup
        const pickupRange = 100; // Base pickup range
        this.xpOrbs.forEach(o => {
            if (!o.active) return;
            const dx = (this.gameState.playerWorldPos.x + PLAYER_SIZE/2) - o.x;
            const dy = (this.gameState.playerWorldPos.y + PLAYER_SIZE/2) - o.y;
            const dist = Math.sqrt(dx*dx + dy*dy);

            if (o.magnetized || dist < pickupRange) {
                o.magnetized = true;
                const speed = 400 + (1000 / (dist + 1)); // Accelerate as it gets closer
                o.x += (dx/dist) * speed * dt;
                o.y += (dy/dist) * speed * dt;

                if (dist < 15) {
                    o.active = false;
                    this.gainXp(o.value);
                }
            }
        });

        // Director (Spawning)
        if (this.gameState.worldState === 'RUN' && !this.directorState.bossSpawned) {
            this.directorState.spawnTimer -= dt;
            if (this.directorState.spawnTimer <= 0) {
                const enemiesCount = this.enemies.filter(e => e.active).length;
                if (enemiesCount < this.gameState.currentMaxEnemies) {
                    // Spawn logic based on difficulty?
                    const r = Math.random();
                    let type: EnemyType = 'basic';
                    if (r < 0.2) type = 'fast';
                    else if (r < 0.3) type = 'tank';
                    
                    this.spawnEnemy(type);
                }
                this.directorState.spawnTimer = 0.5 / this.gameState.currentMapStats.packSizeMult; 
            }
        }
        
        // Shake decay
        if (this.gameState.shakeTimer > 0) this.gameState.shakeTimer -= dt;
    }
}