const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const USERNAME = 'Charles-X-Core';

// Lucide Icon SVG Paths (extracted from lucide-icons/lucide)
const LUCIDE = {
  star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
  fork: '<circle cx="12" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><path d="M18 9v2c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1V9"/><path d="M12 12v3"/>',
  code: '<path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/>',
  externalLink: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  rocket: '<path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09"/><path d="M9 12a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.4 22.4 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 .05 5 .05"/>',
  eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  terminal: '<polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="5"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  cpu: '<rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  brain: '<path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M19.938 10.5a4 4 0 0 1 .585.396"/><path d="M6 18a4 4 0 0 1-1.967-.516"/><path d="M19.967 17.484A4 4 0 0 1 18 18"/>',
};

const LANG_COLORS = {
  'TypeScript': '#3178C6', 'Python': '#3776AB', 'Kotlin': '#7F52FF',
  'Java': '#ED8B00', 'JavaScript': '#F7DF1E', 'C++': '#00599C',
  'C#': '#239120', 'PHP': '#777BB4', 'HTML': '#E34F26', 'CSS': '#1572B6',
  'SCSS': '#CC6699', 'PowerShell': '#5391FE', 'Shell': '#89e051',
  'Ruby': '#CC342D', 'Go': '#00ADD8', 'Rust': '#dea584', 'Swift': '#F05138'
};

function getLangColor(lang) {
  return LANG_COLORS[lang] || '#8B5CF6';
}

function getProjectIcon(name, lang) {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('ai') || lowerName.includes('brain') || lowerName.includes('ml')) return 'brain';
  if (lowerName.includes('security') || lowerName.includes('shield') || lowerName.includes('mitm')) return 'shield';
  if (lowerName.includes('server') || lowerName.includes('api') || lowerName.includes('backend')) return 'terminal';
  if (lowerName.includes('web') || lowerName.includes('portfolio') || lowerName.includes('app')) return 'globe';
  if (lowerName.includes('iot') || lowerName.includes('esp') || lowerName.includes('led')) return 'cpu';
  if (lowerName.includes('game') || lowerName.includes('valentine')) return 'zap';
  if (lowerName.includes('azure') || lowerName.includes('cloud')) return 'rocket';
  if (lang === 'Python') return 'code';
  if (lang === 'Kotlin') return 'rocket';
  return 'code';
}

