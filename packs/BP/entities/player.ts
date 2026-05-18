import { join } from 'jsr:@std/path@^1';

const src = Deno.env.get('ROOT_DIR')!;

const vanilla = JSON.parse(
    await Deno.readTextFile(join(src, 'vanilla_data/bp/entities/player.json')),
);
const entity = vanilla['minecraft:entity'];

Object.assign(entity.component_groups, {
    'sweepnslash:enable': {
        'minecraft:attack': { damage: -10000 },
    },
    'sweepnslash:disable': {
        'minecraft:attack': { damage: 1 },
    },
});

Object.assign(entity.events, {
    'sweepnslash:enable': {
        add: { component_groups: ['sweepnslash:enable'] },
    },
    'sweepnslash:disable': {
        add: { component_groups: ['sweepnslash:disable'] },
    },
});

await Deno.writeTextFile('player.json', JSON.stringify(vanilla));
