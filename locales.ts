






export const TRANSLATIONS = {
  en: {
    // UI Buttons
    ui_bag: "INVENTORY",
    ui_skills: "SKILLS",
    ui_settings: "OPTIONS",
    ui_merchant: "VENDOR",
    ui_map_device: "MAP DEVICE",
    ui_interact: "INTERACT",
    
    // UI General
    ui_attributes: "Attributes",
    ui_tab_equipment: "Equipment",
    ui_tab_maps: "Maps",
    ui_sort: "Sort",
    ui_auto_sort: "Auto-Sort",
    ui_on: "ON",
    ui_off: "OFF",
    ui_items_count: "{n} Items",
    ui_rune_storage: "RUNE STORAGE",
    ui_link_gem: "LINK GEM",
    ui_select_active: "Select an active skill to support",
    ui_incompatible: "Incompatible",
    ui_return: "RETURN",
    ui_stash: "STASH TO BAG",
    ui_slot_empty: "SLOT EMPTY",
    ui_map_select: "SELECT MAP\nFROM BAG",
    ui_no_map_selected: "No Map Selected",
    ui_activate: "ACTIVATE",
    ui_free_run: "FREE RUN (T1)",

    // Stats
    stat_damage: "Damage",
    stat_health: "Life",
    stat_atk_spd: "Attack Speed",
    stat_defense: "Armour",
    stat_crit_chance: "Crit Chance",
    stat_move_spd: "Movement Speed",
    stat_crit_mult: "Crit Multiplier",
    stat_ailment: "Ailment Chance",
    
    // Item Types & Rarities
    item_helmet: "Helmet",
    item_weapon: "Weapon",
    item_offhand: "Offhand",
    item_body: "Body Armour",
    item_gloves: "Gloves",
    item_boots: "Boots",
    item_amulet: "Amulet",
    item_ring: "Ring",
    item_ring1: "Ring",
    item_ring2: "Ring",
    item_map: "Map",
    rarity_normal: "Normal",
    rarity_magic: "Magic",
    rarity_rare: "Rare",
    rarity_unique: "Unique",
    
    // Merchant & Economy
    shop_title: "VENDOR",
    shop_sell_white: "Sell Normal Items",
    shop_sell_blue: "Sell Magic Items",
    shop_sell_yellow: "Sell Rare Items",
    shop_sell_junk: "Sell Junk (Normal/Magic)",
    shop_desc_white: "5g / item",
    shop_desc_blue: "10g / item",
    shop_desc_yellow: "20g / item",
    shop_mode_hint: "Tap an item in your inventory to sell it.",
    
    // Settings
    settings_title: "OPTIONS",
    settings_lang: "Language",
    settings_audio: "Audio",
    
    // Messages / Tooltips
    msg_sold_batch: "Sold {n} items for {g} Gold",
    msg_sold_single: "Sold {name} for {g} Gold",
    msg_bag_full: "Inventory Full!",
    msg_run_complete: "Expedition Complete - Character Reset",
    lbl_implicit: "Implicit",
    lbl_new: "New",
    lbl_map_tier: "Map Tier {n}",
    lbl_level: "Level",
    lbl_floor: "Floor",
    lbl_hideout: "Hideout",
    lbl_boss_floor: "Boss Arena",

    // --- NEW DYNAMIC CONTENT ---
    
    // Skill Tags
    tag_projectile: "Projectile",
    tag_melee: "Melee",
    tag_area: "Area",
    tag_fire: "Fire",
    tag_cold: "Cold",
    tag_lightning: "Lightning",
    tag_physical: "Physical",
    tag_duration: "Duration",
    tag_movement: "Movement",
    tag_defense: "Guard",

    // Skill Labels
    lbl_dps: "DPS",
    lbl_dmg: "Hit Dmg",
    lbl_rate: "Atk Rate",
    lbl_cooldown: "Cooldown",
    lbl_tags: "Tags",
    lbl_proj: "Proj",
    lbl_area: "Area",
    lbl_knockback: "Knockback",

    // Implicits
    affix_implicit_weapon: "Physical Damage",
    affix_implicit_offhand: "Chance to Block",
    affix_implicit_helmet: "Armour",
    affix_implicit_body: "Maximum Life",
    affix_implicit_gloves: "Attack Speed",
    affix_implicit_boots: "Movement Speed",
    affix_implicit_amulet: "Maximum Life",
    affix_implicit_ring1: "Maximum Life",
    affix_implicit_ring2: "Maximum Life",

    // Skills
    skill_fireball_name: "Fireball",
    skill_fireball_desc: "Fires a projectile that deals Fire Damage.",
    skill_cyclone_name: "Cyclone",
    skill_cyclone_desc: "Channel to spin and attack enemies around you.",
    skill_nova_name: "Blizzard",
    skill_nova_desc: "Summons ice shards to strike random enemies nearby. 100% Chill.",
    skill_electro_sphere_name: "Electro Sphere",
    skill_electro_sphere_desc: "Fires a slow moving lightning orb that pierces enemies and triggers electric pulses.",
    skill_flame_ring_name: "Flame Ring",
    skill_flame_ring_desc: "Knocks back nearby enemies with a burst of fire.",
    skill_orbit_name: "Orbit Support",
    skill_orbit_desc: "Projectiles orbit the caster.",
    skill_pierce_name: "Pierce Support",
    skill_pierce_desc: "Projectiles Pierce 2 additional Targets, 20% more Damage",
    skill_lmp_name: "Lesser Multiple Projectiles",
    skill_lmp_desc: "2 additional Projectiles, 30% less Damage",
    skill_gmp_name: "Greater Multiple Projectiles",
    skill_gmp_desc: "4 additional Projectiles, 50% less Damage",
    skill_faster_attacks_name: "Faster Attacks",
    skill_faster_attacks_desc: "30% more Attack Speed",
    skill_inc_area_name: "Increased Area",
    skill_inc_area_desc: "40% more Area of Effect",
    skill_conc_effect_name: "Concentrated Effect",
    skill_conc_effect_desc: "50% more Area Damage, 30% less Area of Effect",

    // Upgrades
    upg_multishot_name: "Multi-Shot",
    upg_multishot_desc: "Fires 1 additional Projectile",
    upg_haste_name: "Haste",
    upg_haste_desc: "20% increased Attack Speed",
    upg_giant_name: "Giant",
    upg_giant_desc: "50% increased Damage",
    upg_swift_name: "Swift",
    upg_swift_desc: "20% increased Movement Speed",
    upg_vitality_name: "Vitality",
    upg_vitality_desc: "+50 to Maximum Life",
    upg_precision_name: "Precision",
    upg_precision_desc: "+10% to Critical Strike Chance",
    upg_iron_skin_name: "Iron Skin",
    upg_iron_skin_desc: "+30 to Armour",
    upg_regen_name: "Troll Blood",
    upg_regen_desc: "Regenerate 2 Life per second",
    upg_wisdom_name: "Wisdom",
    upg_wisdom_desc: "Gain 20% increased Experience",

    // Affixes
    affix_heavy: "Increased Damage",
    affix_quick: "Increased Movement Speed",
    affix_alacrity: "Increased Attack Speed",
    affix_vital: "Maximum Life",
    affix_sharp: "Critical Strike Chance",
    affix_iron: "Armour",
    affix_pyromancer: "Increased Fire Damage",
    affix_sniper: "Increased Projectile Damage",
    affix_giant: "Increased Area of Effect",
    affix_deadly: "Increased Monster Damage",
    affix_armored: "Increased Monster Life",
    affix_hordes: "Increased Monster Pack Size",
    affix_wealth: "Increased Item Rarity",
    affix_learning: "Increased Experience Gain",
    
    // Base Items
    base_weapon: "Blade",
    base_offhand: "Shield",
    base_helmet: "Helmet",
    base_body: "Plate",
    base_gloves: "Gauntlets",
    base_boots: "Greaves",
    base_amulet: "Amulet",
    base_ring: "Ring",
    base_map: "Map",
    base_zone: "Zone"
  },
  zh: {
    // UI Buttons
    ui_bag: "背包",
    ui_skills: "技能",
    ui_settings: "设置",
    ui_merchant: "贩卖",
    ui_map_device: "异界装置",
    ui_interact: "交互",

    // UI General
    ui_attributes: "属性面板",
    ui_tab_equipment: "装备",
    ui_tab_maps: "地图",
    ui_sort: "整理",
    ui_auto_sort: "自动整理",
    ui_on: "开",
    ui_off: "关",
    ui_items_count: "{n} 物品",
    ui_rune_storage: "符文仓库",
    ui_link_gem: "连接技能",
    ui_select_active: "选择一个主动技能进行辅助",
    ui_incompatible: "不兼容",
    ui_return: "返回",
    ui_stash: "放回背包",
    ui_slot_empty: "空插槽",
    ui_map_select: "请从背包\n选择地图",
    ui_no_map_selected: "未选择地图",
    ui_activate: "激活",
    ui_free_run: "自由探索 (T1)",
    
    // Stats
    stat_damage: "伤害",
    stat_health: "生命",
    stat_atk_spd: "攻击速度",
    stat_defense: "护甲",
    stat_crit_chance: "暴击率",
    stat_move_spd: "移动速度",
    stat_crit_mult: "暴击加成",
    stat_ailment: "异常几率",
    
    // Item Types & Rarities
    item_helmet: "头盔",
    item_weapon: "武器",
    item_offhand: "副手",
    item_body: "胸甲",
    item_gloves: "手套",
    item_boots: "鞋子",
    item_amulet: "项链",
    item_ring: "戒指",
    item_ring1: "戒指",
    item_ring2: "戒指",
    item_map: "地图",
    rarity_normal: "普通",
    rarity_magic: "魔法",
    rarity_rare: "稀有",
    rarity_unique: "传奇",
    
    // Merchant & Economy
    shop_title: "贩卖",
    shop_sell_white: "出售普通物品 (白)",
    shop_sell_blue: "出售魔法物品 (蓝)",
    shop_sell_yellow: "出售稀有物品 (黄)",
    shop_sell_junk: "出售垃圾 (白/蓝)",
    shop_desc_white: "5金 / 件",
    shop_desc_blue: "10金 / 件",
    shop_desc_yellow: "20金 / 件",
    shop_mode_hint: "点击背包中的物品进行出售。",
    
    // Settings
    settings_title: "设置",
    settings_lang: "语言",
    settings_audio: "音量",
    
    // Messages / Tooltips
    msg_sold_batch: "出售了 {n} 件物品，获得 {g} 金币",
    msg_sold_single: "出售了 {name}，获得 {g} 金币",
    msg_bag_full: "背包已满！",
    msg_run_complete: "远征结束 - 角色重置",
    lbl_implicit: "基底",
    lbl_new: "新",
    lbl_map_tier: "地图阶级 {n}",
    lbl_level: "等级",
    lbl_floor: "层数",
    lbl_hideout: "藏身处",
    lbl_boss_floor: "首领战",

    // --- NEW DYNAMIC CONTENT ---
    
    // Skill Tags
    tag_projectile: "投射物",
    tag_melee: "近战",
    tag_area: "范围",
    tag_fire: "火焰",
    tag_cold: "冰霜",
    tag_lightning: "闪电",
    tag_physical: "物理",
    tag_duration: "持续",
    tag_movement: "位移",
    tag_defense: "防卫",

    // Skill Labels
    lbl_dps: "秒伤",
    lbl_dmg: "击中伤害",
    lbl_rate: "攻击频率",
    lbl_cooldown: "冷却时间",
    lbl_tags: "标签",
    lbl_proj: "投射物",
    lbl_area: "范围",
    lbl_knockback: "击退",

    // Implicits
    affix_implicit_weapon: "物理伤害",
    affix_implicit_offhand: "格挡几率",
    affix_implicit_helmet: "护甲",
    affix_implicit_body: "最大生命",
    affix_implicit_gloves: "攻击速度",
    affix_implicit_boots: "移动速度",
    affix_implicit_amulet: "最大生命",
    affix_implicit_ring1: "最大生命",
    affix_implicit_ring2: "最大生命",

    // Skills
    skill_fireball_name: "火球术",
    skill_fireball_desc: "发射一枚造成火焰伤害的投射物。",
    skill_cyclone_name: "旋风斩",
    skill_cyclone_desc: "持续引导以旋转并攻击周围的敌人。",
    skill_nova_name: "暴风雪",
    skill_nova_desc: "召唤冰凌打击附近的随机敌人。100% 冰缓。",
    skill_electro_sphere_name: "磁暴电球",
    skill_electro_sphere_desc: "发射缓慢穿透敌人的电球，接触敌人时触发范围电击。",
    skill_flame_ring_name: "抗拒火环",
    skill_flame_ring_desc: "释放火焰推开周围的敌人。",
    skill_orbit_name: "星轨辅助",
    skill_orbit_desc: "投射物将环绕施法者旋转。",
    skill_pierce_name: "穿透",
    skill_pierce_desc: "投射物额外穿透 2 个目标，伤害总增 20%",
    skill_lmp_name: "低阶多重投射",
    skill_lmp_desc: "投射物数量增加 2 个，伤害总降 30%",
    skill_gmp_name: "高阶多重投射",
    skill_gmp_desc: "投射物数量增加 4 个，伤害总降 50%",
    skill_faster_attacks_name: "快速攻击",
    skill_faster_attacks_desc: "攻击速度总增 30%",
    skill_inc_area_name: "增大范围",
    skill_inc_area_desc: "范围效果总增 40%",
    skill_conc_effect_name: "集中效应",
    skill_conc_effect_desc: "范围伤害总增 50%，范围效果总降 30%",

    // Upgrades
    upg_multishot_name: "多重投射",
    upg_multishot_desc: "投射物数量增加 1 个",
    upg_haste_name: "急速",
    upg_haste_desc: "攻击速度增加 20%",
    upg_giant_name: "巨人",
    upg_giant_desc: "伤害增加 50%",
    upg_swift_name: "迅捷",
    upg_swift_desc: "移动速度增加 20%",
    upg_vitality_name: "活力",
    upg_vitality_desc: "+50 最大生命",
    upg_precision_name: "精准",
    upg_precision_desc: "+10% 暴击率",
    upg_iron_skin_name: "铁皮",
    upg_iron_skin_desc: "+30 护甲",
    upg_regen_name: "巨魔之血",
    upg_regen_desc: "每秒回复 2 点生命",
    upg_wisdom_name: "智慧",
    upg_wisdom_desc: "额外获得 20% 经验",

    // Affixes
    affix_heavy: "伤害增加",
    affix_quick: "移动速度增加",
    affix_alacrity: "攻击速度增加",
    affix_vital: "最大生命",
    affix_sharp: "暴击率",
    affix_iron: "护甲",
    affix_pyromancer: "火焰伤害增加",
    affix_sniper: "投射物伤害增加",
    affix_giant: "范围效果增加",
    affix_deadly: "怪物伤害增加",
    affix_armored: "怪物生命增加",
    affix_hordes: "怪物群大小增加",
    affix_wealth: "物品稀有度增加",
    affix_learning: "经验获取增加",

    // Base Items
    base_weapon: "利刃",
    base_offhand: "盾牌",
    base_helmet: "头盔",
    base_body: "胸甲",
    base_gloves: "手套",
    base_boots: "胫甲",
    base_amulet: "护身符",
    base_ring: "戒指",
    base_map: "地图",
    base_zone: "区域"
  }
};

export type Language = 'en' | 'zh';

export function t(key: string, lang: Language, params?: Record<string, string | number>): string {
  // @ts-ignore
  let text = TRANSLATIONS[lang][key] || TRANSLATIONS['en'][key] || key;
  
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, String(v));
    });
  }
  
  return text;
}
