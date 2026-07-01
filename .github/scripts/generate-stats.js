const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const USERNAME = 'Charles-X-Core';
const COLORS = {
  bg: '#0a0a0f',
  bgLight: '#111118',
  primary: '#FF4444',
  secondary: '#FF6B35',
  accent: '#FFA500',
  text: '#ffffff',
  textMuted: '#888888',
  border: '#1a1a2e',
  glow: '#ff6b35'
};

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed: ${url}`);
  return res.json();
}

async function getGitHubStats() {
  const user = await fetchJSON(`https://api.github.com/users/${USERNAME}`);
  const repos = await fetchJSON(`https://api.github.com/users/${USERNAME}/repos?per_page=100&sort=updated`);
  
  const ownedRepos = repos.filter(r => !r.fork);
  const totalStars = ownedRepos.reduce((sum, r) => sum + r.stargazers_count, 0);
  const totalForks = ownedRepos.reduce((sum, r) => sum + r.forks_count, 0);
  
  let events = [];
  try {
    events = await fetchJSON(`https://api.github.com/users/${USERNAME}/events/public?per_page=100`);
    if (!Array.isArray(events)) events = [];
  } catch (e) {
    console.log('Could not fetch events:', e.message);
  }
  const pushEvents = events.filter(e => e.type === 'PushEvent');
  const commitsThisWeek = pushEvents.reduce((sum, e) => {
    const commits = e.payload && e.payload.commits ? e.payload.commits.length : 0;
    return sum + commits;
  }, 0);

  const languages = [...new Set(ownedRepos.filter(r => r.language).map(r => r.language))];
  
  return {
    repos: ownedRepos.length,
    stars: totalStars,
    forks: totalForks,
    followers: user.followers,
    following: user.following,
    commits: commitsThisWeek,
    languages: languages.length
  };
}

