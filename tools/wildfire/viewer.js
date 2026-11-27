'use strict';

const $ = id => document.getElementById(id);
const manifestURL = new URL('./data/manifest.json', document.baseURI);
const phases = {
  initial: ['Initial conditions', 'Ignitions are in place. Sensors have yet to observe the environment.'],
  cluster_decision: ['Requests and allocation', 'Sensors decide from their private information. Unique targets are accepted in sensor ID order, up to the remaining budget.'],
  cluster_suppression: ['Suppression', 'Accepted requests spend water. A successful intervention returns a burning cell to the safe state.'],
  cluster_transition: ['Fire spreads', 'The simulation advances one timestep. Sensors still hold their previous observation.'],
  cluster_observation: ['Sensors observe', 'Sensors record the new state in their own neighbourhoods for the next decision.'],
};
const cellKey = p => p.join(',');
const burning = frame => frame.cells.filter(cell => cell === 1).length;
let manifest, panes = [], index = 0, selected = 0, timer = null, pending;
const lastIndex = () => Math.max(0, ...panes.map(pane => pane.trace.frames.length - 1));

async function readJSON(url, signal) {
  const response = await fetch(url, {signal});
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

function setOptions(select, options, preferred = select.value) {
  select.replaceChildren(...options.map(([value, text]) => new Option(text, value)));
  if (options.some(([value]) => value === preferred)) select.value = preferred;
  select.disabled = !options.length;
}

function updateSeeds(scenario) {
  setOptions($('seed'), manifest.seeds
    .filter(seed => Object.keys(scenario.replays[seed] || {}).length)
    .map(seed => [String(seed), String(seed)]));
}

function updatePolicies(scenario) {
  const entries = scenario.replays[$('seed').value] || {};
  const options = manifest.policies.filter(policy => entries[policy.id]).map(policy => [policy.id, policy.label]);
  setOptions($('policy'), options);
  const comparisons = options.filter(([id]) => id !== $('policy').value);
  setOptions($('compare'), [['', 'Single policy'], ...comparisons]);
  $('compare').disabled = !comparisons.length;
}

function stop() {
  clearInterval(timer);
  timer = null;
  $('play').textContent = 'Play';
}

function setFrame(next) {
  index = Math.max(0, Math.min(next, lastIndex()));
  render();
}

function play() {
  if (timer !== null) {
    stop();
    return;
  }
  if (index === lastIndex()) setFrame(0);
  $('play').textContent = 'Pause';
  timer = setInterval(() => {
    setFrame(index + 1);
    if (index === lastIndex()) stop();
  }, Number($('speed').value));
}

function canvasContext(canvas) {
  const box = canvas.getBoundingClientRect(), ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(box.width * ratio);
  canvas.height = Math.round(box.height * ratio);
  const ctx = canvas.getContext('2d');
  ctx.scale(ratio, ratio);
  return [ctx, box.width, box.height];
}

function drawMap(canvas, trace, f, local) {
  const [ctx, width, height] = canvasContext(canvas);
  const w = trace.width, h = trace.height;
  const size = Math.min((width - 28) / w, (height - 22) / h);
  if (size <= 0) return;
  const ox = (width - size * w) / 2, oy = (height - size * h) / 2;
  const center = p => [ox + (p[0] + .5) * size, oy + (p[1] + .5) * size];
  const rows = f.private_views[String(selected)] || [];
  const known = new Map(rows.map(([x, y, state]) => [cellKey([x, y]), state]));
  const colors = {'-1': '#25354a', 0: '#60b878', 1: '#f15a24', 2: '#171717'};
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const state = local ? (known.get(cellKey([x, y])) ?? -1) : f.cells[y * w + x];
      const gap = Math.max(.35, size * .025);
      ctx.fillStyle = colors[state];
      ctx.fillRect(ox + x * size + gap, oy + y * size + gap, size - gap * 2, size - gap * 2);
      if (state === -1 && size > 4) {
        ctx.fillStyle = '#92a8c3';
        ctx.fillRect(ox + (x + .5) * size, oy + (y + .5) * size, 1, 1);
      }
    }
  }
  const sensor = trace.sensors.find(s => s.sensor_id === selected);
  if (!local && sensor && sensor.radius > 0) {
    const [cx, cy] = center(sensor.position), r = (sensor.radius + .5) * size;
    ctx.save();
    ctx.beginPath();
    ctx.rect(ox, oy, w * size, h * size);
    ctx.clip();
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx + r, cy);
    ctx.lineTo(cx, cy + r);
    ctx.lineTo(cx - r, cy);
    ctx.closePath();
    ctx.strokeStyle = '#183c73';
    ctx.lineWidth = 1.3;
    ctx.setLineDash([3, 3]);
    ctx.stroke();
    ctx.restore();
  }
  if (!local) {
    for (const p of f.suppressed_history) {
      ctx.beginPath();
      ctx.arc(...center(p), size * .32, 0, Math.PI * 2);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = Math.max(2, size * .18);
      ctx.stroke();
      ctx.strokeStyle = '#0060ff';
      ctx.lineWidth = Math.max(1, size * .11);
      ctx.stroke();
    }
    for (const p of f.targets) {
      const inset = size * .15;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = Math.max(2, size * .17);
      ctx.strokeRect(ox + p[0] * size + inset, oy + p[1] * size + inset, size - 2 * inset, size - 2 * inset);
      ctx.strokeStyle = '#245db3';
      ctx.lineWidth = Math.max(1, size * .09);
      ctx.strokeRect(ox + p[0] * size + inset, oy + p[1] * size + inset, size - 2 * inset, size - 2 * inset);
    }
  }
  for (const s of trace.sensors) {
    if (local && s.sensor_id !== selected) continue;
    const [x, y] = center(s.position), radius = Math.max(2, Math.min(9, size * .36));
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = s.sensor_id === selected ? '#173764' : '#234c3c';
    ctx.fill();
    ctx.strokeStyle = '#fffef9';
    ctx.lineWidth = s.sensor_id === selected ? 1.7 : .8;
    ctx.stroke();
    if (radius > 4.5) {
      ctx.fillStyle = '#fff';
      ctx.font = `600 ${Math.max(7, radius + 1)}px system-ui`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(s.sensor_id, x, y);
    }
  }
  canvas.setAttribute('aria-label', local
    ? `Sensor ${selected} private observation: ${rows.length} observed cells; other cells unknown`
    : `Full environment at timestep ${f.timestep}: ${burning(f)} burning cells`);
  return {ox, oy, size};
}

