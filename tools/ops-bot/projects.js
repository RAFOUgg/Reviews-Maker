// Projets & outils : registre, contrôles de santé, panneaux / logs / données par projet, onboarding.
// Les données viennent de /var/lib/ops-status (collecteur lecture seule d'ubuntu, chaque minute,
// /home/ubuntu/ops-status.py) : le bot tourne sous hermes et ne voit ni Docker, ni les logs, ni les
// bases des autres projets.
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } from 'discord.js'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'

const HOME = os.homedir()
const OPS_STATUS_DIR = process.env.OPS_STATUS_DIR ?? '/var/lib/ops-status'
const TOOLS_FILE = process.env.TOOLS_FILE ?? path.join(HOME, 'ops-bot/tools.json')

export const PROJECTS = {
  terpo: { name: 'Terpologie', emoji: '🌿', color: 0x8b5cf6, about: 'Reviews-Maker / terpologie.eu : reviews cannabis centrées sur la traçabilité, Export Maker, PhenoHunt, chaîne de production.' },
  quitaddiction: { name: 'QuitAddiction', emoji: '🚭', color: 0xef4444, about: 'Bot Discord Python (Docker « quitaddictionbot ») d\'accompagnement à l\'arrêt des addictions.' },
  lafoncedalle: { name: 'LaFoncedalle', emoji: '🍃', color: 0x22c55e, about: 'LaFoncedalleBot (bot Discord) et son API (Docker « lafoncedallebot » + « lafoncedalleapi »).' },
}
// Salons par projet, à fusionner dans LAYOUT (bot.js) : catégorie → { salon: null } (réservés au bot).
export const PROJECT_LAYOUT = Object.fromEntries(Object.entries(PROJECTS).map(([k, p]) => [
  `${p.emoji} ${p.name.toUpperCase()}`, { [`panel-${k}`]: null, [`logs-${k}`]: null, [`data-${k}`]: null },
]))
export const PROJECT_LABEL = { ...Object.fromEntries(Object.entries(PROJECTS).map(([k, p]) => [k, `${p.emoji} ${p.name}`])), autres: '🧩 Autres' }
const STATE_ICON = { up: '🟢', down: '🔴', unknown: '🟡' }
const clip = (s, n) => (String(s ?? '').length > n ? String(s).slice(0, n - 1) + '…' : String(s ?? ''))
const ago = (ts) => (ts ? `<t:${Math.floor(ts)}:R>` : '—')
const sumRows = (db) => Object.values(db.tables ?? {}).reduce((a, b) => a + b, 0)

