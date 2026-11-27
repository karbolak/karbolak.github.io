const { profile, education, experience } = portfolioContent;
const profileName = profile.name;
const github = profile.github;
const sectionNames = {
  home: 'Home',
  projects: 'Projects',
  tools: 'Tools',
  experience: 'Experience',
  education: 'Education',
  contact: 'Contact',
};

const roles = {
  general: {
    label: 'General',
    heading: 'General',
    focus: 'all',
    headline: profile.role,
    intro: profile.abstract,
    projects: ['diffgate', 'vlf-antenna', 'amp', 'ai-intake-automation', 'xai-face-clustering', 'wildfire', 'forescan'],
    experience: ['htsm-research', 'psag-president'],
    skills: ['Python', 'Model evaluation', 'Gaussian processes', 'API integrations', 'Educational activity design'],
  },
  'ai-ml': {
    label: 'AI & ML',
    heading: 'AI & ML',
    focus: 'ai-ml',
    headline: profile.role,
    intro: 'I study early signals in diffusion models, use surrogate models for optimisation, and build LLM workflows with deterministic rules and human review.',
    projects: ['diffgate', 'ai-intake-automation', 'xai-face-clustering', 'vlf-antenna', 'forescan'],
    experience: ['htsm-research'],
    skills: ['Python', 'PyTorch', 'Diffusion models', 'scikit-learn', 'SHAP', 'LLM evaluation'],
  },
  research: {
    label: 'Research',
    heading: 'Research',
    focus: 'research',
    headline: 'MSc AI · HTSM Honours researcher',
    intro: 'I use controlled experiments to study when diffusion trajectories reveal image quality and how physics-informed surrogates affect antenna optimisation.',
    projects: ['diffgate', 'vlf-antenna', 'doces', 'forescan', 'n1-sleep'],
    experience: ['htsm-research'],
    skills: ['Experiment design', 'Gaussian processes', 'Signal processing', 'Cross-validation', 'Gmsh/GetDP'],
  },
  engineering: {
    label: 'Software Engineering',
    heading: 'Software Engineering',
    focus: 'software',
    headline: 'Software engineering · MSc AI',
    intro: 'I develop and maintain software for student associations. I also build Python libraries, command-line tools and web applications, and test workflows through deployment or reproducible evaluation.',
    projects: ['amp', 'diffgate', 'ai-intake-automation', 'xai-face-clustering', 'wildfire'],
    experience: ['htsm-research', 'psag-president'],
    skills: ['Python', 'FastAPI', 'Docker', 'pytest', 'Git', 'n8n'],
  },
  teaching: {
    label: 'Education',
    heading: 'Education',
    focus: 'education',
    headline: 'Tutor and activities instructor · MSc AI',
    intro: 'I tutor mathematics, physics, computing and humanities, and design collaborative learning activities. I completed the University of Groningen’s FSE Teaching Assistant Training.',
    projects: ['wildfire', 'adaptive-hri'],
    experience: ['private-tutoring', 'tdj-camp'],
    skills: ['Private tutoring', 'Gamification', 'Educational activity design', 'Python'],
  },
};

const entries = { experience, education };
const skills = [
  ...portfolioContent.skills.map(({ category, items, tags }) => ({ title: category, items, role: tags })),
  { title: 'Languages', items: profile.languages.map(({ language, level }) => `${language} (${level})`) },
];

