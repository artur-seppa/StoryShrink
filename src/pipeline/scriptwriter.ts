import { config } from '../config.js';
import { withRetry } from '../utils/retry.js';

const SYSTEM_PROMPT = `Você é um narrador de podcast de tecnologia brasileiro.
Receberá um texto e deve reescrevê-lo como um script de narração em português brasileiro.
Regras:
- Tom conversacional, direto e envolvente, como um podcast
- Destaque os pontos mais importantes, descartando detalhes irrelevantes
- Máximo de 3 parágrafos curtos
- Sem saudações, introduções longas ou despedidas
- Responda APENAS com o script, sem explicações adicionais`;

export async function writeScript(content: string): Promise<string> {
  return withRetry(async () => {
    const response = await fetch(`${config.ollamaUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.ollamaModel,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content },
        ],
        max_tokens: 512,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Ollama ${response.status}: ${text}`);
    }

    const json = await response.json() as { choices: { message: { content: string } }[] };
    const text = json.choices[0]?.message?.content;
    if (!text) throw new Error('Ollama returned empty response');
    return text.trim();
  });
}
