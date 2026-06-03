import { Player } from '@minecraft/server';
import { clampNumber } from '../shared/math.ts';
import { Debug } from '../shared/debug.ts';
import { getStatus } from '../shared/status.ts';
import { getItemStats, hasItemFlag } from '../stats/item.ts';
import { getCooldownTime } from '../combat/damage.ts';
import { view, specialValid } from '../combat/checks.ts';
import { IndicatorType, PlayerProperties } from '../shared/game.ts';

export function tickIndicator(player: Player, currentTick: number, addonToggle: boolean): void {
    const status = getStatus(player);
    const { item, stats } = getItemStats(player);

    const barStyle = (player.getDynamicProperty(PlayerProperties.CooldownStyle) as number) ?? 0;
    const barArray = ['crs', 'htb', 'sub', 'non', 'non'][barStyle];

    let indicatorText = '˙';
    if (barStyle === IndicatorType.Actionbar) {
        const char = player.getDynamicProperty(PlayerProperties.ActionBarChar) as
            | string
            | undefined;
        indicatorText = char ? char?.trim() : '_';
    }

    // Cooldown UI
    const maxCD = getCooldownTime(player, stats?.attackSpeed).ticks;
    status.cooldown = Math.max(0, status.lastAttackTime + maxCD - currentTick);

    let curCD = status.cooldown;
    if (hasItemFlag(player, 'custom_cooldown') && item) {
        const cooldownComp = item.getComponent('cooldown');
        if (cooldownComp?.cooldownCategory)
            curCD = cooldownComp.getCooldownTicksRemaining(player);
    }
    const pixelValue = Math.min(16, Math.floor(((Math.round(maxCD) - curCD) / maxCD) * 17));
    const uiPixelValue = clampNumber(pixelValue, 0, 16);

    const subGrey = Math.round(uiPixelValue / 1.6);
    const subDarkGrey = 10 - subGrey;
    let cooldownSubtitle = ('§7' + indicatorText).repeat(Math.max(0, subGrey));
    cooldownSubtitle += ('§8' + indicatorText).repeat(subDarkGrey);

    const inRange = view(player, stats?.reach);
    const targetValid = !(inRange?.getComponent('health')?.currentValue! <= 0);
    const specialCheck = specialValid(currentTick, player, stats);

    const riders = player.getComponent('rideable')?.getRiders() ?? [];
    const riderCheck = riders.some((rider) => rider === inRange);
    const ridingOn = player.getComponent('riding')?.entityRidingOn;
    const ridingCheck = ridingOn !== inRange;

    const viewCheck = inRange && targetValid && !riderCheck && ridingCheck;
    const hitReady = viewCheck && curCD <= 0;

    const clearIndicator = () => {
        if (barStyle === IndicatorType.Actionbar) {
            player.onScreenDisplay.setActionBar(' ');
        } else {
            player.onScreenDisplay.setTitle('_sweepnslash:non', {
                fadeInDuration: 0,
                fadeOutDuration: 0,
                stayDuration: 0,
            });
        }
    };

    if (!addonToggle || barStyle === IndicatorType.None) {
        if (status.showBar) {
            clearIndicator();
            status.showBar = false;
        }
        return;
    }

    status.showBar = true;

    const displayIndicator =
        curCD > 0 ||
        (barStyle === 0 && viewCheck && stats && !hasItemFlag(player, 'hide_indicator'));

    if (displayIndicator) {
        switch (barStyle) {
            case IndicatorType.Crosshair:
            case IndicatorType.Hotbar:
                player.onScreenDisplay.setTitle(
                    `_sweepnslash:${barArray}:${hitReady ? 't' : 'f'}:${uiPixelValue}`,
                    { fadeInDuration: 0, fadeOutDuration: 0, stayDuration: 0 },
                );
                break;
            case IndicatorType.Geyser:
                player.onScreenDisplay.setTitle(' ', {
                    fadeInDuration: 0,
                    fadeOutDuration: 0,
                    stayDuration: 10,
                    subtitle: `${cooldownSubtitle}`,
                });
                break;
            default:
                player.onScreenDisplay.setActionBar(`${cooldownSubtitle}`);
                break;
        }
        status.attackReady = false;
    } else if (curCD <= 0 && !status.attackReady) {
        clearIndicator();
        status.attackReady = true;
    }

    if (addonToggle && Debug.isEnabled()) {
        const cooldownPercentage = Math.floor(((maxCD - curCD) / maxCD) * 100);
        const actionBarDisplay = `${Math.trunc(curCD)} (${specialCheck ? '§a' : ''}${cooldownPercentage}%§f)`;
        player.onScreenDisplay.setActionBar(actionBarDisplay);
    }
}