const technologyLabels = {
  python: 'Python', 'machine-learning': 'Machine learning', 'generative-ai': 'Generative AI', timeseries: 'Time-series',
  'computer-vision': 'Computer vision', llm: 'LLM', automation: 'Automation',
};
const projects = portfolioContent.projects.map(project => ({
  ...project,
  meta: project.kind,
  description: project.summary,
  role: project.tags,
  tags: project.tags.filter(tag => !['ai', 'research', 'software', 'education'].includes(tag))
    .map(tag => technologyLabels[tag] ?? tag),
}));
const tools = portfolioContent.tools.map(tool => {
  const project = projects.find(item => item.id === tool.project);
  return {
    title: project?.title,
    description: project?.description,
    status: project?.meta,
    technologies: project?.tags ?? [],
    primaryAction: project?.action,
    ...tool,
  };
});
const skillAliases = {
  'cli-development': 'cli',
  'gmsh-getdp': 'gmsh',
  'multi-agent-systems': 'multi-agent-simulation',
  'shap-xai': 'shap',
  'time-series-forecasting': 'time-series',
};
function tagId(label) {
  const id = slug(label);
  return Object.hasOwn(skillAliases, id) ? skillAliases[id] : id;
}
const technologies = Object.fromEntries([
  ...Object.values(roles).flatMap(view => view.skills),
  ...skills.flatMap(group => group.items),
  ...tools.flatMap(tool => tool.technologies),
  ...projects.flatMap(project => project.tags),
].map(label => [tagId(label), label]));
const ampAliases = { psag: 'amp', 'psag-platform': 'amp' };
const projectAliases = { ...ampAliases, 'poetry-fusion': 'llm-poetry' };
const perspectiveTags = {
  'ai-ml': ['ai'],
  research: ['research'],
  engineering: ['software'],
  teaching: ['education'],
};
const pageIntros = {
  projects: 'Selected work across research, software, and education.',
  tools: 'Software, products, and interactive research tools you can use or explore.',
  experience: 'Research, teaching, and student association leadership.',
  education: 'Degrees, honours studies, exchange and teaching credentials.',
  contact: 'Professional profiles and contact information.',
};
const contact = { email: 'kajetan.karbowski@gmail.com', linkedin: 'https://www.linkedin.com/in/kajetan-karbowski/' };
const cvFiles = {
  general: 'Kajetan_Karbowski_CV_General.pdf',
  'ai-ml': 'Kajetan_Karbowski_CV_AI_ML.pdf',
  research: 'Kajetan_Karbowski_CV_Research.pdf',
  engineering: 'Kajetan_Karbowski_CV_Software_Engineering.pdf',
  teaching: 'Kajetan_Karbowski_CV_Education.pdf',
};
const portfolio = document.querySelector('.portfolio');
const main = document.querySelector('#main');
const returnLinks = main.querySelector('.return-links');
const cvPreview = document.querySelector('#cv-preview');
const nativePopover = typeof cvPreview.showPopover === 'function';
if (nativePopover) cvPreview.hidden = false;
else cvPreview.removeAttribute('popover');
const cvGlance = document.querySelector('#cv-glance');
const hero = main.querySelector('.hero');
const heading = hero.querySelector('h1');
const profileVisual = hero.querySelector('.profile-visual');
const profileToolbar = main.querySelector('.profile-toolbar');
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
const tabLinks = [...portfolio.querySelectorAll('.dos-tabs a[data-page]')];
tabLinks.forEach((link, index) => {
  const number = index + 1;
  link.setAttribute('aria-keyshortcuts', `Control+${number} Meta+${number} Control+Shift+${number}`);
});
const perspectiveMenu = document.querySelector('#perspective-menu');
const profileDegree = document.querySelector('.dossier-degree');
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

function highlightIds(value, items, aliases = {}) {
  const ids = (value ?? '').split(',').map(id => id.trim())
    .map(id => Object.hasOwn(aliases, id) ? aliases[id] : id);
  return [...new Set(ids)].filter(id => items.some(item => item.id === id));
}

function readLocation() {
  const url = new URL(location.href);
  const params = url.searchParams;
  for (const option of ['design', 'type', 'evidence']) {
    if (params.has(option)) params.delete(option);
  }
  if (url.hash.startsWith('#tool-')) {
    const tool = url.hash.slice(6);
    if (Object.hasOwn(ampAliases, tool)) url.hash = 'tool-amp';
    if (!params.has('section') && tools.some(item => url.hash === `#tool-${item.id}`)) {
      params.set('section', 'tools');
    }
  }
  if (params.get('section') === 'skills') {
    params.set('section', 'tools');
    const anchor = url.hash.slice(1);
    if (anchor && !skills.some(skill => slug(skill.title) === anchor) &&
        skills.some(skill => skill.items.some(item => slug(item) === anchor))) {
      url.hash = `skill-${anchor}`;
    }
  }
  const role = Object.hasOwn(roles, params.get('role')) ? params.get('role') : 'general';
  const requestedProject = params.get('project');
  const id = projects.find(project => project.id === (projectAliases[requestedProject] ?? requestedProject))?.id ?? '';
  if (id && id !== requestedProject) params.set('project', id);
  if (url.href !== location.href) history.replaceState(null, '', url);
  const page = Object.hasOwn(sectionNames, params.get('section')) ? params.get('section') : id ? 'projects' : 'home';
  const requestedFilter = params.get('filter');
  const filter = requestedFilter ? tagId(requestedFilter) : '';
  return {
    page, role,
    highlightedProjects: highlightIds(params.get('highlight-projects'), projects, projectAliases),
    highlightedExperience: highlightIds(params.get('highlight-experience'), experience),
    project: page === 'projects' ? id : '',
    filter: Object.hasOwn(technologies, filter) ? filter : '',
    theme: params.get('theme') === 'dark' ? 'dark' : 'light',
    photo: params.get('photo'),
  };
}
let state = readLocation();

