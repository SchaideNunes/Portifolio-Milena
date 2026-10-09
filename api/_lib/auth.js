// Login do painel: uma senha única (ADMIN_SENHA) troca por um token assinado que vale 8 horas.
// Não há banco: o token é "validade.assinatura" e a assinatura é conferida a cada chamada.
const crypto = require("node:crypto");

const DURACAO_MS = 8 * 60 * 60 * 1000;
const TAMANHO_MINIMO_SENHA = 10;

function configurado() {
  const { ADMIN_SENHA, GITHUB_TOKEN } = process.env;
  return Boolean(GITHUB_TOKEN) && typeof ADMIN_SENHA === "string" && ADMIN_SENHA.length >= TAMANHO_MINIMO_SENHA;
}

// A chave sai das duas variáveis: trocar a senha ou o token do GitHub derruba as sessões abertas
function chave() {
  const { ADMIN_SENHA, GITHUB_TOKEN } = process.env;
  return crypto.createHash("sha256").update(`${ADMIN_SENHA}:${GITHUB_TOKEN}`).digest();
}

function assinar(validade) {
  return crypto.createHmac("sha256", chave()).update(String(validade)).digest("base64url");
}

// Comparação em tempo constante (sobre o hash, para os tamanhos sempre baterem)
function iguais(a, b) {
  const hash = (texto) => crypto.createHash("sha256").update(String(texto)).digest();
  return crypto.timingSafeEqual(hash(a), hash(b));
}

function senhaCorreta(senha) {
  return configurado() && typeof senha === "string" && iguais(senha, process.env.ADMIN_SENHA);
}

function criarToken() {
  const validade = Date.now() + DURACAO_MS;
  return `${validade}.${assinar(validade)}`;
}

function tokenValido(token) {
  const [validade, assinatura] = String(token || "").split(".");
  if (!/^\d+$/.test(validade) || !assinatura) return false;
  if (Number(validade) < Date.now()) return false;
  return iguais(assinatura, assinar(validade));
}

// Responde 503/401 e devolve false quando a chamada não pode continuar
function exigirLogin(req, res) {
  if (!configurado()) {
    res.status(503).json({ erro: "Painel não configurado: defina ADMIN_SENHA (10+ caracteres) e GITHUB_TOKEN na Vercel." });
    return false;
  }
  const cabecalho = req.headers.authorization || "";
  if (!tokenValido(cabecalho.replace(/^Bearer\s+/i, ""))) {
    res.status(401).json({ erro: "Sessão expirada. Entre novamente." });
    return false;
  }
  return true;
}

module.exports = { configurado, senhaCorreta, criarToken, tokenValido, exigirLogin };
