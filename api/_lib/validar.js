// Validação do que o painel envia. Tudo que vai para o repositório passa por aqui:
// só os campos conhecidos são gravados, e as fotos só podem ficar em pastas esperadas.

const LIMITES = { projetos: 200, imagens: 20 };

// Fotos enviadas pelo painel vão para assets/projetos/; "Fotos Milena/" são as que já existiam
const FOTO_DO_PAINEL = /^assets\/projetos\/[a-z0-9]+(-[a-z0-9]+)*\.(webp|jpg)$/;
const FOTO_ANTIGA = /^Fotos Milena\/[^/\\]+\.webp$/;
const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;

class ErroDeValidacao extends Error {}

function texto(valor, campo, { max, obrigatorio = false }) {
  if (valor === undefined || valor === null || valor === "") {
    if (obrigatorio) throw new ErroDeValidacao(`Preencha o campo "${campo}".`);
    return undefined;
  }
  if (typeof valor !== "string") throw new ErroDeValidacao(`O campo "${campo}" precisa ser um texto.`);
  const limpo = valor.trim();
  if (obrigatorio && !limpo) throw new ErroDeValidacao(`Preencha o campo "${campo}".`);
  if (limpo.length > max) throw new ErroDeValidacao(`O campo "${campo}" passa de ${max} caracteres.`);
  return limpo || undefined;
}

function ano(valor) {
  if (valor === undefined || valor === null || valor === "") return undefined;
  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero < 1900 || numero > 2100) throw new ErroDeValidacao("O ano precisa ter 4 dígitos.");
  return numero;
}

// Devolve os projetos só com os campos conhecidos, na ordem em que o site espera
function normalizarProjetos(entrada) {
  if (!Array.isArray(entrada)) throw new ErroDeValidacao("Lista de projetos inválida.");
  if (entrada.length > LIMITES.projetos) throw new ErroDeValidacao(`Máximo de ${LIMITES.projetos} projetos.`);

  const ids = new Set();
  return entrada.map((p) => {
    if (!p || typeof p !== "object") throw new ErroDeValidacao("Projeto inválido.");
    const titulo = texto(p.titulo, "Título", { max: 120, obrigatorio: true });

    if (typeof p.id !== "string" || p.id.length > 80 || !ID.test(p.id)) throw new ErroDeValidacao(`Identificador inválido no projeto "${titulo}".`);
    if (ids.has(p.id)) throw new ErroDeValidacao(`Há dois projetos com o identificador "${p.id}".`);
    ids.add(p.id);

    if (!Array.isArray(p.imagens) || p.imagens.length === 0) throw new ErroDeValidacao(`O projeto "${titulo}" precisa de pelo menos uma foto.`);
    if (p.imagens.length > LIMITES.imagens) throw new ErroDeValidacao(`O projeto "${titulo}" passa de ${LIMITES.imagens} fotos.`);
    const imagens = p.imagens.map((imagem) => {
      const src = imagem && imagem.src;
      if (typeof src !== "string" || !(FOTO_DO_PAINEL.test(src) || FOTO_ANTIGA.test(src))) {
        throw new ErroDeValidacao(`Foto com endereço inválido no projeto "${titulo}".`);
      }
      return { src, alt: texto(imagem.alt, "Descrição da foto", { max: 200 }) || titulo };
    });

    // JSON.stringify descarta os campos undefined
    return {
      id: p.id,
      titulo,
      categoria: texto(p.categoria, "Categoria", { max: 40, obrigatorio: true }),
      local: texto(p.local, "Local", { max: 80 }),
      ano: ano(p.ano),
      area: texto(p.area, "Área", { max: 40 }),
      descricao: texto(p.descricao, "Descrição", { max: 2000 }),
      imagens,
    };
  });
}

const fotosDe = (projetos) => new Set(projetos.flatMap((p) => (p.imagens || []).map((i) => i.src)));

module.exports = { normalizarProjetos, fotosDe, FOTO_DO_PAINEL, ErroDeValidacao };
