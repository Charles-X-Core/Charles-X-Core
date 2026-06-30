const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const USERNAME = 'Charles-X-Core';

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

  const recentRepos = ownedRepos
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
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

  const repoRows = recentRepos.map(r => {
    const langBadge = r.language
      ? `![${r.language}](https://img.shields.io/badge/${encodeURIComponent(r.language)}-${getLangColor(r.language)}?style=flat-square&logo=${r.language.toLowerCase()}&logoColor=white)`
      : '';
    return `| **${r.name}** | ${langBadge} | ${r.stargazers_count} | ${r.forks_count} | [Ver](https://github.com/${USERNAME}/${r.name}) |`;
  }).join('\n');

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

<div align="center">
<a href="https://github.com/Charles-X-Core">
<img src="https://github-readme-stats.vercel.app/api?username=Charles-X-Core&show_icons=true&theme=radical&hide_border=false&count_private=true&include_all_commits=true&bg_color=0a0a0f&title_color=ff4444&icon_color=ff6b35&text_color=ffffff&border_color=ff4444" width="48%" />
</a>
<a href="https://github.com/Charles-X-Core">
<img src="https://github-readme-streak-stats.herokuapp.com/?user=Charles-X-Core&theme=radical&hide_border=false&background=0a0a0f&ring=ff4444&fire=ff6b35&currStreakLabel=ffa500&sideLabels=ffffff&dates=ffffff&border=ff4444" width="48%" />
</a>
</div>

<div align="center">
<a href="https://github.com/Charles-X-Core">
<img src="https://github-readme-stats.vercel.app/api/top-langs/?username=Charles-X-Core&layout=compact&theme=radical&hide_border=false&bg_color=0a0a0f&title_color=ff4444&text_color=ffffff&border_color=ff4444&langs_count=8" width="50%" />
</a>
</div>

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

## Recent Projects

*Auto-updated every 6 hours via GitHub Actions*

| Repository | Language | Stars | Forks | Link |
|:-----------|:--------:|:-----:|:-----:|:----:|
${repoRows}

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

function getLangColor(lang) {
  const colors = {
    'TypeScript': '3178C6', 'Python': '3776AB', 'Kotlin': '7F52FF',
    'Java': 'ED8B00', 'JavaScript': 'F7DF1E', 'C++': '00599C',
    'C#': '239120', 'PHP': '777BB4', 'HTML': 'E34F26', 'CSS': '1572B6',
    'SCSS': 'CC6699', 'PowerShell': '5391FE', 'Shell': '89e051',
    'Ruby': 'CC342D', 'Go': '00ADD8', 'Rust': 'dea584', 'Swift': 'F05138'
  };
  return colors[lang] || '8B5CF6';
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
