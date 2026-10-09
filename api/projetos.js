// GET  /api/projetos  ->  { projetos, versao, branch }   (estado atual no GitHub)
// POST /api/projetos  { projetos, versao, novasImagens: [{ src, blob }] }  ->  { versao }
const { exigirLogin } = require("./_lib/auth");
const { config, lerProjetos, publicar, ErroGitHub } = require("./_lib/github");
const { normalizarProjetos, fotosDe, FOTO_DO_PAINEL, ErroDeValidacao } = require("./_lib/validar");

const SHA = /^[0-9a-f]{40}$/;

async function salvar(req, res) {
  const { projetos: enviados, versao, novasImagens = [] } = req.body || {};
  const projetos = normalizarProjetos(enviados);

  const atual = await lerProjetos();
  if (versao !== atual.versao) {
    return res.status(409).json({ erro: "Os projetos foram alterados em outro lugar. Recarregue a página e refaça as mudanças." });
  }

  const fotosAntes = fotosDe(atual.projetos);
  const fotosDepois = fotosDe(projetos);

  // Fotos novas: só entram as que algum projeto usa, com endereço na pasta do painel
  if (!Array.isArray(novasImagens)) throw new ErroDeValidacao("Lista de fotos inválida.");
  const novas = new Map();
  for (const imagem of novasImagens) {
    const { src, blob } = imagem || {};
    if (typeof src !== "string" || !FOTO_DO_PAINEL.test(src) || !SHA.test(blob)) throw new ErroDeValidacao("Foto nova inválida.");
    if (fotosDepois.has(src)) novas.set(src, blob);
  }
  // Toda foto citada precisa já existir no site ou estar sendo enviada agora
  for (const src of fotosDepois) {
    if (!fotosAntes.has(src) && !novas.has(src)) throw new ErroDeValidacao("Há uma foto que não foi enviada. Adicione-a de novo.");
  }
  // Fotos do painel que ninguém usa mais saem do repositório (as antigas ficam onde estão)
  const removidas = [...fotosAntes].filter((src) => !fotosDepois.has(src) && FOTO_DO_PAINEL.test(src));

  const resultado = await publicar({
    textoJson: `${JSON.stringify({ projetos }, null, 2)}\n`,
    novasImagens: [...novas].map(([src, blob]) => ({ src, blob })),
    imagensRemovidas: removidas,
    mensagem: "content: update projects via admin panel",
  });
  return res.status(200).json({ versao: resultado.versao });
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET" && req.method !== "POST") return res.status(405).json({ erro: "Método não permitido." });
  if (!exigirLogin(req, res)) return undefined;

  try {
    if (req.method === "GET") return res.status(200).json({ ...(await lerProjetos()), branch: config().branch });
    return await salvar(req, res);
  } catch (erro) {
    if (erro instanceof ErroDeValidacao) return res.status(400).json({ erro: erro.message });
    console.error("Falha no painel de projetos:", erro);
    if (erro instanceof ErroGitHub && (erro.status === 401 || erro.status === 403 || erro.status === 404)) {
      return res.status(502).json({ erro: "O GitHub recusou o acesso. Confira o GITHUB_TOKEN e as permissões dele no repositório." });
    }
    if (erro instanceof ErroGitHub && erro.status === 422) {
      return res.status(409).json({ erro: "O site foi atualizado em outro lugar ao mesmo tempo. Recarregue a página e tente de novo." });
    }
    return res.status(502).json({ erro: "Não foi possível falar com o GitHub agora. Tente de novo em instantes." });
  }
};
