import { dirname } from 'jsr:@std/path@^1';

const FILES_TO_DOWNLOAD = [
    {
        url: 'https://raw.githubusercontent.com/Mojang/bedrock-samples/main/behavior_pack/entities/player.json',
        outPath: 'vanilla_data/bp/entities/player.json',
    },
];

for (const file of FILES_TO_DOWNLOAD) {
    console.log(`Downloading: ${file.url}`);
    const resp = await fetch(file.url);

    if (!resp.ok) {
        console.error(`Failed to fetch ${file.url}: ${resp.status}`);
        continue;
    }

    const text = await resp.text();

    await Deno.mkdir(dirname(file.outPath), { recursive: true });

    await Deno.writeTextFile(file.outPath, text);
    console.log(`Written ${file.outPath}`);
}
