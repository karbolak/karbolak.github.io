const profileName = 'Kajetan Karbowski';
const github = 'https://github.com/karbolak';
const sectionNames = {
  home: 'Home',
  projects: 'Projects',
  experience: 'Experience',
  education: 'Education',
  skills: 'Skills',
  contact: 'Contact',
};

const roles = {
  general: {
    label: 'General',
    heading: 'General',
    focus: 'all',
    intro: 'I’m an MSc Artificial Intelligence student at the University of Groningen, interested in AI research, software engineering, and education.',
    start: 'home',
  },
  research: {
    label: 'AI / Research',
    heading: 'AI & Research',
    focus: 'ai',
    intro: 'I study Artificial Intelligence at the University of Groningen. My interests include machine learning, algorithmic fairness, and multi-agent systems.',
    start: 'projects',
  },
  engineering: {
    label: 'Software Engineering',
    heading: 'Software Engineering',
    focus: 'engineering',
    intro: 'My background combines programming and applied AI. My work includes Python tools for machine learning experiments, such as DiffGate.',
    start: 'projects',
  },
  teaching: {
    label: 'Teaching / Education',
    heading: 'Teaching & Education',
    focus: 'education',
    intro: 'I’ve tutored students in mathematics, physics, and programming and worked as an educational camp instructor.',
    start: 'experience',
  },
};