function urlFor(next, anchor = '', path = location.pathname) {
  const params = new URLSearchParams();
  if (next.role !== 'general') params.set('role', next.role);
  if (next.highlightedProjects.length) params.set('highlight-projects', next.highlightedProjects.join(','));
  if (next.highlightedExperience.length) params.set('highlight-experience', next.highlightedExperience.join(','));
  if (next.page !== 'home') params.set('section', next.page);
  if (next.project) params.set('project', next.project);
  if (next.page === 'projects' && next.filter) params.set('filter', next.filter);
  if (next.theme === 'dark') params.set('theme', next.theme);
  if (next.photo !== null) params.set('photo', next.photo);
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

function toolLink(tool, label = tool.title) {
  const anchor = `tool-${tool.id}`;
  const url = urlFor({ ...state, page: 'tools', project: '' }, anchor);
  return `<a href="${url}" data-page="tools" data-anchor="${anchor}">${label}</a>`;
}

function externalLink(url, label, id = '', classes = '') {
  const destination = url.startsWith('mailto:') ? 'opens email app' : 'external website';
  return `<a ${id ? `id="${id}" ` : ''}class="external-link${classes ? ` ${classes}` : ''}" href="${url}" aria-label="${label} (${destination})">${label} <svg class="external-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M4 12 12 4M5 4h7v7"/></svg></a>`;
}

function slug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function tagList(labels, { label = 'Project tags', anchors = false } = {}) {
  return `<ul class="tags" aria-label="${label}">${labels.map(tag => {
    const id = tagId(tag);
    return `<li${anchors ? ` id="skill-${slug(tag)}"` : ''}><button type="button" data-filter="${id}" aria-pressed="${state.page === 'projects' && !state.project && state.filter === id}">${tag}</button></li>`;
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

function prioritise(items, ids) {
  const ranked = [...new Set(ids)].map(id => items.find(item => item.id === id)).filter(Boolean);
  return [...ranked, ...items.filter(item => !ranked.includes(item))];
}

function listingDate({ date, start, end, ongoing, date_label }) {
  if (date_label) return `<p class="listing-date">${date_label}</p>`;
  const first = start || date || end;
  if (!first) return '';
  const last = ongoing ? 'Present' : end && end !== first ? `<time datetime="${end}">${end}</time>` : '';
  return `<p class="listing-date"><time datetime="${first}">${first}</time>${last ? `–${last}` : ''}</p>`;
}

function perspectiveGroups(items, belongs, priorities = [], highlights = []) {
  const primary = [];
  const other = [];
  const archive = [];
  for (const item of items) {
    if (highlights.includes(item.id)) {
      primary.push(item);
    } else if (item.archived) {
      if (state.role === 'general' || belongs(item) || location.hash === `#${item.id}`) archive.push(item);
    } else {
      (belongs(item) ? primary : other).push(item);
    }
  }
  return { primary: prioritise(primary, [...highlights, ...priorities]), other, archive };
}

function renderPerspectiveList({ primary, other, archive }, label, renderList) {
  return `${primary.length || !other.length && !archive.length ? renderList(primary) : ''}
    ${[
      ['other-entries', `Other ${label}`, other],
      ['archive', 'Archive', archive],
    ].filter(([, , items]) => items.length).map(([id, title, items]) => `
      <details class="other-entries" id="${id}" data-outline="${title}">
        <summary>${title} (${items.length})</summary>
        ${renderList(items)}
      </details>`).join('')}`;
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
  const text = item.abstract ?? item.summary ?? item.details;
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
  const view = roles[state.role];
  const workIds = new Set([...state.highlightedProjects, ...view.projects.slice(0, 3)]);
  const historyIds = new Set([...state.highlightedExperience, ...view.experience]);
  const work = [...workIds].map(id => projects.find(item => item.id === id));
  const history = [...historyIds].map(id => experience.find(item => item.id === id));

  return `<section id="cv-work" class="cv-section" aria-labelledby="cv-work-title" data-outline="Selected work">
    <header class="cv-section-heading">
      <h2 id="cv-work-title"><span class="section-number" aria-hidden="true">02 /</span> Selected work</h2>
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
      <h2 id="cv-experience-title"><span class="section-number" aria-hidden="true">03 /</span> Selected experience</h2>
      <a href="?section=experience" data-page="experience">Full history</a>
    </header>
    <ul class="cv-rows">${history.map(item => `<li>
      <h3><a href="?section=experience#${item.id}" data-page="experience" data-anchor="${item.id}">${item.shortTitle ?? item.title}</a></h3>
      <p>${item.abstract ?? item.summary}</p>
      ${listingDate(item)}
    </li>`).join('')}</ul>
  </section>
  ${state.role === 'teaching' ? `
  <section id="cv-credentials" class="cv-section" aria-labelledby="cv-credentials-title" data-outline="Credentials">
    <header class="cv-section-heading">
      <h2 id="cv-credentials-title">Credentials</h2>
    </header>
    <ul class="cv-rows">${education.filter(item => item.id === 'ta-training').map(item => `<li>
      <h3><a href="?section=education#${item.id}" data-page="education" data-anchor="${item.id}">${item.title}</a></h3>
      <p>${item.summary}</p>
      ${listingDate(item)}
    </li>`).join('')}</ul>
  </section>` : ''}
  <section id="cv-skills" class="cv-section" aria-labelledby="cv-skills-title" data-outline="Key skills">
    <header class="cv-section-heading">
      <h2 id="cv-skills-title"><span class="section-number" aria-hidden="true">04 /</span> Key skills</h2>
      <a href="?section=tools#technical-skills" data-page="tools" data-anchor="technical-skills">All skills</a>
    </header>
    ${tagList(view.skills, { label: 'Key skills' })}
  </section>`;
}

