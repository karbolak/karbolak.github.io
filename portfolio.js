const { profile, education, experience } = portfolioContent;
const profileName = profile.name;
const github = profile.github;
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
    intro: profile.description,
  },
  research: {
    label: 'AI / Research',
    heading: 'AI & Research',
    focus: 'ai',
    intro: 'I study Artificial Intelligence at the University of Groningen. My research projects span generative AI, computer vision, and time-series forecasting.',
  },
  engineering: {
    label: 'Software Engineering',
    heading: 'Software Engineering',
    focus: 'engineering',
    intro: 'My background combines programming and applied AI. My work includes Python tools for machine learning experiments, such as DiffGate.',
  },
  teaching: {
    label: 'Teaching / Education',
    heading: 'Teaching & Education',
    focus: 'education',
    intro: 'I’ve tutored students in mathematics, physics, and programming and worked as an educational camp instructor.',
  },
};

const entries = {
  experience: experience.map(item => [item.title, item.organization, item.details, item.tags, item]),
  education: education.map(item => [item.title, item.institution, item.details, item.tags, item]),
  skills: [
    ...portfolioContent.skills.map(({ category, items, tags }) => [category, '', items.join(' · '), tags]),
    ['Languages', '', profile.languages.map(({ language, level }) => `${language} (${level})`).join(' · ')],
  ],
};

const draftTags = {
  python: 'Python', 'machine-learning': 'Machine learning', 'generative-ai': 'Generative AI', timeseries: 'Time-series',
  'computer-vision': 'Computer vision', llm: 'LLM', automation: 'Automation', 'student-support': 'Student support',
};
const projects = portfolioContent.projects.map(project => ({
  ...project,
  meta: project.kind,
  description: project.summary,
  role: project.tags,
  tags: [
    ...project.tags.filter(tag => Object.hasOwn(draftTags, tag)).map(tag => draftTags[tag]),
    ...(project.tags.includes('research') || project.id === 'autoop' ? [draftTags['machine-learning']] : []),
  ],
}));
const technologies = Object.fromEntries(Object.values(draftTags).map(label => [slug(label), label]));
const perspectiveTags = {
  research: ['research'],
  engineering: ['software'],
  teaching: ['education'],
};
const pageIntros = {
  projects: 'Selected work across research, software, and education.',
  experience: 'Student-organization leadership, education, and tutoring.',
  education: 'Academic background and honours studies.',
  skills: 'Areas of experience across research, software, and teaching.',
  contact: 'Professional profiles and contact information.',
};
const contact = { email: 'kajetan.karbowski@gmail.com', linkedin: 'https://www.linkedin.com/in/kajetan-karbowski/', cvs: [] };
const portfolio = document.querySelector('.portfolio');
const main = document.querySelector('#main');
const portraitOptions = document.querySelector('#portrait-options');
const returnLinks = main.querySelector('.return-links');
const cvPreview = document.querySelector('#cv-preview');
const nativePopover = typeof cvPreview.showPopover === 'function';
if (nativePopover) cvPreview.hidden = false;
else cvPreview.removeAttribute('popover');
const cvGlance = document.querySelector('#cv-glance');
const photoOptions = ['colour', 'bw', 'site', 'halftone'];
const hero = main.querySelector('.hero');
const heading = hero.querySelector('h1');
const profileVisual = hero.querySelector('.profile-visual');
const commandBar = document.querySelector('#command-bar');
const search = document.querySelector('#command-input');
const searchToggle = document.querySelector('#search-toggle');
const promptPath = document.querySelector('#prompt-path');
const feedback = document.querySelector('#command-feedback');
const panel = document.querySelector('#search-panel');
const results = document.querySelector('#command-results');
const preview = document.querySelector('#search-preview');
const help = document.querySelector('#command-help');
const helpToggle = document.querySelector('#help-toggle');
const outline = document.querySelector('#outline');
const outlineToggle = document.querySelector('#outline-toggle');
const perspectiveMenu = document.querySelector('#perspective-menu');
const profileDegree = document.querySelector('.dossier-degree');
profileDegree.firstChild.nodeValue = profile.role;
profileDegree.querySelector('span').textContent = profile.affiliation;
const status = document.querySelector('#status');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const narrowLayout = matchMedia('(max-width: 760px)');
const compactCommandBar = matchMedia('(max-width: 520px)');
let displayedPath = '~';
let animationFrame;
let statusTimer;
let statusText;
let matches = [];
let selection = 0;
let cvPreviewTrigger;

