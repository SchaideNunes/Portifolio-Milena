# CLAUDE.md

Portfólio one-page da arquiteta **Milena Reis** (Salvador, BA). Site estático em Vanilla Web — sem build, sem package manager, sem testes. Idioma do conteúdo, classes CSS, funções JS e comentários: **português (pt-BR)**. Mantenha esse padrão.

Autor/dev: Schaide Nunes. Deploy: **Vercel**, em `https://portifolio-milena.vercel.app/` (integração com o GitHub: push na `main` publica).

## Executar

Servir a pasta raiz com qualquer servidor estático (Live Server, `npx serve`, etc.). Não há lint/build/test. Verificação é visual no navegador (desktop + mobile). `node --check js/script.js` pega erro de sintaxe.

## Arquivos

| Arquivo | Papel |
| :--- | :--- |
| `index.html` | Página única. SEO (meta, OG, JSON-LD `ProfessionalService`), seções, modal, wizard. |
| `css/style.css` | Tudo em um arquivo, com 18 seções numeradas (índice no topo). Tokens em `:root`. |
| `js/script.js` | IIFE única, 10 seções numeradas; tudo inicia no `load` (fim do arquivo). |
| `404.html` | Página de erro independente (CSS inline, **caminhos absolutos** — é servida em qualquer URL). |
| `vercel.json` | Cabeçalhos de segurança + cache de 7 dias em `/assets/`. |
| `.vercelignore` | Tira do deploy: README, CLAUDE.md, screenshots, `imagens-novas/`, `scripts/`. |
| `assets/` | `hero/`, `logo/`, `sobre/`, `video/`, `og/` (imagem de compartilhamento), `texturas/`, `screenshots/` (só README). |
| `Fotos Milena/` | Fotos reais dos projetos — **são estas que o site usa** nos cards e na galeria. |
| `imagens-novas/` | Entrada de originais PNG/JPG (gitignored). Ver "Imagens novas". |
| `scripts/converter-imagens.mjs` | PNG/JPG → WebP via ffmpeg. |

GSAP 3.12.5 + ScrollTrigger vêm de CDN (cdnjs), com `defer`. Fontes (Cormorant Garamond, Jost) via `<link>` no `<head>`.

**Não criar `package.json` na raiz** sem necessidade: a Vercel passaria a rodar install/build e pode mudar o diretório de saída.

## Imagens novas (fluxo combinado com o usuário)

O usuário joga os originais em `imagens-novas/` e pede para usar no site. Então:

1. `node scripts/converter-imagens.mjs <pasta-destino>` (padrão `assets/imagens/`; opções `--largura`, `--qualidade`, `--sobrescrever`). Gera `.webp` em kebab-case, máx. 1920px, e move o original para `imagens-novas/convertidas/`.
2. Referenciar o `.webp` no HTML com `loading="lazy" decoding="async"` e `alt` descritivo.

Requer ffmpeg no PATH (instalado na máquina do usuário via winget). Python **não** está instalado.

## Seções (ordem no HTML)

`#tela-carregamento` (preloader) → `#menu-topo` + `#menu-mobile-overlay` → `<main id="conteudo">`: `#secao-hero` → `.faixa-rolante` → `#secao-sobre` → `#secao-modelo-3d` (vídeo scroll-scrub, pinned) → `#secao-projetos` (`.baralho-cartas`, sanfona por hover em CSS) → `#secao-servicos` → `#secao-galeria` → `#secao-contato` → `#rodape` → `#modal-galeria` → `#wizard-orcamento`.

## Como as coisas funcionam (não óbvio)