function generateProjectSVG(repo, index) {
  const id = `proj-${index}`;
  const color = getLangColor(repo.language);
  const icon = getProjectIcon(repo.name, repo.language);
  const delay = index * 0.5;
  const description = (repo.description || 'Proyecto destacado').substring(0, 80);

  // OpenGraph image for the repo
  const ogImage = `https://opengraph.githubassets.com/1/${USERNAME}/${repo.name}`;

  return `<svg width="480" height="260" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${id}-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF4444">
        <animate attributeName="stop-color" values="#FF4444;#FF6B35;#FFA500;#FF4444" dur="4s" begin="${delay}s" repeatCount="indefinite"/>
      </stop>
      <stop offset="50%" stop-color="#FF6B35">
        <animate attributeName="stop-color" values="#FF6B35;#FFA500;#FF4444;#FF6B35" dur="4s" begin="${delay}s" repeatCount="indefinite"/>
      </stop>
      <stop offset="100%" stop-color="#FFA500">
        <animate attributeName="stop-color" values="#FFA500;#FF4444;#FF6B35;#FFA500" dur="4s" begin="${delay}s" repeatCount="indefinite"/>
      </stop>
    </linearGradient>
    <linearGradient id="${id}-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0a0f"/>
      <stop offset="100%" stop-color="#111118"/>
    </linearGradient>
    <filter id="${id}-glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feFlood flood-color="${color}" flood-opacity="0.6" result="color"/>
      <feComposite in="color" in2="blur" operator="in" result="shadow"/>
      <feMerge>
        <feMergeNode in="shadow"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="${id}-neon" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feFlood flood-color="#FF6B35" flood-opacity="0.4" result="color"/>
      <feComposite in="color" in2="blur" operator="in" result="shadow"/>
      <feMerge>
        <feMergeNode in="shadow"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <clipPath id="${id}-clip">
      <rect x="16" y="16" width="200" height="130" rx="12"/>
    </clipPath>
  </defs>

  <!-- Glow effect behind card -->
  <rect x="0" y="0" width="480" height="260" rx="16" fill="none" stroke="url(#${id}-grad)" stroke-width="1" filter="url(#${id}-glow)" opacity="0.4">
    <animate attributeName="opacity" values="0.4;0.15;0.4" dur="3s" begin="${delay}s" repeatCount="indefinite"/>
  </rect>

  <!-- Card background -->
  <rect x="2" y="2" width="476" height="256" rx="14" fill="url(#${id}-bg)" stroke="url(#${id}-grad)" stroke-width="2">
    <animate attributeName="stroke-opacity" values="1;0.5;1" dur="2s" begin="${delay}s" repeatCount="indefinite"/>
  </rect>

  <!-- Project screenshot -->
  <image href="${ogImage}" x="16" y="16" width="200" height="130" clip-path="url(#${id}-clip)" preserveAspectRatio="xMidYMid slice" opacity="0.85"/>

  <!-- Screenshot overlay gradient -->
  <rect x="16" y="16" width="200" height="130" rx="12" fill="url(#${id}-bg)" opacity="0.3"/>

  <!-- Animated scan line over screenshot -->
  <rect x="16" y="16" width="200" height="4" fill="url(#${id}-grad)" opacity="0.6" clip-path="url(#${id}-clip)">
    <animate attributeName="y" values="16;142;16" dur="4s" begin="${delay}s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.6;0.2;0.6" dur="4s" begin="${delay}s" repeatCount="indefinite"/>
  </rect>

  <!-- Project icon (Lucide) -->
  <g transform="translate(236, 24)" stroke="${color}" fill="none" stroke-width="1.5" filter="url(#${id}-neon)">
    <g transform="scale(0.9)">
      ${LUCIDE[icon]}
      <animate attributeName="stroke" values="${color};#FFA500;${color}" dur="3s" begin="${delay}s" repeatCount="indefinite"/>
    </g>
  </g>

  <!-- Project name -->
  <text x="264" y="44" font-family="'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace" font-size="16" fill="#FF6B35" font-weight="bold" filter="url(#${id}-neon)">
    ${repo.name}
    <animate attributeName="fill" values="#FF6B35;#FFA500;#FF6B35" dur="3s" begin="${delay}s" repeatCount="indefinite"/>
  </text>

  <!-- Language badge -->
  <rect x="264" y="56" width="${(repo.language || 'Code').length * 8 + 24}" height="22" rx="11" fill="${color}" opacity="0.25"/>
  <rect x="264" y="56" width="${(repo.language || 'Code').length * 8 + 24}" height="22" rx="11" fill="none" stroke="${color}" stroke-width="1" opacity="0.6"/>
  <circle cx="278" cy="67" r="4" fill="${color}"/>
  <text x="288" y="72" font-family="monospace" font-size="10" fill="${color}">${repo.language || 'Code'}</text>

  <!-- Star icon (Lucide) -->
  <g transform="translate(264, 90)" stroke="#FFA500" fill="none" stroke-width="1.5">
    <g transform="scale(0.65)">
      ${LUCIDE.star}
      <animate attributeName="stroke" values="#FFA500;#FF4444;#FFA500" dur="2s" begin="${delay}s" repeatCount="indefinite"/>
    </g>
  </g>
  <text x="284" y="100" font-family="monospace" font-size="12" fill="#ffffff">${repo.stargazers_count}</text>

  <!-- Fork icon (Lucide) -->
  <g transform="translate(320, 90)" stroke="#FF6B35" fill="none" stroke-width="1.5">
    <g transform="scale(0.65)">
      ${LUCIDE.fork}
    </g>
  </g>
  <text x="340" y="100" font-family="monospace" font-size="12" fill="#ffffff">${repo.forks_count}</text>

  <!-- Description -->
  <text x="264" y="130" font-family="monospace" font-size="10" fill="#888888">
    ${description.length > 40 ? description.substring(0, 40) : description}
    ${description.length > 40 ? `<tspan x="264" dy="14">${description.substring(40, 80)}</tspan>` : ''}
  </text>

  <!-- View Code button -->
  <a href="https://github.com/${USERNAME}/${repo.name}" target="_blank">
    <g transform="translate(264, 170)">
      <rect x="0" y="0" width="90" height="30" rx="15" fill="none" stroke="#FF4444" stroke-width="1.5">
        <animate attributeName="stroke" values="#FF4444;#FF6B35;#FF4444" dur="2s" begin="${delay}s" repeatCount="indefinite"/>
        <animate attributeName="stroke-opacity" values="1;0.5;1" dur="2s" begin="${delay}s" repeatCount="indefinite"/>
      </rect>
      <g transform="translate(10, 8)" stroke="#FF6B35" fill="none" stroke-width="1.5">
        <g transform="scale(0.65)">
          ${LUCIDE.code}
        </g>
      </g>
      <text x="50" y="20" font-family="monospace" font-size="10" fill="#FF6B35" text-anchor="middle">
        Codigo
        <animate attributeName="fill" values="#FF6B35;#FFA500;#FF6B35" dur="2s" begin="${delay}s" repeatCount="indefinite"/>
      </text>
    </g>
  </a>

  <!-- View Live button (only if homepage is a real external URL) -->
  ${repo.homepage && !repo.homepage.includes('github.com') ? `
  <a href="${repo.homepage}" target="_blank">
    <g transform="translate(364, 170)">
      <rect x="0" y="0" width="90" height="30" rx="15" fill="none" stroke="#FFA500" stroke-width="1.5">
        <animate attributeName="stroke" values="#FFA500;#FF4444;#FFA500" dur="2s" begin="${delay}s" repeatCount="indefinite"/>
      </rect>
      <g transform="translate(10, 8)" stroke="#FFA500" fill="none" stroke-width="1.5">
        <g transform="scale(0.65)">
          ${LUCIDE.externalLink}
        </g>
      </g>
      <text x="50" y="20" font-family="monospace" font-size="10" fill="#FFA500" text-anchor="middle">
        Live
        <animate attributeName="fill" values="#FFA500;#FF4444;#FFA500" dur="2s" begin="${delay}s" repeatCount="indefinite"/>
      </text>
    </g>
  </a>` : ''}

  <!-- Floating particles -->
  <circle cx="40" cy="240" r="1.5" fill="#FF4444" opacity="0">
    <animate attributeName="cy" values="250;10" dur="${6 + index}s" begin="${delay}s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0;0.6;0" dur="${6 + index}s" begin="${delay}s" repeatCount="indefinite"/>
    <animate attributeName="cx" values="40;60;40" dur="${8 + index}s" begin="${delay}s" repeatCount="indefinite"/>
  </circle>
  <circle cx="450" cy="200" r="1" fill="#FF6B35" opacity="0">
    <animate attributeName="cy" values="250;20" dur="${7 + index}s" begin="${delay + 1}s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0;0.4;0" dur="${7 + index}s" begin="${delay + 1}s" repeatCount="indefinite"/>
  </circle>
  <circle cx="230" cy="150" r="2" fill="#FFA500" opacity="0">
    <animate attributeName="cy" values="260;5" dur="${5 + index}s" begin="${delay + 0.5}s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0;0.5;0" dur="${5 + index}s" begin="${delay + 0.5}s" repeatCount="indefinite"/>
    <animate attributeName="cx" values="230;250;230" dur="${9 + index}s" begin="${delay}s" repeatCount="indefinite"/>
  </circle>

  <!-- Corner accents -->
  <path d="M 16 40 L 16 20 Q 16 16 20 16 L 40 16" fill="none" stroke="#FF4444" stroke-width="2" opacity="0.6">
    <animate attributeName="stroke" values="#FF4444;#FF6B35;#FF4444" dur="3s" begin="${delay}s" repeatCount="indefinite"/>
  </path>
  <path d="M 464 40 L 464 20 Q 464 16 460 16 L 440 16" fill="none" stroke="#FF6B35" stroke-width="2" opacity="0.6">
    <animate attributeName="stroke" values="#FF6B35;#FFA500;#FF6B35" dur="3s" begin="${delay}s" repeatCount="indefinite"/>
  </path>
  <path d="M 16 220 L 16 240 Q 16 244 20 244 L 40 244" fill="none" stroke="#FFA500" stroke-width="2" opacity="0.6">
    <animate attributeName="stroke" values="#FFA500;#FF4444;#FFA500" dur="3s" begin="${delay}s" repeatCount="indefinite"/>
  </path>
  <path d="M 464 220 L 464 240 Q 464 244 460 244 L 440 244" fill="none" stroke="#FF4444" stroke-width="2" opacity="0.6">
    <animate attributeName="stroke" values="#FF4444;#FF6B35;#FF4444" dur="3s" begin="${delay}s" repeatCount="indefinite"/>
  </path>
</svg>`;
}

