const profileName = 'Kajetan Karbowski';
const github = 'https://github.com/karbolak';
const sectionNames = {
  home: 'Home',
  projects: 'Projects',
  experience: 'Experience',
  education: 'Education',
  skills: 'Skills',
};

const roles = {
  general: {
    label: 'General',
    heading: profileName,
    intro: 'I’m an MSc Artificial Intelligence student at the University of Groningen, interested in AI research, software engineering, and education.',
    start: 'home',
  },
  research: {
    label: 'AI / Research',
    heading: 'AI & Research',
    intro: 'I study Artificial Intelligence at the University of Groningen. My interests include machine learning, algorithmic fairness, and multi-agent systems.',
    start: 'projects',
  },
  engineering: {
    label: 'Software Engineering',
    heading: 'Software Engineering',
    intro: 'My background combines programming and applied AI. My work includes Python tools for machine learning experiments, such as DiffGate.',
    start: 'projects',
  },
  teaching: {
    label: 'Teaching / Education',
    heading: 'Teaching & Education',
    intro: 'I’ve tutored students in mathematics, physics, and programming and worked as an educational camp instructor.',
    start: 'experience',
  },
};

const entries = {
  projects: [
    ['DiffGate', 'Bachelor’s thesis · Python', 'A research prototype that uses early denoising signals to assess image quality while a diffusion model is still generating.', 'engineering', 'DiffGate'],
    ['FORESCAN', 'Machine learning research', 'Explores whether changes in pupil size can predict cognitive overload early enough to trigger an alert.', 'research', 'FORESCAN'],
    ['PANA', 'Student support · Chatbot project', 'A Polish-language chatbot project for students navigating admissions, academic life, and everyday questions in the Netherlands.', 'teaching', 'PANA'],
  ],
  experience: [
    ['Private tutoring', 'Teaching', 'One-to-one tutoring in mathematics, physics, and programming.', 'teaching'],
    ['Educational camp instructor', 'Education', '', 'teaching'],
  ],
  education: [
    ['MSc Artificial Intelligence', 'University of Groningen', 'Current master’s studies.'],
    ['BSc Artificial Intelligence', 'Undergraduate study', 'Bachelor’s thesis on early quality prediction in text-to-image diffusion.'],
    ['HTSM Honours Master', 'Honours education', 'High Tech Systems and Materials.'],
  ],
  skills: [
    ['Machine learning', 'AI / Research', 'Model training and evaluation, with experience in time-series forecasting and diffusion models.', 'research'],
    ['Multi-agent systems', 'AI / Research', '', 'research'],
    ['Programming', 'Software Engineering', 'Python, machine learning tooling, and web development.', 'engineering'],
    ['Tutoring and instruction', 'Teaching / Education', 'Mathematics, physics, and programming.', 'teaching'],
  ],
};

const portfolio = document.querySelector('.portfolio');
const path = portfolio.querySelector('.dos-path');
const heading = portfolio.querySelector('h1');
const intro = portfolio.querySelector('.intro');
const sectionContent = portfolio.querySelector('#section-content');
const roleStatus = portfolio.querySelector('#current-role');
const sectionStatus = portfolio.querySelector('#current-section');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let role;
let section;
let theme;
let animationFrame;
let typingElement;

function readLocation() {
  const params = new URLSearchParams(location.search);
  role = Object.hasOwn(roles, params.get('role')) ? params.get('role') : 'general';
  section = Object.hasOwn(sectionNames, params.get('section')) ? params.get('section') : roles[role].start;
  theme = params.get('theme') === 'dark' ? 'dark' : 'light';
}

function writeLocation(replace = false) {
  const params = new URLSearchParams();
  if (role !== 'general') params.set('role', role);
  if (section !== roles[role].start) params.set('section', section);
  if (theme === 'dark') params.set('theme', theme);
  const url = params.size ? `?${params}` : location.pathname;
  if (replace) history.replaceState(null, '', url);
  else history.pushState(null, '', url);
}

function renderSection(items) {
  if (section === 'home') return '';
  return `<section class="section" aria-labelledby="section-heading">
    <div class="section-label"><h2 id="section-heading">${sectionNames[section]}</h2></div>
    <ul class="entries">
      ${items.map(([title, meta, description, , repository]) => `<li class="entry">
        <p class="meta">${meta}</p>
        <h3>${repository ? `<a href="${github}/${repository}">${title}</a>` : title}</h3>
        ${description ? `<p class="description">${description}</p>` : ''}
      </li>`).join('')}
    </ul>
  </section>`;
}

function render() {
  stopTyping();
  const view = roles[role];
  const items = [...(entries[section] ?? [])];
  items.sort((first, second) => Number(second[3] === role) - Number(first[3] === role));

  portfolio.dataset.theme = theme;
  for (const button of portfolio.querySelectorAll('[data-section], [data-role], [data-color]')) {
    const active = button.dataset.section === section || button.dataset.role === role || button.dataset.color === theme;
    button.setAttribute('aria-pressed', active);
  }
  path.querySelector('.heading-text').textContent = `~/portfolio/${section}`;
  heading.querySelector('.heading-text').textContent = view.heading;
  intro.textContent = view.intro;
  sectionContent.innerHTML = renderSection(items);
  roleStatus.textContent = view.label;
  sectionStatus.textContent = section === 'home' ? 'Home' : `${items.length} entries`;
  document.title = section === 'home' ? profileName : `${sectionNames[section]} · ${profileName}`;
}

function stopTyping() {
  cancelAnimationFrame(animationFrame);
  if (!typingElement) return;
  typingElement.classList.remove('playing');
  typingElement.querySelector('.typed').textContent = '';
  typingElement = null;
}

function typeThenReveal(element, text, typeTime, holdTime) {
  if (reducedMotion.matches) return;
  typingElement = element;
  const typed = element.querySelector('.typed');
  const started = performance.now();
  element.classList.add('playing');

  function tick(now) {
    const elapsed = now - started;
    if (elapsed >= typeTime + holdTime || reducedMotion.matches) {
      stopTyping();
      return;
    }
    const slice = text.slice(0, Math.floor(Math.max(0, elapsed) / typeTime * text.length));
    if (typed.textContent !== slice) typed.textContent = slice;
    animationFrame = requestAnimationFrame(tick);
  }

  animationFrame = requestAnimationFrame(tick);
}

portfolio.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  const { section: nextSection, role: nextRole, color: nextTheme } = button.dataset;
  if (nextSection && nextSection !== section) {
    section = nextSection;
    writeLocation();
    render();
    typeThenReveal(path, `cd ~/portfolio/${section}`, 250, 100);
  } else if (nextRole && nextRole !== role) {
    role = nextRole;
    section = roles[role].start;
    writeLocation();
    render();
    const query = role === 'general'
      ? 'SELECT * FROM portfolio;'
      : `SELECT * FROM portfolio WHERE focus = '${role === 'teaching' ? 'education' : role}';`;
    typeThenReveal(heading, query, 480, 155);
  } else if (nextTheme && nextTheme !== theme) {
    theme = nextTheme;
    writeLocation(true);
    render();
  }
});

addEventListener('popstate', () => {
  readLocation();
  render();
});

readLocation();
render();
