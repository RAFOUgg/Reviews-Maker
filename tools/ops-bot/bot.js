// Terpologie Ops — bot Discord de pilotage du robot de développement.
// Tourne sur le VPS sous l'utilisateur `hermes`. Il ne touche jamais la prod :
// Claude travaille dans WORK_DIR (clone dédié), ne pousse jamais sur main, ne déploie jamais.
import {
  Client, GatewayIntentBits, ChannelType, Events, SlashCommandBuilder, ThreadAutoArchiveDuration,
  EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder,
  GuildScheduledEventEntityType, GuildScheduledEventPrivacyLevel,
} from 'discord.js'
import { spawn, execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'

const HOME = os.homedir()
const env = (k, d) => process.env[k] ?? d
const TOKEN = env('DISCORD_TOKEN')
const GUILD_ID = env('GUILD_ID')
const OWNER_ID = env('OWNER_ID') // seul utilisateur autorisé à parler au bot
const WORK_DIR = env('WORK_DIR', path.join(HOME, 'Reviews-Maker-jour'))
const REPORTS_DIR = env('REPORTS_DIR', path.join(HOME, 'rapports'))
const REPO = env('GITHUB_REPO', 'RAFOUgg/Reviews-Maker')
const PLAN_PATH = env('PLAN_PATH', 'docs/plan/mvp-refonte.md')
const HEALTH_URL = env('HEALTH_URL', 'https://terpologie.eu/api/health')
const STATE_FILE = env('STATE_FILE', path.join(HOME, '.ops-bot-state.json'))
const CLAUDE_BIN = env('CLAUDE_BIN', path.join(HOME, '.local/bin/claude'))
const CLAUDE_TIMEOUT_MS = Number(env('CLAUDE_TIMEOUT_MS', 30 * 60 * 1000))
// Modèle principal des conversations ; les sous-agents (~/.claude/agents) ont le leur (Haiku/Sonnet).
const CLAUDE_MODEL = env('CLAUDE_MODEL', 'sonnet')
const RUN_LOT = env('RUN_LOT', path.join(HOME, 'run-lot.sh'))
// Écrit toutes les 5 min par ~/.hermes/scripts/dashboard_build.py (même source que la page web).
const DASHBOARD_JSON = env('DASHBOARD_JSON', path.join(HOME, '.hermes/dashboard.json'))
const DASHBOARD_URL = env('DASHBOARD_URL', 'https://terpologie.eu/hermes/')
const NIGHT_HOUR_UTC = Number(env('NIGHT_HOUR_UTC', 2)) // heure du cron run-lot.sh
const REMIND_EVERY_MS = 6 * 3600 * 1000 // relance d'une question restée sans réponse

if (!TOKEN || !GUILD_ID || !OWNER_ID) {
  console.error('DISCORD_TOKEN, GUILD_ID et OWNER_ID sont obligatoires (voir .env.example)')
  process.exit(1)
}

// ── Organisation du serveur ─────────────────────────────────────────────────
// mode : 'plan' = lecture seule (Claude n'écrit rien) ; 'edit' = peut coder sur une branche ; null = salon réservé au bot.
// forum : salon Forum (un post = une conversation ou un rapport) au lieu d'un salon texte.
const LAYOUT = {
  '📋 PILOTAGE': { pannel: null, plan: null, questions: null, brainstorming: 'plan' },
  '🗓 PLANNING': { 'tâches': null, 'journal-planning': null },
  '🛠 DEV': { dev: 'edit', 'front-end': 'edit', 'back-end': 'edit', da: 'edit' },
  '🚀 PROD': { prod: 'plan', logs: null },
  '🗄 ARCHIVES': { archives: null },
}
const FORUMS = new Set(['dev', 'front-end', 'back-end', 'da'])
const FORUM_TAGS = [
  { name: 'Avancement', emoji: '🚧' }, { name: 'Raisonnement', emoji: '🧠' }, { name: 'Question', emoji: '❓' },
  { name: 'Résolu', emoji: '✅' }, { name: 'Rapport de nuit', emoji: '🌙' },
]
const MODE_BY_CHANNEL = Object.fromEntries(Object.values(LAYOUT).flatMap(c => Object.entries(c)))

const QUESTION_FORMAT = `Si tu as besoin d'une décision du propriétaire, termine ta réponse par, pour CHAQUE question :
QUESTION : <la question, une phrase>
OPTIONS : <choix 1> | <choix 2> | <choix 3>   (2 à 8 choix courts, ta recommandation en premier suivie de « (recommandé) »)
Le propriétaire répondra avec des boutons sur Discord ; sa réponse te sera renvoyée dans cette conversation.`

const RULES = `Tu es le développeur de Reviews-Maker (Terpologie), piloté depuis Discord par le propriétaire du projet.
Réponds en français, de façon concise (le message est lu sur téléphone). Dis où tu en es (avancement), pourquoi tu fais tes choix (raisonnement), ce qui reste.
Lis CLAUDE.md (§ Conventions & pièges) avant de modifier du code.
INTERDITS : pousser sur main ; lancer deploy.sh ; ssh ; sudo ; toucher /home/ubuntu ; écrire dans une base de prod.
Tout changement de code se fait sur une branche dédiée (feat/… ou fix/…), poussée puis proposée en PR.
${QUESTION_FORMAT}
ÉCONOMIE (quota de l'abonnement) : délègue aux sous-agents — recherche dans le code → \`eclaireur\` ; build, lint, sondes → \`verificateur\` ; relecture du diff avant une PR → \`relecteur\`. Ne relis pas toi-même ce qu'un sous-agent a résumé.`

const ALLOWED_TOOLS = 'Agent,Task,Read,Edit,Write,Glob,Grep,WebSearch,WebFetch,Bash(git:*),Bash(npm:*),Bash(npx:*),Bash(node:*),Bash(curl:*),Bash(printf:*),Bash(ls:*),Bash(cat:*),Bash(grep:*),Bash(sed:*),Bash(head:*),Bash(tail:*),Bash(wc:*),Bash(mkdir:*)'
const DISALLOWED_TOOLS = 'Bash(git push origin main:*),Bash(git push -f:*),Bash(git push --force:*),Bash(ssh:*),Bash(sudo:*),Bash(bash deploy.sh:*),Bash(./deploy.sh:*),Bash(rm -rf:*)'

// ── État persistant ─────────────────────────────────────────────────────────
const state = (() => {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) } catch { return {} }
})()
state.sessions ??= {} // threadId -> claude session_id
state.reports ??= {} // fichier -> { offset, threadId }
state.planHash ??= null
state.questions ??= {} // qid -> { text, options, postId, originId, origin, answered, answer, askedAt, lastPing }
state.panel ??= { messageId: null, view: 'activite' }
state.events ??= {} // lotId -> guildScheduledEventId (événements créés par le bot)
state.lotStatus ??= {} // lotId -> dernier statut connu (pour journaliser les changements)
state.taskMessages ??= [] // messages du bot dans #tâches
const saveState = () => fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2))

