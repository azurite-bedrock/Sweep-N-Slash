import {
    CommandPermissionLevel,
    CustomCommandSource,
    CustomCommandStatus,
    Player,
    PlayerPermissionLevel,
    RawMessage,
    system,
    world,
} from '@minecraft/server';
import {
    FormCancelationReason,
    ModalFormData,
    ModalFormDataDropdownOptions,
    ModalFormDataSliderOptions,
    ModalFormDataTextFieldOptions,
    ModalFormDataToggleOptions,
} from '@minecraft/server-ui';
import { clampNumber } from '../shared/math.ts';
import { Sounds } from '../Files.ts';
import {
    Game,
    IndicatorType,
    WorldProperties,
    PlayerProperties,
    IndicatorName,
} from '../shared/game.ts';

const configLastClosedMap = new Map<string, number>();

const command = 'sns:config';

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

export interface ModalFormStructure {
    type: 'divider' | 'label' | 'dropdown' | 'slider' | 'toggle' | 'textField';
    object?: any;
    condition?: boolean;
    dynamicProperty?: string;
    text?: string | RawMessage;
    placeholderText?: string | RawMessage;
    defaultText?: string;
    items?: (string | RawMessage)[];
    minimumValue?: number;
    maximumValue?: number;
    options?:
        | ModalFormDataDropdownOptions
        | ModalFormDataSliderOptions
        | ModalFormDataToggleOptions
        | ModalFormDataTextFieldOptions;
    dropdownMapping?: number[];
}

