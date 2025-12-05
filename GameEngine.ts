import { 
    GameState, Vector2, ItemInstance, ItemSlot, ActiveSkillInstance, UpgradeDefinition, 
    Interactable, Enemy, Bullet, Loot, XPOrb, GroundEffect, Particle, MapStats, 
    VisualEffect, EquipmentMap, NPC, DamageType, ItemRarity, EnemyType, JoystickState 
} from './types';
import { StatsSystem } from './StatsSystem';
import { SkillManager, SKILL_DATABASE } from './SkillSystem';
import { generateItem, generateRewards, createEndlessKey } from './ItemSystem';
import { AssetManager } from './AssetManager';

export const BACKPACK_CAPACITY = 50;
export const CAMERA_ZOOM = 1.0;

interface GameCallbacks {
    onGameOver: (isOver: boolean) => void;
    onHudUpdate: (data: any) => void;
    onLevelUp: (options: UpgradeDefinition[]) => void;
    onNotification: (text: string) => void;
    onInventoryChange: () => void;
    onNearbyInteractable: (int: Interactable | null) => void;
    onOpenShop: () => void;
}

export class GameEngine {
    canvas: HTMLCanvasElement | null = null;
    ctx: CanvasRenderingContext2D | null = null;
    gameState: GameState;
    playerStats: StatsSystem;
    callbacks: GameCallbacks;
    assetManager: AssetManager;
    
    // Entities
    enemies: Enemy[] = [];
    bullets: Bullet[] = [];
    loot: Loot[] = [];
    xpOrbs: XPOrb[] = [];
    
    // Director
    directorState = { gameTime: 0, spawnTimer: 0, bossSpawned: false };
    
    // Input
    keys: Set<string> = new Set();
    joystick: JoystickState = { active: false, origin: {x:0, y:0}, current: {x:0, y:0}, vector: {x:0, y:0} };
    
    // Loop
    running: boolean = false;
    lastTime: number = 0;
    animationId: number = 0;

    constructor(callbacks: GameCallbacks) {
        this.callbacks = callbacks;
        this.playerStats = new StatsSystem();
        this.assetManager = new AssetManager();
        
        // Initial Game State
        this.gameState = {
            worldState: 'HIDEOUT',
            gold: 100,
            playerWorldPos: { x: 0, y: 0 },
            playerInvulnerabilityTimer: 0,
            velocity: { x: 0, y: 0 },
            lastFrameTime: 0,
            isGameOver: false,
            isPaused: false,
            score: 0,
            level: 1,
            xp: 0,
            nextLevelXp: 100,
            backpack: [],
            equipment: {
                helmet: null, amulet: null, weapon: null, offhand: null,
                body: null, gloves: null, ring1: null, ring2: null, boots: null
            },
            shakeTimer: 0,
            activeSkills: Array(4).fill(null).map((_, i) => ({ 
                instanceId: `skill_${i}`, 
                activeGem: null, 
                supportGems: [null, null, null], // 3 support slots
                cooldownTimer: 0 
            })),
            gemInventory: [],
            interactables: [],
            npcs: [],
            currentMapStats: { tier: 0, monsterHealthMult: 1, monsterDamageMult: 1, packSizeMult: 1, xpMult: 1, rarityMult: 1 },
            pendingSupportGem: null,
            isSelectingSupport: false,
            currentFloor: 0,
            targetKills: 0,
            currentKills: 0,
            currentMaxEnemies: 50,
            expeditionActive: false,
            groundEffects: [],
            particles: [],
            xpOrbs: [],
            isEndlessMode: false
        };

        this.playerStats.reset();
        this.setupHideout();
    }

    setCanvas(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }

    async loadAssets() {
        // Placeholder for asset loading logic
    }

    start() {
        if (this.running) return;
        this.running = true;
        this.lastTime = performance.now();
        this.loop();
    }

    stop() {
        this.running = false;
        cancelAnimationFrame(this.animationId);
    }

    loop = () => {
        if (!this.running || !this.ctx || !this.canvas) return;
        const now = performance.now();
        const dt = Math.min((now - this.lastTime) / 1000, 0.1);
        this.lastTime = now;

        if (!this.gameState.isPaused && !this.gameState.isGameOver) {
            this.update(dt);
        }
        this.draw();
        this.animationId = requestAnimationFrame(this.loop);
    }