// ── Utilitaires ─────────────────────────────────────────────────────────────
const chunk = (text, size = 1900) => {
  const out = []
  let rest = String(text || '').trim() || '(réponse vide)'
  while (rest.length > size) {
    let cut = rest.lastIndexOf('\n', size)
    if (cut < size / 2) cut = size
    out.push(rest.slice(0, cut))
    rest = rest.slice(cut).trimStart()
  }
  out.push(rest)
  return out
}
const send = async (target, text) => { for (const part of chunk(text)) await target.send(part) }
const clip = (s, n) => (String(s ?? '').length > n ? String(s).slice(0, n - 1) + '…' : String(s ?? ''))
const parisNow = () => new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })
const journal = (text) => channels['journal-planning']?.send(`🕒 ${parisNow()} — ${text}`).catch(() => {})

const githubToken = () => {
  try {
    const out = execFileSync('git', ['credential', 'fill'], { cwd: WORK_DIR, input: 'protocol=https\nhost=github.com\n\n' }).toString()
    return out.match(/^password=(.+)$/m)?.[1]
  } catch { return null }
}
const gh = async (url, opts = {}) => {
  const res = await fetch(`https://api.github.com${url}`, {
    ...opts,
    headers: { Authorization: `Bearer ${githubToken()}`, Accept: 'application/vnd.github+json', 'User-Agent': 'terpologie-ops-bot', ...(opts.headers || {}) },
  })
  if (!res.ok) throw new Error(`GitHub ${res.status} ${url}`)
  return res.json()
}

// ── Claude : une seule exécution à la fois (quota Pro + un seul clone de travail) ──
let busy = null
const queue = []
const runClaude = (prompt, { mode, sessionId }) => new Promise((resolve) => {
  const args = ['-p', prompt, '--output-format', 'json', '--model', CLAUDE_MODEL]
  if (mode === 'plan') args.push('--permission-mode', 'plan')
  else args.push('--permission-mode', 'acceptEdits', '--allowedTools', ALLOWED_TOOLS, '--disallowedTools', DISALLOWED_TOOLS)
  if (sessionId) args.push('--resume', sessionId)
  const child = spawn(CLAUDE_BIN, args, { cwd: WORK_DIR, env: { ...process.env, PATH: `${HOME}/.local/bin:${process.env.PATH}` } })
  let out = '', err = ''
  const timer = setTimeout(() => child.kill('SIGTERM'), CLAUDE_TIMEOUT_MS)
  child.stdout.on('data', d => { out += d })
  child.stderr.on('data', d => { err += d })
  child.on('close', (code) => {
    clearTimeout(timer)
    try {
      const j = JSON.parse(out)
      resolve({ text: j.result ?? '(pas de texte)', sessionId: j.session_id, error: j.is_error })
    } catch {
      resolve({ text: `⚠️ Claude s'est arrêté (code ${code}).\n${(err || out).slice(-1500)}`, sessionId, error: true })
    }
  })
})
const enqueue = (job) => new Promise((resolve) => { queue.push({ job, resolve }); pump() })
const pump = async () => {
  if (busy || !queue.length) return
  const { job, resolve } = queue.shift()
  busy = job.label
  try { resolve(await job.run()) } finally { busy = null; pump() }
}

// ── Client Discord ──────────────────────────────────────────────────────────
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildScheduledEvents] })
const channels = {} // nom -> salon (texte ou forum)
let guild = null

