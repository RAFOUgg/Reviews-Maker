# 🌱 FertilizationPipeline - Quick Reference Card

## 🚀 Quick Start

```jsx
import FertilizationPipeline from '@/components/pipelines/legacy/FertilizationPipeline';

const FERTILIZERS = [
  'Solutions nutritives NPK',
  'BioBizz Bio-Grow',
  'Advanced Nutrients',
  'Fumiers compostés'
];

function MyForm() {
  const [fertilizers, setFertilizers] = useState([]);
  
  return (
    <FertilizationPipeline
      value={fertilizers}
      onChange={setFertilizers}
      availableFertilizers={FERTILIZERS}
    />
  );
}
```

---

## 📋 Props API

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `value` | `Array<Step>` | ✅ | Current fertilizer steps |
| `onChange` | `(steps) => void` | ✅ | Update callback |
| `availableFertilizers` | `string[]` | ✅ | Available fertilizer types |

### Step Object Structure
```typescript
{
  id: string,              // Unique timestamp
  name: string,            // Fertilizer type
  commercialName?: string, // If commercial type
  npk?: string,            // If NPK type (e.g., "8-2-6")
  phase: 'croissance' | 'floraison' | 'tout',
  dose: string,            // e.g., "2 ml/L"
  frequency: string        // e.g., "3x/sem"
}
```

---

## 🎯 Common Use Cases

### 1. Basic Implementation
```jsx
<FertilizationPipeline
  value={data.fertilizers || []}
  onChange={(fert) => setData({ ...data, fertilizers: fert })}
  availableFertilizers={FERTILIZERS_LIST}
/>
```

### 2. With Pre-filled Data
```jsx
const initialSteps = [
  {
    id: '1',
    name: 'BioBizz Bio-Grow',
    commercialName: 'BioBizz Grow',
    phase: 'croissance',
    dose: '2 ml/L',
    frequency: '3x/sem'
  }
];

<FertilizationPipeline
  value={initialSteps}
  onChange={handleChange}
  availableFertilizers={FERTILIZERS}
/>
```

### 3. Nested in Complex Form
```jsx
const [reviewData, setReviewData] = useState({
  cultivationPipeline: { fertilizers: [] }
});

<FertilizationPipeline
  value={reviewData.cultivationPipeline.fertilizers}
  onChange={(fertilizers) => 
    setReviewData(prev => ({
      ...prev,
      cultivationPipeline: {
        ...prev.cultivationPipeline,
        fertilizers
      }
    }))
  }
  availableFertilizers={FERTILIZERS_LIST}
/>
```

---

## 🔍 Validation Rules

| Fertilizer Type | Required Fields |
|-----------------|-----------------|
| **NPK Solutions** | N, P, K values (0-99) |
| **Commercial** | Commercial name (text) |
| **Organic** | None (just dose & frequency) |

**All Types Require:**
- ✅ Fertilizer type selected
- ✅ Dose amount (number > 0)
- ✅ Frequency number (1-10)

---

## 🎨 UI Features

### Form Section
- Phase selector (croissance/floraison/tout)
- Fertilizer type dropdown
- Conditional inputs (NPK or Commercial name)
- Dose (amount + unit: ml/L, g/L, g, oz)
- Frequency (number + unit: sec, jours, sem, mois)

### Steps List
- Numbered cards with phase icons
- Badges (phase, commercial, NPK)
- Hover controls: ↑ ↓ ✕
- Empty state placeholder

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Button disabled | Check all required fields filled |
| onChange not firing | Use `useCallback` in parent |
| Steps not showing | Verify `value` is array |
| Styles broken | Check CSS variables loaded |

---

## 🎨 Theming

### CSS Variables Used
```css
--bg-input        /* Form background */
--bg-surface      /* Card background */
--text-primary    /* Main text */
--text-secondary  /* Labels */
--color-accent    /* Highlights */
--color-danger    /* Delete button */
--primary         /* Add button */
```

---

## 📊 Data Flow

```
Parent Component
    ↓ value prop
FertilizationPipeline
    ↓ steps state (useState)
User Interaction
    ↓ addStep/removeStep/moveStep
    ↓ onChange callback
Parent Component (updated)
```

---

## 🔗 Integration Points

### Parent Components
- `CultivationPipelineForm.jsx`
- `ReviewForm.jsx` (FLOWER type)

### Data Storage
```json
{
  "cultivationPipeline": {
    "fertilizers": [ /* steps array */ ]
  }
}
```

### Export Usage
- Template DÉTAILLÉ: Shows top 5 steps
- Template COMPLÈTE: Shows all steps

---

## ⚡ Performance Notes

- ✅ Works well with 10-20 steps
- ⚠️ Consider virtualisation for 50+ steps
- 🔄 Re-renders on every form input

### Optimization Ideas
```jsx
// Memoize validation
const canAdd = useMemo(() => canAddStep(), [deps]);

// Callback for onChange
const handleChange = useCallback((steps) => {
  onChange(steps);
}, [onChange]);
```

---

## 📚 Full Documentation

**Complete Guide:** [FertilizationPipeline.md](./FertilizationPipeline.md)

**Sections:**
- Props & Types
- State Management  
- Business Logic
- UI Structure
- Examples (3)
- Troubleshooting (detailed)
- Roadmap

---

## 💡 Tips & Best Practices

1. **Always provide array default:** `value={data.fertilizers || []}`
2. **Use useCallback for onChange:** Prevents re-renders
3. **Validate before save:** Check all steps have required fields
4. **Consider mobile:** Hover controls need touch alternative
5. **Limit steps:** UX degrades after ~20 steps

---

## 🚦 Status Indicators

| Status | Meaning |
|--------|---------|
| 🟢 Production Ready | Current v1 legacy |
| 🟡 Maintenance Mode | Bug fixes only |
| 🔵 v2 Planned | Drag & drop, edit in-place |

---

**Quick Reference Version:** 1.0.0
**Last Updated:** 2026-01-14
**Full Docs:** [FertilizationPipeline.md](./FertilizationPipeline.md)