export const createProjects = ({ state, saveState, channels, OWNER_ID, DASHBOARD_URL, REPO, journal, readDashboard }) => {
  const DEFAULT_TOOLS = [
    { id: 'site', project: 'terpo', name: 'Site terpologie.eu', kind: 'Site', critical: true, description: 'Application Reviews-Maker (front React + API Express).', url: 'https://terpologie.eu', repo: `https://github.com/${REPO}`, checks: [{ type: 'http', target: 'https://terpologie.eu/api/health' }, { type: 'process', target: 'Reviews-Maker/server-new/server.js' }] },
    { id: 'ops-bot', project: 'terpo', name: 'Terpologie Ops (bot Discord)', kind: 'Bot Discord', critical: false, description: 'Ce bot : panneaux, questions de Claude, planning, gestion des outils.', checks: [{ type: 'self' }] },
    { id: 'robot', project: 'terpo', name: 'Robot de dev (Claude Code)', kind: 'Outil interne', critical: false, description: 'run-lot.sh : chaque nuit (2 h UTC) ou /go, prend le premier lot « prêt » du plan → branche + PR. Abonnement Pro.', checks: [{ type: 'file', target: path.join(HOME, 'run-lot.sh') }] },
    { id: 'dashboard', project: 'terpo', name: 'Tableau de bord web', kind: 'Outil interne', critical: false, description: 'Page de suivi en lecture seule (mot de passe).', url: DASHBOARD_URL, checks: [{ type: 'http', target: DASHBOARD_URL }] },
    { id: 'quitaddiction', project: 'quitaddiction', name: 'QuitAddiction (bot Discord)', kind: 'Bot Discord', critical: true, description: PROJECTS.quitaddiction.about, checks: [{ type: 'docker', target: 'quitaddictionbot' }] },
    { id: 'lafoncedallebot', project: 'lafoncedalle', name: 'LaFoncedalleBot', kind: 'Bot Discord', critical: true, description: 'Bot Discord LaFoncedalle (conteneur « lafoncedallebot »).', checks: [{ type: 'docker', target: 'lafoncedallebot' }] },
    { id: 'lafoncedalle-api', project: 'lafoncedalle', name: 'API LaFoncedalle', kind: 'API', critical: true, description: 'API Flask/Gunicorn du bot (conteneur « lafoncedalleapi », port 5000).', checks: [{ type: 'docker', target: 'lafoncedalleapi' }] },
    { id: 'growbrain', project: 'autres', name: 'GrowBrain', kind: 'Site', critical: false, description: 'growbrain.terpologie.eu (3 conteneurs Docker).', url: 'https://growbrain.terpologie.eu', checks: [{ type: 'http', target: 'https://growbrain.terpologie.eu' }, { type: 'docker', target: 'growbrain-backend' }] },
    { id: 'obsidian-mcp', project: 'autres', name: 'Obsidian MCP', kind: 'Outil interne', critical: false, description: 'Serveur MCP du coffre Obsidian (mcp.terpologie.eu).', url: 'https://mcp.terpologie.eu', checks: [{ type: 'process', target: 'obsidian-mcp/server.py' }] },
  ]
  let tools = (() => { try { return JSON.parse(fs.readFileSync(TOOLS_FILE, 'utf8')) } catch { return DEFAULT_TOOLS } })()
  const saveTools = () => fs.writeFileSync(TOOLS_FILE, JSON.stringify(tools, null, 2))
  if (!fs.existsSync(TOOLS_FILE)) saveTools()
  const toolStatus = {} // id -> { state, details, at }
  state.msgs ??= {}
  state.msgHash ??= {}
  state.toolStates ??= {}
  state.dataDaily ??= {}

  const readOps = (name) => { try { return JSON.parse(fs.readFileSync(path.join(OPS_STATUS_DIR, `${name}.json`), 'utf8')) } catch { return null } }
  const opsAgeMin = (name) => { try { return (Date.now() - fs.statSync(path.join(OPS_STATUS_DIR, `${name}.json`)).mtimeMs) / 60000 } catch { return Infinity } }

  const runCheck = async (c, docker) => {
    if (c.type === 'self') return ['up', 'en ligne']
    if (c.type === 'http') {
      try {
        const r = await fetch(c.target, { signal: AbortSignal.timeout(8000), redirect: 'manual' })
        return r.status < 500 ? ['up', `HTTP ${r.status}`] : ['down', `HTTP ${r.status}`]
      } catch { return ['down', 'injoignable'] }
    }
    if (c.type === 'file') return fs.existsSync(c.target) ? ['up', 'installé'] : ['down', 'fichier absent']
    if (!docker || opsAgeMin('docker') > 5) return ['unknown', 'collecteur muet (> 5 min)']
    if (c.type === 'docker') {
      const k = docker.find(x => x.name === c.target)
      if (!k) return ['down', 'aucun conteneur']
      return k.state === 'running' ? ['up', k.status] : ['down', k.status]
    }
    if (c.type === 'process') {
      const ps = docker.find(x => x.ps)?.ps ?? []
      return ps.some(l => l.includes(c.target)) ? ['up', 'processus actif'] : ['down', 'processus absent']
    }
    return ['unknown', `contrôle « ${c.type} » inconnu`]
  }
  const checkTools = async (only) => {
    const docker = readOps('docker')
    for (const t of tools.filter(t => !only || t.id === only)) {
      const results = await Promise.all((t.checks ?? []).map(c => runCheck(c, docker)))
      const st = results.some(r => r[0] === 'down') ? 'down' : results.some(r => r[0] === 'unknown') ? 'unknown' : 'up'
      toolStatus[t.id] = { state: st, details: results.map((r, i) => `${t.checks[i].type} → ${r[1]}`), at: Date.now() }
      const prev = state.toolStates[t.id]
      if (prev && prev !== st && st !== 'unknown') {
        const ch = channels[`logs-${t.project}`] ?? channels.logs
        const ping = st === 'down' && t.critical ? `<@${OWNER_ID}> ` : ''
        await ch?.send(`${ping}${STATE_ICON[st]} **${t.name}** : ${st === 'up' ? 'de nouveau en ligne' : '**HORS LIGNE**'} (${toolStatus[t.id].details.join(' · ')})`).catch(() => {})
        await journal(`${STATE_ICON[st]} ${t.name} ${st === 'up' ? 'rétabli' : 'hors ligne'}`)
      }
      state.toolStates[t.id] = st
    }
    saveState()
  }
  const stateOf = (t) => toolStatus[t.id]?.state ?? 'unknown'
  const toolLine = (t) => `${STATE_ICON[stateOf(t)]} **${t.name}**${stateOf(t) === 'down' ? ` — ${toolStatus[t.id].details.join(', ')}` : ''}`
  // Première partie de la vue d'ensemble : l'état de chaque outil, rangé par projet.
  const toolsSummary = () => Object.keys(PROJECT_LABEL).map((p) => {
    const list = tools.filter(t => t.project === p)
    return list.length ? `${PROJECT_LABEL[p]} · ${list.map(t => `${STATE_ICON[stateOf(t)]} ${t.name}`).join(' · ')}` : null
  }).filter(Boolean).join('\n')
  const toolCounts = () => ({ up: tools.filter(t => stateOf(t) === 'up').length, down: tools.filter(t => stateOf(t) === 'down').length, total: tools.length })

  // Message permanent : édité seulement si son contenu change.
  const upsert = async (ch, key, payload, { pin = false } = {}) => {
    if (!ch) return null
    const hash = crypto.createHash('sha1').update(JSON.stringify(payload)).digest('hex')
    const msg = state.msgs[key] && await ch.messages.fetch(state.msgs[key]).catch(() => null)
    if (msg) {
      if (state.msgHash[key] !== hash) { await msg.edit(payload); state.msgHash[key] = hash; saveState() }
      return msg
    }
    const created = await ch.send(payload)
    if (pin) await created.pin().catch(() => {})
    state.msgs[key] = created.id; state.msgHash[key] = hash; saveState()
    return created
  }
  const linkRow = (t) => {
    const b = []
    if (t.url) b.push(new ButtonBuilder().setLabel('Ouvrir').setStyle(ButtonStyle.Link).setURL(t.url))
    if (t.repo) b.push(new ButtonBuilder().setLabel('Dépôt').setStyle(ButtonStyle.Link).setURL(t.repo))
    b.push(new ButtonBuilder().setCustomId(`tool:check:${t.id}`).setLabel('🔄 Vérifier').setStyle(ButtonStyle.Secondary))
    return new ActionRowBuilder().addComponents(...b.slice(0, 5))
  }
  const toolEmbed = (t) => new EmbedBuilder()
    .setTitle(`${STATE_ICON[stateOf(t)]} ${t.name}`)
    .setColor(stateOf(t) === 'up' ? 0x22c55e : stateOf(t) === 'down' ? 0xef4444 : 0xf59e0b)
    .setDescription(clip(t.description || '—', 1000))
    .addFields(
      { name: 'Projet', value: PROJECT_LABEL[t.project] ?? String(t.project), inline: true },
      { name: 'Type', value: t.kind || '—', inline: true },
      { name: 'Critique', value: t.critical ? 'oui (alerte + mention)' : 'non', inline: true },
      { name: 'Contrôles', value: clip((toolStatus[t.id]?.details ?? (t.checks ?? []).map(c => `${c.type} → ${c.target ?? ''}`)).join('\n') || 'aucun', 1000) },
    )
    .setFooter({ text: `id : ${t.id} · /outil modifier id:${t.id}` })

  const projectPanel = (key) => {
    const p = PROJECTS[key], d = readOps(key)
    const e = new EmbedBuilder().setTitle(`${p.emoji} ${p.name} — panneau`).setColor(p.color).setDescription(p.about)
    e.addFields({ name: '🧰 Outils', value: clip(tools.filter(t => t.project === key).map(toolLine).join('\n') || 'aucun outil enregistré', 1024) })
    if (!d) return e.addFields({ name: '⚠️ Collecteur', value: 'Aucune donnée dans /var/lib/ops-status.' })
    if (d.containers.length) e.addFields({ name: '🐳 Conteneurs', value: d.containers.map(c => `${c.state === 'running' ? '🟢' : '🔴'} \`${c.name}\` — ${c.status}`).join('\n'), inline: true })
    if (d.process !== null) e.addFields({ name: '⚙️ Processus', value: d.process ? '🟢 actif' : '🔴 absent', inline: true })
    e.addFields(
      { name: '🗄 Données', value: clip(d.dbs.map(db => `\`${db.path.split('/').pop()}\` ${db.error ? `⚠️ ${db.error}` : `${db.sizeMo} Mo · ${sumRows(db)} lignes`}`).join('\n') || '—', 1024), inline: true },
      { name: '💾 Sauvegardes', value: d.lastBackup ? `${d.backupCount} · dernière ${ago(d.lastBackup.at)}` : '⚠️ aucune', inline: true },
      { name: '📜 Logs', value: `${d.logs.length} source(s) · ${d.errorLines ? `⚠️ ${d.errorLines} ligne(s) d'erreur` : 'aucune erreur récente'}${channels[`logs-${key}`] ? ` → <#${channels[`logs-${key}`].id}>` : ''}`, inline: true },
    )
    if (key === 'terpo') {
      const dash = readDashboard()
      if (dash) e.addFields({ name: '🗂 Dev', value: `${dash.lots.filter(l => l.tone === 'green').length} lots faits · ${dash.lots.filter(l => l.tone === 'blue').length} prêts · prochain : ${dash.lots.find(l => l.tone === 'blue')?.id ?? '—'}\nprod \`${dash.prod.build}\` · API ${dash.prod.health}`, inline: true })
    }
    return e.setFooter({ text: `Collecteur : il y a ${Math.round(opsAgeMin(key))} min · rafraîchi toutes les 2 min` })
  }
  const projectComponents = (key) => {
    const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`proj:refresh:${key}`).setLabel('🔄 Actualiser').setStyle(ButtonStyle.Secondary))
    for (const t of tools.filter(t => t.project === key && t.url).slice(0, 4)) row.addComponents(new ButtonBuilder().setLabel(clip(t.name, 30)).setStyle(ButtonStyle.Link).setURL(t.url))
    return [row]
  }
  const logsMessages = (key) => {
    const d = readOps(key)
    if (!d) return [{ content: '⚠️ Collecteur muet.' }]
    if (!d.logs.length) return [{ content: `Aucun log disponible pour ${PROJECTS[key].name} : aucun conteneur ni fichier de log actif.` }]
    return d.logs.map(l => ({ content: clip(`📜 **${l.source}**${l.updated ? ` — modifié ${ago(l.updated)}` : ''}\n\`\`\`\n${(l.lines.join('\n').replace(/```/g, "'''").slice(-1700)) || '(vide)'}\n\`\`\``, 1990) }))
  }
  const dataEmbed = (key) => {
    const p = PROJECTS[key], d = readOps(key)
    const e = new EmbedBuilder().setTitle(`${p.emoji} ${p.name} — données`).setColor(p.color)
    if (!d) return e.setDescription('⚠️ Collecteur muet.')
    for (const db of d.dbs) {
      e.addFields({ name: `🗄 ${db.path.split('/').pop()}${db.sizeMo ? ` · ${db.sizeMo} Mo · ${sumRows(db)} lignes` : ''}`, value: db.error ? `⚠️ ${db.error}` : clip(Object.entries(db.tables).sort((a, b) => b[1] - a[1]).map(([t, n]) => `\`${t}\` ${n}`).join(' · ') || 'aucune table', 1024) })
    }
    e.addFields(
      { name: '💾 Sauvegardes', value: d.lastBackup ? `${d.backupCount} fichier(s) · dernière : \`${d.lastBackup.file}\` ${ago(d.lastBackup.at)}` : '⚠️ aucune sauvegarde trouvée', inline: true },
      { name: '💽 Disque VPS', value: d.disk ? `${d.disk.used} utilisé · ${d.disk.free} libre` : '—', inline: true },
    )
    return e.setFooter({ text: 'Comptes de lignes uniquement, bases lues en lecture seule · historique quotidien ci-dessous' })
  }
  const refreshProject = async (key) => {
    await upsert(channels[`panel-${key}`], `panel-${key}`, { content: '', embeds: [projectPanel(key)], components: projectComponents(key) }, { pin: true })
    for (const [i, m] of logsMessages(key).entries()) await upsert(channels[`logs-${key}`], `logs-${key}-${i}`, m)
    await upsert(channels[`data-${key}`], `data-${key}`, { content: '', embeds: [dataEmbed(key)] }, { pin: true })
    const today = new Date().toISOString().slice(0, 10), d = readOps(key)
    if (d && state.dataDaily[key] !== today && channels[`data-${key}`]) {
      const line = d.dbs.map(db => `${db.path.split('/').pop()} ${db.error ? '⚠️' : `${sumRows(db)} lignes / ${db.sizeMo} Mo`}`).join(' · ')
      await channels[`data-${key}`].send(`📈 ${today} — ${line} · sauvegardes : ${d.backupCount}`)
      state.dataDaily[key] = today; saveState()
    }
  }
  const refreshAll = async () => {
    await checkTools()
    for (const key of Object.keys(PROJECTS)) await refreshProject(key)
    for (const t of tools) await upsert(channels.outils, `tool-${t.id}`, { content: '', embeds: [toolEmbed(t)], components: [linkRow(t)] })
  }

  const onboardingEmbeds = () => [
    new EmbedBuilder().setColor(0x8b5cf6).setTitle('👋 Bienvenue dans ton centre de pilotage')
      .setDescription(`Ce serveur pilote **tous tes projets et outils**, que ton PC soit allumé ou éteint : tout tourne sur le VPS.\n\n• **${Object.values(PROJECTS).map(p => `${p.emoji} ${p.name}`).join(' · ')}** : un panneau, des logs et des données par projet.\n• **Le dev de Terpologie avance seul** (robot Claude Code), sous ta supervision : tu valides, tu réponds aux questions, il code.\n• Seul ton compte peut donner des ordres au bot.`),
    new EmbedBuilder().setColor(0x8b5cf6).setTitle('🗺 Organisation du serveur').addFields(
      { name: '🧭 ACCUEIL', value: '`#bienvenue` ce guide · `#outils` une fiche par outil (état en direct, liens, vérification)' },
      { name: '📋 PILOTAGE', value: '`#pannel` vue d\'ensemble de TOUT (boutons) · `#plan` le plan MVP · `#questions` questions de Claude, résolutions, rappels · `#brainstorming` discuter sans coder' },
      { name: '🗓 PLANNING', value: '`#tâches` tous les lots documentés · `#journal-planning` chaque changement · **Événements** du serveur = runs de nuit prévus' },
      { name: '🛠 DEV (forums)', value: '`dev` `front-end` `back-end` `da` : un post = un sujet. Claude y écrit avancement, raisonnement, questions. Les rapports de nuit y arrivent.' },
      { name: `${Object.values(PROJECTS).map(p => p.emoji).join(' ')} Un dossier par projet`, value: '`#panel-…` état du projet · `#logs-…` derniers logs (e-mails et jetons masqués) + alertes · `#data-…` chiffres clés, sauvegardes, historique quotidien' },
      { name: '🚀 PROD · 🗄 ARCHIVES', value: '`#prod` analyse en lecture seule · `#logs` alertes globales · `#archives` fils terminés' },
    ),
    new EmbedBuilder().setColor(0x22c55e).setTitle('🔁 Comment le dev avance').setDescription([
      '1. Le plan (`docs/plan/mvp-refonte.md`) liste des **lots**. `/lot id:L22 statut:prêt` en ajoute un à la file.',
      '2. Chaque nuit à 2 h UTC (ou tout de suite avec **`/go`**), le robot prend le premier lot « prêt » : branche → code → vérifications (sous-agents) → **PR**.',
      '3. Son rapport arrive en post dans le forum `dev`. Les événements du serveur montrent quel lot passe quelle nuit.',
      '4. **Tu relis la PR** sur GitHub. Le déploiement en prod reste une décision humaine : le robot ne pousse jamais sur `main` et ne déploie jamais.',
      '5. Demande ponctuelle : écris dans un forum DEV (Claude code sur une branche) ou dans `#brainstorming` (conseil sans code).',
    ].join('\n')),
    new EmbedBuilder().setColor(0xf59e0b).setTitle('❓ Répondre aux questions de Claude').setDescription([
      '• Chaque question ouvre **son propre post** ❓ dans le forum, avec des **boutons** (ou un menu s\'il y a beaucoup de choix). « Autre » = répondre par écrit dans le post.',
      '• Ta réponse est renvoyée à Claude, qui reprend là où il en était ; le post passe en ✅ Résolu.',
      '• `#questions` résume chaque résolution et te **mentionne** toutes les 6 h (8 h-23 h) tant qu\'une question attend.',
    ].join('\n')),
    new EmbedBuilder().setColor(0x06b6d4).setTitle('🧰 Gérer tes outils').setDescription([
      'Chaque outil a une fiche dans `#outils`, une ligne dans `#pannel` et dans le panneau de son projet. Contrôles possibles : `http` (URL), `docker` (conteneur), `process` (ligne de commande), `file` (fichier présent).',
      'Un outil **critique** qui tombe → alerte avec mention dans le `#logs-…` de son projet, puis un message quand il revient.',
      '• `/outil ajouter` — enregistrer un nouvel outil (projet, type, contrôle, liens)',
      '• `/outil modifier` — changer description, liens, contrôle, criticité (seuls les champs fournis changent)',
      '• `/outil retirer` · `/outil liste`',
    ].join('\n')),
    new EmbedBuilder().setColor(0x64748b).setTitle('⌨️ Commandes').setDescription([
      '`/statut` état du robot, prod, PR · `/go` lancer le robot maintenant · `/lot` changer le statut d\'un lot',
      '`/plan` republier plan + tâches · `/questions` questions en attente',
      '`/outil …` gérer les outils · `/oublier` repartir à zéro dans un fil · `/archiver` ranger un fil',
    ].join('\n')),
    new EmbedBuilder().setColor(0x64748b).setTitle('🔐 Sécurité & limites').setDescription([
      '• Le bot n\'obéit qu\'à toi. Claude n\'a ni `sudo`, ni `ssh`, ni accès à la prod ; il ne pousse jamais sur `main`.',
      '• Logs et données des projets : **collecteur en lecture seule** (`/home/ubuntu/ops-status.py`, chaque minute) — comptes de lignes seulement, e-mails et jetons masqués.',
      '• Quota : abonnement Claude Pro ; modèle Sonnet + sous-agents Haiku pour économiser.',
    ].join('\n')),
    new EmbedBuilder().setColor(0x8b5cf6).setTitle('🔗 Liens').setDescription(`[Tableau de bord web](${DASHBOARD_URL}) · [terpologie.eu](https://terpologie.eu) · [Dépôt GitHub](https://github.com/${REPO})`),
  ]
  const publishOnboarding = () => upsert(channels.bienvenue, 'onboarding', { content: '', embeds: onboardingEmbeds() }, { pin: true })

  const TOOL_PROJECTS = [...Object.keys(PROJECTS), 'autres'].map(k => ({ name: PROJECT_LABEL[k], value: k }))
  const TOOL_KINDS = ['Site', 'Bot Discord', 'API', 'Outil interne', 'Infra'].map(k => ({ name: k, value: k }))
  const CHECK_TYPES = ['http', 'docker', 'process', 'file', 'self'].map(k => ({ name: k, value: k }))
  const toolOptions = (b, required) => b
    .addStringOption(o => o.setName('id').setDescription('identifiant court, ex. quitaddiction').setRequired(true))
    .addStringOption(o => o.setName('nom').setDescription('nom affiché').setRequired(required))
    .addStringOption(o => o.setName('projet').setDescription('projet').setRequired(required).addChoices(...TOOL_PROJECTS))
    .addStringOption(o => o.setName('type').setDescription('type d\'outil').setRequired(false).addChoices(...TOOL_KINDS))
    .addStringOption(o => o.setName('description').setDescription('à quoi il sert').setRequired(false))
    .addStringOption(o => o.setName('controle').setDescription('type de contrôle de santé').setRequired(false).addChoices(...CHECK_TYPES))
    .addStringOption(o => o.setName('cible').setDescription('URL, nom de conteneur, motif de processus ou chemin').setRequired(false))
    .addStringOption(o => o.setName('url').setDescription('lien public').setRequired(false))
    .addStringOption(o => o.setName('depot').setDescription('lien du dépôt').setRequired(false))
    .addBooleanOption(o => o.setName('critique').setDescription('alerte + mention s\'il tombe').setRequired(false))
  const toolCommand = new SlashCommandBuilder().setName('outil').setDescription('Gérer le registre des outils')
    .addSubcommand(s => toolOptions(s.setName('ajouter').setDescription('Enregistrer un nouvel outil'), true))
    .addSubcommand(s => toolOptions(s.setName('modifier').setDescription('Modifier un outil (seuls les champs fournis changent)'), false))
    .addSubcommand(s => s.setName('retirer').setDescription('Retirer un outil du registre').addStringOption(o => o.setName('id').setDescription('identifiant').setRequired(true)))
    .addSubcommand(s => s.setName('liste').setDescription('Lister les outils et leur état'))
  const handleToolCommand = async (i) => {
    const sub = i.options.getSubcommand()
    if (sub === 'liste') {
      return i.editReply(clip(Object.keys(PROJECT_LABEL).map((p) => {
        const l = tools.filter(t => t.project === p)
        return l.length ? `**${PROJECT_LABEL[p]}**\n${l.map(t => `${toolLine(t)} — \`${t.id}\``).join('\n')}` : null
      }).filter(Boolean).join('\n\n'), 1990))
    }
    const id = i.options.getString('id').trim().toLowerCase().replace(/[^a-z0-9-]/g, '-')
    const existing = tools.find(t => t.id === id)
    if (sub === 'retirer') {
      if (!existing) return i.editReply(`Outil \`${id}\` introuvable.`)
      tools = tools.filter(t => t.id !== id); saveTools()
      const mid = state.msgs[`tool-${id}`]
      if (mid) await channels.outils?.messages.delete(mid).catch(() => {})
      delete state.msgs[`tool-${id}`]; delete state.toolStates[id]; saveState()
      await journal(`outil retiré : **${existing.name}** (\`${id}\`)`)
      return i.editReply(`🗑 Outil **${existing.name}** retiré.`)
    }
    if (sub === 'ajouter' && existing) return i.editReply(`L'id \`${id}\` existe déjà — utilise \`/outil modifier\`.`)
    if (sub === 'modifier' && !existing) return i.editReply(`Outil \`${id}\` introuvable.`)
    const t = existing ?? { id, checks: [] }
    const get = (k) => i.options.getString(k)
    if (get('nom')) t.name = get('nom')
    if (get('projet')) t.project = get('projet')
    if (get('type')) t.kind = get('type')
    if (get('description')) t.description = get('description')
    if (get('url')) t.url = get('url')
    if (get('depot')) t.repo = get('depot')
    if (i.options.getBoolean('critique') !== null) t.critical = i.options.getBoolean('critique')
    if (get('controle')) t.checks = [{ type: get('controle'), target: get('cible') ?? undefined }]
    else if (get('cible') && t.checks[0]) t.checks[0].target = get('cible')
    if (!existing) tools.push(t)
    saveTools()
    await refreshAll()
    await journal(`outil ${existing ? 'modifié' : 'ajouté'} : **${t.name}** (\`${t.id}\`, ${PROJECT_LABEL[t.project] ?? t.project})`)
    return i.editReply({ content: `✅ Outil ${existing ? 'modifié' : 'ajouté'}.`, embeds: [toolEmbed(t)] })
  }

  const handleButton = async (i, kind, action, id) => {
    if (kind === 'tool' && action === 'check') {
      await checkTools(id)
      const t = tools.find(x => x.id === id)
      if (!t) return i.reply({ content: 'Outil inconnu.', ephemeral: true })
      return i.update({ embeds: [toolEmbed(t)], components: [linkRow(t)] })
    }
    if (kind === 'proj' && action === 'refresh') {
      await checkTools()
      return i.update({ embeds: [projectPanel(id)], components: projectComponents(id) })
    }
    return null
  }

  return { refreshAll, publishOnboarding, toolsSummary, toolCounts, toolCommand, handleToolCommand, handleButton, getTools: () => tools, stateOf }
}
