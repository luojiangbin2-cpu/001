
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { UpgradeDefinition, ItemSlot, ItemInstance, ResolvedSkill, MAX_SKILL_SLOTS, Interactable } from '../types';
import { GameEngine, BACKPACK_CAPACITY, CAMERA_ZOOM } from '../GameEngine';
import { SKILL_DATABASE, SkillManager } from '../SkillSystem';
import { t, Language } from '../locales';

export const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

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
  const [language, setLanguage] = useState<Language>('en');
  const [nearbyInteractable, setNearbyInteractable] = useState<Interactable | null>(null);

  const [, setTick] = useState(0); 
  
  // New: Portal Indicator State
  const [portalIndicator, setPortalIndicator] = useState<{angle: number, label: string, color: string} | null>(null);

  // New: Skill UI State
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0);

  // New: Map Device State
  const [selectedMap, setSelectedMap] = useState<ItemInstance | null>(null);

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
    setHudState(data);
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

  // --- SWIPE HANDLERS FOR BACKPACK ---
  const handleTouchStart = (e: React.TouchEvent) => {
      setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
      if (touchStart === null) return;
      const touchEnd = e.changedTouches[0].clientX;
      const diff = touchStart - touchEnd;
      const totalPages = Math.ceil(BACKPACK_CAPACITY / ITEMS_PER_PAGE);

      if (diff > 50) {
          // Swipe Left -> Next Page
          setBackpackPage(prev => Math.min(totalPages - 1, prev + 1));
      } else if (diff < -50) {
          // Swipe Right -> Prev Page
          setBackpackPage(prev => Math.max(0, prev - 1));
      }
      setTouchStart(null);
  };

  const getAbbreviation = (name: string, item?: ItemInstance) => {
    // If translated, abbreviations might differ.
    // For now, if item is passed and has a gemDefinitionId, use translation logic
    if (item && item.type === 'gem' && item.gemDefinitionId) {
        const translatedName = t(`skill_${item.gemDefinitionId}_name`, language);
        return language === 'zh' ? translatedName.substring(0, 2) : translatedName.substring(0, 3);
    }
    
    // For equipment, maybe just first few chars of name? 
    // Hard to map dynamic names back to abbreviations without complex logic.
    // Fallback to existing logic:
    if (language === 'zh') return name.substring(0, 2);
    const parts = name.split(" ");
    return parts.length > 1 ? parts[parts.length-1].substring(0, 3) : name.substring(0, 3);
  };

  // --- Render Functions ---

  const renderSlot = (slot: ItemSlot, item: ItemInstance | null | undefined, sizeClass: string = 'aspect-square') => {
    let borderColor = "border-neutral-700";
    let bgColor = "bg-neutral-900";
    let textColor = "text-neutral-500";
    let shadow = "";

    if (item) {
        if (item.rarity === 'normal') { borderColor = "border-neutral-400"; textColor = "text-neutral-200"; bgColor="bg-neutral-800"; }
        if (item.rarity === 'magic') { borderColor = "border-blue-500"; textColor = "text-blue-300"; bgColor="bg-blue-900/30"; shadow="shadow-[0_0_10px_rgba(59,130,246,0.3)]"; }
        if (item.rarity === 'rare') { borderColor = "border-yellow-500"; textColor = "text-yellow-300"; bgColor="bg-yellow-900/30"; shadow="shadow-[0_0_10px_rgba(234,179,8,0.3)]"; }
        if (item.rarity === 'unique') { borderColor = "border-orange-600"; textColor = "text-orange-400"; bgColor="bg-orange-900/30"; shadow="shadow-[0_0_10px_rgba(234,88,12,0.5)]"; }
    }

    return (
        <div 
            onClick={() => item ? handleUnequip(slot) : null}
            onMouseEnter={(e) => item && handleItemHover(e, item)}
            onMouseLeave={handleItemLeave}
            className={`${sizeClass} ${bgColor} ${borderColor} border rounded flex flex-col items-center justify-center relative group cursor-pointer transition-all hover:brightness-110 active:scale-95 ${shadow} z-0 overflow-hidden`}
        >
            {!item && <span className="text-[10px] text-neutral-600 uppercase font-bold tracking-widest">{t(`item_${slot}` as any, language).substring(0, 3)}</span>}
            {item && (
                <div className={`text-xs sm:text-sm font-bold text-center leading-none ${textColor} drop-shadow-md break-all px-1`}>
                    {getAbbreviation(item.name, item)}
                </div>
            )}
        </div>
    );
  };

  const renderGemSocket = (item: ItemInstance | null, isSupport: boolean, subIndex: number, isCompatible: boolean = true) => {
      let borderColor = isSupport ? "border-zinc-600" : "border-amber-600";
      let bgColor = "bg-black/80";
      let size = isSupport ? "w-12 h-12" : "w-20 h-20";
      
      if (item) {
          const def = SKILL_DATABASE[item.gemDefinitionId || ''];
          if (!isCompatible) {
              borderColor = "border-red-600";
              bgColor = "bg-red-950/50";
          } else {
              if (def?.tags.includes('fire')) { borderColor = "border-red-500"; bgColor = "bg-red-900/40"; }
              else if (def?.tags.includes('movement')) { borderColor = "border-green-500"; bgColor = "bg-green-900/40"; }
              else if (def?.tags.includes('area')) { borderColor = "border-blue-400"; bgColor = "bg-blue-900/40"; }
              else { borderColor = isSupport ? "border-zinc-300" : "border-amber-400"; bgColor = "bg-zinc-800"; }
          }
      }

      return (
          <div 
            onClick={() => item && handleSocketClick(isSupport, subIndex)}
            onMouseEnter={(e) => item && handleItemHover(e, item, !isCompatible)}
            onMouseLeave={handleItemLeave}
            className={`${size} ${bgColor} border-2 ${borderColor} rounded-full flex items-center justify-center relative shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all hover:scale-110 active:scale-95 z-10 cursor-pointer ${!isCompatible && item ? 'opacity-80' : ''}`}
          >
             {item ? (
                 <>
                     <span className={`text-white font-bold text-xs drop-shadow-md text-center leading-none px-1 ${!isCompatible ? 'line-through decoration-red-500' : ''}`}>
                         {getAbbreviation(item.name, item)}
                     </span>
                     {!isCompatible && (
                         <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm">!</div>
                     )}
                 </>
             ) : (
                 <span className="text-zinc-700 text-[9px] font-bold">{isSupport ? 'SUP' : 'ACT'}</span>
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
  const totalBackpackPages = Math.ceil(BACKPACK_CAPACITY / ITEMS_PER_PAGE);

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
        <div className="absolute top-3 right-3 z-20 flex gap-2">
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

        {/* SKILL UI MODAL */}
        {showSkills && engineRef.current && (
             <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-0 sm:p-6 animate-in fade-in zoom-in-95 duration-200">
                 <div className="w-full h-full sm:max-w-4xl sm:h-[90%] flex flex-col bg-zinc-950 border-0 sm:border border-zinc-700 sm:rounded-lg shadow-2xl overflow-hidden relative">
                    
                    {/* Header */}
                    <div className="flex justify-between items-center p-3 bg-zinc-900 border-b border-zinc-800 shrink-0 h-12">
                        <h2 className="text-lg text-cyan-600 font-serif tracking-widest pl-2">SKILL FORGE</h2>
                        <button onClick={handleToggleSkills} className="text-zinc-400 hover:text-white px-4 h-full text-xl font-bold">✕</button>
                    </div>

                    <div className="flex-1 overflow-y-auto flex flex-col">
                        
                        {/* 0. Skill Slots Selector Bar */}
                        <div className="flex justify-center gap-2 p-2 bg-zinc-900/50 border-b border-zinc-800">
                            {Array.from({ length: MAX_SKILL_SLOTS }).map((_, i) => {
                                const skill = engineRef.current!.gameState.activeSkills[i];
                                const isSelected = selectedSlotIndex === i;
                                const activeName = skill.activeGem ? getAbbreviation(skill.activeGem.name, skill.activeGem) : (i + 1).toString();
                                const activeColor = skill.activeGem ? "text-cyan-400 border-cyan-700" : "text-zinc-600 border-zinc-700";
                                const bg = isSelected ? "bg-zinc-800 ring-1 ring-cyan-500" : "bg-zinc-950";

                                return (
                                    <button 
                                        key={i} 
                                        onClick={() => setSelectedSlotIndex(i)}
                                        className={`w-12 h-12 rounded border ${activeColor} ${bg} flex items-center justify-center font-bold text-xs transition-all hover:bg-zinc-800 active:scale-95`}
                                    >
                                        {activeName}
                                    </button>
                                );
                            })}
                        </div>

                        {/* 1. Skill Setup Visualization (Middle Forge) */}
                        <div className="w-full bg-[#050a10] p-6 flex flex-col items-center justify-center border-b border-zinc-800 relative min-h-[250px]">
                            
                            {/* Connector Lines */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-1 bg-zinc-700/50 -z-0"></div>
                            <div className="absolute top-1/2 left-1/2 w-1 h-24 bg-zinc-700/50 -translate-x-1/2 -z-0"></div>

                            {/* Main Active Socket for SELECTED SLOT */}
                            <div className="flex items-center gap-12 z-10">
                                {renderGemSocket(engineRef.current.gameState.activeSkills[selectedSlotIndex].activeGem, false, 0)}
                                
                                {/* Supports Container for SELECTED SLOT */}
                                <div className="flex gap-4">
                                     {engineRef.current.gameState.activeSkills[selectedSlotIndex].supportGems.map((g, i) => {
                                         const activeGem = engineRef.current?.gameState.activeSkills[selectedSlotIndex].activeGem;
                                         let isCompatible = true;
                                         if (g && activeGem) {
                                            isCompatible = SkillManager.checkCompatibility(activeGem.gemDefinitionId!, g.gemDefinitionId!);
                                         } else if (g && !activeGem) {
                                            isCompatible = false;
                                         }
                                         
                                         return (
                                             <div key={i} className="flex flex-col items-center">
                                                {renderGemSocket(g, true, i, isCompatible)}
                                             </div>
                                         );
                                     })}
                                </div>
                            </div>
                            
                            {/* Active Skill Info / Live Stats */}
                            {engineRef.current.gameState.activeSkills[selectedSlotIndex].activeGem ? (() => {
                                const resolved = SkillManager.resolveSkill(engineRef.current!.gameState.activeSkills[selectedSlotIndex], engineRef.current!.playerStats);
                                if (!resolved) return null;
                                return (
                                    <div className="mt-8 bg-zinc-900/80 border border-zinc-700 rounded p-3 text-xs font-mono w-full max-w-sm">
                                        <div className="flex justify-between text-cyan-300 font-bold mb-1">
                                            <span>{t(`skill_${resolved.definition.id}_name`, language)}</span>
                                            <span>DPS: {Math.round(resolved.stats.damage * resolved.stats.attackRate)}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-zinc-400">
                                            <span>Dmg: {resolved.stats.damage.toFixed(1)}</span>
                                            <span>Rate: {resolved.stats.attackRate.toFixed(2)}/s</span>
                                            <span>Proj: {resolved.stats.projectileCount}</span>
                                            <span>Area: {resolved.stats.areaOfEffect}</span>
                                            <span className="col-span-2 text-[10px] text-zinc-500 mt-1">Tags: {resolved.tags.join(', ')}</span>
                                        </div>
                                    </div>
                                );
                            })() : (
                                <div className="mt-8 text-zinc-600 font-serif italic">Slot {selectedSlotIndex + 1}: Empty</div>
                            )}
                        </div>

                        {/* 2. Gem Inventory */}
                        <div className="flex-1 bg-zinc-900 p-4">
                            <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-2">Gem Pouch</h3>
                            <div className="grid grid-cols-5 gap-3">
                                {engineRef.current.gameState.gemInventory.map((gem) => {
                                    const def = SKILL_DATABASE[gem.gemDefinitionId || ''];
                                    
                                    // Compatibility Check Visualization against currently selected slot
                                    let borderColor = "border-zinc-700";
                                    let opacity = "opacity-100";
                                    
                                    const currentActiveGem = engineRef.current?.gameState.activeSkills[selectedSlotIndex].activeGem;
                                    
                                    if (def && def.type === 'support') {
                                        if (currentActiveGem) {
                                            const activeDef = SKILL_DATABASE[currentActiveGem.gemDefinitionId!];
                                            const compatible = SkillManager.checkCompatibility(activeDef.id, def.id);
                                            
                                            if (compatible) {
                                                borderColor = "border-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]";
                                            } else {
                                                borderColor = "border-red-900";
                                                opacity = "opacity-30 grayscale";
                                            }
                                        }
                                    } else if (def && def.type === 'active') {
                                        borderColor = "border-cyan-600";
                                    }

                                    return (
                                        <div 
                                            key={gem.id}
                                            onClick={() => handleGemInventoryClick(gem)}
                                            onMouseEnter={(e) => handleItemHover(e, gem)}
                                            onMouseLeave={handleItemLeave}
                                            className={`aspect-square bg-zinc-950 ${borderColor} ${opacity} border-2 rounded-lg flex items-center justify-center cursor-pointer relative hover:brightness-125 transition-all`}
                                        >
                                            <span className="text-xl">
                                                {def?.tags.includes('fire') ? '🔥' : def?.tags.includes('movement') ? '🌪️' : def?.type === 'support' ? '⚪' : '💠'}
                                            </span>
                                            <span className="absolute bottom-1 right-1 text-[8px] font-bold text-zinc-400">
                                                {gem.gemDefinitionId?.substring(0,3).toUpperCase()}
                                            </span>
                                        </div>
                                    );
                                })}
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
                            <div className="w-full bg-[#050505] relative p-4 flex flex-col items-center justify-center border-b border-zinc-800 shrink-0">
                                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                                    <div className="w-56 h-80 border-2 border-zinc-700 rounded-[50%]"></div>
                                </div>
                                <div className="relative w-full max-w-[360px] grid grid-cols-3 gap-4 z-10 py-4">
                                    <div className="col-start-2 h-20">{renderSlot('helmet', engineRef.current.gameState.equipment.helmet, 'h-full w-full')}</div>
                                    <div className="col-start-1 row-start-2 h-28">{renderSlot('weapon', engineRef.current.gameState.equipment.weapon, 'h-full w-full')}</div>
                                    <div className="col-start-2 row-start-2 h-28 flex flex-col gap-2">
                                        {renderSlot('amulet', engineRef.current.gameState.equipment.amulet, 'h-1/3 w-full')}
                                        {renderSlot('body', engineRef.current.gameState.equipment.body, 'h-2/3 w-full')}
                                    </div>
                                    <div className="col-start-3 row-start-2 h-28">{renderSlot('offhand', engineRef.current.gameState.equipment.offhand, 'h-full w-full')}</div>
                                    <div className="col-start-1 row-start-3 h-16">{renderSlot('gloves', engineRef.current.gameState.equipment.gloves, 'h-full w-full')}</div>
                                    <div className="col-start-2 row-start-3 h-16 flex justify-between gap-2">
                                        {renderSlot('ring1', engineRef.current.gameState.equipment.ring1, 'w-1/2 h-full')}
                                        {renderSlot('ring2', engineRef.current.gameState.equipment.ring2, 'w-1/2 h-full')}
                                    </div>
                                    <div className="col-start-3 row-start-3 h-16">{renderSlot('boots', engineRef.current.gameState.equipment.boots, 'h-full w-full')}</div>
                                </div>
                            </div>
                        )}

                        {/* Backpack Container - Scrollable */}
                        <div className="w-full bg-zinc-900 p-4 flex-1 overflow-y-auto min-h-0 pb-12">
                            <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-2 flex justify-between items-center">
                                <span>{t('ui_bag', language)}</span>
                                <div className="flex gap-2 items-center">
                                    <span className="text-zinc-600 mr-2">{engineRef.current.gameState.backpack.length}/{BACKPACK_CAPACITY}</span>
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
                                    const item = engineRef.current!.gameState.backpack[index];
                                    
                                    if (index >= BACKPACK_CAPACITY) return null; 
                                    if (!item) return <div key={i} className="aspect-square bg-zinc-950 border border-zinc-800 rounded shadow-inner"></div>;
                                    
                                    let borderColor = "border-neutral-700";
                                    let textColor = "text-gray-400";
                                    let bgColor = "bg-neutral-800";
                                    if (item.rarity === 'magic') { borderColor = "border-blue-800"; textColor = "text-blue-300"; bgColor="bg-blue-900/20"; }
                                    if (item.rarity === 'rare') { borderColor = "border-yellow-700"; textColor = "text-yellow-300"; bgColor="bg-yellow-900/20"; }
                                    if (item.rarity === 'unique') { borderColor = "border-orange-800"; textColor = "text-orange-300"; bgColor="bg-orange-900/20"; }

                                    return (
                                        <div 
                                            key={item.id} 
                                            onClick={() => item.type === 'equipment' ? handleItemClick(item) : null}
                                            onMouseEnter={(e) => handleItemHover(e, item)}
                                            onMouseLeave={handleItemLeave}
                                            className={`aspect-square ${bgColor} ${borderColor} border rounded flex flex-col items-center justify-center cursor-pointer hover:border-white/50 active:scale-95 transition-all relative group`}
                                        >
                                            {item.type === 'map' ? (
                                                <span className="text-xl">📜</span>
                                            ) : (
                                                <span className={`text-[10px] font-bold ${textColor}`}>{getAbbreviation(item.name, item)}</span>
                                            )}
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
                        {/* Dynamic Name Construction (Simplified) or Fallback */}
                        {tooltip.item.type === 'gem' 
                            ? t(`skill_${tooltip.item.gemDefinitionId}_name`, language)
                            : tooltip.item.name // Equipment names are hard to fully dynamicize without major refactor, keeping english for now
                        }
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
                             <div className="text-[10px] text-zinc-500">Tags: {SKILL_DATABASE[tooltip.item.gemDefinitionId!]?.tags.join(", ")}</div>
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
                                    
                                    // Translate Affix Name
                                    // Logic: strip prefix_ / suffix_ / implicit_ and try to find key
                                    let affixKey = affix.definitionId;
                                    affixKey = affixKey.replace('prefix_', '').replace('suffix_', '').replace('implicit_', '');
                                    // Special case handling or fallback
                                    let affixName = t(`affix_${affixKey}`, language);
                                    if (affixName.startsWith('affix_')) affixName = affix.name; // Fallback to raw name if translation missing

                                    // Special handling for Implicit (Base Property)
                                    if (affix.definitionId.includes('implicit')) {
                                         // Implicit names are often hardcoded stats names in english e.g. "Physical Damage"
                                         // We can map known implicits or just use raw name for now as they are simple
                                         affixName = affix.name; 
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
                <button onClick={handleReset} className="px-8 py-3 bg-neutral-200 text-black font-serif font-bold tracking-widest hover:bg-white active:scale-95 transition-all">
                    RESURRECT
                </button>
            </div>
        )}
        
        {/* LEVEL UP */}
        {upgradeState.show && !isSelectingSupport && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="w-full max-w-sm p-6 flex flex-col items-center">
                    <h2 className="text-3xl font-serif text-yellow-500 tracking-widest mb-8 text-shadow">LEVEL UP</h2>
                    <div className="grid gap-4 w-full">
                        {upgradeState.options.map((option, idx) => {
                            // Translate Option Name and Desc
                            let name = option.name;
                            let desc = option.description;

                            if (option.gemItem) {
                                name = t(`skill_${option.gemItem.gemDefinitionId}_name`, language);
                                desc = t(`skill_${option.gemItem.gemDefinitionId}_desc`, language);
                            } else {
                                // Stat upgrade
                                name = t(`upg_${option.id.split('_')[0]}_name`, language); // Split uuid if present?
                                // Actually upgrades from ItemSystem might be cloned with new IDs. 
                                // We need the definition ID. But `generateRewards` clones them. 
                                // HACK: We can match by English name or just rely on the ID being 'multishot' etc before cloning?
                                // `generateRewards` does: { ...stat, id: uuid() }. The original ID is lost.
                                // FIX: We should rely on `stat` type or match by name, but name is English.
                                // Let's use the `stat` field + value to identify? No.
                                // In `STAT_UPGRADES` list, id is `multishot`. 
                                // Let's try to recover it: `name` is unique enough? 
                                // Better: Upgrades in `ItemSystem` should probably keep a `refId` or similar.
                                // For now, let's map by known English Names or just skip translation for Stat Upgrades if ID is random.
                                // Wait, `generateRewards` clones `stat` object. If `id` is overwritten, we lose it. 
                                // BUT `generateRewards` code: `rewards.push({ ...stat, id: uuid() });`
                                // We lost the original key. 
                                // RECOVERY: Let's use `name` to lookup key in reverse? Or just display english for stats for now.
                                // OR: We can change `ItemSystem` to not overwrite ID? No, ID needs to be unique for keys.
                                // Let's try to map English Name -> Key for now.
                                if (option.name === 'Multi-Shot') { name = t('upg_multishot_name', language); desc = t('upg_multishot_desc', language); }
                                if (option.name === 'Haste') { name = t('upg_haste_name', language); desc = t('upg_haste_desc', language); }
                                if (option.name === 'Giant') { name = t('upg_giant_name', language); desc = t('upg_giant_desc', language); }
                                if (option.name === 'Swift') { name = t('upg_swift_name', language); desc = t('upg_swift_desc', language); }
                                if (option.name === 'Vitality') { name = t('upg_vitality_name', language); desc = t('upg_vitality_desc', language); }
                                if (option.name === 'Precision') { name = t('upg_precision_name', language); desc = t('upg_precision_desc', language); }
                                if (option.name === 'Iron Skin') { name = t('upg_iron_skin_name', language); desc = t('upg_iron_skin_desc', language); }
                                if (option.name === 'Troll Blood') { name = t('upg_regen_name', language); desc = t('upg_regen_desc', language); }
                            }

                            return (
                                <button key={idx} onClick={() => handleSelectUpgrade(option)} className={`relative overflow-hidden group w-full p-4 border border-white/10 bg-zinc-900 hover:bg-zinc-800 hover:border-yellow-500/50 active:scale-95 transition-all shadow-xl text-left flex flex-col gap-1`}>
                                    <div className={`absolute top-0 left-0 w-1 h-full ${option.color}`}></div>
                                    <span className="text-gray-200 font-serif font-bold text-lg uppercase tracking-wide ml-2">{name}</span>
                                    <span className="text-gray-500 text-xs font-mono ml-2">{desc}</span>
                                    {option.gemItem && (
                                        <span className="text-cyan-400 text-[10px] font-bold ml-2">GEM CARD</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

const StatRow = ({ label, value, color = "text-gray-200" }: { label: string, value: string, color?: string }) => (
    <div className="flex justify-between items-center border-b border-white/5 pb-1">
        <span className="text-zinc-500">{label}</span>
        <span className={`font-bold ${color}`}>{value}</span>
    </div>
);
