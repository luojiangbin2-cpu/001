
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { UpgradeDefinition, ItemSlot, ItemInstance, ResolvedSkill, MAX_SKILL_SLOTS, Interactable, ItemRarity } from '../types';
import { GameEngine, BACKPACK_CAPACITY, CAMERA_ZOOM } from '../GameEngine';
import { SKILL_DATABASE, SkillManager } from '../SkillSystem';
import { t, Language } from '../locales';

const StatRow: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color = "text-white" }) => (
    <div className="flex justify-between items-center text-xs border-b border-zinc-800/50 pb-0.5">
        <span className="text-zinc-500">{label}</span>
        <span className={`font-mono font-bold ${color}`}>{value}</span>
    </div>
);

export const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // UI Throttling Ref
  const lastUiUpdate = useRef(0);

  // UI State
  const [gameOverUI, setGameOverUI] = useState(false);
  const [hudState, setHudState] = useState({ 
      level: 1, xp: 0, nextLevelXp: 30, waveName: 'HIDEOUT', currentHp: 100, maxHp: 100,
      currentFloor: 0, currentKills: 0, targetKills: 10, gold: 0
  });
  const [upgradeState, setUpgradeState] = useState<{ show: boolean, options: UpgradeDefinition[] }>({ show: false, options: [] });
  const [notification, setNotification] = useState<{ text: string, visible: boolean, id: number }>({ text: '', visible: false, id: 0 });
  const [showInventory, setShowInventory] = useState(false);
  const [showSkills, setShowSkills] = useState(false); 
  const [showMapDevice, setShowMapDevice] = useState(false);
  const [showMerchant, setShowMerchant] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [language, setLanguage] = useState<Language>('zh');
  const [nearbyInteractable, setNearbyInteractable] = useState<Interactable | null>(null);
  const [autoSort, setAutoSort] = useState(false);

  const [, setTick] = useState(0); 
  
  // New: Portal Indicator State
  const [portalIndicator, setPortalIndicator] = useState<{angle: number, label: string, color: string} | null>(null);

  // New: Skill UI State
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0);

  // New: Map Device State
  const [selectedMap, setSelectedMap] = useState<ItemInstance | null>(null);

  // New: Inventory Tabs
  const [inventoryTab, setInventoryTab] = useState<'equipment' | 'map'>('equipment');

  // New: Backpack Pagination
  const [backpackPage, setBackpackPage] = useState(0);
  const ITEMS_PER_PAGE = 50;

  // Touch/Swipe State
  const [touchStart, setTouchStart] = useState<number | null>(null);

  // Tooltip State
  const [tooltip, setTooltip] = useState<{ item: ItemInstance, x: number, y: number, incompatible?: boolean } | null>(null);

  // --- Callbacks passed to Engine ---
  
  const onGameOver = useCallback((isOver: boolean) => {
    setGameOverUI(isOver);
  }, []);

  const onHudUpdate = useCallback((data: any) => {
    const now = Date.now();
    // Throttle UI updates to avoid excessive re-renders (100ms interval) unless forced
    if (data.forceUpdate || now - lastUiUpdate.current > 100) {
        setHudState(data);
        lastUiUpdate.current = now;
    }
  }, []);

  const onLevelUp = useCallback((options: UpgradeDefinition[]) => {
    setUpgradeState({ show: true, options });
  }, []);

  const onNotification = useCallback((text: string) => {
    setNotification(prev => ({ text, visible: true, id: prev.id + 1 }));
    setTimeout(() => setNotification(prev => ({ ...prev, visible: false })), 3000);
  }, []);

  const onInventoryChange = useCallback(() => {
    setTick(t => t + 1);
  }, []);

  const onNearbyInteractable = useCallback((int: Interactable | null) => {
      setNearbyInteractable(int);
  }, []);

  const onOpenShop = useCallback(() => {
    // Open inventory and merchant UI simultaneously
    setShowMerchant(true);
    setShowInventory(true);
    setTick(t => t + 1);
  }, []);

  // --- Initialization ---

  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Create Engine
    const engine = new GameEngine({
        onGameOver,
        onHudUpdate,
        onLevelUp,
        onNotification,
        onInventoryChange,
        onNearbyInteractable,
        onOpenShop
    });

    engine.setCanvas(canvasRef.current);
    engine.loadAssets().then(() => {
        // Assets loaded
    });
    
    engine.start();
    engineRef.current = engine;

    // Handle Resize
    const resize = () => { 
        if (canvasRef.current && canvasRef.current.parentElement) { 
            canvasRef.current.width = canvasRef.current.parentElement.clientWidth; 
            canvasRef.current.height = canvasRef.current.parentElement.clientHeight; 
        } 
    };
    window.addEventListener('resize', resize);
    resize();

    // Input Events
    const cvs = canvasRef.current;
    cvs.addEventListener('mousedown', engine.handleStart); 
    cvs.addEventListener('mousemove', engine.handleMove); 
    window.addEventListener('mouseup', engine.handleEnd);
    cvs.addEventListener('touchstart', engine.handleStart, {passive:false}); 
    cvs.addEventListener('touchmove', engine.handleMove, {passive:false}); 
    window.addEventListener('touchend', engine.handleEnd);
    
    // Portal Indicator Loop
    let animationFrameId: number;
    const renderLoop = () => {
        if (engineRef.current) {
            const gameState = engineRef.current.gameState;
            const portals = gameState.interactables.filter(i => i.type.includes('portal'));
            
            if (portals.length > 0) {
                // Find nearest portal
                const portal = portals[0];
                const px = gameState.playerWorldPos.x;
                const py = gameState.playerWorldPos.y;
                
                const dx = (portal.x - px);
                const dy = (portal.y - py);
                
                // Convert to approximate screen space offset based on zoom
                const screenDx = dx * CAMERA_ZOOM; 
                const screenDy = dy * CAMERA_ZOOM;

                const halfW = window.innerWidth / 2;
                const halfH = window.innerHeight / 2;
                const margin = 50;
                
                // Check if offscreen (roughly)
                if (Math.abs(screenDx) > halfW - margin || Math.abs(screenDy) > halfH - margin) {
                    const angle = Math.atan2(screenDy, screenDx);
                    setPortalIndicator({ 
                        angle, 
                        label: portal.type === 'portal_return' ? 'EXIT' : 'NEXT',
                        color: portal.type === 'portal_return' ? 'text-green-500' : 'text-blue-500'
                    });
                } else {
                    setPortalIndicator(null);
                }
            } else {
                setPortalIndicator(null);
            }
        }
        animationFrameId = requestAnimationFrame(renderLoop);
    };
    renderLoop();

    return () => {
        engine.stop();
        window.removeEventListener('resize', resize);
        cvs.removeEventListener('mousedown', engine.handleStart); 
        cvs.removeEventListener('mousemove', engine.handleMove); 
        window.removeEventListener('mouseup', engine.handleEnd);
        cvs.removeEventListener('touchstart', engine.handleStart); 
        cvs.removeEventListener('touchmove', engine.handleMove); 
        window.removeEventListener('touchend', engine.handleEnd);
        cancelAnimationFrame(animationFrameId);
    };
  }, [onGameOver, onHudUpdate, onLevelUp, onNotification, onInventoryChange, onNearbyInteractable, onOpenShop]);

  // --- UI Handlers ---

  const handleToggleInventory = () => {
      const nextState = !showInventory;
      setShowInventory(nextState);
      if (nextState) {
          setShowSkills(false);
          setShowSettings(false);
          // If closing inventory, also close merchant
          if (!nextState) setShowMerchant(false);
      } else {
          setShowMerchant(false); // Force close merchant if bag closes
      }
      setTooltip(null); 
      engineRef.current?.toggleInventory(nextState);
  };
  
  const handleToggleSkills = () => {
      const nextState = !showSkills;
      setShowSkills(nextState);
      if (nextState) {
          setShowInventory(false);
          setShowMerchant(false);
          setShowSettings(false);
      }
      setTooltip(null);
      engineRef.current?.toggleInventory(nextState);
  };

  const handleToggleMerchant = () => {
      const nextState = !showMerchant;
      setShowMerchant(nextState);
      setShowInventory(nextState); // Merchant requires Inventory
      if (nextState) {
          setShowSkills(false);
          setShowSettings(false);
      }
      setTooltip(null);
      engineRef.current?.toggleInventory(nextState);
  };

  const handleToggleSettings = () => {
      const nextState = !showSettings;
      setShowSettings(nextState);
      if (nextState) {
          setShowInventory(false);
          setShowSkills(false);
          setShowMerchant(false);
      }
      engineRef.current?.toggleInventory(nextState);
  }

  const handleInteract = () => {
      if (!nearbyInteractable) return;
      if (nearbyInteractable.type === 'map_device') {
          setShowMapDevice(true);
          engineRef.current?.toggleInventory(true); // Pause game
      } else if (nearbyInteractable.type.includes('portal')) {
          engineRef.current?.handleInteract(nearbyInteractable);
      }
  };

  const handleCloseMapDevice = () => {
      setShowMapDevice(false);
      setSelectedMap(null);
      engineRef.current?.toggleInventory(false); // Unpause
  };

  const handleActivateMap = () => {
      if (selectedMap && engineRef.current) {
          engineRef.current.activateMap(selectedMap);
          handleCloseMapDevice();
      }
  };

  const handleReset = () => {
      engineRef.current?.resetGame();
      setGameOverUI(false);
      setUpgradeState({ show: false, options: [] });
      setShowInventory(false);
      setShowSkills(false);
      setShowMapDevice(false);
      setShowMerchant(false);
  };

  const handleSelectUpgrade = (option: UpgradeDefinition) => {
      engineRef.current?.selectUpgrade(option);
      setUpgradeState({ show: false, options: [] });
  };

  // Support Gem Link Handler
  const handleLinkSupport = (skillIndex: number) => {
      if (!engineRef.current) return;
      engineRef.current.equipSupportToSkill(skillIndex);
      // State updates automatically via inventory change callback, but we need to ensure UI re-renders
      setTick(t => t+1);
  };

  const handleStashSupport = () => {
      engineRef.current?.stashPendingSupportGem();
      setTick(t => t+1);
  };

  const handleItemClick = (item: ItemInstance) => {
      if (showMerchant) {
          // Sell Item
          engineRef.current?.sellSingleItem(item);
          setTooltip(null);
      } else if (item.type === 'equipment') {
          // Equip Item
          engineRef.current?.equipItem(item);
          setTooltip(null);
      }
  }
  
  const handleUnequip = (slot: ItemSlot) => {
      if (showMerchant) return; // Cannot unequip directly in shop mode (simplify UX)
      engineRef.current?.unequipItem(slot);
      setTooltip(null);
  };

  const handleItemHover = (e: React.MouseEvent, item: ItemInstance, incompatible: boolean = false) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltip({
          item,
          x: rect.right,
          y: rect.top,
          incompatible
      });
  };

  const handleItemLeave = () => {
      setTooltip(null);
  };

  const handleSellBatch = (mode: 'normal' | 'magic' | 'rare' | 'all_junk') => {
      engineRef.current?.sellBatch(mode);
  };

  // --- GEM HANDLERS ---
  const handleGemInventoryClick = (gem: ItemInstance) => {
      const activeSkill = engineRef.current?.gameState.activeSkills[selectedSlotIndex];
      if (!activeSkill) return;

      const def = SKILL_DATABASE[gem.gemDefinitionId || ''];
      if (!def) return;

      if (def.type === 'active') {
          engineRef.current?.equipGem(gem, selectedSlotIndex, false);
      } else {
          // Find first empty support slot, or overwrite first
          let emptyIndex = activeSkill.supportGems.findIndex(g => g === null);
          if (emptyIndex === -1) emptyIndex = 0; 
          engineRef.current?.equipGem(gem, selectedSlotIndex, true, emptyIndex);
      }
      setTooltip(null);
  };

  const handleSocketClick = (isSupport: boolean, subIndex: number) => {
      engineRef.current?.unequipGem(selectedSlotIndex, isSupport, subIndex);
      setTooltip(null);
  };

  // --- SORTING UTILS ---
  const getRarityWeight = (r: ItemRarity) => {
      switch(r) {
          case 'unique': return 4;
          case 'rare': return 3;
          case 'magic': return 2;
          default: return 1;
      }
  };

  const sortItems = (items: ItemInstance[]) => {
      return [...items].sort((a, b) => {
          const wA = getRarityWeight(a.rarity);
          const wB = getRarityWeight(b.rarity);
          if (wA !== wB) return wB - wA; // Descending rarity
          return a.name.localeCompare(b.name); // Ascending name
      });
  };

  // --- SWIPE HANDLERS FOR BACKPACK ---
  const handleTouchStart = (e: React.TouchEvent) => {
      setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
      if (touchStart === null) return;
      const touchEnd = e.changedTouches[0].clientX;
      const diff = touchStart - touchEnd;

      let count = 0;
      if (engineRef.current) {
         const backpack = engineRef.current.gameState.backpack;
         if (inventoryTab === 'equipment') count = backpack.filter(i => i.type === 'equipment').length;
         else if (inventoryTab === 'map') count = backpack.filter(i => i.type === 'map').length;
      }
      const totalPages = Math.ceil(Math.max(1, count) / ITEMS_PER_PAGE);

      if (diff > 50) {
          // Swipe Left -> Next Page
          setBackpackPage(prev => Math.min(totalPages - 1, prev + 1));
      } else if (diff < -50) {
          // Swipe Right -> Prev Page
          setBackpackPage(prev => Math.max(0, prev - 1));
      }
      setTouchStart(null);
  };

  const getDisplayName = (item: ItemInstance) => {
      if (item.type === 'gem' && item.gemDefinitionId) {
          return t(`skill_${item.gemDefinitionId}_name`, language);
      }
      if (item.type === 'equipment' && language === 'zh') {
          const rarity = t(`rarity_${item.rarity}` as any, language);
          const slotKey = (item.slot === 'ring1' || item.slot === 'ring2') ? 'base_ring' : `base_${item.slot}`;
          const base = t(slotKey as any, language);
          return `${rarity} ${base}`;
      }
      return item.name;
  };

  const getItemIcon = (item: ItemInstance) => {
    if (item.type === 'map') return '📜';
    switch (item.slot) {
        case 'weapon': return '⚔️';
        case 'offhand': return '🛡️';
        case 'helmet': return '🪖';
        case 'body': return '👕';
        case 'gloves': return '🧤';
        case 'boots': return '👢';
        case 'amulet': return '📿';
        case 'ring1': 
        case 'ring2': return '💍';
        default: return '❓';
    }
  }

  const getAbbreviation = (name: string, item?: ItemInstance) => {
    if (item) {
        if (item.type === 'gem') {
            return language === 'zh' ? getDisplayName(item).substring(0, 2) : name.substring(0, 3);
        }
        // Fallback for equipment if icon fails, though we use emoji now
        const displayName = getDisplayName(item);
        if (language === 'zh') return displayName.substring(0, 2);
        return displayName.substring(0, 3);
    }
    return name.substring(0, 3);
  };

  // --- Render Functions ---

  const renderSlot = (slot: ItemSlot, item: ItemInstance | null | undefined, sizeClass: string = 'aspect-square') => {
    let borderColor = "border-neutral-700";
    let bgColor = "bg-neutral-900";
    let shadow = "";

    if (item) {
        if (item.rarity === 'normal') { borderColor = "border-neutral-400"; bgColor="bg-neutral-800"; }
        if (item.rarity === 'magic') { borderColor = "border-blue-500"; bgColor="bg-blue-900/30"; shadow="shadow-[0_0_10px_rgba(59,130,246,0.3)]"; }
        if (item.rarity === 'rare') { borderColor = "border-yellow-500"; bgColor="bg-yellow-900/30"; shadow="shadow-[0_0_10px_rgba(234,179,8,0.3)]"; }
        if (item.rarity === 'unique') { borderColor = "border-orange-600"; bgColor="bg-orange-900/30"; shadow="shadow-[0_0_10px_rgba(234,88,12,0.5)]"; }
    }

    return (
        <div 
            onClick={() => item ? handleUnequip(slot) : null}
            onMouseEnter={(e) => item && handleItemHover(e, item)}
            onMouseLeave={handleItemLeave}
            className={`${sizeClass} ${bgColor} ${borderColor} border rounded flex flex-col items-center justify-center relative group cursor-pointer transition-all hover:brightness-110 active:scale-95 ${shadow} z-0 overflow-hidden`}
        >
            {!item && <span className="text-[9px] text-neutral-600 uppercase font-bold tracking-widest">{t(`item_${slot}` as any, language).substring(0, 3)}</span>}
            {item && (
                <div className="text-xl sm:text-2xl drop-shadow-md">
                    {getItemIcon(item)}
                </div>
            )}
        </div>
    );
  };

  const renderForgeSocket = (item: ItemInstance | null, isSupport: boolean, subIndex: number, isCompatible: boolean = true) => {
      let borderColor = isSupport ? "border-zinc-700" : "border-cyan-500";
      let bgColor = "bg-black/90";
      let size = isSupport ? "w-16 h-16" : "w-24 h-24";
      let shadow = "";
      
      if (item) {
          const def = SKILL_DATABASE[item.gemDefinitionId || ''];
          if (!isCompatible) {
              borderColor = "border-red-600 animate-pulse";
              bgColor = "bg-red-950/50";
              shadow = "shadow-[0_0_20px_rgba(220,38,38,0.5)]";
          } else {
              if (def?.tags.includes('fire')) { borderColor = "border-orange-500"; bgColor = "bg-orange-950/80"; shadow="shadow-[0_0_20px_rgba(249,115,22,0.4)]"; }
              else if (def?.tags.includes('movement')) { borderColor = "border-emerald-500"; bgColor = "bg-emerald-950/80"; shadow="shadow-[0_0_20px_rgba(16,185,129,0.4)]"; }
              else if (def?.tags.includes('area')) { borderColor = "border-blue-400"; bgColor = "bg-blue-950/80"; shadow="shadow-[0_0_20px_rgba(96,165,250,0.4)]"; }
              else { borderColor = isSupport ? "border-violet-400" : "border-cyan-400"; bgColor = isSupport ? "bg-violet-950/80" : "bg-cyan-950/80"; shadow = isSupport ? "shadow-[0_0_15px_rgba(167,139,250,0.4)]" : "shadow-[0_0_30px_rgba(34,211,238,0.4)]"; }
          }
      } else {
          // Empty state style
          if (!isSupport) {
               shadow = "shadow-[0_0_10px_rgba(34,211,238,0.1)]";
          }
      }

      return (
          <div 
            onClick={() => item && handleSocketClick(isSupport, subIndex)}
            onMouseEnter={(e) => item && handleItemHover(e, item, !isCompatible)}
            onMouseLeave={handleItemLeave}
            className={`${size} ${bgColor} border-2 ${borderColor} rounded-full flex items-center justify-center relative transition-all active:scale-95 z-10 cursor-pointer ${shadow}
                ${!item && isSupport ? 'border-dashed opacity-50' : ''}
            `}
          >
             {item ? (
                 <>
                     <span className={`text-white font-serif font-bold ${isSupport ? 'text-sm' : 'text-xl'} drop-shadow-md text-center leading-none px-1 ${!isCompatible ? 'text-red-300' : ''}`}>
                         {getAbbreviation(item.name, item)}
                     </span>
                     {!isCompatible && (
                         <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg border border-red-400">!</div>
                     )}
                 </>
             ) : (
                 <span className="text-zinc-600 text-[10px] font-bold tracking-widest">{isSupport ? 'SUP' : 'ACT'}</span>
             )}
          </div>
      );
  };

  // --- Tooltip Geometry Calculation ---
  let tooltipStyle: React.CSSProperties = {};
  if (tooltip) {
      const TOOLTIP_WIDTH = 220; 
      const SCREEN_PADDING = 10;
      const windowWidth = window.innerWidth;
      let leftPos = tooltip.x + 10;
      if (leftPos < SCREEN_PADDING) leftPos = SCREEN_PADDING;
      if (leftPos + TOOLTIP_WIDTH > windowWidth - SCREEN_PADDING) {
          leftPos = windowWidth - TOOLTIP_WIDTH - SCREEN_PADDING;
      }
      tooltipStyle = { top: tooltip.y, left: leftPos, transform: 'translateY(-10%)' };
  }

  const isSelectingSupport = engineRef.current?.gameState.isSelectingSupport;
  const pendingGem = engineRef.current?.gameState.pendingSupportGem;
  
  // Calculate Filtered Items for Display
  const backpackItems = engineRef.current ? engineRef.current.gameState.backpack : [];
  let filteredBackpack = backpackItems.filter(item => {
      if (inventoryTab === 'equipment') return item.type === 'equipment'; // Strict filtering: only equipment
      if (inventoryTab === 'map') return item.type === 'map';
      return false;
  });

  // Apply Sort to Backpack
  if (autoSort) {
      filteredBackpack = sortItems(filteredBackpack);
  }
  
  const totalBackpackPages = Math.ceil(Math.max(1, filteredBackpack.length) / ITEMS_PER_PAGE);

  // Helper for Wave Name translation logic (simple for now)
  const getWaveDisplayName = () => {
      if (hudState.waveName === 'HIDEOUT') return t('lbl_hideout', language);
      if (hudState.waveName.includes('BOSS')) return t('lbl_boss_floor', language);
      if (hudState.waveName.includes('FLOOR')) return `${t('lbl_floor', language)} ${hudState.currentFloor}`;
      return hudState.waveName;
  }

  return (
    <div className="relative w-full h-full font-sans select-none overflow-hidden">
        
        {/* HUD - Wave & XP & HP */}
        <div className="absolute top-2 left-0 w-full z-10 pointer-events-none flex flex-col items-center gap-1 px-16">
            <div className="bg-gradient-to-r from-transparent via-black/80 to-transparent w-full max-w-md flex flex-col items-center py-1 rounded-b-xl border-b border-white/5">
                 <div className="text-yellow-500 font-serif font-bold text-base tracking-widest drop-shadow-md uppercase flex flex-col items-center">
                    <span>{getWaveDisplayName()}</span>
                    {hudState.currentFloor > 0 && (
                         <div className="text-[10px] text-zinc-400 tracking-normal mt-0.5">
                             Kills: {hudState.currentKills} / {hudState.targetKills}
                         </div>
                    )}
                 </div>
                 
                 {/* HP Bar */}
                 <div className="w-full max-w-[200px] h-2.5 bg-neutral-900 rounded-full border border-neutral-700 relative overflow-hidden mt-1">
                    <div className="h-full bg-red-600" style={{ width: `${Math.min(100, Math.max(0, (hudState.currentHp / hudState.maxHp) * 100))}%` }}></div>
                 </div>
                 <div className="text-[10px] text-red-300 font-bold mt-0.5">{Math.round(hudState.currentHp)} / {Math.round(hudState.maxHp)} HP</div>

                 {/* XP Bar */}
                 <div className="w-full max-w-[200px] h-1 bg-neutral-900 rounded-full border border-neutral-800 relative overflow-hidden mt-0.5">
                    <div className="h-full bg-yellow-600" style={{ width: `${Math.min(100, (hudState.xp / hudState.nextLevelXp) * 100)}%` }}></div>
                 </div>
                 <div className="text-[9px] text-neutral-500 font-mono mt-0.5">{t('lbl_level', language)} {hudState.level}</div>
            </div>
        </div>

        {/* HUD - Buttons */}
        <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-2">
             {hudState.waveName !== 'HIDEOUT' && (
                 <button onClick={() => engineRef.current?.returnToHideout()} className="bg-black/80 hover:bg-red-900/80 text-red-500 border border-red-700/50 font-serif font-bold py-1.5 px-3 rounded shadow-lg active:scale-95 transition-all text-[10px] tracking-wider">
                    🏠 EXIT
                 </button>
             )}
             <button onClick={handleToggleSkills} className="bg-black/80 hover:bg-neutral-800 text-cyan-500 border border-cyan-700/50 font-serif font-bold py-1.5 px-3 rounded shadow-lg active:scale-95 transition-all text-[10px] tracking-wider">
                {t('ui_skills', language)}
             </button>
             <button onClick={handleToggleInventory} className="bg-black/80 hover:bg-neutral-800 text-yellow-500 border border-yellow-700/50 font-serif font-bold py-1.5 px-3 rounded shadow-lg active:scale-95 transition-all text-[10px] tracking-wider">
                {t('ui_bag', language)}
             </button>
             <button onClick={handleToggleSettings} className="bg-black/80 hover:bg-neutral-800 text-zinc-400 border border-zinc-700/50 py-1.5 px-3 rounded shadow-lg active:scale-95 transition-all text-[12px]">
                ⚙
             </button>
        </div>
        
        {/* PORTAL INDICATOR */}
        {portalIndicator && (
             <div 
                className={`absolute z-20 flex items-center justify-center pointer-events-none animate-pulse`}
                style={{
                    left: '50%',
                    top: '50%',
                    transform: `translate(-50%, -50%) rotate(${portalIndicator.angle}rad) translate(140px) rotate(${-portalIndicator.angle}rad)` 
                }}
             >
                 <div className={`flex flex-col items-center ${portalIndicator.color}`}>
                     <div className="text-2xl" style={{ transform: `rotate(${portalIndicator.angle + Math.PI/2}rad)` }}>
                         ▲
                     </div>
                     <span className="font-bold text-xs bg-black/80 px-1 rounded">{portalIndicator.label}</span>
                 </div>
             </div>
        )}

        {/* INTERACT BUTTON */}
        {nearbyInteractable && !showMapDevice && !showInventory && !showSkills && !isSelectingSupport && !showMerchant && (
             <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-30 animate-in fade-in zoom-in slide-in-from-bottom-4">
                 <button 
                    onClick={handleInteract}
                    className={`bg-purple-900/90 text-purple-100 border-2 border-purple-500 px-6 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(168,85,247,0.5)] active:scale-95 transition-all flex items-center gap-2
                        ${nearbyInteractable.type === 'portal_return' ? 'bg-green-900/90 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.5)]' : ''}
                    `}
                 >
                    <span className="text-xl">
                        {nearbyInteractable.type.includes('portal') ? (nearbyInteractable.type === 'portal_return' ? '🏠' : '🌀') : '🗺️'}
                    </span>
                    <span>{t('ui_interact', language).toUpperCase()}</span>
                 </button>
             </div>
        )}

        {/* Notifications */}
        {notification.visible && (
            <div className="absolute top-32 left-0 w-full z-20 pointer-events-none flex justify-center animate-in slide-in-from-top-2 fade-in duration-300">
                <div className="bg-black/80 backdrop-blur text-yellow-100 px-4 py-2 rounded-lg border border-yellow-500/30 shadow-2xl">
                    <span className="font-serif tracking-wider text-xs font-bold">{notification.text}</span>
                </div>
            </div>
        )}

        <canvas ref={canvasRef} className="block w-full h-full cursor-crosshair touch-none select-none"/>
        
        {/* SUPPORT GEM QUICK LINK UI */}
        {isSelectingSupport && pendingGem && engineRef.current && (
             <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center animate-in fade-in duration-200">
                 <h2 className="text-xl font-serif text-zinc-300 mb-2 tracking-widest">LINK GEM</h2>
                 <div className="flex items-center gap-2 mb-8 bg-zinc-900 p-3 rounded-lg border border-zinc-700">
                     <div className="w-10 h-10 bg-zinc-800 border-2 border-zinc-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                         {getAbbreviation(pendingGem.name, pendingGem)}
                     </div>
                     <div className="flex flex-col">
                        <span className="text-white font-bold text-sm">{t(`skill_${pendingGem.gemDefinitionId}_name`, language)}</span>
                        <span className="text-zinc-500 text-[10px]">Select an active skill to support</span>
                     </div>
                 </div>

                 <div className="flex gap-4 mb-8">
                     {engineRef.current.gameState.activeSkills.map((skill, i) => {
                         const hasActive = !!skill.activeGem;
                         let compatible = false;
                         if (hasActive) {
                             compatible = SkillManager.checkCompatibility(skill.activeGem!.gemDefinitionId!, pendingGem.gemDefinitionId!);
                         }

                         return (
                             <button
                                key={i}
                                disabled={!hasActive || !compatible}
                                onClick={() => handleLinkSupport(i)}
                                className={`w-20 h-20 rounded-xl border-2 flex flex-col items-center justify-center transition-all relative
                                    ${!hasActive 
                                        ? 'border-zinc-800 bg-zinc-900/50 opacity-50 cursor-not-allowed' 
                                        : compatible 
                                            ? 'border-green-500 bg-green-900/20 hover:bg-green-900/40 hover:scale-105 shadow-[0_0_15px_rgba(34,197,94,0.3)]' 
                                            : 'border-red-900 bg-red-950/20 opacity-50 cursor-not-allowed'
                                    }
                                `}
                             >
                                 <div className="text-2xl mb-1">{hasActive ? '💠' : '❌'}</div>
                                 <span className="text-[10px] font-bold text-white">
                                     {hasActive ? getAbbreviation(skill.activeGem!.name, skill.activeGem!) : 'Empty'}
                                 </span>
                                 {hasActive && !compatible && (
                                     <span className="absolute -top-2 -right-2 bg-red-600 text-[8px] px-1 rounded text-white">Incompatible</span>
                                 )}
                             </button>
                         )
                     })}
                 </div>

                 <button 
                    onClick={handleStashSupport}
                    className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-600 rounded font-serif text-sm tracking-wider"
                 >
                    STASH TO BAG
                 </button>
             </div>
        )}

        {/* SETTINGS MODAL */}
        {showSettings && (
             <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-200">
                 <div className="w-full max-w-sm bg-zinc-900 border border-zinc-700 rounded-lg p-6 flex flex-col gap-6">
                     <div className="flex justify-between items-center border-b border-zinc-700 pb-2">
                         <h2 className="text-xl text-zinc-200 font-serif tracking-widest">{t('settings_title', language)}</h2>
                         <button onClick={handleToggleSettings} className="text-zinc-400 hover:text-white px-2">✕</button>
                     </div>
                     
                     <div className="space-y-2">
                         <label className="text-zinc-500 text-xs font-bold uppercase">{t('settings_lang', language)}</label>
                         <div className="flex gap-2">
                             <button 
                                onClick={() => setLanguage('en')}
                                className={`flex-1 py-2 rounded border ${language === 'en' ? 'bg-zinc-800 border-yellow-600 text-yellow-500' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}`}
                             >
                                 English
                             </button>
                             <button 
                                onClick={() => setLanguage('zh')}
                                className={`flex-1 py-2 rounded border ${language === 'zh' ? 'bg-zinc-800 border-yellow-600 text-yellow-500' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}`}
                             >
                                 中文
                             </button>
                         </div>
                     </div>

                     <div className="space-y-4">
                         <label className="text-zinc-500 text-xs font-bold uppercase">{t('settings_audio', language)}</label>
                         {['Master', 'Music', 'SFX'].map(l => (
                             <div key={l} className="flex items-center gap-4">
                                 <span className="text-zinc-400 text-xs w-12">{l}</span>
                                 <input type="range" className="flex-1 accent-yellow-600 h-1 bg-zinc-800 rounded appearance-none" />
                             </div>
                         ))}
                     </div>
                 </div>
             </div>
        )}

        {/* MERCHANT BACKDROP */}
        {showMerchant && (
            <div className="fixed inset-0 z-25 bg-black/60 pointer-events-none animate-in fade-in duration-200" />
        )}

        {/* MERCHANT MODAL */}
        {showMerchant && engineRef.current && (
             <div className="fixed inset-0 z-40 flex flex-col items-center justify-start pt-16 pointer-events-none">
                 <div className="w-full max-w-md pointer-events-auto bg-zinc-950 border border-amber-900/50 sm:rounded-lg shadow-2xl overflow-hidden relative mx-4">
                     {/* Header */}
                     <div className="flex justify-between items-center p-3 bg-amber-950/20 border-b border-amber-900/30 shrink-0">
                         <h2 className="text-sm text-amber-500 font-serif tracking-widest pl-2">{t('shop_title', language)}</h2>
                         <button onClick={handleToggleMerchant} className="text-zinc-400 hover:text-white px-2 text-xl font-bold">✕</button>
                     </div>

                     <div className="flex flex-col p-4 items-center justify-center gap-3">
                         
                         <div className="text-[10px] text-zinc-500 italic mb-1">{t('shop_mode_hint', language)}</div>

                         <div className="w-full grid grid-cols-2 gap-2">
                             <button 
                                onClick={() => handleSellBatch('normal')}
                                className="py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 rounded font-serif tracking-wider shadow active:scale-95 transition-all flex flex-col items-center justify-center"
                             >
                                 <span className="text-[10px] font-bold">{t('shop_sell_white', language)}</span>
                                 <span className="text-yellow-600 text-[9px]">{t('shop_desc_white', language)}</span>
                             </button>

                             <button 
                                onClick={() => handleSellBatch('magic')}
                                className="py-3 bg-blue-900/20 hover:bg-blue-900/30 border border-blue-800/50 text-blue-300 rounded font-serif tracking-wider shadow active:scale-95 transition-all flex flex-col items-center justify-center"
                             >
                                 <span className="text-[10px] font-bold">{t('shop_sell_blue', language)}</span>
                                 <span className="text-yellow-600 text-[9px]">{t('shop_desc_blue', language)}</span>
                             </button>

                             <button 
                                onClick={() => handleSellBatch('rare')}
                                className="py-3 bg-yellow-900/20 hover:bg-yellow-900/30 border border-yellow-800/50 text-yellow-300 rounded font-serif tracking-wider shadow active:scale-95 transition-all flex flex-col items-center justify-center"
                             >
                                 <span className="text-[10px] font-bold">{t('shop_sell_yellow', language)}</span>
                                 <span className="text-yellow-600 text-[9px]">{t('shop_desc_yellow', language)}</span>
                             </button>

                             <button 
                                onClick={() => handleSellBatch('all_junk')}
                                className="py-3 bg-red-900/20 hover:bg-red-900/30 border border-red-800/50 text-red-300 rounded font-serif tracking-wider shadow active:scale-95 transition-all flex flex-col items-center justify-center"
                             >
                                 <span className="text-[10px] font-bold">{t('shop_sell_junk', language)}</span>
                                 <span className="text-zinc-500 text-[9px]">Clear</span>
                             </button>
                         </div>
                     </div>
                 </div>
             </div>
        )}

        {/* MAP DEVICE UI */}
        {showMapDevice && engineRef.current && (
            <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-0 sm:p-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-full h-full sm:max-w-md sm:h-[80%] flex flex-col bg-zinc-950 border border-purple-900 sm:rounded-lg shadow-2xl overflow-hidden relative">
                    {/* Header */}
                    <div className="flex justify-between items-center p-4 bg-purple-950/20 border-b border-purple-900/50 shrink-0">
                        <h2 className="text-lg text-purple-400 font-serif tracking-widest pl-2">{t('ui_map_device', language)}</h2>
                        <button onClick={handleCloseMapDevice} className="text-zinc-400 hover:text-white px-2 text-xl font-bold">✕</button>
                    </div>

                    <div className="flex-1 flex flex-col p-6 items-center">
                         <div className="w-32 h-32 border-2 border-dashed border-purple-700 rounded-lg bg-black/50 flex items-center justify-center mb-6 relative">
                             {selectedMap ? (
                                 <div 
                                    className="w-full h-full p-2 flex flex-col items-center justify-center cursor-pointer bg-purple-900/20"
                                    onClick={() => setSelectedMap(null)}
                                 >
                                     <span className="text-4xl">📜</span>
                                     <span className="text-xs text-center text-purple-200 font-bold mt-2">{selectedMap.name}</span>
                                 </div>
                             ) : (
                                 <span className="text-purple-800 text-xs text-center font-mono">SELECT MAP<br/>FROM BAG</span>
                             )}
                        </div>
                        
                         {/* Stats Preview */}
                         <div className="w-full bg-zinc-900/50 p-4 rounded border border-zinc-800 min-h-[100px] mb-4">
                            {selectedMap ? (
                                <div className="space-y-1">
                                    <h3 className="text-purple-400 font-bold border-b border-purple-900 pb-1 mb-2 text-sm">{selectedMap.name}</h3>
                                    {selectedMap.affixes.map((affix, i) => (
                                        <div key={i} className="text-xs text-zinc-300 flex justify-between">
                                            <span>{t(`affix_${affix.definitionId.replace(/^(prefix|suffix|map_prefix|map_suffix)_/, '')}`, language)}</span>
                                            <span className={affix.value > 0 ? "text-green-400" : "text-red-400"}>
                                                {Math.round(affix.value * 100)}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-zinc-600 text-xs italic text-center mt-6">No Map Selected</div>
                            )}
                        </div>

                        <button 
                            onClick={selectedMap ? handleActivateMap : () => { engineRef.current?.activateFreeRun(); handleCloseMapDevice(); }}
                            className={`w-full py-4 font-serif font-bold tracking-widest text-lg rounded shadow-lg transition-all
                                ${selectedMap 
                                    ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]' 
                                    : 'bg-green-700 hover:bg-green-600 text-green-100 shadow-[0_0_15px_rgba(21,128,61,0.4)]'
                                }`}
                        >
                            {selectedMap ? "ACTIVATE" : "FREE RUN (T1)"}
                        </button>
                    </div>
                     {/* Inventory Strip */}
                     <div className="bg-zinc-900 p-4 border-t border-zinc-800 h-32 overflow-x-auto whitespace-nowrap">
                         <div className="flex gap-2">
                             {engineRef.current.gameState.backpack.filter(i => i.type === 'map').map((mapItem) => (
                                 <div 
                                    key={mapItem.id}
                                    onClick={() => setSelectedMap(mapItem)}
                                    className={`w-16 h-16 inline-flex flex-col items-center justify-center border rounded cursor-pointer transition-all hover:scale-105 active:scale-95
                                        ${selectedMap?.id === mapItem.id ? 'border-purple-500 bg-purple-900/30' : 'border-zinc-700 bg-zinc-950'}
                                    `}
                                 >
                                     <span className="text-xl">📜</span>
                                     <span className="text-[9px] text-zinc-400">T{mapItem.level}</span>
                                 </div>
                             ))}
                         </div>
                    </div>
                </div>
            </div>
        )}

        {/* SKILL UI MODAL - ARCANE FORGE REDESIGN */}
        {showSkills && engineRef.current && (
             <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-0 sm:p-6 animate-in fade-in zoom-in-95 duration-200">
                 <div className="w-full h-full sm:max-w-4xl sm:h-[95%] flex flex-col bg-slate-950/80 border-0 sm:border border-white/10 sm:rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden relative">
                    
                    {/* Header */}
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-white/5 shrink-0 h-16">
                        <h2 className="text-xl text-cyan-400 font-serif tracking-[0.2em] pl-2 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">ARCANE FORGE</h2>
                        <button onClick={handleToggleSkills} className="text-zinc-500 hover:text-cyan-200 px-4 h-full text-2xl font-light transition-colors">✕</button>
                    </div>

                    <div className="flex-1 overflow-y-auto flex flex-col bg-black/20">
                        
                        {/* 0. Slot Selector Tabs */}
                        <div className="flex justify-center gap-1 p-3 border-b border-white/5 bg-black/20">
                            {Array.from({ length: MAX_SKILL_SLOTS }).map((_, i) => {
                                const skill = engineRef.current!.gameState.activeSkills[i];
                                const isSelected = selectedSlotIndex === i;
                                const activeName = skill.activeGem ? getAbbreviation(skill.activeGem.name, skill.activeGem) : (i + 1).toString();
                                
                                return (
                                    <button 
                                        key={i} 
                                        onClick={() => setSelectedSlotIndex(i)}
                                        className={`w-14 h-12 relative flex items-center justify-center font-bold text-sm transition-all duration-300 active:scale-95 group
                                            ${isSelected 
                                                ? 'text-cyan-200' 
                                                : 'text-zinc-600 hover:text-zinc-400'}
                                        `}
                                    >
                                        <div className={`absolute inset-0 border border-white/10 transform skew-x-12 rounded-sm bg-slate-900 transition-all
                                            ${isSelected ? 'bg-cyan-950/30 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.1)]' : 'opacity-50'}
                                        `}></div>
                                        <span className="relative z-10">{activeName}</span>
                                        {isSelected && <div className="absolute bottom-0 left-1 right-1 h-[2px] bg-cyan-500 shadow-[0_0_8px_cyan]"></div>}
                                    </button>
                                );
                            })}
                        </div>

                        {/* 1. The Forge (Middle) */}
                        <div className="w-full relative flex flex-col items-center justify-start pt-10 pb-8 min-h-[360px] overflow-hidden">
                            {/* Forge Background Glow */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-900/10 rounded-full blur-3xl pointer-events-none"></div>

                            {/* Active Socket (Center Top) */}
                            <div className="relative z-20 mb-16">
                                {/* Halo Effect */}
                                <div className="absolute -inset-4 rounded-full border border-cyan-500/20 animate-[spin_10s_linear_infinite] pointer-events-none"></div>
                                <div className="absolute -inset-2 rounded-full border border-cyan-400/30 animate-[spin_6s_linear_infinite_reverse] pointer-events-none"></div>
                                
                                {renderForgeSocket(engineRef.current.gameState.activeSkills[selectedSlotIndex].activeGem, false, 0)}
                            </div>
                            
                            {/* Energy Conduits & Supports */}
                            <div className="relative w-full max-w-sm px-6">
                                <div className="flex justify-between items-start gap-4">
                                     {engineRef.current.gameState.activeSkills[selectedSlotIndex].supportGems.map((g, i) => {
                                         const activeGem = engineRef.current?.gameState.activeSkills[selectedSlotIndex].activeGem;
                                         let isCompatible = true;
                                         if (g && activeGem) {
                                            isCompatible = SkillManager.checkCompatibility(activeGem.gemDefinitionId!, g.gemDefinitionId!);
                                         } else if (g && !activeGem) {
                                            isCompatible = false;
                                         }
                                         
                                         // Energy Line Calculation
                                         const connectionActive = activeGem && g && isCompatible;
                                         const lineColor = connectionActive ? 'from-cyan-400 via-cyan-500 to-transparent' : 'from-zinc-800 to-transparent';
                                         const lineGlow = connectionActive ? 'shadow-[0_0_10px_cyan]' : '';

                                         return (
                                             <div key={i} className="flex flex-col items-center flex-1 relative group">
                                                {/* Energy Conduit Line */}
                                                <div className={`absolute -top-16 left-1/2 -translate-x-1/2 w-[2px] h-16 bg-gradient-to-b ${lineColor} ${lineGlow} transition-all duration-500`}></div>
                                                
                                                {/* Socket */}
                                                <div className="relative z-10 transition-transform duration-300 hover:scale-105">
                                                    {renderForgeSocket(g, true, i, isCompatible)}
                                                </div>
                                             </div>
                                         );
                                     })}
                                </div>
                            </div>

                            {/* Stats Data Card */}
                            {engineRef.current.gameState.activeSkills[selectedSlotIndex].activeGem ? (() => {
                                const resolved = SkillManager.resolveSkill(engineRef.current!.gameState.activeSkills[selectedSlotIndex], engineRef.current!.playerStats);
                                if (!resolved) return null;
                                return (
                                    <div className="mt-8 mx-6 bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-xl p-4 w-full max-w-sm shadow-xl animate-in slide-in-from-bottom-4 fade-in">
                                        <div className="flex justify-between items-end border-b border-white/5 pb-2 mb-3">
                                            <span className="text-cyan-100 font-bold text-lg tracking-wide">{t(`skill_${resolved.definition.id}_name`, language)}</span>
                                            <div className="flex flex-col items-end">
                                                <span className="text-[10px] text-zinc-500 uppercase tracking-widest">{t('lbl_dps', language)}</span>
                                                <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500 drop-shadow-sm">
                                                    {Math.round(resolved.stats.damage * resolved.stats.attackRate)}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {resolved.tags.map(tag => (
                                                <span key={tag} className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] text-cyan-100/70 font-mono uppercase tracking-wider">
                                                    {t(`tag_${tag}`, language)}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-400 font-mono">
                                            <div className="flex justify-between"><span>{t('lbl_dmg', language)}</span> <span className="text-slate-200">{resolved.stats.damage.toFixed(1)}</span></div>
                                            <div className="flex justify-between"><span>{t('lbl_rate', language)}</span> <span className="text-slate-200">{resolved.stats.attackRate.toFixed(2)}/s</span></div>
                                            {resolved.stats.projectileCount > 0 && <div className="flex justify-between"><span>{t('lbl_proj', language)}</span> <span className="text-slate-200">{resolved.stats.projectileCount}</span></div>}
                                            {resolved.stats.areaOfEffect > 0 && <div className="flex justify-between"><span>{t('lbl_area', language)}</span> <span className="text-slate-200">{resolved.stats.areaOfEffect}</span></div>}
                                            {resolved.stats.ailmentChance > 0 && <div className="flex justify-between text-amber-200/80"><span>{t('stat_ailment', language)}</span> <span>{(resolved.stats.ailmentChance * 100).toFixed(0)}%</span></div>}
                                        </div>
                                    </div>
                                );
                            })() : (
                                <div className="mt-12 text-zinc-700 font-serif italic text-sm tracking-widest border border-zinc-800/50 px-6 py-2 rounded-full">
                                    SLOT EMPTY
                                </div>
                            )}
                        </div>

                        {/* 2. Gem Pouch (Bottom) */}
                        <div className="flex-1 bg-black/40 border-t border-white/5 p-4 backdrop-blur-sm relative">
                            {/* Grid Background Pattern */}
                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
                            
                            <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-3 relative z-10 pl-1 flex items-center justify-between">
                                <span>RUNE STORAGE</span>
                                <button 
                                    onClick={() => setAutoSort(!autoSort)}
                                    className={`text-[9px] px-2 py-0.5 rounded border border-white/10 transition-colors ${autoSort ? 'bg-cyan-900 text-cyan-200 border-cyan-700' : 'bg-zinc-900 text-zinc-500'}`}
                                >
                                    AUTO-SORT: {autoSort ? 'ON' : 'OFF'}
                                </button>
                            </h3>
                            
                            <div className="grid grid-cols-5 gap-3 relative z-10 content-start pb-8">
                                {(() => {
                                    let gems = engineRef.current.gameState.gemInventory;
                                    if (autoSort) {
                                        gems = sortItems(gems);
                                    }
                                    return gems.map((gem) => {
                                        const def = SKILL_DATABASE[gem.gemDefinitionId || ''];
                                        
                                        // Compatibility Logic for Highlighting
                                        let borderColor = "border-zinc-800";
                                        let opacity = "opacity-70";
                                        let shadow = "";
                                        let bg = "bg-zinc-900";
                                        
                                        const currentActiveGem = engineRef.current?.gameState.activeSkills[selectedSlotIndex].activeGem;
                                        
                                        if (def && def.type === 'support') {
                                            borderColor = "border-violet-900/50";
                                            
                                            if (currentActiveGem) {
                                                const activeDef = SKILL_DATABASE[currentActiveGem.gemDefinitionId!];
                                                const compatible = SkillManager.checkCompatibility(activeDef.id, def.id);
                                                
                                                if (compatible) {
                                                    borderColor = "border-violet-500";
                                                    shadow = "shadow-[0_0_10px_rgba(139,92,246,0.3)]";
                                                    opacity = "opacity-100";
                                                    bg = "bg-violet-950/30";
                                                } else {
                                                    opacity = "opacity-30 grayscale";
                                                }
                                            }
                                        } else if (def && def.type === 'active') {
                                            borderColor = "border-cyan-700";
                                            opacity = "opacity-100";
                                            shadow = "shadow-[0_0_5px_rgba(6,182,212,0.2)]";
                                            bg = "bg-cyan-950/30";
                                        }

                                        return (
                                            <div 
                                                key={gem.id}
                                                onClick={() => handleGemInventoryClick(gem)}
                                                onMouseEnter={(e) => handleItemHover(e, gem)}
                                                onMouseLeave={handleItemLeave}
                                                className={`aspect-square ${bg} ${borderColor} ${opacity} ${shadow} border rounded-lg flex items-center justify-center cursor-pointer relative transition-all duration-200 active:scale-95 group overflow-hidden`}
                                            >
                                                {/* Inner Shine */}
                                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                
                                                <span className="text-2xl drop-shadow-md relative z-10 transform group-hover:scale-110 transition-transform">
                                                    {def?.tags.includes('fire') ? '🔥' : def?.tags.includes('movement') ? '🌪️' : def?.type === 'support' ? '⚪' : '💠'}
                                                </span>
                                                <span className="absolute bottom-0.5 right-1 text-[8px] font-bold text-zinc-500/80 tracking-tighter">
                                                    {gem.gemDefinitionId?.substring(0,3).toUpperCase()}
                                                </span>
                                            </div>
                                        );
                                    })
                                })()}
                            </div>
                        </div>
                    </div>
                 </div>
             </div>
        )}

        {/* INVENTORY MODAL (MODIFIED FOR MERCHANT) */}
        {showInventory && engineRef.current && (
            <div className={`fixed inset-0 z-30 flex items-center justify-center p-0 sm:p-6 duration-200 
                ${showMerchant 
                    ? 'items-end sm:items-center pointer-events-none' // Bottom sheet on mobile if merchant open
                    : 'bg-black/95 animate-in fade-in zoom-in-95'
                }
            `}>
                <div className={`w-full flex flex-col bg-zinc-950 border-zinc-700 shadow-2xl overflow-hidden relative pointer-events-auto 
                    ${showMerchant 
                        ? 'h-[calc(100dvh-280px)] mt-auto border-t-2 border-amber-900 rounded-t-xl sm:h-[80%] sm:mt-0 sm:max-w-4xl sm:rounded-lg sm:border' 
                        : 'h-full sm:max-w-4xl sm:h-[90%] sm:border sm:rounded-lg'
                    }
                `}>
                    
                    <div className="flex justify-between items-center p-3 bg-zinc-900 border-b border-zinc-800 shrink-0 h-12">
                        <h2 className="text-lg text-yellow-600 font-serif tracking-widest pl-2">{t('ui_bag', language)}</h2>
                        {!showMerchant && <button onClick={handleToggleInventory} className="text-zinc-400 hover:text-white px-4 h-full text-xl font-bold">✕</button>}
                    </div>

                    {/* Content Body - Changed to flex-col with overflow-hidden to contain scrollable children */}
                    <div className="flex-1 overflow-hidden flex flex-col w-full">
                        <div className="w-full bg-zinc-900/50 p-3 border-b border-zinc-800 shrink-0 flex justify-between items-start">
                             <div>
                                <h3 className="text-zinc-600 text-[10px] font-bold uppercase tracking-wider mb-2">Attributes</h3>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[11px]">
                                    <StatRow label={t('stat_damage', language)} value={engineRef.current.playerStats.getStatValue('bulletDamage').toFixed(0)} />
                                    {/* FIX: Ensure UI always displays the HP from synced HUD state to avoid glitches */}
                                    <StatRow label={t('stat_health', language)} value={hudState.maxHp.toFixed(0)} color="text-red-400" />
                                    <StatRow label={t('stat_atk_spd', language)} value={engineRef.current.playerStats.getStatValue('attackSpeed').toFixed(2)} />
                                    <StatRow label={t('stat_defense', language)} value={engineRef.current.playerStats.getStatValue('defense').toFixed(0)} color="text-slate-300" />
                                    <StatRow label={t('stat_crit_chance', language)} value={(engineRef.current.playerStats.getStatValue('critChance') * 100).toFixed(0) + '%'} />
                                    <StatRow label={t('stat_move_spd', language)} value={engineRef.current.playerStats.getStatValue('moveSpeed').toFixed(1)} color="text-blue-400" />
                                    <StatRow label={t('stat_crit_mult', language)} value={'x' + engineRef.current.playerStats.getStatValue('critMultiplier').toFixed(1)} />
                                </div>
                             </div>
                             <div className="flex flex-col items-end pr-2">
                                 <span className="text-2xl">💰</span>
                                 <span className="text-yellow-400 font-bold font-mono">{hudState.gold.toLocaleString()}</span>
                             </div>
                        </div>

                        {!showMerchant && (
                            <div className="w-full bg-[#050505] relative p-2 flex flex-col items-center justify-center border-b border-zinc-800 shrink-0">
                                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                                    <div className="w-48 h-64 border-2 border-zinc-700 rounded-[50%]"></div>
                                </div>
                                <div className="relative w-full max-w-[340px] grid grid-cols-3 gap-1 z-10 py-2">
                                    <div className="col-start-2 h-14">{renderSlot('helmet', engineRef.current.gameState.equipment.helmet, 'h-full w-full')}</div>
                                    <div className="col-start-1 row-start-2 h-24">{renderSlot('weapon', engineRef.current.gameState.equipment.weapon, 'h-full w-full')}</div>
                                    <div className="col-start-2 row-start-2 h-24 flex flex-col gap-1">
                                        {renderSlot('amulet', engineRef.current.gameState.equipment.amulet, 'h-8 w-full')}
                                        {renderSlot('body', engineRef.current.gameState.equipment.body, 'h-full w-full')}
                                    </div>
                                    <div className="col-start-3 row-start-2 h-24">{renderSlot('offhand', engineRef.current.gameState.equipment.offhand, 'h-full w-full')}</div>
                                    <div className="col-start-1 row-start-3 h-14">{renderSlot('gloves', engineRef.current.gameState.equipment.gloves, 'h-full w-full')}</div>
                                    <div className="col-start-2 row-start-3 h-14 flex justify-between gap-1">
                                        {renderSlot('ring1', engineRef.current.gameState.equipment.ring1, 'w-1/2 h-full')}
                                        {renderSlot('ring2', engineRef.current.gameState.equipment.ring2, 'w-1/2 h-full')}
                                    </div>
                                    <div className="col-start-3 row-start-3 h-14">{renderSlot('boots', engineRef.current.gameState.equipment.boots, 'h-full w-full')}</div>
                                </div>
                            </div>
                        )}

                        {/* Inventory Tabs */}
                        <div className="flex w-full border-b border-zinc-800 bg-zinc-900/80 items-center">
                            <button 
                                onClick={() => { setInventoryTab('equipment'); setBackpackPage(0); }}
                                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${inventoryTab === 'equipment' ? 'text-yellow-500 border-b-2 border-yellow-500 bg-zinc-800' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                Equipment
                            </button>
                            <button 
                                onClick={() => { setInventoryTab('map'); setBackpackPage(0); }}
                                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${inventoryTab === 'map' ? 'text-purple-500 border-b-2 border-purple-500 bg-zinc-800' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                Maps
                            </button>
                            <button 
                                onClick={() => setAutoSort(!autoSort)}
                                className={`px-4 py-2 mr-2 text-[10px] font-bold uppercase rounded border border-white/10 transition-colors ${autoSort ? 'bg-cyan-900 text-cyan-200 border-cyan-700' : 'bg-zinc-800 text-zinc-500'}`}
                            >
                                SORT: {autoSort ? 'ON' : 'OFF'}
                            </button>
                        </div>

                        {/* Backpack Container - Scrollable */}
                        <div className="w-full bg-zinc-900 p-4 flex-1 overflow-y-auto min-h-0 pb-12">
                            <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-2 flex justify-between items-center">
                                <span>{t('ui_bag', language)}</span>
                                <div className="flex gap-2 items-center">
                                    <span className="text-zinc-600 mr-2">{filteredBackpack.length} Items</span>
                                    {totalBackpackPages > 1 && (
                                        <div className="flex gap-1 text-[10px] text-zinc-400 bg-zinc-800 rounded px-1">
                                            <button 
                                                onClick={() => setBackpackPage(Math.max(0, backpackPage - 1))}
                                                disabled={backpackPage === 0}
                                                className="px-4 py-2 hover:text-white disabled:opacity-30 bg-zinc-700 rounded mx-1"
                                            >
                                                &lt;
                                            </button>
                                            <span className="px-2 py-2">{backpackPage + 1}/{totalBackpackPages}</span>
                                            <button 
                                                onClick={() => setBackpackPage(Math.min(totalBackpackPages - 1, backpackPage + 1))}
                                                disabled={backpackPage >= totalBackpackPages - 1}
                                                className="px-4 py-2 hover:text-white disabled:opacity-30 bg-zinc-700 rounded mx-1"
                                            >
                                                &gt;
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </h3>
                            <div 
                                className="grid grid-cols-5 gap-2 content-start min-h-[300px]"
                                onTouchStart={handleTouchStart}
                                onTouchEnd={handleTouchEnd}
                            >
                                {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => {
                                    const index = backpackPage * ITEMS_PER_PAGE + i;
                                    const item = filteredBackpack[index];
                                    
                                    // if (index >= filteredBackpack.length) return null; // No, render placeholders to keep grid stable?
                                    // Actually rendering empty slots is fine for visual consistency, but for filtered list,
                                    // usually we just render items.
                                    if (!item) {
                                        // Only render placeholder if within page bounds but empty? 
                                        // Or just fill the grid with empties?
                                        // Let's render empty slot to maintain grid structure for at least one page visual
                                        return <div key={i} className="aspect-square bg-zinc-950 border border-zinc-800 rounded shadow-inner opacity-50"></div>;
                                    }
                                    
                                    let borderColor = "border-neutral-700";
                                    let bgColor = "bg-neutral-800";
                                    if (item.rarity === 'magic') { borderColor = "border-blue-800"; bgColor="bg-blue-900/20"; }
                                    if (item.rarity === 'rare') { borderColor = "border-yellow-700"; bgColor="bg-yellow-900/20"; }
                                    if (item.rarity === 'unique') { borderColor = "border-orange-800"; bgColor="bg-orange-900/20"; }

                                    return (
                                        <div 
                                            key={item.id} 
                                            onClick={() => item.type === 'equipment' ? handleItemClick(item) : null}
                                            onMouseEnter={(e) => handleItemHover(e, item)}
                                            onMouseLeave={handleItemLeave}
                                            className={`aspect-square ${bgColor} ${borderColor} border rounded flex flex-col items-center justify-center cursor-pointer hover:border-white/50 active:scale-95 transition-all relative group`}
                                        >
                                            <div className="text-2xl drop-shadow-md">
                                                {getItemIcon(item)}
                                            </div>
                                            
                                            {showMerchant && (
                                                <span className="absolute bottom-1 right-1 text-[8px] text-green-500 font-bold">$</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* GLOBAL FIXED TOOLTIP */}
        {tooltip && (
            <div 
                className="fixed z-[100] w-[220px] pointer-events-none"
                style={tooltipStyle}
            >
                <div className="bg-zinc-950 border border-neutral-600 p-3 rounded shadow-2xl relative w-full break-words whitespace-normal">
                    <div className={`font-bold border-b border-neutral-700 pb-1 mb-1 text-sm ${tooltip.item.rarity === 'unique' ? 'text-orange-400' : tooltip.item.rarity === 'rare' ? 'text-yellow-300' : tooltip.item.rarity === 'magic' ? 'text-blue-300' : 'text-gray-200'}`}>
                        {getDisplayName(tooltip.item)}
                    </div>
                    {tooltip.item.type === 'gem' ? (
                        <div className="text-xs text-zinc-400">
                             <div className="italic text-[10px] mb-2">{SKILL_DATABASE[tooltip.item.gemDefinitionId!]?.type.toUpperCase()} GEM</div>
                             {tooltip.incompatible && (
                                 <div className="text-red-500 font-bold text-[10px] mb-2 border border-red-900 bg-red-950/30 p-1 rounded">
                                     ⚠ INVALID SUPPORT
                                 </div>
                             )}
                             <div className="text-zinc-300 mb-2">{t(`skill_${tooltip.item.gemDefinitionId}_desc`, language)}</div>
                             <div className="text-xs text-zinc-500 mt-2 flex flex-wrap gap-1">
                                 <span className="text-zinc-600">{t('lbl_tags', language)}:</span>
                                 {SKILL_DATABASE[tooltip.item.gemDefinitionId!]?.tags.map(tag => (
                                     <span key={tag} className="text-zinc-400 bg-zinc-900 px-1 rounded">{t(`tag_${tag}`, language)}</span>
                                 ))}
                             </div>
                        </div>
                    ) : tooltip.item.type === 'map' ? (
                        <div className="space-y-1">
                            <div className="text-[10px] text-zinc-500 mb-2 italic">{t('lbl_map_tier', language, {n: tooltip.item.level})}</div>
                            {tooltip.item.affixes.map((affix, i) => (
                                <div key={i} className="text-blue-200 text-xs flex justify-between items-start gap-1">
                                    <span className="text-left flex-1">{t(`affix_${affix.definitionId.replace(/^(prefix|suffix|map_prefix|map_suffix)_/, '')}`, language)}</span>
                                    <div className="text-right whitespace-nowrap">
                                        <span className={affix.value > 0 ? "text-green-400" : "text-red-400"}>
                                            {Math.round(affix.value * 100)}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            <div className="text-[10px] text-neutral-400 mb-2 italic flex justify-between">
                                <span>{t(`item_${tooltip.item.slot}` as any, language)}</span>
                                <span>{t(`rarity_${tooltip.item.rarity}` as any, language)}</span>
                            </div>
                            <div className="space-y-1">
                                {tooltip.item.affixes.map((affix, i) => {
                                    // Implicit Logic: First item (index 0) is implicit for equipment
                                    const isImplicit = i === 0;
                                    
                                    let diffElement = null;
                                    if (engineRef.current && tooltip.item.type === 'equipment' && !showMerchant) {
                                        const equipped = engineRef.current.gameState.equipment[tooltip.item.slot as ItemSlot];
                                        if (equipped) {
                                            const eqAffix = equipped.affixes.find(a => a.stat === affix.stat);
                                            if (eqAffix) {
                                                const diff = affix.value - eqAffix.value;
                                                const diffVal = Number(diff.toFixed(1));
                                                if (diffVal > 0) diffElement = <span className="text-green-500 text-[9px] ml-1">(+{diffVal})</span>;
                                                else if (diffVal < 0) diffElement = <span className="text-red-500 text-[9px] ml-1">({diffVal})</span>;
                                            } else {
                                                diffElement = <span className="text-blue-400 text-[9px] ml-1">({t('lbl_new', language)})</span>;
                                            }
                                        }
                                    }
                                    
                                    const textColor = isImplicit ? "text-white font-bold" : "text-blue-200";
                                    const containerClass = isImplicit && tooltip.item.affixes.length > 1 
                                        ? "border-b border-zinc-700 pb-2 mb-2" 
                                        : "";
                                    
                                    let affixName = affix.name;
                                    
                                    if (isImplicit) {
                                        // Use specific implicit key
                                        affixName = t(`affix_implicit_${tooltip.item.slot}`, language);
                                    } else {
                                        // Translate Affix Name
                                        let affixKey = affix.definitionId;
                                        affixKey = affixKey.replace(/^map_/, '').replace(/^prefix_/, '').replace(/^suffix_/, '');
                                        let translated = t(`affix_${affixKey}`, language);
                                        if (!translated.startsWith('affix_')) {
                                            affixName = translated;
                                        }
                                    }

                                    return (
                                        <div key={i} className={`${containerClass}`}>
                                            {isImplicit && <div className="text-[9px] text-zinc-500 mb-0.5">{t('lbl_implicit', language)}</div>}
                                            <div className={`${textColor} text-xs flex justify-between items-start gap-1`}>
                                                <span className="text-left flex-1">{affixName}</span>
                                                <div className="text-right whitespace-nowrap">
                                                    <span className="text-white font-mono">+{affix.value}{affix.valueType === 'increased' ? '%' : ''}</span>
                                                    {diffElement}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}

        {/* GAME OVER */}
        {gameOverUI && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 animate-in fade-in duration-500">
                <h2 className="text-5xl font-serif text-red-800 mb-4 tracking-widest drop-shadow-[0_2px_10px_rgba(220,38,38,0.5)] text-center">YOU DIED</h2>
                <div className="text-neutral-400 font-mono mb-8 border-t border-b border-neutral-800 py-2 px-8">
                    Survived to {hudState.waveName}
                </div>
                <button 
                    onClick={handleReset}
                    className="px-8 py-3 bg-red-900/20 hover:bg-red-900/40 text-red-500 border border-red-800 rounded font-serif tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(220,38,38,0.2)]"
                >
                    TRY AGAIN
                </button>
            </div>
        )}

        {/* LEVEL UP */}
        {upgradeState.show && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/95 animate-in fade-in duration-200 p-4">
                <h2 className="text-3xl font-serif text-yellow-500 mb-1 tracking-widest drop-shadow-md">LEVEL UP!</h2>
                <p className="text-zinc-500 text-xs mb-6 uppercase tracking-widest">Choose a boon</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl">
                    {upgradeState.options.map((option, i) => (
                        <div 
                            key={i}
                            onClick={() => handleSelectUpgrade(option)}
                            className={`
                                relative overflow-hidden bg-zinc-900 border border-zinc-700 rounded-lg p-4 cursor-pointer 
                                transition-all hover:-translate-y-1 hover:border-yellow-500 hover:shadow-[0_0_20px_rgba(234,179,8,0.2)] group
                                flex flex-col items-center text-center gap-2 h-48 justify-center
                            `}
                        >
                            {/* Rarity Glow */}
                            <div className={`absolute top-0 left-0 w-full h-1 ${option.color || 'bg-white'}`}></div>
                            
                            {/* Icon / Visual */}
                            <div className={`w-16 h-16 rounded-full ${option.color?.replace('bg-', 'bg-') || 'bg-zinc-800'} bg-opacity-20 flex items-center justify-center text-3xl mb-2 group-hover:scale-110 transition-transform`}>
                                {option.gemItem ? (option.gemItem.type === 'gem' ? '💎' : '📜') : '✨'}
                            </div>

                            <h3 className={`font-bold text-lg ${option.gemItem ? 'text-cyan-400' : 'text-zinc-200'}`}>
                                {option.name}
                            </h3>
                            <p className="text-xs text-zinc-400 font-mono leading-tight px-4">
                                {option.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
  );
};