function renderCvProfile(active) {
  const actions = document.querySelector('#cv-actions');
  actions.hidden = cvGlance.hidden = !active;
  heading.toggleAttribute('data-outline', active);
  if (!active) return;
  actions.innerHTML = [
    cvActions(state.role),
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
      ${tagList(project.tags)}
    </div>
    <div class="listing-aside">${listingDate(project)}${projectLink(project, 'View project', 'text-action')}</div>
  </li>`).join('')}</ul>`;
}

function projectDetail(project) {
  const related = (project.related ?? []).map(id => projects.find(item => item.id === id)).filter(Boolean);
  const relatedTools = tools.filter(tool => tool.project === project.id);
  const action = project.action ?? relatedTools.find(tool => tool.primaryAction && actionAvailable(tool.primaryAction))?.primaryAction;
  const [featuredReference, ...otherReferences] = project.references ?? [];
  const hasSources = otherReferences.length || project.credit;
  const overviewLink = project.overviewLink;
  const overviewActions = [
    action && toolAction(action, true),
    project.repository && externalLink(`${github}/${project.repository}`, 'View repository on GitHub', '', action ? '' : 'button primary'),
    featuredReference && toolAction(featuredReference),
    overviewLink && `<a href="${urlFor(state, overviewLink.anchor)}" data-jump="${overviewLink.anchor}">${overviewLink.label}</a>`,
  ].filter(Boolean);
  return `<div class="project-detail">
    <nav class="document-index" aria-label="Project sections"></nav>
    <div class="detail-body">
      <section aria-labelledby="overview">
        <h2 id="overview" data-outline>Overview</h2>
        <p>${project.description}</p>
        ${listingDate(project)}
        ${tagList(project.tags)}
        ${overviewActions.length ? `<div class="tool-actions"${hasSources ? '' : ' id="materials"'}>${overviewActions.join('')}</div>` : ''}
      </section>
      ${(project.sections ?? []).map(({ heading, paragraphs, table, figure, example }, index) => {
        const id = index === 0 ? 'technical' : slug(heading);
        return `<section aria-labelledby="${id}">
          <h2 id="${id}" data-outline>${heading}</h2>
          ${paragraphs.map(paragraph => `<p>${paragraph}</p>`).join('')}
          ${figure ? `<figure class="research-figure">
            <img src="${figure.src}" width="${figure.width}" height="${figure.height}" alt="${figure.alt}" loading="lazy">
            <figcaption>${figure.caption}
              ${figure.fullSize ? `<a href="${figure.src}" target="_blank" rel="noopener" aria-label="Open full-size figure: ${heading} (new tab)">Full size</a>` : ''}
              ${figure.source ? externalLink(figure.source, figure.sourceLabel ?? 'Source figure') : ''}
            </figcaption>
          </figure>` : ''}
          ${example ? `<figure class="research-figure project-example">
            <pre tabindex="0" aria-label="${example.caption}"><code>${example.lines.join('\n')}</code></pre>
            <figcaption>${example.caption}</figcaption>
          </figure>` : ''}
          ${table ? `<div class="result-table">
            <table>
              <caption>${table.caption}</caption>
              <thead><tr>${table.columns.map(column => `<th scope="col">${column}</th>`).join('')}</tr></thead>
              <tbody>${table.rows.map(([label, ...values]) => `<tr><th scope="row">${label}</th>
                ${values.map(value => `<td>${value}</td>`).join('')}</tr>`).join('')}</tbody>
            </table>
          </div>` : ''}
        </section>`;
      }).join('')}
      ${hasSources ? `<section aria-labelledby="materials">
        <h2 id="materials" data-outline>Sources and credits</h2>
        ${project.credit ? `<p>${project.credit}</p>` : ''}
        ${otherReferences.map(({ url, label }) => `<p>${externalLink(url, label)}</p>`).join('')}
      </section>` : ''}
      ${relatedTools.length ? `<nav class="related-documents" aria-label="Related tools">
        ${relatedTools.map(tool => toolLink(tool, `${tool.title} in Tools`)).join('')}
      </nav>` : ''}
      ${related.length ? `<nav class="related-documents" aria-label="Related projects">
        <span>Related projects</span>
        ${related.map(item => projectLink(item)).join('')}
      </nav>` : ''}
    </div>
  </div>`;
}

function toolAction({ label, url, preserveView }, primary = false) {
  const classes = primary ? 'button primary' : '';
  if (preserveView) url = urlFor({ ...state, page: 'home', project: '' }, '', url);
  return /^https?:\/\//i.test(url) ? externalLink(url, label, '', classes)
    : `<a${classes ? ` class="${classes}"` : ''} href="${url}">${label}</a>`;
}

function actionAvailable(action) {
  return action.available !== false &&
    (!action.localOnly || ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname));
}

