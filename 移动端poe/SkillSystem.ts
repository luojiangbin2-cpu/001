
import { ActiveSkillInstance, ResolvedSkill, SkillDefinition, SkillStats, SkillTag } from "./types";
import { StatsSystem } from "./StatsSystem";

// --- SKILL DATABASE ---

export const SKILL_DATABASE: Record<string, SkillDefinition> = {
    // ACTIVE SKILLS
    'fireball': {
        id: 'fireball',
        name: 'Fireball',
        type: 'active',
        tags: ['projectile', 'fire'],
        description: 'Launches a ball of fire.',
        baseStats: {
            damage: 15,
            attackRate: 1.5,
            projectileCount: 1,
            projectileSpeed: 600,
            projectileSpread: 0,
            range: 800,
            areaOfEffect: 0
        },
        evolutions: [
            {
                id: 'magma_burst',
                name: "Magma Burst",
                description: "Fireballs explode on impact. Adds Area tag.",
                addTags: ['area'],
                visualTag: 'explosion',
                statModifiers: { areaOfEffect: 100 }
            },
            {
                id: 'flame_gatling',
                name: "Flame Gatling",
                description: "Fires projectiles rapidly in a line. No spread.",
                // Using additive logic: +2.0 rate to base 1.5 = 3.5. -6 damage to base 15 = 9.
                statModifiers: { attackRate: 2.0, damage: -6, projectileSpread: 0, projectileCount: 0 }
            }
        ]
    },
    'cyclone': {
        id: 'cyclone',
        name: 'Cyclone',
        type: 'active',
        tags: ['melee', 'area', 'physical'],
        description: 'Spin to attack enemies around you 3 times. Attack speed reduces the delay between spins.',
        baseStats: {
            damage: 6, // 40% effectiveness (approx 15 * 0.4)
            attackRate: 1.0, // Base cooldown = 1.0s / PlayerAttackSpeed
            range: 0,
            areaOfEffect: 120, // Radius
            projectileCount: 0
        }
    },
    'nova': {
        id: 'nova',
        name: 'Ice Nova',
        type: 'active',
        tags: ['area', 'projectile', 'cold'], 
        description: 'Explodes projectiles in a circle.',
        baseStats: {
            damage: 20,
            attackRate: 1.0,
            projectileCount: 8,
            projectileSpeed: 400,
            projectileSpread: 360,
            areaOfEffect: 0
        }
    },
    'flame_ring': {
        id: 'flame_ring',
        name: 'Flame Ring',
        type: 'active',
        tags: ['area', 'fire', 'defense'],
        description: 'Push enemies away with a burst of fire.',
        baseStats: {
            damage: 8, // Low damage
            attackRate: 0.25, // Cooldown is inverse (1/0.25 = 4.0s) or handled by engine logic
            cooldown: 4.0, 
            range: 0,
            areaOfEffect: 200,
            knockback: 600 // Physics force
        }
    },

    // SUPPORT GEMS
    'pierce': {
        id: 'pierce',
        name: 'Pierce Support',
        type: 'support',
        tags: [],
        supportedTags: ['projectile'],
        description: 'Projectiles Pierce 2 additional Targets, 20% more Damage',
        baseStats: {
            pierceCount: 2
        },
        statMultipliers: {
            damage: 1.2
        }
    },
    'lmp': {
        id: 'lmp',
        name: 'Lesser Multiple Projectiles',
        type: 'support',
        tags: [],
        supportedTags: ['projectile'],
        description: '2 Extra Projectiles, 30% Less Damage',
        baseStats: {
            projectileCount: 2, 
            projectileSpread: 20 
        },
        statMultipliers: {
            damage: 0.7 
        }
    },
    'inc_area': {
        id: 'inc_area',
        name: 'Increased Area',
        type: 'support',
        tags: [],
        supportedTags: ['area'],
        description: '40% Increased Area of Effect',
        baseStats: {},
        statMultipliers: {
            areaOfEffect: 1.4 
        }
    },
    'faster_attacks': {
        id: 'faster_attacks',
        name: 'Faster Attacks',
        type: 'support',
        tags: [],
        supportedTags: ['melee', 'projectile'],
        description: '30% Faster Attack Speed',
        baseStats: {},
        statMultipliers: {
            attackRate: 1.3
        }
    },
    'gmp': {
        id: 'gmp',
        name: 'Greater Multiple Projectiles',
        type: 'support',
        tags: [],
        supportedTags: ['projectile'],
        description: '4 Extra Projectiles, 50% Less Damage',
        baseStats: {
            projectileCount: 4,
            projectileSpread: 30
        },
        statMultipliers: {
            damage: 0.5
        }
    },
    'conc_effect': {
        id: 'conc_effect',
        name: 'Concentrated Effect',
        type: 'support',
        tags: [],
        supportedTags: ['area'],
        description: '50% More Area Damage, 30% Less Area',
        baseStats: {},
        statMultipliers: {
            damage: 1.5,
            areaOfEffect: 0.7
        }
    }
};

export class SkillManager {

    /**
     * Checks if a support gem is compatible with an active gem based on tags.
     */
    public static checkCompatibility(activeGemId: string, supportGemId: string): boolean {
        const activeDef = SKILL_DATABASE[activeGemId];
        const supportDef = SKILL_DATABASE[supportGemId];

        if (!activeDef || !supportDef) return false;
        if (activeDef.type !== 'active' || supportDef.type !== 'support') return false;

        // If support has no supportedTags defined, it is either universal or buggy. 
        // Assuming universal if empty (or checking against all tags).
        if (!supportDef.supportedTags || supportDef.supportedTags.length === 0) return true;

        // Check if Active Skill has at least one tag required by the Support
        return supportDef.supportedTags.some(tag => activeDef.tags.includes(tag));
    }

