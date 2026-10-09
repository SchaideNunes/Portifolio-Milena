// Acesso ao repositório pela API do GitHub. O site é estático: "salvar" no painel é
// criar um commit, e a Vercel republica sozinha a partir dele.
const crypto = require("node:crypto");

const ARQUIVO_PROJETOS = "dados/projetos.json";

// Em deploys de preview a Vercel informa a branch daquele deploy, então o painel de um
// preview grava na própria branch e não na de produção.
function config() {
  const { GITHUB_REPO, GITHUB_BRANCH, VERCEL_GIT_REPO_OWNER, VERCEL_GIT_REPO_SLUG, VERCEL_GIT_COMMIT_REF } = process.env;
  const repoDaVercel = VERCEL_GIT_REPO_OWNER && VERCEL_GIT_REPO_SLUG ? `${VERCEL_GIT_REPO_OWNER}/${VERCEL_GIT_REPO_SLUG}` : null;
  return {
    repo: GITHUB_REPO || repoDaVercel || "SchaideNunes/Portifolio-Milena",
    branch: GITHUB_BRANCH || VERCEL_GIT_COMMIT_REF || "main",
  };
}

class ErroGitHub extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

async function gh(caminho, { method = "GET", body } = {}) {
  const resposta = await fetch(`https://api.github.com/repos/${config().repo}${caminho}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "painel-milena-reis",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) throw new ErroGitHub(resposta.status, dados.message || `GitHub respondeu ${resposta.status}`);
  return dados;
}

// `versao` é o sha do arquivo: o painel devolve esse valor ao publicar, e se o arquivo
// tiver mudado no meio do caminho a publicação é recusada em vez de sobrescrever.
async function lerProjetos() {
  const arquivo = await gh(`/contents/${ARQUIVO_PROJETOS}?ref=${encodeURIComponent(config().branch)}`);
  const texto = Buffer.from(arquivo.content, "base64").toString("utf8");
  const projetos = JSON.parse(texto).projetos;
  return { projetos: Array.isArray(projetos) ? projetos : [], versao: arquivo.sha };
}

// Mesmo cálculo que o git faz para o sha de um arquivo
function shaDoConteudo(texto) {
  const conteudo = Buffer.from(texto, "utf8");
  return crypto.createHash("sha1").update(`blob ${conteudo.length}\0`).update(conteudo).digest("hex");
}

// Um único commit com o JSON novo, as fotos novas e a remoção das fotos que saíram:
// o site nunca fica num estado pela metade e a Vercel faz um deploy só.
async function publicar({ textoJson, novasImagens, imagensRemovidas, mensagem }) {
  const ref = `heads/${config().branch}`;
  const { object: { sha: commitAtual } } = await gh(`/git/ref/${ref}`);
  const { tree: { sha: arvoreAtual } } = await gh(`/git/commits/${commitAtual}`);

  const arquivo = (path, extra) => ({ path, mode: "100644", type: "blob", ...extra });
  const entradas = [
    arquivo(ARQUIVO_PROJETOS, { content: textoJson }),
    ...novasImagens.map(({ src, blob }) => arquivo(src, { sha: blob })),
  ];
  const remocoes = imagensRemovidas.map((src) => arquivo(src, { sha: null }));

  let arvore;
  try {
    arvore = await gh("/git/trees", { method: "POST", body: { base_tree: arvoreAtual, tree: [...entradas, ...remocoes] } });
  } catch (erro) {
    // Remover um arquivo que já não existe faz o GitHub recusar a árvore inteira:
    // nesse caso publica sem as remoções (sobra um arquivo órfão, o site fica certo)
    if (remocoes.length === 0 || erro.status !== 422) throw erro;
    arvore = await gh("/git/trees", { method: "POST", body: { base_tree: arvoreAtual, tree: entradas } });
  }

  const commit = await gh("/git/commits", { method: "POST", body: { message: mensagem, tree: arvore.sha, parents: [commitAtual] } });
  // Sem `force`: se alguém deu push no meio do caminho o GitHub recusa (422) e nada é perdido
  await gh(`/git/refs/${ref}`, { method: "PATCH", body: { sha: commit.sha } });
  return { commit: commit.sha, versao: shaDoConteudo(textoJson) };
}

async function criarBlob(conteudoBase64) {
  const { sha } = await gh("/git/blobs", { method: "POST", body: { content: conteudoBase64, encoding: "base64" } });
  return sha;
}

module.exports = { config, lerProjetos, publicar, criarBlob, ErroGitHub };
