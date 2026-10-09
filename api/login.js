// POST /api/login  { senha }  ->  { token }
const { configurado, senhaCorreta, criarToken } = require("./_lib/auth");

const ATRASO_APOS_ERRO_MS = 800;

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ erro: "Método não permitido." });
  if (!configurado()) {
    return res.status(503).json({ erro: "Painel não configurado: defina ADMIN_SENHA (10+ caracteres) e GITHUB_TOKEN na Vercel." });
  }

  if (!senhaCorreta(req.body && req.body.senha)) {
    // Não há onde contar tentativas (sem banco): o atraso encarece a adivinhação da senha
    await new Promise((resolver) => setTimeout(resolver, ATRASO_APOS_ERRO_MS));
    return res.status(401).json({ erro: "Senha incorreta." });
  }

  return res.status(200).json({ token: criarToken() });
};
