const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const USERNAME = 'Charles-X-Core';
const TOKEN = process.env.GITHUB_TOKEN;

async function fetchJSON(url) {
  const res = await fetch(url, {
    headers: TOKEN ? { Authorization: `token ${TOKEN}` } : {}
  });
  if (!res.ok) throw new Error(`Failed: ${url}`);
  return res.json();
}

async function getProfileData() {
  const user = await fetchJSON(`https://api.github.com/users/${USERNAME}`);
  const repos = await fetchJSON(`https://api.github.com/users/${USERNAME}/repos?per_page=100&sort=updated`);
  const events = await fetchJSON(`https://api.github.com/users/${USERNAME}/events/public?per_page=100`);

  const ownedRepos = repos.filter(r => !r.fork);
  const totalStars = ownedRepos.reduce((sum, r) => sum + r.stargazers_count, 0);
  const totalForks = ownedRepos.reduce((sum, r) => sum + r.forks_count, 0);

  const langStats = {};
  ownedRepos.forEach(r => {
    if (r.language) {
      langStats[r.language] = (langStats[r.language] || 0) + 1;
    }
  });

  const topLangs = Object.entries(langStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([lang, count]) => ({ lang, count, pct: Math.round((count / ownedRepos.length) * 100) }));

  const recentRepos = ownedRepos
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 6);

  const recentCommits = events.filter(e => e.type === 'PushEvent').length;

  return {
    user,
    totalRepos: ownedRepos.length,
    totalStars,
    totalForks,
    topLangs,
    recentRepos,
    recentCommits
  };
}

function generateLangBar(langs) {
  const colors = {
    'TypeScript': '#3178C6',
    'Python': '#3776AB',
    'Kotlin': '#7F52FF',
    'Java': '#ED8B00',
    'JavaScript': '#F7DF1E',
    'C++': '#00599C',
    'C#': '#239120',
    'PHP': '#777BB4',
    'HTML': '#E34F26',
    'CSS': '#1572B6',
    'SCSS': '#CC6699',
    'PowerShell': '#5391FE'
  };

  let bars = '';
  langs.forEach(l => {
    const color = colors[l.lang] || '#8B5CF6';
    bars += `
      <div style="display:flex;align-items:center;margin:4px 0;">
        <span style="width:120px;font-size:13px;color:#e0e0e0;font-family:monospace;">${l.lang}</span>
        <div style="flex:1;height:10px;background:#1a1a2e;border-radius:5px;overflow:hidden;">
          <div style="width:${l.pct}%;height:100%;background:${color};border-radius:5px;"></div>
        </div>
        <span style="width:45px;font-size:12px;color:#888;text-align:right;margin-left:8px;">${l.pct}%</span>
      </div>`;
  });
  return bars;
}