    update(dt: number) {
        this.gameState.lastFrameTime = dt;
        
        // Director Logic (Simplified for compilation)
        if (this.gameState.worldState === 'RUN') {
             this.directorState.gameTime += dt;
             
             // Check Win/Next Floor Condition
             if (this.gameState.currentKills >= this.gameState.targetKills && !this.directorState.bossSpawned) {
                 // Spawn portal logic
                 if (!this.gameState.interactables.some(i => i.type.includes('portal'))) {
                     const portalType = this.gameState.currentFloor >= 5 && !this.gameState.isEndlessMode ? 'portal_return' : 'portal_next';
                     this.gameState.interactables.push({
                         id: Math.random(), active: true, x: this.gameState.playerWorldPos.x + 200, y: this.gameState.playerWorldPos.y, 
                         width: 50, height: 50, color: 'blue', type: portalType, interactionRadius: 60, label: 'Portal'
                     });
                     this.callbacks.onNearbyInteractable(this.gameState.interactables[this.gameState.interactables.length - 1]);
                     this.callbacks.onNotification("Portal Opened!");
                 }
             }
        }
    }

    draw() {
        if (!this.ctx || !this.canvas) return;
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Basic debug rendering
        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px monospace';
        this.ctx.fillText(`Gold: ${this.gameState.gold}`, 20, 30);
        this.ctx.fillText(`Mode: ${this.gameState.worldState}`, 20, 50);
        this.ctx.fillText(`Floor: ${this.gameState.currentFloor}`, 20, 70);
    }

    // --- INPUT HANDLERS ---
    handleStart = (e: any) => {
        // Placeholder for touch start
    }
    handleMove = (e: any) => {
        // Placeholder for touch move
    }
    handleEnd = (e: any) => {
        // Placeholder for touch end
    }

    // --- ACTIONS ---
    setupHideout() {
        this.gameState.worldState = 'HIDEOUT';
        this.gameState.interactables = [
            { id: 1, active: true, x: 200, y: 0, width: 50, height: 50, color: 'purple', type: 'map_device', interactionRadius: 80, label: 'Map Device' }
        ];
        this.gameState.npcs = [
             { id: 2, active: true, x: -200, y: 0, width: 50, height: 50, color: 'yellow', type: 'merchant', name: 'Merchant', interactionRadius: 80 }
        ];
        // Starter items
        if (this.gameState.backpack.length === 0 && this.gameState.gemInventory.length === 0) {
            this.gameState.backpack.push(generateItem('weapon', 1, 'normal'));
            this.gameState.backpack.push(generateItem('map', 1, 'normal'));
        }
    }

    toggleInventory(open: boolean) {
        this.gameState.isPaused = open;
    }

    handleInteract(interactable: Interactable) {
        if (interactable.type === 'map_device') {
            // Handled in UI
        } else if (interactable.type === 'portal_next') {
            this.enterNextFloor();
        } else if (interactable.type === 'portal_return') {
            this.returnToHideout();
        }
    }
    
    returnToHideout() {
        this.gameState.expeditionActive = false;
        this.setupHideout();
        this.gameState.playerWorldPos = { x: 0, y: 0 };
        this.callbacks.onNotification("Returned to Hideout");
        this.saveGame();
        this.updateHud();
    }

    // --- MAP SYSTEM & EXPEDITION LOOP ---
    
