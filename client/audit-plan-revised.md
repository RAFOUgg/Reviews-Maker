# Plan d'Audit Méthodologique ExportMaker - VERSION RÉVISÉE

## Méthodologie Adaptée : TEST → ANALYSE → CONCEPTUALISATION → AMÉLIORATION

Base sur l'audit exhaustif des fonctionnalités, nous appliquons maintenant une vérification systémique de **chaque fonctionnalité existante** avant tout refactoring.

---

## PHASE 1 : Infrastructure + Vérification Fonctionnelle Exhaustive

### Itération 1 : Infrastructure de Test ✅ COMPLÉTÉ
- [x] Vitest + @testing-library/react configuré
- [x] setup.js avec mocks Canvas, localStorage, APIs externes
- [x] Scripts test npm run configurés

### Itération 2 : Tests de Vérification - 4 ONGLETS SYSTÈME

**BUT** : Valider que chaque onglet fonctionne sans régression

**Tests par onglet** :

#### **A) Onglet Template** (`sidebarTab = 'template'`)
- [ ] **4 templates disponibles** : modernCompact, detailedCard, blogArticle, socialStory
- [ ] **5 ratios supportés** : 1:1, 16:9, 9:16, 4:3, A4
- [ ] **Selection + preview** : Change template → preview update temps réel
- [ ] **Design sizes** : Canvas renders à la bonne taille (540x540 pour 1:1, etc.)
- [ ] **Canvas scaling** : ResponsivePreview adapte selon container

#### **B) Onglet Contenu** (`sidebarTab = 'contenu'`)
- [ ] **ContentModuleControls** : Enable/disable modules par type produit
- [ ] **Module mapping** : `getModulesByProductType` cohérent (flower/hash/concentrate/edible)
- [ ] **DragDropExport PRO** : Si permissions → interface visible, sinon FeatureGate
- [ ] **Preview sync** : Disable module → disparaît du rendu immédiatement

#### **C) Onglet Apparence** (`sidebarTab = 'apparence'`)
- [ ] **TypographyControls** : Font-family, tailles, sync avec orchardConfig.typography
- [ ] **ColorPaletteControls** : 6 palettes + custom, sync avec orchardConfig.colors
- [ ] **ImageBrandingControls** : Upload logos, positioning
- [ ] **WatermarkEditor permissions** : Free → locked Terpologie, PRO → custom complet
- [ ] **Real-time preview** : Chaque changement d'apparence visible instantanément

#### **D) Onglet Préréglages** (`sidebarTab = 'prereglages'`)
- [ ] **PresetManager** : Save current config as preset
- [ ] **Load preset** : Apply + indicator "Actif"
- [ ] **Edit preset** : Modify name/description
- [ ] **Delete preset** : Confirmation + cleanup
- [ ] **Persistence** : Survit à refresh/session

### Itération 3 : Tests de Vérification - 5 FORMATS D'EXPORT

**BUT** : Valider chaque format d'export et ses permissions

#### **A) Exports de base (tous comptes)**
- [ ] **PNG Export** : Standard (2x) + High Quality (3x si PRO)
- [ ] **JPEG Export** : Quality 0.92/0.95, background blanc
- [ ] **PDF Export** : A4, auto-orientation, nom fichier correct
- [ ] **Nomenclature** : `review-${reviewName}-${Date.now()}.{ext}` respectée

#### **B) Exports PRO uniquement**
- [ ] **SVG Export** : FeatureGate si Free, export si PRO
- [ ] **GIF Export** : Nécessite pipeline, progress tracking, `exportPipelineToGIF`
- [ ] **High Quality toggle** : Disponible seulement si PRO

#### **C) Gestion d'erreurs export**
- [ ] **Preview indisponible** : Alert utilisateur propre
- [ ] **Export failed** : Console error + user feedback
- [ ] **GIF sans pipeline** : Block export avec explication
- [ ] **Timeout/memory** : Graceful handling sans crash

### Itération 4 : Tests de Vérification - GALERIE PUBLIQUE

**BUT** : Valider le workflow Save to Library complet

#### **A) Save to Library modal**
- [ ] **Modal states** : Open → form fields → loading → success/error
- [ ] **Form validation** : Name required, description optional
- [ ] **PNG capture** : Preview correctly captured pour upload
- [ ] **Error handling** : Network errors avec retry possible

#### **B) Public sharing permissions**
- [ ] **Ownership check** : Seulement l'auteur peut publier sa review
- [ ] **Public checkbox** : Disabled si pas owner
- [ ] **Visibility update** : Review devient publique via PATCH API
- [ ] **Gallery integration** : Export visible dans galerie après success

#### **C) API Integration**
- [ ] **POST /api/library/exports** : FormData upload correct
- [ ] **PATCH /api/reviews/{id}/visibility** : Si public + owner
- [ ] **Error responses** : Handled gracefully avec user feedback

### Itération 5 : Tests de Vérification - EDGE CASES & USER FLOWS

**BUT** : Valider tous les edge cases identifiés

#### **A) Edge Cases Techniques**
- [ ] **Preview ref null** : No crash if `exportRef.current` undefined
- [ ] **Empty presets list** : Placeholder motivant displayed
- [ ] **Concurrent exports** : Prevention double-export via exporting state
- [ ] **Large files export** : Memory management high-res sans leak
- [ ] **Mobile UI** : Touch interactions + responsive behavior