const ensureLayout = async (g) => {
  const all = await g.channels.fetch()
  for (const [catName, chans] of Object.entries(LAYOUT)) {
    let cat = all.find(c => c?.type === ChannelType.GuildCategory && c.name === catName)
    if (!cat) cat = await g.channels.create({ name: catName, type: ChannelType.GuildCategory })
    for (const name of Object.keys(chans)) {
      const wanted = FORUMS.has(name) ? ChannelType.GuildForum : ChannelType.GuildText
      let ch = all.find(c => c?.type === wanted && c.name === name)
      // Un salon texte du même nom (ancienne organisation) est rangé dans ARCHIVES, jamais supprimé.
      const legacy = wanted === ChannelType.GuildForum && all.find(c => c?.type === ChannelType.GuildText && c.name === name)
      if (legacy) await legacy.edit({ name: `ancien-${name}` }).catch(() => {})
      if (!ch) {
        ch = await g.channels.create({
          name, type: wanted, parent: cat.id,
          ...(wanted === ChannelType.GuildForum ? { availableTags: FORUM_TAGS, topic: 'Avancement, raisonnements et questions de Claude. Un post = un sujet ; chaque question a son propre post.' } : {}),
        })
      } else if (ch.parentId !== cat.id) await ch.setParent(cat.id)
      channels[name] = ch
    }
  }
  const archives = all.find(c => c?.type === ChannelType.GuildCategory && c.name === '🗄 ARCHIVES')
  for (const c of (await g.channels.fetch()).values()) {
    if (c?.name?.startsWith('ancien-') && archives && c.parentId !== archives.id) await c.setParent(archives.id).catch(() => {})
  }
}
const tagId = (forum, name) => forum?.availableTags?.find(t => t.name === name)?.id

const COMMANDS = [
  new SlashCommandBuilder().setName('statut').setDescription('État du robot, de la prod et des PR ouvertes'),
  new SlashCommandBuilder().setName('plan').setDescription('Republier le plan et les tâches'),
  new SlashCommandBuilder().setName('lot').setDescription('Changer le statut d\'un lot du plan (commit sur main du seul fichier du plan)')
    .addStringOption(o => o.setName('id').setDescription('ex. L18').setRequired(true))
    .addStringOption(o => o.setName('statut').setDescription('nouveau statut').setRequired(true)
      .addChoices(...['à faire', 'prêt', 'fait'].map(s => ({ name: s, value: s })))),
  new SlashCommandBuilder().setName('go').setDescription('Lancer tout de suite le robot sur le premier lot « prêt » (sans attendre la nuit)'),
  new SlashCommandBuilder().setName('questions').setDescription('Lister les questions de Claude encore sans réponse'),
  new SlashCommandBuilder().setName('archiver').setDescription('Archiver ce fil et le référencer dans #archives'),
  new SlashCommandBuilder().setName('oublier').setDescription('Repartir d\'une conversation Claude vierge dans ce fil'),
]

