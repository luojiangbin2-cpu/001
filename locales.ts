
export const TRANSLATIONS = {
  en: {
    // UI Buttons
    ui_bag: "BAG",
    ui_skills: "SKILLS",
    ui_settings: "SETTINGS",
    ui_merchant: "MERCHANT",
    ui_map_device: "MAP DEVICE",
    ui_interact: "INTERACT",
    
    // Stats
    stat_damage: "Damage",
    stat_health: "Health",
    stat_atk_spd: "Atk Spd",
    stat_defense: "Defense",
    stat_crit_chance: "Crit %",
    stat_move_spd: "Move Spd",
    stat_crit_mult: "Crit Mult",
    
    // Item Types & Rarities
    item_helmet: "Helmet",
    item_weapon: "Weapon",
    item_offhand: "Offhand",
    item_body: "Body Armor",
    item_gloves: "Gloves",
    item_boots: "Boots",
    item_amulet: "Amulet",
    item_ring: "Ring",
    rarity_normal: "Normal",
    rarity_magic: "Magic",
    rarity_rare: "Rare",
    rarity_unique: "Unique",
    
    // Merchant & Economy
    shop_title: "RECYCLING CENTER",
    shop_sell_white: "Sell Normal (White)",
    shop_sell_blue: "Sell Magic (Blue)",
    shop_sell_yellow: "Sell Rare (Yellow)",
    shop_sell_junk: "Sell Junk (White/Blue)",
    shop_desc_white: "5g / item",
    shop_desc_blue: "10g / item",
    shop_desc_yellow: "20g / item",
    shop_mode_hint: "Tap an item in your bag to sell it individually.",
    
    // Settings
    settings_title: "SETTINGS",
    settings_lang: "Language",
    settings_audio: "Audio",
    
    // Messages / Tooltips
    msg_sold_batch: "Sold {n} items for {g} Gold",
    msg_sold_single: "Sold {name} for {g} Gold",
    msg_bag_full: "Backpack Full!",
    msg_run_complete: "Run Complete - Character Reset",
    lbl_implicit: "Implicit",
    lbl_new: "New",
    lbl_map_tier: "Map Tier {n}",
    lbl_level: "LVL",
    lbl_floor: "FLOOR",
    lbl_hideout: "HIDEOUT",
    lbl_boss_floor: "BOSS FLOOR"
  },
  zh: {
    // UI Buttons
    ui_bag: "背包",
    ui_skills: "技能",
    ui_settings: "设置",
    ui_merchant: "商人",
    ui_map_device: "异界装置",
    ui_interact: "交互",
    
    // Stats
    stat_damage: "伤害",
    stat_health: "生命值",
    stat_atk_spd: "攻速",
    stat_defense: "护甲",
    stat_crit_chance: "暴击率",
    stat_move_spd: "移速",
    stat_crit_mult: "暴击伤害",
    
    // Item Types & Rarities
    item_helmet: "头盔",
    item_weapon: "武器",
    item_offhand: "副手",
    item_body: "胸甲",
    item_gloves: "手套",
    item_boots: "鞋子",
    item_amulet: "项链",
    item_ring: "戒指",
    rarity_normal: "普通",
    rarity_magic: "魔法",
    rarity_rare: "稀有",
    rarity_unique: "传奇",
    
    // Merchant & Economy
    shop_title: "回收中心",
    shop_sell_white: "一键卖白装 (普通)",
    shop_sell_blue: "一键卖蓝装 (魔法)",
    shop_sell_yellow: "一键卖黄装 (稀有)",
    shop_sell_junk: "一键清理 (白/蓝)",
    shop_desc_white: "5金 / 件",
    shop_desc_blue: "10金 / 件",
    shop_desc_yellow: "20金 / 件",
    shop_mode_hint: "点击背包中的物品可单独出售。",
    
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
    lbl_boss_floor: "首领战"
  }
};

export type Language = 'en' | 'zh';

export function t(key: keyof typeof TRANSLATIONS.en, lang: Language, params?: Record<string, string | number>): string {
  let text = TRANSLATIONS[lang][key] || TRANSLATIONS['en'][key] || key;
  
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, String(v));
    });
  }
  
  return text;
}