const entries = {
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

const projects = [
  {
    id: 'psag', title: 'PSAG Platform', meta: 'Layout example', tags: ['Sample project', 'Metadata placeholder'],
    description: 'A sample project preview showing where an overview, screenshot, and technical notes would appear.',
  },
  {
    id: 'diffgate', title: 'DiffGate', meta: 'Bachelor’s thesis · Python', tags: ['Python', 'Machine learning'],
    description: 'A research prototype that uses early denoising signals to assess image quality while a diffusion model is still generating.',
    role: 'engineering', repository: 'DiffGate',
  },
  {
    id: 'forescan', title: 'FORESCAN', meta: 'Machine learning research', tags: ['Machine learning'],
    description: 'Explores whether changes in pupil size can predict cognitive overload early enough to trigger an alert.',
    role: 'research', repository: 'FORESCAN',
  },
  {
    id: 'pana', title: 'PANA', meta: 'Student support · Chatbot project', tags: ['Student support'],
    description: 'A Polish-language chatbot project for students navigating admissions, academic life, and everyday questions in the Netherlands.',
    role: 'teaching', repository: 'PANA',
  },
];

const technologies = { python: 'Python', 'machine-learning': 'Machine learning', 'student-support': 'Student support' };
const pageIntros = {
  projects: 'Selected work across research, software, and education.',
  experience: 'Tutoring and education experience.',
  education: 'Academic background and honours studies.',
  skills: 'Areas of experience across research, software, and teaching.',
  contact: 'Find me on GitHub or see the contact and CV placements below.',
};
const exampleEmail = 'hello@example.com';
const portfolio = document.querySelector('.portfolio');
const main = document.querySelector('#main');
const hero = main.querySelector('.hero');
const heading = hero.querySelector('h1');
const commandBar = document.querySelector('#command-bar');
const search = document.querySelector('#command-input');
const promptPath = document.querySelector('#prompt-path');
const feedback = document.querySelector('#command-feedback');
const panel = document.querySelector('#search-panel');
const results = document.querySelector('#command-results');
const preview = document.querySelector('#search-preview');
const help = document.querySelector('#command-help');
const outline = document.querySelector('#outline');
const outlineToggle = document.querySelector('#outline-toggle');
const status = document.querySelector('#status');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const narrowLayout = matchMedia('(max-width: 760px)');
let animationFrame;
let statusTimer;
let statusText;
let matches = [];
let selection = 0;

function readLocation() {
  const params = new URLSearchParams(location.search);
  const role = Object.hasOwn(roles, params.get('role')) ? params.get('role') : 'general';
  const id = projects.find(project => project.id === params.get('project'))?.id ?? '';
  const page = Object.hasOwn(sectionNames, params.get('section')) ? params.get('section') : id ? 'projects' : roles[role].start;
  return {
    page, role,
    project: page === 'projects' ? id : '',
    filter: Object.hasOwn(technologies, params.get('filter')) ? params.get('filter') : '',
    theme: params.get('theme') === 'dark' ? 'dark' : 'light',
  };
}
let state = readLocation();

function urlFor(next, anchor = '') {
  const params = new URLSearchParams();
  if (next.role !== 'general') params.set('role', next.role);
  if (next.page !== roles[next.role].start) params.set('section', next.page);
  if (next.project) params.set('project', next.project);
  if (next.page === 'projects' && next.filter) params.set('filter', next.filter);
  if (next.theme === 'dark') params.set('theme', next.theme);
  return `${params.size ? `?${params}` : location.pathname}${anchor ? `#${anchor}` : ''}`;
}

function go(next, { replace = false, anchor = '' } = {}) {
  const url = urlFor(next, anchor);
  if (new URL(url, location.href).href !== location.href) {
    if (replace) history.replaceState(null, '', url);
    else history.pushState(null, '', url);
  }
  state = next;
  render();
}

function projectLink(project, label = project.title, className = '') {
  const url = urlFor({ ...state, page: 'projects', project: project.id });
  const presentation = className ? ` class="${className}" aria-label="View ${project.title}"` : '';
  return `<a href="${url}" data-project="${project.id}"${presentation}>${label}</a>`;
}

function slug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function tags(project, interactive = false) {
  return `<ul class="tags" aria-label="Project tags">${project.tags.map(tag => {
    const id = slug(tag);
    const filter = interactive && Object.hasOwn(technologies, id);
    return `<li>${filter ? `<button type="button" data-filter="${id}" aria-label="Filter by ${tag}" aria-pressed="${state.filter === id}">${tag}</button>` : `<span>${tag}</span>`}</li>`;
  }).join('')}</ul>`;
}

function ordered(items, roleOf) {
  return [...items].sort((a, b) => Number(roleOf(b) === state.role) - Number(roleOf(a) === state.role));
}

function homeContent() {
  const featured = projects[0];
  const highlights = ordered(projects.slice(1), project => project.role).slice(0, 2);
  return `<section class="home-section" aria-labelledby="featured">
    <h2 id="featured" data-outline>Featured project</h2>
    <div class="featured">
      ${projectLink(featured, '<span>Screenshot placeholder</span>', 'media-placeholder feature-image')}
      <div class="feature-copy">
        <p class="meta">${featured.meta}</p>
        <h3>${featured.title}</h3>
        <p>${featured.description}</p>
        ${tags(featured)}
        ${projectLink(featured, 'View project', 'text-action')}
      </div>
    </div>
  </section>
  <section class="home-section" aria-labelledby="highlights">
    <h2 id="highlights" data-outline>More projects</h2>
    <ul class="highlights">${highlights.map(project => `<li>
      <h3>${projectLink(project)}</h3><p class="meta">${project.meta}</p>
    </li>`).join('')}</ul>
  </section>`;
}

function projectIndex(items) {
  if (!items.length) return '<p class="empty">No projects match this filter.</p>';
  return `<ul class="project-list">${items.map(project => `<li>
    <div class="project-copy">
      <p class="meta">${project.meta}</p>
      <h2>${projectLink(project)}</h2>
      <p>${project.description}</p>
      ${tags(project, true)}
    </div>
    ${projectLink(project, 'View project', 'text-action')}
  </li>`).join('')}</ul>`;
}

function projectDetail(project) {
  return `<div class="project-detail">
    <nav class="document-index" aria-label="Project sections"></nav>
    <div class="media-placeholder detail-image"><span>Screenshot placeholder</span></div>
    <div class="detail-body">
      <section aria-labelledby="overview">
        <h2 id="overview" data-outline>Overview</h2>
        <p>${project.description}</p>
        ${tags(project)}
      </section>
      <section aria-labelledby="materials">
        <h2 id="materials" data-outline>Supporting materials</h2>
        ${project.repository ? `<a href="${github}/${project.repository}">View repository on GitHub</a>` : '<p>Project links and materials placeholder.</p>'}
      </section>
      <details id="technical" data-outline="Technical details"><summary>Technical details</summary>
        <p>Implementation notes placeholder.</p>
      </details>
    </div>
  </div>`;
}

function contactContent() {
  return `<div class="contact-grid">
    <section aria-labelledby="email-heading">
      <h2 id="email-heading" data-outline>Email</h2>
      <p class="meta">Example address</p>
      <p><code id="email-address">${exampleEmail}</code></p>
      <div class="contact-actions">
        <a class="button" href="mailto:${exampleEmail}">Open example draft</a>
        <button type="button" id="copy-email">Copy example email</button>
      </div>
    </section>
    <section aria-labelledby="links-heading">
      <h2 id="links-heading" data-outline>Profiles</h2>
      <p><a href="${github}">GitHub</a></p>
      <p class="meta">LinkedIn link pending</p>
    </section>
    <section id="cv" tabindex="-1" aria-labelledby="cv-heading">
      <h2 id="cv-heading" data-outline>CV</h2>
      <p>CV download pending.</p>
    </section>
  </div>`;
}

function entryList(items) {
  return `<ul class="entries">${items.map(([title, meta, description]) => `<li>
    <p class="meta">${meta}</p><h2 id="${slug(title)}" data-outline>${title}</h2>${description ? `<p>${description}</p>` : ''}
  </li>`).join('')}</ul>`;
}

function render() {
  stopTyping();
  clearTimeout(statusTimer);
  const { page, role, project, filter, theme } = state;
  const view = roles[role];
  const detail = projects.find(item => item.id === project);
  const home = page === 'home';
  const listing = page === 'projects' && !detail;
  const breadcrumb = currentPath();
  const visibleProjects = listing ? ordered(projects, item => item.role)
    .filter(item => !filter || item.tags.includes(technologies[filter])) : [];
  const matches = `${visibleProjects.length} ${visibleProjects.length === 1 ? 'match' : 'matches'}`;

  portfolio.dataset.theme = theme;
  document.querySelector('#filters').hidden = !listing || !filter;
  if (filter) {
    const clear = document.querySelector('#clear-filter');
    clear.textContent = `${technologies[filter]} ×`;
    clear.setAttribute('aria-label', `Clear ${technologies[filter]} filter`);
    document.querySelector('#filter-count').textContent = matches;
  }
  for (const button of main.querySelectorAll('[data-perspective]')) {
    button.setAttribute('aria-pressed', button.dataset.perspective === role);
  }
  for (const button of portfolio.querySelectorAll('[data-color]')) {
    button.setAttribute('aria-pressed', button.dataset.color === theme);
  }
  hero.toggleAttribute('data-home', home);
  document.querySelector('#portrait').hidden = !home;
  main.querySelector('.hero-actions').hidden = !home;
  const title = home ? profileName : detail?.title ?? sectionNames[page];
  heading.textContent = title;
  hero.querySelector('.intro').textContent = home ? view.intro : detail?.meta ?? pageIntros[page];
  document.querySelector('#back-to-projects').hidden = !detail;

  const content = document.querySelector('#section-content');
  const detailsOpen = detail && content.dataset.project === detail.id && content.querySelector('details')?.open;
  if (home) content.innerHTML = homeContent();
  else if (detail) content.innerHTML = projectDetail(detail);
  else if (listing) content.innerHTML = projectIndex(visibleProjects);
  else if (page === 'contact') content.innerHTML = contactContent();
  else content.innerHTML = entryList(ordered(entries[page], item => item[3]));
  content.dataset.project = detail?.id ?? '';
  if (detailsOpen) content.querySelector('details').open = true;

  renderLinks();
  renderOutline(detail, listing ? visibleProjects : null);
  document.querySelector('#status-path').textContent = breadcrumb;
  statusText = listing ? `${matches}${filter ? ` · tag: ${technologies[filter]}` : ''}` : role === 'general' ? 'Ready' : `View: ${view.heading}`;
  status.textContent = statusText;
  document.title = home ? profileName : `${title} · ${profileName}`;
}

function renderLinks() {
  for (const link of portfolio.querySelectorAll('a[data-page]')) {
    const page = link.dataset.page;
    link.href = urlFor({ ...state, page, project: '' }, link.dataset.anchor);
    if (link.closest('nav')) {
      if (page === state.page) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
  }
}

function currentPath() {
  if (state.project) return `~/portfolio/projects/${state.project}.md`;
  return state.page === 'home' ? '~/portfolio' : `~/portfolio/${state.page}`;
}

function stopTyping() {
  cancelAnimationFrame(animationFrame);
  feedback.hidden = true;
  feedback.removeAttribute('data-typing');
  feedback.textContent = '';
  promptPath.textContent = currentPath();
}

function typeCommand(text, oldPath = currentPath(), duration = 350, resolved = '') {
  if (reducedMotion.matches || search.value || document.activeElement === search) return;
  promptPath.textContent = oldPath;
  feedback.hidden = false;
  feedback.setAttribute('data-typing', '');
  const started = performance.now();
  const typingTime = duration * .72;

  function tick(now) {
    const elapsed = now - started;
    if (elapsed >= duration + (resolved ? 420 : 0) || reducedMotion.matches) {
      stopTyping();
      return;
    }
    if (elapsed >= duration) {
      feedback.removeAttribute('data-typing');
      feedback.textContent = resolved;
    } else {
      const length = Math.floor(Math.max(0, elapsed) / typingTime * text.length);
      const typed = text.slice(0, length);
      if (feedback.textContent !== typed) feedback.textContent = typed;
    }
    animationFrame = requestAnimationFrame(tick);
  }
  animationFrame = requestAnimationFrame(tick);
}

function notify(message) {
  status.textContent = message;
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => { status.textContent = statusText; }, 3000);
}

function renderOutline(detail, listing) {
  const sections = [...main.querySelectorAll('[data-outline]')].map(part =>
    `<a href="#${part.id}" data-jump="${part.id}">${part.dataset.outline || part.textContent}</a>`);
  const links = listing ? listing.map(project => projectLink(project, `${project.id}.md`)) : sections;
  document.querySelector('#outline-path').textContent = detail ? `${detail.id}/` : `${state.page}/`;
  document.querySelector('#outline-links').innerHTML = links.map(link => `<li>${link}</li>`).join('');
  outlineToggle.hidden = !links.length;
  if (!links.length) setOutline(false);
  const documentIndex = main.querySelector('.document-index');
  if (documentIndex) documentIndex.innerHTML = sections.join('');
}

function setOutline(open) {
  outline.hidden = !open;
  outlineToggle.setAttribute('aria-expanded', open);
}

function focusDestination(anchor = '') {
  if (document.activeElement === search) return;
  if (anchor) {
    const destination = document.getElementById(anchor);
    if (!destination) return;
    if (destination instanceof HTMLDetailsElement) destination.open = true;
    destination.tabIndex = -1;
    destination.focus({ preventScroll: true });
    destination.scrollIntoView({ block: 'nearest' });
  } else {
    heading.focus({ preventScroll: true });
    scrollTo(0, 0);
  }
}

function navigate(page, project = '', anchor = '') {
  const oldPath = currentPath();
  const changed = page !== state.page || project !== state.project;
  if (!changed && !anchor) return;
  go({ ...state, page, project }, { anchor });
  focusDestination(anchor);
  if (changed) typeCommand(project ? `open ${project}.md` : `cd ${page}`, oldPath);
}

function changePerspective(role) {
  if (role === state.role) return;
  go({ ...state, role }, { anchor: location.hash.slice(1) });
  const table = state.page === 'home' ? 'portfolio' : state.page;
  const query = role === 'general' ? `SELECT * FROM ${table};` : `SELECT * FROM ${table} WHERE focus = '${roles[role].focus}';`;
  typeCommand(query, currentPath(), 650, roles[role].heading);
  notify(`View: ${roles[role].heading}`);
}

function changeFilter(filter) {
  if (state.page === 'projects' && !state.project && filter === state.filter) return;
  go({ ...state, page: 'projects', project: '', filter });
  focusDestination();
  typeCommand(filter ? `filter --tag ${filter}` : 'filter --clear');
  if (!filter) notify('Filter cleared');
}

const searchItems = [
  ...Object.entries(sectionNames).map(([id, label]) => ({
    type: 'Page', id, label, path: `~/portfolio/${id}`, description: pageIntros[id] || roles.general.intro,
  })),
  ...projects.map(project => ({
    type: 'Project', id: project.id, label: project.title, path: `~/portfolio/projects/${project.id}.md`,
    description: project.description, meta: project.meta, tags: project.tags,
  })),
  ...Object.entries(roles).map(([id, view]) => ({
    type: 'Perspective', id, label: view.label, path: `view ${view.focus}`, description: view.intro,
  })),
  ...Object.entries(technologies).map(([id, label]) => ({
    type: 'Tag', id, label, path: `filter --tag ${id}`, description: `Show projects tagged ${label}.`,
  })),
  ...entries.skills.map(([label, meta, description]) => ({
    type: 'Skill', id: slug(label), label, meta, description, path: `~/portfolio/skills#${slug(label)}`,
  })),
  { type: 'Help', id: 'help', label: 'Command help', path: 'help', description: 'Show the available commands and keyboard shortcuts.' },
];

function fuzzyScore(term, text) {
  if (text === term) return 0;
  const start = text.indexOf(term);
  if (start >= 0) return 1 + Math.min(start, 16);
  let end = -1;
  let first = -1;
  for (const character of term) {
    end = text.indexOf(character, end + 1);
    if (end < 0) return Infinity;
    if (first < 0) first = end;
  }
  const span = end - first + 1;
  return span <= term.length * 2 + 2 ? 18 + span - term.length + Math.min(first, 16) : Infinity;
}

function explicitCommand(value) {
  if (value === 'help') return searchItems.at(-1);
  const [verb, id, tag, extra] = value.split(/\s+/);
  const aliases = { ai: 'research', software: 'engineering', education: 'teaching', general: 'general' };
  if (verb === 'cd' && id && !tag) return searchItems.find(item => item.type === 'Page' && item.id === id);
  if (verb === 'open' && id && !tag) return searchItems.find(item => item.type === 'Project' && item.id === id.replace(/^(projects\/)|\.md$/g, ''));
  if (verb === 'view' && id && !tag) return searchItems.find(item => item.type === 'Perspective' && item.id === aliases[id]);
  if (verb === 'filter' && id === '--tag' && !extra) return searchItems.find(item => item.type === 'Tag' && item.id === tag);
  if (value === 'filter --clear') return { type: 'Tag', id: '', label: 'Clear project filter', path: value, description: 'Show all projects.' };
}

function renderSearch() {
  const query = search.value.toLowerCase().trim();
  const command = explicitCommand(query);
  const terms = query.split(/\s+/);
  const verbs = { Page: 'cd', Project: 'open', Perspective: 'view', Tag: 'filter' };
  matches = command ? [command] : query ? searchItems.map(item => {
    const label = item.label.toLowerCase();
    const keywords = [verbs[item.type], item.type, item.path, item.meta, ...(item.tags ?? [])].join(' ').toLowerCase();
    const summary = item.description?.toLowerCase() ?? '';
    const score = terms.reduce((sum, term) => sum + Math.min(
      fuzzyScore(term, label), 20 + fuzzyScore(term, keywords), summary.includes(term) ? 50 : Infinity,
    ), 0);
    return { item, score };
  }).filter(result => Number.isFinite(result.score)).sort((a, b) => a.score - b.score).map(result => result.item) : searchItems;

  help.hidden = true;
  document.querySelector('#search-results').hidden = false;
  results.innerHTML = matches.map((item, index) =>
    `<li id="match-${index}" role="option" aria-selected="false" data-match="${index}"><span>${item.label}</span><small>${item.type}</small></li>`).join('');
  document.querySelector('#search-empty').hidden = !!matches.length;
  document.querySelector('#search-count').textContent = `${matches.length} ${matches.length === 1 ? 'match' : 'matches'}`;
  results.scrollTop = 0;
  selectMatch(0);
}

function selectMatch(index, scroll = false) {
  selection = index;
  const item = matches[index];
  for (const option of results.children) option.setAttribute('aria-selected', Number(option.dataset.match) === index);
  preview.hidden = !item;
  if (!item) {
    search.removeAttribute('aria-activedescendant');
    return;
  }
  const option = results.children[index];
  search.setAttribute('aria-activedescendant', option.id);
  if (scroll) option.scrollIntoView({ block: 'nearest' });
  preview.innerHTML = `<p class="search-caption">Preview</p>
    <p class="preview-type">${item.type}</p><h2>${item.label}</h2><code>${item.path}</code>
    ${item.description ? `<p>${item.description}</p>` : ''}
    ${item.meta ? `<p class="meta">${item.meta}</p>` : ''}
    ${item.tags?.length ? `<p class="meta">${item.tags.join(' · ')}</p>` : ''}`;
}

function openSearch() {
  stopTyping();
  if (!panel.hidden) return;
  panel.hidden = false;
  search.setAttribute('aria-expanded', 'true');
  renderSearch();
}

function closeSearch() {
  panel.hidden = true;
  search.setAttribute('aria-expanded', 'false');
  search.removeAttribute('aria-activedescendant');
}

function runMatch(item) {
  if (!item) return;
  if (item.type === 'Help') {
    help.hidden = false;
    document.querySelector('#search-results').hidden = true;
    preview.hidden = true;
    search.removeAttribute('aria-activedescendant');
    document.querySelector('#search-count').textContent = 'Command help';
    return;
  }
  search.value = '';
  closeSearch();
  search.blur();
  if (item.type === 'Project') navigate('projects', item.id);
  else if (item.type === 'Page') navigate(item.id);
  else if (item.type === 'Perspective') {
    changePerspective(item.id);
    main.querySelector(`[data-perspective="${item.id}"]`).focus({ preventScroll: true });
  } else if (item.type === 'Tag') changeFilter(item.id);
  else navigate('skills', '', item.id);
}

outlineToggle.addEventListener('click', () => setOutline(outline.hidden));
search.addEventListener('focus', openSearch);
search.addEventListener('click', openSearch);
search.addEventListener('input', () => {
  if (panel.hidden) openSearch();
  else renderSearch();
});
document.querySelector('#command-form').addEventListener('submit', event => {
  event.preventDefault();
  if (panel.hidden) openSearch();
  else runMatch(matches[selection]);
});
search.addEventListener('keydown', event => {
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
  event.preventDefault();
  if (panel.hidden) {
    openSearch();
    return;
  }
  if (help.hidden && matches.length) selectMatch((selection + (event.key === 'ArrowDown' ? 1 : -1) + matches.length) % matches.length, true);
});
results.addEventListener('mousedown', event => {
  if (event.target.closest('[data-match]')) event.preventDefault();
});
results.addEventListener('pointermove', event => {
  const option = event.target.closest('[data-match]');
  if (option && event.pointerType === 'mouse' && Number(option.dataset.match) !== selection) selectMatch(Number(option.dataset.match));
});
results.addEventListener('click', event => {
  const option = event.target.closest('[data-match]');
  if (option) runMatch(matches[Number(option.dataset.match)]);
});
commandBar.addEventListener('focusout', event => {
  if (event.relatedTarget && !commandBar.contains(event.relatedTarget)) closeSearch();
});
document.addEventListener('pointerdown', event => {
  if (!commandBar.contains(event.target) && !panel.hidden) closeSearch();
});
document.addEventListener('keydown', event => {
  const key = event.key.toLowerCase();
  if ((event.ctrlKey || event.metaKey) && !event.altKey && key === 'k') {
    event.preventDefault();
    search.focus();
    openSearch();
  } else if (key === 'escape' && !panel.hidden) {
    event.preventDefault();
    closeSearch();
  } else if (key === 'escape' && !outline.hidden) {
    if (outline.contains(document.activeElement)) outlineToggle.focus();
    setOutline(false);
  } else if (key === 'e' && !event.repeat && !event.ctrlKey && !event.altKey && !event.metaKey &&
      !outlineToggle.hidden && !event.target.closest('input, textarea, select, [contenteditable]')) {
    setOutline(outline.hidden);
  }
});

portfolio.addEventListener('click', async event => {
  const themeButton = event.target.closest('[data-color]');
  if (themeButton && themeButton.dataset.color !== state.theme) {
    go({ ...state, theme: themeButton.dataset.color }, { replace: true, anchor: location.hash.slice(1) });
    notify(`Theme: ${state.theme}`);
    return;
  }
  const perspectiveButton = event.target.closest('[data-perspective]');
  if (perspectiveButton) {
    changePerspective(perspectiveButton.dataset.perspective);
    return;
  }
  const tag = event.target.closest('[data-filter]');
  if (tag || event.target.closest('#clear-filter')) {
    changeFilter(tag?.dataset.filter ?? '');
    return;
  }
  if (event.target.closest('#copy-email')) {
    try {
      await navigator.clipboard.writeText(exampleEmail);
      notify('Example email copied');
    } catch {
      const address = document.querySelector('#email-address');
      const selection = window.getSelection();
      if (address && selection) selection.selectAllChildren(address);
      notify(address && selection ? 'Clipboard unavailable. Copy the selected address.' : 'Clipboard unavailable.');
    }
    return;
  }
  const link = event.target.closest('a[data-page], a[data-project], a[data-jump]');
  if (!link || event.defaultPrevented || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  const { page, project, jump, anchor } = link.dataset;
  if (link.closest('#outline') && narrowLayout.matches) setOutline(false);
  if (jump) {
    if (location.hash !== `#${jump}`) history.pushState(null, '', urlFor(state, jump));
    focusDestination(jump);
  } else navigate(project ? 'projects' : page, project, anchor);
});

addEventListener('popstate', () => {
  state = readLocation();
  render();
  if (location.hash) focusDestination(location.hash.slice(1));
});

render();
if (location.hash) focusDestination(location.hash.slice(1));
