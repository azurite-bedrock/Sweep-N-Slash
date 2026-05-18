import { Player, system } from '@minecraft/server';
import { getStatus, setLastShieldTime } from '../shared/status.ts';
import { getItemStats, itemHasFlag } from '../stats/item.ts';
import { shield } from './shields.ts';

export function tickGame(player: Player, currentTick: number, addonToggle: boolean): void {
    const status = getStatus(player);
    const { item } = getItemStats(player);

    // Shield delay check
    if (!(shield(player) && !status.holdInteract)) {
        setLastShieldTime(player, currentTick);
    }
    const shieldTime = currentTick - status.lastShieldTime;
    status.shieldValid = shieldTime >= 5 || shieldTime == 1;

    // Slot/item change → reset cooldown
    if (
        (player.selectedSlotIndex !== status.lastSelectedSlot &&
            status.lastSelectedItem !== item?.typeId) ||
        (status.lastSelectedItem !== item?.typeId &&
            !(status.lastSelectedItem === undefined && item?.typeId === undefined))
    ) {
        if (item && itemHasFlag(item, 'custom_cooldown')) {
            const cooldownComp = item.getComponent('cooldown');
            cooldownComp?.startCooldown(player);
        }
        status.lastAttackTime = currentTick;
    }

    status.lastSelectedSlot = player.selectedSlotIndex;
    status.lastSelectedItem = item?.typeId;

    // Sprint check
    const isSprinting = player.isSprinting;
    if (!isSprinting) {
        status.sprintKnockbackHitUsed = false;
        status.sprintKnockbackValid = false;
        status.critSweepValid = true;
    } else if (isSprinting && !status.sprintKnockbackHitUsed) {
        status.sprintKnockbackValid = true;
    } else if (isSprinting && status.sprintKnockbackHitUsed) {
        status.sprintKnockbackValid = false;
    }
    status.critSweepValid = !player.isSprinting || status.sprintKnockbackHitUsed;

    // Fall distance (mace smash attack)
    const fallDist = status.fallDistance;
    if (
        player.isFalling &&
        !player.isGliding &&
        !player.isOnGround &&
        !player.isInWater &&
        !player.isFlying &&
        !player.isClimbing &&
        !player.getEffect('slow_falling') &&
        !player.getEffect('levitation')
    ) {
        status.fallDistance = fallDist + player.getVelocity().y;
    } else {
        system.run(() => (status.fallDistance = 0));
    }

    if (addonToggle) {
        if (
            (Math.abs(fallDist) >= 1.5 && item && itemHasFlag(item, 'mace')) ||
            status.chargeAttacking // or if using a spear
        ) {
            player.triggerEvent('sweepnslash:disable');
            status.mace = true;
        } else {
            player.triggerEvent('sweepnslash:enable');
            status.mace = false;
        }
    } else {
        player.triggerEvent('sweepnslash:disable');
    }
}