function toolsContent(skillsOpen) {
  const priority = tool => tool.perspectives?.[state.role] ?? tool.priority;
  const sorted = [...tools].sort((a, b) => priority(b) - priority(a) || b.priority - a.priority);
  return `<ul class="tool-catalogue">${sorted.map(tool => {
    const project = projects.find(item => item.id === tool.project);
    const primary = tool.primaryAction && actionAvailable(tool.primaryAction);
    return `<li class="tool-card">
      <p class="meta">${tool.category}</p>
      <h2 id="tool-${tool.id}" data-outline>${tool.title}</h2>
      <p class="tool-status">${tool.status}</p>
      ${tool.preview ? `<img class="tool-preview" src="${tool.preview.src}" alt="${tool.preview.alt}" loading="lazy">` : ''}
      <p>${tool.description}</p>
      ${tool.note ? `<p class="tool-note">${tool.note}</p>` : ''}
      ${tool.example ? `<details class="tool-example"><summary>${tool.example.label}</summary>
        <p>${tool.example.description}</p><pre><code>${tool.example.command}</code></pre>
      </details>` : ''}
      ${tool.technologies.length ? tagList(tool.technologies, { label: 'Tool technologies' }) : ''}
      ${!primary && tool.availability ? `<p class="tool-note">${tool.availability}</p>` : ''}
      <div class="tool-actions">
        ${primary ? toolAction(tool.primaryAction, true) : ''}
        ${(tool.secondaryActions ?? []).filter(actionAvailable).map(action => toolAction(action)).join('')}
        ${project ? projectLink(project, tool.projectLabel ?? 'View project') : ''}
      </div>
    </li>`;
  }).join('')}</ul>
  <details class="technical-skills" id="technical-skills" data-outline="Technical skills" ${skillsOpen ? 'open' : ''}>
    <summary>Technical skills</summary>
    <ul class="entries">${ordered(skills, skill => skill.role).map(({ title, items }) => `<li>
      <h2 id="${slug(title)}">${title}</h2>
      ${tagList(items, { label: title, anchors: true })}
    </li>`).join('')}</ul>
  </details>`;
}

function cvActions(role, selected = true) {
  const label = roles[role].heading;
  const href = `./assets/cv/${cvFiles[role]}`;
  return `<a href="${href}" target="_blank" rel="noopener"${selected ? ' class="button cv-view"' : ''}
      aria-label="View CV — ${label} (PDF, new tab)">View CV</a>
    <a href="${href}" download${selected ? ' class="button"' : ''}
      aria-label="Download CV — ${label} (PDF)">Download CV</a>`;
}