#### **B) Permissions dynamiques**
- [ ] **Account type change** : Features update en temps réel
- [ ] **FeatureGate accuracy** : Bon message selon fonctionnalité bloquée
- [ ] **Graceful degradation** : Fonctionnalités désactivées avec explications

#### **C) User Flows critiques**
- [ ] **Flow 1 - Export rapide** : Open → Default template → Export PNG → Download
- [ ] **Flow 2 - Customisation** : Template → Modules → Colors → Preset Save → Export
- [ ] **Flow 3 - Partage public** : Export → Save library → Check public → Upload → Review public
- [ ] **Flow 4 - Workflow preset** : Load preset → Adjust → Export → Update preset
- [ ] **Flow 5 - PRO features** : Custom layout → Custom watermark → HQ export → SVG

---

## PHASE 2 : Analyse et Conceptualisation d'Améliorations

### Itération 6 : Analyse des Tests - Identification Fragilités

**BUT** : Based sur les tests, identifier les améliorations prioritaires

#### **A) Audit performance**
- [ ] **Mesurer temps export** : PNG/JPEG/PDF/SVG pour baseline
- [ ] **Memory usage** : Profiler avec DevTools pour détecter leaks
- [ ] **Re-renders count** : React DevTools pour optimisation opportunities
- [ ] **Bundle size** : Impact des lazy imports (html-to-image, jsPDF)

#### **B) Audit stabilité**
- [ ] **Error rate** : % tests qui passent/échouent par fonctionnalité
- [ ] **Edge cases coverage** : % scenarios edge cases gérés proprement
- [ ] **Cross-browser** : Test results Chrome/Firefox/Safari/Edge

#### **C) Audit UX**
- [ ] **User feedback** : Chaque action a state feedback (loading, success, error)
- [ ] **Accessibilité** : Keyboard navigation, screen readers
- [ ] **Performance perçue** : Loading states, skeleton UI où approprié

### Itération 7 : Conceptualisation des Améliorations

**BUT** : Prioriser et concevoir les améliorations nécessaires

#### **A) Architecture - refactoring prioritaire**
- [ ] **resolveReviewField extraction** : Isoler parser critique avec cache
- [ ] **Components modularity** : Extract ExportPreview, ExportControls, ExportModal
- [ ] **Performance optimization** : useMemo, useCallback, lazy loading
- [ ] **State management** : Group related states, minimize re-renders

#### **B) Fonctionnalités - améliorations UX**
- [ ] **Template preview** : Mini preview dans template selection
- [ ] **Export queue** : Multiple exports en parallèle
- [ ] **Batch operations** : Export multiple formats simultanément
- [ ] **Advanced presets** : Import/export presets, template-specific presets

#### **C) Robustesse - error handling**
- [ ] **Retry mechanisms** : Auto-retry pour network failures
- [ ] **Fallback templates** : Si template custom fail, fallback graceful
- [ ] **Progressive enhancement** : Core functionality works, advanced features enhanced
- [ ] **Monitoring integration** : Error tracking, performance metrics

---

## PHASE 3 : Implémentation Incrémentale des Améliorations

### Itération 8 : Refactoring sans régression

**BUT** : Implementer améliorations une par une avec validation continue

#### **A) Extract & Modularize**
- [ ] **resolveReviewField utils** : Extract → test independent → replace
- [ ] **ExportPreview component** : Extract → test → integrate
- [ ] **ExportControls component** : Extract → test → integrate
- [ ] **Save to Library modal** : Extract → test → integrate

#### **B) Performance optimizations**
- [ ] **Template rendering cache** : Avoid re-rendering unchanged templates
- [ ] **Optimistic UI** : Instant feedback pour user actions
- [ ] **Memory optimization** : Cleanup resources after export
- [ ] **Bundle optimization** : Further lazy loading opportunities

#### **C) Validation de non-régression**
- [ ] **Re-run all tests** : Après chaque modification
- [ ] **User acceptance** : Tous les workflows originaux fonctionnent
- [ ] **Performance comparison** : Before vs after benchmarks
- [ ] **Error rate** : Même ou meilleure stabilité qu'avant

---

## Métriques de Validation par Itération

### Critères de Passage
- **Tests unitaires** : ≥95% pass rate
- **User flows** : 100% des 5 flows critiques fonctionnent
- **Performance** : Export ≤5s, Preview ≤200ms
- **Edge cases** : 100% des 10 edge cases gérés

### Critères d'Arrêt
- Si un test échoue : STOP → DEBUG → FIX → Re-test
- Si performance dégradée : STOP → OPTIMIZE → Re-measure
- Si user flow brisé : STOP → REPAIR → Full test suite

### Critères de Succès Final
- **Fonctionnalité** : 100% features conservées + améliorées
- **Stabilité** : 0 régression, +20% performance
- **Maintenabilité** : Code modularisé, bien testé, documenté
- **UX** : Même interface, meilleure performance perçue

Cette approche garantit qu'**aucune fonctionnalité existante ne soit brisée** pendant l'audit et l'amélioration du système ExportMaker.