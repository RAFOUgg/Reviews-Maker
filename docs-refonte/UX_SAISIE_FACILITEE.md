# 🎯 Fonctionnalités UX - Saisie Facilitée

> **Objectif** : Rendre la création de reviews rapide et intuitive avec des composants interactifs

---

## 🌈 Roue des Terpènes Interactive

### Concept
Roue visuelle cliquable permettant de sélectionner rapidement les terpènes dominants d'une variété cannabis.

### Design

```
          🍋 Limonène
              ↑
    🌲 Pinène ← ⊙ → 🔥 Caryophyllène
              ↓
          🌸 Linalool
```

### Données Terpènes

```javascript
// src/data/terpenes.js
export const terpenes = [
  {
    id: 'myrcene',
    name: 'Myrcène',
    icon: '🌿',
    color: '#10B981', // Vert
    effects: ['Relaxant', 'Sédatif', 'Anti-inflammatoire'],
    aromas: ['Terreux', 'Musqué', 'Herbacé'],
    varieties: ['Blue Dream', 'OG Kush', 'Granddaddy Purple'],
  },
  {
    id: 'limonene',
    name: 'Limonène',
    icon: '🍋',
    color: '#FBBF24', // Jaune
    effects: ['Énergisant', 'Uplifting', 'Anti-stress'],
    aromas: ['Citron', 'Orange', 'Agrumes'],
    varieties: ['Lemon Haze', 'Super Lemon Haze', 'Durban Poison'],
  },
  {
    id: 'caryophyllene',
    name: 'Caryophyllène',
    icon: '🔥',
    color: '#EF4444', // Rouge
    effects: ['Anti-douleur', 'Anti-inflammatoire', 'Anti-anxiété'],
    aromas: ['Poivré', 'Épicé', 'Boisé'],
    varieties: ['Girl Scout Cookies', 'Bubba Kush', 'Sour Diesel'],
  },
  {
    id: 'pinene',
    name: 'Pinène',
    icon: '🌲',
    color: '#059669', // Vert foncé
    effects: ['Alerte', 'Mémoire', 'Anti-asthmatique'],
    aromas: ['Pin', 'Sapin', 'Résineux'],
    varieties: ['Jack Herer', 'Blue Dream', 'Strawberry Cough'],
  },
  {
    id: 'linalool',
    name: 'Linalool',
    icon: '🌸',
    color: '#A78BFA', // Violet
    effects: ['Calmant', 'Anti-stress', 'Sédatif'],
    aromas: ['Lavande', 'Floral', 'Doux'],
    varieties: ['Amnesia Haze', 'Lavender', 'LA Confidential'],
  },
  {
    id: 'terpinolene',
    name: 'Terpinolène',
    icon: '🍎',
    color: '#F472B6', // Rose
    effects: ['Sédatif léger', 'Anti-oxydant', 'Anti-bactérien'],
    aromas: ['Fruité', 'Floral', 'Herbacé'],
    varieties: ['Jack Herer', 'XJ-13', 'Golden Goat'],
  },
  {
    id: 'humulene',
    name: 'Humulène',
    icon: '🌾',
    color: '#D97706', // Orange foncé
    effects: ['Coupe-faim', 'Anti-inflammatoire', 'Antibactérien'],
    aromas: ['Terreux', 'Boisé', 'Houblon'],
    varieties: ['Girl Scout Cookies', 'Headband', 'White Widow'],
  },
  {
    id: 'ocimene',
    name: 'Ocimène',
    icon: '🌺',
    color: '#EC4899', // Rose vif
    effects: ['Décongestionnant', 'Antiviral', 'Antifongique'],
    aromas: ['Floral', 'Tropical', 'Herbal'],
    varieties: ['Golden Pineapple', 'Dutch Treat', 'Clementine'],
  },
];
```

### Composant React