- **Sem `onclick` inline.** Ações são ligadas no JS por atributos: `data-abrir-wizard` (qualquer botão, em qualquer lugar), `data-fechar-wizard`, `data-ir-passo="N"`. Formulários (`#form-contato`, `#form-orcamento`) usam o evento `submit`.
- **WhatsApp**: número único em `CONFIG.whatsapp` no topo do `js/script.js` (também aparece no HTML: JSON-LD e link `tel:`). Wizard e formulário de contato só abrem `wa.me` com texto pronto — não há backend nem envio de e-mail.
- **Sobreposições** (menu mobile, modal da galeria, wizard): abrir/fechar sempre por `abrirSobreposicao()` / `fecharSobreposicao()`. Elas cuidam de `.ativo`, `inert`, devolução do foco e da trava de scroll (`.no-scroll` em `body` e `html`, só sai quando nenhuma está aberta). Sobreposição nova: adicionar o id em `SELETOR_ABERTAS` e no handler de `Escape`, e começar com `inert` no HTML.
- **Duplicação para loop é feita no JS**: galeria e faixa rolante têm o conteúdo **uma vez** no HTML; `iniciarGaleria()` e `duplicarFaixaRolante()` clonam os itens (clones com `aria-hidden`). Para adicionar foto na galeria, basta um `.galeria-foto` com `data-titulo`/`data-desc`.
- **Galeria**: auto-scroll por `requestAnimationFrame` mexendo em `scrollLeft`; pausa durante arrasto e com o modal aberto. Um arrasto (>5px) não conta como clique.
- **Animações de entrada**: `.animar-subindo`, `.animar-da-esquerda`, `.animar-da-direita`, `.entrada-blur` ganham `.visivel` via IntersectionObserver; o CSS faz a transição. `.texto-merge` alterna `.visivel` ao entrar/sair. `.servico-item` tem observador próprio (cascata de 100ms).
- **Preloader**: SVG de planta baixa com `strokeDashoffset` via GSAP. Sem GSAP ou com `prefers-reduced-motion`, é removido na hora. Há `<noscript>` que esconde o preloader e revela o conteúdo animado.
- **Vídeo 3D**: `ScrollTrigger` com `pin`, `end` +3000 (desktop) / +2400 (≤768px). Um loop `requestAnimationFrame` ajusta `video.currentTime` (evita latência de seek). As frases `#texto-engaja-1..3` são um array `{ seletor, entra, sai }` na mesma timeline. O vídeo precisa ser **keyframe-dense** (`_kf`) — ao trocar, re-encodar assim, em `.webm` **e** `.mp4`. No mobile o CSS centraliza as frases com `transform ... !important`, que anula de propósito o `y` inline do GSAP.
- **Desfoque entre seções** (`desfoqueEntreSecoes`): escreve `filter` + `opacity` inline em **todas** as `<section>` a cada scroll, só acima de 900px. Interfere em qualquer `filter`/`opacity` definido numa `section` via CSS, e um `filter` no ancestral quebra `position: fixed` de filhos — por isso modal e wizard ficam **fora** das sections.
- **h1 do hero é uma imagem** (logo com `mix-blend-mode: screen` e `clip-path` cortando os 35% de baixo). Propriedades de fonte em `.hero-titulo-gigante` não têm efeito.
- **Textura de fundo**: `--textura` (arquivo local `assets/texturas/cubes.png`) aplicada via `::before` em sobre, contato, serviços e faixa.
- **Responsividade**: tudo na seção 17 do CSS — ≥1441px, ≤1024px, ≤768px, ≤480px. Seção 18 trata `prefers-reduced-motion`.

## Pendências conhecidas

1. **Domínio**: `milenareis.arq.br` (que estava no canonical/OG/sitemap) **não existe no DNS**; tudo aponta agora para `portifolio-milena.vercel.app`. Quando houver domínio próprio, trocar em: `index.html` (canonical, `og:url`, `og:image`, `twitter:image`, JSON-LD), `robots.txt`, `sitemap.xml` e aqui.
2. **LinkedIn** do rodapé/JSON-LD (`linkedin.com/in/milena-reis-arquitetura`) veio do código original e não foi confirmado. Behance foi removido por não ter URL.
3. **Assets não referenciados** (mantidos a pedido do usuário): `assets/Pattern (1-4).webp`, `assets/galeria/*`, `assets/projetos/*`, `assets/sobre/Profile 2/3.webp`, logos `Alt (1)`, `Comp (1)`, `Comp (2)`, e em `Fotos Milena/`: `Banheiro 2`, `Banheiro 3`, `Garagem casa externa`, `Quarto apartamento`, `Varanda`.
4. **Nomes de arquivo com espaços/parênteses** (`Fotos Milena/`, `assets/logo/`): funcionam com `%20` no HTML, mas o ideal seria kebab-case. Não renomeado para não mexer nos assets.
5. **Favicon** é a logo horizontal em WebP; falta um ícone quadrado (PNG/SVG) e `apple-touch-icon`.
6. **Peso do vídeo**: 5,2MB (mp4) + 8,8MB (webm), e o script força `load()` logo no início.
7. **Cores fora dos tokens**: ainda há hex soltos no CSS (traços do preloader, `#c8b4a4`, `#b89e8c`, `rgba(42,31,26,…)` etc.).
8. `.menu-mobile-overlay` usa `var(--header-height)`, que só é definida dentro de `#menu-topo` (não herda) — cai sempre no fallback de 74px.
9. `sitemap.xml` tem `lastmod` manual: atualizar quando o conteúdo mudar.

## Convenções ao editar

- Nomes novos em pt-BR, estilo existente (`kebab-case` em classes/ids, `camelCase` em funções JS). Comentários curtos em português, explicando o porquê.
- CSS novo entra na seção numerada correspondente; ajustes por breakpoint vão na seção 17, não espalhados.
- Cores sempre via tokens `:root`. `--cor-branco` é `#f0e9e0` (nude), **não** branco puro.
- Imagens novas em **WebP**; abaixo da dobra: `loading="lazy" decoding="async"` e `alt` descritivo. Só o hero é `eager` + `fetchpriority="high"`. Caminhos com espaço usam `%20`.
- Toda mudança visual deve ser conferida nos 4 breakpoints e com o preloader ativo (o site só "revela" após ele).
- Não adicionar framework/build sem pedir: o projeto é deliberadamente Vanilla.
- Se mudar seções, assets ou stack, atualizar o `README.md`.
- Commits seguem Conventional Commits em inglês (`feat:`, `fix:`, `style:`, `docs:`, `chore:`), como no histórico.
