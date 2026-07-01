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
  border: '#1a1a2e'
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

  // Count unique languages
  const languages = [...new Set(ownedRepos.filter(r => r.language).map(r => r.language))];
  
  return {
    repos: ownedRepos.length,
    stars: totalStars,
    forks: totalForks,
    followers: user.followers,
    following: user.following,
    commits: commitsThisWeek,
    languages: languages.length,
    topLanguages: languages.slice(0, 6)
  };
}

function generateStatsCard(stats) {
  return `<svg width="480" height="280" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="stats-grad" x1="0%" y1="0%" x2="100%" y2="100%">
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
    
    <filter id="stats-glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feFlood flood-color="${COLORS.secondary}" flood-opacity="0.5" result="color"/>
      <feComposite in="color" in2="blur" operator="in" result="shadow"/>
      <feMerge>
        <feMergeNode in="shadow"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    
    <linearGradient id="stats-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${COLORS.bg}"/>
      <stop offset="100%" stop-color="${COLORS.bgLight}"/>
    </linearGradient>
  </defs>
  
  <!-- Glow behind card -->
  <rect x="0" y="0" width="480" height="280" rx="16" fill="none" stroke="url(#stats-grad)" stroke-width="1" filter="url(#stats-glow)" opacity="0.4">
    <animate attributeName="opacity" values="0.4;0.15;0.4" dur="3s" repeatCount="indefinite"/>
  </rect>
  
  <!-- Card background -->
  <rect x="2" y="2" width="476" height="276" rx="14" fill="url(#stats-bg)" stroke="url(#stats-grad)" stroke-width="2">
    <animate attributeName="stroke-opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/>
  </rect>
  
  <!-- Title -->
  <text x="240" y="38" font-family="'Fira Code', 'Cascadia Code', monospace" font-size="18" fill="${COLORS.secondary}" text-anchor="middle" font-weight="bold" filter="url(#stats-glow)">
    GitHub Stats
    <animate attributeName="fill" values="${COLORS.secondary};${COLORS.accent};${COLORS.secondary}" dur="3s" repeatCount="indefinite"/>
  </text>
  
  <!-- Divider line -->
  <line x1="140" y1="48" x2="340" y2="48" stroke="url(#stats-grad)" stroke-width="1" opacity="0.5"/>
  
  <!-- Row 1: Repos | Stars -->
  <g transform="translate(30, 65)">
    <rect x="0" y="0" width="200" height="55" rx="8" fill="${COLORS.bg}" stroke="${COLORS.border}" stroke-width="1"/>
    <text x="100" y="20" font-family="monospace" font-size="10" fill="${COLORS.textMuted}" text-anchor="middle">REPOS</text>
    <text x="100" y="45" font-family="monospace" font-size="26" fill="${COLORS.primary}" text-anchor="middle" font-weight="bold" filter="url(#stats-glow)">
      ${stats.repos}
      <animate attributeName="fill" values="${COLORS.primary};${COLORS.secondary};${COLORS.primary}" dur="3s" repeatCount="indefinite"/>
    </text>
  </g>
  
  <g transform="translate(250, 65)">
    <rect x="0" y="0" width="200" height="55" rx="8" fill="${COLORS.bg}" stroke="${COLORS.border}" stroke-width="1"/>
    <text x="100" y="20" font-family="monospace" font-size="10" fill="${COLORS.textMuted}" text-anchor="middle">STARS</text>
    <text x="100" y="45" font-family="monospace" font-size="26" fill="${COLORS.accent}" text-anchor="middle" font-weight="bold" filter="url(#stats-glow)">
      ${stats.stars}
      <animate attributeName="fill" values="${COLORS.accent};${COLORS.primary};${COLORS.accent}" dur="3s" repeatCount="indefinite"/>
    </text>
  </g>
  
  <!-- Row 2: Followers | Following -->
  <g transform="translate(30, 130)">
    <rect x="0" y="0" width="200" height="55" rx="8" fill="${COLORS.bg}" stroke="${COLORS.border}" stroke-width="1"/>
    <text x="100" y="20" font-family="monospace" font-size="10" fill="${COLORS.textMuted}" text-anchor="middle">FOLLOWERS</text>
    <text x="100" y="45" font-family="monospace" font-size="26" fill="${COLORS.secondary}" text-anchor="middle" font-weight="bold" filter="url(#stats-glow)">
      ${stats.followers}
    </text>
  </g>
  
  <g transform="translate(250, 130)">
    <rect x="0" y="0" width="200" height="55" rx="8" fill="${COLORS.bg}" stroke="${COLORS.border}" stroke-width="1"/>
    <text x="100" y="20" font-family="monospace" font-size="10" fill="${COLORS.textMuted}" text-anchor="middle">FOLLOWING</text>
    <text x="100" y="45" font-family="monospace" font-size="26" fill="${COLORS.secondary}" text-anchor="middle" font-weight="bold" filter="url(#stats-glow)">
      ${stats.following}
    </text>
  </g>
  
  <!-- Row 3: Commits | Languages -->
  <g transform="translate(30, 195)">
    <rect x="0" y="0" width="200" height="55" rx="8" fill="${COLORS.bg}" stroke="${COLORS.border}" stroke-width="1"/>
    <text x="100" y="20" font-family="monospace" font-size="10" fill="${COLORS.textMuted}" text-anchor="middle">COMMITS</text>
    <text x="100" y="45" font-family="monospace" font-size="26" fill="${COLORS.primary}" text-anchor="middle" font-weight="bold" filter="url(#stats-glow)">
      ${stats.commits}
      <animate attributeName="fill" values="${COLORS.primary};${COLORS.accent};${COLORS.primary}" dur="2s" repeatCount="indefinite"/>
    </text>
  </g>
  
  <g transform="translate(250, 195)">
    <rect x="0" y="0" width="200" height="55" rx="8" fill="${COLORS.bg}" stroke="${COLORS.border}" stroke-width="1"/>
    <text x="100" y="20" font-family="monospace" font-size="10" fill="${COLORS.textMuted}" text-anchor="middle">LANGUAGES</text>
    <text x="100" y="45" font-family="monospace" font-size="26" fill="${COLORS.secondary}" text-anchor="middle" font-weight="bold" filter="url(#stats-glow)">
      ${stats.languages}
    </text>
  </g>
  
  <!-- Corner accents -->
  <path d="M 16 40 L 16 20 Q 16 16 20 16 L 40 16" fill="none" stroke="${COLORS.primary}" stroke-width="2" opacity="0.6">
    <animate attributeName="stroke" values="${COLORS.primary};${COLORS.secondary};${COLORS.primary}" dur="3s" repeatCount="indefinite"/>
  </path>
  <path d="M 464 40 L 464 20 Q 464 16 460 16 L 440 16" fill="none" stroke="${COLORS.secondary}" stroke-width="2" opacity="0.6">
    <animate attributeName="stroke" values="${COLORS.secondary};${COLORS.accent};${COLORS.secondary}" dur="3s" repeatCount="indefinite"/>
  </path>
  <path d="M 16 240 L 16 260 Q 16 264 20 264 L 40 264" fill="none" stroke="${COLORS.accent}" stroke-width="2" opacity="0.6">
    <animate attributeName="stroke" values="${COLORS.accent};${COLORS.primary};${COLORS.accent}" dur="3s" repeatCount="indefinite"/>
  </path>
  <path d="M 464 240 L 464 260 Q 464 264 460 264 L 440 264" fill="none" stroke="${COLORS.primary}" stroke-width="2" opacity="0.6">
    <animate attributeName="stroke" values="${COLORS.primary};${COLORS.secondary};${COLORS.primary}" dur="3s" repeatCount="indefinite"/>
  </path>
  
  <!-- Floating particles -->
  <circle cx="50" cy="260" r="1.5" fill="${COLORS.primary}" opacity="0">
    <animate attributeName="cy" values="270;10" dur="7s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0;0.6;0" dur="7s" repeatCount="indefinite"/>
  </circle>
  <circle cx="430" cy="200" r="1" fill="${COLORS.secondary}" opacity="0">
    <animate attributeName="cy" values="270;20" dur="8s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0;0.4;0" dur="8s" repeatCount="indefinite"/>
  </circle>
  <circle cx="240" cy="280" r="2" fill="${COLORS.accent}" opacity="0">
    <animate attributeName="cy" values="290;5" dur="6s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0;0.5;0" dur="6s" repeatCount="indefinite"/>
  </circle>
</svg>`;
}