function contactContent() {
  const { email, linkedin } = contact;
  const otherRoles = Object.keys(cvFiles).filter(role => role !== state.role);
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
    <section aria-labelledby="links-heading">
      <h2 id="links-heading" data-outline>Professional profiles</h2>
      <div class="contact-record">${externalLink(github, 'GitHub')}</div>
      <div class="contact-record">${linkedin ? externalLink(linkedin, 'LinkedIn') : '<span>LinkedIn</span><span class="contact-pending">Profile link pending</span>'}</div>
    </section>
    <section id="cv" tabindex="-1" aria-labelledby="cv-heading">
      <h2 id="cv-heading" data-outline>Curriculum vitae</h2>
      <div class="contact-record cv-download-row contact-cv-selected">
        <div>
          <p class="meta">Selected CV</p>
          <h3>${roles[state.role].heading}</h3>
        </div>
        <div class="contact-cv-actions">${cvActions(state.role)}</div>
      </div>
      <details class="other-cvs">
        <summary>Other CVs</summary>
        ${otherRoles.map(role => `
          <div class="contact-record cv-download-row">
            <span>${roles[role].heading}</span>
            <div class="contact-cv-actions">${cvActions(role, false)}</div>
          </div>`).join('')}
      </details>
    </section>
  </div>`;
}

function entryList(records) {
  return `<ul class="entries">${records.map(item => {
    const project = projects.find(project => project.id === item.project);
    return `<li>
      <div class="entry-heading"><h2 id="${item.id}" data-outline>
        <a href="${urlFor(state, item.id)}" data-jump="${item.id}" data-entry-toggle
          aria-controls="${item.id}-details" aria-expanded="false">${item.title}</a>
      </h2>${listingDate(item)}</div>
      <p class="meta">${item.organization ?? item.institution}</p>
      ${item.summary || item.abstract ? `<p>${item.summary ?? item.abstract}</p>` : ''}
      <details id="${item.id}-details"><summary aria-label="Details for ${item.title}">Details</summary>
        <p>${item.details}</p>
        ${project ? projectLink(project) : ''}
      </details>
    </li>`;
  }).join('')}</ul>`;
}

function render() {
  stopTyping();
  closeCvPreview();
  clearTimeout(statusTimer);
  const { page, role, project, filter, theme, highlightedProjects, highlightedExperience } = state;
  const view = roles[role];
  const custom = Boolean(highlightedProjects.length || highlightedExperience.length);
  const viewLabel = custom ? `Custom · ${view.heading}` : view.heading;
  const detail = projects.find(item => item.id === project);
  const home = page === 'home';
  const listing = page === 'projects' && !detail;
  const breadcrumb = currentPath();
  const visibleProjects = listing ? chronological(projects)
    .filter(item => !filter || item.tags.some(tag => tagId(tag) === filter)) : [];
  const filteredProjects = filter
    ? prioritise(visibleProjects, [...highlightedProjects, ...view.projects]) : visibleProjects;
  const projectGroups = listing && !filter ? perspectiveGroups(visibleProjects, item =>
    role === 'general' ? view.projects.includes(item.id) : relevantToView(item.role),
    view.projects, highlightedProjects) : null;
  const matchCount = projectGroups ? projectGroups.primary.length + projectGroups.other.length + projectGroups.archive.length : visibleProjects.length;
  const matches = `${matchCount} ${matchCount === 1 ? 'match' : 'matches'}`;

  portfolio.dataset.theme = theme;
  portfolio.toggleAttribute('data-cv-home', home);
  const themeToggle = document.querySelector('#theme-toggle');
  const nextTheme = theme === 'dark' ? 'light' : 'dark';
  themeToggle.hidden = false;
  themeToggle.dataset.color = nextTheme;
  themeToggle.textContent = nextTheme === 'light' ? 'Light' : 'Dark';
  themeToggle.setAttribute('aria-label', `Use ${nextTheme} theme`);
  themeToggle.setAttribute('title', `Switch to ${nextTheme} theme`);
  helpToggle.hidden = false;
  searchToggle.hidden = false;
  updateSearchPrompt();
  const documentTools = main.querySelector('.document-tools');
  const toolsParent = home ? profileToolbar : heading.parentElement;
  if (documentTools.parentElement !== toolsParent) toolsParent.append(documentTools);
  profileToolbar.hidden = !home;
  documentTools.hidden = !!detail;
  if (documentTools.hidden) perspectiveMenu.open = false;
  main.querySelector('.dossier-profile').hidden = !home;
  document.querySelector('#active-perspective').textContent = custom ? 'Custom' :
    perspectiveMenu.querySelector(`[data-perspective="${role}"]`).textContent;
  perspectiveMenu.querySelector('summary').setAttribute('aria-label', `Perspective: ${viewLabel}`);
  document.querySelector('#filters').hidden = !listing || !filter;
  if (filter) {
    const clear = document.querySelector('#clear-filter');
    clear.textContent = `${technologies[filter]} ×`;
    clear.setAttribute('aria-label', `Clear ${technologies[filter]} filter`);
    document.querySelector('#filter-count').textContent = matches;
  }
  for (const button of main.querySelectorAll('[data-perspective]')) {
    button.setAttribute('aria-pressed', !custom && button.dataset.perspective === role);
  }
  hero.toggleAttribute('data-home', home);
  profileVisual.hidden = !home;
  const title = home ? profileName : detail?.title ?? (page === 'tools' ? 'Tools & Products' : sectionNames[page]);
  heading.textContent = title;
  const introduction = hero.querySelector('.intro');
  introduction.hidden = page === 'contact';
  introduction.textContent = home ? view.intro : detail?.meta ?? pageIntros[page];
  if (home) profileDegree.firstChild.nodeValue = `${view.headline} `;
  returnLinks.hidden = home;
  document.querySelector('#back-to-projects').hidden = !detail;
  renderCvProfile(home);

  const content = document.querySelector('#section-content');
  if (home) content.innerHTML = cvHome();
  else if (detail) content.innerHTML = projectDetail(detail);
  else if (listing) content.innerHTML = projectGroups
    ? renderPerspectiveList(projectGroups, 'projects', projectIndex)
    : projectIndex(filteredProjects);
  else if (page === 'tools') content.innerHTML = toolsContent(content.querySelector('.technical-skills')?.open);
  else if (page === 'contact') content.innerHTML = contactContent();
  else {
    const records = chronological(entries[page]);
    const groups = perspectiveGroups(records, item => role === 'general' ||
      (page === 'education' && role === 'teaching') || relevantToView(item.tags),
      page === 'experience' ? view.experience : role === 'teaching' ? ['ta-training'] : [],
      page === 'experience' ? highlightedExperience : []);
    content.innerHTML = renderPerspectiveList(groups, page, entryList);
  }

  renderLinks();
  renderOutline(detail, listing ? projectGroups?.primary ?? filteredProjects : null);
  document.querySelector('#status-path').textContent = breadcrumb;
  statusText = listing ? `${matches}${filter ? ` · tag: ${technologies[filter]}` : ''}`
    : role === 'general' && !custom ? 'Ready' : `View: ${viewLabel}`;
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
    .map(part => `<a href="#${part.id}" data-jump="${part.id}">${part.dataset.outline || part.textContent.trim()}</a>`);
  const links = listing ? [...listing.map(project => projectLink(project)), ...sections] : sections;
  document.querySelector('#outline-path').textContent = detail ? `${detail.id}/` : `${state.page}/`;
  document.querySelector('#outline-links').innerHTML = links.map(link => `<li>${link}</li>`).join('');
  outlineToggle.hidden = !links.length;
  document.querySelector('#explorer-shortcut').hidden = !links.length;
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
    const group = destination.closest('.other-entries, .technical-skills');
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
  if (!changed && !anchor && !location.hash) return;
  go({ ...state, page, project }, { anchor });
  focusDestination(anchor);
  if (changed) typeCommand(project ? `open ${project}.md` : `cd ${page}`, oldPath);
}

function changePerspective(role) {
  if (role === state.role && !state.highlightedProjects.length && !state.highlightedExperience.length) return;
  go({ ...state, role, highlightedProjects: [], highlightedExperience: [] }, { anchor: location.hash.slice(1) });
  const table = state.page === 'home' ? 'portfolio' : state.page;
  const query = role === 'general' ? `SELECT * FROM ${table};` : `SELECT * FROM ${table} WHERE focus = '${roles[role].focus}';`;
  typeCommand(query, currentPath(), true);
  notify(`View: ${roles[role].heading}`);
}

function changeFilter(filter) {
  if (state.page === 'projects' && !state.project && filter === state.filter) return;
  const oldPath = currentPath();
  go({ ...state, page: 'projects', project: '', filter });
  focusDestination();
  typeCommand(filter ? `SELECT * FROM projects WHERE tag = '${filter}';` : 'SELECT * FROM projects;', oldPath, true);
  if (!filter) notify('Filter cleared');
}

const searchItems = [
  ...Object.entries(sectionNames).map(([id, label]) => ({
    type: 'Page', id, label, path: portfolioPath(id), description: pageIntros[id] || roles.general.intro,
  })),
  ...projects.map(project => ({
    type: 'Project', id: project.id, searchId: project.id, label: project.title, path: portfolioPath('projects', project.id),
    description: project.description, meta: project.meta,
    tags: [...project.tags, ...Object.keys(projectAliases).filter(alias => projectAliases[alias] === project.id)],
  })),
  ...tools.map(tool => ({
    type: 'Tool', page: 'tools', id: `tool-${tool.id}`, searchId: tool.id, label: tool.title,
    path: `${portfolioPath('tools')}/${tool.id}`, description: tool.description,
    meta: `${tool.category} · ${tool.status}`, tags: [...tool.technologies, ...Object.keys(ampAliases).filter(alias => ampAliases[alias] === tool.id)],
  })),
  ...Object.entries(roles).map(([id, view]) => ({
    type: 'Perspective', id, label: view.label, path: `view ${view.focus}`, description: view.intro,
  })),
  ...Object.entries(technologies).map(([id, label]) => ({
    type: 'Tag', id, label, path: `filter --tag ${id}`, description: `Show projects tagged ${label}.`,
  })),
  ...skills.flatMap(({ title, items }) => [
    { type: 'Skill', page: 'tools', id: slug(title), label: title, description: items.join(' · '),
      path: `${portfolioPath('tools')}#${slug(title)}` },
    ...items.map(label => ({
      type: 'Skill', filter: tagId(label), id: `skill-${slug(label)}`, label, meta: title,
      path: `filter --tag ${tagId(label)}`,
    })),
  ]),
  ...Object.entries(entries).flatMap(([page, records]) => records.map(record => ({
    type: sectionNames[page], page, id: record.id, label: record.title,
    meta: record.organization ?? record.institution, description: record.summary ?? record.abstract ?? record.details,
    path: `${portfolioPath(page)}#${record.id}`,
  }))),
  { type: 'Help', id: 'help', label: 'Command help', path: 'help', description: 'Show the available commands and keyboard shortcuts.' },
];