function generateProjectsSection(repos) {
  // Generate individual SVG files
  const generatedDir = path.join(__dirname, '..', 'generated');
  if (!fs.existsSync(generatedDir)) {
    fs.mkdirSync(generatedDir, { recursive: true });
  }

  let svgImages = [];
  repos.forEach((repo, i) => {
    const svgContent = generateProjectSVG(repo, i);
    const svgPath = path.join(generatedDir, `project-${i}.svg`);
    fs.writeFileSync(svgPath, svgContent, 'utf8');
    svgImages.push(`<img src=".github/generated/project-${i}.svg" alt="${repo.name}" width="480" />`);
  });

  // Create 2-column layout using HTML table
  let tableRows = '';
  for (let i = 0; i < svgImages.length; i += 2) {
    const left = svgImages[i];
    const right = svgImages[i + 1] || '';
    tableRows += `<tr>\n<td align="center">${left}</td>\n<td align="center">${right}</td>\n</tr>\n`;
  }

  return `<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&pause=1000&color=FF4444&center=true&vCenter=true&width=500&lines=Recent+Projects;Proyectos+Recientes&duration=2000" alt="Projects Title" />

<br/>

<table align="center">
${tableRows}</table>

</div>`;
}

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed: ${url}`);
  return res.json();
}

async function getProfileData() {
  const user = await fetchJSON(`https://api.github.com/users/${USERNAME}`);
  const repos = await fetchJSON(`https://api.github.com/users/${USERNAME}/repos?per_page=100&sort=updated`);

  const ownedRepos = repos.filter(r => !r.fork);
  const totalStars = ownedRepos.reduce((sum, r) => sum + r.stargazers_count, 0);
  const totalForks = ownedRepos.reduce((sum, r) => sum + r.forks_count, 0);

  // Get the 6 most interesting repos (prioritize by stars, then recent)
  const recentRepos = ownedRepos
    .sort((a, b) => {
      // Prioritize repos with descriptions and languages
      const aScore = a.stargazers_count * 10 + (a.description ? 5 : 0) + (a.language ? 3 : 0);
      const bScore = b.stargazers_count * 10 + (b.description ? 5 : 0) + (b.language ? 3 : 0);
      return bScore - aScore;
    })
    .slice(0, 6);

  return {
    user,
    totalRepos: ownedRepos.length,
    totalStars,
    totalForks,
    recentRepos
  };
}