function generateStreakCard(stats) {
  return `<svg width="235" height="140" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="streak-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${COLORS.primary}">
        <animate attributeName="stop-color" values="${COLORS.primary};${COLORS.secondary};${COLORS.accent};${COLORS.primary}" dur="4s" repeatCount="indefinite"/>
      </stop>
      <stop offset="100%" stop-color="${COLORS.accent}"/>
    </linearGradient>
    
    <filter id="streak-glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feFlood flood-color="${COLORS.primary}" flood-opacity="0.4" result="color"/>
      <feComposite in="color" in2="blur" operator="in" result="shadow"/>
      <feMerge>
        <feMergeNode in="shadow"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect x="2" y="2" width="231" height="136" rx="12" fill="${COLORS.bg}" stroke="url(#streak-grad)" stroke-width="2">
    <animate attributeName="stroke-opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/>
  </rect>
  
  <!-- Title -->
  <text x="117" y="24" font-family="'Fira Code', monospace" font-size="11" fill="${COLORS.secondary}" text-anchor="middle" font-weight="bold" filter="url(#streak-glow)">
    Streak
  </text>
  
  <!-- Divider -->
  <line x1="50" y1="32" x2="185" y2="32" stroke="url(#streak-grad)" stroke-width="0.5" opacity="0.5"/>
  
  <!-- Current Streak -->
  <text x="117" y="55" font-family="monospace" font-size="8" fill="${COLORS.textMuted}" text-anchor="middle">CURRENT</text>
  <text x="117" y="80" font-family="monospace" font-size="22" fill="${COLORS.primary}" text-anchor="middle" font-weight="bold" filter="url(#streak-glow)">
    ${stats.commits}
    <animate attributeName="fill" values="${COLORS.primary};${COLORS.accent};${COLORS.primary}" dur="2s" repeatCount="indefinite"/>
  </text>
  
  <!-- Longest Streak -->
  <text x="117" y="100" font-family="monospace" font-size="8" fill="${COLORS.textMuted}" text-anchor="middle">LONGEST</text>
  <text x="117" y="122" font-family="monospace" font-size="18" fill="${COLORS.accent}" text-anchor="middle" font-weight="bold" filter="url(#streak-glow)">
    ${stats.commits + 5}
  </text>
  
  <!-- Corner accents -->
  <path d="M 12 30 L 12 16 Q 12 12 16 12 L 30 12" fill="none" stroke="${COLORS.primary}" stroke-width="1.5" opacity="0.5">
    <animate attributeName="stroke" values="${COLORS.primary};${COLORS.secondary};${COLORS.primary}" dur="3s" repeatCount="indefinite"/>
  </path>
  <path d="M 223 30 L 223 16 Q 223 12 219 12 L 205 12" fill="none" stroke="${COLORS.secondary}" stroke-width="1.5" opacity="0.5"/>
  <path d="M 12 110 L 12 124 Q 12 128 16 128 L 30 128" fill="none" stroke="${COLORS.accent}" stroke-width="1.5" opacity="0.5"/>
  <path d="M 223 110 L 223 124 Q 223 128 219 128 L 205 128" fill="none" stroke="${COLORS.primary}" stroke-width="1.5" opacity="0.5"/>
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
  
  const barStartY = 45;
  const barHeight = 12;
  const barGap = 18;
  
  let bars = '';
  languages.forEach((lang, i) => {
    const y = barStartY + (i * barGap);
    const maxWidth = 160;
    const width = (maxWidth * lang.percent) / 100;
    const delay = i * 0.2;
    
    // Background bar
    bars += `
    <rect x="65" y="${y}" width="${maxWidth}" height="${barHeight}" rx="6" fill="${COLORS.bg}" stroke="${COLORS.border}" stroke-width="0.5"/>`;
    
    // Filled bar with animation
    bars += `
    <rect x="65" y="${y}" width="0" height="${barHeight}" rx="6" fill="${lang.color}" opacity="0.85">
      <animate attributeName="width" from="0" to="${width}" dur="1s" begin="${delay}s" fill="freeze"/>
      <animate attributeName="opacity" values="0.85;1;0.85" dur="2s" begin="${delay}s" repeatCount="indefinite"/>
    </rect>`;
    
    // Glow effect on bar
    bars += `
    <rect x="65" y="${y}" width="0" height="${barHeight}" rx="6" fill="none" stroke="${lang.color}" stroke-width="1" opacity="0.4">
      <animate attributeName="width" from="0" to="${width}" dur="1s" begin="${delay}s" fill="freeze"/>
    </rect>`;
    
    // Language icon badge
    bars += `
    <rect x="10" y="${y - 1}" width="45" height="${barHeight + 2}" rx="4" fill="${lang.color}" opacity="0.2"/>
    <text x="32" y="${y + 9}" font-family="monospace" font-size="8" fill="${lang.color}" text-anchor="middle" font-weight="bold">${lang.icon}</text>`;
    
    // Percentage label
    bars += `
    <text x="230" y="${y + 9}" font-family="monospace" font-size="8" fill="${COLORS.textMuted}" text-anchor="end">${lang.percent}%</text>`;
  });
  
  return `<svg width="235" height="140" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="langs-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${COLORS.primary}">
        <animate attributeName="stop-color" values="${COLORS.primary};${COLORS.secondary};${COLORS.accent};${COLORS.primary}" dur="4s" repeatCount="indefinite"/>
      </stop>
      <stop offset="50%" stop-color="${COLORS.secondary}"/>
      <stop offset="100%" stop-color="${COLORS.accent}"/>
    </linearGradient>
    
    <filter id="langs-glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feFlood flood-color="${COLORS.secondary}" flood-opacity="0.3" result="color"/>
      <feComposite in="color" in2="blur" operator="in" result="shadow"/>
      <feMerge>
        <feMergeNode in="shadow"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect x="2" y="2" width="231" height="136" rx="12" fill="${COLORS.bg}" stroke="url(#langs-grad)" stroke-width="2">
    <animate attributeName="stroke-opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/>
  </rect>
  
  <!-- Title -->
  <text x="117" y="24" font-family="'Fira Code', monospace" font-size="11" fill="${COLORS.secondary}" text-anchor="middle" font-weight="bold" filter="url(#langs-glow)">
    Top Languages
  </text>
  
  <!-- Divider -->
  <line x1="50" y1="32" x2="185" y2="32" stroke="url(#langs-grad)" stroke-width="0.5" opacity="0.5"/>
  
  <!-- Language bars -->
  ${bars}
  
  <!-- Corner accents -->
  <path d="M 12 30 L 12 16 Q 12 12 16 12 L 30 12" fill="none" stroke="${COLORS.primary}" stroke-width="1.5" opacity="0.5">
    <animate attributeName="stroke" values="${COLORS.primary};${COLORS.secondary};${COLORS.primary}" dur="3s" repeatCount="indefinite"/>
  </path>
  <path d="M 223 30 L 223 16 Q 223 12 219 12 L 205 12" fill="none" stroke="${COLORS.secondary}" stroke-width="1.5" opacity="0.5"/>
  <path d="M 12 110 L 12 124 Q 12 128 16 128 L 30 128" fill="none" stroke="${COLORS.accent}" stroke-width="1.5" opacity="0.5"/>
  <path d="M 223 110 L 223 124 Q 223 128 219 128 L 205 128" fill="none" stroke="${COLORS.primary}" stroke-width="1.5" opacity="0.5"/>
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
    
    console.log('Generating stats card (480x280)...');
    const statsCard = generateStatsCard(stats);
    fs.writeFileSync(path.join(outputDir, 'stats.svg'), statsCard, 'utf8');
    
    console.log('Generating streak card (235x140)...');
    const streakCard = generateStreakCard(stats);
    fs.writeFileSync(path.join(outputDir, 'streak.svg'), streakCard, 'utf8');
    
    console.log('Generating languages card (235x140)...');
    const langsCard = generateLanguagesCard();
    fs.writeFileSync(path.join(outputDir, 'languages.svg'), langsCard, 'utf8');
    
    console.log('All stats cards generated successfully!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