// ── Plan ────────────────────────────────────────────────────────────────────
const fetchPlan = async () => {
  const f = await gh(`/repos/${REPO}/contents/${PLAN_PATH}?ref=main`)
  return { text: Buffer.from(f.content, 'base64').toString('utf8'), sha: f.sha }
}
const ICON = (s) => s.startsWith('fait') ? '✅' : s.startsWith('prêt') ? '🟢' : /en cours/i.test(s) ? '⏳' : s.startsWith('PR') ? '🔍' : s.includes('⚠') ? '⛔' : '⬜'
// Lots détaillés : id, titre, statut, et le corps du lot (sa documentation dans le plan).
const parseLots = (md) => {
  const lots = []
  const parts = md.split(/^### /m).slice(1)
  for (const p of parts) {
    const [head, ...rest] = p.split(/\r?\n/)
    const m = head.match(/^(L\w+)\s*[—-]\s*(.+)$/)
    if (!m) continue
    const body = rest.join('\n').split(/^## /m)[0]
    const status = body.match(/^Statut : (.+)$/m)?.[1]?.trim() ?? '—'
    const doc = body.replace(/^Statut : .+$/m, '').trim()
    lots.push({ id: m[1], title: m[2].trim(), status, doc })
  }
  return lots
}
const summarizePlan = (md) => {
  const lines = []
  let lot = null
  for (const l of md.split(/\r?\n/)) {
    if (l.startsWith('## ')) lines.push(`\n__**${l.slice(3)}**__`)
    else if (l.startsWith('### ')) lot = l.slice(4)
    else if (lot && l.startsWith('Statut :')) {
      const s = l.slice(8).trim()
      lines.push(`${ICON(s)} **${lot}** — ${s.slice(0, 140)}`)
      lot = null
    }
  }
  return `🗺️ **Plan MVP** (mis à jour ${parisNow()})\n🟢 prêt = le robot de nuit le prend · 🔍 PR à relire · ⛔ bloqué par une info humaine\n${lines.join('\n')}`
}
const publishPlan = async (force = false) => {
  const { text } = await fetchPlan()
  const hash = crypto.createHash('sha1').update(text).digest('hex')
  if (!force && hash === state.planHash) return
  const ch = channels.plan
  const old = await ch.messages.fetch({ limit: 50 })
  for (const m of old.filter(m => m.author.id === client.user.id).values()) await m.delete().catch(() => {})
  await send(ch, summarizePlan(text))
  const lots = parseLots(text)
  await publishTasks(lots)
  await logLotChanges(lots)
  await syncEvents(lots)
  state.planHash = hash; saveState()
}
const setLotStatus = async (id, statut, who) => {
  const { text, sha } = await fetchPlan()
  const re = new RegExp(`(### ${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b[^\\n]*\\n)Statut : [^\\r\\n]*`)
  if (!re.test(text)) throw new Error(`lot ${id} introuvable dans le plan`)
  const next = text.replace(re, `$1Statut : ${statut}`)
  await gh(`/repos/${REPO}/contents/${PLAN_PATH}`, {
    method: 'PUT',
    body: JSON.stringify({ message: `docs(plan): ${id} → ${statut} (via Discord, ${who})`, content: Buffer.from(next).toString('base64'), sha, branch: 'main' }),
  })
}

// ── Planning : #tâches (tous les lots, documentés), journal, événements Discord ──
const publishTasks = async (lots) => {
  const ch = channels['tâches']
  for (const id of state.taskMessages) await ch.messages.delete(id).catch(() => {})
  state.taskMessages = []
  const groups = [
    ['⏳ En cours', l => /en cours/i.test(l.status)], ['🟢 Prêts (file du robot)', l => l.status.startsWith('prêt') && !/en cours/i.test(l.status)],
    ['🔍 À relire', l => l.status.startsWith('PR')], ['⬜ À faire', l => !/^(fait|prêt|PR)/.test(l.status) && !/en cours/i.test(l.status)],
    ['✅ Faits', l => l.status.startsWith('fait')],
  ]
  const head = await ch.send(`🗂 **Tâches du plan** — ${lots.length} lots, mis à jour ${parisNow()}. Source : \`${PLAN_PATH}\` sur main. Ordre des 🟢 = ordre de passage du robot (1 lot par nuit, voir les événements du serveur).`)
  state.taskMessages.push(head.id)
  for (const [title, pick] of groups) {
    const items = lots.filter(pick)
    if (!items.length) continue
    // Un embed par lot (titre + statut + documentation), par paquets de 10 (limite Discord).
    for (let i = 0; i < items.length; i += 10) {
      const embeds = items.slice(i, i + 10).map(l => new EmbedBuilder()
        .setTitle(clip(`${ICON(l.status)} ${l.id} — ${l.title}`, 250))
        .setDescription(clip(`**Statut :** ${l.status}\n\n${l.doc || '_(pas de description dans le plan)_'}`, 1500))
        .setColor(ICON(l.status) === '✅' ? 0x22c55e : ICON(l.status) === '⏳' ? 0xf59e0b : ICON(l.status) === '🟢' ? 0x8b5cf6 : 0x64748b))
      const m = await ch.send({ content: i === 0 ? `**${title}** (${items.length})` : undefined, embeds })
      state.taskMessages.push(m.id)
    }
  }
}
const logLotChanges = async (lots) => {
  const first = !Object.keys(state.lotStatus).length
  for (const l of lots) {
    const prev = state.lotStatus[l.id]
    if (!first && prev !== l.status) await journal(prev ? `**${l.id}** : « ${clip(prev, 80)} » → « ${clip(l.status, 120)} »` : `nouveau lot **${l.id}** — ${l.title} (${clip(l.status, 80)})`)
    state.lotStatus[l.id] = l.status
  }
  if (first) await journal(`planning initialisé : ${lots.length} lots suivis.`)
}
const nextNights = (n) => {
  const out = []
  const d = new Date()
  d.setUTCHours(NIGHT_HOUR_UTC, 0, 0, 0)
  if (d <= new Date(Date.now() + 10 * 60 * 1000)) d.setUTCDate(d.getUTCDate() + 1)
  for (let i = 0; i < n; i++) { out.push(new Date(d)); d.setUTCDate(d.getUTCDate() + 1) }
  return out
}
// Un événement par lot « prêt », dans l'ordre du plan, une nuit chacun (c'est la règle de run-lot.sh).
const syncEvents = async (lots) => {
  const ready = lots.filter(l => l.status.startsWith('prêt') && !/en cours/i.test(l.status)).slice(0, 7)
  const nights = nextNights(ready.length)
  const keep = new Set()
  for (const [i, l] of ready.entries()) {
    keep.add(l.id)
    const start = nights[i], end = new Date(start.getTime() + 4 * 3600 * 1000)
    const data = {
      name: clip(`🌙 ${l.id} — ${l.title}`, 100),
      scheduledStartTime: start, scheduledEndTime: end,
      privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly, entityType: GuildScheduledEventEntityType.External,
      entityMetadata: { location: 'VPS — robot de nuit (run-lot.sh)' },
      description: clip(`Statut : ${l.status}\n\n${l.doc}`, 1000),
    }
    const existing = state.events[l.id] && await guild.scheduledEvents.fetch(state.events[l.id]).catch(() => null)
    if (existing) {
      if (existing.scheduledStartTimestamp !== start.getTime()) {
        await existing.edit(data).catch(e => console.error('event', e.message))
        await journal(`événement **${l.id}** déplacé au ${start.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}`)
      }
    } else {
      const ev = await guild.scheduledEvents.create(data).catch(e => { console.error('event', e.message); return null })
      if (ev) { state.events[l.id] = ev.id; await journal(`événement créé : **${l.id}** la nuit du ${start.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}`) }
    }
  }
  for (const [id, evId] of Object.entries(state.events)) {
    if (keep.has(id)) continue
    const ev = await guild.scheduledEvents.fetch(evId).catch(() => null)
    if (ev && ev.status === 1) { await ev.delete().catch(() => {}); await journal(`événement **${id}** retiré (lot plus « prêt »)`) }
    delete state.events[id]
  }
  saveState()
}

// ── Questions de Claude : un post dédié, réponse par boutons / menu déroulant ──
const parseQuestions = (text) => {
  const out = []
  const lines = String(text).split(/\r?\n/)
  for (let i = 0; i < lines.length; i++) {
    const q = lines[i].match(/^[\s>*_-]*QUESTION\s*:\s*\**\s*(.+)$/i)
    if (!q) continue
    const o = lines[i + 1]?.match(/^[\s>*_-]*OPTIONS\s*:\s*\**\s*(.+)$/i)
    const options = o ? o[1].split('|').map(s => s.replace(/\*+/g, '').trim()).filter(Boolean).slice(0, 25) : []
    out.push({ text: q[1].replace(/\*+$/, '').trim(), options })
  }
  return out
}
const questionComponents = (qid, options, disabled = false) => {
  const rows = []
  if (options.length && options.length <= 4) {
    rows.push(new ActionRowBuilder().addComponents(
      ...options.map((o, i) => new ButtonBuilder().setCustomId(`q:${qid}:${i}`).setLabel(clip(o, 80)).setDisabled(disabled)
        .setStyle(i === 0 ? ButtonStyle.Primary : ButtonStyle.Secondary)),
      new ButtonBuilder().setCustomId(`qo:${qid}`).setLabel('Autre (écrire)').setStyle(ButtonStyle.Secondary).setDisabled(disabled)))
  } else {
    if (options.length) {
      rows.push(new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId(`qs:${qid}`).setPlaceholder('Choisir une réponse…').setDisabled(disabled)
        .addOptions(options.map((o, i) => ({ label: clip(o, 100), value: String(i) })))))
    }
    rows.push(new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`qo:${qid}`).setLabel('Répondre par écrit').setStyle(ButtonStyle.Secondary).setDisabled(disabled)))
  }
  return rows
}
// origin : { threadId, forum, report? } — d'où vient la question (conversation ou rapport de nuit).
const askQuestions = async (questions, origin) => {
  for (const q of questions) {
    const qid = crypto.randomBytes(4).toString('hex')
    const forum = channels[origin.forum] ?? channels.dev
    const embed = new EmbedBuilder().setTitle('❓ Question de Claude').setDescription(clip(q.text, 3500)).setColor(0xf59e0b)
      .addFields({ name: 'Origine', value: `<#${origin.threadId}>` })
    const post = await forum.threads.create({
      name: clip(`❓ ${q.text}`, 95),
      appliedTags: [tagId(forum, 'Question')].filter(Boolean),
      message: { content: `<@${OWNER_ID}>`, embeds: [embed], components: questionComponents(qid, q.options) },
    })
    state.questions[qid] = { text: q.text, options: q.options, postId: post.id, originId: origin.threadId, origin, answered: false, askedAt: Date.now(), lastPing: Date.now() }
    saveState()
    await channels.questions.send(`<@${OWNER_ID}> ❓ **Nouvelle question** : ${clip(q.text, 300)}\n→ réponds dans ${post}`)
    await journal(`question ouverte : ${clip(q.text, 120)} (${post})`)
  }
}
// Publie une réponse de Claude dans un fil et ouvre un post par question qu'elle contient.
const deliver = async (thread, forumName, text) => {
  await send(thread, text)
  const qs = parseQuestions(text)
  if (qs.length) await askQuestions(qs, { threadId: thread.id, forum: forumName })
}
const answerQuestion = async (qid, answer) => {
  const q = state.questions[qid]
  if (!q || q.answered) return
  q.answered = true; q.answer = answer; q.answeredAt = Date.now(); saveState()
  const post = await client.channels.fetch(q.postId).catch(() => null)
  if (post) {
    const starter = await post.fetchStarterMessage().catch(() => null)
    if (starter) {
      const embed = EmbedBuilder.from(starter.embeds[0]).setColor(0x22c55e).addFields({ name: 'Réponse', value: clip(answer, 1000) })
      await starter.edit({ content: '', embeds: [embed], components: questionComponents(qid, q.options, true) }).catch(() => {})
    }
    const forum = post.parent
    await post.setAppliedTags([tagId(forum, 'Résolu')].filter(Boolean)).catch(() => {})
  }
  await journal(`question résolue : ${clip(q.text, 100)} → ${clip(answer, 100)}`)

  // Reprise du travail avec la réponse.
  const origin = await client.channels.fetch(q.originId).catch(() => null)
  if (!origin) return
  const forumName = origin.parent?.name ?? 'dev'
  const mode = MODE_BY_CHANNEL[forumName] ?? 'edit'
  const sessionId = state.sessions[origin.id]
  const prompt = sessionId
    ? `Réponse du propriétaire à ta question « ${q.text} » : ${answer}\nContinue en tenant compte de cette réponse.`
    : `${RULES}\n\nLe robot de nuit a posé cette question dans son rapport (${q.origin?.report ?? 'rapport'}) : « ${q.text} ».\nRéponse du propriétaire : ${answer}\nReprends le lot concerné sur sa branche (git fetch, puis la branche mvp/… du lot) en appliquant cette réponse, puis rends compte.`
  await origin.send(`💬 Réponse transmise à Claude : **${clip(answer, 300)}**`)
  const typing = setInterval(() => origin.sendTyping().catch(() => {}), 8000)
  const res = await enqueue({ label: `réponse › ${clip(q.text, 40)}`, run: () => runClaude(prompt, { mode, sessionId }) })
  clearInterval(typing)
  if (res.sessionId) { state.sessions[origin.id] = res.sessionId; saveState() }
  await deliver(origin, forumName, res.text)
  await channels.questions.send(`✅ **Résolu** — ${clip(q.text, 200)}\n→ ${clip(answer, 200)}\nSuite : ${clip(res.text.split('\n').find(l => l.trim()) ?? '', 300)} (${origin})`)
}
const remindPending = async () => {
  const pending = Object.entries(state.questions).filter(([, q]) => !q.answered)
  const hour = Number(new Date().toLocaleString('en-GB', { timeZone: 'Europe/Paris', hour: '2-digit', hour12: false }))
  if (!pending.length || hour < 8 || hour >= 23) return
  const due = pending.filter(([, q]) => Date.now() - q.lastPing > REMIND_EVERY_MS)
  if (!due.length) return
  const lines = pending.map(([, q]) => `• ${clip(q.text, 150)} — <#${q.postId}>`)
  await channels.questions.send(`<@${OWNER_ID}> ⏰ **${pending.length} question(s) toujours en attente.** Peux-tu répondre ou éclaircir la situation ?\n${lines.join('\n')}`)
  for (const [, q] of due) q.lastPing = Date.now()
  saveState()
}

