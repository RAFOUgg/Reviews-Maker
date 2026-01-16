# 🚀 CHECKLIST PRÉ-SPRINT 1 - ACTIONS IMMÉDIATES

**Deadline**: Prêt lancer Sprint 1 **Lundi 20 janvier 2026**  
**Responsable**: Tech Lead + PM  
**Effort**: 2-3 jours travail

---

## 📋 CHECKLIST SETUP (Par rôle)

### 👔 PM / PRODUCT MANAGER

**Deadline**: Aujourd'hui EOD (Jan 16)

- [ ] **Read**:
  - [ ] DASHBOARD_V1_MVP_STATUS.md (30 min)
  - [ ] PLAN_EXECUTION_V1_MVP.md timeline section (20 min)

- [ ] **Approve**:
  - [ ] V1 MVP scope (10 sections, 3 accounts, 3-4 weeks)
  - [ ] Timeline realistic (Feb 5 go-live target)
  - [ ] Effort estimate (39-46 days dev)

- [ ] **Give Green Light**:
  - [ ] Assign resources: 2-3 devs
  - [ ] Budget approved (if needed)
  - [ ] Communicate kickoff email to team

**Questions avant signature?**:
- [ ] Scope locked? (Fleurs only, no other types)
- [ ] Timeline OK? (3-4 weeks acceptable?)
- [ ] Resources available? (2-3 devs allocated?)

---

### 👨‍💼 TECH LEAD

**Deadline**: Jeudi EOD (Jan 18)

#### Section A: Documentation Review (Thu-Fri Jan 16-17)

- [ ] **Read**:
  - [ ] CAHIER_DES_CHARGES_V1_MVP_FLEURS.md (1h full)
  - [ ] PLAN_EXECUTION_V1_MVP.md (1h full)
  - [ ] VALIDATION_V1_MVP_FLEURS.md Part 1 (30 min)

- [ ] **Validate**:
  - [ ] Architecture sounds solid?
  - [ ] Permissions model clear?
  - [ ] Blockers identified?
  - [ ] Timeline realistic?

- [ ] **Flag any issues**:
  - [ ] Changes needed to spec?
  - [ ] Technical concerns?
  - [ ] Resource constraints?

#### Section B: Resource Planning (Fri Jan 17)

- [ ] **Resource Assignment**:
  - [ ] Senior dev → Sprint 1 Permissions (fulltime)
  - [ ] Frontend lead → Sprint 2-3 UI (estimated weeks)
  - [ ] Backend lead → Sprint 4 Export (estimated days)

- [ ] **Skill Matching**:
  - [ ] React Flow expertise? (PhenoHunt complexity)
  - [ ] Export libraries knowledge? (html-to-image, jspdf)
  - [ ] Prisma/SQL strong? (Pipeline queries)

#### Section C: Ticket Creation (Fri-Mon Jan 17-20)

- [ ] **Create Jira Tickets** (or equivalent):
  - [ ] Sprint 1 epic: "Permissions Implementation" (5 tickets)
  - [ ] Sprint 2 epic: "PhenoHunt & Library" (6 tickets)
  - [ ] Sprint 3 epic: "Pipelines Visualization" (5 tickets)
  - [ ] Sprint 4 epic: "Export System" (5 tickets)
  - [ ] Sprint 5 epic: "Library CRUD" (4 tickets)
  - [ ] Sprint 6 epic: "Polish & UX" (4 tickets)
  - [ ] Sprint 7 epic: "Testing & QA" (5 tickets)

- [ ] **Ticket Details**:
  - [ ] Title + Description (from PLAN_EXECUTION_V1_MVP.md)
  - [ ] Story points estimated
  - [ ] Acceptance criteria from VALIDATION_V1_MVP_FLEURS.md
  - [ ] Assigned to developer
  - [ ] Sprint assigned (1-7)

#### Section D: Setup Communication (Mon Jan 20)

- [ ] **Slack Setup**:
  - [ ] Create #v1-mvp-fleurs channel
  - [ ] Invite: PM, Devs, QA, DevOps
  - [ ] Pin: DASHBOARD_V1_MVP_STATUS.md + PLAN_EXECUTION_V1_MVP.md

- [ ] **Calendar Setup**:
  - [ ] 10am Daily Standup (30 min, Mon-Fri)
  - [ ] 4pm Friday Status (30 min, Fridays)
  - [ ] Sprint planning (Monday 10am, then Fridays after)

- [ ] **Documentation Access**:
  - [ ] Docs in shared drive (not just local)
  - [ ] Everyone has access
  - [ ] Link in Jira project description

#### Section E: Kickoff Prep (Mon Jan 20 before 10am)

- [ ] **Kickoff Email** sent:
  ```
  To: Team
  Subject: V1 MVP Fleurs Sprint 1 Kicks Off Today!
  
  Content:
  - V1 MVP overview (3 min read)
  - Sprint 1 focus (Permissions)
  - Daily standup: 10am #v1-mvp-fleurs
  - Jira tickets assigned
  - Questions? Ask in channel
  
  Links:
  - DASHBOARD_V1_MVP_STATUS.md
  - GUIDE_LECTURE_CAHIER_DES_CHARGES.md (read your section)
  ```

