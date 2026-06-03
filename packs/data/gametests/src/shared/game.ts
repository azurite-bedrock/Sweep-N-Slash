import { world, Entity } from '@minecraft/server';

export const enum IndicatorType {
    Crosshair = 0,
    Hotbar = 1,
    Geyser = 2,
    Actionbar = 3,
    None = 4,
}

export const enum IndicatorName {
    Crosshair = 'indicator.crosshair',
    Hotbar = 'indicator.hotbar',
    Geyser = 'indicator.geyser',
    Actionbar = 'indicator.actionbar',
    None = 'indicator.none',
}

export const enum PlayerProperties {
    ExcludePetFromSweep = 'excludePetFromSweep',
    TipMessage = 'tipMessage',
    CooldownStyle = 'cooldownStyle',
    ActionBarChar = 'actionbarChar',
    EnchantedHitParticle = 'enchantedHit',
    DamageIndicatorParticle = 'damageIndicator',
    CriticalHitParticle = 'criticalHit',
    SweepParticle = 'sweep',
    BowHitSound = 'bowHitSound',
}

export const enum WorldProperties {
    AddonToggle = 'addon_toggle',
    DebugMode = 'debug_mode',
    ShieldBreakSpecial = 'shieldBreakSpecial',
    SaturationHealing = 'saturationHealing',
}

export const Game = {
    isAddonEnabled(): boolean {
        return world.getDynamicProperty(WorldProperties.AddonToggle) === true;
    },

    getPlayerConfigValue(object: Entity, id: PlayerProperties) {
        let value = object.getDynamicProperty(id);
        const isForced = world.getDynamicProperty(`force.${id}`) as boolean | undefined;
        const defaultValue = world.getDynamicProperty(`default.${id}`);

        if (isForced) value = defaultValue;

        return { value, defaultValue, isForced };
    },

    getBestEnabledIndicator(currentIndicatorId: number): number {
        const indicatorKeysMap: Record<number, string> = {
            [IndicatorType.Crosshair]: IndicatorName.Crosshair,
            [IndicatorType.Hotbar]: IndicatorName.Hotbar,
            [IndicatorType.Geyser]: IndicatorName.Geyser,
            [IndicatorType.Actionbar]: IndicatorName.Actionbar,
        };

        const enabledIndicators: number[] = [];

        for (const [idStr, worldKey] of Object.entries(indicatorKeysMap)) {
            if (world.getDynamicProperty(worldKey) !== false) {
                enabledIndicators.push(Number(idStr));
            }
        }

        // If literally every indicator is disabled, fallback to None
        if (enabledIndicators.length === 0) return IndicatorType.None;

        // Find the indicator ID with the smallest numerical difference to the player's current one
        // At this point, this is too much for a simple dropdown. But Mojang thought it was a good idea to
        // handle dropdowns with NUMBERS, so there's not much I can do here.
        return enabledIndicators.reduce((prev, curr) => {
            return Math.abs(curr - currentIndicatorId) < Math.abs(prev - currentIndicatorId)
                ? curr
                : prev;
        });
    },

    updatePlayersConfigValue() {
        const forceableKeys = [
            PlayerProperties.ExcludePetFromSweep,
            PlayerProperties.TipMessage,
            PlayerProperties.BowHitSound,
        ];

        const indicatorKeysMap: Record<number, string> = {
            [IndicatorType.Crosshair]: IndicatorName.Crosshair,
            [IndicatorType.Hotbar]: IndicatorName.Hotbar,
            [IndicatorType.Geyser]: IndicatorName.Geyser,
            [IndicatorType.Actionbar]: IndicatorName.Actionbar,
        };

        for (const player of world.getAllPlayers()) {
            for (const key of forceableKeys) {
                const isForced = world.getDynamicProperty(`force.${key}`);
                if (isForced) {
                    const defaultValue = world.getDynamicProperty(`default.${key}`);
                    player.setDynamicProperty(key, defaultValue ?? false);
                }
            }

            const currentIndicator = player.getDynamicProperty(
                PlayerProperties.CooldownStyle,
            ) as number | undefined;
            if (currentIndicator !== undefined && currentIndicator !== IndicatorType.None) {
                const worldKey = indicatorKeysMap[currentIndicator];

                if (worldKey && world.getDynamicProperty(worldKey) === false) {
                    const closest = this.getBestEnabledIndicator(currentIndicator);
                    player.setDynamicProperty(PlayerProperties.CooldownStyle, closest);
                }
            }
        }
    },
};
