import fs from 'fs';
import path from 'path';

const FA_TO_LUCIDE = {
  'brain-circuit': 'brain',
  'house': 'home',
  'cubes': 'layout-grid',
  'graduation-cap': 'graduation-cap',
  'circle-info': 'info',
  'user-astronaut': 'user',
  'right-from-bracket': 'log-out',
  'square-root-variable': 'sigma',
  'circle-nodes': 'share-2',
  'diagram-project': 'network',
  'arrow-right-arrow-left': 'arrow-left-right',
  'laptop-code': 'laptop',
  'shield-halved': 'shield',
  'map-location-dot': 'map-pin',
  'circle-notch': 'loader-2',
  'trash-arrow-up': 'trash-2',
  'circle-question': 'circle-help',
  'trash-can': 'trash-2',
  'table-list': 'table',
  'share-nodes': 'share-2',
  'network-wired': 'waypoints',
  'mouse-pointer': 'mouse-pointer-2',
  'circle-arrow-right': 'circle-arrow-right',
  'gears': 'settings'
};

const file = path.join(process.cwd(), 'index.html');
let html = fs.readFileSync(file, 'utf8');

html = html.replace(
  /<i class="fa-(?:solid|regular) fa-([a-z0-9-]+)([^"]*)"([^>]*)><\/i>/gi,
  (_, faName, extraClasses, attrs) => {
    const lucide = FA_TO_LUCIDE[faName] || faName;
    const classes = ['lk-icon', extraClasses.trim()].filter(Boolean).join(' ');
    const aria = attrs.includes('aria-hidden') ? attrs : `${attrs} aria-hidden="true"`;
    return `<i data-lucide="${lucide}" class="${classes}"${aria}></i>`;
  }
);

html = html.replace(
  /class="fa-solid fa-([a-z0-9-]+)"/g,
  (_, faName) => {
    const lucide = FA_TO_LUCIDE[faName] || faName;
    return `data-lucide="${lucide}" class="lk-icon"`;
  }
);

html = html.replace(/<!-- FontAwesome Icons -->\s*<link[^>]+font-awesome[^>]+>/i,
  '<!-- Lucide Icons (line art, via JS) -->');

fs.writeFileSync(file, html);
console.log('Icons migrated in index.html');