// ── Rapports du robot de nuit → un post par fichier dans le forum #dev ──────
const watchReports = async () => {
  if (!fs.existsSync(REPORTS_DIR)) return
  const forum = channels.dev
  for (const file of fs.readdirSync(REPORTS_DIR).filter(f => f.endsWith('.md')).sort()) {
    const full = path.join(REPORTS_DIR, file)
    const st = fs.statSync(full)
    const rec = state.reports[file] ??= { offset: 0, threadId: null }
    if (st.size <= rec.offset || Date.now() - st.mtimeMs < 20000) continue // attendre que l'écriture se stabilise
    const fresh = fs.readFileSync(full, 'utf8').slice(rec.offset)
    let thread = rec.threadId && await client.channels.fetch(rec.threadId).catch(() => null)
    if (!thread) {
      thread = await forum.threads.create({
        name: `🌙 Rapport ${file.replace(/\.md$/, '')}`, appliedTags: [tagId(forum, 'Rapport de nuit'), tagId(forum, 'Avancement')].filter(Boolean),
        message: { content: `Rapport du robot (\`~/rapports/${file}\`) — avancement, raisonnement et questions ci-dessous.` },
      })
      rec.threadId = thread.id
    }
    if (thread.archived) await thread.setArchived(false).catch(() => {})
    await send(thread, fresh)
    rec.offset = st.size; saveState()
    const qs = parseQuestions(fresh)
    if (qs.length) await askQuestions(qs, { threadId: thread.id, forum: 'dev', report: file })
  }
}