    public activateMap(mapItem: ItemInstance) {
        if (mapItem.type !== 'map') return;
        
        // Remove map from bag
        const idx = this.gameState.backpack.findIndex(i => i.id === mapItem.id);
        if (idx > -1) this.gameState.backpack.splice(idx, 1);
        this.callbacks.onInventoryChange();

        // Check for Endless Mode Key
        if (mapItem.id === 'map_endless_void') {
            this.gameState.isEndlessMode = true;
            this.gameState.currentFloor = 1;
            
            // Initialize Endless Stats (Base values)
            this.gameState.currentMapStats = {
                tier: 1,
                monsterHealthMult: 1.0,
                monsterDamageMult: 1.0,
                packSizeMult: 1.0,
                xpMult: 1.0,
                rarityMult: 1.0
            };
            
            this.gameState.targetKills = 100; // Base kills for Floor 1
            this.callbacks.onNotification("Endless Mode Started");

        } else {
            this.gameState.isEndlessMode = false;

            // Build Stats for Normal Maps
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

            if (mapItem.rarity === 'magic') { mapStats.rarityMult += 0.2; mapStats.packSizeMult += 0.1; }
            if (mapItem.rarity === 'rare') { mapStats.rarityMult += 0.5; mapStats.packSizeMult += 0.2; }
            if (mapItem.rarity === 'unique') { mapStats.rarityMult += 1.0; mapStats.xpMult += 0.5; }

            this.gameState.currentMapStats = mapStats;
            this.gameState.currentFloor = 1;
            
            // Extended Playtime Formula: 50 + (Floor * 50) + (Tier * 30)
            this.gameState.targetKills = 50 + (1 * 50) + (mapStats.tier * 30); 
            
            this.callbacks.onNotification(`Expedition Started: Floor 1`);
        }

        // Initialize Expedition Common
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
        this.gameState.npcs = []; // Clear NPCs in run
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

        // Clear entities
        this.enemies.forEach(e => e.active = false);
        this.bullets.forEach(b => b.active = false);
        this.loot.forEach(l => l.active = false); 
        this.xpOrbs.forEach(o => o.active = false);
        this.gameState.groundEffects = [];
        this.gameState.interactables = [];
        this.gameState.particles = [];

        if (this.gameState.isEndlessMode) {
            // --- ENDLESS MODE SCALING ---
            const floor = this.gameState.currentFloor;
            
            // Stats Scaling
            this.gameState.currentMapStats.monsterHealthMult = 1 + (floor * 0.1);
            this.gameState.currentMapStats.monsterDamageMult = 1 + (floor * 0.05);
            this.gameState.currentMapStats.xpMult = 1 + (floor * 0.05);

            // Target Kills Scaling
            this.gameState.targetKills = 50 + (floor * 50);

            this.callbacks.onNotification(`Endless Floor ${floor}`);
        } else {
            // --- NORMAL MODE LOGIC ---
            // Floor Scaling
            this.gameState.currentMapStats.monsterHealthMult *= 1.1; 
            this.gameState.currentMapStats.monsterDamageMult *= 1.1;
            
            // Floor 5 is Boss Floor
            if (this.gameState.currentFloor === 5) {
                 this.gameState.targetKills = 1; 
                 this.spawnEnemy('boss');
                 this.directorState.bossSpawned = true;
                 this.callbacks.onNotification(`FLOOR 5: BOSS ENCOUNTER`);
            } else {
                 // Extended Playtime Formula
                 this.gameState.targetKills = 50 + (this.gameState.currentFloor * 50) + (this.gameState.currentMapStats.tier * 30);
                 this.callbacks.onNotification(`Descended to Floor ${this.gameState.currentFloor}`);
            }
        }

        this.saveGame();
        this.updateHud();
    }

    // --- UTILS & HELPERS ---
    saveGame() {
        // Placeholder
    }
    
    updateHud() {
        this.callbacks.onHudUpdate({
            level: this.gameState.level,
            xp: this.gameState.xp,
            nextLevelXp: this.gameState.nextLevelXp,
            waveName: this.gameState.worldState === 'HIDEOUT' ? 'HIDEOUT' : `FLOOR ${this.gameState.currentFloor}`,
            currentHp: 100, // Placeholder
            maxHp: this.playerStats.getStatValue('maxHp'),
            currentFloor: this.gameState.currentFloor,
            currentKills: this.gameState.currentKills,
            targetKills: this.gameState.targetKills,
            gold: this.gameState.gold
        });
    }
    
    spawnEnemy(type: string) {
        // Placeholder implementation
        this.enemies.push({
            id: Math.random(), active: true, x: 500, y: 0, width: 30, height: 30, color: 'red',
            type: type as EnemyType, hp: 100, maxHp: 100, speed: 50, modifiers: [], isElite: false,
            resistances: { physical:0, fire:0, cold:0, lightning:0, chaos:0 }, statuses: {}
        });
    }

    // --- CANVAS INTERFACE METHODS ---
    resetGame() {
        this.gameState.isGameOver = false;
        this.setupHideout();
        this.updateHud();
    }
    