```jsx
// src/components/TerpeneWheel.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { terpenes } from '../data/terpenes';

export default function TerpeneWheel({ value = [], onChange }) {
  const [hoveredId, setHoveredId] = useState(null);

  const toggleTerpene = (terpeneId) => {
    const newValue = value.includes(terpeneId)
      ? value.filter(id => id !== terpeneId)
      : [...value, terpeneId];
    onChange(newValue);
  };

  return (
    <div className="terpene-wheel">
      <div className="wheel-container">
        {terpenes.map((terpene, index) => {
          const angle = (360 / terpenes.length) * index;
          const isSelected = value.includes(terpene.id);
          const isHovered = hoveredId === terpene.id;
          
          return (
            <motion.button
              key={terpene.id}
              type="button"
              className={`terpene-segment ${isSelected ? 'selected' : ''}`}
              style={{
                '--angle': `${angle}deg`,
                '--color': terpene.color,
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleTerpene(terpene.id)}
              onMouseEnter={() => setHoveredId(terpene.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <span className="terpene-icon">{terpene.icon}</span>
              <span className="terpene-name">{terpene.name}</span>
            </motion.button>
          );
        })}
      </div>
      
      {/* Tooltip avec infos */}
      {hoveredId && (
        <motion.div
          className="terpene-tooltip"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {(() => {
            const t = terpenes.find(t => t.id === hoveredId);
            return (
              <>
                <h4>{t.icon} {t.name}</h4>
                <p className="effects">
                  <strong>Effets :</strong> {t.effects.join(', ')}
                </p>
                <p className="aromas">
                  <strong>Arômes :</strong> {t.aromas.join(', ')}
                </p>
              </>
            );
          })()}
        </motion.div>
      )}
      
      {/* Liste sélectionnée */}
      {value.length > 0 && (
        <div className="selected-terpenes">
          <h4>Terpènes sélectionnés :</h4>
          <div className="terpene-tags">
            {value.map(id => {
              const t = terpenes.find(t => t.id === id);
              return (
                <span key={id} className="terpene-tag" style={{ background: t.color }}>
                  {t.icon} {t.name}
                  <button onClick={() => toggleTerpene(id)}>×</button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
```

### CSS

```css
/* src/components/TerpeneWheel.css */
.terpene-wheel {
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.wheel-container {
  position: relative;
  width: 400px;
  height: 400px;
  margin: 0 auto;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.terpene-segment {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 140px;
  height: 60px;
  transform: 
    translate(-50%, -50%) 
    rotate(var(--angle)) 
    translateY(-140px);
  transform-origin: center center;
  
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.terpene-segment:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--color);
  box-shadow: 0 0 20px var(--color);
}

.terpene-segment.selected {
  background: var(--color);
  border-color: var(--color);
  color: white;
}

.terpene-icon {
  font-size: 24px;
}

.terpene-name {
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.terpene-tooltip {
  position: absolute;
  bottom: -120px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 400px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(16px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 10;
}

.terpene-tooltip h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
}

.terpene-tooltip p {
  margin: 4px 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

.selected-terpenes {
  margin-top: 24px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.terpene-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.terpene-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  color: white;
}

.terpene-tag button {
  background: none;
  border: none;
  color: white;
  font-size: 16px;
  cursor: pointer;
  opacity: 0.7;
}

.terpene-tag button:hover {
  opacity: 1;
}
```

---

## ⭐ Système de Notes sur 10 (Quick Rating)

### Composant Note Rapide

```jsx
// src/components/QuickRating.jsx
import { motion } from 'framer-motion';

export default function QuickRating({ label, value, onChange, max = 10 }) {
  return (
    <div className="quick-rating">
      <label className="rating-label">{label}</label>
      <div className="rating-buttons">
        {[...Array(max)].map((_, i) => {
          const rating = i + 1;
          const isSelected = rating === value;
          const isPassed = rating <= value;
          
          return (
            <motion.button
              key={rating}
              type="button"
              className={`rating-btn ${isSelected ? 'selected' : ''} ${isPassed ? 'passed' : ''}`}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onChange(rating)}
            >
              {rating}
            </motion.button>
          );
        })}
      </div>
      <div className="rating-display">
        <span className="rating-value">{value || '-'}</span>
        <span className="rating-max">/ {max}</span>
      </div>
    </div>
  );
}
```

### CSS

```css
/* src/components/QuickRating.css */
.quick-rating {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rating-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-muted);
}

.rating-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.rating-btn {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text);
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.rating-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--primary);
}

.rating-btn.passed {
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  border-color: var(--primary);
  color: white;
}

.rating-btn.selected {
  transform: scale(1.1);
  box-shadow: 0 0 20px var(--primary);
}

.rating-display {
  display: flex;
  align-items: baseline;
  gap: 4px;
  font-size: 32px;
  font-weight: 700;
}

.rating-value {
  color: var(--primary);
}

.rating-max {
  font-size: 20px;
  color: var(--text-muted);
}
```

---

## 🏷️ Tags / Labels Prédéfinis

### Données

