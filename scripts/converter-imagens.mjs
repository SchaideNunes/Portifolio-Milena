#!/usr/bin/env node
// Converte as imagens de `imagens-novas/` (PNG, JPG, BMP, TIFF) para WebP.
//
// Uso:
//   node scripts/converter-imagens.mjs                       -> salva em assets/imagens/
//   node scripts/converter-imagens.mjs assets/projetos       -> escolhe a pasta de destino
//   node scripts/converter-imagens.mjs --largura 1280 --qualidade 75
//   node scripts/converter-imagens.mjs --sobrescrever        -> substitui .webp que já existam
//
// O nome do arquivo vira kebab-case sem acentos ("Sala de Estar 2.PNG" -> "sala-de-estar-2.webp").
// Depois de convertido, o original vai para `imagens-novas/convertidas/` (fora do git e do deploy).
// Requer o ffmpeg instalado e disponível no PATH.

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ENTRADA = path.join(RAIZ, "imagens-novas");
const CONVERTIDAS = path.join(ENTRADA, "convertidas");
const EXTENSOES = new Set([".png", ".jpg", ".jpeg", ".bmp", ".tif", ".tiff"]);

// --- Argumentos ---
const opcoes = { destino: "assets/imagens", largura: 1920, qualidade: 82, sobrescrever: false };
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--largura") opcoes.largura = Number(args[++i]);
  else if (args[i] === "--qualidade") opcoes.qualidade = Number(args[++i]);
  else if (args[i] === "--sobrescrever") opcoes.sobrescrever = true;
  else if (!args[i].startsWith("--")) opcoes.destino = args[i];
  else falhar(`Opção desconhecida: ${args[i]}`);
}
if (!Number.isInteger(opcoes.largura) || opcoes.largura < 1) falhar("--largura precisa ser um número inteiro positivo.");
if (!(opcoes.qualidade >= 1 && opcoes.qualidade <= 100)) falhar("--qualidade precisa estar entre 1 e 100.");

function falhar(mensagem) {
  console.error(`Erro: ${mensagem}`);
  process.exit(1);
}

function nomeLimpo(arquivo) {
  return path.parse(arquivo).name
    .normalize("NFD").replace(/[̀-ͯ]/g, "") // remove acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "imagem";
}

const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;

// --- Conversão ---
if (spawnSync("ffmpeg", ["-version"]).error) falhar("ffmpeg não encontrado no PATH.");

const destino = path.resolve(RAIZ, opcoes.destino);
const arquivos = fs.existsSync(ENTRADA)
  ? fs.readdirSync(ENTRADA).filter((nome) => EXTENSOES.has(path.extname(nome).toLowerCase()))
  : [];

if (arquivos.length === 0) {
  console.log("Nenhuma imagem PNG/JPG encontrada em imagens-novas/.");
  process.exit(0);
}

fs.mkdirSync(destino, { recursive: true });
fs.mkdirSync(CONVERTIDAS, { recursive: true });

let falhas = 0;
for (const arquivo of arquivos) {
  const origem = path.join(ENTRADA, arquivo);
  const saida = path.join(destino, `${nomeLimpo(arquivo)}.webp`);
  const saidaRelativa = path.relative(RAIZ, saida).replaceAll("\\", "/");

  if (fs.existsSync(saida) && !opcoes.sobrescrever) {
    console.log(`PULOU  ${arquivo} -> ${saidaRelativa} já existe (use --sobrescrever)`);
    falhas++;
    continue;
  }

  // Só reduz: imagens menores que a largura máxima mantêm o tamanho original
  const resultado = spawnSync("ffmpeg", [
    "-y", "-v", "error", "-i", origem,
    "-vf", `scale='min(${opcoes.largura},iw)':-2:flags=lanczos`,
    "-frames:v", "1",
    "-c:v", "libwebp", "-quality", String(opcoes.qualidade), "-compression_level", "6",
    saida,
  ], { encoding: "utf8" });

  if (resultado.status !== 0 || !fs.existsSync(saida)) {
    console.error(`FALHOU ${arquivo}\n${resultado.stderr || ""}`);
    falhas++;
    continue;
  }

  const antes = fs.statSync(origem).size;
  const depois = fs.statSync(saida).size;
  fs.renameSync(origem, path.join(CONVERTIDAS, arquivo));
  console.log(`OK     ${arquivo} -> ${saidaRelativa} (${kb(antes)} -> ${kb(depois)})`);
}

process.exit(falhas > 0 ? 1 : 0);
