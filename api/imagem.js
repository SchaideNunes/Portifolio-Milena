// POST /api/imagem  { conteudo: <base64> }  ->  { blob }
// Guarda a foto no GitHub como um objeto solto. Ela só passa a existir no site quando
// /api/projetos a inclui num commit (por isso o envio é uma foto por chamada: cada
// chamada à Vercel aceita no máximo 4,5 MB).
const { exigirLogin } = require("./_lib/auth");
const { criarBlob } = require("./_lib/github");

const TAMANHO_MAXIMO = 3 * 1024 * 1024;

// O navegador já converte para WebP (ou JPEG, onde não há suporte): confere pelos primeiros bytes
function ehFoto(bytes) {
  const webp = bytes.length > 12 && bytes.toString("latin1", 0, 4) === "RIFF" && bytes.toString("latin1", 8, 12) === "WEBP";
  const jpeg = bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  return webp || jpeg;
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ erro: "Método não permitido." });
  if (!exigirLogin(req, res)) return undefined;

  const conteudo = req.body && req.body.conteudo;
  if (typeof conteudo !== "string" || !/^[A-Za-z0-9+/]+=*$/.test(conteudo)) {
    return res.status(400).json({ erro: "Foto inválida." });
  }
  const bytes = Buffer.from(conteudo, "base64");
  if (bytes.length > TAMANHO_MAXIMO) return res.status(413).json({ erro: "Foto grande demais (máximo de 3 MB)." });
  if (!ehFoto(bytes)) return res.status(400).json({ erro: "O arquivo não é uma foto WebP ou JPEG." });

  try {
    return res.status(200).json({ blob: await criarBlob(conteudo) });
  } catch (erro) {
    console.error("Falha ao enviar foto:", erro);
    return res.status(502).json({ erro: "Não foi possível enviar a foto para o GitHub." });
  }
};