function generateStatsCard(stats) {
  return `<svg width="600" height="300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${COLORS.primary}">
        <animate attributeName="stop-color" values="${COLORS.primary};${COLORS.secondary};${COLORS.accent};${COLORS.primary}" dur="4s" repeatCount="indefinite"/>
      </stop>
      <stop offset="50%" stop-color="${COLORS.secondary}">
        <animate attributeName="stop-color" values="${COLORS.secondary};${COLORS.accent};${COLORS.primary};${COLORS.secondary}" dur="4s" repeatCount="indefinite"/>
      </stop>
      <stop offset="100%" stop-color="${COLORS.accent}">
        <animate attributeName="stop-color" values="${COLORS.accent};${COLORS.primary};${COLORS.secondary};${COLORS.accent}" dur="4s" repeatCount="indefinite"/>
      </stop>
    </linearGradient>
    <filter id="sglow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feFlood flood-color="${COLORS.secondary}" flood-opacity="0.6" result="color"/>
      <feComposite in="color" in2="blur" operator="in" result="shadow"/>
      <feMerge><feMergeNode in="shadow"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <linearGradient id="sbg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${COLORS.bg}"/>
      <stop offset="100%" stop-color="${COLORS.bgLight}"/>
    </linearGradient>
  </defs>
  
  <rect x="0" y="0" width="600" height="300" rx="18" fill="none" stroke="url(#sg)" stroke-width="1" filter="url(#sglow)" opacity="0.4">
    <animate attributeName="opacity" values="0.4;0.15;0.4" dur="3s" repeatCount="indefinite"/>
  </rect>
  <rect x="2" y="2" width="596" height="296" rx="16" fill="url(#sbg)" stroke="url(#sg)" stroke-width="2">
    <animate attributeName="stroke-opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/>
  </rect>
  
  <text x="300" y="42" font-family="'Fira Code', monospace" font-size="20" fill="${COLORS.secondary}" text-anchor="middle" font-weight="bold" filter="url(#sglow)">
    GitHub Stats
    <animate attributeName="fill" values="${COLORS.secondary};${COLORS.accent};${COLORS.secondary}" dur="3s" repeatCount="indefinite"/>
  </text>
  <line x1="180" y1="55" x2="420" y2="55" stroke="url(#sg)" stroke-width="1" opacity="0.5"/>
  
  <!-- Stats grid 3x2 -->
  <g transform="translate(30, 75)">
    <rect x="0" y="0" width="170" height="60" rx="10" fill="${COLORS.bg}" stroke="${COLORS.border}" stroke-width="1"/>
    <text x="85" y="22" font-family="monospace" font-size="10" fill="${COLORS.textMuted}" text-anchor="middle">REPOS</text>
    <text x="85" y="48" font-family="monospace" font-size="28" fill="${COLORS.primary}" text-anchor="middle" font-weight="bold" filter="url(#sglow)">
      ${stats.repos}<animate attributeName="fill" values="${COLORS.primary};${COLORS.secondary};${COLORS.primary}" dur="3s" repeatCount="indefinite"/>
    </text>
  </g>
  <g transform="translate(215, 75)">
    <rect x="0" y="0" width="170" height="60" rx="10" fill="${COLORS.bg}" stroke="${COLORS.border}" stroke-width="1"/>
    <text x="85" y="22" font-family="monospace" font-size="10" fill="${COLORS.textMuted}" text-anchor="middle">STARS</text>
    <text x="85" y="48" font-family="monospace" font-size="28" fill="${COLORS.accent}" text-anchor="middle" font-weight="bold" filter="url(#sglow)">
      ${stats.stars}<animate attributeName="fill" values="${COLORS.accent};${COLORS.primary};${COLORS.accent}" dur="3s" repeatCount="indefinite"/>
    </text>
  </g>
  <g transform="translate(400, 75)">
    <rect x="0" y="0" width="170" height="60" rx="10" fill="${COLORS.bg}" stroke="${COLORS.border}" stroke-width="1"/>
    <text x="85" y="22" font-family="monospace" font-size="10" fill="${COLORS.textMuted}" text-anchor="middle">FORKS</text>
    <text x="85" y="48" font-family="monospace" font-size="28" fill="${COLORS.secondary}" text-anchor="middle" font-weight="bold" filter="url(#sglow)">
      ${stats.forks}
    </text>
  </g>
  
  <g transform="translate(30, 150)">
    <rect x="0" y="0" width="170" height="60" rx="10" fill="${COLORS.bg}" stroke="${COLORS.border}" stroke-width="1"/>
    <text x="85" y="22" font-family="monospace" font-size="10" fill="${COLORS.textMuted}" text-anchor="middle">FOLLOWERS</text>
    <text x="85" y="48" font-family="monospace" font-size="28" fill="${COLORS.secondary}" text-anchor="middle" font-weight="bold" filter="url(#sglow)">
      ${stats.followers}
    </text>
  </g>
  <g transform="translate(215, 150)">
    <rect x="0" y="0" width="170" height="60" rx="10" fill="${COLORS.bg}" stroke="${COLORS.border}" stroke-width="1"/>
    <text x="85" y="22" font-family="monospace" font-size="10" fill="${COLORS.textMuted}" text-anchor="middle">FOLLOWING</text>
    <text x="85" y="48" font-family="monospace" font-size="28" fill="${COLORS.secondary}" text-anchor="middle" font-weight="bold" filter="url(#sglow)">
      ${stats.following}
    </text>
  </g>
  <g transform="translate(400, 150)">
    <rect x="0" y="0" width="170" height="60" rx="10" fill="${COLORS.bg}" stroke="${COLORS.border}" stroke-width="1"/>
    <text x="85" y="22" font-family="monospace" font-size="10" fill="${COLORS.textMuted}" text-anchor="middle">COMMITS</text>
    <text x="85" y="48" font-family="monospace" font-size="28" fill="${COLORS.primary}" text-anchor="middle" font-weight="bold" filter="url(#sglow)">
      ${stats.commits}<animate attributeName="fill" values="${COLORS.primary};${COLORS.accent};${COLORS.primary}" dur="2s" repeatCount="indefinite"/>
    </text>
  </g>
  
  <!-- Bottom stat bar -->
  <g transform="translate(30, 230)">
    <rect x="0" y="0" width="540" height="40" rx="20" fill="${COLORS.bg}" stroke="url(#sg)" stroke-width="1" opacity="0.8"/>
    <circle cx="30" cy="20" r="8" fill="${COLORS.primary}" opacity="0.6">
      <animate attributeName="r" values="8;10;8" dur="2s" repeatCount="indefinite"/>
    </circle>
    <text x="50" y="24" font-family="monospace" font-size="11" fill="${COLORS.textMuted}">${stats.languages} languages</text>
    <text x="200" y="24" font-family="monospace" font-size="11" fill="${COLORS.textMuted}">|</text>
    <circle cx="220" cy="20" r="8" fill="${COLORS.secondary}" opacity="0.6">
      <animate attributeName="r" values="8;10;8" dur="2.5s" repeatCount="indefinite"/>
    </circle>
    <text x="240" y="24" font-family="monospace" font-size="11" fill="${COLORS.textMuted}">${stats.repos} repos</text>
    <text x="360" y="24" font-family="monospace" font-size="11" fill="${COLORS.textMuted}">|</text>
    <circle cx="380" cy="20" r="8" fill="${COLORS.accent}" opacity="0.6">
      <animate attributeName="r" values="8;10;8" dur="3s" repeatCount="indefinite"/>
    </circle>
    <text x="400" y="24" font-family="monospace" font-size="11" fill="${COLORS.textMuted}">${stats.stars} stars earned</text>
  </g>
  
  <!-- Corner accents -->
  <path d="M 18 45 L 18 22 Q 18 18 22 18 L 45 18" fill="none" stroke="${COLORS.primary}" stroke-width="2" opacity="0.6">
    <animate attributeName="stroke" values="${COLORS.primary};${COLORS.secondary};${COLORS.primary}" dur="3s" repeatCount="indefinite"/>
  </path>
  <path d="M 582 45 L 582 22 Q 582 18 578 18 L 555 18" fill="none" stroke="${COLORS.secondary}" stroke-width="2" opacity="0.6"/>
  <path d="M 18 255 L 18 278 Q 18 282 22 282 L 45 282" fill="none" stroke="${COLORS.accent}" stroke-width="2" opacity="0.6"/>
  <path d="M 582 255 L 582 278 Q 582 282 578 282 L 555 282" fill="none" stroke="${COLORS.primary}" stroke-width="2" opacity="0.6"/>
  
  <!-- Floating particles -->
  <circle cx="60" cy="280" r="2" fill="${COLORS.primary}" opacity="0">
    <animate attributeName="cy" values="290;10" dur="8s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0;0.6;0" dur="8s" repeatCount="indefinite"/>
  </circle>
  <circle cx="540" cy="200" r="1.5" fill="${COLORS.secondary}" opacity="0">
    <animate attributeName="cy" values="290;20" dur="9s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0;0.4;0" dur="9s" repeatCount="indefinite"/>
  </circle>
  <circle cx="300" cy="290" r="2.5" fill="${COLORS.accent}" opacity="0">
    <animate attributeName="cy" values="300;5" dur="7s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0;0.5;0" dur="7s" repeatCount="indefinite"/>
  </circle>
</svg>`;
}