function drawChart(svg, trace, timestep, maximum) {
  const points = [{timestep: 0, burning: burning(trace.frames[0]), budget_remaining: trace.config.budget}, ...trace.steps];
  const width = Math.max(220, svg.clientWidth), height = 135;
  const x = t => 29 + t / trace.config.steps * (width - 45), y = v => 104 - v / maximum * 88;
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  const line = (key, color) => `<polyline points="${points.map(f => `${x(f.timestep)},${y(f[key])}`).join(' ')}" fill="none" stroke="${color}" stroke-width="2"/>`;
  svg.innerHTML = `<line x1="29" x2="${width - 16}" y1="104" y2="104" stroke="#cbd3c7"/>`
    + `<text x="3" y="20" font-size="11" fill="#495a52">${maximum}</text><text x="12" y="108" font-size="11" fill="#495a52">0</text>`
    + line('burning', '#b94b15') + line('budget_remaining', '#285d47')
    + `<line x1="${x(timestep)}" x2="${x(timestep)}" y1="15" y2="104" stroke="#245db3" stroke-dasharray="3 3"/>`
    + [0, trace.config.steps].map(t => `<text x="${x(t)}" y="126" text-anchor="middle" font-size="11" fill="#495a52">t = ${t}</text>`).join('');
}

function renderDecisions(pane, frame) {
  const {nodes, trace} = pane;
  const decision = frame.decisions.find(row => row.agent === selected);
  if (decision) {
    const result = decision.accepted ? 'accepted' : 'not accepted';
    const action = decision.action ? `requested (${decision.target.join(', ')}) · ${result}` : 'waited';
    const snapshot = trace.frames[decision.policy_step * 4 + 1].observation_timestep;
    const timing = snapshot === null ? 'before any observation' : `with the observation from timestep ${snapshot}`;
    nodes['decision-text'].textContent = `Sensor ${selected} ${action} at timestep ${decision.policy_step}, ${timing}.`;
  } else {
    nodes['decision-text'].textContent = 'No decisions have been recorded yet.';
  }
  nodes.requests.hidden = !frame.decisions.length;
  if (nodes.requests.open) {
    const rows = frame.decisions.map(row => {
      const tr = document.createElement('tr');
      const values = [row.agent, row.action ? 'Request' : 'Wait', row.target?.join(', ') ?? '—',
        row.action ? (row.accepted ? 'Yes' : 'No') : '—'];
      values.forEach(value => { tr.insertCell().textContent = value; });
      return tr;
    });
    nodes.tbody.replaceChildren(...rows);
  }
}

