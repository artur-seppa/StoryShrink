# StoryShrink

Converte posts de tecnologia (URL ou arquivo `.txt`) em narração de podcast em pt-BR.

Pipeline: **texto → LLM (reescreve como narrador) → TTS (gera áudio)**

Tudo roda localmente. Sem API keys. Sem custos.

## Como funciona

```
input.txt ou URL
      │
      ▼
  Ollama (LLM local)
  └─ reescreve o texto como script de podcast em pt-BR
      │
      ▼
  Piper TTS (local)
  └─ converte o script em áudio .wav
      │
      ▼
  output/arquivo.wav
```

## Pré-requisitos

- [Node.js](https://nodejs.org) 20+
- [pnpm](https://pnpm.io)
- [Docker](https://docs.docker.com/get-docker/) + [Docker Compose](https://docs.docker.com/compose/)

## Instalação

**1. Clone e instale dependências Node.js**
```bash
git clone <repo>
cd StoryShrink
pnpm install
```

**2. Suba o Ollama e o Piper com Docker**
```bash
docker compose up -d
```

O Docker cuida de baixar e configurar os dois serviços automaticamente.

| Serviço | Porta | Função |
|---------|-------|--------|
| Ollama  | 11434 | LLM — reescreve o texto como narrador |
| Piper   | 5000  | TTS — converte o script em áudio .wav |

**3. Baixe o modelo LLM**
```bash
docker exec storyshrink-ollama ollama pull llama3.2:3b
```

**4. Configure o `.env`**
```env
PIPER_URL=http://localhost:5000
```

## Uso

```bash
# a partir de um arquivo de texto
pnpm narrate input.txt

# a partir de uma URL
pnpm narrate https://blog.exemplo.com/post
```

O áudio é salvo em `output/<nome>.wav`.

---

## Instalação manual (sem Docker)

Caso prefira rodar sem Docker:

**Instale o Ollama**
```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3.2:3b
```

**Baixe o Piper e o modelo de voz**
```bash
mkdir -p bin models

curl -L https://github.com/rhasspy/piper/releases/download/2023.11.14-2/piper_linux_x86_64.tar.gz \
  | tar -xz -C bin/

curl -L -o models/pt_BR-faber-medium.onnx \
  "https://huggingface.co/rhasspy/piper-voices/resolve/main/pt/pt_BR/faber/medium/pt_BR-faber-medium.onnx"

curl -L -o models/pt_BR-faber-medium.onnx.json \
  "https://huggingface.co/rhasspy/piper-voices/resolve/main/pt/pt_BR/faber/medium/pt_BR-faber-medium.onnx.json"
```

Sem Docker, o `PIPER_URL` não deve ser definido — o projeto usa o binário local em `bin/piper/piper`.

---

## Modelos disponíveis

**LLM (Ollama)** — troque via `OLLAMA_MODEL`:

| Modelo | RAM necessária | Qualidade |
|--------|---------------|-----------|
| `llama3.2:1b` | ~1.5GB | Básica |
| `llama3.2:3b` | ~3GB | Boa ✓ |
| `llama3.1:8b` | ~6GB | Excelente |

**Voz (Piper)** — veja todos os modelos em [rhasspy/piper-voices](https://huggingface.co/rhasspy/piper-voices):

| Voz | Idioma | Qualidade |
|-----|--------|-----------|
| `pt_BR-faber-medium` | Português BR | Média ✓ |
| `en_US-lessac-medium` | Inglês US | Média |

## Todas as variáveis de ambiente

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `OLLAMA_URL` | `http://localhost:11434` | Endpoint do Ollama |
| `OLLAMA_MODEL` | `llama3.2:3b` | Modelo LLM |
| `PIPER_URL` | — | Endpoint do Piper (modo Docker) |
| `PIPER_BIN` | `bin/piper/piper` | Binário do Piper (modo local) |
| `PIPER_MODEL` | `models/pt_BR-faber-medium.onnx` | Modelo de voz (modo local) |
| `OUTPUT_DIR` | `output` | Pasta de saída dos arquivos .wav |