function generateReadme(data) {
  const { user, totalRepos, totalStars, totalForks, topLangs, recentRepos, recentCommits } = data;
  const now = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const langBars = generateLangBar(topLangs);

  const repoCards = recentRepos.map(r => {
    const langColor = {
      'TypeScript': '3178C6', 'Python': '3776AB', 'Kotlin': '7F52FF',
      'Java': 'ED8B00', 'JavaScript': 'F7DF1E', 'C++': '00599C',
      'C#': '239120', 'PHP': '777BB4', 'HTML': 'E34F26', 'CSS': '1572B6'
    }[r.language] || '8B5CF6';

    return `
  <a href="${r.html_url}">
    <div style="display:inline-block;width:320px;padding:16px;margin:8px;background:linear-gradient(135deg,#0d0d0d 0%,#1a1a2e 100%);border:1px solid #ff4444;border-radius:12px;vertical-align:top;">
      <div style="display:flex;align-items:center;margin-bottom:8px;">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="#ff6b35"><path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9z"/></svg>
        <span style="color:#ffffff;font-weight:bold;margin-left:8px;font-size:14px;">${r.name}</span>
      </div>
      <div style="color:#9ca3af;font-size:12px;margin-bottom:10px;height:32px;overflow:hidden;">${r.description || 'Sin descripcion'}</div>
      <div style="display:flex;align-items:center;gap:12px;">
        <span style="background:#${langColor};color:white;padding:2px 8px;border-radius:4px;font-size:11px;">${r.language || 'N/A'}</span>
        <span style="color:#ffa500;font-size:11px;">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="#ffa500" style="vertical-align:middle;"><path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/></svg>
          ${r.stargazers_count}
        </span>
        <span style="color:#888;font-size:11px;">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="#888" style="vertical-align:middle;"><path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75v-.878a2.25 2.25 0 111.5 0v.878a2.25 2.25 0 01-2.25 2.25h-1.5v2.128a2.251 2.251 0 11-1.5 0V8.5h-1.5A2.25 2.25 0 013.5 6.25v-.878a2.25 2.25 0 111.5 0zM5 3.25a.75.75 0 10-1.5 0 .75.75 0 001.5 0zm6.75.75a.75.75 0 100-1.5.75.75 0 000 1.5zM8 12.75a.75.75 0 10-1.5 0 .75.75 0 001.5 0z"/></svg>
          ${r.forks_count}
        </span>
      </div>
    </div>
  </a>`;
  }).join('');

  return `<!-- AUTO-GENERATED - DO NOT EDIT MANUALLY -->
<!-- Last updated: ${now} -->
<div align="center">

<!-- HEADER -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0a0a0f,25:ff4444,50:ff6b35,75:ffa500,100:0a0a0f&height=200&section=header&text=CHARLES-X&fontSize=90&fontColor=ffffff&animation=fadeIn&fontAlignY=42" width="100%" />

<br/>

<!-- SUBTITLE -->
<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&pause=1000&color=FF6B35&center=true&vCenter=true&width=600&lines=Full+Stack+Developer;AI+%26+Automation+Engineer;Network+Security+Researcher;Cyberpunk+Coder&duration=2000" alt="Typing SVG" />

</div>

<br/>

<!-- SOCIAL BADGES -->
<div align="center">
<a href="https://www.linkedin.com/in/carlos-alonso-picho-vargas-87738213b/" target="_blank"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"/></a>
<a href="https://capv-portfolio.vercel.app/" target="_blank"><img src="https://img.shields.io/badge/Portfolio-FF4444?style=for-the-badge&logo=vercel&logoColor=white" alt="Portfolio"/></a>
<a href="https://github.com/Charles-X-Core" target="_blank"><img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/></a>
<a href="mailto:carlos@example.com"><img src="https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white" alt="Email"/></a>
</div>

<br/>

---

<!-- ABOUT ME -->
<table>
<tr>
<td width="50%" style="padding:20px;">

### <img src="https://raw.githubusercontent.com/tandpfun/readme-emojis/master/emojis/smile.png" width="20" height="20"> Sobre Mi

Soy **Carlos Alonso Picho Vargas**, conocido como **CHARLES-X**. Desarrollador de software apasionado por la **inteligencia artificial**, la **automatizacion** y la **seguridad de redes**.

Me encanta crear soluciones que combinan tecnologia de vanguardia con diseno innovador. Desde aplicaciones moviles hasta sistemas de automatizacion de redes con MCP, siempre busco superar los limites de lo posible.

- Full Stack Developer
- AI & Automation Enthusiast
- Network Security Researcher
- Cloud Computing (Azure)

</td>
<td width="50%" style="padding:20px;">

### <img src="https://raw.githubusercontent.com/tandpfun/readme-emojis/master/emojis/globe.png" width="20" height="20"> About Me

I'm **Carlos Alonso Picho Vargas**, known as **CHARLES-X**. A software developer passionate about **artificial intelligence**, **automation**, and **network security**.

I love creating solutions that combine cutting-edge technology with innovative design. From mobile apps to MCP network automation systems, I always push the boundaries of what's possible.

- Full Stack Developer
- AI & Automation Enthusiast
- Network Security Researcher
- Cloud Computing (Azure)

</td>
</tr>
</table>

<br/>

---

<!-- TECH STACK -->
<div align="center">

### <img src="https://raw.githubusercontent.com/tandpfun/readme-emojis/master/emojis/wrench.png" width="20" height="20"> Tech Stack

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Kotlin](https://img.shields.io/badge/Kotlin-7F52FF?style=for-the-badge&logo=kotlin&logoColor=white)
![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![C%23](https://img.shields.io/badge/C%23-239120?style=for-the-badge&logo=csharp&logoColor=white)
![PHP](https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

<br/>

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)

<br/>

![Azure](https://img.shields.io/badge/Azure-0089D6?style=for-the-badge&logo=microsoft-azure&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![MCP](https://img.shields.io/badge/MCP-FF6B35?style=for-the-badge&logo=robot&logoColor=white)
![ESP32](https://img.shields.io/badge/ESP32-E7352C?style=for-the-badge&logo=espressif&logoColor=white)

</div>

<br/>

---

<!-- STATS -->
<div align="center">

### <img src="https://raw.githubusercontent.com/tandpfun/readme-emojis/master/emojis/chart.png" width="20" height="20"> GitHub Stats

<a href="https://github.com/Charles-X-Core">
<img src="https://github-readme-stats.vercel.app/api?username=Charles-X-Core&show_icons=true&theme=radical&hide_border=false&count_private=true&include_all_commits=true&bg_color=0a0a0f&title_color=ff4444&icon_color=ff6b35&text_color=ffffff&border_color=ff4444&ring_color=ffa500" width="48%" />
</a>
<a href="https://github.com/Charles-X-Core">
<img src="https://streak-stats.demolab.com?user=Charles-X-Core&theme=radical&hide_border=false&background=0a0a0f&ring=ff4444&fire=ff6b35&currStreakLabel=ffa500&sideLabels=ffffff&dates=ffffff&border=ff4444" width="48%" />
</a>

</div>

<br/>

<!-- LANGUAGES -->
<div align="center">

### <img src="https://raw.githubusercontent.com/tandpfun/readme-emojis/master/emojis/books.png" width="20" height="20"> Top Languages

<div style="max-width:500px;text-align:left;padding:20px;background:linear-gradient(135deg,#0a0a0f 0%,#1a1a2e 100%);border:1px solid #ff4444;border-radius:12px;">

${langBars}

</div>

</div>

<br/>

---

<!-- ACHIEVEMENTS -->
<div align="center">

### <img src="https://raw.githubusercontent.com/tandpfun/readme-emojis/master/emojis/trophy.png" width="20" height="20"> Achievements

<a href="https://github.com/Charles-X-Core">
<img src="https://img.shields.io/badge/Repositorios-${totalRepos}+-FF4444?style=for-the-badge&logo=github&logoColor=white" alt="Repos"/>
</a>
<a href="https://github.com/Charles-X-Core">
<img src="https://img.shields.io/badge/Stars-${totalStars}-gold?style=for-the-badge&logo=github&logoColor=white" alt="Stars"/>
</a>
<a href="https://github.com/Charles-X-Core">
<img src="https://img.shields.io/badge/Forks-${totalForks}-blue?style=for-the-badge&logo=github&logoColor=white" alt="Forks"/>
</a>
<a href="https://github.com/Charles-X-Core">
<img src="https://img.shields.io/badge/Commits-${recentCommits}+-FF6B35?style=for-the-badge&logo=git&logoColor=white" alt="Commits"/>
</a>

<br/>

<a href="https://github.com/Charles-X-Core">
<img src="https://img.shields.io/badge/AI_Automation-FFA500?style=for-the-badge&logo=robot&logoColor=white" alt="AI"/>
</a>
<a href="https://github.com/Charles-X-Core">
<img src="https://img.shields.io/badge/Security_Research-FF4444?style=for-the-badge&logo=security-insights&logoColor=white" alt="Security"/>
</a>
<a href="https://github.com/Charles-X-Core">
<img src="https://img.shields.io/badge/Azure_Cloud-0089D6?style=for-the-badge&logo=microsoft-azure&logoColor=white" alt="Azure"/>
</a>
<a href="https://github.com/Charles-X-Core">
<img src="https://img.shields.io/badge/Full_Stack-FF6B35?style=for-the-badge&logo=react&logoColor=white" alt="FullStack"/>
</a>
<a href="https://github.com/Charles-X-Core">
<img src="https://img.shields.io/badge/Mobile_Dev-7F52FF?style=for-the-badge&logo=kotlin&logoColor=white" alt="Mobile"/>
</a>
<a href="https://github.com/Charles-X-Core">
<img src="https://img.shields.io/badge/IoT_Hacker-E7352C?style=for-the-badge&logo=espressif&logoColor=white" alt="IoT"/>
</a>

</div>

<br/>

---

<!-- RECENT PROJECTS AUTO-GENERATED -->
<div align="center">

### <img src="https://raw.githubusercontent.com/tandpfun/readme-emojis/master/emojis/rocket.png" width="20" height="20"> Proyectos Recientes

*Actualizado automaticamente cada 6 horas*

<br/>

${repoCards}

</div>

<br/>

---

<!-- ACTIVITY -->
<div align="center">

### <img src="https://raw.githubusercontent.com/tandpfun/readme-emojis/master/emojis/chart_with_upwards_trend.png" width="20" height="20"> Activity

<a href="https://github.com/Charles-X-Core">
<img src="https://github-readme-activity-graph.vercel.app/graph?username=Charles-X-Core&bg_color=0a0a0f&color=ff4444&line=ff6b35&point=ffa500&area=true&area_color=ff4444&hide_border=true" width="100%" />
</a>

</div>

<br/>

---

<!-- FOOTER -->
<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0a0a0f,25:ffa500,50:ff6b35,75:ff4444,100:0a0a0f&height=80&section=footer" width="100%" />

<br/>

![Profile Views](https://komarev.com/ghpvc/?username=Charles-X-Core&color=ff4444&style=for-the-badge&label=PROFILE+VIEWS&label_color=0a0a0f)

<br/>

**Made with code by CHARLES-X**

*"The only way to do great work is to love what you do." - Steve Jobs*

</div>`;
}

async function main() {
  try {
    console.log('Fetching profile data...');
    const data = await getProfileData();
    console.log(`Found ${data.totalRepos} repos, ${data.totalStars} stars`);

    console.log('Generating README...');
    const readme = generateReadme(data);

    const readmePath = path.join(__dirname, '..', '..', 'README.md');
    fs.writeFileSync(readmePath, readme, 'utf8');

    console.log('README.md updated successfully!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