// ── #pannel : un message permanent, navigation par boutons ─────────────────
const VIEWS = [
  ['activite', '📡 Activité'], ['prod', '🚀 Prod'], ['lots', '🗂 Lots'], ['runs', '🔁 Runs'],
  ['commits', '📝 Commits'], ['rapports', '🌙 Rapports'], ['erreurs', '⚠️ Erreurs'], ['questions', '❓ Questions'],
]
const readDashboard = () => { try { return JSON.parse(fs.readFileSync(DASHBOARD_JSON, 'utf8')) } catch { return null } }
const panelEmbed = (view) => {
  const d = readDashboard()
  const e = new EmbedBuilder().setColor(0x8b5cf6).setURL(DASHBOARD_URL)
    .setFooter({ text: `Données du ${d?.generated ?? '?'} (Paris) · rafraîchi toutes les 2 min` })
  if (!d) return e.setTitle('Tableau de bord').setDescription('Données indisponibles (dashboard.json absent).')
  const label = VIEWS.find(v => v[0] === view)?.[1] ?? ''
  e.setTitle(`Tableau de bord — ${label}`)
  if (view === 'activite') {
    e.setDescription([
      `🤖 **Bot** : ${busy ? `occupé — ${busy}` : 'libre'}${queue.length ? ` (${queue.length} en attente)` : ''}`,
      `⚙️ **Robot (cron)** : ${d.running.length ? d.running.map(r => `${r.job} depuis ${r.since}`).join(', ') : 'au repos'}`,
      `❓ **Questions en attente** : ${Object.values(state.questions).filter(q => !q.answered).length}`,
      `🚀 **Prod** : API ${d.prod.health} · build \`${d.prod.build}\`${d.prod.undeployed ? ` · ⚠️ ${d.prod.undeployed} fichier(s) non déployé(s)` : ' · à jour'}`,
      `🖥 **VPS** : ${d.vps.mem} · disque ${d.vps.disk}`,
      `🌙 **Prochain lot** : ${d.lots.find(l => l.status.startsWith('prêt'))?.id ?? 'aucun « prêt »'} (nuit, ${NIGHT_HOUR_UTC} h UTC)`,
    ].join('\n'))
  } else if (view === 'prod') {
    e.setDescription([`API : **${d.prod.health}**`, `Build en prod : \`${d.prod.build}\` (déployé le ${d.prod.deployedAt || '?'})`,
      `main GitHub : \`${d.prod.main}\``, d.prod.undeployed ? `⚠️ ${d.prod.undeployed} fichier(s) de code non déployé(s)` : '✅ prod à jour avec main'].join('\n'))
  } else if (view === 'lots') {
    const tone = { green: '✅', amber: '⏳', red: '⛔', blue: '🟢', grey: '⬜' }
    e.setDescription(clip(d.lots.map(l => `${tone[l.tone] ?? '⬜'} **${l.id}** ${clip(l.title, 40)} — ${clip(l.status, 60)}`).join('\n'), 4000))
  } else if (view === 'runs') {
    e.setDescription(clip([...d.jobs.map(j => `• \`${j.name}\` ${j.paused ? '⏸ en pause' : `prochain ${j.next}`} · dernier ${j.last ?? '—'} ${j.lastAt}`), '',
      ...d.runs.map(r => `${r.status === 'completed' ? '✅' : r.status === 'running' ? '⏳' : '❌'} ${r.at} — ${r.job}`)].join('\n'), 4000))
  } else if (view === 'commits') {
    e.setDescription(clip(d.commits.map(c => `\`${c.sha}\` ${c.ref} — ${clip(c.subject, 80)}`).join('\n'), 4000))
  } else if (view === 'rapports') {
    e.setDescription(d.reports.length ? clip(d.reports.map(r => `**${r.name}** (${r.at})\n${clip(r.tail, 900)}`).join('\n\n'), 4000) : 'Aucun rapport.')
  } else if (view === 'erreurs') {
    e.setDescription(d.errors.length ? clip(d.errors.map(l => `\`${l}\``).join('\n'), 4000) : 'Aucune erreur récente.')
  } else if (view === 'questions') {
    const qs = Object.values(state.questions).sort((a, b) => b.askedAt - a.askedAt).slice(0, 15)
    e.setDescription(qs.length ? qs.map(q => `${q.answered ? '✅' : '❓'} ${clip(q.text, 100)}${q.answered ? ` → ${clip(q.answer, 60)}` : ''} — <#${q.postId}>`).join('\n') : 'Aucune question.')
  }
  return e
}
const panelComponents = (view) => [0, 4].map(start => new ActionRowBuilder().addComponents(
  ...VIEWS.slice(start, start + 4).map(([id, label]) => new ButtonBuilder().setCustomId(`nav:${id}`).setLabel(label)
    .setStyle(id === view ? ButtonStyle.Primary : ButtonStyle.Secondary))))
  .concat(new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel('Page web complète').setStyle(ButtonStyle.Link).setURL(DASHBOARD_URL)))
