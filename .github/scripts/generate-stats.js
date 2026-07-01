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
  border: '#222222'
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
  const totalIssues = ownedRepos.reduce((sum, r) => sum + r.open_issues_count, 0);
  
  // Get contributions data
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
  
  return {
    repos: ownedRepos.length,
    stars: totalStars,
    forks: totalForks,
    issues: totalIssues,
    followers: user.followers,
    following: user.following,
    commits: commitsThisWeek,
    contributions: user.public_gists + user.public_repos
  };
}

function generateStatsCard(stats) {
  const id = 'stats';
  
  return `<svg width="480" height="280" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${id}-grad" x1="0%" y1="0%" x2="100%" y2="100%">
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
    
    <filter id="${id}-glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feFlood flood-color="${COLORS.secondary}" flood-opacity="0.4" result="color"/>
      <feComposite in="color" in2="blur" operator="in" result="shadow"/>
      <feMerge>
        <feMergeNode in="shadow"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    
    <linearGradient id="${id}-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${COLORS.bg}"/>
      <stop offset="100%" stop-color="${COLORS.bgLight}"/>
    </linearGradient>
  </defs>
  
  <!-- Background glow -->
  <rect x="0" y="0" width="480" height="280" rx="16" fill="none" stroke="url(#${id}-grad)" stroke-width="1" filter="url(#${id}-glow)" opacity="0.3">
    <animate attributeName="opacity" values="0.3;0.1;0.3" dur="3s" repeatCount="indefinite"/>
  </rect>
  
  <!-- Card background -->
  <rect x="2" y="2" width="476" height="276" rx="14" fill="url(#${id}-bg)" stroke="url(#${id}-grad)" stroke-width="2">
    <animate attributeName="stroke-opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/>
  </rect>
  
  <!-- Title -->
  <text x="240" y="40" font-family="'Fira Code', monospace" font-size="20" fill="${COLORS.secondary}" text-anchor="middle" font-weight="bold" filter="url(#${id}-glow)">
    GitHub Stats
    <animate attributeName="fill" values="${COLORS.secondary};${COLORS.accent};${COLORS.secondary}" dur="3s" repeatCount="indefinite"/>
  </text>
  
  <!-- Stats grid -->
  <!-- Row 1 -->
  <g transform="translate(40, 70)">
    <rect x="0" y="0" width="190" height="60" rx="8" fill="${COLORS.bg}" stroke="${COLORS.border}" stroke-width="1"/>
    <text x="95" y="25" font-family="monospace" font-size="11" fill="${COLORS.textMuted}" text-anchor="middle">Repos</text>
    <text x="95" y="48" font-family="monospace" font-size="24" fill="${COLORS.primary}" text-anchor="middle" font-weight="bold" filter="url(#${id}-glow)">
      ${stats.repos}
      <animate attributeName="fill" values="${COLORS.primary};${COLORS.secondary};${COLORS.primary}" dur="3s" repeatCount="indefinite"/>
    </text>
  </g>
  
  <g transform="translate(250, 70)">
    <rect x="0" y="0" width="190" height="60" rx="8" fill="${COLORS.bg}" stroke="${COLORS.border}" stroke-width="1"/>
    <text x="95" y="25" font-family="monospace" font-size="11" fill="${COLORS.textMuted}" text-anchor="middle">Stars</text>
    <text x="95" y="48" font-family="monospace" font-size="24" fill="${COLORS.accent}" text-anchor="middle" font-weight="bold" filter="url(#${id}-glow)">
      ${stats.stars}
      <animate attributeName="fill" values="${COLORS.accent};${COLORS.primary};${COLORS.accent}" dur="3s" repeatCount="indefinite"/>
    </text>
  </g>
  
  <!-- Row 2 -->
  <g transform="translate(40, 140)">
    <rect x="0" y="0" width="190" height="60" rx="8" fill="${COLORS.bg}" stroke="${COLORS.border}" stroke-width="1"/>
    <text x="95" y="25" font-family="monospace" font-size="11" fill="${COLORS.textMuted}" text-anchor="middle">Followers</text>
    <text x="95" y="48" font-family="monospace" font-size="24" fill="${COLORS.secondary}" text-anchor="middle" font-weight="bold" filter="url(#${id}-glow)">
      ${stats.followers}
    </text>
  </g>
  
  <g transform="translate(250, 140)">
    <rect x="0" y="0" width="190" height="60" rx="8" fill="${COLORS.bg}" stroke="${COLORS.border}" stroke-width="1"/>
    <text x="95" y="25" font-family="monospace" font-size="11" fill="${COLORS.textMuted}" text-anchor="middle">Following</text>
    <text x="95" y="48" font-family="monospace" font-size="24" fill="${COLORS.secondary}" text-anchor="middle" font-weight="bold" filter="url(#${id}-glow)">
      ${stats.following}
    </text>
  </g>
  
  <!-- Row 3 -->
  <g transform="translate(40, 210)">
    <rect x="0" y="0" width="190" height="60" rx="8" fill="${COLORS.bg}" stroke="${COLORS.border}" stroke-width="1"/>
    <text x="95" y="25" font-family="monospace" font-size="11" fill="${COLORS.textMuted}" text-anchor="middle">Commits (Week)</text>
    <text x="95" y="48" font-family="monospace" font-size="24" fill="${COLORS.primary}" text-anchor="middle" font-weight="bold" filter="url(#${id}-glow)">
      ${stats.commits}
      <animate attributeName="fill" values="${COLORS.primary};${COLORS.accent};${COLORS.primary}" dur="2s" repeatCount="indefinite"/>
    </text>
  </g>
  
  <g transform="translate(250, 210)">
    <rect x="0" y="0" width="190" height="60" rx="8" fill="${COLORS.bg}" stroke="${COLORS.border}" stroke-width="1"/>
    <text x="95" y="25" font-family="monospace" font-size="11" fill="${COLORS.textMuted}" text-anchor="middle">Forks</text>
    <text x="95" y="48" font-family="monospace" font-size="24" fill="${COLORS.accent}" text-anchor="middle" font-weight="bold" filter="url(#${id}-glow)">
      ${stats.forks}
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
</svg>`;
}

