import { readFile } from 'fs/promises';
import { basename, extname } from 'path';
import { scrapePost } from './pipeline/scraper.js';
import { writeScript } from './pipeline/scriptwriter.js';
import { narrateScript } from './pipeline/narrator.js';

function isUrl(input: string): boolean {
  return input.startsWith('http://') || input.startsWith('https://');
}

function sanitizeFilename(input: string): string {
  return input
    .replace(/^https?:\/\//, '')
    .replace(/[^a-zA-Z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function log(step: string, message: string) {
  console.log(`[${step}] ${message}`);
}

async function run() {
  const input = process.argv[2];

  if (!input) {
    console.error('Usage: pnpm narrate <url>');
    console.error('       pnpm narrate <arquivo.txt>');
    process.exit(1);
  }

  const fromFile = !isUrl(input);
  const filename = fromFile
    ? basename(input, extname(input))
    : sanitizeFilename(input);

  console.log(`\nStoryShrink — ${input}\n`);

  log('1/3', fromFile ? `Lendo ${input}...` : 'Buscando conteudo...');
  const content = fromFile
    ? await readFile(input, 'utf-8')
    : await scrapePost(input);
  log('1/3', `ok — ${content.length.toLocaleString('pt-BR')} caracteres`);

  log('2/3', 'Escrevendo script de narração...');
  const script = await writeScript(content);
  log('2/3', `ok — ${script.length.toLocaleString('pt-BR')} chars`);

  log('3/3', 'Gerando audio...');
  const audioPath = await narrateScript(script, filename);
  log('3/3', `ok — ${audioPath}`);

  console.log('\nConcluido!\n');
}

run().catch((err: Error) => {
  console.error(`\nErro: ${err.message}`);
  process.exit(1);
});
