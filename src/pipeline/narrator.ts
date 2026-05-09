import { spawn } from 'child_process';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { config } from '../config.js';
import { withRetry } from '../utils/retry.js';

async function piperViaHttp(script: string): Promise<Buffer> {
  const res = await fetch(`${config.piperUrl}/synthesize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: script }),
  });
  if (!res.ok) throw new Error(`Piper service ${res.status}: ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer());
}

function piperViaBinary(script: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(config.piperBin, [
      '--model', config.piperModel,
      '--output_file', outputPath,
    ]);
    proc.stdin.write(script, 'utf-8');
    proc.stdin.end();
    const stderr: string[] = [];
    proc.stderr.on('data', (d: Buffer) => stderr.push(d.toString()));
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`piper exited ${code}: ${stderr.join('')}`));
    });
    proc.on('error', reject);
  });
}

export async function narrateScript(
  script: string,
  filename: string,
): Promise<string> {
  return withRetry(async () => {
    await mkdir(config.outputDir, { recursive: true });
    const outputPath = join(config.outputDir, `${filename}.wav`);

    if (config.piperUrl) {
      const audio = await piperViaHttp(script);
      await writeFile(outputPath, audio);
    } else {
      await piperViaBinary(script, outputPath);
    }

    return outputPath;
  });
}