- [ ] **Kickoff Call** (10am):
  - [ ] Present V1 MVP vision (10 min)
  - [ ] Explain Sprint 1 (10 min)
  - [ ] Q&A (10 min)
  - [ ] Assign first tasks (5 min)

---

### 💻 DEVELOPERS

**Deadline**: Dimanche EOD (Jan 19) - Ready Monday morning

#### For EACH Dev

- [ ] **Read Docs**:
  - [ ] GUIDE_LECTURE_CAHIER_DES_CHARGES.md your section (10 min)
  - [ ] CAHIER_DES_CHARGES relevant sections (30 min)
  - [ ] PLAN_EXECUTION_V1_MVP.md your sprint (30 min)
  - [ ] VALIDATION_V1_MVP_FLEURS.md your checklist (20 min)

- [ ] **Local Setup**:
  - [ ] Clone latest repo
  - [ ] Install dependencies: `npm install` (client + server-new)
  - [ ] Setup .env files (copy template if exists)
  - [ ] Create local DB: `npm run prisma:migrate`
  - [ ] Test local start: `npm run dev` (both)
  - [ ] Open browser: http://localhost:5173
  - [ ] Can login? Can navigate?

- [ ] **Assigned Tasks**:
  - [ ] Jira: Claim your first ticket
  - [ ] Read acceptance criteria
  - [ ] Understand task scope
  - [ ] Estimate time needed
  - [ ] Ask clarifications before starting

#### Sprint 1 Dev (Permissions Focus)

- [ ] **Extra**:
  - [ ] Review middleware auth pattern (Express)
  - [ ] Review permission matrix (VALIDATION doc)
  - [ ] Sketch backend middleware code
  - [ ] Sketch frontend permission checks
  - [ ] Prepare for Monday kickoff

#### Other Devs (Waiting for Sprint 2+)

- [ ] **Extra**:
  - [ ] Review your sprint tech stack
  - [ ] Install/spike libraries if needed (React Flow, html-to-image)
  - [ ] Read relevant sections deep
  - [ ] Ask questions in Slack before your sprint

---

### 🧪 QA / TESTER

**Deadline**: Jeudi EOD (Jan 18)

- [ ] **Read**:
  - [ ] VALIDATION_V1_MVP_FLEURS.md (1.5h full)
  - [ ] PLAN_EXECUTION_V1_MVP.md Sprint 7 (30 min)
  - [ ] CAHIER_DES_CHARGES workflows (30 min)

- [ ] **Create Test Plan**:
  - [ ] Permissions matrix (60 test cases: 3 types × 20 features)
  - [ ] Workflows (5 main E2E scenarios)
  - [ ] Edge cases (empty fields, large files, etc.)
  - [ ] Performance targets (export < 5s, UI smooth)
  - [ ] Document in shared drive

- [ ] **Setup Testing Environment**:
  - [ ] Cypress or Playwright installed
  - [ ] Test user accounts created (Amateur/Producteur/Influenceur)
  - [ ] Test DB seeded with data
  - [ ] Browser extensions/tools ready

- [ ] **Prepare**:
  - [ ] Ask for test credentials Friday
  - [ ] Confirm test environment ready Monday
  - [ ] Schedule test strategy review with devs

---

### 🛠️ DEVOPS / INFRASTRUCTURE

**Deadline**: Vendredi EOD (Jan 17)

- [ ] **Environment Setup**:
  - [ ] Staging server ready (mirror production)
  - [ ] Database backup automated
  - [ ] Logs collection configured

- [ ] **CI/CD Pipeline**:
  - [ ] GitHub Actions configured (if not)
  - [ ] Tests run on every PR
  - [ ] Build succeeds on main branch
  - [ ] Deployment script ready (deploy-vps.sh)

- [ ] **Monitoring**:
  - [ ] Error tracking tool (Sentry/LogRocket)?
  - [ ] Performance monitoring (DataDog/NewRelic)?
  - [ ] Uptime monitoring?
  - [ ] Alert thresholds set

- [ ] **Documentation**:
  - [ ] Deployment runbook updated
  - [ ] Rollback procedure documented
  - [ ] Team aware of deployment process

---

## 🗂️ REPOSITORY CLEANUP

**Responsible**: Tech Lead  
**Deadline**: Jeudi EOD (Jan 18)  
**Time**: ~2 hours

### Execute from [AUDIT_FICHIERS_OBSOLETES.md](AUDIT_FICHIERS_OBSOLETES.md):

```bash
# Phase 1: Create archive folder
mkdir ARCHIVE_AUDIT_2026

# Phase 2: Delete obsolete files (18 items)
# See AUDIT_FICHIERS_OBSOLETES.md for full list
rm fix-imports.js
rm fix-imports-v2.js
# ... (rest of list)

# Phase 3: Archive older audit/refactor docs (29 items)
# See document for full list
mv AUDIT_FLEURS_COMPLET.json ARCHIVE_AUDIT_2026/
# ... (rest of list)

# Phase 4: Verify
git status
# Should show many deletions + renames

# Phase 5: Commit
git add -A
git commit -m "chore: clean audit artifacts - organize for V1 MVP"
git push
```

