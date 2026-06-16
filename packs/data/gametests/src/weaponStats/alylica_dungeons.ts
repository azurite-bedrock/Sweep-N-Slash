import { Vec3 } from '@bedrock-oss/bedrock-boost';
import { WeaponStats } from '../importStats';

const hitMap = new Map<string, boolean>();
const comboMap = new Map<string, number>();

export const alylicaDungeons: WeaponStats[] = [
    {
        id: 'dungeons:sword',
        attackSpeed: 1.6,
        damage: 6,
        flags: ['is_weapon', 'sweep'],
    },
    {
        id: 'dungeons:diamond_sword',
        attackSpeed: 1.6,
        damage: 9,
        flags: ['is_weapon', 'sweep'],
        beforeEffect: ({ mc }) => {
            function random(min: number, max: number) {
                return Math.random() * (max - min) + min;
            }
            const rand = random(0.5, 1);
            const rgb = {
                red: (115 * rand) / 255,
                green: (255 * rand) / 255,
                blue: (255 * rand) / 255,
            };
            let map = new mc.MolangVariableMap();
            map.setFloat('variable.size', 1);
            map.setColorRGB('variable.color', rgb);
            return {
                sweepMap: map,
                sweepPitch: 1.1,
            };
        },
    },
    {
        id: 'dungeons:hawkbrand',
        attackSpeed: 1.6,
        damage: 7,
        flags: ['is_weapon', 'sweep'],
        beforeEffect: ({ player, target, crit, iframes, sweptEntities }) => {
            sweptEntities.forEach((e) => {
                e.addTag('prevent_effect');
            });

            if (target.hasTag('prevent_effect')) return;
            target.addTag('prevent_effect');

            if (iframes) return;

            function clampNumber(val: number, min: number, max: number) {
                return Math.max(Math.min(val, Math.max(min, max)), Math.min(min, max));
            }
            function rng(num: number) {
                let min = 0;
                let max = 100;
                const math = Math.floor(Math.random() * (max - min) + min);
                return math < clampNumber(num, min, max);
            }

            let doCrit = false;

            if (rng(10)) {
                const dim = player.dimension;
                dim.spawnParticle('dungeons:skull_crit', target.location);
                dim.spawnParticle('dungeons:skull_burst', target.location);
                dim.playSound('random.anvil_land', player.location, {
                    volume: 0.2,
                    pitch: 1.5,
                });
                player.playSound('random.orb', { volume: 0.6 });
                doCrit = true;
            }

            return {
                critAttack: doCrit || undefined,
                critMultiplier: doCrit ? (crit ? 2.25 : 1.5) : undefined,
            };
        },
        script: ({ system, target, sweptEntities }) => {
            system.run(() => {
                sweptEntities.forEach((e) => {
                    if (e.hasTag('prevent_effect')) e.removeTag('prevent_effect');
                });
                if (target.hasTag('prevent_effect')) target.removeTag('prevent_effect');
            });
        },
    },
    {
        id: 'dungeons:katana',
        attackSpeed: 1.4,
        damage: 7,
        regularKnockback: 1.352,
        regularVerticalKnockback: 0.8955,
        flags: ['is_weapon', 'sweep'],
    },
    {
        id: 'dungeons:claymore',
        attackSpeed: 1.2,
        damage: 8.5,
        flags: ['is_weapon', 'sweep'],
        beforeEffect: ({ specialCheck }) => {
            return {
                sprintKnockback: specialCheck || undefined,
                sweepPitch: 0.9,
            };
        },
    },
    {
        id: 'dungeons:cutlass',
        attackSpeed: 1.7,
        damage: 5.5,
        flags: ['is_weapon', 'sweep'],
    },
    {
        id: 'dungeons:daggers',
        attackSpeed: 3,
        damage: 3,
        flags: ['is_weapon'],
        beforeEffect: ({ player, target, specialCheck, iframes, sprintKnockback }) => {
            let hit = false;
            if (specialCheck) {
                if (iframes && (hitMap.get(target.id) ?? false)) {
                    hit = true;
                    hitMap.set(target.id, false);
                    player.playAnimation('animation.player.attack_daggers');
                } else if (!iframes) {
                    player.dimension.playSound('weapon.daggers.hit', player.location, {
                        volume: 0.6,
                    });
                    hitMap.set(target.id, true);
                }
            }

            return {
                critAttack: hit || false,
                critMultiplier: hit ? 2.5 : undefined,
                sprintKnockback: hit || undefined,

                regularVerticalKnockback: 0.1955,
                enchantedVerticalKnockback: hit && !sprintKnockback ? 0.7955 : undefined,
                enchantedKnockback: hit && !sprintKnockback ? 0.38 : 1.586,

                cancelDurability: hit,

                critParticle: hit ? 'dungeons:daggers_strike' : undefined,
                critSound: hit ? 'weapon.daggers.hit' : undefined,
                critOffset: hit ? Vec3.from(0, -1, 0) : undefined,
            };
        },
    },
    {
        id: 'dungeons:rapier',
        attackSpeed: 2,
        damage: 5,
        regularKnockback: 1.152,
        enchantedKnockback: 2.186,
        regularVerticalKnockback: 0.5955,
        enchantedVerticalKnockback: 0.8,
        flags: ['is_weapon', 'sweep'],
    },
    {
        id: 'dungeons:battlestaff',
        attackSpeed: 1.5,
        damage: 6.5,
        regularVerticalKnockback: 0.9955,
        flags: ['is_weapon', 'sweep'],
        beforeEffect: () => {
            return {
                sweepPitch: 0.8,
            };
        },
    },
    {
        id: 'dungeons:axe',
        attackSpeed: 1.4,
        damage: 7,
        flags: ['is_weapon'],
    },
    {
        id: 'dungeons:double_axe',
        attackSpeed: 1.2,
        damage: 8.5,
        flags: ['is_weapon', 'sweep'],
        beforeEffect: ({ player }) => {
            return {
                sweepLocation: Vec3.from(player.location),
                sweepSound: 'weapon.enchant.swirling',
                sweepParticle: 'dungeons:swirling',
                sweepOffset: Vec3.from(0, 1, 0),
            };
        },
    },
    {
        id: 'dungeons:whirlwind',
        attackSpeed: 1.2,
        damage: 8.5,
        flags: ['is_weapon', 'sweep'],
        beforeEffect: ({ system, player, target, specialCheck, crit, sprintKnockback }) => {
            if (!crit && !sprintKnockback && specialCheck) {
                const dimension = target.dimension;
                const location = target.location;

                dimension.spawnParticle('dungeons:swirling', {
                    x: location.x,
                    y: location.y + 1,
                    z: location.z,
                });

                system.run(() => {
                    const vel = target.getVelocity();
                    target.applyKnockback({ x: vel.x, z: vel.y }, vel.y + 0.55);
                });
            }
            return {
                sweepLocation: Vec3.from(player.location),
                sweepSound: 'weapon.enchant.swirling',
                sweepParticle: 'dungeons:swirling',
                sweepOffset: Vec3.from(0, 1, 0),
            };
        },
    },
    {
        id: 'dungeons:cursed_axe',
        attackSpeed: 1.2,
        damage: 8.5,
        flags: ['is_weapon', 'sweep'],
        beforeEffect: ({ player }) => {
            return {
                sweepLocation: Vec3.from(player.location),
                sweepSound: 'weapon.enchant.swirling',
                sweepParticle: 'dungeons:swirling',
                sweepOffset: Vec3.from(0, 1, 0),
            };
        },
    },
    {
        id: 'dungeons:coral_blade',
        attackSpeed: 1.8,
        damage: 5,
        flags: ['is_weapon'],
        beforeEffect: ({ target, specialCheck, iframes }) => {
            const isInWater = target.isInWater && specialCheck && !iframes;
            return {
                critAttack: isInWater || undefined,
                critParticle: isInWater ? 'sweepnslash:magic_critical_hit_emitter' : undefined,
            };
        },
    },
    {
        id: 'dungeons:tempest_knife',
        attackSpeed: 1.5,
        damage: 6,
        flags: ['is_weapon'],
    },
    {
        id: 'dungeons:chill_gale_knife',
        attackSpeed: 1.5,
        damage: 6,
        flags: ['is_weapon'],
        beforeEffect: ({ target, iframes }) => {
            if (iframes || target.getEffect('slowness')) return;

            target.addEffect('slowness', 66, {
                amplifier: 1,
                showParticles: true,
            });

            const dimension = target.dimension;
            const location = target.location;

            dimension.spawnParticle('dungeons:element_freeze', {
                x: location.x,
                y: location.y + 1,
                z: location.z,
            });
            dimension.playSound('mob.player.hurt_freeze', target.location, {
                volume: 0.33,
            });
        },
    },
    {
        id: 'dungeons:resolute_tempest_knife',
        attackSpeed: 1.5,
        damage: 6,
        flags: ['is_weapon'],
        beforeEffect: ({ target, crit, iframes }) => {
            if (target.hasTag('prevent_effect')) return;
            target.addTag('prevent_effect');

            const hp = target.getComponent('health');

            if (hp === undefined) return;

            const dmgBonus = 0.5 - (hp.currentValue / hp.effectiveMax) * 0.5;
            const doCommittedBonus = !crit && !iframes && dmgBonus > 0;

            return {
                critAttack: doCommittedBonus || undefined,
                critMultiplier: (crit ? 1.5 : 1) + dmgBonus,
                critParticle:
                    doCommittedBonus && !crit
                        ? 'sweepnslash:magic_critical_hit_emitter'
                        : undefined,
            };
        },
        script: ({ system, target }) => {
            system.run(() => {
                if (target.hasTag('prevent_effect')) target.removeTag('prevent_effect');
            });
        },
    },
    {
        id: 'dungeons:soul_knife',
        attackSpeed: 1.5,
        damage: 6.5,
        flags: ['is_weapon'],
    },
    {
        id: 'dungeons:soul_scythe',
        attackSpeed: 1.3,
        damage: 6,
        flags: ['is_weapon', 'sweep'],
        regularKnockback: 1.122,
        enchantedKnockback: 1.381,
        beforeEffect: ({ player, specialCheck }) => {
            if (specialCheck) {
                const dimension = player.dimension;
                dimension.playSound('weapon.obsidian_claymore.hit', player.location, {
                    pitch: 1.2,
                });
                dimension.playSound('attack.sweep', player.location, { pitch: 1.7 });
            }

            return {
                sweepVolume: 0,
            };
        },
    },
    {
        id: 'dungeons:gauntlets',
        attackSpeed: 2,
        damage: 3,
        flags: ['is_weapon'],
        beforeEffect: ({ system, target, iframes, cooldown, utils }) => {
            const comboCount = comboMap.get(target.id) ?? 0;
            const hitTime = utils.getLastAttack(target)?.time
                ? system.currentTick - (utils.getLastAttack(target)?.time ?? 0)
                : 0;
            if (cooldown === 1 && hitTime <= 12) {
                comboMap.set(target.id, Math.min(comboCount ? comboCount + 1 : 0, 3));
            } else if (iframes || cooldown !== 1 || hitTime >= 12) {
                comboMap.set(target.id, 0);
            }

            return {
                critAttack: comboCount === 0 ? false : true,
                critMultiplier: 1 + comboCount * 0.7,
            };
        },
    },
];
