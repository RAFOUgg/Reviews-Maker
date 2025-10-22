// ProfileStats.js - small component to render public profile stats
import { el } from '../core/Utils.js';

export default function ProfileStats({ total=0, pub=0, priv=0, byType={} } = {}) {
  const wrap = el('div', { class: 'profile-stats' });
  const grid = el('div', { class: 'stats-grid' });
  grid.appendChild(el('div', { class: 'stat-card' }, [ el('div', { class: 'num' }, String(total)), el('div', { class: 'label' }, 'Total') ]));
  grid.appendChild(el('div', { class: 'stat-card' }, [ el('div', { class: 'num' }, String(pub)), el('div', { class: 'label' }, 'Public') ]));
  grid.appendChild(el('div', { class: 'stat-card' }, [ el('div', { class: 'num' }, String(priv)), el('div', { class: 'label' }, 'Privé') ]));
  wrap.appendChild(grid);
  const types = el('div', { class: 'account-stats-by-type' });
  Object.keys(byType).forEach(k => types.appendChild(el('div', {}, `${k}: ${byType[k]}`)));
  wrap.appendChild(types);
  return wrap;
}