function generateReadme(data) {
  const { user, totalRepos, totalStars, totalForks, recentRepos } = data;

  const projectsSection = generateProjectsSection(recentRepos);

  return `<!-- AUTO-GENERATED - DO NOT EDIT MANUALLY -->
<div align="center">

<!-- HEADER -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0a0a0f,25:ff4444,50:ff6b35,75:ffa500,100:0a0a0f&height=200&section=header&text=CHARLES-X&fontSize=90&fontColor=ffffff&animation=fadeIn&fontAlignY=42" width="100%" />

<br/>

<!-- SUBTITLE -->
<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&pause=1000&color=FF6B35&center=true&vCenter=true&width=600&lines=Full+Stack+Developer;AI+%26+Automation+Engineer;Network+Security+Researcher;Cyberpunk+Coder&duration=2000" alt="Typing SVG" />

</div>

<br/>

<!-- SOCIAL -->
<div align="center">
<a href="https://www.linkedin.com/in/carlos-alonso-picho-vargas-87738213b/" target="_blank"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"/></a>
<a href="https://capv-portfolio.vercel.app/" target="_blank"><img src="https://img.shields.io/badge/Portfolio-FF4444?style=for-the-badge&logo=vercel&logoColor=white" alt="Portfolio"/></a>
<a href="https://github.com/Charles-X-Core" target="_blank"><img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/></a>
<a href="mailto:carlos@example.com"><img src="https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white" alt="Email"/></a>
</div>

<br/>

---

## About Me

<table>
<tr>
<td width="50%">

**Sobre Mi**

Soy **Carlos Alonso Picho Vargas**, conocido como **CHARLES-X**. Desarrollador de software apasionado por la **inteligencia artificial**, la **automatizacion** y la **seguridad de redes**.

- Full Stack Developer
- AI & Automation Enthusiast
- Network Security Researcher
- Cloud Computing (Azure)

</td>
<td width="50%">

**About Me**

I'm **Carlos Alonso Picho Vargas**, known as **CHARLES-X**. A software developer passionate about **artificial intelligence**, **automation**, and **network security**.

- Full Stack Developer
- AI & Automation Enthusiast
- Network Security Researcher
- Cloud Computing (Azure)

</td>
</tr>
</table>

<br/>

---

## Tech Stack

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Kotlin](https://img.shields.io/badge/Kotlin-7F52FF?style=for-the-badge&logo=kotlin&logoColor=white)
![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![C%23](https://img.shields.io/badge/C%23-239120?style=for-the-badge&logo=csharp&logoColor=white)
![PHP](https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)

![Azure](https://img.shields.io/badge/Azure-0089D6?style=for-the-badge&logo=microsoft-azure&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![MCP](https://img.shields.io/badge/MCP-FF6B35?style=for-the-badge&logo=robot&logoColor=white)
![ESP32](https://img.shields.io/badge/ESP32-E7352C?style=for-the-badge&logo=espressif&logoColor=white)

</div>

<br/>

---

## GitHub Stats

<table align="center">
<tr>
<td colspan="2" align="center">
<img src="metrics/stats.svg" width="600" />
</td>
</tr>
<tr>
<td align="center">
<img src="metrics/streak.svg" width="295" />
</td>
<td align="center">
<img src="metrics/languages.svg" width="295" />
</td>
</tr>
</table>

<br/>

---

## Achievements

<div align="center">

| | | | |
|:---:|:---:|:---:|:---:|
| ![Repos](https://img.shields.io/badge/Repos-${totalRepos}+-FF4444?style=for-the-badge&logo=github&logoColor=white) | ![Stars](https://img.shields.io/badge/Stars-${totalStars}-gold?style=for-the-badge&logo=github&logoColor=white) | ![Forks](https://img.shields.io/badge/Forks-${totalForks}-blue?style=for-the-badge&logo=github&logoColor=white) | ![Follow](https://img.shields.io/badge/Follow-@Charles--X--Core-brightgreen?style=for-the-badge&logo=github&logoColor=white) |

| | | | |
|:---:|:---:|:---:|:---:|
| ![AI](https://img.shields.io/badge/AI_Automation-FFA500?style=for-the-badge&logo=robot&logoColor=white) | ![Security](https://img.shields.io/badge/Security_Research-FF4444?style=for-the-badge&logo=shield-halved&logoColor=white) | ![Azure](https://img.shields.io/badge/Azure_Cloud-0089D6?style=for-the-badge&logo=microsoft-azure&logoColor=white) | ![FullStack](https://img.shields.io/badge/Full_Stack-FF6B35?style=for-the-badge&logo=react&logoColor=white) |

| | |
|:---:|:---:|
| ![Mobile](https://img.shields.io/badge/Mobile_Dev-7F52FF?style=for-the-badge&logo=kotlin&logoColor=white) | ![IoT](https://img.shields.io/badge/IoT_Hacker-E7352C?style=for-the-badge&logo=espressif&logoColor=white) |

</div>

<br/>

---

${projectsSection}

<br/>

---

## Activity

<div align="center">
<a href="https://github.com/Charles-X-Core">
<img src="https://github-readme-activity-graph.vercel.app/graph?username=Charles-X-Core&bg_color=0a0a0f&color=ff4444&line=ff6b35&point=ffa500&area=true&area_color=ff4444&hide_border=true" width="100%" />
</a>
</div>

<br/>

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0a0a0f,25:ffa500,50:ff6b35,75:ff4444,100:0a0a0f&height=80&section=footer" width="100%" />

![Profile Views](https://komarev.com/ghpvc/?username=Charles-X-Core&color=ff4444&style=for-the-badge&label=PROFILE+VIEWS&label_color=0a0a0f)

**Made with code by CHARLES-X**

</div>`;
}

async function main() {
  try {
    console.log('Fetching profile data...');
    const data = await getProfileData();
    console.log(`Found ${data.totalRepos} repos, ${data.totalStars} stars`);

    console.log('Generating SVG project cards...');
    const readme = generateReadme(data);

    const readmePath = path.join(__dirname, '..', '..', 'README.md');
    fs.writeFileSync(readmePath, readme, 'utf8');

    console.log('README.md and SVG cards generated successfully!');
    console.log('SVG files saved to .github/generated/');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
