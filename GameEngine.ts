
import { Vector2, JoystickState, GameState, Enemy, Bullet, Entity, Loot, EnemyType, BulletOwner, UpgradeDefinition, StatKey, FloatingText, EnemyModifier, ItemSlot, ItemRarity, ItemInstance, ActiveSkillInstance, ResolvedSkill, MAX_SKILL_SLOTS, Interactable, InteractableType, NPC, DamageType, SkillTag, GroundEffect, GroundEffectType, Particle, XPOrb, XPOrbTier, VisualEffect, MapStats } from './types';
import { generateItem, generateRewards, createGemItem, createSpecificItem, AFFIX_DATABASE, createEndlessKey } from './ItemSystem';
import { StatsSystem } from './StatsSystem';
import { SkillManager, SKILL_DATABASE } from './SkillSystem';

// --- ASSETS (SVG Data URIs) ---
const ASSETS: { [key: string]: string } = {
  player: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj4KICA8Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0OCIgZmlsbD0iIzNiODJmNiIgc3Ryb2tlPSIjMjU2M2ViIiBzdHJva2Utd2lkdGg9IjQiLz4KICA8Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIyNSIgZmlsbD0iIzYwYTVmYSIgb3BhY2l0eT0iMC41Ii8+Cjwvc3ZnPg==`,
  enemy: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj4KICA8cmVjdCB4PSI1IiB5PSI1IiB3aWR0aD0iOTAiIGhlaWdodD0iOTAiIHJ4PSIyMCIgZmlsbD0iI2VmNDQ0NCIgc3Ryb2tlPSIjOTkxYjFiIiBzdHJva2Utd2lkdGg9IjQiLz4KICA8cGF0aCBkPSJNMzAgNDAgTDUwIDYwIEw3MCA0MCIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSI1IiBmaWxsPSJub25lIi8+CiAgPGNpcmNsZSBjeD0iMzUiIGN5PSI0MCIgcj0iSIgZmlsbD0iYmxhY2siLz4KICA8Y2lyY2xlIGN4PSI2NSIgY3k9IjQwIiByPSI1IiBmaWxsPSJibGFjayIvPgo8L3N2Zz4=`,
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
    onOpenShop: () => void; // New Callback for NPC interaction
}

const uuid = () => Math.random().toString(36).substring(2, 9);

