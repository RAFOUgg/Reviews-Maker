# Pull Request Template - Terpologie MVP1

## 📋 Description

**Feature:** (Feature #X from PHASE1_CHECKLIST.md)

**What:** Brief description of changes made

**Why:** Why this change was needed (bug? new feature? refactoring?)

**How:** Technical approach / implementation details

---

## ✅ Testing

- [ ] Tested locally (describe scenarios)
- [ ] No console errors
- [ ] Tests pass (if applicable)
- [ ] Mobile responsive (if UI)

---

## 🔍 Checklist

### Code Quality
- [ ] Code follows project conventions
- [ ] No hardcoded values (use constants)
- [ ] Comments added for complex logic
- [ ] Imports are clean (no unused)
- [ ] No console.log (use proper logging)

### Permissions & Security
- [ ] Permissions checked (backend middleware)
- [ ] API returns 403 Forbidden if unauthorized
- [ ] No auth bypass
- [ ] Zustand state synced with backend

### Frontend (if applicable)
- [ ] Components use hooks correctly
- [ ] usePermissions() guard applied
- [ ] Zustand store updated (if user data changes)
- [ ] Responsive design tested

### Backend (if applicable)
- [ ] Route protection added
- [ ] requireFeature() or requireTier() middleware applied
- [ ] Error handling added
- [ ] Logging present

---

## 📍 Reference

**Cahier des Charges Section:** [Section X.Y](./CAHIER_DES_CHARGES_FINAL_GELE.md#section-xy)

**Related Issue:** #(issue number, if any)

---

## 🔗 Files Changed

List key files modified:
- `file1.js`
- `file2.jsx`
- `file3.sql`

---

## 📸 Screenshots (if UI changes)

(Paste screenshots here if visual changes)

---

## 🚨 Breaking Changes

- [ ] No breaking changes
- [ ] Breaking changes: (describe)

---

## 📝 Notes

Any additional context or edge cases?

