import { DimensionTypes, Player, WeatherType, world } from '@minecraft/server';
import {
    Game,
    IndicatorType,
    WorldProperties,
    PlayerProperties,
    IndicatorName,
} from '../shared/game.ts';

export function initWorldProperties(): void {
    if (world.getDynamicProperty(WorldProperties.AddonToggle) == undefined) {
        world.setDynamicProperty(WorldProperties.AddonToggle, true);
    }
    if (world.getDynamicProperty(WorldProperties.ShieldBreakSpecial) == undefined) {
        world.setDynamicProperty(WorldProperties.ShieldBreakSpecial, false);
    }
    if (world.getDynamicProperty(WorldProperties.SaturationHealing) == undefined) {
        world.setDynamicProperty(WorldProperties.SaturationHealing, true);
    }
    for (const dimensionType of DimensionTypes.getAll()) {
        const key = `sns:weather:${dimensionType.typeId}`;
        if (world.getDynamicProperty(key) === undefined) {
            world.setDynamicProperty(key, WeatherType.Clear);
        }
    }

    const globalDefaults = [
        { id: `default.${PlayerProperties.ExcludePetFromSweep}`, value: true },
        { id: `default.${PlayerProperties.TipMessage}`, value: true },
        { id: `default.${PlayerProperties.BowHitSound}`, value: true },
    ];

    globalDefaults.forEach((prop) => {
        if (world.getDynamicProperty(prop.id) === undefined) {
            world.setDynamicProperty(prop.id, prop.value);
        }
    });

    const indicatorKeys = [
        IndicatorName.Crosshair,
        IndicatorName.Hotbar,
        IndicatorName.Geyser,
        IndicatorName.Actionbar,
    ];

    indicatorKeys.forEach((indicatorKey) => {
        if (world.getDynamicProperty(indicatorKey) === undefined) {
            world.setDynamicProperty(indicatorKey, true);
        }
    });
}

export function initPlayerProperties(player: Player): void {
    const personalConfigKeys = [
        { id: PlayerProperties.ExcludePetFromSweep },
        { id: PlayerProperties.TipMessage },
        { id: PlayerProperties.CooldownStyle, default: IndicatorType.Crosshair },
        { id: PlayerProperties.ActionBarChar, default: '_' },
        { id: PlayerProperties.EnchantedHitParticle, default: true },
        { id: PlayerProperties.DamageIndicatorParticle, default: true },
        { id: PlayerProperties.CriticalHitParticle, default: true },
        { id: PlayerProperties.SweepParticle, default: true },
        { id: PlayerProperties.BowHitSound },
    ];

    personalConfigKeys.forEach((key) => {
        const { value, defaultValue, isForced } = Game.getPlayerConfigValue(player, key.id);

        if (isForced) {
            const fallback = defaultValue !== undefined ? defaultValue : key.default;
            player.setDynamicProperty(key.id, fallback !== undefined ? fallback : false);
            return;
        }

        if (value === undefined) {
            const fallback = defaultValue !== undefined ? defaultValue : key.default;
            player.setDynamicProperty(key.id, fallback !== undefined ? fallback : false);
        }
    });

    const currentIndicator = player.getDynamicProperty(PlayerProperties.CooldownStyle) as
        | number
        | undefined;
    const indicatorKeysMap: Record<number, string> = {
        [IndicatorType.Crosshair]: IndicatorName.Crosshair,
        [IndicatorType.Hotbar]: IndicatorName.Hotbar,
        [IndicatorType.Geyser]: IndicatorName.Geyser,
        [IndicatorType.Actionbar]: IndicatorName.Actionbar,
    };

    if (currentIndicator !== undefined && currentIndicator !== IndicatorType.None) {
        const worldKey = indicatorKeysMap[currentIndicator];
        if (worldKey && world.getDynamicProperty(worldKey) === false) {
            player.setDynamicProperty(
                PlayerProperties.CooldownStyle,
                Game.getBestEnabledIndicator(currentIndicator),
            );
        }
    }
}
