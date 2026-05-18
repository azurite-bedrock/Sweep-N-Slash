import { join } from 'jsr:@std/path@^1';

const src = Deno.env.get('ROOT_DIR')!;
const bp = Deno.env.get('MARATHON_BP_DIR')!;
const rp = Deno.env.get('MARATHON_RP_DIR')!;

Deno.copyFile(join(src, 'LICENSE.md'), join(bp, 'LICENSE.md'));
Deno.copyFile(join(src, 'TRADEMARK.md'), join(bp, 'TRADEMARK.md'));

Deno.copyFile(join(src, 'LICENSE.md'), join(rp, 'LICENSE.md'));
Deno.copyFile(join(src, 'TRADEMARK.md'), join(rp, 'TRADEMARK.md'));
