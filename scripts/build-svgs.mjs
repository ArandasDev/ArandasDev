// Gera os SVGs animados do README do perfil ArandasDev.
//
// Uso (Node 20.11+, sem dependências):  node scripts/build-svgs.mjs
// Sobrescreve os arquivos em assets/. Textos, cores (objeto C) e tempos de
// animação ficam todos aqui; edite e rode de novo em vez de mexer nos SVGs.
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const OUT = process.argv[2] ?? join(import.meta.dirname, '..', 'assets');
mkdirSync(OUT, { recursive: true });

const C = {
  bg: '#0a0d12', grid: '#0f151d', line: '#1d2633', lane: '#121923', panel: '#0d1219',
  text: '#e6edf3', muted: '#8b949e', dim: '#3d4756',
  blue: '#7aa2ff', lav: '#c099ff', amber: '#ffb547', teal: '#4fd6be', green: '#7ee787', pink: '#ff7eb6',
};
const FONT = `ui-monospace,SFMono-Regular,'JetBrains Mono','Cascadia Code',Menlo,Consolas,'Liberation Mono',monospace`;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const p = (n) => `${+Math.min(100, Math.max(0, n)).toFixed(2)}%`;
const r2 = (n) => +n.toFixed(2);

function frame({ w, h, title, desc, css = '', defs = '', body }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="title desc">
<title id="title">${esc(title)}</title>
<desc id="desc">${esc(desc)}</desc>
<defs>
<pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="${C.grid}"/></pattern>
<filter id="glow" x="-150%" y="-150%" width="400%" height="400%"><feGaussianBlur stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
${defs}
</defs>
<style>
text{font-family:${FONT}}
${css}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
</style>
<rect width="${w}" height="${h}" rx="16" fill="${C.bg}"/>
<rect width="${w}" height="${h}" rx="16" fill="url(#grid)"/>
${body}
<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="15.5" fill="none" stroke="${C.line}"/>
</svg>
`;
}

const anim = (name, dur, extra = '') => `animation:${name} ${dur}s linear infinite${extra}`;

/** Ponto que percorre uma polilinha entre start% e end% do ciclo. Fica invisível fora disso. */
function travel(name, pts, start, end) {
  const segs = pts.slice(1).map((pt, i) => Math.hypot(pt[0] - pts[i][0], pt[1] - pts[i][1]));
  const total = segs.reduce((a, b) => a + b, 0);
  const T = ([x, y]) => `transform:translate(${r2(x)}px,${r2(y)}px)`;
  const f = [];
  if (start > 0.4) f.push(`0%,${p(start - 0.3)}{opacity:0;${T(pts[0])}}`);
  f.push(`${p(start)}{opacity:1;${T(pts[0])}}`);
  let acc = 0;
  segs.forEach((len, i) => {
    acc += len;
    f.push(`${p(start + ((end - start) * acc) / total)}{opacity:1;${T(pts[i + 1])}}`);
  });
  f.push(`${p(end + 0.3)},100%{opacity:0;${T(pts[pts.length - 1])}}`);
  return `@keyframes ${name}{${f.join('')}}`;
}

/** Brilho rápido nos instantes indicados (em % do ciclo). */
function flash(name, times, peak = 0.9, prop = 'opacity') {
  const f = [`0%{${prop}:0}`];
  for (const t of [...times].sort((a, b) => a - b)) {
    if (t > 2) f.push(`${p(t - 2)}{${prop}:0}`);
    f.push(`${p(t)}{${prop}:${peak}}`);
    f.push(`${p(t + 4)}{${prop}:0}`);
  }
  f.push(`100%{${prop}:0}`);
  return `@keyframes ${name}{${f.join('')}}`;
}

const txt = (x, y, s, { size = 14, fill = C.text, weight = 400, anchor = 'start', ls = 0, extra = '' } = {}) =>
  `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" font-weight="${weight}" text-anchor="${anchor}"${ls ? ` letter-spacing="${ls}"` : ''}${extra}>${s}</text>`;

/* ------------------------------------------------------------------ trace */
function trace() {
  const W = 860, H = 420, D = 9;
  const css = [];
  const body = [];

  // cabeçalho
  css.push(`@keyframes pend{0%,39%{opacity:1}40%,100%{opacity:0}}`);
  css.push(`@keyframes ok{0%,39.5%{opacity:0}41%,100%{opacity:1}}`);
  css.push(`@keyframes blink{0%,49%{opacity:1}50%,100%{opacity:.25}}`);
  body.push(`<circle cx="34" cy="31" r="4.5" fill="${C.amber}" opacity="0" style="${anim('pend', D)}"/>`);
  body.push(`<circle cx="34" cy="31" r="4.5" fill="${C.green}" filter="url(#glow)" style="${anim('ok', D)}"/>`);
  body.push(txt(48, 36, 'TRACE', { size: 12, fill: C.muted, weight: 700, ls: 2 }));
  body.push(txt(104, 36, '7f3a9b04e21c', { size: 12, fill: C.dim }));
  body.push(txt(W / 2, 36, `<tspan fill="${C.blue}" font-weight="700">GET</tspan> /emmanoel-vieira`, { size: 14, anchor: 'middle' }));
  body.push(`<g opacity="0" style="${anim('pend', D)}">${txt(W - 28, 36, `<tspan style="${anim('blink', 0.8)}">●</tspan> aguardando…`, { size: 13, fill: C.amber, anchor: 'end' })}</g>`);
  body.push(`<g style="${anim('ok', D)}">${txt(W - 28, 36, `<tspan font-weight="700">200 OK</tspan> · 42 ms`, { size: 13, fill: C.green, anchor: 'end' })}</g>`);
  body.push(`<path d="M0 56H${W}" stroke="${C.line}"/>`);

  // nome
  const nameX = 28, nameY = 118, nameW = 396;
  const nameText = (fill) => txt(nameX, nameY, 'Emmanoel Vieira', { size: 44, weight: 700, fill, ls: -0.5 });
  body.push(nameText(C.text));
  css.push(`@keyframes sweep{0%,40%{opacity:0;transform:translateX(0)}41%{opacity:1;transform:translateX(0)}56%{opacity:1;transform:translateX(640px)}57%,100%{opacity:0;transform:translateX(640px)}}`);
  body.push(`<g clip-path="url(#nameClip)"><rect x="-170" y="70" width="150" height="64" fill="url(#sweepG)" opacity="0" style="${anim('sweep', D)}"/></g>`);
  css.push(`@keyframes under{0%,40%{stroke-dashoffset:${nameW}}53%,100%{stroke-dashoffset:0}}`);
  body.push(`<path d="M${nameX} 136H${nameX + nameW}" stroke="url(#underG)" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="${nameW}" style="${anim('under', D)}"/>`);
  body.push(txt(nameX, 164, 'construo o caminho que a sua requisição percorre.', { size: 15, fill: C.muted }));

  // atributos do span (estilo OpenTelemetry)
  body.push(`<path d="M498 76V168" stroke="${C.line}"/>`);
  const attrs = [
    ['dev.role', 'back-end developer'],
    ['dev.stack', 'typescript · node.js'],
    ['dev.focus', 'apis · bots · integrações'],
    ['dev.edu', 'ADS · FIAP'],
  ];
  attrs.forEach(([k, v], i) => {
    body.push(txt(520, 92 + i * 23, k, { size: 12.5, fill: C.muted }));
    body.push(txt(618, 92 + i * 23, v, { size: 12.5, fill: C.text }));
  });
  body.push(`<path d="M0 184H${W}" stroke="${C.line}"/>`);

  // cascata de spans
  const t0 = 300, tw = 480, total = 42, req = 40; // req = % do ciclo que a requisição dura
  const xAt = (ms) => t0 + (tw * ms) / total;
  const tAt = (ms) => (req * ms) / total;
  body.push(txt(28, 206, 'SERVICE', { size: 10.5, fill: C.dim, weight: 700, ls: 1.5 }));
  body.push(txt(130, 206, 'SPAN', { size: 10.5, fill: C.dim, weight: 700, ls: 1.5 }));
  [0, 10, 20, 30, 40].forEach((ms) => {
    body.push(`<path d="M${r2(xAt(ms))} 214V322" stroke="${C.lane}" stroke-dasharray="2 4"/>`);
    body.push(txt(r2(xAt(ms)), 206, `${ms}${ms === 40 ? ' ms' : ''}`, { size: 10.5, fill: C.dim, anchor: 'middle' }));
  });
  const spans = [
    ['api-gateway', 'GET /emmanoel-vieira', 0, 42, C.blue],
    ['auth', 'verify jwt', 2, 6, C.lav],
    ['profile-svc', 'build profile', 6, 38, C.amber],
    ['postgres', 'SELECT skills', 12, 30, C.teal],
  ];
  spans.forEach(([svc, op, s, e, color], i) => {
    const y = 234 + i * 26;
    body.push(txt(28, y, svc, { size: 12.5, fill: color, weight: 700 }));
    body.push(txt(130, y, op, { size: 12.5, fill: C.muted }));
    body.push(`<rect x="${t0}" y="${y - 10}" width="${tw}" height="13" rx="3" fill="${C.lane}"/>`);
    css.push(`@keyframes bar${i}{0%,${p(tAt(s))}{transform:scaleX(0);opacity:1}${p(tAt(e))},90%{transform:scaleX(1);opacity:1}95%,100%{transform:scaleX(1);opacity:0}}`);
    body.push(`<rect x="${r2(xAt(s))}" y="${y - 10}" width="${r2(xAt(e) - xAt(s))}" height="13" rx="3" fill="${color}" style="transform-box:fill-box;transform-origin:0 50%;${anim(`bar${i}`, D)}"/>`);
    css.push(`@keyframes ms${i}{0%,${p(tAt(e) - 0.5)}{opacity:0}${p(tAt(e) + 1)},90%{opacity:1}95%,100%{opacity:0}}`);
    body.push(`<g style="${anim(`ms${i}`, D)}">${txt(W - 28, y, `${e - s} ms`, { size: 12.5, fill: C.text, anchor: 'end' })}</g>`);
  });
  css.push(`@keyframes cursor{0%{opacity:.9;transform:translateX(0)}${p(req)}{opacity:.9;transform:translateX(${tw}px)}${p(req + 2)},100%{opacity:0;transform:translateX(${tw}px)}}`);
  body.push(`<path d="M${t0} 214V322" stroke="${C.amber}" stroke-width="1.5" opacity="0" style="${anim('cursor', D)}"/>`);
  body.push(`<path d="M0 334H${W}" stroke="${C.line}"/>`);

  // mapa de serviços com o pacote viajando
  const my = 366;
  const nodes = [
    ['client', 60, C.muted],
    ['gateway', 245, C.blue],
    ['auth', 430, C.lav],
    ['profile-svc', 615, C.amber],
    ['postgres', 800, C.teal],
  ];
  const fwdEnd = 28, back = req;
  body.push(`<path d="M60 ${my}H800" stroke="${C.line}" stroke-width="2"/>`);
  nodes.forEach(([label, x, color], i) => {
    const frac = (x - 60) / 740;
    const times = [fwdEnd * frac];
    if (i < nodes.length - 1) times.push(fwdEnd + (back - fwdEnd) * (1 - frac));
    css.push(flash(`halo${i}`, times, 0.55));
    body.push(`<circle cx="${x}" cy="${my}" r="15" fill="${color}" opacity="0" style="${anim(`halo${i}`, D)}"/>`);
    body.push(`<circle cx="${x}" cy="${my}" r="6.5" fill="${C.bg}" stroke="${color}" stroke-width="2"/>`);
    body.push(txt(x, my + 30, label, { size: 12, fill: C.muted, anchor: 'middle' }));
  });
  css.push(travel('req', [[60, my], [800, my]], 0, fwdEnd));
  css.push(travel('res', [[800, my], [60, my]], fwdEnd + 0.4, back));
  body.push(`<circle r="5" fill="${C.amber}" filter="url(#glow)" opacity="0" style="${anim('req', D)}"/>`);
  body.push(`<circle r="5" fill="${C.green}" filter="url(#glow)" opacity="0" style="${anim('res', D)}"/>`);

  const defs = `<clipPath id="nameClip">${nameText('#fff')}</clipPath>
<linearGradient id="sweepG" x1="0" x2="1"><stop offset="0" stop-color="${C.amber}" stop-opacity="0"/><stop offset=".5" stop-color="${C.amber}" stop-opacity=".95"/><stop offset="1" stop-color="${C.amber}" stop-opacity="0"/></linearGradient>
<linearGradient id="underG" x1="0" x2="1"><stop offset="0" stop-color="${C.amber}"/><stop offset="1" stop-color="${C.teal}"/></linearGradient>`;

  return frame({
    w: W, h: H, defs, css: css.join('\n'), body: body.join('\n'),
    title: 'Emmanoel Vieira — trace de uma requisição',
    desc: 'Uma requisição GET /emmanoel-vieira atravessa api-gateway, auth, profile-svc e postgres; as barras de span crescem em cascata e a resposta volta com 200 OK em 42 ms. Emmanoel Vieira, desenvolvedor back-end: TypeScript, Node.js, APIs, bots e integrações. ADS pela FIAP.',
  });
}

/* ------------------------------------------------------------------ stack */
function stack() {
  const W = 860, H = 336, D = 8;
  const css = [];
  const body = [];
  const cols = [
    ['lang', 'linguagens', C.blue, ['TypeScript', 'JavaScript', 'C#', 'SQL']],
    ['runtime', 'frameworks', C.amber, ['Node.js', 'NestJS', 'Fastify', 'Next.js', '.NET']],
    ['data', 'persistência', C.teal, ['PostgreSQL', 'Prisma', 'Redis', 'MongoDB', 'SQLite']],
    ['infra', 'entrega', C.lav, ['Docker', 'GitHub Actions', 'Azure', 'Jest · Vitest']],
  ];
  const bx = [28, 236, 444, 652], bw = 180, busY = 64, boxY = 84, boxH = 222, sweepEnd = 50;
  const atX = (x) => (sweepEnd * (x - 28)) / (W - 56);

  body.push(`<circle cx="34" cy="31" r="4.5" fill="${C.green}" filter="url(#glow)"/>`);
  body.push(txt(48, 36, 'SERVICE MAP', { size: 12, fill: C.muted, weight: 700, ls: 2 }));
  body.push(txt(W - 28, 36, `4 camadas · health <tspan fill="${C.green}" font-weight="700">ok</tspan>`, { size: 13, fill: C.muted, anchor: 'end' }));
  body.push(`<path d="M28 ${busY}H${W - 28}" stroke="${C.line}" stroke-width="2"/>`);

  cols.forEach(([name, sub, color, items], c) => {
    const x = bx[c], cx = x + bw / 2, tc = atX(cx);
    css.push(flash(`con${c}`, [tc], 1));
    body.push(`<path d="M${cx} ${busY}V${boxY}" stroke="${C.line}" stroke-width="2"/>`);
    body.push(`<path d="M${cx} ${busY}V${boxY}" stroke="${color}" stroke-width="2" opacity="0" style="${anim(`con${c}`, D)}"/>`);
    body.push(`<rect x="${x}" y="${boxY}" width="${bw}" height="${boxH}" rx="10" fill="${C.panel}" stroke="${C.line}"/>`);
    css.push(flash(`edge${c}`, [tc + 1], 0.9));
    body.push(`<rect x="${x}" y="${boxY}" width="${bw}" height="${boxH}" rx="10" fill="none" stroke="${color}" opacity="0" style="${anim(`edge${c}`, D)}"/>`);
    body.push(txt(x + 18, boxY + 30, name, { size: 14, fill: color, weight: 700 }));
    body.push(txt(x + bw - 16, boxY + 30, sub, { size: 11, fill: C.dim, anchor: 'end' }));
    body.push(`<path d="M${x + 18} ${boxY + 44}H${x + bw - 16}" stroke="${C.line}"/>`);
    items.forEach((it, j) => {
      const y = boxY + 72 + j * 30, t = tc + 2 + j * 1.6;
      css.push(`@keyframes it${c}_${j}{0%,${p(t)}{fill:${C.dim}}${p(t + 0.8)},90%{fill:${color}}96%,100%{fill:${C.dim}}}`);
      css.push(`@keyframes tx${c}_${j}{0%,${p(t)}{fill:${C.muted}}${p(t + 0.8)},90%{fill:${C.text}}96%,100%{fill:${C.muted}}}`);
      body.push(`<circle cx="${x + 24}" cy="${y - 5}" r="4" fill="${color}" style="${anim(`it${c}_${j}`, D)}"/>`);
      body.push(txt(x + 38, y, esc(it), { size: 14.5, fill: C.text, extra: ` style="${anim(`tx${c}_${j}`, D)}"` }));
    });
  });
  css.push(travel('pulse', [[28, busY], [W - 28, busY]], 0, sweepEnd));
  body.push(`<circle r="5" fill="${C.amber}" filter="url(#glow)" opacity="0" style="${anim('pulse', D)}"/>`);
  body.push(txt(W / 2, H - 12, 'health check a cada requisição · a stack que eu uso no dia a dia', { size: 11.5, fill: C.dim, anchor: 'middle' }));

  return frame({
    w: W, h: H, css: css.join('\n'), body: body.join('\n'),
    title: 'Stack de Emmanoel Vieira',
    desc: 'Mapa de serviços com quatro camadas. Linguagens: TypeScript, JavaScript, C#, SQL. Frameworks: Node.js, NestJS, Fastify, Next.js, .NET. Persistência: PostgreSQL, Prisma, Redis, MongoDB, SQLite. Entrega: Docker, GitHub Actions, Azure, Jest e Vitest.',
  });
}

/* ------------------------------------------------------------------ cards */
function node(x, y, label, color, w = 84, h = 30, sub) {
  return `<rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="7" fill="${C.bg}" stroke="${color}" stroke-opacity=".7"/>` +
    txt(x, sub ? y - 1 : y + 4, esc(label), { size: 11.5, fill: C.text, anchor: 'middle', weight: 700 }) +
    (sub ? txt(x, y + 11, esc(sub), { size: 9.5, fill: C.muted, anchor: 'middle' }) : '');
}
const edge = (pts) => `<path d="M${pts.map((q) => q.join(' ')).join('L')}" fill="none" stroke="${C.line}" stroke-width="1.5"/>`;

function card({ slug, method, color, route, title, lines, tags, diagram, caption, desc }) {
  const W = 860, H = 212, D = 6;
  const body = [];
  const css = [];
  const mw = method.length * 8.4 + 18;
  body.push(`<rect x="28" y="22" width="${mw}" height="24" rx="5" fill="${color}" fill-opacity=".14" stroke="${color}" stroke-opacity=".45"/>`);
  body.push(txt(28 + mw / 2, 39, method, { size: 13, fill: color, weight: 700, anchor: 'middle' }));
  body.push(txt(28 + mw + 12, 40, esc(route), { size: 16, fill: C.text, weight: 700 }));
  body.push(txt(28, 80, esc(title), { size: 19, fill: C.text, weight: 700 }));
  lines.forEach((l, i) => body.push(txt(28, 108 + i * 21, esc(l), { size: 13.5, fill: C.muted })));
  let tx = 28;
  tags.forEach((t) => {
    const tw = t.length * 7.2 + 18;
    body.push(`<rect x="${tx}" y="164" width="${tw}" height="24" rx="12" fill="${C.lane}" stroke="${C.line}"/>`);
    body.push(txt(tx + tw / 2, 180, esc(t), { size: 12, fill: C.text, anchor: 'middle' }));
    tx += tw + 8;
  });
  // painel do diagrama
  body.push(`<rect x="492" y="20" width="340" height="172" rx="10" fill="${C.panel}" stroke="${C.line}"/>`);
  const d = diagram(D);
  css.push(...d.css);
  body.push(...d.body);
  body.push(txt(662, 182, esc(caption), { size: 10.5, fill: C.dim, anchor: 'middle' }));
  return [`project-${slug}.svg`, frame({ w: W, h: H, css: css.join('\n'), body: body.join('\n'), title: `${route} — ${title}`, desc })];
}

const restaurant = () => card({
  slug: 'restaurant-api', method: 'GET', color: C.amber, route: '/restaurant-api',
  title: 'API multi-tenant para restaurantes',
  lines: ['Cardápio, pedidos e delivery para milhares de', 'restaurantes, cada um isolado do outro. Clean', 'Architecture e segurança em primeiro lugar.'],
  tags: ['NestJS', 'Prisma', 'PostgreSQL', 'JWT', 'Docker'],
  caption: 'cada tenant chega na sua própria raia',
  desc: 'restaurant-api: API REST multi-tenant para restaurantes com NestJS, Prisma e PostgreSQL. Diagrama: pedidos de três restaurantes passam pelo tenant guard e chegam cada um na sua raia do banco.',
  diagram: (D) => {
    const css = [], body = [];
    const tenants = [['pizzaria', 56, C.amber], ['burger', 100, C.pink], ['café', 144, C.teal]];
    const api = [668, 100], dbx = 784;
    tenants.forEach(([, y, color]) => {
      body.push(edge([[580, y], [626, 100]]));
      body.push(edge([[710, 100], [744, y]]));
      body.push(`<rect x="744" y="${y - 9}" width="70" height="18" rx="4" fill="${color}" fill-opacity=".12" stroke="${color}" stroke-opacity=".5"/>`);
    });
    tenants.forEach(([, y, color], i) => {
      const s = i * 30;
      css.push(travel(`t${i}`, [[580, y], [626, 100], [710, 100], [744, y], [806, y]], s, s + 32));
      body.push(`<circle r="4" fill="${color}" filter="url(#glow)" opacity="0" style="${anim(`t${i}`, D)}"/>`);
    });
    tenants.forEach(([label, y, color]) => body.push(node(544, y, label, color, 72, 26)));
    body.push(node(api[0], api[1], 'API', C.amber, 84, 40, 'tenant guard'));
    body.push(txt(dbx - 5, 36, 'postgres', { size: 10, fill: C.muted, anchor: 'middle' }));
    return { css, body };
  },
});

const squad = () => card({
  slug: 'squadbot', method: 'POST', color: C.blue, route: '/squadbot',
  title: 'A memória compartilhada do squad',
  lines: ['Bot de Discord que junta o que o time espalha', 'em mensagens, notas e planilhas, e um', 'dashboard web para ver tudo de cima.'],
  tags: ['discord.js', 'Fastify', 'SQLite', 'Next.js', 'Vitest'],
  caption: 'mensagens viram memória consultável',
  desc: 'squadbot: bot de Discord com dashboard web, feito com discord.js, Fastify, SQLite, Next.js e Vitest. Diagrama: mensagens saem do Discord, passam pelo bot, são guardadas no SQLite e aparecem no dashboard.',
  diagram: (D) => {
    const css = [], body = [];
    const A = [548, 68], B = [662, 68], S = [776, 68], Dash = [776, 140], Squad = [548, 140];
    body.push(edge([A, B]), edge([B, S]), edge([S, Dash]), edge([Dash, Squad]));
    const colors = [C.blue, C.amber, C.green];
    colors.forEach((color, i) => {
      const s = i * 22;
      css.push(travel(`m${i}`, [A, B, S], s, s + 24));
      body.push(`<circle r="4" fill="${color}" filter="url(#glow)" opacity="0" style="${anim(`m${i}`, D)}"/>`);
    });
    css.push(travel('read', [S, Dash, Squad], 70, 94));
    body.push(`<circle r="4" fill="${C.lav}" filter="url(#glow)" opacity="0" style="${anim('read', D)}"/>`);
    body.push(node(...A, 'discord', C.blue), node(...B, 'squadbot', C.blue), node(...S, 'sqlite', C.teal));
    body.push(node(...Dash, 'dashboard', C.lav, 90), node(...Squad, 'o squad', C.muted));
    return { css, body };
  },
});

const ndev = () => card({
  slug: 'ndev-chatbot', method: 'PUT', color: C.lav, route: '/ndev-chatbot',
  title: 'Um bot, duas plataformas',
  lines: ['Motor de comandos que não sabe onde está', 'rodando: Discord e Twitch são só adaptadores.', 'Painel web, API e tokens cifrados com AES-GCM.'],
  tags: ['Fastify', 'discord.js', 'Twurple', 'Redis', 'Prisma'],
  caption: 'mesma lógica, qualquer plataforma',
  desc: 'ndev-chatbot: bot para Discord e Twitch com um motor de comandos independente de plataforma, API em Fastify, painel em Next.js, Redis e Prisma. Diagrama: eventos do Discord e da Twitch convergem no core engine e seguem para o Redis e para o painel.',
  diagram: (D) => {
    const css = [], body = [];
    const Dc = [546, 58], Tw = [546, 142], Core = [664, 100], Bus = [782, 58], Panel = [782, 142];
    body.push(edge([Dc, [600, 58], [620, 100]]), edge([Tw, [600, 142], [620, 100]]), edge([[708, 100], [728, 58], Bus]), edge([[708, 100], [728, 142], Panel]));
    css.push(travel('dc', [Dc, [600, 58], [620, 100], [708, 100], [728, 58], Bus], 0, 34));
    css.push(travel('tw', [Tw, [600, 142], [620, 100], [708, 100], [728, 142], Panel], 40, 74));
    body.push(`<circle r="4" fill="${C.blue}" filter="url(#glow)" opacity="0" style="${anim('dc', D)}"/>`);
    body.push(`<circle r="4" fill="${C.lav}" filter="url(#glow)" opacity="0" style="${anim('tw', D)}"/>`);
    body.push(node(...Dc, 'discord', C.blue), node(...Tw, 'twitch', C.lav));
    body.push(node(...Core, 'core', C.amber, 88, 40, 'engine'));
    body.push(node(...Bus, 'redis bus', C.pink, 90), node(...Panel, 'painel', C.teal, 90));
    css.push(flash('core', [17, 57], 1));
    body.push(`<rect x="620" y="80" width="88" height="40" rx="7" fill="none" stroke="${C.amber}" stroke-width="2" filter="url(#glow)" opacity="0" style="${anim('core', D)}"/>`);
    return { css, body };
  },
});

/* --------------------------------------------------------------- response */
function response() {
  const W = 860, H = 314;
  const k = (s) => `<tspan fill="${C.blue}">"${s}"</tspan>`;
  const v = (s) => `<tspan fill="${C.teal}">"${esc(s)}"</tspan>`;
  const pu = (s) => `<tspan fill="${C.muted}">${s}</tspan>`;
  const lines = [
    `<tspan fill="${C.muted}">HTTP/1.1</tspan> <tspan fill="${C.green}" font-weight="700">200 OK</tspan>`,
    `${pu('content-type:')} application/json`,
    `${pu('x-trace-id:')} 7f3a9b04e21c`,
    '',
    pu('{'),
    `  ${k('nome')}${pu(':')} ${v('Emmanoel Vieira')}${pu(',')}`,
    `  ${k('papel')}${pu(':')} ${v('desenvolvedor back-end')}${pu(',')}`,
    `  ${k('email')}${pu(':')} ${v('arandas.dev@gmail.com')}${pu(',')}`,
    `  ${k('linkedin')}${pu(':')} ${v('linkedin.com/in/arandasdev')}${pu(',')}`,
    `  ${k('aberto_a')}${pu(': [')}${v('back-end')}${pu(', ')}${v('freelance')}${pu(', ')}${v('colaboração')}${pu(']')}`,
    pu('}'),
  ];
  const css = [`@keyframes in{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}`, `@keyframes cur{0%,49%{opacity:1}50%,100%{opacity:0}}`];
  const body = [];
  body.push(txt(W - 24, H - 22, '200', { size: 150, fill: C.lane, weight: 700, anchor: 'end', ls: -6 }));
  lines.forEach((l, i) => {
    if (!l) return;
    body.push(`<text x="32" y="${44 + i * 23}" font-size="15" fill="${C.text}" xml:space="preserve" style="animation:in .35s ease-out ${r2(0.3 + i * 0.22)}s both">${l}</text>`);
  });
  const last = 44 + (lines.length - 1) * 23;
  body.push(`<rect x="44" y="${last - 13}" width="9" height="17" fill="${C.amber}" style="animation:cur 1s steps(1) ${r2(0.3 + lines.length * 0.22)}s infinite both"/>`);
  return frame({
    w: W, h: H, css: css.join('\n'), body: body.join('\n'),
    title: 'Resposta 200 OK com o contato de Emmanoel Vieira',
    desc: 'Resposta HTTP 200 em JSON: nome Emmanoel Vieira, desenvolvedor back-end, email arandas.dev@gmail.com, LinkedIn linkedin.com/in/arandasdev, aberto a back-end, freelance e colaboração.',
  });
}

const files = [['trace.svg', trace()], ['stack.svg', stack()], restaurant(), squad(), ndev(), ['response.svg', response()]];
for (const [name, svg] of files) {
  writeFileSync(join(OUT, name), svg);
  console.log(`${name}  ${(Buffer.byteLength(svg) / 1024).toFixed(1)} KB`);
}