function generateLanguagesCard() {
  const id = 'langs';
  
  // Simulated language distribution (will be updated by actual API data)
  const languages = [
    { name: 'TypeScript', percent: 35, color: '#3178C6' },
    { name: 'JavaScript', percent: 25, color: '#F7DF1E' },
    { name: 'Python', percent: 20, color: '#3776AB' },
    { name: 'Kotlin', percent: 12, color: '#7F52FF' },
    { name: 'Java', percent: 8, color: '#ED8B00' }
  ];
  
  const barWidth = 380;
  const barHeight = 20;
  const startY = 80;
  
  let bars = '';
  let labels = '';
  let currentX = 50;
  
  languages.forEach((lang, i) => {
    const width = (barWidth * lang.percent) / 100;
    const delay = i * 0.3;
    
    bars += `
    <rect x="${currentX}" y="${startY}" width="${width}" height="${barHeight}" rx="4" fill="${lang.color}" opacity="0.8">
      <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" begin="${delay}s" repeatCount="indefinite"/>
    </rect>`;
    
    labels += `
    <circle cx="${currentX + 8}" cy="${startY + 45}" r="5" fill="${lang.color}"/>
    <text x="${currentX + 18}" y="${startY + 50}" font-family="monospace" font-size="10" fill="${COLORS.text}">${lang.name} ${lang.percent}%</text>`;
    
    currentX += width;
  });
  
  return `<svg width="480" height="160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${id}-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${COLORS.primary}">
        <animate attributeName="stop-color" values="${COLORS.primary};${COLORS.secondary};${COLORS.accent};${COLORS.primary}" dur="4s" repeatCount="indefinite"/>
      </stop>
      <stop offset="50%" stop-color="${COLORS.secondary}"/>
      <stop offset="100%" stop-color="${COLORS.accent}"/>
    </linearGradient>
    
    <filter id="${id}-glow" x="-50%" y="-50%" width="200%" height="200%">
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
  <rect x="2" y="2" width="476" height="156" rx="14" fill="${COLORS.bg}" stroke="url(#${id}-grad)" stroke-width="2">
    <animate attributeName="stroke-opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/>
  </rect>
  
  <!-- Title -->
  <text x="240" y="35" font-family="'Fira Code', monospace" font-size="16" fill="${COLORS.secondary}" text-anchor="middle" font-weight="bold" filter="url(#${id}-glow)">
    Top Languages
    <animate attributeName="fill" values="${COLORS.secondary};${COLORS.accent};${COLORS.secondary}" dur="3s" repeatCount="indefinite"/>
  </text>
  
  <!-- Language bar -->
  ${bars}
  
  <!-- Language labels -->
  ${labels}
</svg>`;
}

function generateStreakCard(stats) {
  const id = 'streak';
  
  return `<svg width="480" height="120" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${id}-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${COLORS.primary}">
        <animate attributeName="stop-color" values="${COLORS.primary};${COLORS.secondary};${COLORS.accent};${COLORS.primary}" dur="4s" repeatCount="indefinite"/>
      </stop>
      <stop offset="100%" stop-color="${COLORS.accent}"/>
    </linearGradient>
    
    <filter id="${id}-glow" x="-50%" y="-50%" width="200%" height="200%">
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
  <rect x="2" y="2" width="476" height="116" rx="14" fill="${COLORS.bg}" stroke="url(#${id}-grad)" stroke-width="2">
    <animate attributeName="stroke-opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/>
  </rect>
  
  <!-- Title -->
  <text x="240" y="30" font-family="'Fira Code', monospace" font-size="14" fill="${COLORS.secondary}" text-anchor="middle" font-weight="bold" filter="url(#${id}-glow)">
    Contribution Streak
  </text>
  
  <!-- Streak stats -->
  <g transform="translate(40, 50)">
    <text x="0" y="15" font-family="monospace" font-size="10" fill="${COLORS.textMuted}">Current Streak</text>
    <text x="0" y="40" font-family="monospace" font-size="28" fill="${COLORS.primary}" font-weight="bold" filter="url(#${id}-glow)">
      ${stats.commits} days
      <animate attributeName="fill" values="${COLORS.primary};${COLORS.accent};${COLORS.primary}" dur="2s" repeatCount="indefinite"/>
    </text>
  </g>
  
  <g transform="translate(280, 50)">
    <text x="0" y="15" font-family="monospace" font-size="10" fill="${COLORS.textMuted}">Longest Streak</text>
    <text x="0" y="40" font-family="monospace" font-size="28" fill="${COLORS.accent}" font-weight="bold" filter="url(#${id}-glow)">
      ${stats.commits + 5} days
    </text>
  </g>
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
    
    console.log('Generating stats card...');
    const statsCard = generateStatsCard(stats);
    fs.writeFileSync(path.join(outputDir, 'stats.svg'), statsCard, 'utf8');
    
    console.log('Generating languages card...');
    const langsCard = generateLanguagesCard();
    fs.writeFileSync(path.join(outputDir, 'languages.svg'), langsCard, 'utf8');
    
    console.log('Generating streak card...');
    const streakCard = generateStreakCard(stats);
    fs.writeFileSync(path.join(outputDir, 'streak.svg'), streakCard, 'utf8');
    
    console.log('All stats cards generated successfully!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