const refreshPanel = async () => {
  const ch = channels.pannel
  const payload = { content: '', embeds: [panelEmbed(state.panel.view)], components: panelComponents(state.panel.view) }
  const msg = state.panel.messageId && await ch.messages.fetch(state.panel.messageId).catch(() => null)
  if (msg) return msg.edit(payload)
  const created = await ch.send(payload)
  await created.pin().catch(() => {})
  state.panel.messageId = created.id; saveState()
}

// ── Statut ──────────────────────────────────────────────────────────────────
const statusText = async () => {
  const health = await fetch(HEALTH_URL, { signal: AbortSignal.timeout(8000) }).then(r => r.status).catch(() => 'injoignable')
  const prs = await gh(`/repos/${REPO}/pulls?state=open&per_page=20`).catch(() => [])
  return [
    `🤖 Robot : ${busy ? `occupé — ${busy}` : 'libre'}${queue.length ? ` (${queue.length} en attente)` : ''}`,
    `🚀 Prod : /api/health → ${health}`,
    `❓ Questions en attente : ${Object.values(state.questions).filter(q => !q.answered).length}`,
    `🔍 PR ouvertes : ${prs.length || 'aucune'}`,
    ...prs.map(p => `• #${p.number} ${p.title} — <${p.html_url}>`),
  ].join('\n')
}

// ── Événements ──────────────────────────────────────────────────────────────
const safely = (name, fn) => () => fn().catch(e => console.error(name, e.message))
client.once(Events.ClientReady, async () => {
  guild = await client.guilds.fetch(GUILD_ID)
  await ensureLayout(guild)
  await guild.commands.set(COMMANDS.map(c => c.toJSON()))
  console.log(`Prêt : ${client.user.tag}, ${Object.keys(channels).length} salons`)
  await safely('plan', () => publishPlan(true))()
  await safely('pannel', refreshPanel)()
  setInterval(safely('plan', () => publishPlan()), 10 * 60 * 1000)
  setInterval(safely('rapports', watchReports), 60 * 1000)
  setInterval(safely('pannel', refreshPanel), 2 * 60 * 1000)
  setInterval(safely('rappels', remindPending), 30 * 60 * 1000)
})

