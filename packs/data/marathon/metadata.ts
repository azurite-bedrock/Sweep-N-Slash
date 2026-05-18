import { join } from 'jsr:@std/path@^1';

const src = Deno.env.get('ROOT_DIR')!;

Deno.copyFile(join(src, 'LICENSE.md'), join('BP', 'LICENSE.md'));
Deno.copyFile(join(src, 'TRADEMARK.md'), join('BP', 'TRADEMARK.md'));
