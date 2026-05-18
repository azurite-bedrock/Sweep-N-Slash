import { join } from 'jsr:@std/path@^1';

const src = Deno.env.get('ROOT_DIR')!;
const bp = Deno.env.get('MARATHON_BP_DIR')!;
const rp = Deno.env.get('MARATHON_RP_DIR')!;

Deno.copyFile(join(src, 'LICENSES', 'MIT.txt'), join(bp, 'MIT.txt'));
Deno.copyFile(join(src, 'LICENSES', 'CC-BY-NC-SA-4.0.txt'), join(bp, 'CC-BY-NC-SA-4.0.txt'));
Deno.copyFile(join(src, 'NOTICE.md'), join(bp, 'NOTICE.md'));
Deno.copyFile(join(src, 'TRADEMARK.md'), join(bp, 'TRADEMARK.md'));

Deno.copyFile(join(src, 'LICENSES', 'MIT.txt'), join(rp, 'MIT.txt'));
Deno.copyFile(join(src, 'LICENSES', 'CC-BY-NC-SA-4.0.txt'), join(rp, 'CC-BY-NC-SA-4.0.txt'));
Deno.copyFile(join(src, 'NOTICE.md'), join(rp, 'NOTICE.md'));
Deno.copyFile(join(src, 'TRADEMARK.md'), join(rp, 'TRADEMARK.md'));