client.on(Events.InteractionCreate, async (i) => {
  if (i.user.id !== OWNER_ID) return i.isRepliable() && i.reply({ content: 'Non autorisé.', ephemeral: true })
  try {
    if (i.isButton() || i.isStringSelectMenu()) {
      const [kind, id, idx] = i.customId.split(':')
      if (kind === 'nav') {
        state.panel.view = id; saveState()
        return i.update({ embeds: [panelEmbed(id)], components: panelComponents(id) })
      }
      const q = state.questions[id]
      if (!q) return i.reply({ content: 'Question inconnue.', ephemeral: true })
      if (q.answered) return i.reply({ content: `Déjà répondu : ${q.answer}`, ephemeral: true })
      if (kind === 'qo') { q.awaitText = true; saveState(); return i.reply({ content: '✍️ Écris ta réponse dans ce post : ton prochain message sera transmis à Claude.', ephemeral: true }) }
      const answer = kind === 'qs' ? q.options[Number(i.values[0])] : q.options[Number(idx)]
      await i.reply({ content: `✅ Réponse enregistrée : **${answer}**. Claude reprend dans <#${q.originId}>.` })
      return answerQuestion(id, answer)
    }
    if (!i.isChatInputCommand()) return
    await i.deferReply()
    if (i.commandName === 'statut') return i.editReply(await statusText())
    if (i.commandName === 'plan') { await publishPlan(true); return i.editReply(`Plan republié dans ${channels.plan}, tâches dans ${channels['tâches']}.`) }
    if (i.commandName === 'lot') {
      const id = i.options.getString('id').trim().toUpperCase(), s = i.options.getString('statut')
      await setLotStatus(id, s, i.user.username)
      await publishPlan(true)
      return i.editReply(`✅ ${id} → **${s}** (commité sur main).${s === 'prêt' ? ' Le robot le prendra lors d\'une prochaine nuit (voir les événements).' : ''}`)
    }
    if (i.commandName === 'go') {
      // run-lot.sh porte son propre verrou (flock) : un second /go pendant un run s'arrête seul.
      const child = spawn(RUN_LOT, [], { detached: true, stdio: 'ignore', env: { ...process.env, PATH: `${HOME}/.local/bin:${process.env.PATH}` } })
      child.unref()
      await journal('robot lancé à la main (/go)')
      return i.editReply(`🚀 Robot lancé sur le premier lot « prêt ». Le rapport arrivera en post dans ${channels.dev}.`)
    }
    if (i.commandName === 'questions') {
      const pending = Object.values(state.questions).filter(q => !q.answered)
      return i.editReply(pending.length ? pending.map(q => `❓ ${clip(q.text, 150)} — <#${q.postId}>`).join('\n') : 'Aucune question en attente.')
    }
    if (i.commandName === 'oublier') { delete state.sessions[i.channelId]; saveState(); return i.editReply('Conversation remise à zéro pour ce fil.') }
    if (i.commandName === 'archiver') {
      if (!i.channel?.isThread()) return i.editReply('À utiliser dans un fil.')
      await channels.archives.send(`🗄 ${i.channel.name} — ${i.channel.url}`)
      await i.editReply('Archivé.')
      return i.channel.setArchived(true)
    }
  } catch (e) {
    console.error('interaction', e.message)
    return (i.deferred || i.replied) ? i.editReply(`⚠️ ${e.message}`).catch(() => {}) : i.reply({ content: `⚠️ ${e.message}`, ephemeral: true }).catch(() => {})
  }
})

client.on(Events.MessageCreate, async (msg) => {
  if (msg.author.bot || msg.author.id !== OWNER_ID || msg.guildId !== GUILD_ID) return

  // Réponse écrite à une question (bouton « Autre ») : le message est la réponse.
  const waiting = Object.entries(state.questions).find(([, q]) => !q.answered && q.postId === msg.channelId)
  if (waiting) return answerQuestion(waiting[0], msg.content)

  const parent = msg.channel.isThread() ? msg.channel.parent : msg.channel
  const mode = MODE_BY_CHANNEL[parent?.name]
  if (!mode) return // salon réservé au bot ou hors organisation

  // Dans un forum, chaque post est déjà un fil ; dans un salon texte, un message ouvre un fil.
  const thread = msg.channel.isThread() ? msg.channel
    : await msg.startThread({ name: msg.content.slice(0, 90) || 'conversation', autoArchiveDuration: ThreadAutoArchiveDuration.OneDay })
  const sessionId = state.sessions[thread.id]
  const prompt = sessionId ? msg.content
    : `${RULES}\n\nSalon : #${parent.name} (${mode === 'plan' ? 'lecture seule : analyse, conseil, plan — ne modifie aucun fichier' : 'tu peux coder sur une branche dédiée'}).\n\nDemande :\n${msg.content}`

  const position = queue.length + (busy ? 1 : 0)
  if (position) await thread.send(`⏳ En file d'attente (position ${position}).`)
  const typing = setInterval(() => thread.sendTyping().catch(() => {}), 8000)
  thread.sendTyping().catch(() => {})
  const res = await enqueue({ label: `#${parent.name} › ${thread.name}`, run: () => runClaude(prompt, { mode, sessionId }) })
  clearInterval(typing)
  if (res.sessionId) { state.sessions[thread.id] = res.sessionId; saveState() }
  await deliver(thread, parent.type === ChannelType.GuildForum ? parent.name : 'dev', res.text)
  if (parent.type === ChannelType.GuildForum) {
    const t = [tagId(parent, 'Avancement'), tagId(parent, 'Raisonnement')].filter(Boolean)
    if (!thread.appliedTags?.length && t.length) await thread.setAppliedTags(t).catch(() => {})
  }
})

client.login(TOKEN)
