FROM node:22-slim
WORKDIR /app

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Download piper binary
RUN curl -fsSL https://github.com/rhasspy/piper/releases/download/2023.11.14-2/piper_linux_x86_64.tar.gz \
    | tar -xz

# Download voice model
ARG PIPER_VOICE=pt_BR-faber-medium
ARG PIPER_LANG=pt/pt_BR/faber/medium
RUN mkdir -p models && \
    curl -fsSL -o models/${PIPER_VOICE}.onnx \
      "https://huggingface.co/rhasspy/piper-voices/resolve/main/${PIPER_LANG}/${PIPER_VOICE}.onnx" && \
    curl -fsSL -o models/${PIPER_VOICE}.onnx.json \
      "https://huggingface.co/rhasspy/piper-voices/resolve/main/${PIPER_LANG}/${PIPER_VOICE}.onnx.json"

COPY server.mjs .

EXPOSE 5000
CMD ["node", "server.mjs"]
