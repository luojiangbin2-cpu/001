
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
                level: 3,
                description: "Evolution: Explodes on impact (Gains Area Tag)",
                tagsAdded: ['area'],
                statsAdded: { areaOfEffect: 100 }
            },
            {
                level: 7,
                description: "Mastery: +2 Projectiles",
                statsAdded: { projectileCount: 2 }
            }
        ]
    },
    'cyclone': {
        id: 'cyclone',
        name: 'Cyclone',
        type: 'active',
        tags: ['melee', 'area', 'physical'],
        description: 'Spin to attack enemies around you. Attack speed reduces delay.',
        baseStats: {
            damage: 6,
            attackRate: 1.0, 
            range: 0,
            areaOfEffect: 120,
            projectileCount: 0
        },
        evolutions: [
            {
                level: 3,
                description: "Evolution: Gains Movement Tag & Size",
                tagsAdded: ['movement'],
                statsAdded: { areaOfEffect: 40, moveSpeed: 0.1 }
            },
            {
                level: 7,
                description: "Mastery: Spin Frequency Doubled",
                statsAdded: { attackRate: 1.0 }
            }
        ]
    },
    'nova': {
        id: 'nova',
        name: 'Blizzard',
        type: 'active',
        tags: ['area', 'cold'], 
        description: 'Summons ice shards to strike random enemies nearby.',
        baseStats: {
            damage: 30,
            attackRate: 0.8,
            projectileCount: 5,
            projectileSpeed: 0,
            projectileSpread: 0,
            areaOfEffect: 0,
            range: 280,
            ailmentChance: 1.0
        },
        evolutions: [
            {
                level: 3,
                description: "Evolution: Strikes +3 more targets",
                statsAdded: { projectileCount: 3 }
            },
            {
                level: 5,
                description: "Evolution: Ice shards explode (Gains Projectile Tag)",
                tagsAdded: ['projectile'],
                statsAdded: { areaOfEffect: 60 }
            }
        ]
    },
    'electro_sphere': {
        id: 'electro_sphere',
        name: 'Electro Sphere',
        type: 'active',
        tags: ['projectile', 'area', 'lightning', 'duration'],
        description: 'Launches a slow-moving orb that pulses electricity.',
        baseStats: {
            damage: 12,
            attackRate: 1.2,
            projectileCount: 1,
            projectileSpeed: 150,
            projectileSpread: 0,
            pierceCount: 999,
            areaOfEffect: 80,
            duration: 3.0,
            range: 800
        },
        evolutions: [
            {
                level: 5,
                description: "Evolution: Massive Orb & 100% Shock",
                statsAdded: { areaOfEffect: 60, ailmentChance: 1.0, damage: 10 }
            }
        ]
    },
    'flame_ring': {
        id: 'flame_ring',
        name: 'Flame Ring',
        type: 'active',
        tags: ['area', 'fire', 'defense'],
        description: 'Push enemies away with a burst of fire.',
        baseStats: {
            damage: 8, 
            attackRate: 0.25,
            cooldown: 4.0, 
            range: 0,
            areaOfEffect: 200,
            knockback: 600
        },
        evolutions: [
            {
                level: 3,
                description: "Evolution: Reduced Cooldown & More Knockback",
                statsAdded: { attackRate: 0.15, knockback: 200 }
            }
        ]
    },

    // SUPPORT GEMS
    'orbit': {
        id: 'orbit',
        name: 'Orbit Support',
        type: 'support',
        tags: [],
        supportedTags: ['projectile'],
        description: 'Projectiles orbit around the caster.',
        baseStats: {
            orbit: 1,
            duration: 2.0
        },
        statMultipliers: {
            projectileSpeed: 0.5,
            damage: 0.8
        }
    },
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
        description: '35% Faster Attack Speed, 50% Less Damage',
        baseStats: {},
        statMultipliers: {
            attackRate: 1.35,
            damage: 0.5
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
     * Takes resolved tags into account.
     */
    public static checkCompatibility(activeGemId: string, supportGemId: string, resolvedActiveTags?: SkillTag[]): boolean {
        const activeDef = SKILL_DATABASE[activeGemId];
        const supportDef = SKILL_DATABASE[supportGemId];

        if (!activeDef || !supportDef) return false;
        if (activeDef.type !== 'active' || supportDef.type !== 'support') return false;

        if (!supportDef.supportedTags || supportDef.supportedTags.length === 0) return true;

        const tagsToCheck = resolvedActiveTags || activeDef.tags;
        return supportDef.supportedTags.some(tag => tagsToCheck.includes(tag));
    }

    /**
     * Calculates the final stats of a skill by combining:
     * 1. Active Skill Base Stats + Evolution Stats
     * 2. Compatible Support Gems (Base + Multipliers)
     * 3. Player Global Stats (StatsSystem) - FILTERED BY EVOLVED TAGS
     */
    public static resolveSkill(instance: ActiveSkillInstance, playerStats: StatsSystem): ResolvedSkill | null {
        if (!instance.activeGem || !instance.activeGem.gemDefinitionId) return null;

        const definition = SKILL_DATABASE[instance.activeGem.gemDefinitionId];
        if (!definition) return null;

        const currentLevel = instance.activeGem.level || 1;

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
            ailmentChance: definition.baseStats.ailmentChance || 0,
            knockback: definition.baseStats.knockback || 0,
            pierceCount: definition.baseStats.pierceCount || 0,
            orbit: definition.baseStats.orbit || 0,
            moveSpeed: definition.baseStats.moveSpeed || 0
        };

        // 1a. Apply Standard Level Scaling
        finalStats.damage += (currentLevel - 1) * 2; 

        // 1b. Apply Evolutions
        let activeTags = [...definition.tags];
        
        if (definition.evolutions) {
            for (const evo of definition.evolutions) {
                if (currentLevel >= evo.level) {
                    // Add Stats
                    if (evo.statsAdded) {
                        if (evo.statsAdded.damage) finalStats.damage += evo.statsAdded.damage;
                        if (evo.statsAdded.areaOfEffect) finalStats.areaOfEffect += evo.statsAdded.areaOfEffect;
                        if (evo.statsAdded.projectileCount) finalStats.projectileCount += evo.statsAdded.projectileCount;
                        if (evo.statsAdded.attackRate) finalStats.attackRate += evo.statsAdded.attackRate;
                        if (evo.statsAdded.knockback) finalStats.knockback += evo.statsAdded.knockback;
                        if (evo.statsAdded.ailmentChance) finalStats.ailmentChance += evo.statsAdded.ailmentChance;
                        if (evo.statsAdded.moveSpeed) finalStats.moveSpeed += evo.statsAdded.moveSpeed;
                    }
                    // Add Tags
                    if (evo.tagsAdded) {
                        for (const t of evo.tagsAdded) {
                            if (!activeTags.includes(t)) activeTags.push(t);
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

                const isCompatible = SkillManager.checkCompatibility(definition.id, supportDef.id, activeTags);
                
                if (isCompatible) {
                    if (supportDef.baseStats) {
                        if (supportDef.baseStats.projectileCount) finalStats.projectileCount += supportDef.baseStats.projectileCount;
                        if (supportDef.baseStats.projectileSpread) finalStats.projectileSpread += supportDef.baseStats.projectileSpread;
                        if (supportDef.baseStats.cooldown) finalStats.cooldown += supportDef.baseStats.cooldown;
                        if (supportDef.baseStats.areaOfEffect) finalStats.areaOfEffect += supportDef.baseStats.areaOfEffect;
                        if (supportDef.baseStats.pierceCount) finalStats.pierceCount += supportDef.baseStats.pierceCount;
                        if (supportDef.baseStats.duration) finalStats.duration += supportDef.baseStats.duration;
                        if (supportDef.baseStats.orbit) finalStats.orbit += supportDef.baseStats.orbit;
                    }

                    if (supportDef.statMultipliers) {
                        if (supportDef.statMultipliers.damage) finalStats.damage *= supportDef.statMultipliers.damage;
                        if (supportDef.statMultipliers.attackRate) finalStats.attackRate *= supportDef.statMultipliers.attackRate;
                        if (supportDef.statMultipliers.areaOfEffect) finalStats.areaOfEffect *= supportDef.statMultipliers.areaOfEffect;
                        if (supportDef.statMultipliers.projectileSpeed) finalStats.projectileSpeed *= supportDef.statMultipliers.projectileSpeed;
                    }
                }
            }
        }

        // 3. Apply Player Global Stats
        
        const playerGlobalDmg = playerStats.getStatValue('bulletDamage', activeTags);
        const playerDmgRatio = playerGlobalDmg / 10; 
        finalStats.damage *= playerDmgRatio;

        const playerAtkSpdRatio = playerStats.getStatValue('attackSpeed', activeTags);
        const bonusAtkSpd = Math.max(0, playerAtkSpdRatio - 1);
        let speedEffectiveness = 1.0;
        if (activeTags.includes('area') && !activeTags.includes('melee')) {
            speedEffectiveness = 0.5;
        }
        finalStats.attackRate *= (1 + bonusAtkSpd * speedEffectiveness);

        const playerProjCount = playerStats.getStatValue('projectileCount', activeTags); 
        finalStats.projectileCount += (playerProjCount - 1);
        
        finalStats.ailmentChance += playerStats.getStatValue('ailmentChance', activeTags);
        
        finalStats.pierceCount += playerStats.getStatValue('pierceCount', activeTags);

        return {
            definition: definition,
            stats: finalStats,
            tags: activeTags 
        };
    }
}