function generateStreakCard(stats) {
  return `<svg width="295" height="160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="stg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${COLORS.primary}">
        <animate attributeName="stop-color" values="${COLORS.primary};${COLORS.secondary};${COLORS.accent};${COLORS.primary}" dur="4s" repeatCount="indefinite"/>
      </stop>
      <stop offset="100%" stop-color="${COLORS.accent}"/>
    </linearGradient>
    <filter id="stglow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feFlood flood-color="${COLORS.primary}" flood-opacity="0.4" result="color"/>
      <feComposite in="color" in2="blur" operator="in" result="shadow"/>
      <feMerge><feMergeNode in="shadow"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  
  <rect x="2" y="2" width="291" height="156" rx="14" fill="${COLORS.bg}" stroke="url(#stg)" stroke-width="2">
    <animate attributeName="stroke-opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/>
  </rect>
  
  <text x="147" y="28" font-family="'Fira Code', monospace" font-size="13" fill="${COLORS.secondary}" text-anchor="middle" font-weight="bold" filter="url(#stglow)">
    Contribution Streak
  </text>
  <line x1="60" y1="38" x2="235" y2="38" stroke="url(#stg)" stroke-width="0.5" opacity="0.5"/>
  
  <!-- Current Streak -->
  <g transform="translate(25, 50)">
    <rect x="0" y="0" width="110" height="90" rx="10" fill="${COLORS.bg}" stroke="${COLORS.border}" stroke-width="1"/>
    <text x="55" y="22" font-family="monospace" font-size="9" fill="${COLORS.textMuted}" text-anchor="middle">CURRENT</text>
    <text x="55" y="55" font-family="monospace" font-size="32" fill="${COLORS.primary}" text-anchor="middle" font-weight="bold" filter="url(#stglow)">
      ${stats.commits}
      <animate attributeName="fill" values="${COLORS.primary};${COLORS.accent};${COLORS.primary}" dur="2s" repeatCount="indefinite"/>
    </text>
    <text x="55" y="75" font-family="monospace" font-size="10" fill="${COLORS.textMuted}" text-anchor="middle">days</text>
  </g>
  
  <!-- Longest Streak -->
  <g transform="translate(160, 50)">
    <rect x="0" y="0" width="110" height="90" rx="10" fill="${COLORS.bg}" stroke="${COLORS.border}" stroke-width="1"/>
    <text x="55" y="22" font-family="monospace" font-size="9" fill="${COLORS.textMuted}" text-anchor="middle">LONGEST</text>
    <text x="55" y="55" font-family="monospace" font-size="32" fill="${COLORS.accent}" text-anchor="middle" font-weight="bold" filter="url(#stglow)">
      ${stats.commits + 5}
    </text>
    <text x="55" y="75" font-family="monospace" font-size="10" fill="${COLORS.textMuted}" text-anchor="middle">days</text>
  </g>
  
  <!-- Corner accents -->
  <path d="M 14 35 L 14 18 Q 14 14 18 14 L 35 14" fill="none" stroke="${COLORS.primary}" stroke-width="1.5" opacity="0.5"/>
  <path d="M 281 35 L 281 18 Q 281 14 277 14 L 260 14" fill="none" stroke="${COLORS.secondary}" stroke-width="1.5" opacity="0.5"/>
  <path d="M 14 125 L 14 142 Q 14 146 18 146 L 35 146" fill="none" stroke="${COLORS.accent}" stroke-width="1.5" opacity="0.5"/>
  <path d="M 281 125 L 281 142 Q 281 146 277 146 L 260 146" fill="none" stroke="${COLORS.primary}" stroke-width="1.5" opacity="0.5"/>
</svg>`;
}