```javascript
// src/data/predefined-tags.js

export const effectTags = [
  { id: 'relaxant', label: 'Relaxant', icon: '😌', category: 'effet' },
  { id: 'energisant', label: 'Énergisant', icon: '⚡', category: 'effet' },
  { id: 'euphorique', label: 'Euphorique', icon: '😊', category: 'effet' },
  { id: 'creatif', label: 'Créatif', icon: '🎨', category: 'effet' },
  { id: 'concentre', label: 'Concentré', icon: '🎯', category: 'effet' },
  { id: 'sociable', label: 'Sociable', icon: '💬', category: 'effet' },
  { id: 'endormant', label: 'Endormant', icon: '😴', category: 'effet' },
  { id: 'appetit', label: 'Stimule appétit', icon: '🍔', category: 'effet' },
];

export const flavorTags = [
  { id: 'citrus', label: 'Citrus', icon: '🍋', category: 'saveur' },
  { id: 'fruity', label: 'Fruité', icon: '🍓', category: 'saveur' },
  { id: 'earthy', label: 'Terreux', icon: '🌿', category: 'saveur' },
  { id: 'pine', label: 'Pin', icon: '🌲', category: 'saveur' },
  { id: 'sweet', label: 'Sucré', icon: '🍬', category: 'saveur' },
  { id: 'spicy', label: 'Épicé', icon: '🌶️', category: 'saveur' },
  { id: 'diesel', label: 'Diesel', icon: '⛽', category: 'saveur' },
  { id: 'cheese', label: 'Fromage', icon: '🧀', category: 'saveur' },
  { id: 'mint', label: 'Menthe', icon: '🌿', category: 'saveur' },
  { id: 'vanilla', label: 'Vanille', icon: '🍦', category: 'saveur' },
];

export const textureTags = [
  { id: 'sticky', label: 'Collant', icon: '💧', category: 'texture' },
  { id: 'dry', label: 'Sec', icon: '🏜️', category: 'texture' },
  { id: 'dense', label: 'Dense', icon: '⚫', category: 'texture' },
  { id: 'fluffy', label: 'Aéré', icon: '☁️', category: 'texture' },
  { id: 'cristalline', label: 'Cristallin', icon: '💎', category: 'texture' },
  { id: 'resineux', label: 'Résineux', icon: '🍯', category: 'texture' },
];

export const appearanceTags = [
  { id: 'purple', label: 'Violet', icon: '🟣', category: 'apparence' },
  { id: 'orange', label: 'Orange', icon: '🟠', category: 'apparence' },
  { id: 'green', label: 'Vert', icon: '🟢', category: 'apparence' },
  { id: 'frosty', label: 'Givré', icon: '❄️', category: 'apparence' },
  { id: 'compact', label: 'Compact', icon: '📦', category: 'apparence' },
];
```

### Composant Tag Selector

```jsx
// src/components/TagSelector.jsx
import { motion } from 'framer-motion';

export default function TagSelector({ 
  tags, 
  value = [], 
  onChange, 
  multiple = true,
  label 
}) {
  const toggleTag = (tagId) => {
    if (multiple) {
      const newValue = value.includes(tagId)
        ? value.filter(id => id !== tagId)
        : [...value, tagId];
      onChange(newValue);
    } else {
      onChange(tagId === value ? null : tagId);
    }
  };

  return (
    <div className="tag-selector">
      {label && <label className="tag-selector-label">{label}</label>}
      <div className="tag-grid">
        {tags.map(tag => {
          const isSelected = multiple 
            ? value.includes(tag.id) 
            : value === tag.id;
          
          return (
            <motion.button
              key={tag.id}
              type="button"
              className={`tag-btn ${isSelected ? 'selected' : ''}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleTag(tag.id)}
            >
              <span className="tag-icon">{tag.icon}</span>
              <span className="tag-label">{tag.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
```

### CSS

```css
/* src/components/TagSelector.css */
.tag-selector {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tag-selector-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-muted);
}

.tag-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 8px;
}

.tag-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tag-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--primary);
}

.tag-btn.selected {
  background: var(--gradient-primary);
  border-color: var(--primary);
  color: white;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.tag-icon {
  font-size: 20px;
}

.tag-label {
  font-size: 13px;
  font-weight: 600;
}
```

---

## 🎚️ Slider Visuel (Ratio Indica/Sativa)

```jsx
// src/components/StrainRatioSlider.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function StrainRatioSlider({ value = 50, onChange }) {
  const [isDragging, setIsDragging] = useState(false);

  const getStrainType = (ratio) => {
    if (ratio <= 20) return { label: 'Indica Pur', icon: '😴', color: '#8B5CF6' };
    if (ratio <= 40) return { label: 'Indica Dominant', icon: '🌙', color: '#A78BFA' };
    if (ratio <= 60) return { label: 'Hybride', icon: '⚖️', color: '#10B981' };
    if (ratio <= 80) return { label: 'Sativa Dominant', icon: '☀️', color: '#FBBF24' };
    return { label: 'Sativa Pur', icon: '⚡', color: '#F59E0B' };
  };

  const strain = getStrainType(value);

  return (
    <div className="strain-ratio-slider">
      <div className="slider-header">
        <span className="strain-type" style={{ color: strain.color }}>
          {strain.icon} {strain.label}
        </span>
        <span className="ratio-value">{value}% Sativa</span>
      </div>
      
      <div className="slider-track">
        <div className="slider-gradient" />
        <motion.div
          className="slider-thumb"
          style={{ left: `${value}%`, background: strain.color }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0}
          dragMomentum={false}
          onDrag={(e, info) => {
            const rect = e.target.parentElement.getBoundingClientRect();
            const percentage = Math.max(0, Math.min(100, 
              ((info.point.x - rect.left) / rect.width) * 100
            ));
            onChange(Math.round(percentage));
          }}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
        />
      </div>
      
      <div className="slider-labels">
        <span>😴 Indica</span>
        <span>⚖️ Hybride</span>
        <span>⚡ Sativa</span>
      </div>
    </div>
  );
}
```

---

## 📝 Exemple d'Intégration Complète

```jsx
// src/pages/ReviewEditor.jsx
import TerpeneWheel from '../components/TerpeneWheel';
import QuickRating from '../components/QuickRating';
import TagSelector from '../components/TagSelector';
import StrainRatioSlider from '../components/StrainRatioSlider';
import { effectTags, flavorTags, textureTags } from '../data/predefined-tags';
import { useState } from 'react';