export function configForm(player: Player): void {
    if ((configLastClosedMap.get(player.id) ?? 0) + 20 > system.currentTick) return;

    const tag = player.hasTag('sweepnslash.config');
    const op = player.playerPermissionLevel == PlayerPermissionLevel.Operator;

    const configFormArray: ModalFormStructure[] = [
        {
            type: 'label',
            condition: op === true,
            text: { translate: 'sweepnslash.config.globalconfig_tip' },
        },
        {
            type: 'divider',
            condition: op === true,
        },
        {
            type: 'label',
            condition: tag === true,
            text: { translate: 'sweepnslash.config.operator.header' },
        },
        {
            type: 'toggle',
            object: world,
            condition: tag === true && !world.isHardcore,
            dynamicProperty: WorldProperties.AddonToggle,
            text: { translate: 'sweepnslash.config.operator.addon' },
        },
        {
            type: 'toggle',
            object: world,
            condition: tag === true,
            dynamicProperty: WorldProperties.DebugMode,
            text: { translate: 'sweepnslash.config.operator.debug' },
            options: {
                tooltip: { translate: 'sweepnslash.config.operator.debug.tooltip' },
            } as ModalFormDataToggleOptions,
        },
        {
            type: 'divider',
            condition: tag === true,
        },
        {
            type: 'label',
            condition: op === true,
            text: { translate: 'sweepnslash.config.server.header' },
        },
        {
            type: 'toggle',
            object: world,
            condition: op === true,
            dynamicProperty: WorldProperties.ShieldBreakSpecial,
            text: { translate: 'sweepnslash.config.server.shieldbreak' },
            options: {
                tooltip: { translate: 'sweepnslash.config.server.shieldbreak.tooltip' },
            } as ModalFormDataToggleOptions,
        },
        {
            type: 'toggle',
            object: world,
            condition: op === true,
            dynamicProperty: WorldProperties.SaturationHealing,
            text: { translate: 'sweepnslash.config.server.saturation' },
            options: {
                tooltip: {
                    rawtext: [
                        { translate: 'sweepnslash.config.server.saturation.tooltip' },
                        { text: '\n\n' },
                        { translate: 'createWorldScreen.naturalregeneration' },
                        { text: ': ' },
                        { text: world.gameRules.naturalRegeneration ? '§aON' : '§cOFF' },
                    ],
                },
            } as ModalFormDataToggleOptions,
        },
        {
            type: 'divider',
            condition: op === true,
        },
        {
            type: 'label',
            text: { translate: 'sweepnslash.config.general.header' },
        },
        {
            type: 'toggle',
            object: player,
            condition:
                world.getDynamicProperty('force.' + PlayerProperties.ExcludePetFromSweep) !==
                true,
            dynamicProperty: PlayerProperties.ExcludePetFromSweep,
            text: { translate: 'sweepnslash.config.general.excludepet' },
            options: {
                tooltip: { translate: 'sweepnslash.config.general.excludepet.tooltip' },
            } as ModalFormDataToggleOptions,
        },
        {
            type: 'toggle',
            object: player,
            condition:
                world.getDynamicProperty('force.' + PlayerProperties.TipMessage) !== true,
            dynamicProperty: PlayerProperties.TipMessage,
            text: { translate: 'sweepnslash.config.general.tipmessage' },
        },
        {
            type: 'divider',
        },
        {
            type: 'label',
            text: { translate: 'sweepnslash.config.personal.header' },
        },
        {
            type: 'dropdown',
            object: player,
            dynamicProperty: PlayerProperties.CooldownStyle,
            text: { translate: 'sweepnslash.config.personal.indicator' },
            items: [
                { translate: 'sweepnslash.config.personal.indicator.crosshair' },
                { translate: 'sweepnslash.config.personal.indicator.hotbar' },
                { translate: 'sweepnslash.config.personal.indicator.geyser' },
                { translate: 'sweepnslash.config.personal.indicator.actionbar' },
                { translate: 'sweepnslash.config.personal.indicator.none' },
            ],
            options: {
                tooltip: { translate: 'sweepnslash.config.personal.indicator.tooltip' },
            } as ModalFormDataDropdownOptions,
        },
        {
            type: 'textField',
            object: player,
            condition: world.getDynamicProperty(IndicatorName.Actionbar) !== false,
            dynamicProperty: PlayerProperties.ActionBarChar,
            text: { translate: 'sweepnslash.config.personal.actionbar_char' },
            placeholderText: {
                translate: 'sweepnslash.config.personal.actionbar_char.placeholder',
            },
            defaultText: '_',
            options: {
                tooltip: { translate: 'sweepnslash.config.personal.actionbar_char.tooltip' },
                defaultValue: '_',
            },
        },
        {
            type: 'toggle',
            object: player,
            condition:
                world.getDynamicProperty('force.' + PlayerProperties.BowHitSound) !== true,
            dynamicProperty: PlayerProperties.BowHitSound,
            text: { translate: 'sweepnslash.config.personal.bowhitsound' },
        },
        {
            type: 'toggle',
            object: player,
            dynamicProperty: PlayerProperties.SweepParticle,
            text: { translate: 'sweepnslash.config.personal.sweep.particles' },
        },
        {
            type: 'toggle',
            object: player,
            dynamicProperty: PlayerProperties.EnchantedHitParticle,
            text: { translate: 'sweepnslash.config.personal.enchanted.particles' },
        },
        {
            type: 'toggle',
            object: player,
            dynamicProperty: PlayerProperties.DamageIndicatorParticle,
            text: { translate: 'sweepnslash.config.personal.damage.particles' },
        },
        {
            type: 'toggle',
            object: player,
            dynamicProperty: PlayerProperties.CriticalHitParticle,
            text: { translate: 'sweepnslash.config.personal.crit.particles' },
        },
        {
            type: 'divider',
        },
        {
            type: 'label',
            text: { translate: 'sweepnslash.config.personal.sweep.rgb' },
        },
        {
            type: 'slider',
            object: player,
            dynamicProperty: 'sweepR',
            text: '§cR',
            minimumValue: 0,
            maximumValue: 255,
            options: {
                defaultValue: 255,
            } as ModalFormDataSliderOptions,
        },
        {
            type: 'slider',
            object: player,
            dynamicProperty: 'sweepG',
            text: '§aG',
            minimumValue: 0,
            maximumValue: 255,
            options: {
                defaultValue: 255,
            } as ModalFormDataSliderOptions,
        },
        {
            type: 'slider',
            object: player,
            dynamicProperty: 'sweepB',
            text: '§9B',
            minimumValue: 0,
            maximumValue: 255,
            options: {
                defaultValue: 255,
            } as ModalFormDataSliderOptions,
        },
    ];

    const form = new ModalFormData().title({ translate: 'sweepnslash.config.menu.title' });

    const activeElements: ModalFormStructure[] = [];

    function dp(object: any, { id, value }: { id: string; value?: any } = { id: '' }) {
        if (value !== undefined) object.setDynamicProperty(id, value);
        return object.getDynamicProperty(id);
    }

    for (const entry of configFormArray) {
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
                let itemsToShow = entry.items ?? [];
                let mappedValues: number[] = itemsToShow.map((_, i) => i);

                // Since the indicator dropdown needs to show/hide options based on global config, we have to do some mapping shenanigans to keep track of which visual index corresponds to which actual enum ID
                if (entry.dynamicProperty === 'cooldownStyle') {
                    const indicatorKeysMap: Record<number, string> = {
                        [IndicatorType.Crosshair]: IndicatorName.Crosshair,
                        [IndicatorType.Hotbar]: IndicatorName.Hotbar,
                        [IndicatorType.Geyser]: IndicatorName.Geyser,
                        [IndicatorType.Actionbar]: IndicatorName.Actionbar,
                    };

                    const filteredItems: (string | RawMessage)[] = [];
                    const filteredMap: number[] = [];

                    itemsToShow.forEach((item, index) => {
                        const worldKey = indicatorKeysMap[index];
                        if (!worldKey || world.getDynamicProperty(worldKey) !== false) {
                            filteredItems.push(item);
                            filteredMap.push(index);
                        }
                    });

                    itemsToShow = filteredItems;
                    mappedValues = filteredMap;
                    entry.dropdownMapping = mappedValues;
                }

                let def = defaultValue !== undefined ? Number(defaultValue) : 0;
                if (isNaN(def)) def = 0;

                let visualDefaultIndex = mappedValues.indexOf(def);

                if (visualDefaultIndex === -1) {
                    if (mappedValues.length > 0) {
                        const closestValue = mappedValues.reduce((prev, curr) =>
                            Math.abs(curr - def) < Math.abs(prev - def) ? curr : prev,
                        );
                        visualDefaultIndex = mappedValues.indexOf(closestValue);
                    } else {
                        visualDefaultIndex = 0;
                    }
                }

                form.dropdown(entry.text ?? '', itemsToShow, {
                    ...(entry.options as ModalFormDataDropdownOptions),
                    defaultValueIndex: visualDefaultIndex,
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

            case 'textField': {
                const fallbackTextValue =
                    entry.options && 'defaultValue' in entry.options
                        ? (entry.options as any).defaultValue
                        : '';

                let def = defaultValue !== undefined ? String(defaultValue) : fallbackTextValue;

                if (
                    entry.defaultText !== undefined &&
                    def.trim() === String(entry.defaultText).trim()
                ) {
                    def = '';
                }

                form.textField(entry.text ?? '', entry.placeholderText ?? '', {
                    ...(entry.options as ModalFormDataTextFieldOptions),
                    defaultValue: def,
                });
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

        function n(value: any) {
            const num = Number(value);
            if (isNaN(num)) player.sendMessage({ translate: 'sweepnslash.config.status.nan' });
            return isNaN(num) ? 0 : num;
        }

        activeElements.forEach((element, index) => {
            if (!element.dynamicProperty || !element.object) return;

            const rawValue = formValues?.[index];
            if (rawValue === undefined) return;

            let finalValue = rawValue;

            if (element.type === 'dropdown' && element.dropdownMapping) {
                const visualIndexSelected = Number(rawValue);
                finalValue = element.dropdownMapping[visualIndexSelected] ?? IndicatorType.None;
            }

            const rgbProps = ['sweepR', 'sweepG', 'sweepB'];
            if (rgbProps.includes(element.dynamicProperty)) {
                finalValue = clampNumber(n(rawValue), 0, 255);
            }

            element.object.setDynamicProperty(element.dynamicProperty, finalValue);
        });

        system.sendScriptEvent('sweep-and-slash:toggle', `${Game.isAddonEnabled()}`);
    });
}

export function registerConfigCommand(init: any): void {
    init.customCommandRegistry.registerCommand(
        {
            name: command,
            description: 'sweepnslash.config.command.description',
            permissionLevel: CommandPermissionLevel.Any,
            cheatsRequired: false,
        },
        configFormOpener,
    );
}
