import 'dotenv/config';

export const config = {
  ollamaUrl: process.env.OLLAMA_URL ?? 'http://localhost:11434',
  ollamaModel: process.env.OLLAMA_MODEL ?? 'llama3.2:3b',
  piperUrl: process.env.PIPER_URL ?? null,
  piperBin: process.env.PIPER_BIN ?? 'bin/piper/piper',
  piperModel: process.env.PIPER_MODEL ?? 'models/pt_BR-faber-medium.onnx',
  outputDir: process.env.OUTPUT_DIR ?? 'output',
};