export default function ReviewEditor() {
  const [formData, setFormData] = useState({
    name: '',
    terpenes: [],
    ratio: 50,
    ratings: {
      apparence: null,
      arome: null,
      gout: null,
      effet: null,
      global: null,
    },
    effects: [],
    flavors: [],
    textures: [],
  });

  return (
    <div className="review-editor">
      <h1>Nouvelle Review</h1>
      
      {/* Nom du produit */}
      <div className="form-section">
        <label>Nom de la variété</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ex: Gelato 41"
        />
      </div>
      
      {/* Ratio Indica/Sativa */}
      <div className="form-section">
        <label>Type de variété</label>
        <StrainRatioSlider
          value={formData.ratio}
          onChange={(ratio) => setFormData({ ...formData, ratio })}
        />
      </div>
      
      {/* Roue des Terpènes */}
      <div className="form-section">
        <label>Profil terpénique</label>
        <TerpeneWheel
          value={formData.terpenes}
          onChange={(terpenes) => setFormData({ ...formData, terpenes })}
        />
      </div>
      
      {/* Notes rapides */}
      <div className="form-section">
        <h3>Évaluations</h3>
        <div className="ratings-grid">
          <QuickRating
            label="Apparence"
            value={formData.ratings.apparence}
            onChange={(v) => setFormData({
              ...formData,
              ratings: { ...formData.ratings, apparence: v }
            })}
          />
          <QuickRating
            label="Arôme"
            value={formData.ratings.arome}
            onChange={(v) => setFormData({
              ...formData,
              ratings: { ...formData.ratings, arome: v }
            })}
          />
          <QuickRating
            label="Goût"
            value={formData.ratings.gout}
            onChange={(v) => setFormData({
              ...formData,
              ratings: { ...formData.ratings, gout: v }
            })}
          />
          <QuickRating
            label="Effet"
            value={formData.ratings.effet}
            onChange={(v) => setFormData({
              ...formData,
              ratings: { ...formData.ratings, effet: v }
            })}
          />
        </div>
      </div>
      
      {/* Tags Effets */}
      <div className="form-section">
        <TagSelector
          label="Effets ressentis"
          tags={effectTags}
          value={formData.effects}
          onChange={(effects) => setFormData({ ...formData, effects })}
        />
      </div>
      
      {/* Tags Saveurs */}
      <div className="form-section">
        <TagSelector
          label="Saveurs dominantes"
          tags={flavorTags}
          value={formData.flavors}
          onChange={(flavors) => setFormData({ ...formData, flavors })}
        />
      </div>
      
      {/* Tags Texture */}
      <div className="form-section">
        <TagSelector
          label="Texture"
          tags={textureTags}
          value={formData.textures}
          onChange={(textures) => setFormData({ ...formData, textures })}
        />
      </div>
      
      {/* Score global calculé */}
      <div className="global-score">
        <h3>Score global</h3>
        <div className="score-display">
          {(() => {
            const scores = Object.values(formData.ratings).filter(v => v !== null);
            if (scores.length === 0) return '-';
            const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
            return avg.toFixed(1);
          })()}
          <span>/10</span>
        </div>
      </div>
      
      <button className="btn btn-primary btn-lg">
        Générer la review
      </button>
    </div>
  );
}
```

---

## 🎨 Avantages UX

✅ **Rapidité** : Clic au lieu de saisie texte  
✅ **Cohérence** : Tags standardisés  
✅ **Visuel** : Roue terpènes immersive  
✅ **Intuitif** : Slider, boutons, pas de formulaire complexe  
✅ **Engagement** : Interactions ludiques (hover, animations)  
✅ **Éducatif** : Infos terpènes au survol  

---

**Prêt à implémenter !** 🚀