- [ ] Execute cleanup
- [ ] Commit to repo
- [ ] Push to main
- [ ] Verify: Root project clean (< 15 .md files)

---

## 📋 FINAL CHECKLIST MONDAY MORNING

### 8am - Tech Lead Arrives

- [ ] Email sent to team (if not Friday)
- [ ] Jira tickets all created
- [ ] Slack channel active
- [ ] Kickoff call scheduled 10am
- [ ] Dev assignments clear

### 9am - Devs Arrive

- [ ] Local environments setup
- [ ] Can access Jira + Slack
- [ ] Read docs complete
- [ ] Questions in channel
- [ ] Ready for kickoff

### 10am - KICKOFF CALL

**Duration**: 30 min  
**Agenda**:

1. **Welcome** (2 min)
   - Introduce V1 MVP
   - Set tone: collaborative, daily sync

2. **Vision** (5 min)
   - Show dashboard overview
   - Explain 3-4 weeks timeline
   - Explain Fleurs → Hash/Conc/Comestibles sequence

3. **Sprint 1 Focus** (5 min)
   - Permissions most critical
   - Why first: Business logic
   - What gets unlocked: Everything else

4. **My Role** (10 min)
   - PM: Approver, blocker resolver
   - Tech Lead: Day-to-day lead, decisions
   - Devs: Implement sprints, daily sync
   - QA: Validation, feedback
   - DevOps: Deployment support

5. **Logistics** (3 min)
   - Daily standups: 10am, 15 min, here
   - Slack for questions
   - Weekly reviews: Fridays
   - Blockers: Raise immediately

6. **Q&A** (3 min)
   - Any urgent questions?
   - Otherwise: Read docs, start coding!

### 10:30am - Sprint 1 STARTS

- [ ] Senior dev starts Permissions sprint
- [ ] First task claimed in Jira
- [ ] Dev setup, coffee ready
- [ ] Let's GO! 🚀

---

## 📞 CRITICAL CONTACTS

### If You Have Questions...

| Question | Contact | Response Time |
|---|---|---|
| Feature spec clarification | Tech Lead | 1 hour |
| Blocker in code | Tech Lead | 30 min |
| Performance issue | Backend Lead | 30 min |
| UI/UX question | Frontend Lead | 30 min |
| Test case doubt | QA Lead | 1 hour |
| Deployment issue | DevOps | 30 min |
| Business decision | PM | 2 hours |

---

## 🎯 SUCCESS CRITERIA

### By EOD Monday Jan 20

✅ **Deliverables**:
- Sprint 1 Permissions task started (1st commit)
- Daily standup happened (notes taken)
- All devs in Slack + Jira
- Local environments working

✅ **Mindset**:
- Team understands V1 MVP scope
- Everyone read their relevant docs
- Questions asked (none = potential issue)
- Energy level: 🟢 Positive

---

## ⚠️ RED FLAGS (ESCALATE IMMEDIATELY)

If any of these happen before Monday:

- [ ] Resource not confirmed (PM concern)
- [ ] Jira tickets not created (Tech Lead concern)
- [ ] Dev environment issues (DevOps concern)
- [ ] Disagreement on scope (PM + Tech Lead)
- [ ] Blocker in code already (Sprint 1 dev)

**Escalation**: Post in Slack #v1-mvp-fleurs immediately (don't wait)

---

## 📊 FINAL STATUS

**Ready for Sprint 1?**

| Item | Status | Responsible |
|---|---|---|
| Docs complete | ✅ YES | Tech Lead |
| Team assigned | ⚠️ PENDING | PM |
| Jira setup | ⚠️ PENDING | Tech Lead |
| Environment ready | ⚠️ PENDING | DevOps |
| Cleanup done | ⚠️ PENDING | Tech Lead |
| Kickoff scheduled | ⚠️ PENDING | Tech Lead |

---

## 🎯 ONE-PAGE SUMMARY

**What**: V1 MVP Fleurs system (10 sections, permissions, pipelines, export)  
**When**: 3-4 weeks (start Jan 20, launch ~Feb 5)  
**Who**: 2-3 devs + PM + QA  
**Where**: Main branch, staging deploy, then production  
**Why**: Launch business model (3 account tiers, revenue)  

**First Sprint Focus**: Permissions (1 week)  
**Success Metric**: All 60 permission tests passing  
**Go/No-Go**: Friday 5pm Sprint 1 status review  

---

**Document**: Pré-Sprint 1 Checklist  
**Owner**: Tech Lead  
**Last Update**: Jan 16 2026  
**Status**: 🟡 **IN PROGRESS** (waiting PM approval)

**NEXT ACTION**: PM approves dashboard → Tech lead starts checklist
