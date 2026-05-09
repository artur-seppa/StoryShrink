import { createServer } from 'http';
import { spawn } from 'child_process';
import { readFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

const PIPER_BIN = './piper/piper';
const PIPER_MODEL = process.env.PIPER_MODEL ?? './models/pt_BR-faber-medium.onnx';
const PORT = 5000;

createServer(async (req, res) => {
  if (req.method !== 'POST' || req.url !== '/synthesize') {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const { text } = JSON.parse(Buffer.concat(chunks).toString());

    const tmpFile = join(tmpdir(), `piper-${Date.now()}.wav`);

    await new Promise((resolve, reject) => {
      const proc = spawn(PIPER_BIN, ['--model', PIPER_MODEL, '--output_file', tmpFile]);
      proc.stdin.write(text, 'utf-8');
      proc.stdin.end();
      const stderr = [];
      proc.stderr.on('data', d => stderr.push(d.toString()));
      proc.on('close', code =>
        code === 0 ? resolve() : reject(new Error(`piper exit ${code}: ${stderr.join('')}`))
      );
      proc.on('error', reject);
    });

    const audio = await readFile(tmpFile);
    await unlink(tmpFile).catch(() => {});

    res.writeHead(200, { 'Content-Type': 'audio/wav', 'Content-Length': audio.length });
    res.end(audio);
  } catch (err) {
    res.writeHead(500);
    res.end(err.message);
  }
}).listen(PORT, () => console.log(`Piper service running on :${PORT}`));