function createEmptySkillSlot(id: number): ActiveSkillInstance {
    return {
        instanceId: `skill_${id}`,
        activeGem: null,
        supportGems: [null, null, null],
        cooldownTimer: 0,
        level: 1
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
        activeSkills[1].activeGem = createGemItem('flame_ring');  // Flame Ring (Defense)

        // Give starter maps
        const starterMaps = [
            generateItem('map', 1, 'normal'),
            generateItem('map', 2, 'magic'),
            generateItem('map', 3, 'rare')
        ];

        // Give 2 Endless Keys for testing
        const endlessKey1 = createEndlessKey();
        endlessKey1.id = uuid();
        
        const endlessKey2 = createEndlessKey();
        endlessKey2.id = uuid();

        // Give Pyromancer's Ring for Debugging
        const debugRing = createSpecificItem('ring1', 'prefix_pyromancer');

        const mapDevice: Interactable = {
            id: 999,
            active: true,
            type: 'map_device',
            x: 0,
            y: -280,
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
            x: 160,
            y: 80,
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
            backpack: [...starterMaps, endlessKey1, endlessKey2],
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
                    x: 160,
                    y: 80,
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
                        y: -280,
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
        this.recalculateStats(); // Ensure maxHP is fresh
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

    private spawnBullet(x: number, y: number, angle: number, owner: 'player' | 'enemy', speed: number, size: number, color: string, damageType: DamageType, damage?: number, pierce: number = 0, ailmentChance: number = 0, behavior: 'normal' | 'orbit' = 'normal') {
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
        
        // Orbit Logic
        bullet.behavior = behavior;
        if (behavior === 'orbit') {
            bullet.orbitAngle = angle;
            bullet.orbitRadius = 120; // Fixed orbit radius
            bullet.initialSpeed = speed; // Use projectile speed to determine angular speed
            bullet.vx = 0; // Override velocity
            bullet.vy = 0;
        }
    }

    // --- SKILL CASTING SYSTEM ---

    private getDamageTypeFromTags(tags: SkillTag[]): DamageType {
        if (tags.includes('fire')) return 'fire';
        if (tags.includes('cold')) return 'cold';
        if (tags.includes('lightning')) return 'lightning';
        if (tags.includes('projectile') && !tags.includes('physical')) return 'physical'; // Default proj
        return 'physical'; // Fallback
    }

    private castSkill(skill: ResolvedSkill, speedMult: number) {
        const px = this.gameState.playerWorldPos.x + PLAYER_SIZE/2;
        const py = this.gameState.playerWorldPos.y + PLAYER_SIZE/2;
        const dmgType = this.getDamageTypeFromTags(skill.tags);

        // Slow affects cooldown, but visually impacts projectile speed slightly? No, standard logic keeps speed constant.

        // --- BLIZZARD LOGIC (New Nova) ---
        if (skill.definition.id === 'nova') {
             // 1. Filter enemies in range
             const validEnemies = this.enemies.filter(e => {
                 if (!e.active) return false;
                 const dist = Math.sqrt((e.x + e.width/2 - px)**2 + (e.y + e.height/2 - py)**2);
                 return dist < (skill.stats.range || 450);
             });

             // 2. Randomly select targets
             const targetCount = Math.floor(skill.stats.projectileCount);
             const targets: Enemy[] = [];
             
             // Simple random selection
             const pool = [...validEnemies];
             for (let i = 0; i < targetCount; i++) {
                 if (pool.length === 0) break;
                 const idx = Math.floor(Math.random() * pool.length);
                 targets.push(pool[idx]);
                 pool.splice(idx, 1); // Remove selected to prevent duplicate hits
             }

             // 3. Apply Damage and Effect
             targets.forEach(e => {
                 this.applySkillDamage(e, skill, dmgType);
                 
                 // Spawn Ice Shard effect
                 this.visualEffects.push({
                     id: Math.random(),
                     active: true,
                     type: 'falling_ice',
                     x: e.x + e.width/2, // Target center X
                     y: e.y + e.height/2 + 20, // Target feet Y (corrected downwards)
                     lifeTime: 0.35, // Fast drop
                     maxLifeTime: 0.35,
                     color: '#bae6fd' 
                 });
             });
             
             return; // End processing, do not execute projectile/area logic below
        }
        
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
                     const nx = mag > 0 ? dx/mag : 1;
                     const ny = mag > 0 ? dy/mag : 0;
                     
                     let force = skill.stats.knockback;
                     if (enemy.type === 'boss') force *= 0.1; // Boss resistance
                     if (enemy.type === 'tank') force *= 0.5; // Tank resistance
                     
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
        const canvasWidth = this.canvas ? this.canvas.width : 400;
        const visualRadius = (canvasWidth / 2) / CAMERA_ZOOM + 100; // 100px buffer
        const visualRadiusSq = visualRadius * visualRadius;

        for (const enemy of this.enemies) {
          if (!enemy.active) continue;
          const cx = enemy.x + enemy.width/2;
          const cy = enemy.y + enemy.height/2;
          const distSq = (cx - px)**2 + (cy - py)**2;
          
          if (distSq > visualRadiusSq) continue; // Skip off-screen enemies

          if (distSq < minDistSq) { minDistSq = distSq; nearest = enemy; }
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
            const size = skill.definition.id === 'electro_sphere' ? 30 : 15;
            const color = skill.definition.id === 'fireball' ? '#f97316' : '#60a5fa';
            
            const isOrbit = skill.stats.orbit > 0;

            for (let i = 0; i < safeCount; i++) {
                let angle = 0;
                if (isOrbit) {
                    // 360 degree uniform distribution for orbit
                    angle = baseAngle + (Math.PI * 2 * i) / safeCount;
                } else {
                    // Standard spread
                    angle = (safeCount > 1 ? startAngle + i * spreadRad : baseAngle);
                }
                
                this.spawnBullet(px, py, angle, 'player', skill.stats.projectileSpeed, size, color, dmgType, undefined, skill.stats.pierceCount, skill.stats.ailmentChance, isOrbit ? 'orbit' : 'normal');
            }
        } 
        else if (skill.tags.includes('area')) {
             const radius = skill.stats.areaOfEffect || 60;
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
        let nearest: Enemy | null = null;
        let minDistSq = Infinity;
        const px = this.gameState.playerWorldPos.x + PLAYER_SIZE/2;
        const py = this.gameState.playerWorldPos.y + PLAYER_SIZE/2;
        
        // VISUAL RANGE TARGETING for Basic Attack
        const canvasWidth = this.canvas ? this.canvas.width : 400;
        const visualRadius = (canvasWidth / 2) / CAMERA_ZOOM + 100; 
        const visualRadiusSq = visualRadius * visualRadius;

        for (const enemy of this.enemies) {
          if (!enemy.active) continue;
          const cx = enemy.x + enemy.width/2;
          const cy = enemy.y + enemy.height/2;
          const distSq = (cx - px)**2 + (cy - py)**2;

          if (distSq > visualRadiusSq) continue; // Skip off-screen

          if (distSq < minDistSq) { minDistSq = distSq; nearest = enemy; }
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
        const pierce = Math.floor(this.playerStats.getStatValue('pierceCount')); // Retrieve global pierce count

        const speed = 400;
        
        const spreadRad = 0.1; 
        const startAngle = angle - ((count - 1) * spreadRad) / 2;

        for (let i = 0; i < count; i++) {
            this.spawnBullet(px, py, startAngle + i * spreadRad, 'player', speed, 12, '#93c5fd', 'physical', dmg, pierce, ailmentChance);
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
         let res = e.resistances[type] || 0;
         
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
                 e.statuses['ignited'] = 4.0; // 4s ignite
                 this.spawnFloatingText(e.x + e.width/2, e.y - 20, "IGNITE", "#fb923c", 0.8);
             } else if (type === 'cold') {
                 e.statuses['chilled'] = 2.0; // 2s chill
                 this.spawnFloatingText(e.x + e.width/2, e.y - 20, "CHILL", "#67e8f9", 0.8);
             } else if (type === 'lightning') {
                 e.statuses['shocked'] = 4.0; // 4s shock
                 this.spawnFloatingText(e.x + e.width/2, e.y - 20, "SHOCK", "#fde047", 0.8);
             }
         }

         // Color mapping
         let color = 'white';
         if (type === 'fire') color = '#f97316'; // Orange
         else if (type === 'cold') color = '#06b6d4'; // Cyan
         else if (type === 'lightning') color = '#facc15'; // Yellow
         else if (type === 'chaos') color = '#d946ef'; // Purple

         if (isCrit) color = '#ef4444'; 
         
         this.spawnFloatingText(e.x + e.width/2, e.y, Math.floor(finalDamage).toString(), isCrit ? '#f87171' : color, isCrit ? 1.5 : 1.0);

         if (e.hp <= 0) {
            e.active = false;
            
            // Dynamic XP Calculation
            let typeMult = 1;
            if (e.type === 'fast') typeMult = 1.2;
            else if (e.type === 'tank') typeMult = 3.0;
            else if (e.type === 'boss') typeMult = 50.0;

            let eliteMult = e.isElite ? 5.0 : 1.0;
            const mapMult = this.gameState.currentMapStats.xpMult;
            
            const finalXp = Math.floor(XP_PER_ENEMY * typeMult * eliteMult * mapMult);

            const isBoss = e.type === 'boss';
            
            // Only drop loot if NOT in endless mode
            if (!this.gameState.isEndlessMode) {
                this.spawnLoot(e.x, e.y, isBoss, e.isElite ? ELITE_LOOT_CHANCE : LOOT_CHANCE);
            }
            this.gameState.score += (isBoss ? 1000 : 10);
            
            // Replaced Direct Gain with XP Orb Spawn
            this.spawnXPOrb(e.x + e.width/2, e.y + e.height/2, finalXp);
            
            // Remove associated bubble if exists
            if (e.modifiers.includes('temporal')) {
                const bubbleIndex = this.gameState.groundEffects.findIndex(g => g.type === 'bubble' && g.sourceId === e.id);
                if (bubbleIndex > -1) {
                    this.gameState.groundEffects.splice(bubbleIndex, 1);
                }
            }

            // Expedition Progress
            if (this.gameState.expeditionActive) {
                this.gameState.currentKills += 1;
                
                // Portal Logic: Floor 1-4 Kills, Floor 5 Boss
                const floorObjectiveMet = this.gameState.currentKills >= this.gameState.targetKills;
                const isBossKill = e.type === 'boss';
                
                // Prevent duplicate portal spawns
                const hasPortal = this.gameState.interactables.some(i => i.type.includes('portal'));

                if (!hasPortal) {
                    if (this.gameState.currentFloor < 5 || this.gameState.isEndlessMode) {
                        // Standard Floor OR Endless Mode (Always descends)
                        if (floorObjectiveMet) {
                            this.gameState.interactables.push({
                                id: uuid() as any,
                                active: true,
                                type: 'portal_next',
                                x: e.x,
                                y: e.y,
                                width: 60,
                                height: 80,
                                color: '#3b82f6',
                                interactionRadius: 80,
                                label: 'Descend'
                            });
                            this.callbacks.onNotification("Portal Opened");
                            
                            // AUTO-MAGNETIZE ORBS ON CLEAR
                            this.xpOrbs.forEach(o => {
                                if (o.active) o.magnetized = true;
                            });
                        }
                    } else if (this.gameState.currentFloor === 5 && !this.gameState.isEndlessMode) {
                        // Boss Floor (Normal Mode)
                        if (isBossKill) {
                            this.gameState.interactables.push({
                                id: uuid() as any,
                                active: true,
                                type: 'portal_return',
                                x: e.x,
                                y: e.y,
                                width: 60,
                                height: 80,
                                color: '#22c55e',
                                interactionRadius: 80,
                                label: 'Return'
                            });
                            this.callbacks.onNotification("Victory!");
                            
                            // 掉落 2 张无尽模式门票
                            for (let i = 0; i < 2; i++) {
                                const keyItem = createEndlessKey();
                                keyItem.id = uuid(); // 确保唯一ID，防止React列表报错
                                
                                // 手动生成战利品（因为 spawnLoot 只能生成随机物品）
                                const loot = this.loot.find(l => !l.active);
                                if (loot) {
                                    loot.active = true;
                                    loot.x = e.x + (Math.random() - 0.5) * 50;
                                    loot.y = e.y + (Math.random() - 0.5) * 50;
                                    loot.lifeTime = 60;
                                    loot.itemData = keyItem;
                                    loot.rarity = 'unique';
                                    loot.autoCollectRadius = 50;
                                }
                            }
                            this.callbacks.onNotification("DROPPED: Endless Void Keys!");

                            // AUTO-MAGNETIZE ORBS ON CLEAR
                            this.xpOrbs.forEach(o => {
                                if (o.active) o.magnetized = true;
                            });
                        }
                    }
                }
                this.updateHud();
            }
         }
    }

    // --- MAIN UPDATE LOOP ---

    private update(time: number) {
        if (!this.canvas) return;
        if (this.gameState.isGameOver) return;
        if (this.gameState.isPaused) return;

        const dt = Math.min((time - this.gameState.lastFrameTime) / 1000, 0.1);
        this.gameState.lastFrameTime = time;

        this.timers.frames++;
        this.timers.fpsUpdate += dt;
        if (this.timers.fpsUpdate >= 1.0) { this.timers.currentFps = this.timers.frames; this.timers.frames = 0; this.timers.fpsUpdate = 0; }

        if (this.gameState.shakeTimer > 0) {
            this.gameState.shakeTimer -= dt;
        }

        if (this.gameState.playerInvulnerabilityTimer > 0) {
            this.gameState.playerInvulnerabilityTimer -= dt;
        }

        // HP Regen Logic
        const regen = this.playerStats.getStatValue('hpRegen');
        const maxHp = this.playerStats.getStatValue('maxHp');
        if (regen > 0 && this.currentHp < maxHp && !this.gameState.isGameOver) {
            this.currentHp += regen * dt;
            if (this.currentHp > maxHp) {
                this.currentHp = maxHp;
            }
        }

        // 1. Calculate Environment Debuffs (Bubble / Ice Ground)
        let speedMultiplier = 1.0;
        let attackSpeedMultiplier = 1.0;
        const px = this.gameState.playerWorldPos.x + PLAYER_SIZE/2;
        const py = this.gameState.playerWorldPos.y + PLAYER_SIZE/2;
        let onIce = false;
        let inBubble = false;

        // Ground Effects Logic
        for (let i = this.gameState.groundEffects.length - 1; i >= 0; i--) {
            const effect = this.gameState.groundEffects[i];
            effect.duration -= dt;
            
            // Sync Bubble Position
            if (effect.type === 'bubble' && effect.sourceId !== undefined) {
                const owner = this.enemies.find(e => e.id === effect.sourceId);
                if (owner && owner.active) {
                    effect.x = owner.x + owner.width/2;
                    effect.y = owner.y + owner.height/2;
                } else {
                    effect.duration = 0; // Remove if owner dead
                }
            }

            // Player Intersection
            const dist = Math.sqrt((effect.x - px)**2 + (effect.y - py)**2);
            if (dist < effect.radius) {
                if (effect.type === 'ice_ground') onIce = true;
                if (effect.type === 'bubble') inBubble = true;
                
                // Ground DoT
                if (['fire_ground', 'lightning_ground'].includes(effect.type)) {
                     // 20 damage per second base
                     const dmg = 20 * dt;
                     // Apply resistance? (Assuming player has 0 res for now, or use map mods)
                     if (this.gameState.playerInvulnerabilityTimer <= 0) {
                        this.currentHp -= dmg;
                        if (this.currentHp <= 0) {
                            this.gameState.isGameOver = true;
                            this.callbacks.onGameOver(true);
                        } else {
                            // Don't shake/flash for dot tick unless huge, update HUD occasionally?
                            // For this simple engine, updating hud every frame is okay.
                            this.updateHud(); 
                        }
                     }
                }
            }

            // Blast Warning Expiry
            if (effect.type === 'blast_warning' && effect.duration <= 0) {
                 // EXPLODE
                 if (dist < effect.radius) {
                     // Massive damage to player
                     if (this.gameState.playerInvulnerabilityTimer <= 0) {
                         const dmg = 40 * this.gameState.currentMapStats.monsterDamageMult;
                         this.currentHp -= dmg;
                         this.gameState.playerInvulnerabilityTimer = 0.5;
                         this.triggerShake(0.5);
                         this.spawnFloatingText(px, py, "BLAST!", "#ef4444", 1.5);
                         if (this.currentHp <= 0) {
                            this.gameState.isGameOver = true;
                            this.callbacks.onGameOver(true);
                        } else {
                            this.updateHud();
                        }
                     }
                 }
                 // Visual for explosion
                 this.visualEffects.push({
                    id: Math.random(),
                    active: true,
                    type: 'hit', // reuse hit type or create explosion
                    x: effect.x,
                    y: effect.y,
                    radius: effect.radius,
                    lifeTime: 0.3,
                    maxLifeTime: 0.3,
                    color: effect.damageType === 'fire' ? '#ef4444' : effect.damageType === 'cold' ? '#06b6d4' : '#a855f7'
                 });
            }

            if (effect.duration <= 0) {
                this.gameState.groundEffects.splice(i, 1);
            }
        }

        if (onIce) speedMultiplier *= 0.7;
        if (inBubble) {
            speedMultiplier *= 0.5;
            attackSpeedMultiplier *= 0.5;
        }

        // 2. Move Player
        const { vector } = this.joystickState;
        const speed = this.playerStats.getStatValue('moveSpeed') * SPEED_SCALAR * speedMultiplier;
        this.gameState.playerWorldPos.x += vector.x * speed * dt;
        this.gameState.playerWorldPos.y += vector.y * speed * dt;
        const playerCenter = {
            x: this.gameState.playerWorldPos.x + PLAYER_SIZE / 2,
            y: this.gameState.playerWorldPos.y + PLAYER_SIZE / 2
        };

        // 3. CHECK INTERACTIONS
        let nearestInteractable: Interactable | null = null;
        let minIntDist = Infinity;
        for (const int of this.gameState.interactables) {
             const cx = int.x + int.width/2;
             const cy = int.y + int.height/2;
             const dist = Math.sqrt((cx - playerCenter.x)**2 + (cy - playerCenter.y)**2);
             if (dist < int.interactionRadius) {
                 if (dist < minIntDist) {
                     minIntDist = dist;
                     nearestInteractable = int;
                 }
             }
        }
        this.callbacks.onNearbyInteractable(nearestInteractable);

        // 4. LOGIC SPLIT: RUN vs HIDEOUT
        if (this.gameState.worldState === 'RUN') {
            const dir = this.directorState;
            dir.gameTime += dt;
            dir.spawnTimer -= dt;

            // FIX: Stop spawning if objective met or boss active
            const objectiveComplete = this.gameState.currentKills >= this.gameState.targetKills;
            const bossActive = this.gameState.currentFloor === 5 && dir.bossSpawned && !this.gameState.isEndlessMode;
            
            if (!objectiveComplete && !bossActive) {
                // INCREASED MAX ENEMIES: (60 + Floor*10 + Tier*5) * 2
                const currentMaxEnemies = (60 + (this.gameState.currentFloor * 10) + (this.gameState.currentMapStats.tier * 5)) * 2;
                this.gameState.currentMaxEnemies = currentMaxEnemies;
                
                const activeEnemyCount = this.enemies.filter(e => e.active).length;

                if (activeEnemyCount < currentMaxEnemies) {
                    const mapStats = this.gameState.currentMapStats;
                    const spawnRateMult = mapStats.packSizeMult; 

                    let spawnTypes: EnemyType[] = ['basic'];
                    
                    // Smart Rhythm Logic
                    const progress = Math.min(1.0, this.gameState.currentKills / (this.gameState.targetKills || 1));

                    // Base Interval: 0.4s base * (0.9 ^ Floor)
                    const baseInterval = (0.4 * Math.pow(0.9, this.gameState.currentFloor)) / spawnRateMult;
                    
                    // Dynamic Interval: Accelerate as progress increases (Linear Difficulty Growth)
                    // At 0% progress: 100% of baseInterval
                    // At 100% progress: 40% of baseInterval (much faster)
                    let interval = baseInterval * (1.0 - progress * 0.6);
                    
                    const difficultyTime = dir.gameTime + (this.gameState.currentFloor * 30); 

                    if (difficultyTime < 30) {
                        spawnTypes = ['basic'];
                    } else if (difficultyTime < 60) {
                        spawnTypes = ['basic', 'fast'];
                    } else if (difficultyTime < 120) {
                        spawnTypes = ['basic', 'tank']; 
                    } else {
                        spawnTypes = ['fast', 'tank']; 
                    }
                    
                    if (this.gameState.currentFloor === 5 && !this.gameState.isEndlessMode) {
                        spawnTypes = ['basic'];
                        interval = 8.0; 
                    }

                    if (dir.spawnTimer <= 0) {
                        if (spawnTypes.length > 0) {
                            const type = spawnTypes[Math.floor(Math.random() * spawnTypes.length)];
                            this.spawnEnemy(type);
                            dir.spawnTimer = interval;
                        }
                    }
                }
            }
        }

        // 5. SKILL SYSTEM UPDATE
        this.gameState.activeSkills.forEach((skillInstance, index) => {
            if (skillInstance.cooldownTimer > 0) {
                skillInstance.cooldownTimer -= dt;
            }

            if (skillInstance.cooldownTimer <= 0) {
                // Apply attack speed slows
                const effectiveDt = dt * attackSpeedMultiplier;

                if (skillInstance.activeGem) {
                    const resolved = SkillManager.resolveSkill(skillInstance, this.playerStats);
                    if (resolved) {
                        this.castSkill(resolved, attackSpeedMultiplier);
                        const rate = resolved.stats.attackRate * attackSpeedMultiplier;
                        skillInstance.cooldownTimer = rate > 0 ? (1.0 / rate) : 1.0;
                    }
                } else if (index === 0) {
                    this.castBasicAttack(skillInstance);
                    const atkSpeed = this.playerStats.getStatValue('attackSpeed') * attackSpeedMultiplier;
                    skillInstance.cooldownTimer = atkSpeed > 0 ? 1.0 / atkSpeed : 1.0;
                }
            }
        });

        // 6. Update Visual Effects & Particles
        for (let i = this.visualEffects.length - 1; i >= 0; i--) {
            const eff = this.visualEffects[i];
            
            // Follow Player Logic
            if (eff.followPlayer) {
                 eff.x = this.gameState.playerWorldPos.x + PLAYER_SIZE/2;
                 eff.y = this.gameState.playerWorldPos.y + PLAYER_SIZE/2;
            }

            eff.lifeTime -= dt;
            
            // Flame Ring Particle Logic with Physics Expansion
            if (eff.type === 'flame_ring_visual') {
                 // Physics-based expansion
                 const dtFactor = dt * 60; // Approximate frames
                 eff.expansionRate = (eff.expansionRate || 12) * Math.pow(0.95, dtFactor);
                 eff.radius = (eff.radius || 10) + (eff.expansionRate * dtFactor);
                 
                 // Particle Emission based on circumference
                 if (eff.lifeTime > 0.1) {
                     const circumference = 2 * Math.PI * eff.radius;
                     // Adjust density based on circumference and frame time
                     const particleCount = Math.floor((circumference / 25) * dtFactor); 
                     
                     for(let k=0; k<particleCount; k++) {
                         // Random noise in emission
                         if (Math.random() > 0.7) continue; 

                         const angle = (Math.PI * 2 / Math.max(1, particleCount)) * k + (Math.random()*0.2);
                         const px = eff.x + Math.cos(angle) * eff.radius;
                         const py = eff.y + Math.sin(angle) * eff.radius;
                         
                         // Particles move outward
                         this.gameState.particles.push({
                             id: Math.random(),
                             x: px,
                             y: py,
                             vx: Math.cos(angle) * 50, // Slight outward drift
                             vy: Math.sin(angle) * 50,
                             life: 0.3 + Math.random() * 0.2,
                             maxLife: 0.5,
                             color: Math.random() > 0.5 ? '#f97316' : '#ef4444', // Orange or Red
                             size: Math.random() * 4 + 2
                         });
                     }
                 }
            }
            
            // Cyclone Update Logic
            if (eff.type === 'cyclone') {
                if (eff.angle !== undefined && eff.spinSpeed !== undefined) {
                    eff.angle += eff.spinSpeed * dt;
                    eff.spinSpeed *= 0.98; // Drag
                }
                
                // Particle Generation
                if (Math.random() < 0.5) {
                    const r = eff.radius || 100;
                    const theta = Math.random() * Math.PI * 2;
                    const px = eff.x + Math.cos(theta) * r * 0.8;
                    const py = eff.y + Math.sin(theta) * r * 0.8;
                    
                    this.gameState.particles.push({
                        id: Math.random(),
                        x: px,
                        y: py,
                        vx: Math.cos(theta) * 150,
                        vy: Math.sin(theta) * 150,
                        life: 0.3,
                        maxLife: 0.3,
                        color: '#00ffff', // Cyan sparks
                        size: Math.random() * 2 + 1
                    });
                }
            }

            if (eff.lifeTime <= 0) {
                this.visualEffects.splice(i, 1);
            }
        }
        
        // Update Particles
        for (let i = this.gameState.particles.length - 1; i >= 0; i--) {
            const p = this.gameState.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vx *= 0.9; // Drag
            p.vy *= 0.9;
            p.life -= dt;
            if (p.life <= 0) {
                this.gameState.particles.splice(i, 1);
            }
        }

        // 7. Update Entities
        const playerRect = { x: this.gameState.playerWorldPos.x, y: this.gameState.playerWorldPos.y, width: PLAYER_SIZE, height: PLAYER_SIZE, id: -1, active: true, color: '' };

        for (const t of this.floatingTexts) {
            if (!t.active) continue;
            t.y -= t.velocityY * dt;
            t.lifeTime -= dt;
            if (t.lifeTime <= 0) t.active = false;
        }

        // Update XP Orbs
        for (const orb of this.xpOrbs) {
            if (!orb.active) continue;
            
            const distSq = (orb.x - playerCenter.x)**2 + (orb.y - playerCenter.y)**2;
            const magnetRadius = 100 * 100;
            const collectRadius = 20 * 20;

            if (orb.magnetized || distSq < magnetRadius) {
                orb.magnetized = true;
                const dist = Math.sqrt(distSq);
                const speed = 600 * dt; // Fast movement to player
                orb.x += ((playerCenter.x - orb.x) / dist) * speed;
                orb.y += ((playerCenter.y - orb.y) / dist) * speed;

                if (distSq < collectRadius) {
                    orb.active = false;
                    this.gainXp(orb.value);
                }
            }
        }

        for (const enemy of this.enemies) {
            if (!enemy.active) continue;

            // PHYSICS & KNOCKBACK
            if (enemy.knockbackVelocity && (enemy.knockbackVelocity.x !== 0 || enemy.knockbackVelocity.y !== 0)) {
                enemy.x += enemy.knockbackVelocity.x * dt;
                enemy.y += enemy.knockbackVelocity.y * dt;
                
                // Friction
                const friction = 5.0; // Damping factor
                enemy.knockbackVelocity.x -= enemy.knockbackVelocity.x * friction * dt;
                enemy.knockbackVelocity.y -= enemy.knockbackVelocity.y * friction * dt;

                // Stop threshold
                if (Math.abs(enemy.knockbackVelocity.x) < 5) enemy.knockbackVelocity.x = 0;
                if (Math.abs(enemy.knockbackVelocity.y) < 5) enemy.knockbackVelocity.y = 0;
            }

            // Determine if stunned/knocked back
            const isKnockedBack = enemy.knockbackVelocity && (Math.abs(enemy.knockbackVelocity.x) > 10 || Math.abs(enemy.knockbackVelocity.y) > 10);

            // --- BOSS AI START ---
            if (enemy.type === 'boss') {
                // 阶段转换检测
                if (enemy.bossState === 'phase1' && enemy.hp < (enemy.maxHp || 1) * 0.5) {
                    enemy.bossState = 'phase2';
                    enemy.color = '#ef4444'; // 变红
                    enemy.width *= 1.2; enemy.height *= 1.2; // 变大
                    enemy.speed *= 1.3; // 加速
                    this.callbacks.onNotification("🔥 BOSS ENRAGED! 🔥");
                    this.triggerShake(0.5);
                }

                // 技能循环
                enemy.skillTimer = (enemy.skillTimer || 0) - dt;
                if (enemy.skillType) {
                    // 正在释放技能中，停止移动
                    enemy.skillDuration = (enemy.skillDuration || 0) - dt;
                    if (enemy.skillType === 'spiral') {
                        // 螺旋弹幕逻辑：每帧发射旋转子弹
                        if (Math.random() < 0.3) { // 限制发射频率
                            const angle = (Date.now() / 200) % (Math.PI * 2);
                            for(let k=0; k<4; k++) { // 4个方向
                                this.spawnBullet(enemy.x + enemy.width/2, enemy.y + enemy.height/2, angle + k*(Math.PI/2), 'enemy', 200, 15, '#a855f7', 'lightning', 15);
                            }
                        }
                    }
                    
                    if (enemy.skillDuration <= 0) {
                        enemy.skillType = undefined; // 技能结束
                        enemy.skillTimer = enemy.bossState === 'phase2' ? 1.5 : 3.0; // 狂暴后CD更短
                    }
                    continue; // 跳过移动逻辑，站桩施法
                } 
                else if ((enemy.skillTimer || 0) <= 0) {
                    // 随机选择技能
                    const rand = Math.random();
                    if (enemy.bossState === 'phase1') {
                        if (rand < 0.6) { // 60% 螺旋弹幕
                            enemy.skillType = 'spiral';
                            enemy.skillDuration = 2.0;
                            this.spawnFloatingText(enemy.x, enemy.y, "SPIRAL!", "#a855f7");
                        } else { // 40% 召唤小弟
                            enemy.skillType = 'summon';
                            enemy.skillDuration = 0.5;
                            this.spawnEnemy('fast'); this.spawnEnemy('fast');
                            this.spawnFloatingText(enemy.x, enemy.y, "MINIONS!", "#ef4444");
                        }
                    } else {
                        // Phase 2
                        if (rand < 0.5) { // 50% 螺旋弹幕 (更快)
                            enemy.skillType = 'spiral';
                            enemy.skillDuration = 1.5;
                        } else { // 50% 毁灭打击 (玩家脚下生成红圈)
                            enemy.skillType = 'blast';
                            enemy.skillDuration = 0.5; // 施法动作快
                            const px = this.gameState.playerWorldPos.x + 20;
                            const py = this.gameState.playerWorldPos.y + 20;
                            this.gameState.groundEffects.push({
                                    id: Math.random().toString(),
                                    x: px, y: py, radius: 100, type: 'blast_warning', duration: 1.5, damageType: 'fire'
                            });
                            this.spawnFloatingText(enemy.x, enemy.y, "DOOM!", "#ef4444", 1.5);
                        }
                    }
                }
            }
            // --- BOSS AI END ---

            // STATUS UPDATE LOGIC
            // Ignited: DoT
            if (enemy.statuses['ignited']) {
                enemy.statuses['ignited'] -= dt;
                if (enemy.statuses['ignited'] <= 0) {
                    delete enemy.statuses['ignited'];
                } else {
                    // Ignite Damage: 20% of Player Base Damage per second (approx)
                    const baseBurn = this.playerStats.getStatValue('bulletDamage') * 0.2;
                    enemy.hp -= baseBurn * dt;
                    if (enemy.hp <= 0) {
                        this.applyDamage(enemy, 0, false, 'fire', undefined); // Kill trigger logic reuse
                    }
                }
            }

            // Chilled
            if (enemy.statuses['chilled']) {
                enemy.statuses['chilled'] -= dt;
                if (enemy.statuses['chilled'] <= 0) delete enemy.statuses['chilled'];
            }

            // Shocked
            if (enemy.statuses['shocked']) {
                enemy.statuses['shocked'] -= dt;
                if (enemy.statuses['shocked'] <= 0) delete enemy.statuses['shocked'];
            }

            if (enemy.modifiers.includes('regenerator')) {
                const regenAmount = (enemy.maxHp || 10) * 0.05 * dt;
                if (enemy.hp < enemy.maxHp!) {
                    enemy.hp = Math.min(enemy.hp + regenAmount, enemy.maxHp!);
                }
            }

            // TRAIL LOGIC
            if (enemy.modifiers.some(m => m.startsWith('trail_'))) {
                enemy.trailTimer = (enemy.trailTimer || 0) - dt;
                if (enemy.trailTimer <= 0) {
                    let type: GroundEffectType | null = null;
                    if (enemy.modifiers.includes('trail_fire')) type = 'fire_ground';
                    else if (enemy.modifiers.includes('trail_ice')) type = 'ice_ground';
                    else if (enemy.modifiers.includes('trail_lightning')) type = 'lightning_ground';

                    if (type) {
                        this.gameState.groundEffects.push({
                            id: uuid(),
                            x: enemy.x + enemy.width/2,
                            y: enemy.y + enemy.height/2,
                            radius: 30,
                            type: type,
                            duration: 3.5
                        });
                    }
                    enemy.trailTimer = 0.2;
                }
            }

            // PERIODIC BLAST LOGIC
            if (enemy.modifiers.includes('periodic_blast')) {
                enemy.blastTimer = (enemy.blastTimer || 0) - dt;
                if (enemy.blastTimer <= 0) {
                    // Create Warning
                    const angle = Math.random() * Math.PI * 2;
                    const offset = 80;
                    this.gameState.groundEffects.push({
                        id: uuid(),
                        x: (enemy.x + enemy.width/2) + Math.cos(angle)*offset,
                        y: (enemy.y + enemy.height/2) + Math.sin(angle)*offset,
                        radius: 60,
                        type: 'blast_warning',
                        duration: 1.0,
                        damageType: 'fire' // Default fire blast
                    });
                    enemy.blastTimer = 3.0;
                }
            }

            // MOVEMENT LOGIC (Only if not stunned by knockback)
            if (!isKnockedBack && !enemy.skillType) {
                const cx = enemy.x + enemy.width/2;
                const cy = enemy.y + enemy.height/2;
                const px = this.gameState.playerWorldPos.x + PLAYER_SIZE/2;
                const py = this.gameState.playerWorldPos.y + PLAYER_SIZE/2;
                const dx = px - cx;
                const dy = py - cy;
                const dist = Math.sqrt(dx*dx + dy*dy);

                let currentSpeed = enemy.speed;
                
                // Chill Effect
                if (enemy.statuses['chilled']) {
                    currentSpeed *= 0.7; // 30% Slow
                }

                if (enemy.modifiers.includes('berserker') && enemy.hp < (enemy.maxHp || 100) * 0.5) {
                    currentSpeed *= 2;
                }

                if (dist > 0) {
                    enemy.x += (dx/dist) * currentSpeed * dt;
                    enemy.y += (dy/dist) * currentSpeed * dt;
                }
            }

            if (this.checkCollision(enemy, playerRect)) {
                if (this.gameState.playerInvulnerabilityTimer <= 0) {
                    const dmgMult = this.gameState.currentMapStats.monsterDamageMult;
                    const dmg = (enemy.type === 'boss' ? 50 : 10) * dmgMult;
                    
                    this.currentHp -= dmg;
                    this.gameState.playerInvulnerabilityTimer = 0.5; // 0.5s i-frame
                    this.triggerShake(0.3);
                    
                    if (this.currentHp <= 0) {
                        this.gameState.isGameOver = true;
                        this.callbacks.onGameOver(true);
                    } else {
                        this.updateHud();
                    }
                }
            }

            // ENEMY SHOOTING LOGIC UPDATE
            // Stunned enemies cannot attack
            if (!isKnockedBack && enemy.attackTimer !== undefined) {
                enemy.attackTimer -= dt;
                if (enemy.attackTimer <= 0) {
                    const cx = enemy.x + enemy.width/2;
                    const cy = enemy.y + enemy.height/2;
                    const px = this.gameState.playerWorldPos.x + PLAYER_SIZE/2;
                    const py = this.gameState.playerWorldPos.y + PLAYER_SIZE/2;
                    const dx = px - cx;
                    const dy = py - cy;
                    const angle = Math.atan2(dy, dx);
                    // Reduced Bullet Speed: 300 -> 240
                    const bulletSpeed = 240;

                    // Extra Proj Logic
                    if (enemy.modifiers.includes('extra_proj')) {
                        // Fan of 3
                        const spread = 0.2; // Radians
                        for(let i = -1; i <= 1; i++) {
                             this.spawnBullet(cx, cy, angle + (i * spread), 'enemy', bulletSpeed, 20, BULLET_BOSS_COLOR, 'physical', 10);
                        }
                    } else {
                        // Single shot
                        this.spawnBullet(cx, cy, angle, 'enemy', bulletSpeed, 30, BULLET_BOSS_COLOR, 'physical', 10);
                    }
                    
                    // Reset timer based on type (Logic handled in spawnEnemy for base rate, re-use here? 
                    // No, usually constant. But let's assume boss attacks faster than normal
                    enemy.attackTimer = enemy.type === 'boss' ? 2.4 : 3.6; 
                }
            }
        }

        const pDmg = this.playerStats.getStatValue('bulletDamage');
        const pCritC = this.playerStats.getStatValue('critChance');
        const pCritM = this.playerStats.getStatValue('critMultiplier');

        for (const b of this.bullets) {
            if (!b.active) continue;
            
            // --- ORBIT LOGIC ---
            if (b.behavior === 'orbit' && b.owner === 'player') {
                // Angular Speed = Linear Speed / Radius
                const angularSpeed = (b.initialSpeed || 200) / (b.orbitRadius || 120);
                b.orbitAngle = (b.orbitAngle || 0) + angularSpeed * dt;
                
                const px = this.gameState.playerWorldPos.x + PLAYER_SIZE/2;
                const py = this.gameState.playerWorldPos.y + PLAYER_SIZE/2;
                
                // Force Position
                b.x = px + Math.cos(b.orbitAngle) * (b.orbitRadius || 120) - b.width/2;
                b.y = py + Math.sin(b.orbitAngle) * (b.orbitRadius || 120) - b.height/2;
                
                b.lifeTime -= dt; 
            } else {
                // Standard Linear Movement
                b.x += b.vx * dt;
                b.y += b.vy * dt;
                b.lifeTime -= dt;
            }

            if (b.lifeTime <= 0) { b.active = false; continue; }

            // --- FIREBALL TRAIL PARTICLES ---
            if (b.owner === 'player' && b.damageType === 'fire') {
                const particleCount = Math.floor(Math.random() * 2) + 1; // 1 or 2
                for (let k = 0; k < particleCount; k++) {
                    const cx = b.x + b.width / 2;
                    const cy = b.y + b.height / 2;
                    this.gameState.particles.push({
                        id: Math.random(),
                        x: cx + (Math.random() - 0.5) * 10,
                        y: cy + (Math.random() - 0.5) * 10,
                        vx: -b.vx * 0.5 + (Math.random() - 0.5) * 100, // Diffusion
                        vy: -b.vy * 0.5 + (Math.random() - 0.5) * 100,
                        life: 0.3 + Math.random() * 0.2, // 0.3 - 0.5s
                        maxLife: 0.5,
                        color: Math.random() > 0.5 ? '#ffaa00' : '#ff4400',
                        size: Math.random() * 6 + 4
                    });
                }
            }

            if (b.owner === 'player') {
                for (const e of this.enemies) {
                    if (!e.active) continue;
                    if (b.hitIds && b.hitIds.includes(e.id)) continue; 

                    if (this.checkCollision(b, e)) {
                        if (e.modifiers.includes('ghostly') && Math.random() < 0.5) {
                            this.spawnFloatingText(e.x + e.width/2, e.y, "MISS", "gray", 0.8);
                            b.hitIds.push(e.id); 
                            continue;
                        }

                        // Bubble Check: If target e is inside a bubble, and bullet is from outside, destroy
                        const cx = e.x + e.width/2;
                        const cy = e.y + e.height/2;
                        
                        if (e.modifiers.includes('temporal')) {
                            // Distance from player to enemy
                            const px = this.gameState.playerWorldPos.x + PLAYER_SIZE/2;
                            const py = this.gameState.playerWorldPos.y + PLAYER_SIZE/2;
                            const distToPlayer = Math.sqrt((cx-px)**2 + (cy-py)**2);
                            if (distToPlayer > 250) {
                                // Blocked
                                b.active = false;
                                this.spawnFloatingText(e.x + e.width/2, e.y, "BLOCKED", "#d8b4fe", 1.0);
                                break; 
                            }
                        }
                        
                        // Mark hit
                        b.hitIds.push(e.id);
                        
                        const isCrit = Math.random() < pCritC;
                        const finalDmg = (b.damage || pDmg) * (isCrit ? pCritM : 1.0); // Use snapshot damage if available

                        this.applyDamage(e, finalDmg, isCrit, b.damageType, this.gameState.playerWorldPos, b.ailmentChance);
                        
                        // --- ELECTRO SPHERE LOGIC ---
                        if (b.damageType === 'lightning' && b.owner === 'player') {
                             // 1. Visual Pulse
                             this.visualEffects.push({
                                 id: Math.random(),
                                 active: true,
                                 type: 'shockwave',
                                 x: e.x + e.width/2,
                                 y: e.y + e.height/2,
                                 radius: 80, // Approximate Area
                                 lifeTime: 0.2,
                                 maxLifeTime: 0.2,
                                 color: '#22d3ee'
                             });

                             // 2. AOE Splash (50% damage)
                             const splashRadius = 80;
                             for (const other of this.enemies) {
                                 if (!other.active || other.id === e.id) continue;
                                 const ox = other.x + other.width/2;
                                 const oy = other.y + other.height/2;
                                 const dist = Math.sqrt((ox - (e.x+e.width/2))**2 + (oy - (e.y+e.height/2))**2);
                                 if (dist < splashRadius + other.width/2) {
                                     this.applyDamage(other, finalDmg * 0.5, isCrit, 'lightning', this.gameState.playerWorldPos, b.ailmentChance);
                                 }
                             }
                        }

                        // Pierce Logic
                        if (b.pierce > 0) {
                            b.pierce--;
                        } else {
                            b.active = false;
                            break;
                        }
                    }
                }
            } else {
                if (this.checkCollision(b, playerRect)) {
                    // Bullet damage logic
                     if (this.gameState.playerInvulnerabilityTimer <= 0) {
                        const dmgMult = this.gameState.currentMapStats.monsterDamageMult;
                        this.currentHp -= 10 * dmgMult;
                        this.gameState.playerInvulnerabilityTimer = 0.5;
                        this.triggerShake(0.3);
                        b.active = false;

                        if (this.currentHp <= 0) {
                            this.gameState.isGameOver = true;
                            this.callbacks.onGameOver(true);
                        } else {
                            this.updateHud();
                        }
                    }
                }
            }
        }

        for (const l of this.loot) {
            if (!l.active) continue;
            
            const lx = l.x + l.width/2;
            const ly = l.y + l.height/2;
            const dist = Math.sqrt((lx - playerCenter.x)**2 + (ly - playerCenter.y)**2);

            if (dist < l.autoCollectRadius) {
                 if (this.gameState.backpack.length >= BACKPACK_CAPACITY) {
                    this.callbacks.onNotification("Backpack Full!");
                    l.autoCollectRadius = 0; 
                    continue;
                }

                l.active = false;
                this.gameState.backpack.push(l.itemData);
                
                const name = l.itemData.name;
                this.callbacks.onNotification(`GOT: ${name}`);
                this.saveGame();
                this.callbacks.onInventoryChange();
            }
        }
    }

    public handleInteract = (int: Interactable) => {
        if (int.type === 'map_device') {
            // Handled by UI State toggle in App/Component, GameEngine just pauses
        } else if (int.type === 'portal_next') {
            this.enterNextFloor();
        } else if (int.type === 'portal_return') {
            this.finalizeRun();
        }
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
        if (mapItem.gemDefinitionId === 'map_endless_void') {
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
                    case 'monsterHealth': mapStats.monsterHealthMult += val; mapStats.xpMult += val * 0.5; break;
                    case 'monsterDamage': mapStats.monsterDamageMult += val; mapStats.xpMult += val * 0.5; break;
                    case 'monsterPackSize': mapStats.packSizeMult += val; break;
                    case 'xpGain': mapStats.xpMult += val; break;
                    case 'itemRarity': mapStats.rarityMult += val; break;
                }
            }

            // Rarity Bonuses
            if (mapItem.rarity === 'magic') { mapStats.rarityMult += 0.2; mapStats.packSizeMult += 0.1; }
            if (mapItem.rarity === 'rare') { mapStats.rarityMult += 0.5; mapStats.packSizeMult += 0.2; }
            if (mapItem.rarity === 'unique') { mapStats.rarityMult += 1.0; mapStats.xpMult += 0.5; }

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
            
            // Infinite Scaling (Additive to preserve previous stacks)
            this.gameState.currentMapStats.monsterHealthMult += 0.1;
            this.gameState.currentMapStats.monsterDamageMult += 0.05;
            this.gameState.currentMapStats.xpMult += 0.05;

            // Environmental Deterioration (Every 5 floors)
            if (floor % 5 === 0) {
                 const mapAffixes = AFFIX_DATABASE.filter(a => a.validSlots.includes('map'));
                 if (mapAffixes.length > 0) {
                     const affix = mapAffixes[Math.floor(Math.random() * mapAffixes.length)];
                     // Roll value between min and max
                     const val = affix.minVal + Math.random() * (affix.maxVal - affix.minVal);
                     
                     switch(affix.stat) {
                        case 'monsterHealth': 
                            this.gameState.currentMapStats.monsterHealthMult += val; 
                            // Map mods usually give XP/Quant too
                            this.gameState.currentMapStats.xpMult += val * 0.5; 
                            break;
                        case 'monsterDamage': 
                            this.gameState.currentMapStats.monsterDamageMult += val; 
                            this.gameState.currentMapStats.xpMult += val * 0.5; 
                            break;
                        case 'monsterPackSize': 
                            this.gameState.currentMapStats.packSizeMult += val; 
                            break;
                        case 'xpGain': 
                            this.gameState.currentMapStats.xpMult += val; 
                            break;
                        case 'itemRarity': 
                            this.gameState.currentMapStats.rarityMult += val; 
                            break;
                     }
                     
                     this.callbacks.onNotification("环境恶化：" + affix.name + " (T" + floor + ")");
                 }
            }

            // Increase Kill Target
            this.gameState.targetKills = 50 + (floor * 10);

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
            y: -280, // UPDATED COORD
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
            x: 160, // UPDATED COORD
            y: 80,  // UPDATED COORD
            width: 50,
            height: 50,
            color: '#22c55e',
            interactionRadius: 80
        };
        this.gameState.interactables = [mapDevice];
        this.gameState.npcs = [merchant];

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
            case 'normal': price = 5; break;
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
                 item.slot = 'ring1'; // Default replace ring1
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

    public cancelSupportSelection() {
        this.gameState.pendingSupportGem = null;
        this.gameState.isSelectingSupport = false;
        // Do not modify isPaused state, because the player is still in the level up screen
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
        } 
        else if (upgrade.skillLevelUp) {
            const idx = upgrade.skillLevelUp.skillIndex;
            if (this.gameState.activeSkills[idx]) {
                this.gameState.activeSkills[idx].level += 1;
                const gemName = this.gameState.activeSkills[idx].activeGem?.name || 'Skill';
                this.callbacks.onNotification(`${gemName} Level Up! (Lvl ${this.gameState.activeSkills[idx].level})`);
            }
        }
        else if (upgrade.evolution) {
            const idx = upgrade.evolution.skillIndex;
            const evoId = upgrade.evolution.evolutionId;
            if (this.gameState.activeSkills[idx]) {
                this.gameState.activeSkills[idx].evolutionId = evoId;
                const gemName = this.gameState.activeSkills[idx].activeGem?.name || 'Skill';
                this.callbacks.onNotification(`${gemName} Evolved!`);
            }
        }
        else {
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
        // Pass actual active skills for upgrade context logic
        const options = generateRewards(this.gameState.level, this.gameState.activeSkills);
        this.callbacks.onLevelUp(options);
    }

    private gainXp(amount: number) {
        // Level Gap Penalty Logic
        let penaltyMultiplier = 1.0;
        // Default Tier 1 if hideout or unknown
        const mapTier = this.gameState.worldState === 'RUN' ? this.gameState.currentMapStats.tier : 1; 
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

    private spawnLoot(x: number, y: number, force = false, chanceOverride?: number) {
        // Base probability calculation: 2% by default
        let finalChance = chanceOverride ?? LOOT_CHANCE;
        
        if (this.gameState.worldState === 'RUN') {
            // Scale chance by map rarity multiplier (Base 1 + bonuses)
            finalChance *= this.gameState.currentMapStats.rarityMult; 
        }

        if (!force && Math.random() > finalChance) return;
        
        const loot = this.loot.find(l => !l.active);
        if (loot) {
            const roll = Math.random();
            let rarity: ItemRarity = 'normal';
            const rarityBoost = this.gameState.worldState === 'RUN' ? this.gameState.currentMapStats.rarityMult : 1;
            
            // REMOVED UNIQUE DROP LOGIC
            // if (roll > 0.95 / rarityBoost) rarity = 'unique'; 
            if (roll > 0.85 / rarityBoost) rarity = 'rare';
            else if (roll > 0.6 / rarityBoost) rarity = 'magic';

            const iLvl = this.gameState.worldState === 'RUN' ? this.gameState.currentMapStats.tier : 1;
            const item = generateItem('random', iLvl, rarity);

            loot.active = true;
            loot.x = x;
            loot.y = y;
            loot.lifeTime = 60; 
            loot.itemData = item;
            loot.rarity = rarity;
            loot.autoCollectRadius = 50; 
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
        enemy.statuses = {}; // Reset statuses

        // Reset timers
        enemy.trailTimer = 0;
        enemy.blastTimer = 0;

        if (isElite || (type === 'boss') || this.gameState.currentFloor >= 3) {
            // Chance to add random modifiers
            const modCount = type === 'boss' ? 3 : isElite ? 2 : 1;
            
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
                                id: uuid(),
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
    
    private drawPlayer(ctx: CanvasRenderingContext2D, x: number, y: number, dt: number) {
        const time = Date.now() / 1000;
        const isMoving = this.joystickState.active;
        const facingLeft = this.joystickState.vector.x < 0;

        ctx.save();
        ctx.translate(x + PLAYER_SIZE / 2, y + PLAYER_SIZE / 2);

        // -- 1. Draw Shadow/Aura (Stationary relative to feet) --
        ctx.save();
        ctx.scale(1, 0.4); // Flatten Y
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.arc(0, 50, 20 + Math.sin(time * 3) * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Aura Glow
        const auraColor = 'rgba(34, 211, 238, 0.15)'; // Cyan glow low opacity
        ctx.fillStyle = auraColor;
        ctx.beginPath();
        ctx.arc(0, 50, 35 + Math.sin(time * 2) * 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // -- 2. Animation Math --
        // Idle breathing vs Walking bob
        const bobSpeed = isMoving ? 15 : 3;
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
        ctx.strokeStyle = '#4b3b2c'; // Dark wood
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 20); // Bottom of staff
        ctx.lineTo(0, -35); // Top of staff
        ctx.stroke();

        // Staff Head (Gem)
        const gemColor = '#22d3ee'; // Cyan
        ctx.fillStyle = gemColor;
        ctx.shadowColor = gemColor;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, -35, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow

        // Hand
        ctx.fillStyle = '#1e1b4b'; // Glove color
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // -- 4. Robe Body --
        const robeDark = '#1e1b4b'; // Deep Indigo
        const robeLight = '#312e81'; // Lighter Indigo for highlights

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
        ctx.fillStyle = '#0f172a'; // Darker inner hood
        ctx.beginPath();
        ctx.moveTo(0, -22);
        ctx.bezierCurveTo(10, -20, 12, -10, 0, -5); // Opening shape
        ctx.bezierCurveTo(-12, -10, -10, -20, 0, -22);
        ctx.fill();

        // -- 6. Glowing Eyes --
        const eyeColor = '#22d3ee'; // Cyan
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
        const currentTime = Date.now(); // Cache time

        for (const effect of this.gameState.groundEffects) {
            ctx.save();
            ctx.translate(effect.x, effect.y);

            if (effect.type === 'fire_ground') {
                // Lighter blending for core flame
                ctx.globalCompositeOperation = 'lighter';
                
                // Jittery radius
                const jitter = Math.sin(currentTime * 0.015 + effect.x) * 3;
                const r = Math.max(0, effect.radius + jitter);

                // Radial Gradient
                const grad = ctx.createRadialGradient(0, 0, r * 0.1, 0, 0, r);
                grad.addColorStop(0, '#fef08a'); // Bright Yellow (Core)
                grad.addColorStop(0.4, '#ea580c'); // Orange Red (Body)
                grad.addColorStop(1, 'rgba(0,0,0,0)'); // Transparent

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(0, 0, r, 0, Math.PI * 2);
                ctx.fill();

                // Dark Charred Edge (Source-Over to darken)
                ctx.globalCompositeOperation = 'source-over';
                ctx.strokeStyle = '#431407'; // Very dark brown/red
                ctx.lineWidth = 2;
                ctx.stroke();

                // Occasional Ember Particle
                if (Math.random() < 0.05) {
                    this.gameState.particles.push({
                        id: Math.random(),
                        x: effect.x + (Math.random() - 0.5) * r * 0.8,
                        y: effect.y + (Math.random() - 0.5) * r * 0.8,
                        vx: (Math.random() - 0.5) * 20,
                        vy: -30 - Math.random() * 30, // Upwards
                        life: 0.5 + Math.random() * 0.5,
                        maxLife: 1.0,
                        color: '#fdba74', // Light orange
                        size: Math.random() * 3 + 1
                    });
                }
            } 
            else if (effect.type === 'ice_ground') {
                // Base Glow
                ctx.globalCompositeOperation = 'screen'; // Icy glow
                ctx.fillStyle = 'rgba(6, 182, 212, 0.15)'; // Cyan tint
                ctx.beginPath();
                ctx.arc(0, 0, effect.radius, 0, Math.PI * 2);
                ctx.fill();

                // Glowing Edge
                ctx.strokeStyle = 'rgba(207, 250, 254, 0.4)'; // Light cyan
                ctx.lineWidth = 2;
                ctx.stroke();

                // Static Cracks (Pseudo-random based on position)
                ctx.strokeStyle = '#cffafe'; // White-ish Cyan
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                
                // Use coordinate as seed
                const seed = Math.abs(effect.x * 123 + effect.y * 456); 
                const crackCount = 3 + (seed % 3); // 3 to 5 cracks
                
                for(let i=0; i<crackCount; i++) {
                    const angle = (seed + i * (Math.PI * 2 / crackCount)) % (Math.PI * 2);
                    const len = effect.radius * (0.4 + ((seed * (i+1)) % 60) / 100); // 0.4 to 1.0 radius
                    ctx.moveTo(0, 0);
                    ctx.lineTo(Math.cos(angle) * len, Math.sin(angle) * len);
                }
                ctx.stroke();
            }
            else if (effect.type === 'lightning_ground') {
                ctx.globalCompositeOperation = 'lighter';
                
                // Static Field Base
                ctx.fillStyle = 'rgba(168, 85, 247, 0.15)'; // Purple
                ctx.beginPath();
                ctx.arc(0, 0, effect.radius, 0, Math.PI * 2);
                ctx.fill();

                // Dynamic Arc (30% chance)
                if (Math.random() < 0.3) {
                    const angle = Math.random() * Math.PI * 2;
                    const r = effect.radius;
                    
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    // Jagged line
                    const midX = Math.cos(angle) * r * 0.5 + (Math.random()-0.5)*20;
                    const midY = Math.sin(angle) * r * 0.5 + (Math.random()-0.5)*20;
                    const endX = Math.cos(angle) * r;
                    const endY = Math.sin(angle) * r;
                    
                    ctx.lineTo(midX, midY);
                    ctx.lineTo(endX, endY);

                    ctx.strokeStyle = '#fef08a'; // Yellow-200
                    ctx.lineWidth = 2;
                    ctx.shadowColor = '#a855f7';
                    ctx.shadowBlur = 10;
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                }
            }
            else if (effect.type === 'bubble') {
                // Void Bubble
                ctx.fillStyle = 'rgba(88, 28, 135, 0.2)'; // Deep Purple
                ctx.beginPath();
                ctx.arc(0, 0, effect.radius, 0, Math.PI * 2);
                ctx.fill();

                // Rune Rings
                ctx.strokeStyle = '#d8b4fe'; // Lavender
                ctx.lineWidth = 2;
                
                // Ring 1: Clockwise
                ctx.save();
                ctx.rotate(currentTime * 0.001);
                ctx.setLineDash([15, 10]); // Dash pattern
                ctx.beginPath();
                ctx.arc(0, 0, effect.radius * 0.9, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();

                // Ring 2: Counter-Clockwise
                ctx.save();
                ctx.rotate(-currentTime * 0.0015);
                ctx.setLineDash([5, 15]); // Different dash
                ctx.beginPath();
                ctx.arc(0, 0, effect.radius * 0.7, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }
            else if (effect.type === 'blast_warning') {
                // "Doom" Timer style
                const progress = Math.max(0, Math.min(1, 1.0 - (effect.duration / 1.5))); 

                // 1. Danger Zone Background
                ctx.fillStyle = 'rgba(69, 10, 10, 0.3)'; // Dark Red bg
                ctx.beginPath();
                ctx.arc(0, 0, effect.radius, 0, Math.PI * 2);
                ctx.fill();

                // 2. Countdown Fill (Solid expanding circle)
                ctx.fillStyle = 'rgba(239, 68, 68, 0.5)'; // Red-500
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.arc(0, 0, effect.radius * progress, 0, Math.PI * 2);
                ctx.fill();

                // 3. Danger Border
                ctx.strokeStyle = '#ef4444';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(0, 0, effect.radius, 0, Math.PI * 2);
                ctx.stroke();
            }

            ctx.restore();
        }

        // --- DRAW NPCs ---
        for (const npc of this.gameState.npcs) {
            ctx.save();
            ctx.translate(npc.x + npc.width/2, npc.y + npc.height/2);
            
            // 呼吸动画
            const breathe = Math.sin(Date.now() / 500) * 1.5;

            // 1. 绘制交互范围圈 (保持微妙)
            ctx.beginPath();
            ctx.arc(0, 0, npc.interactionRadius, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(34, 197, 94, 0.15)'; // 非常淡的绿色
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]); // 重置虚线

            // 2. 绘制沉重的背包 (Backpack) - 在身体后方
            ctx.save();
            ctx.rotate(-0.2); // 稍微倾斜
            ctx.fillStyle = '#78350f'; // 皮革棕
            ctx.beginPath();
            // 一个巨大的椭圆背包
            ctx.ellipse(15, -5 + breathe, 22, 28, 0, 0, Math.PI * 2);
            ctx.fill();
            // 背包绑带/补丁细节
            ctx.fillStyle = '#92400e'; 
            ctx.fillRect(10, -15 + breathe, 10, 20);
            // 挂着的卷轴筒
            ctx.fillStyle = '#fcd34d'; // 金色卷轴
            ctx.beginPath();
            ctx.arc(25, 10 + breathe, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // 3. 绘制长袍身体 (Body)
            ctx.fillStyle = '#451a03'; // 深褐色长袍
            ctx.beginPath();
            // 梯形身体
            ctx.moveTo(-10, -15 + breathe);
            ctx.lineTo(10, -15 + breathe);
            ctx.lineTo(14, 20 + breathe);
            ctx.lineTo(-14, 20 + breathe);
            ctx.fill();

            // 4. 绘制兜帽头部 (Hood)
            ctx.fillStyle = '#552006'; // 稍浅一点的褐色
            ctx.beginPath();
            ctx.arc(0, -18 + breathe, 11, 0, Math.PI * 2); // 头部轮廓
            ctx.fill();
            
            // 脸部阴影 (Mystery Face)
            ctx.fillStyle = '#1a0500'; // 极深棕色
            ctx.beginPath();
            ctx.arc(0, -16 + breathe, 7, 0, Math.PI, false); // 半圆阴影
            ctx.fill();

            // 5. 悬浮的金币图标 (Floating Icon)
            const iconFloat = Math.sin(Date.now() / 300) * 3;
            ctx.fillStyle = '#fbbf24'; // 金色
            ctx.shadowColor = '#fbbf24';
            ctx.shadowBlur = 10;
            ctx.font = '20px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText("$", 0, -45 + iconFloat + breathe);
            ctx.shadowBlur = 0; // 重置光晕

            // 名字标签
            ctx.fillStyle = '#86efac'; // 亮绿色文字
            ctx.font = 'bold 10px sans-serif';
            ctx.fillText(npc.name, 0, 35);

            ctx.restore();
        }

        // --- DRAW INTERACTABLES ---
        for (const int of this.gameState.interactables) {
            if (int.type === 'map_device') {
                ctx.save();
                ctx.translate(int.x + int.width/2, int.y + int.height/2);

                // 1. Pedestal (Stone Base)
                ctx.fillStyle = '#292524'; // Stone-800
                ctx.beginPath();
                ctx.arc(0, 0, 50, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#57534e'; // Stone-600 Highlight
                ctx.lineWidth = 3;
                ctx.stroke();

                // 2. Pillars (Cardinal Supports)
                ctx.fillStyle = '#44403c'; // Stone-700
                for(let i=0; i<4; i++) {
                    ctx.save();
                    ctx.rotate((Math.PI / 2) * i);
                    ctx.translate(0, -48); // Push out to edge
                    ctx.fillRect(-8, -8, 16, 16); // Square Pillar
                    // Bevel detail
                    ctx.strokeStyle = '#1c1917';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(-8, -8, 16, 16);
                    ctx.restore();
                }

                const t = Date.now() / 1000;

                // 3. Mechanical Ring (Bronze Gear)
                ctx.save();
                ctx.rotate(t * 0.5); // Slow Rotation
                ctx.strokeStyle = '#b45309'; // Amber-700 (Bronze)
                ctx.lineWidth = 4;
                ctx.setLineDash([8, 6]); // Gear teeth look
                ctx.beginPath();
                ctx.arc(0, 0, 38, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();

                // 4. Energy Core (Void Receptacle)
                ctx.save();
                // Breathing effect
                const pulse = 1 + Math.sin(t * 2) * 0.05;
                ctx.scale(pulse, pulse);

                const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 32);
                grad.addColorStop(0, '#d8b4fe'); // Light Purple core
                grad.addColorStop(0.4, '#7e22ce'); // Purple body
                grad.addColorStop(1, '#000000');   // Dark edge

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(0, 0, 32, 0, Math.PI * 2);
                ctx.fill();

                // Inner Void Swirls (Counter-rotating)
                ctx.rotate(-t);
                ctx.strokeStyle = 'rgba(216, 180, 254, 0.3)'; // Faint Lavender
                ctx.lineWidth = 2;
                ctx.setLineDash([]); // Reset dash
                ctx.beginPath();
                ctx.arc(0, 0, 20, 0, Math.PI * 1.5); // Incomplete circle
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(0, 0, 10, Math.PI, Math.PI * 2.5); // Smaller incomplete circle offset
                ctx.stroke();

                ctx.restore();

                // 5. Floating Hologram
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.font = '24px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.shadowColor = '#d8b4fe';
                ctx.shadowBlur = 10;
                // Bobbing up and down
                ctx.fillText("🗺️", 0, -10 + Math.sin(t * 3) * 3);
                ctx.shadowBlur = 0; // Reset

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
                ctx.arc(0, 0, Math.max(0, eff.radius! * (1.5 - progress)), 0, Math.PI * 2); // Expanding
                ctx.fill();
                ctx.restore();
            } else if (eff.type === 'flame_ring_visual') {
                ctx.save();
                ctx.translate(eff.x, eff.y);
                const lifeRatio = eff.lifeTime / eff.maxLifeTime;
                const alpha = Math.max(0, lifeRatio);
                const currentRadius = eff.radius || 100; // Radius calculated in physics

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
            } else if (eff.type === 'falling_ice') {
                ctx.save();
                // Calculate falling animation: Accelerate from height (h=300)
                const dropHeight = 300;
                const progress = 1 - (eff.lifeTime / eff.maxLifeTime); // 0 to 1
                const easeIn = progress * progress; // Acceleration
                const currentY = eff.y - dropHeight * (1 - easeIn); 

                ctx.translate(eff.x, currentY);

                // 1. Draw Ice Shard (Inverted Triangle)
                ctx.beginPath();
                // Ice Blue Gradient
                const grad = ctx.createLinearGradient(0, -60, 0, 0);
                grad.addColorStop(0, 'rgba(255, 255, 255, 0)'); // Tail transparent
                grad.addColorStop(0.5, '#bae6fd'); // Sky-200
                grad.addColorStop(1, '#ffffff'); // Tip pure white
                ctx.fillStyle = grad;
                
                ctx.moveTo(0, 0); // Tip
                ctx.lineTo(-8, -80); // Top Left
                ctx.lineTo(8, -80); // Top Right
                ctx.fill();

                // 2. Draw Trail (Speed Lines)
                ctx.beginPath();
                ctx.fillStyle = 'rgba(186, 230, 253, 0.3)';
                ctx.moveTo(0, -20);
                ctx.lineTo(-4, -120);
                ctx.lineTo(4, -120);
                ctx.fill();

                // 3. Impact Shockwave (Last 20%)
                if (progress > 0.8) {
                    // Restore drawing context effectively to ground level implicitly by logic or check
                    // Since currentY is very close to eff.y here, we draw locally
                    const impactProgress = (progress - 0.8) * 5; // 0 to 1
                    ctx.scale(1 + impactProgress, 0.5 + impactProgress * 0.5); // Flattened expansion
                    ctx.beginPath();
                    ctx.fillStyle = `rgba(255, 255, 255, ${1 - impactProgress})`; // Fade out
                    ctx.arc(0, 0, 40 * impactProgress, 0, Math.PI * 2);
                    ctx.fill();
                }

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
                    case 'weapon': icon = "⚔️"; break;
                    case 'offhand': icon = "🛡️"; break;
                    case 'helmet': icon = "🪖"; break;
                    case 'body': icon = "👕"; break;
                    case 'gloves': icon = "🧤"; break;
                    case 'boots': icon = "👢"; break;
                    case 'ring1': 
                    case 'ring2': 
                    case 'amulet': icon = "💍"; break;
                }
            }
            ctx.fillText(icon, cx, cy);

            ctx.restore();
        }

        // Enemies
        let activeBoss: Enemy | null = null;
        for (const e of this.enemies) {
            if (!e.active) continue;
            
            // Optimization: Skip rendering if out of view
            if (e.x + e.width < camX - visibleWidth/2 || e.x > camX + visibleWidth/2 ||
                e.y + e.height < camY - visibleHeight/2 || e.y > camY + visibleHeight/2) {
                 if (e.type === 'boss') activeBoss = e; 
                 continue;
            }

            if (e.type === 'boss') activeBoss = e;

            // --- SHADOW CREATURE RENDERING ---
            ctx.save();
            const cx = e.x + e.width / 2;
            const cy = e.y + e.height / 2;
            ctx.translate(cx, cy);

            // 1. Determine Color Theme
            let themeColor = 'rgba(239, 68, 68, 1)'; // Red (Basic)
            let glowColor = 'rgba(239, 68, 68, 0.6)';
            let eyeColor = '#fee2e2';

            if (e.type === 'fast') {
                themeColor = 'rgba(6, 182, 212, 1)'; // Cyan
                glowColor = 'rgba(6, 182, 212, 0.6)';
                eyeColor = '#cffafe';
            } else if (e.type === 'tank') {
                themeColor = 'rgba(168, 85, 247, 1)'; // Purple
                glowColor = 'rgba(168, 85, 247, 0.6)';
                eyeColor = '#f3e8ff';
            } else if (e.type === 'boss') {
                 themeColor = 'rgba(234, 179, 8, 1)'; // Gold
                 glowColor = 'rgba(234, 179, 8, 0.8)';
                 eyeColor = '#ffffff';
            }

            // Ghostly modifier transparency
            if (e.modifiers.includes('ghostly')) ctx.globalAlpha = 0.6;

            // 2. Aura / Shadow
            ctx.shadowColor = themeColor;
            ctx.shadowBlur = e.type === 'boss' ? 30 : 15;

            // 3. Dark Body Base
            ctx.fillStyle = '#09090b'; // Zinc-950 (Dark matter)
            ctx.beginPath();
            const r = e.width / 2;
            // Draw slightly smaller than hitbox to account for glow
            ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
            ctx.fill();

            // 4. Inner Core Glow (Gradient)
            // Reset shadow to avoid expensive double-blur on gradient
            ctx.shadowBlur = 0;
            const grad = ctx.createRadialGradient(0, 0, r * 0.1, 0, 0, r);
            grad.addColorStop(0, glowColor);
            grad.addColorStop(0.6, 'rgba(0,0,0,0.1)'); // Fade out
            grad.addColorStop(1, 'rgba(0,0,0,0)'); // Transparent edge

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.fill();

            // 5. Glowing Eyes
            // Calculate angle to player to make eyes look at player
            const px = this.gameState.playerWorldPos.x + PLAYER_SIZE/2;
            const py = this.gameState.playerWorldPos.y + PLAYER_SIZE/2;
            const angle = Math.atan2(py - cy, px - cx);

            ctx.rotate(angle); // Rotate context to face player

            ctx.fillStyle = eyeColor;
            ctx.shadowColor = eyeColor;
            ctx.shadowBlur = 5;

            // Draw Eyes
            const eyeOffset = r * 0.35;
            const eyeSizeX = r * 0.25;
            const eyeSizeY = r * 0.12;

            // Left Eye
            ctx.beginPath();
            ctx.ellipse(eyeOffset, -eyeOffset/2, eyeSizeX, eyeSizeY, 0, 0, Math.PI*2);
            ctx.fill();
            // Right Eye
            ctx.beginPath();
            ctx.ellipse(eyeOffset, eyeOffset/2, eyeSizeX, eyeSizeY, 0, 0, Math.PI*2);
            ctx.fill();

            ctx.restore();
            
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
                // Draw a diamond indicator for elite
                ctx.beginPath();
                ctx.moveTo(e.x + e.width/2, e.y - 10);
                ctx.lineTo(e.x + e.width + 10, e.y + e.height/2);
                ctx.lineTo(e.x + e.width/2, e.y + e.height + 10);
                ctx.lineTo(e.x - 10, e.y + e.height/2);
                ctx.closePath();
                ctx.stroke();
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
            } else if (b.owner === 'player' && b.damageType === 'lightning') {
                // --- ELECTRO SPHERE RENDER ---
                const cx = b.x + b.width/2;
                const cy = b.y + b.height/2;
                const radius = b.width/2;

                ctx.save();
                ctx.translate(cx, cy);
                
                // Inner Core
                ctx.fillStyle = '#ccfbf1'; // Teal 100
                ctx.shadowColor = '#22d3ee';
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(0, 0, radius * 0.6, 0, Math.PI*2);
                ctx.fill();

                // Jittery Arcs
                ctx.strokeStyle = '#22d3ee'; // Cyan 400
                ctx.lineWidth = 2;
                ctx.shadowBlur = 5;
                ctx.beginPath();
                const segments = 8;
                for(let k=0; k<=segments; k++) {
                    const angle = (k/segments) * Math.PI*2;
                    const jitter = (Math.random() - 0.5) * 5;
                    const r = radius + jitter;
                    const px = Math.cos(angle) * r;
                    const py = Math.sin(angle) * r;
                    if(k===0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.stroke();

                ctx.restore();
            } else if (b.owner === 'player' && b.damageType === 'cold') {
                // --- ICE SHARD RENDER ---
                const cx = b.x + b.width / 2;
                const cy = b.y + b.height / 2;
                
                ctx.save();
                ctx.fillStyle = '#e0f2fe'; // Sky-100
                ctx.shadowColor = '#38bdf8'; // Sky-400
                ctx.shadowBlur = 10;
                
                // Diamond Shape for Ice
                ctx.beginPath();
                ctx.moveTo(cx, cy - 10);
                ctx.lineTo(cx + 8, cy);
                ctx.lineTo(cx, cy + 10);
                ctx.lineTo(cx - 8, cy);
                ctx.closePath();
                ctx.fill();
                
                ctx.shadowBlur = 0;
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
}
