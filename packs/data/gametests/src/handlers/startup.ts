import { DimensionTypes, Player, system, world } from '@minecraft/server';
import { damageTest } from '../combat/checks.ts';
import { registerConfigCommand } from '../config/config.ts';
import { registerGlobalConfigCommand } from '../config/globalConfig.ts';
import { initPlayerProperties, initWorldProperties } from '../config/init.ts';
import { VERSION } from '../main.ts';
import { setAttackCooldown } from '../shared/status.ts';
import { Game } from '../shared/game.ts';
//import { registerAboutCommand } from '../config/about.ts';

let SimulatedPlayer: any;
export let gametest = true;

export function registerStartupHandlers(): void {
    import('@minecraft/server-gametest')
        .then((module) => {
            SimulatedPlayer = module.SimulatedPlayer;
        })
        .catch(() => {
            gametest = false;
        });

    system.beforeEvents.startup.subscribe(({ itemComponentRegistry }) => {
        itemComponentRegistry.registerCustomComponent('sweepnslash:stats', {});
        itemComponentRegistry.registerCustomComponent('sweepnslash:flags', {});
    });

    system.beforeEvents.startup.subscribe((init) => {
        registerConfigCommand(init);
        registerGlobalConfigCommand(init);
        //registerAboutCommand(init);
    });

    world.afterEvents.worldLoad.subscribe(() => {
        system.run(() =>
            console.log(
                `\n§3Sweep §f'N §6Slash §fhas been loaded!\nVersion: v${VERSION}${gametest ? '-gametest' : ''}`,
            ),
        );
        initWorldProperties();
        system.sendScriptEvent('sweep-and-slash:toggle', `${Game.isAddonEnabled()}`);
    });

    world.afterEvents.playerSpawn.subscribe(({ player, initialSpawn }) => {
        if (initialSpawn) {
            if (
                player.getDynamicProperty('tipMessage') === undefined ||
                player.getDynamicProperty('tipMessage')
            )
                player.sendMessage({
                    rawtext: [
                        { translate: 'sweepnslash.tip.message', with: ['/sns:config'] },
                        { text: '\n' },
                        {
                            translate: 'sweepnslash.tip.version',
                            with: [`v${VERSION}${gametest ? '-gametest' : ''}`],
                        },
                    ],
                });
            initPlayerProperties(player);
        }
        setAttackCooldown(player, system.currentTick);
    });

    system.afterEvents.scriptEventReceive.subscribe(({ id, message, sourceEntity: player }) => {
        if (id === 'sweep-and-slash:toggle_check') {
            system.sendScriptEvent('sweep-and-slash:toggle', `${Game.isAddonEnabled()}`);
            return;
        }

        if (!Game.isAddonEnabled() || !(player instanceof Player) || !player) return;

        if (id === 'sns:testdamage') {
            damageTest(player);
        }
    });

    world.afterEvents.weatherChange.subscribe(({ dimension, newWeather }) => {
        const type = DimensionTypes.get(dimension.toLowerCase())!;
        world.setDynamicProperty(`sns:weather:${type.typeId}`, newWeather);
    });
}