function readLocation() {
  const params = new URLSearchParams(location.search);
  const role = Object.hasOwn(roles, params.get('role')) ? params.get('role') : 'general';
  const id = projects.find(project => project.id === (params.get('project') === 'psag-platform' ? 'psag' : params.get('project')))?.id ?? '';
  const page = Object.hasOwn(sectionNames, params.get('section')) ? params.get('section') : id ? 'projects' : 'home';
  return {
    page, role,
    project: page === 'projects' ? id : '',
    filter: Object.hasOwn(technologies, params.get('filter')) ? params.get('filter') : '',
    theme: params.get('theme') === 'dark' ? 'dark' : 'light',
    photo: photoOptions.includes(params.get('photo')) ? params.get('photo') : 'colour',
  };
}
let state = readLocation();

const initialUrl = new URL(location.href);
for (const option of ['design', 'type', 'evidence']) initialUrl.searchParams.delete(option);
if (initialUrl.href !== location.href) history.replaceState(null, '', initialUrl);

function urlFor(next, anchor = '', path = location.pathname) {
  const params = new URLSearchParams();
  if (next.photo !== 'colour') params.set('photo', next.photo);
  if (next.role !== 'general') params.set('role', next.role);
  if (next.page !== 'home') params.set('section', next.page);
  if (next.project) params.set('project', next.project);
  if (next.page === 'projects' && next.filter) params.set('filter', next.filter);
  if (next.theme === 'dark') params.set('theme', next.theme);
  return `${path}${params.size ? `?${params}` : ''}${anchor ? `#${anchor}` : ''}`;
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

function externalLink(url, label, id = '') {
  const destination = url.startsWith('mailto:') ? 'opens email app' : 'external website';
  return `<a ${id ? `id="${id}" ` : ''}class="external-link" href="${url}" aria-label="${label} (${destination})">${label}<span aria-hidden="true"> ↗</span></a>`;
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
  return [...items].sort((a, b) => Number(relevantToView(roleOf(b))) - Number(relevantToView(roleOf(a))));
}

function relevantToView(tags) {
  if (!Array.isArray(tags)) return tags === state.role;
  return (perspectiveTags[state.role] ?? []).some(tag => tags.includes(tag));
}

function chronological(items) {
  function latest(item) {
    const date = item.end || item.date || item.start;
    return date && (item.ongoing || item.date_label?.endsWith('Present')) ? '9999' : date || '';
  }
  return [...items].sort((first, second) =>
    Number(Boolean(second.pinned)) - Number(Boolean(first.pinned)) || latest(second).localeCompare(latest(first)));
}

function listingDate({ date, start, end, ongoing, date_label }) {
  if (date_label) return `<p class="listing-date">${date_label}</p>`;
  const first = start || date || end;
  if (!first) return '';
  const last = ongoing ? 'Present' : end && end !== first ? `<time datetime="${end}">${end}</time>` : '';
  return `<p class="listing-date"><time datetime="${first}">${first}</time>${last ? `–${last}` : ''}</p>`;
}

function perspectiveGroups(items) {
  if (state.role === 'general') return { primary: items, other: [] };
  const primary = [];
  const other = [];
  for (const item of items) {
    (item.pinned || relevantToView(item.role) ? primary : other).push(item);
  }
  return { primary, other };
}

function renderPerspectiveList({ primary, other }, label, renderList) {
  if (!other.length) return renderList(primary);
  return `${primary.length ? renderList(primary) : ''}
    <details class="other-entries" id="other-entries" data-outline="Other ${label}">
      <summary>Other ${label} (${other.length})</summary>
      ${renderList(other)}
    </details>`;
}

function cvPreviewButton(key, label) {
  return `<button type="button" class="cv-preview-trigger" data-cv-preview="${key}" aria-label="Preview ${label}" popovertarget="cv-preview" aria-expanded="false">${label}</button>`;
}

function isCvPreviewOpen() {
  return nativePopover ? cvPreview.matches(':popover-open') : !cvPreview.hidden;
}

function closeCvPreview() {
  if (!isCvPreviewOpen()) return;
  if (nativePopover) cvPreview.hidePopover();
  else cvPreview.hidden = true;
  cvPreviewTrigger.setAttribute('aria-expanded', 'false');
}

function showCvPreview(trigger) {
  if (isCvPreviewOpen()) {
    closeCvPreview();
    if (trigger === cvPreviewTrigger) return;
  }
  const [kind, id] = trigger.dataset.cvPreview.split(':');
  const source = { project: projects, education, experience }[kind];
  const item = source.find(entry => entry.id === id);
  const title = item.shortTitle ?? item.title;
  const link = kind === 'project' ? projectLink(item, 'Open project')
    : `<a href="${urlFor({ ...state, page: kind, project: '' }, id)}" data-page="${kind}" data-anchor="${id}">Open ${kind === 'education' ? 'education' : 'experience'} entry</a>`;
  const text = item.details ?? item.summary;
  cvPreview.innerHTML = `<h3 id="cv-preview-title">${title}</h3><p>${text}</p>${link}`;
  cvPreviewTrigger?.setAttribute('aria-expanded', 'false');
  cvPreviewTrigger = trigger;
  trigger.setAttribute('aria-expanded', 'true');
  if (nativePopover) cvPreview.showPopover({ source: trigger });
  else cvPreview.hidden = false;
  const anchor = trigger.getBoundingClientRect();
  const { clientWidth, clientHeight } = document.documentElement;
  const { offsetWidth, offsetHeight } = cvPreview;
  const left = Math.max(8, Math.min(anchor.left, clientWidth - offsetWidth - 8));
  const top = anchor.bottom + offsetHeight + 8 <= clientHeight
    ? anchor.bottom + 4 : Math.max(8, anchor.top - offsetHeight - 4);
  cvPreview.style.inset = `${top}px auto auto ${left}px`;
  cvPreview.querySelector('a').focus({ preventScroll: true });
}

cvPreview.addEventListener('toggle', () => {
  if (!isCvPreviewOpen()) cvPreviewTrigger?.setAttribute('aria-expanded', 'false');
});

for (const term of cvGlance.querySelectorAll('[data-cv-source]')) {
  term.innerHTML = cvPreviewButton(term.dataset.cvSource, term.textContent);
}

function cvHome() {
  const timeline = chronological(projects);
  const priority = ordered(timeline, item => item.role);
  const shortlist = [...timeline.filter(item => item.pinned || item.featured),
    ...priority.filter(item => !item.pinned && !item.featured)].slice(0, 3);
  const work = timeline.filter(item => shortlist.includes(item));
  const experienceIds = {
    engineering: ['psag-president'],
    teaching: ['tdj-camp', 'private-tutoring'],
  }[state.role] ?? ['psag-president', 'tdj-camp'];
  const history = chronological(experience.filter(item => experienceIds.includes(item.id)));

  return `<section id="cv-work" class="cv-section" aria-labelledby="cv-work-title" data-outline="Selected work">
    <header class="cv-section-heading">
      <h2 id="cv-work-title">Selected work</h2>
      <a href="?section=projects" data-page="projects">View all projects</a>
    </header>
    <ul class="cv-rows">${work.map(item => `<li>
      <h3>${projectLink(item, item.shortTitle ?? item.title)}</h3>
      <p>${item.abstract ?? item.summary}</p>
      <div class="cv-row-meta"><span>${item.kind}</span>${listingDate(item)}</div>
    </li>`).join('')}</ul>
  </section>
  <section id="cv-experience" class="cv-section" aria-labelledby="cv-experience-title" data-outline="Selected experience">
    <header class="cv-section-heading">
      <h2 id="cv-experience-title">Selected experience</h2>
      <a href="?section=experience" data-page="experience">Full history</a>
    </header>
    <ul class="cv-rows">${history.map(item => `<li>
      <h3><a href="?section=experience#${item.id}" data-page="experience" data-anchor="${item.id}">${item.shortTitle ?? item.title}</a></h3>
      <p>${item.abstract ?? item.details}</p>
      ${listingDate(item)}
    </li>`).join('')}</ul>
  </section>
  <section id="cv-skills" class="cv-section" aria-labelledby="cv-skills-title" data-outline="Key skills">
    <header class="cv-section-heading">
      <h2 id="cv-skills-title">Key skills</h2>
      <a href="?section=skills" data-page="skills">All skills</a>
    </header>
    <ul class="tags">${portfolioContent.keySkills.map(skill => `<li><span>${skill}</span></li>`).join('')}</ul>
  </section>`;
}

function renderCvProfile(active) {
  const actions = document.querySelector('#cv-actions');
  actions.hidden = cvGlance.hidden = !active;
  heading.toggleAttribute('data-outline', active);
  if (!active) return;
  actions.innerHTML = [
    contact.email && externalLink(`mailto:${contact.email}`, 'Email'),
    github && externalLink(github, 'GitHub'),
    contact.linkedin && externalLink(contact.linkedin, 'LinkedIn'),
    '<a href="?section=contact" data-page="contact">CV details &amp; Contact</a>',
  ].filter(Boolean).join('');
  document.querySelector('#cv-preview-hint').hidden = false;
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
    <div class="listing-aside">${listingDate(project)}${projectLink(project, 'View project', 'text-action')}</div>
  </li>`).join('')}</ul>`;
}

function projectDetail(project) {
  const related = ordered(projects.filter(item => item.id !== project.id), item => item.role).slice(0, 2);
  return `<div class="project-detail">
    <nav class="document-index" aria-label="Project sections"></nav>
    ${project.id === 'psag'
      ? `<a class="project-demo-link" href="${urlFor({ ...state, page: 'home', project: '' }, '', 'psag-demo.html')}">
          <span>View demo</span><span aria-hidden="true">→</span>
        </a>`
      : ''}
    <div class="detail-body">
      <section aria-labelledby="overview">
        <h2 id="overview" data-outline>Overview</h2>
        <p>${project.description}</p>
        ${tags(project)}
      </section>
      ${project.repository ? `<section aria-labelledby="materials">
        <h2 id="materials" data-outline>Supporting materials</h2>
        ${externalLink(`${github}/${project.repository}`, 'View repository on GitHub')}
      </section>` : ''}
      ${project.details ? `<details id="technical" data-outline="Technical details"><summary>Technical details</summary>
        <p>${project.details}</p>
      </details>` : ''}
      ${related.length ? `<nav class="related-documents" aria-label="Related projects">
        <span>Related projects</span>
        ${related.map(item => projectLink(item)).join('')}
      </nav>` : ''}
    </div>
  </div>`;
}

function contactContent() {
  const { email, linkedin, cvs } = contact;
  const cvList = ordered(cvs, item => item.role);
  const preferredCv = cvList[0];
  return `<div class="contact-document">
    <section aria-labelledby="email-heading">
      <h2 id="email-heading" data-outline>Email</h2>
      <div class="contact-record contact-email">
        ${email ? `${externalLink(`mailto:${email}`, email, 'email-address')}
          <div class="email-copy">
            <button type="button" id="copy-email">Copy email</button>
            <span id="email-copy-status" role="status"></span>
          </div>`
          : '<p class="contact-pending">Email address pending</p>'}
      </div>
    </section>
    <section aria-labelledby="phone-heading">
      <h2 id="phone-heading" data-outline>Phone</h2>
      <details class="contact-phone">
        <summary>Show phone details</summary>
        <p>To limit automated scrapers, please download a CV copy to find my phone number.</p>
        ${preferredCv
          ? `<a href="${preferredCv.url}" download>Download CV copy</a>`
          : '<p class="contact-pending">The CV download is currently unavailable.</p>'}
      </details>
    </section>
    <section aria-labelledby="links-heading">
      <h2 id="links-heading" data-outline>Professional profiles</h2>
      <div class="contact-record">${externalLink(github, 'GitHub')}</div>
      <div class="contact-record">${linkedin ? externalLink(linkedin, 'LinkedIn') : '<span>LinkedIn</span><span class="contact-pending">Profile link pending</span>'}</div>
    </section>
    <section id="cv" tabindex="-1" aria-labelledby="cv-heading">
      <h2 id="cv-heading" data-outline>Curriculum vitae</h2>
      ${cvList.length ? cvList.map(({ title, url }) =>
        `<div class="contact-record"><span>${title}</span><span class="contact-links"><a href="${url}" aria-label="View ${title}">View</a> <a href="${url}" download aria-label="Download ${title}">Download</a></span></div>`).join('')
        : '<div class="contact-record"><p class="contact-pending">CV download pending</p></div>'}
    </section>
  </div>`;
}

function entryList(records) {
  return `<ul class="entries">${records.map(item => `<li>
    <div class="entry-heading"><h2 id="${item.id || slug(item.title)}" data-outline>${item.title}</h2>${listingDate(item)}</div>
    ${item.meta ? `<p class="meta">${item.meta}</p>` : ''}
    ${item.id ? `<details><summary aria-label="Details for ${item.title}">Details</summary><p>${item.description}</p></details>` : `<p>${item.description}</p>`}
  </li>`).join('')}</ul>`;
}

function render() {
  stopTyping();
  closeCvPreview();
  clearTimeout(statusTimer);
  const { page, role, project, filter, theme } = state;
  const view = roles[role];
  const detail = projects.find(item => item.id === project);
  const home = page === 'home';
  const listing = page === 'projects' && !detail;
  const breadcrumb = currentPath();
  const visibleProjects = listing ? chronological(projects)
    .filter(item => !filter || item.tags.includes(technologies[filter])) : [];
  const projectGroups = listing ? perspectiveGroups(visibleProjects) : null;
  const matches = `${visibleProjects.length} ${visibleProjects.length === 1 ? 'match' : 'matches'}`;

  portfolio.dataset.theme = theme;
  portfolio.toggleAttribute('data-cv-home', home);
  portfolio.dataset.photo = state.photo;
  portraitOptions.hidden = !home;
  portraitOptions.querySelector(`[value="${state.photo}"]`).checked = true;
  const themeToggle = document.querySelector('#theme-toggle');
  const nextTheme = theme === 'dark' ? 'light' : 'dark';
  themeToggle.hidden = false;
  themeToggle.dataset.color = nextTheme;
  themeToggle.textContent = nextTheme === 'light' ? 'Light' : 'Dark';
  themeToggle.setAttribute('aria-label', `Use ${nextTheme} theme`);
  themeToggle.setAttribute('title', `Switch to ${nextTheme} theme`);
  outlineToggle.textContent = 'Explorer';
  helpToggle.hidden = false;
  searchToggle.hidden = false;
  updateSearchPrompt();
  const documentTools = main.querySelector('.document-tools');
  documentTools.hidden = !!detail;
  if (detail) perspectiveMenu.open = false;
  main.querySelector('.dossier-profile').hidden = !home;
  document.querySelector('#active-perspective').textContent = perspectiveMenu.querySelector(`[data-perspective="${role}"]`).textContent;
  perspectiveMenu.querySelector('summary').setAttribute('aria-label', `Perspective: ${view.heading}`);
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
  hero.toggleAttribute('data-home', home);
  profileVisual.hidden = !home;
  const title = home ? profileName : detail?.title ?? sectionNames[page];
  heading.textContent = title;
  const introduction = hero.querySelector('.intro');
  introduction.hidden = page === 'contact';
  introduction.textContent = home ? view.intro : detail?.meta ?? pageIntros[page];
  if (home && role === 'general') introduction.textContent = profile.abstract;
  returnLinks.hidden = home;
  document.querySelector('#back-to-projects').hidden = !detail;
  renderCvProfile(home);

  const content = document.querySelector('#section-content');
  const detailsOpen = detail && content.dataset.project === detail.id && content.querySelector('details')?.open;
  if (home) content.innerHTML = cvHome();
  else if (detail) content.innerHTML = projectDetail(detail);
  else if (listing) content.innerHTML = renderPerspectiveList(projectGroups, 'projects', projectIndex);
  else if (page === 'contact') content.innerHTML = contactContent();
  else {
    const records = entries[page].map(([title, meta, description, role, dates]) => ({ title, meta, description, role, ...dates }));
    content.innerHTML = renderPerspectiveList(perspectiveGroups(chronological(records)), page, entryList);
  }
  content.dataset.project = detail?.id ?? '';
  if (detailsOpen) content.querySelector('details').open = true;

  renderLinks();
  renderOutline(detail, projectGroups?.primary);
  document.querySelector('#status-path').textContent = breadcrumb;
  statusText = listing ? `${matches}${filter ? ` · tag: ${technologies[filter]}` : ''}` : role === 'general' ? 'Ready' : `View: ${view.heading}`;
  status.textContent = !panel.hidden ? 'Search' : statusText;
  document.title = home ? profileName : `${title} · ${profileName}`;
}

function renderLinks() {
  for (const link of portfolio.querySelectorAll('a[data-page]')) {
    const page = link.dataset.page;
    link.href = urlFor({ ...state, page, project: '' }, link.dataset.anchor);
    if (link.closest('.dos-tabs')) {
      if (page === state.page) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
  }
}

function portfolioPath(page, project = '') {
  if (project) return `~/projects/${project}.md`;
  return page === 'home' ? '~' : `~/${page}`;
}

function currentPath() {
  return portfolioPath(state.page, state.project);
}

function fitPromptPath() {
  promptPath.textContent = displayedPath;
  if (compactCommandBar.matches &&
      displayedPath.endsWith('.md') && promptPath.scrollWidth > promptPath.clientWidth) {
    promptPath.textContent = displayedPath.slice(0, -3);
  }
}

function setPromptPath(path) {
  if (path === displayedPath) return;
  displayedPath = path;
  promptPath.title = path;
  fitPromptPath();
}

function stopTyping() {
  cancelAnimationFrame(animationFrame);
  feedback.hidden = true;
  feedback.removeAttribute('data-typing');
  feedback.removeAttribute('data-hold');
  feedback.removeAttribute('data-returning');
  feedback.textContent = '';
  setPromptPath(currentPath());
}

const experimentalTiming = { min: 600, max: 880, msPerCharacter: 11, hold: 600, sqlHold: 750, settle: 180 };
commandBar.style.setProperty('--command-settle', `${experimentalTiming.settle}ms`);

function typeCommand(text, oldPath = currentPath(), sql = false) {
  if (reducedMotion.matches || search.value || document.activeElement === search) return;
  setPromptPath(oldPath);
  feedback.hidden = false;
  feedback.setAttribute('data-typing', '');
  const started = performance.now();
  const { min, max, msPerCharacter, hold, sqlHold, settle } = experimentalTiming;
  const typeTime = Math.min(max, min + text.length * msPerCharacter);
  const holdUntil = typeTime + (sql ? sqlHold : hold);

  function tick(now) {
    const elapsed = now - started;
    if (elapsed >= holdUntil + settle || reducedMotion.matches) {
      stopTyping();
      return;
    }
    if (elapsed >= typeTime) {
      if (feedback.textContent !== text) feedback.textContent = text;
      feedback.removeAttribute('data-typing');
      feedback.toggleAttribute('data-hold', elapsed < holdUntil);
      feedback.toggleAttribute('data-returning', elapsed >= holdUntil);
      if (elapsed >= holdUntil) setPromptPath(currentPath());
    } else {
      feedback.textContent = text.slice(0, Math.floor(Math.max(0, elapsed) / typeTime * text.length));
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
  const sections = [...main.querySelectorAll('[data-outline]:not([hidden])')]
    .filter(part => !part.parentElement.closest('.other-entries'))
    .map(part => `<a href="#${part.id}" data-jump="${part.id}">${part.dataset.outline || part.textContent}</a>`);
  const links = listing ? [...listing.map(project => projectLink(project)), ...sections] : sections;
  document.querySelector('#outline-path').textContent = detail ? `${detail.id}/` : `${state.page}/`;
  document.querySelector('#outline-links').innerHTML = links.map(link => `<li>${link}</li>`).join('');
  outlineToggle.hidden = !links.length;
  const metadata = document.querySelector('#inspector-meta');
  metadata.hidden = !detail;
  if (detail && !metadata.hidden) {
    metadata.innerHTML = `<p class="meta">Document</p><strong>${detail.title}</strong><p>${detail.meta}</p>`;
  }
  if (!links.length) setOutline(false);
  const documentIndex = main.querySelector('.document-index');
  if (documentIndex) documentIndex.innerHTML = sections.join('');
}

function setOutline(open) {
  if (!open && outline.contains(document.activeElement)) outlineToggle.focus({ preventScroll: true });
  outline.hidden = !open;
  outlineToggle.setAttribute('aria-expanded', open);
}

function focusDestination(anchor = '') {
  if (document.activeElement === search) return;
  if (anchor) {
    const destination = document.getElementById(anchor);
    if (!destination) return;
    const group = destination.closest('.other-entries');
    if (group) group.open = true;
    if (destination instanceof HTMLDetailsElement) destination.open = true;
    const block = destination.closest('li, section, details') ?? destination;
    const entryDetails = block.matches('.entries > li') ? block.querySelector('details') : null;
    if (entryDetails) entryDetails.open = true;
    destination.tabIndex = -1;
    destination.focus({ preventScroll: true });
    const fits = block.getBoundingClientRect().height <= document.documentElement.clientHeight;
    block.scrollIntoView({ block: fits ? 'nearest' : 'start' });
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
  typeCommand(query, currentPath(), true);
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
    type: 'Page', id, label, path: portfolioPath(id), description: pageIntros[id] || roles.general.intro,
  })),
  ...projects.map(project => ({
    type: 'Project', id: project.id, label: project.title, path: portfolioPath('projects', project.id),
    description: project.description, meta: project.meta, tags: project.tags,
  })),
  ...Object.entries(roles).map(([id, view]) => ({
    type: 'Perspective', id, label: view.label, path: `view ${view.focus}`, description: view.intro,
  })),
  ...Object.entries(technologies).map(([id, label]) => ({
    type: 'Tag', id, label, path: `filter --tag ${id}`, description: `Show projects tagged ${label}.`,
  })),
  ...entries.skills.map(([label, meta, description]) => ({
    type: 'Skill', id: slug(label), label, meta, description, path: `${portfolioPath('skills')}#${slug(label)}`,
  })),
  ...['experience', 'education'].flatMap(page => entries[page].map(([label, meta, description, , record]) => ({
    type: sectionNames[page], page, id: record.id, label, meta, description,
    path: `${portfolioPath(page)}#${record.id}`,
  }))),
  { type: 'Help', id: 'help', label: 'Command help', path: 'help', description: 'Show the available commands and keyboard shortcuts.' },
];

const searchSuggestions = [
  ['Quick actions', [
    { type: 'Action', label: 'Search projects', query: 'project', description: 'Find project titles, descriptions and technology tags.' },
    { type: 'Action', label: 'Change perspective', query: 'view', description: 'Find and apply a research, software or teaching perspective.' },
    { type: 'Page', id: 'projects', label: 'Browse work', path: portfolioPath('projects'), description: 'Open the full project list.' },
  ]],
  ['Pages', searchItems.filter(item => item.type === 'Page').slice(0, 3)],
  ['Commands', [
    { type: 'Command', label: 'help', command: 'help', description: 'Show available commands and keyboard shortcuts.' },
    { type: 'Command', label: 'view research', command: 'view research', description: 'Select AI & Research while keeping the current page open.' },
    { type: 'Command', label: 'cd projects', command: 'cd projects', description: 'Navigate to the project listing.' },
  ]],
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
  const aliases = { ai: 'research', research: 'research', software: 'engineering', education: 'teaching', general: 'general' };
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
  const grouped = !query;
  const verbs = { Page: 'cd', Project: 'open', Perspective: 'view', Tag: 'filter' };
  matches = command ? [command] : query ? searchItems.map(item => {
    const label = item.label.toLowerCase();
    const keywords = [verbs[item.type], item.type, item.path, item.meta, ...(item.tags ?? [])].join(' ').toLowerCase();
    const summary = item.description?.toLowerCase() ?? '';
    const score = terms.reduce((sum, term) => sum + Math.min(
      fuzzyScore(term, label), 20 + fuzzyScore(term, keywords), summary.includes(term) ? 50 : Infinity,
    ), 0);
    return { item, score };
  }).filter(result => Number.isFinite(result.score)).sort((a, b) => a.score - b.score).map(result => result.item)
    : grouped ? searchSuggestions.flatMap(([, items]) => items) : searchItems;

  help.hidden = true;
  helpToggle.setAttribute('aria-expanded', 'false');
  document.querySelector('#search-results').hidden = false;
  const option = (item, index) =>
    `<li id="match-${index}" role="option" aria-selected="false" data-match="${index}"><span>${item.label}</span><small>${item.type}</small></li>`;
  results.innerHTML = grouped ? searchSuggestions.map(([label, items]) =>
    `<li class="command-group" role="group" aria-label="${label}"><p aria-hidden="true">${label}</p>
      <ul role="presentation">${items.map(item => option(item, matches.indexOf(item))).join('')}</ul></li>`).join('')
    : matches.map(option).join('');
  document.querySelector('#search-empty').hidden = !!matches.length;
  document.querySelector('#search-count').textContent = grouped ? 'Suggestions' : `${matches.length} ${matches.length === 1 ? 'match' : 'matches'}`;
  results.scrollTop = 0;
  selectMatch(0);
}

function selectMatch(index, scroll = false) {
  selection = index;
  const item = matches[index];
  const options = results.querySelectorAll('[data-match]');
  for (const option of options) option.setAttribute('aria-selected', Number(option.dataset.match) === index);
  preview.hidden = !item;
  if (!item) {
    search.removeAttribute('aria-activedescendant');
    return;
  }
  const option = options[index];
  search.setAttribute('aria-activedescendant', option.id);
  if (scroll) option.scrollIntoView({ block: 'nearest' });
  preview.innerHTML = `<p class="search-caption">Preview</p>
    <p class="preview-type">${item.type}</p><h2>${item.label}</h2>${item.path ? `<code>${item.path}</code>` : ''}
    ${item.description ? `<p>${item.description}</p>` : ''}
    ${item.meta ? `<p class="meta">${item.meta}</p>` : ''}
    ${item.tags?.length ? `<p class="meta">${item.tags.join(' · ')}</p>` : ''}`;
}

function openSearch() {
  stopTyping();
  if (!panel.hidden) return;
  panel.hidden = false;
  search.setAttribute('aria-expanded', 'true');
  searchToggle.setAttribute('aria-expanded', 'true');
  renderSearch();
  clearTimeout(statusTimer);
  status.textContent = 'Search';
}

function closeSearch() {
  if (!panel.hidden) status.textContent = statusText;
  panel.hidden = true;
  helpToggle.setAttribute('aria-expanded', 'false');
  search.setAttribute('aria-expanded', 'false');
  searchToggle.setAttribute('aria-expanded', 'false');
  search.removeAttribute('aria-activedescendant');
}

function toggleSearch() {
  if (!panel.hidden) closeSearch();
  else {
    search.focus({ preventScroll: true });
    openSearch();
  }
}

function runMatch(item) {
  if (!item) return;
  if (item.type === 'Command') {
    runMatch(explicitCommand(item.command));
    return;
  }
  if (item.type === 'Action') {
    search.value = item.query;
    renderSearch();
    return;
  }
  if (item.type === 'Help') {
    help.hidden = false;
    helpToggle.setAttribute('aria-expanded', 'true');
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
    const control = state.project ? heading : perspectiveMenu.querySelector('summary');
    control.focus({ preventScroll: true });
  } else if (item.type === 'Tag') changeFilter(item.id);
  else navigate(item.page || 'skills', '', item.id);
}

function updateSearchPrompt() {
  search.placeholder = compactCommandBar.matches ? 'Search or command…' : 'Search or type a command…';
  fitPromptPath();
}
compactCommandBar.addEventListener('change', updateSearchPrompt);
new ResizeObserver(fitPromptPath).observe(search.form);
document.fonts.ready.then(fitPromptPath);
portraitOptions.addEventListener('change', event => {
  go({ ...state, photo: event.target.value }, { replace: true, anchor: location.hash.slice(1) });
});

outlineToggle.addEventListener('click', () => setOutline(outline.hidden));
function toggleHelp() {
  if (!panel.hidden && !help.hidden) {
    closeSearch();
    return;
  }
  search.focus({ preventScroll: true });
  openSearch();
  runMatch(explicitCommand('help'));
}
helpToggle.addEventListener('click', toggleHelp);
searchToggle.addEventListener('click', toggleSearch);
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
  if (!nativePopover && !cvPreview.contains(event.target) && !event.target.closest('[data-cv-preview]')) closeCvPreview();
  if (!commandBar.contains(event.target) && !panel.hidden) closeSearch();
  if (perspectiveMenu.open && !perspectiveMenu.contains(event.target)) perspectiveMenu.open = false;
  if (narrowLayout.matches && !outline.hidden &&
      !outline.contains(event.target) && !outlineToggle.contains(event.target)) setOutline(false);
});
document.addEventListener('keydown', event => {
  const key = event.key.toLowerCase();
  if ((event.ctrlKey || event.metaKey) && !event.altKey && key === 'k') {
    event.preventDefault();
    if (event.repeat) return;
    toggleSearch();
  } else if (key === '?' && !event.ctrlKey && !event.altKey && !event.metaKey &&
      (event.target === search || !event.target.closest('input, textarea, select, [contenteditable]'))) {
    event.preventDefault();
    if (!event.repeat) toggleHelp();
  } else if (key === 'escape' && !panel.hidden) {
    event.preventDefault();
    closeSearch();
  } else if (key === 'escape' && isCvPreviewOpen()) {
    event.preventDefault();
    closeCvPreview();
    cvPreviewTrigger.focus({ preventScroll: true });
  } else if (key === 'escape' && perspectiveMenu.open) {
    perspectiveMenu.open = false;
    perspectiveMenu.querySelector('summary').focus();
  } else if (key === 'escape' && !outline.hidden) {
    setOutline(false);
  } else if (key === 'e' && !event.repeat && !event.ctrlKey && !event.altKey && !event.metaKey &&
      !outlineToggle.hidden && !event.target.closest('input, textarea, select, [contenteditable]')) {
    setOutline(outline.hidden);
  }
});