function render() {
  if (!panes.length) return;
  const active = panes.find(pane => pane.trace.frames.length > index);
  const frame = active.trace.frames[index];
  const [title, description] = phases[frame.phase];
  $('clock').textContent = `Frame ${index + 1} of ${lastIndex() + 1} · Timestep ${frame.timestep}`;
  $('phase-title').textContent = title;
  $('phase-description').textContent = description;
  $('timeline').value = index;
  $('timeline').setAttribute('aria-valuetext', `Frame ${index + 1}, timestep ${frame.timestep}, ${title}`);
  $('previous').disabled = index === 0;
  $('next').disabled = index === lastIndex();

  for (const pane of panes) {
    const {trace, nodes} = pane, final = trace.frames.length - 1;
    const f = trace.frames[Math.min(index, final)];
    nodes.position.textContent = `Timestep ${f.timestep} · Frame ${Math.min(index, final) + 1} / ${final + 1}${index > final ? ' · Episode ended' : ''}`;
    nodes.burning.textContent = `${burning(f)} burning`;
    const rows = f.private_views[String(selected)] || [];
    nodes.known.textContent = `${rows.filter(([, , value]) => value === 1).length} seen burning`;
    if (f.observation_timestep === null) {
      nodes.observation.textContent = `Sensor ${selected} · No snapshot yet. All cells are unknown.`;
    } else {
      const timing = f.views_current ? 'Observation from' : 'Snapshot held from';
      nodes.observation.textContent = `Sensor ${selected} · ${timing} timestep ${f.observation_timestep} · ${rows.length} known cells.`;
    }
    nodes.water.textContent = `${f.budget_remaining} / ${trace.config.budget}`;
    nodes.targets.textContent = f.targets.length;
    nodes['suppressed-now'].textContent = f.suppressed.length;
    pane.geometry = drawMap(nodes.world, trace, f, false);
    drawMap(nodes.private, trace, f, true);
    drawChart(nodes.chart, trace, f.timestep, pane.chartMaximum);
    renderDecisions(pane, f);
  }
}

function makePane(trace, policy, scenario) {
  const article = $('episode-template').content.firstElementChild.cloneNode(true);
  const nodes = Object.fromEntries([
    'policy-title', 'position', 'burning', 'known', 'observation', 'world', 'private', 'water',
    'targets', 'suppressed-now', 'decision-text', 'requests', 'chart', 'damage', 'burned-final',
    'water-used', 'successes',
  ].map(key => [key, article.querySelector(`.${key}`)]));
  nodes.tbody = article.querySelector('tbody');
  const pane = {article, nodes, trace};
  article.dataset.policy = policy.id;
  article.dataset.seed = trace.config.seed;
  article.dataset.scenario = scenario.id;
  nodes['policy-title'].textContent = policy.label;
  nodes.damage.textContent = trace.metrics.cumulative_damage;
  nodes['burned-final'].textContent = trace.metrics.burned_final;
  nodes['water-used'].textContent = `${trace.metrics.interventions_used} / ${trace.config.budget}`;
  nodes.successes.textContent = trace.metrics.suppression_successes;
  nodes.requests.addEventListener('toggle', () => {
    renderDecisions(pane, trace.frames[Math.min(index, trace.frames.length - 1)]);
  });
  nodes.world.addEventListener('click', event => {
    if (!pane.geometry) return;
    const box = nodes.world.getBoundingClientRect(), {ox, oy, size} = pane.geometry;
    const x = (event.clientX - box.left - ox) / size;
    const y = (event.clientY - box.top - oy) / size;
    const sensor = trace.sensors
      .map(s => [s, Math.hypot(s.position[0] + .5 - x, s.position[1] + .5 - y)])
      .filter(([, distance]) => distance < Math.max(.55, 9 / size))
      .sort((a, b) => a[1] - b[1])[0]?.[0];
    if (sensor) {
      selected = sensor.sensor_id;
      $('sensor').value = String(selected);
      render();
    }
  });
  return pane;
}

function showError(message) {
  $('status').textContent = '';
  $('error').textContent = message;
  $('error').hidden = false;
}

function getScenario() {
  return manifest.scenarios.find(scenario => scenario.id === $('scenario').value);
}

