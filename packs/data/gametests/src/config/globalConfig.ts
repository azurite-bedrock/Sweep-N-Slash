import {
    CommandPermissionLevel,
    CustomCommandSource,
    CustomCommandStatus,
    Player,
    system,
    world,
} from '@minecraft/server';
import {
    FormCancelationReason,
    ModalFormData,
    ModalFormDataDropdownOptions,
    ModalFormDataSliderOptions,
    ModalFormDataToggleOptions,
} from '@minecraft/server-ui';
import { Sounds } from '../Files.ts';
import { Game, IndicatorName, PlayerProperties } from '../shared/game.ts';
import { ModalFormStructure } from './config.ts';

const configLastClosedMap = new Map<string, number>();

const command = 'sns:globalconfig';

function configFormOpener({ sourceEntity: player, sourceType }: any) {
    if (!(player instanceof Player && sourceType === CustomCommandSource.Entity)) {
        return {
            status: CustomCommandStatus.Failure,
            message: 'Target must be player-type and command executor must be entity',
        };
    }
    system.run(() => configForm(player));
    return { status: CustomCommandStatus.Success };
}

export function configForm(player: Player): void {
    if ((configLastClosedMap.get(player.id) ?? 0) + 20 > system.currentTick) return;

    const globalConfigFormArray: ModalFormStructure[] = [
        {
            type: 'toggle',
            object: world,
            dynamicProperty: 'hideGlobalConfigDescription',
            text: { translate: 'sweepnslash.globalconfig.hide_description' },
        },
        {
            type: 'label',
            condition: !world.getDynamicProperty('hideGlobalConfigDescription'),
            text: { translate: 'sweepnslash.globalconfig.description' },
        },
        {
            type: 'divider',
            condition: !world.getDynamicProperty('hideGlobalConfigDescription'),
        },
        {
            type: 'label',
            condition: !world.getDynamicProperty('hideGlobalConfigDescription'),
            text: {
                rawtext: [
                    { text: ' - ' },
                    { translate: 'sweepnslash.globalconfig.force_toggle' },
                    { text: ': ' },
                    { translate: 'sweepnslash.globalconfig.force_toggle.description' },
                    { text: '\n\n' },
                    { text: ' - ' },
                    { translate: 'sweepnslash.globalconfig.default_toggle' },
                    { text: ': ' },
                    { translate: 'sweepnslash.globalconfig.default_toggle.description' },
                ],
            },
        },
        {
            type: 'divider',
        },
        {
            type: 'label',
            text: { translate: 'sweepnslash.config.general.excludepet' },
        },
        {
            type: 'toggle',
            object: world,
            dynamicProperty: 'force.' + PlayerProperties.ExcludePetFromSweep,
            text: { translate: 'sweepnslash.globalconfig.force_toggle' },
        },
        {
            type: 'toggle',
            object: world,
            dynamicProperty: 'default.' + PlayerProperties.ExcludePetFromSweep,
            text: { translate: 'sweepnslash.globalconfig.default_toggle' },
        },
        {
            type: 'divider',
        },
        {
            type: 'label',
            text: { translate: 'sweepnslash.config.general.tipmessage' },
        },
        {
            type: 'toggle',
            object: world,
            dynamicProperty: 'force.' + PlayerProperties.TipMessage,
            text: { translate: 'sweepnslash.globalconfig.force_toggle' },
        },
        {
            type: 'toggle',
            object: world,
            dynamicProperty: 'default.' + PlayerProperties.TipMessage,
            text: { translate: 'sweepnslash.globalconfig.default_toggle' },
        },
        {
            type: 'divider',
        },
        {
            type: 'label',
            text: { translate: 'sweepnslash.config.personal.indicator' },
        },
        {
            type: 'toggle',
            object: world,
            dynamicProperty: IndicatorName.Crosshair,
            text: { translate: 'sweepnslash.config.personal.indicator.crosshair' },
        },
        {
            type: 'toggle',
            object: world,
            dynamicProperty: IndicatorName.Hotbar,
            text: { translate: 'sweepnslash.config.personal.indicator.hotbar' },
        },
        {
            type: 'toggle',
            object: world,
            dynamicProperty: IndicatorName.Geyser,
            text: { translate: 'sweepnslash.config.personal.indicator.geyser' },
        },
        {
            type: 'toggle',
            object: world,
            dynamicProperty: IndicatorName.Actionbar,
            text: { translate: 'sweepnslash.config.personal.indicator.actionbar' },
        },
        {
            type: 'divider',
        },
        {
            type: 'label',
            text: { translate: 'sweepnslash.config.personal.bowhitsound' },
        },
        {
            type: 'toggle',
            object: world,
            dynamicProperty: 'force.' + PlayerProperties.BowHitSound,
            text: { translate: 'sweepnslash.globalconfig.force_toggle' },
        },
        {
            type: 'toggle',
            object: world,
            dynamicProperty: 'default.' + PlayerProperties.BowHitSound,
            text: { translate: 'sweepnslash.globalconfig.default_toggle' },
        },
    ];

    const form = new ModalFormData().title({
        translate: 'sweepnslash.globalconfig.menu.title',
    });

    const activeElements: ModalFormStructure[] = [];

    function dp(object: any, { id, value }: { id: string; value?: any } = { id: '' }) {
        if (value !== undefined) object.setDynamicProperty(id, value);
        return object.getDynamicProperty(id);
    }

    for (const entry of globalConfigFormArray) {
        if (entry.condition === false) continue;

        let defaultValue: any = undefined;
        if (entry.object && entry.dynamicProperty) {
            defaultValue = dp(entry.object, { id: entry.dynamicProperty });
        }

        switch (entry.type) {
            case 'label':
                if (entry.text) form.label(entry.text);
                break;

            case 'divider':
                form.divider();
                break;

            case 'toggle': {
                const def = defaultValue !== undefined ? Boolean(defaultValue) : false;
                form.toggle(entry.text ?? '', {
                    ...(entry.options as ModalFormDataToggleOptions),
                    defaultValue: def,
                });
                break;
            }

            case 'dropdown': {
                const def = defaultValue !== undefined ? Number(defaultValue) : 0;
                form.dropdown(entry.text ?? '', entry.items ?? [], {
                    ...(entry.options as ModalFormDataDropdownOptions),
                    defaultValueIndex: isNaN(def) ? 0 : def,
                });
                break;
            }

            case 'slider': {
                const fallbackSliderValue =
                    entry.options && 'defaultValue' in entry.options
                        ? (entry.options as any).defaultValue
                        : 255;
                const def =
                    defaultValue !== undefined ? Number(defaultValue) : fallbackSliderValue;

                form.slider(
                    typeof entry.text === 'string' ? entry.text : '',
                    entry.minimumValue ?? 0,
                    entry.maximumValue ?? 255,
                    {
                        ...(entry.options as ModalFormDataSliderOptions),
                        defaultValue: isNaN(def) ? fallbackSliderValue : def,
                    },
                );
                break;
            }
        }
        activeElements.push(entry);
    }

    form.submitButton({ translate: 'sweepnslash.config.save' });

    form.show(player as any).then((response) => {
        const { canceled, formValues, cancelationReason } = response;
        configLastClosedMap.set(player.id, system.currentTick);

        if (response && canceled && cancelationReason === FormCancelationReason.UserBusy)
            return;

        if (canceled) {
            player.playSound(Sounds.SnsConfigCanceled);
            player.sendMessage({ translate: 'sweepnslash.config.status.canceled' });
            return;
        }

        player.playSound(Sounds.GamePlayerBowDing);
        player.sendMessage({ translate: 'sweepnslash.config.status.saved' });

        activeElements.forEach((element, index) => {
            if (!element.dynamicProperty || !element.object) return;

            const value = formValues?.[index];
            if (value === undefined) return;

            element.object.setDynamicProperty(element.dynamicProperty, value);
        });

        Game.updatePlayersConfigValue();
    });
}

export function registerGlobalConfigCommand(init: any): void {
    init.customCommandRegistry.registerCommand(
        {
            name: command,
            description: 'sweepnslash.globalconfig.command.description',
            permissionLevel: CommandPermissionLevel.Admin,
            cheatsRequired: false,
        },
        configFormOpener,
    );
}