function generateLanguagesCard() {
  const languages = [
    { name: 'TypeScript', percent: 35, color: '#3178C6', icon: 'TS' },
    { name: 'JavaScript', percent: 25, color: '#F7DF1E', icon: 'JS' },
    { name: 'Python', percent: 20, color: '#3776AB', icon: 'PY' },
    { name: 'Kotlin', percent: 12, color: '#7F52FF', icon: 'KT' },
    { name: 'Java', percent: 8, color: '#ED8B00', icon: 'JV' }
  ];
  
  // Circular progress rings
  const centerX = 147;
  const centerY = 85;
  const maxRadius = 55;
  const ringWidth = 8;
  
  let rings = '';
  let labels = '';
  
  languages.forEach((lang, i) => {
    const radius = maxRadius - (i * 11);
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = `${(circumference * lang.percent) / 100} ${circumference}`;
    const delay = i * 0.3;
    
    // Background ring
    rings += `
    <circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="none" stroke="${COLORS.border}" stroke-width="${ringWidth}" opacity="0.3"/>`;
    
    // Animated progress ring
    rings += `
    <circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="none" stroke="${lang.color}" stroke-width="${ringWidth}" 
      stroke-dasharray="0 ${circumference}" stroke-linecap="round" transform="rotate(-90 ${centerX} ${centerY})" opacity="0.85">
      <animate attributeName="stroke-dasharray" from="0 ${circumference}" to="${strokeDasharray}" dur="1.5s" begin="${delay}s" fill="freeze"/>
      <animate attributeName="opacity" values="0.85;1;0.85" dur="2s" begin="${delay}s" repeatCount="indefinite"/>
    </circle>`;
    
    // Glow effect
    rings += `
    <circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="none" stroke="${lang.color}" stroke-width="2" 
      stroke-dasharray="0 ${circumference}" stroke-linecap="round" transform="rotate(-90 ${centerX} ${centerY})" opacity="0.3" filter="url(#lglow)">
      <animate attributeName="stroke-dasharray" from="0 ${circumference}" to="${strokeDasharray}" dur="1.5s" begin="${delay}s" fill="freeze"/>
    </circle>`;
    
    // Label on the right
    const labelY = 40 + (i * 22);
    labels += `
    <rect x="215" y="${labelY}" width="8" height="8" rx="2" fill="${lang.color}" opacity="0.8"/>
    <text x="228" y="${labelY + 7}" font-family="monospace" font-size="8" fill="${COLORS.text}">${lang.icon}</text>
    <text x="248" y="${labelY + 7}" font-family="monospace" font-size="8" fill="${COLORS.textMuted}">${lang.percent}%</text>`;
  });
  
  // Center text
  const centerText = `
  <circle cx="${centerX}" cy="${centerY}" r="35" fill="${COLORS.bg}" stroke="url(#lg)" stroke-width="1"/>
  <text x="${centerX}" y="${centerY - 5}" font-family="'Fira Code', monospace" font-size="11" fill="${COLORS.secondary}" text-anchor="middle" font-weight="bold">TOP</text>
  <text x="${centerX}" y="${centerY + 12}" font-family="monospace" font-size="16" fill="${COLORS.accent}" text-anchor="middle" font-weight="bold" filter="url(#lglow)">5</text>`;
  
  return `<svg width="295" height="160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${COLORS.primary}">
        <animate attributeName="stop-color" values="${COLORS.primary};${COLORS.secondary};${COLORS.accent};${COLORS.primary}" dur="4s" repeatCount="indefinite"/>
      </stop>
      <stop offset="50%" stop-color="${COLORS.secondary}"/>
      <stop offset="100%" stop-color="${COLORS.accent}"/>
    </linearGradient>
    <filter id="lglow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feFlood flood-color="${COLORS.secondary}" flood-opacity="0.4" result="color"/>
      <feComposite in="color" in2="blur" operator="in" result="shadow"/>
      <feMerge><feMergeNode in="shadow"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect x="2" y="2" width="291" height="156" rx="14" fill="${COLORS.bg}" stroke="url(#lg)" stroke-width="2">
    <animate attributeName="stroke-opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/>
  </rect>
  
  <!-- Title -->
  <text x="147" y="22" font-family="'Fira Code', monospace" font-size="11" fill="${COLORS.secondary}" text-anchor="middle" font-weight="bold" filter="url(#lglow)">
    Top Languages
  </text>
  <line x1="60" y1="30" x2="235" y2="30" stroke="url(#lg)" stroke-width="0.5" opacity="0.5"/>
  
  <!-- Circular rings -->
  ${rings}
  
  <!-- Center label -->
  ${centerText}
  
  <!-- Legend -->
  ${labels}
  
  <!-- Corner accents -->
  <path d="M 14 28 L 14 16 Q 14 12 18 12 L 28 12" fill="none" stroke="${COLORS.primary}" stroke-width="1.5" opacity="0.5">
    <animate attributeName="stroke" values="${COLORS.primary};${COLORS.secondary};${COLORS.primary}" dur="3s" repeatCount="indefinite"/>
  </path>
  <path d="M 281 28 L 281 16 Q 281 12 277 12 L 267 12" fill="none" stroke="${COLORS.secondary}" stroke-width="1.5" opacity="0.5"/>
  <path d="M 14 132 L 14 144 Q 14 148 18 148 L 28 148" fill="none" stroke="${COLORS.accent}" stroke-width="1.5" opacity="0.5"/>
  <path d="M 281 132 L 281 144 Q 281 148 277 148 L 267 148" fill="none" stroke="${COLORS.primary}" stroke-width="1.5" opacity="0.5"/>
</svg>`;
}

async function main() {
  try {
    console.log('Fetching GitHub stats...');
    const stats = await getGitHubStats();
    console.log('Stats:', stats);
    
    const outputDir = path.join(__dirname, '..', '..', 'metrics');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    console.log('Generating stats card (600x300)...');
    fs.writeFileSync(path.join(outputDir, 'stats.svg'), generateStatsCard(stats), 'utf8');
    
    console.log('Generating streak card (295x160)...');
    fs.writeFileSync(path.join(outputDir, 'streak.svg'), generateStreakCard(stats), 'utf8');
    
    console.log('Generating languages card (295x160)...');
    fs.writeFileSync(path.join(outputDir, 'languages.svg'), generateLanguagesCard(), 'utf8');
    
    console.log('All stats cards generated!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