portfolio.addEventListener('click', async event => {
  const cvTrigger = event.target.closest('[data-cv-preview]');
  if (cvTrigger) {
    event.preventDefault();
    showCvPreview(cvTrigger);
    return;
  }
  const themeButton = event.target.closest('[data-color]');
  if (themeButton && themeButton.dataset.color !== state.theme) {
    go({ ...state, theme: themeButton.dataset.color }, { replace: true, anchor: location.hash.slice(1) });
    notify(`Theme: ${state.theme}`);
    return;
  }
  const perspectiveButton = event.target.closest('[data-perspective]');
  if (perspectiveButton) {
    if (perspectiveMenu.contains(perspectiveButton)) {
      perspectiveMenu.open = false;
      perspectiveMenu.querySelector('summary').focus({ preventScroll: true });
    }
    changePerspective(perspectiveButton.dataset.perspective);
    return;
  }
  const tag = event.target.closest('[data-filter]');
  if (tag || event.target.closest('#clear-filter')) {
    changeFilter(tag?.dataset.filter ?? '');
    return;
  }
  if (event.target.closest('#copy-email')) {
    const address = document.querySelector('#email-address');
    const feedback = document.querySelector('#email-copy-status');
    try {
      await navigator.clipboard.writeText(contact.email);
      feedback.textContent = 'Email copied.';
    } catch {
      const selection = window.getSelection();
      const text = address.firstChild;
      selection?.setBaseAndExtent(text, 0, text, text.length);
      feedback.textContent = selection ? 'Address selected. Copy it manually.' : 'Could not copy. Select the address to copy it.';
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