    /**
     * Calculates the final stats of a skill by combining:
     * 1. Active Skill Base Stats
     * 2. Evolution Modifiers (Base + Evo)
     * 3. Compatible Support Gems (Base + Multipliers)
     * 4. Player Global Stats (StatsSystem) - FILTERED BY TAGS
     */
    public static resolveSkill(instance: ActiveSkillInstance, playerStats: StatsSystem): ResolvedSkill | null {
        // 0. Check if active gem exists
        if (!instance.activeGem || !instance.activeGem.gemDefinitionId) return null;

        const definition = SKILL_DATABASE[instance.activeGem.gemDefinitionId];
        if (!definition) return null;

        // 1. Initialize with Base Stats
        const finalStats: SkillStats = {
            damage: definition.baseStats.damage || 0,
            attackRate: definition.baseStats.attackRate || 1,
            cooldown: definition.baseStats.cooldown || 0,
            range: definition.baseStats.range || 500,
            areaOfEffect: definition.baseStats.areaOfEffect || 0,
            projectileCount: definition.baseStats.projectileCount || 0,
            projectileSpeed: definition.baseStats.projectileSpeed || 0,
            projectileSpread: definition.baseStats.projectileSpread || 0,
            duration: definition.baseStats.duration || 0,
            ailmentChance: 0,
            knockback: definition.baseStats.knockback || 0,
            pierceCount: definition.baseStats.pierceCount || 0,
            orbit: 0
        };

        // Initialize tags based on definition, can be modified by evolution
        let activeTags = [...definition.tags];
        let activeVisualTag = undefined;

        // 1.5. Apply Evolution (If exists)
        if (instance.evolutionId && definition.evolutions) {
            const evo = definition.evolutions.find(e => e.id === instance.evolutionId);
            if (evo) {
                // Update Tags
                if (evo.addTags) {
                    activeTags.push(...evo.addTags);
                }
                if (evo.removeTags) {
                    activeTags = activeTags.filter(t => !evo.removeTags!.includes(t));
                }
                if (evo.visualTag) {
                    activeVisualTag = evo.visualTag;
                }

                // Apply Stat Modifiers (Additive)
                if (evo.statModifiers) {
                    for (const key in evo.statModifiers) {
                        const k = key as keyof SkillStats;
                        if (evo.statModifiers[k] !== undefined) {
                            finalStats[k] += evo.statModifiers[k]!;
                        }
                    }
                }
            }
        }

        // 2. Apply Supports
        if (instance.supportGems) {
            for (const supportGem of instance.supportGems) {
                if (!supportGem || !supportGem.gemDefinitionId) continue;

                const supportDef = SKILL_DATABASE[supportGem.gemDefinitionId];
                if (!supportDef) continue;

                // Check compatibility using the EVOLVED activeTags
                let isCompatible = false;
                if (!supportDef.supportedTags || supportDef.supportedTags.length === 0) {
                    isCompatible = true;
                } else {
                    isCompatible = supportDef.supportedTags.some(tag => activeTags.includes(tag));
                }
                
                if (isCompatible) {
                    // Apply Additive Base Stats
                    if (supportDef.baseStats) {
                        if (supportDef.baseStats.projectileCount) finalStats.projectileCount += supportDef.baseStats.projectileCount;
                        if (supportDef.baseStats.projectileSpread) finalStats.projectileSpread += supportDef.baseStats.projectileSpread;
                        if (supportDef.baseStats.cooldown) finalStats.cooldown += supportDef.baseStats.cooldown;
                        if (supportDef.baseStats.areaOfEffect) finalStats.areaOfEffect += supportDef.baseStats.areaOfEffect;
                        if (supportDef.baseStats.pierceCount) finalStats.pierceCount += supportDef.baseStats.pierceCount;
                        if (supportDef.baseStats.orbit) finalStats.orbit += supportDef.baseStats.orbit;
                    }

                    // Apply Multipliers
                    if (supportDef.statMultipliers) {
                        if (supportDef.statMultipliers.damage) finalStats.damage *= supportDef.statMultipliers.damage;
                        if (supportDef.statMultipliers.attackRate) finalStats.attackRate *= supportDef.statMultipliers.attackRate;
                        if (supportDef.statMultipliers.areaOfEffect) finalStats.areaOfEffect *= supportDef.statMultipliers.areaOfEffect;
                        if (supportDef.statMultipliers.projectileSpeed) finalStats.projectileSpeed *= supportDef.statMultipliers.projectileSpeed;
                    }
                }
            }
        }

        // 3. Apply Player Global Stats (using the Evolved Tag Context)
        
        // Damage Calculation
        const playerGlobalDmg = playerStats.getStatValue('bulletDamage', activeTags);
        const playerDmgRatio = playerGlobalDmg / 10; 
        finalStats.damage *= playerDmgRatio;

        const playerAtkSpdRatio = playerStats.getStatValue('attackSpeed', activeTags); 
        finalStats.attackRate *= playerAtkSpdRatio;

        // Projectile Count: Additive
        const playerProjCount = playerStats.getStatValue('projectileCount', activeTags); 
        finalStats.projectileCount += (playerProjCount - 1);
        
        // Ailment Chance
        finalStats.ailmentChance = playerStats.getStatValue('ailmentChance', activeTags);
        
        // Pierce Count
        finalStats.pierceCount += playerStats.getStatValue('pierceCount', activeTags);

        return {
            definition: definition,
            stats: finalStats,
            tags: activeTags,
            visualTag: activeVisualTag
        };
    }
}