async function loadReplays() {
  const scenario = getScenario(), seed = $('seed').value;
  const ids = [$('policy').value, $('compare').value].filter(Boolean);
  pending?.abort();
  const controller = new AbortController();
  pending = controller;
  stop();
  panes = [];
  $('replay').hidden = true;
  $('episodes').replaceChildren();
  $('error').hidden = true;
  if (!ids.length) {
    $('status').textContent = 'No replays are available for this selection.';
    return;
  }
  $('status').textContent = 'Loading selected replay…';

  try {
    const loaded = await Promise.all(ids.map(async id => {
      const policy = manifest.policies.find(option => option.id === id);
      try {
        const url = new URL(scenario.replays[seed][id], manifestURL);
        const replay = await readJSON(url, controller.signal);
        if (!replay.frames?.length || !replay.frames.every(f => phases[f.phase]) ||
            replay.mode !== policy.trace_mode || replay.config.seed !== Number(seed) ||
            replay.config.spread_probability !== scenario.config.spread_probability) {
          throw new Error('Replay does not match this selection');
        }
        return [replay, policy];
      } catch (error) {
        throw new Error(`${policy.label}: ${error.message}`);
      }
    }));
    if (controller.signal.aborted) return;
    panes = loaded.map(([trace, policy]) => makePane(trace, policy, scenario));
    const maximum = Math.max(1, ...panes.flatMap(({trace}) =>
      [trace.config.budget, burning(trace.frames[0]), ...trace.steps.map(step => step.burning)]));
    for (const pane of panes) pane.chartMaximum = maximum;
    setOptions($('sensor'), panes[0].trace.sensors.map(s => [String(s.sensor_id), String(s.sensor_id)]), String(selected));
    selected = Number($('sensor').value);
    $('timeline').max = lastIndex();
    $('replay').hidden = false;
    $('episodes').classList.toggle('comparing', panes.length > 1);
    $('episodes').replaceChildren(...panes.map(pane => pane.article));
    $('status').textContent = panes.length > 1
      ? 'Both policies use the same fire seed. An episode that ends early holds its final frame.'
      : '';
    setFrame(0);
  } catch (error) {
    if (controller.signal.aborted) return;
    panes = [];
    $('episodes').replaceChildren();
    $('replay').hidden = true;
    showError(`Could not load this selection. ${error.message}. Choose another replay or reload to retry.`);
  }
}

function changeScenario() {
  const scenario = getScenario(), config = scenario.config;
  $('scenario-details').hidden = false;
  $('scenario-details').textContent = `${config.size} × ${config.size} grid · ${config.sensors} sensors · ${config.ignitions} initial fires · ${config.budget} water units · Up to ${config.steps} timesteps`;
  updateSeeds(scenario);
  updatePolicies(scenario);
  loadReplays();
}

$('scenario').addEventListener('change', changeScenario);
$('seed').addEventListener('change', () => {
  updatePolicies(getScenario());
  loadReplays();
});
$('policy').addEventListener('change', () => {
  updatePolicies(getScenario());
  loadReplays();
});
$('compare').addEventListener('change', loadReplays);
$('sensor').addEventListener('change', () => {
  selected = Number($('sensor').value);
  render();
});
$('timeline').addEventListener('input', event => {
  stop();
  setFrame(Number(event.target.value));
});
$('previous').addEventListener('click', () => { stop(); setFrame(index - 1); });
$('next').addEventListener('click', () => { stop(); setFrame(index + 1); });
$('play').addEventListener('click', play);
$('speed').addEventListener('change', () => {
  if (timer !== null) { stop(); play(); }
});
window.addEventListener('resize', render);

async function init() {
  const view = new URLSearchParams(location.search);
  const back = $('portfolio-return');
  const destination = new URL(back.href);
  for (const key of ['role', 'theme', 'photo', 'highlight-projects', 'highlight-experience']) {
    if (view.has(key)) destination.searchParams.set(key, view.get(key));
  }
  back.href = destination;

  try {
    manifest = await readJSON(manifestURL);
    if (manifest.version !== 1) throw new Error('Unsupported replay catalogue version');
    const scenarios = manifest.scenarios.filter(scenario => manifest.seeds.some(seed =>
      manifest.policies.some(policy => scenario.replays[seed]?.[policy.id])));
    if (!scenarios.length) {
      $('status').textContent = 'No replays are available in this catalogue.';
      return;
    }
    setOptions($('scenario'), scenarios.map(scenario => [
      scenario.id, scenario.config.spread_probability.toFixed(2),
    ]), 'spread_0.15');
    changeScenario();
  } catch (error) {
    showError(`Could not load the replay catalogue. ${error.message}. Reload to retry.`);
  }
}
init();
