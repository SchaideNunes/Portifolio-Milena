# imagens-novas/

Pasta de entrada para as fotos originais que a Milena enviar (PNG, JPG, BMP ou TIFF).

1. Jogue os arquivos aqui, com um nome que descreva a foto (ex.: `cozinha apartamento salvador.jpg`).
2. Rode a conversão:

   ```bash
   node scripts/converter-imagens.mjs                  # salva em assets/imagens/
   node scripts/converter-imagens.mjs assets/projetos  # ou escolha a pasta de destino
   ```

3. O `.webp` sai com o nome em minúsculas e hífens (`cozinha-apartamento-salvador.webp`), com no máximo
   1920px de largura. O original é movido para `imagens-novas/convertidas/`.

Nada desta pasta (além deste arquivo) vai para o git nem para o deploy — só os `.webp` gerados em `assets/`.

Requer [ffmpeg](https://ffmpeg.org/) no PATH. Opções: `--largura 1280`, `--qualidade 75`, `--sobrescrever`.