const searchSuggestions = [
  ['Quick actions', [
    { type: 'Action', label: 'Search projects', query: 'project', description: 'Find project titles, descriptions and technology tags.' },
    { type: 'Action', label: 'Search tools', query: 'tool', description: 'Find software, products and interactive research tools.' },
    { type: 'Action', label: 'Change perspective', query: 'view', description: 'Find and apply a portfolio perspective.' },
    { type: 'Page', id: 'projects', label: 'Browse work', path: portfolioPath('projects'), description: 'Open the full project list.' },
  ]],
  ['Pages', searchItems.filter(item => item.type === 'Page').slice(0, 4)],
  ['Commands', [
    { type: 'Command', label: 'help', command: 'help', description: 'Show available commands and keyboard shortcuts.' },
    { type: 'Command', label: 'view ai-ml', command: 'view ai-ml', description: 'Select AI & ML while keeping the current page open.' },
    { type: 'Command', label: 'cd tools', command: 'cd tools', description: 'Navigate to Tools & Products.' },
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
  const aliases = { ai: 'ai-ml', software: 'engineering', education: 'teaching' };
  if (verb === 'cd' && id && !tag) return searchItems.find(item => item.type === 'Page' && item.id === (id === 'skills' ? 'tools' : id));
  const path = id?.replace(/^~?\//, '');
  if (verb === 'open' && path?.startsWith('tools/') && !tag) {
    const tool = path.slice(6);
    return searchItems.find(item => item.type === 'Tool' && item.searchId === (ampAliases[tool] ?? tool));
  }
  if (verb === 'open' && id && !tag) {
    const project = path.replace(/^projects\/|\.md$/g, '');
    return searchItems.find(item => item.type === 'Project' && item.id === (projectAliases[project] ?? project));
  }
  if (verb === 'view' && id && !tag) return searchItems.find(item => item.type === 'Perspective' && item.id === (aliases[id] ?? id));
  if (verb === 'filter' && id === '--tag' && !extra) return searchItems.find(item => item.type === 'Tag' && item.id === tagId(tag ?? ''));
  if (value === 'filter --clear') return { type: 'Tag', id: '', label: 'Clear project filter', path: value, description: 'Show all projects.' };
}

function renderSearch() {
  const query = search.value.toLowerCase().trim();
  const command = explicitCommand(query);
  const terms = query.split(/\s+/);
  const grouped = !query;
  const verbs = { Page: 'cd', Project: 'open', Tool: 'open', Perspective: 'view', Tag: 'filter' };
  matches = command ? [command] : query ? searchItems.map(item => {
    const label = item.label.toLowerCase();
    const keywords = [verbs[item.type], item.type, item.path, item.meta, ...(item.tags ?? [])].join(' ').toLowerCase();
    const summary = item.description?.toLowerCase() ?? '';
    const score = query === item.searchId ? -1 : terms.reduce((sum, term) => sum + Math.min(
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
  } else if (item.type === 'Tag' || item.filter) changeFilter(item.filter ?? item.id);
  else navigate(item.page, '', item.id);
}

function updateSearchPrompt() {
  search.placeholder = compactCommandBar.matches ? 'Search or command…' : 'Search or type a command…';
  fitPromptPath();
}
compactCommandBar.addEventListener('change', updateSearchPrompt);
new ResizeObserver(fitPromptPath).observe(search.form);
document.fonts.ready.then(fitPromptPath);
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
  const digit = event.code.startsWith('Digit') ? event.code.slice(5) : key;
  const tabModifier = event.ctrlKey || (event.metaKey && !event.shiftKey);
  const tab = tabModifier && !event.altKey && /^[1-6]$/.test(digit) ? tabLinks[Number(digit) - 1] : null;
  if (tab) {
    event.preventDefault();
    if (event.repeat) return;
    closeSearch();
    search.value = '';
    search.blur();
    navigate(tab.dataset.page);
    return;
  }
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
  } else if (key === 'e' && (event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey && !outlineToggle.hidden) {
    event.preventDefault();
    if (event.repeat) return;
    if (!panel.hidden) {
      closeSearch();
      outlineToggle.focus({ preventScroll: true });
    }
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
  if (link.hasAttribute('data-entry-toggle')) {
    const details = document.getElementById(link.getAttribute('aria-controls'));
    details.open = !details.open;
    if (details.open && location.hash !== `#${jump}`) history.pushState(null, '', urlFor(state, jump));
    return;
  }
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

main.addEventListener('error', event => {
  if (event.target.matches('.research-figure img')) event.target.hidden = true;
}, true);
main.addEventListener('toggle', event => {
  const title = event.target.closest('.entries > li')?.querySelector('[data-entry-toggle]');
  if (title) title.setAttribute('aria-expanded', event.target.open);
}, true);

render();
if (location.hash) focusDestination(location.hash.slice(1));
