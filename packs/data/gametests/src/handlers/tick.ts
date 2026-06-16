import { Difficulty, system, world } from '@minecraft/server';
import { tickIndicator } from '../ui/indicator.ts';
import { tickFood } from '../food/index.ts';
import { tickGame } from '../combat/game.ts';
import { Game, WorldProperties } from '../shared/game.ts';

export function registerTickHandlers(): void {
    system.runInterval(() => {
        const addonToggle = Game.isAddonEnabled() as boolean;
        const saturationHealing = world.getDynamicProperty(
            WorldProperties.SaturationHealing,
        ) as boolean;
        const isPeaceful = world.getDifficulty() === Difficulty.Peaceful;
        const currentTick = system.currentTick;

        if (saturationHealing && world.gameRules.naturalRegeneration == true)
            world.gameRules.naturalRegeneration = false;

        for (const player of world.getAllPlayers()) {
            tickGame(player, currentTick, addonToggle);
            tickIndicator(player, currentTick, addonToggle);
            tickFood(player, currentTick, saturationHealing, isPeaceful);
        }
    });
}
