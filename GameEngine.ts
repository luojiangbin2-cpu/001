    private spawnBullet(x: number, y: number, angle: number, owner: 'player' | 'enemy', speed: number, size: number, color: string, damageType: DamageType, damage?: number, pierce: number = 0, ailmentChance: number = 0, behavior: 'normal' | 'orbit' = 'normal', areaOfEffect?: number, tags?: SkillTag[]) {
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
        bullet.areaOfEffect = areaOfEffect; 
        bullet.tags = tags || []; 
        
        bullet.behavior = behavior;
        if (behavior === 'orbit') {
            bullet.orbitAngle = angle;
            bullet.orbitRadius = 120; 
            bullet.initialSpeed = speed; 
            bullet.vx = 0; 
            bullet.vy = 0;
        }
    }

    private getDamageTypeFromTags(tags: SkillTag[]): DamageType {
        if (tags.includes('fire')) return 'fire';
        if (tags.includes('cold')) return 'cold';
        if (tags.includes('lightning')) return 'lightning';
        if (tags.includes('projectile') && !tags.includes('physical')) return 'physical'; 
        return 'physical'; 
    }

    private castSkill(skill: ResolvedSkill, speedMult: number) {
        const px = this.gameState.playerWorldPos.x + PLAYER_SIZE/2;
        const py = this.gameState.playerWorldPos.y + PLAYER_SIZE/2;
        const dmgType = this.getDamageTypeFromTags(skill.tags);

        if (skill.definition.id === 'cyclone') {
            const radius = skill.stats.areaOfEffect;
            this.visualEffects.push({
                id: Math.random(), active: true, type: 'cyclone', x: px, y: py, radius: radius,
                lifeTime: 0.4, maxLifeTime: 0.4, color: '#00ffff', angle: Math.random() * Math.PI * 2, spinSpeed: 20
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

        if (skill.definition.id === 'flame_ring') {
            const radius = skill.stats.areaOfEffect;
            this.visualEffects.push({
                id: Math.random(), active: true, type: 'flame_ring_visual', x: px, y: py, radius: 10,
                lifeTime: 0.6, maxLifeTime: 0.6, color: '#f97316', followPlayer: true, expansionRate: 15
            });

            for (const enemy of this.enemies) {
                if (!enemy.active) continue;
                const cx = enemy.x + enemy.width/2;
                const cy = enemy.y + enemy.height/2;
                const dist = Math.sqrt((cx - px)**2 + (cy - py)**2);
                if (dist < radius + enemy.width/2) {
                     this.applySkillDamage(enemy, skill, dmgType);
                     const dx = cx - px, dy = cy - py;
                     const mag = Math.sqrt(dx*dx + dy*dy);
                     const nx = mag > 0 ? dx/mag : 1, ny = mag > 0 ? dy/mag : 0;
                     let force = skill.stats.knockback;
                     if (enemy.type === 'boss') force *= 0.1;
                     if (enemy.type === 'tank') force *= 0.5;
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
        const canvasWidth = this.canvas ? this.canvas.width : 400;
        const visualRadius = (canvasWidth / 2) / CAMERA_ZOOM + 100;
        const visualRadiusSq = visualRadius * visualRadius;

        for (const enemy of this.enemies) {
          if (!enemy.active) continue;
          const cx = enemy.x + enemy.width/2;
          const cy = enemy.y + enemy.height/2;
          const distSq = (cx - px)**2 + (cy - py)**2;
          if (distSq > visualRadiusSq) continue;
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
            const size = 15;
            const color = skill.definition.id === 'fireball' ? '#f97316' : '#60a5fa';
            
            const isOrbit = skill.stats.orbit > 0;

            for (let i = 0; i < safeCount; i++) {
                this.spawnBullet(px, py, (safeCount > 1 ? startAngle + i * spreadRad : baseAngle), 'player', skill.stats.projectileSpeed, size, color, dmgType, undefined, skill.stats.pierceCount, skill.stats.ailmentChance, isOrbit ? 'orbit' : 'normal', skill.stats.areaOfEffect, skill.tags);
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
        const canvasWidth = this.canvas ? this.canvas.width : 400;
        const visualRadius = (canvasWidth / 2) / CAMERA_ZOOM + 100; 
        const visualRadiusSq = visualRadius * visualRadius;

        for (const enemy of this.enemies) {
          if (!enemy.active) continue;
          const cx = enemy.x + enemy.width/2;
          const cy = enemy.y + enemy.height/2;
          const distSq = (cx - px)**2 + (cy - py)**2;
          if (distSq > visualRadiusSq) continue;
          if (distSq < minDistSq) { minDistSq = distSq; nearest = enemy; }
        }

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
        const ailmentChance = this.playerStats.getStatValue('ailmentChance');
        const pierce = Math.floor(this.playerStats.getStatValue('pierceCount'));
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
         if (e.modifiers.includes('evasive') && Math.random() < 0.3) {
             this.spawnFloatingText(e.x + e.width/2, e.y, "DODGE", "#9ca3af", 1.0);
             return;
         }

         const cx = e.x + e.width/2;
         const cy = e.y + e.height/2;

         if (sourcePos) {
             const sx = sourcePos.x + PLAYER_SIZE/2;
             const sy = sourcePos.y + PLAYER_SIZE/2;
             const dist = Math.sqrt((cx-sx)**2 + (cy-sy)**2);
             if (e.modifiers.includes('proximal') && dist > 200) {
                 this.spawnFloatingText(e.x + e.width/2, e.y, "IMMUNE", "#a855f7", 1.0);
                 return;
             }
             if (e.modifiers.includes('temporal') && dist > 250) {
                 this.spawnFloatingText(e.x + e.width/2, e.y, "BLOCKED", "#d8b4fe", 1.0);
                 return;
             }
         }

         let res = e.resistances[type] || 0;
         if (type === 'physical' && e.modifiers.includes('armoured')) res += 0.5;
         let damageMultiplier = 1.0;
         if (e.statuses['shocked']) damageMultiplier = 1.5;

         const finalDamage = Math.max(0, rawAmount * (1 - res) * damageMultiplier);
         e.hp -= finalDamage;

         if (chance > 0 && Math.random() < chance) {
             if (type === 'fire') { e.statuses['ignited'] = 4.0; this.spawnFloatingText(e.x + e.width/2, e.y - 20, "IGNITE", "#fb923c", 0.8); }
             else if (type === 'cold') { e.statuses['chilled'] = 2.0; this.spawnFloatingText(e.x + e.width/2, e.y - 20, "CHILL", "#67e8f9", 0.8); }
             else if (type === 'lightning') { e.statuses['shocked'] = 4.0; this.spawnFloatingText(e.x + e.width/2, e.y - 20, "SHOCK", "#fde047", 0.8); }
         }

         let color = 'white';
         if (type === 'fire') color = '#f97316';
         else if (type === 'cold') color = '#06b6d4';
         else if (type === 'lightning') color = '#facc15';
         else if (type === 'chaos') color = '#d946ef';
         if (isCrit) color = '#ef4444'; 
         
         this.spawnFloatingText(e.x + e.width/2, e.y, Math.floor(finalDamage).toString(), isCrit ? '#f87171' : color, isCrit ? 1.5 : 1.0);

         if (e.hp <= 0) {
            e.active = false;
            let typeMult = 1;
            if (e.type === 'fast') typeMult = 1.2;
            else if (e.type === 'tank') typeMult = 3.0;
            else if (e.type === 'boss') typeMult = 50.0;
            let eliteMult = e.isElite ? 5.0 : 1.0;
            const mapMult = this.gameState.currentMapStats.xpMult;
            const finalXp = Math.floor(XP_PER_ENEMY * typeMult * eliteMult * mapMult);
            const isBoss = e.type === 'boss';
            
            if (!this.gameState.isEndlessMode) {
                this.spawnLoot(e.x, e.y, isBoss, e.isElite ? ELITE_LOOT_CHANCE : LOOT_CHANCE);
            }
            this.gameState.score += (isBoss ? 1000 : 10);
            this.spawnXPOrb(e.x + e.width/2, e.y + e.height/2, finalXp);
            
            if (e.modifiers.includes('temporal')) {
                const bubbleIndex = this.gameState.groundEffects.findIndex(g => g.type === 'bubble' && g.sourceId === e.id);
                if (bubbleIndex > -1) this.gameState.groundEffects.splice(bubbleIndex, 1);
            }

            if (this.gameState.expeditionActive) {
                this.gameState.currentKills += 1;
                const floorObjectiveMet = this.gameState.currentKills >= this.gameState.targetKills;
                const isBossKill = e.type === 'boss';
                const hasPortal = this.gameState.interactables.some(i => i.type.includes('portal'));

                if (!hasPortal) {
                    if (this.gameState.currentFloor < 5 || this.gameState.isEndlessMode) {
                        if (floorObjectiveMet) {
                            this.gameState.interactables.push({
                                id: uuid() as any, active: true, type: 'portal_next',
                                x: e.x, y: e.y, width: 60, height: 80, color: '#3b82f6', interactionRadius: 80, label: 'Descend'
                            });
                            this.callbacks.onNotification("Portal Opened");
                            this.xpOrbs.forEach(o => { if (o.active) o.magnetized = true; });
                        }
                    } else if (this.gameState.currentFloor === 5 && !this.gameState.isEndlessMode) {
                        if (isBossKill) {
                            this.gameState.interactables.push({
                                id: uuid() as any, active: true, type: 'portal_return',
                                x: e.x, y: e.y, width: 60, height: 80, color: '#22c55e', interactionRadius: 80, label: 'Return'
                            });
                            this.callbacks.onNotification("Victory!");
                            for (let i = 0; i < 2; i++) {
                                const keyItem = createEndlessKey(); keyItem.id = uuid();
                                const loot = this.loot.find(l => !l.active);
                                if (loot) {
                                    loot.active = true; loot.x = e.x + (Math.random() - 0.5) * 50; loot.y = e.y + (Math.random() - 0.5) * 50;
                                    loot.lifeTime = 60; loot.itemData = keyItem; loot.rarity = 'unique'; loot.autoCollectRadius = 50;
                                }
                            }
                            this.callbacks.onNotification("DROPPED: Endless Void Keys!");
                            this.xpOrbs.forEach(o => { if (o.active) o.magnetized = true; });
                        }
                    }
                }
                this.updateHud();
            }
         }
    }

    private update(time: number) {
        if (!this.canvas) return;
        if (this.gameState.isGameOver) return;
        if (this.gameState.isPaused) return;

        const dt = Math.min((time - this.gameState.lastFrameTime) / 1000, 0.1);
        this.gameState.lastFrameTime = time;

        this.timers.frames++;
        this.timers.fpsUpdate += dt;
        if (this.timers.fpsUpdate >= 1.0) { this.timers.currentFps = this.timers.frames; this.timers.frames = 0; this.timers.fpsUpdate = 0; }

        if (this.gameState.shakeTimer > 0) this.gameState.shakeTimer -= dt;
        if (this.gameState.playerInvulnerabilityTimer > 0) this.gameState.playerInvulnerabilityTimer -= dt;

        const regen = this.playerStats.getStatValue('hpRegen');
        const maxHp = this.playerStats.getStatValue('maxHp');
        if (regen > 0 && this.currentHp < maxHp && !this.gameState.isGameOver) {
            this.currentHp += regen * dt;
            if (this.currentHp > maxHp) this.currentHp = maxHp;
        }

        let speedMultiplier = 1.0;
        let attackSpeedMultiplier = 1.0;
        const px = this.gameState.playerWorldPos.x + PLAYER_SIZE/2;
        const py = this.gameState.playerWorldPos.y + PLAYER_SIZE/2;
        let onIce = false;
        let inBubble = false;

        for (let i = this.gameState.groundEffects.length - 1; i >= 0; i--) {
            const effect = this.gameState.groundEffects[i];
            effect.duration -= dt;
            if (effect.type === 'bubble' && effect.sourceId !== undefined) {
                const owner = this.enemies.find(e => e.id === effect.sourceId);
                if (owner && owner.active) { effect.x = owner.x + owner.width/2; effect.y = owner.y + owner.height/2; }
                else { effect.duration = 0; }
            }
            const dist = Math.sqrt((effect.x - px)**2 + (effect.y - py)**2);
            if (dist < effect.radius) {
                if (effect.type === 'ice_ground') onIce = true;
                if (effect.type === 'bubble') inBubble = true;
                if (['fire_ground', 'lightning_ground'].includes(effect.type) && this.gameState.playerInvulnerabilityTimer <= 0) {
                     const dmg = 20 * dt;
                     this.currentHp -= dmg;
                     if (this.currentHp <= 0) { this.gameState.isGameOver = true; this.callbacks.onGameOver(true); }
                     else { this.updateHud(); }
                }
            }
            if (effect.type === 'blast_warning' && effect.duration <= 0) {
                 if (dist < effect.radius && this.gameState.playerInvulnerabilityTimer <= 0) {
                     const dmg = 40 * this.gameState.currentMapStats.monsterDamageMult;
                     this.currentHp -= dmg;
                     this.gameState.playerInvulnerabilityTimer = 0.5;
                     this.triggerShake(0.5);
                     this.spawnFloatingText(px, py, "BLAST!", "#ef4444", 1.5);
                     if (this.currentHp <= 0) { this.gameState.isGameOver = true; this.callbacks.onGameOver(true); }
                     else { this.updateHud(); }
                 }
                 this.visualEffects.push({
                    id: Math.random(), active: true, type: 'hit', x: effect.x, y: effect.y, radius: effect.radius,
                    lifeTime: 0.3, maxLifeTime: 0.3, color: effect.damageType === 'fire' ? '#ef4444' : '#a855f7'
                 });
            }
            if (effect.duration <= 0) this.gameState.groundEffects.splice(i, 1);
        }

        if (onIce) speedMultiplier *= 0.7;
        if (inBubble) { speedMultiplier *= 0.5; attackSpeedMultiplier *= 0.5; }

        const { vector } = this.joystickState;
        const speed = this.playerStats.getStatValue('moveSpeed') * SPEED_SCALAR * speedMultiplier;
        this.gameState.playerWorldPos.x += vector.x * speed * dt;
        this.gameState.playerWorldPos.y += vector.y * speed * dt;
        const playerCenter = { x: this.gameState.playerWorldPos.x + PLAYER_SIZE / 2, y: this.gameState.playerWorldPos.y + PLAYER_SIZE / 2 };

        let nearestInteractable: Interactable | null = null;
        let minIntDist = Infinity;
        for (const int of this.gameState.interactables) {
             const cx = int.x + int.width/2;
             const cy = int.y + int.height/2;
             const dist = Math.sqrt((cx - playerCenter.x)**2 + (cy - playerCenter.y)**2);
             if (dist < int.interactionRadius) {
                 if (dist < minIntDist) { minIntDist = dist; nearestInteractable = int; }
             }
        }
        this.callbacks.onNearbyInteractable(nearestInteractable);

        if (this.gameState.worldState === 'RUN') {
            const dir = this.directorState;
            dir.gameTime += dt;
            dir.spawnTimer -= dt;
            const objectiveComplete = this.gameState.currentKills >= this.gameState.targetKills;
            const bossActive = this.gameState.currentFloor === 5 && dir.bossSpawned && !this.gameState.isEndlessMode;
            if (!objectiveComplete && !bossActive) {
                const currentMaxEnemies = (60 + (this.gameState.currentFloor * 10) + (this.gameState.currentMapStats.tier * 5)) * 2;
                this.gameState.currentMaxEnemies = currentMaxEnemies;
                const activeEnemyCount = this.enemies.filter(e => e.active).length;
                if (activeEnemyCount < currentMaxEnemies) {
                    const spawnRateMult = this.gameState.currentMapStats.packSizeMult; 
                    let spawnTypes: EnemyType[] = ['basic'];
                    const progress = Math.min(1.0, this.gameState.currentKills / (this.gameState.targetKills || 1));
                    const baseInterval = (0.4 * Math.pow(0.9, this.gameState.currentFloor)) / spawnRateMult;
                    let interval = baseInterval * (1.0 - progress * 0.6);
                    const difficultyTime = dir.gameTime + (this.gameState.currentFloor * 30); 
                    if (difficultyTime < 30) spawnTypes = ['basic'];
                    else if (difficultyTime < 60) spawnTypes = ['basic', 'fast'];
                    else if (difficultyTime < 120) spawnTypes = ['basic', 'tank']; 
                    else spawnTypes = ['fast', 'tank']; 
                    if (this.gameState.currentFloor === 5 && !this.gameState.isEndlessMode) { spawnTypes = ['basic']; interval = 8.0; }
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

        this.gameState.activeSkills.forEach((skillInstance, index) => {
            if (skillInstance.cooldownTimer > 0) skillInstance.cooldownTimer -= dt;
            if (skillInstance.cooldownTimer <= 0) {
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

        for (let i = this.visualEffects.length - 1; i >= 0; i--) {
            const eff = this.visualEffects[i];
            if (eff.followPlayer) { eff.x = this.gameState.playerWorldPos.x + PLAYER_SIZE/2; eff.y = this.gameState.playerWorldPos.y + PLAYER_SIZE/2; }
            eff.lifeTime -= dt;
            if (eff.type === 'flame_ring_visual') {
                 const dtFactor = dt * 60;
                 eff.expansionRate = (eff.expansionRate || 12) * Math.pow(0.95, dtFactor);
                 eff.radius = (eff.radius || 10) + (eff.expansionRate * dtFactor);
                 if (eff.lifeTime > 0.1) {
                     const particleCount = Math.floor((2 * Math.PI * eff.radius / 25) * dtFactor); 
                     for(let k=0; k<particleCount; k++) {
                         if (Math.random() > 0.7) continue; 
                         const angle = (Math.PI * 2 / Math.max(1, particleCount)) * k + (Math.random()*0.2);
                         const px = eff.x + Math.cos(angle) * eff.radius;
                         const py = eff.y + Math.sin(angle) * eff.radius;
                         this.gameState.particles.push({
                             id: Math.random(), x: px, y: py, vx: Math.cos(angle) * 50, vy: Math.sin(angle) * 50,
                             life: 0.3 + Math.random() * 0.2, maxLife: 0.5, color: Math.random() > 0.5 ? '#f97316' : '#ef4444', size: Math.random() * 4 + 2
                         });
                     }
                 }
            }
            if (eff.type === 'cyclone') {
                if (eff.angle !== undefined && eff.spinSpeed !== undefined) { eff.angle += eff.spinSpeed * dt; eff.spinSpeed *= 0.98; }
                if (Math.random() < 0.5) {
                    const r = eff.radius || 100;
                    const theta = Math.random() * Math.PI * 2;
                    this.gameState.particles.push({
                        id: Math.random(), x: eff.x + Math.cos(theta) * r * 0.8, y: eff.y + Math.sin(theta) * r * 0.8,
                        vx: Math.cos(theta) * 150, vy: Math.sin(theta) * 150, life: 0.3, maxLife: 0.3, color: '#00ffff', size: Math.random() * 2 + 1
                    });
                }
            }
            if (eff.lifeTime <= 0) this.visualEffects.splice(i, 1);
        }
        
        for (let i = this.gameState.particles.length - 1; i >= 0; i--) {
            const p = this.gameState.particles[i];
            p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.9; p.vy *= 0.9; p.life -= dt;
            if (p.life <= 0) this.gameState.particles.splice(i, 1);
        }

        for (const t of this.floatingTexts) {
            if (!t.active) continue;
            t.y -= t.velocityY * dt; t.lifeTime -= dt;
            if (t.lifeTime <= 0) t.active = false;
        }

        for (const orb of this.xpOrbs) {
            if (!orb.active) continue;
            const distSq = (orb.x - playerCenter.x)**2 + (orb.y - playerCenter.y)**2;
            if (orb.magnetized || distSq < 10000) {
                orb.magnetized = true;
                const dist = Math.sqrt(distSq);
                const speed = 600 * dt;
                orb.x += ((playerCenter.x - orb.x) / dist) * speed;
                orb.y += ((playerCenter.y - orb.y) / dist) * speed;
                if (distSq < 400) { orb.active = false; this.gainXp(orb.value); }
            }
        }

        for (const enemy of this.enemies) {
            if (!enemy.active) continue;
            if (enemy.knockbackVelocity && (enemy.knockbackVelocity.x !== 0 || enemy.knockbackVelocity.y !== 0)) {
                enemy.x += enemy.knockbackVelocity.x * dt; enemy.y += enemy.knockbackVelocity.y * dt;
                enemy.knockbackVelocity.x -= enemy.knockbackVelocity.x * 5.0 * dt;
                enemy.knockbackVelocity.y -= enemy.knockbackVelocity.y * 5.0 * dt;
                if (Math.abs(enemy.knockbackVelocity.x) < 5) enemy.knockbackVelocity.x = 0;
                if (Math.abs(enemy.knockbackVelocity.y) < 5) enemy.knockbackVelocity.y = 0;
            }
            const isKnockedBack = enemy.knockbackVelocity && (Math.abs(enemy.knockbackVelocity.x) > 10 || Math.abs(enemy.knockbackVelocity.y) > 10);

            if (enemy.statuses['ignited']) {
                enemy.statuses['ignited'] -= dt;
                if (enemy.statuses['ignited'] <= 0) delete enemy.statuses['ignited'];
                else {
                    const baseBurn = this.playerStats.getStatValue('bulletDamage') * 0.2;
                    enemy.hp -= baseBurn * dt;
                    if (enemy.hp <= 0) this.applyDamage(enemy, 0, false, 'fire', undefined);
                }
            }
            if (enemy.statuses['chilled']) { enemy.statuses['chilled'] -= dt; if (enemy.statuses['chilled'] <= 0) delete enemy.statuses['chilled']; }
            if (enemy.statuses['shocked']) { enemy.statuses['shocked'] -= dt; if (enemy.statuses['shocked'] <= 0) delete enemy.statuses['shocked']; }

            if (enemy.modifiers.includes('regenerator')) {
                const regenAmount = (enemy.maxHp || 10) * 0.05 * dt;
                if (enemy.hp < enemy.maxHp!) enemy.hp = Math.min(enemy.hp + regenAmount, enemy.maxHp!);
            }

            if (enemy.modifiers.some(m => m.startsWith('trail_'))) {
                enemy.trailTimer = (enemy.trailTimer || 0) - dt;
                if (enemy.trailTimer <= 0) {
                    let type: GroundEffectType | null = null;
                    if (enemy.modifiers.includes('trail_fire')) type = 'fire_ground';
                    else if (enemy.modifiers.includes('trail_ice')) type = 'ice_ground';
                    else if (enemy.modifiers.includes('trail_lightning')) type = 'lightning_ground';
                    if (type) this.gameState.groundEffects.push({ id: uuid(), x: enemy.x + enemy.width/2, y: enemy.y + enemy.height/2, radius: 30, type: type, duration: 3.5 });
                    enemy.trailTimer = 0.2;
                }
            }

            if (enemy.modifiers.includes('periodic_blast')) {
                enemy.blastTimer = (enemy.blastTimer || 0) - dt;
                if (enemy.blastTimer <= 0) {
                    const angle = Math.random() * Math.PI * 2;
                    const offset = 80;
                    this.gameState.groundEffects.push({ id: uuid(), x: (enemy.x + enemy.width/2) + Math.cos(angle)*offset, y: (enemy.y + enemy.height/2) + Math.sin(angle)*offset, radius: 60, type: 'blast_warning', duration: 1.0, damageType: 'fire' });
                    enemy.blastTimer = 3.0;
                }
            }

            if (!isKnockedBack) {
                const cx = enemy.x + enemy.width/2; const cy = enemy.y + enemy.height/2;
                const px = this.gameState.playerWorldPos.x + PLAYER_SIZE/2; const py = this.gameState.playerWorldPos.y + PLAYER_SIZE/2;
                const dx = px - cx; const dy = py - cy;
                const dist = Math.sqrt(dx*dx + dy*dy);
                let currentSpeed = enemy.speed;
                if (enemy.statuses['chilled']) currentSpeed *= 0.7;
                if (enemy.modifiers.includes('berserker') && enemy.hp < (enemy.maxHp || 100) * 0.5) currentSpeed *= 2;
                if (dist > 0) { enemy.x += (dx/dist) * currentSpeed * dt; enemy.y += (dy/dist) * currentSpeed * dt; }
            }

            if (this.checkCollision(enemy, playerRect) && this.gameState.playerInvulnerabilityTimer <= 0) {
                const dmgMult = this.gameState.currentMapStats.monsterDamageMult;
                const dmg = (enemy.type === 'boss' ? 50 : 10) * dmgMult;
                this.currentHp -= dmg; this.gameState.playerInvulnerabilityTimer = 0.5; this.triggerShake(0.3);
                if (this.currentHp <= 0) { this.gameState.isGameOver = true; this.callbacks.onGameOver(true); } else { this.updateHud(); }
            }

            if (!isKnockedBack && enemy.attackTimer !== undefined) {
                enemy.attackTimer -= dt;
                if (enemy.attackTimer <= 0) {
                    const cx = enemy.x + enemy.width/2; const cy = enemy.y + enemy.height/2;
                    const px = this.gameState.playerWorldPos.x + PLAYER_SIZE/2; const py = this.gameState.playerWorldPos.y + PLAYER_SIZE/2;
                    const angle = Math.atan2(py - cy, px - cx);
                    if (enemy.modifiers.includes('extra_proj')) {
                        for(let i = -1; i <= 1; i++) this.spawnBullet(cx, cy, angle + (i * 0.2), 'enemy', 240, 20, BULLET_BOSS_COLOR, 'physical', 10);
                    } else {
                        this.spawnBullet(cx, cy, angle, 'enemy', 240, 30, BULLET_BOSS_COLOR, 'physical', 10);
                    }
                    enemy.attackTimer = enemy.type === 'boss' ? 2.4 : 3.6; 
                }
            }
        }

        const pDmg = this.playerStats.getStatValue('bulletDamage');
        const pCritC = this.playerStats.getStatValue('critChance');
        const pCritM = this.playerStats.getStatValue('critMultiplier');

        for (const b of this.bullets) {
            if (!b.active) continue;
            
            if (b.behavior === 'orbit') {
                if (b.owner === 'player') {
                    const px = this.gameState.playerWorldPos.x + PLAYER_SIZE/2;
                    const py = this.gameState.playerWorldPos.y + PLAYER_SIZE/2;
                    b.orbitAngle = (b.orbitAngle || 0) + (b.initialSpeed! / b.orbitRadius!) * dt;
                    b.x = px + Math.cos(b.orbitAngle) * b.orbitRadius! - b.width/2;
                    b.y = py + Math.sin(b.orbitAngle) * b.orbitRadius! - b.height/2;
                }
            } else {
                b.x += b.vx * dt;
                b.y += b.vy * dt;
            }
            
            b.lifeTime -= dt;
            if (b.lifeTime <= 0) { b.active = false; continue; }

            if (b.owner === 'player' && b.damageType === 'fire') {
                const particleCount = Math.floor(Math.random() * 2) + 1;
                for (let k = 0; k < particleCount; k++) {
                    const cx = b.x + b.width / 2;
                    const cy = b.y + b.height / 2;
                    this.gameState.particles.push({
                        id: Math.random(), x: cx + (Math.random() - 0.5) * 10, y: cy + (Math.random() - 0.5) * 10,
                        vx: -b.vx * 0.5 + (Math.random() - 0.5) * 100, vy: -b.vy * 0.5 + (Math.random() - 0.5) * 100,
                        life: 0.3 + Math.random() * 0.2, maxLife: 0.5, color: Math.random() > 0.5 ? '#ffaa00' : '#ff4400', size: Math.random() * 6 + 4
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
                            b.hitIds.push(e.id); continue;
                        }
                        const cx = e.x + e.width/2; const cy = e.y + e.height/2;
                        if (e.modifiers.includes('temporal')) {
                            const px = this.gameState.playerWorldPos.x + PLAYER_SIZE/2; const py = this.gameState.playerWorldPos.y + PLAYER_SIZE/2;
                            if (Math.sqrt((cx-px)**2 + (cy-py)**2) > 250) { b.active = false; this.spawnFloatingText(e.x + e.width/2, e.y, "BLOCKED", "#d8b4fe", 1.0); break; }
                        }
                        b.hitIds.push(e.id);
                        const isCrit = Math.random() < pCritC;
                        const finalDmg = (b.damage || pDmg) * (isCrit ? pCritM : 1.0); 
                        this.applyDamage(e, finalDmg, isCrit, b.damageType, this.gameState.playerWorldPos, b.ailmentChance);
                        
                        if (b.behavior !== 'orbit') {
                            if (b.pierce > 0) { b.pierce--; } else { b.active = false; break; }
                        }
                    }
                }
            } else {
                if (this.checkCollision(b, playerRect) && this.gameState.playerInvulnerabilityTimer <= 0) {
                    const dmgMult = this.gameState.currentMapStats.monsterDamageMult;
                    this.currentHp -= 10 * dmgMult;
                    this.gameState.playerInvulnerabilityTimer = 0.5; this.triggerShake(0.3); b.active = false;
                    if (this.currentHp <= 0) { this.gameState.isGameOver = true; this.callbacks.onGameOver(true); } else { this.updateHud(); }
                }
            }
        }

        for (const l of this.loot) {
            if (!l.active) continue;
            const lx = l.x + l.width/2; const ly = l.y + l.height/2;
            const dist = Math.sqrt((lx - playerCenter.x)**2 + (ly - playerCenter.y)**2);
            if (dist < l.autoCollectRadius) {
                 if (this.gameState.backpack.length >= BACKPACK_CAPACITY) { this.callbacks.onNotification("Backpack Full!"); l.autoCollectRadius = 0; continue; }
                l.active = false; this.gameState.backpack.push(l.itemData);
                this.callbacks.onNotification(`GOT: ${l.itemData.name}`);
                this.saveGame(); this.callbacks.onInventoryChange();
            }
        }
    }

    private drawPlayer(ctx: CanvasRenderingContext2D, x: number, y: number, dt: number) {