    selectUpgrade(option: UpgradeDefinition) {
        // Placeholder
        this.callbacks.onNotification(`Selected ${option.name}`);
    }
    
    equipSupportToSkill(skillIndex: number) {
        const gem = this.gameState.pendingSupportGem;
        if (!gem) return;
        const skill = this.gameState.activeSkills[skillIndex];
        const emptySlot = skill.supportGems.findIndex(s => s === null);
        if (emptySlot !== -1) {
            skill.supportGems[emptySlot] = gem;
        } else {
            if(skill.supportGems[0]) this.gameState.backpack.push(skill.supportGems[0]!);
            skill.supportGems[0] = gem;
        }
        this.gameState.pendingSupportGem = null;
        this.gameState.isSelectingSupport = false;
        this.gameState.isPaused = false;
        this.callbacks.onInventoryChange();
    }
    
    stashPendingSupportGem() {
        if (this.gameState.pendingSupportGem) {
            this.gameState.backpack.push(this.gameState.pendingSupportGem);
            this.gameState.pendingSupportGem = null;
            this.gameState.isSelectingSupport = false;
            this.gameState.isPaused = false;
            this.callbacks.onInventoryChange();
        }
    }
    
    sellSingleItem(item: ItemInstance) {
        const idx = this.gameState.backpack.indexOf(item);
        if (idx > -1) {
            this.gameState.backpack.splice(idx, 1);
            this.gameState.gold += 10;
            this.callbacks.onInventoryChange();
            this.updateHud();
        }
    }
    
    equipItem(item: ItemInstance) {
        if (item.type !== 'equipment') return;
        const slot = item.slot as ItemSlot;
        const current = this.gameState.equipment[slot];
        if (current) {
            this.gameState.equipment[slot] = item;
            const idx = this.gameState.backpack.indexOf(item);
            this.gameState.backpack[idx] = current;
        } else {
            this.gameState.equipment[slot] = item;
            const idx = this.gameState.backpack.indexOf(item);
            this.gameState.backpack.splice(idx, 1);
        }
        this.callbacks.onInventoryChange();
    }
    
    unequipItem(slot: ItemSlot) {
        const current = this.gameState.equipment[slot];
        if (current) {
            this.gameState.equipment[slot] = null;
            this.gameState.backpack.push(current);
            this.callbacks.onInventoryChange();
        }
    }
    
    sellBatch(mode: string) {
        this.callbacks.onNotification(`Sold batch: ${mode}`);
    }
    
    equipGem(gem: ItemInstance, slot: number, isSupport: boolean, subIndex: number = 0) {
        if (!isSupport) {
            // Equip Active Gem
            const current = this.gameState.activeSkills[slot].activeGem;
            this.gameState.activeSkills[slot].activeGem = gem;
            // Remove from bag
            const gemIdx = this.gameState.gemInventory.findIndex(g => g === gem);
            if (gemIdx > -1) this.gameState.gemInventory.splice(gemIdx, 1);
            // Return old to bag
            if (current) this.gameState.gemInventory.push(current);
        } else {
            // Equip Support Gem
            const current = this.gameState.activeSkills[slot].supportGems[subIndex];
            this.gameState.activeSkills[slot].supportGems[subIndex] = gem;
             // Remove from bag
            const gemIdx = this.gameState.gemInventory.findIndex(g => g === gem);
            if (gemIdx > -1) this.gameState.gemInventory.splice(gemIdx, 1);
            // Return old to bag
            if (current) this.gameState.gemInventory.push(current);
        }
        this.callbacks.onInventoryChange();
    }
    
    unequipGem(slot: number, isSupport: boolean, subIndex: number) {
        if (!isSupport) {
            const current = this.gameState.activeSkills[slot].activeGem;
            if (current) {
                this.gameState.activeSkills[slot].activeGem = null;
                this.gameState.gemInventory.push(current);
            }
        } else {
            const current = this.gameState.activeSkills[slot].supportGems[subIndex];
            if (current) {
                this.gameState.activeSkills[slot].supportGems[subIndex] = null;
                this.gameState.gemInventory.push(current);
            }
        }
        this.callbacks.onInventoryChange();
    }
}