import { scoreFeatures } from './score.mjs';

const view = new URLSearchParams(location.search);
document.querySelector('.portfolio').dataset.theme = view.get('theme') === 'dark' ? 'dark' : 'light';
for (const link of document.querySelectorAll('[data-return]')) {
  const destination = new URL(link.href);
  for (const key of ['role', 'theme', 'photo', 'highlight-projects', 'highlight-experience']) {
    if (view.has(key)) destination.searchParams.set(key, view.get(key));
  }
  link.href = destination;
}

const form = document.querySelector('#scoring');
const example = form.querySelector('#example');
const input = form.querySelector('#features');
const threshold = form.querySelector('#threshold');
const terminal = form.querySelector('#terminal');
const command = form.querySelector('#terminal-command');
const commandText = command.textContent;
const cliOutput = form.querySelector('#cli-output');
const decisionOutput = form.querySelector('#terminal-decision');
const stepStrip = form.querySelector('#step-strip');
const stepSummary = form.querySelector('#step-summary');
const replayOutcome = form.querySelector('#replay-outcome');
const replayAbort = form.querySelector('#replay-abort');
const replayImage = form.querySelector('#replay-image');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const prefixSteps = 5;
const totalSteps = 25;
const remainingSteps = totalSteps - prefixSteps;
let replayFrame;

for (let step = 0; step < totalSteps; step++) {
  const marker = document.createElement('span');
  marker.classList.toggle('prefix', step < prefixSteps);
  stepStrip.append(marker);
}

function resetTranscript() {
  cancelAnimationFrame(replayFrame);
  terminal.removeAttribute('data-running');
  delete terminal.dataset.phase;
  command.textContent = commandText;
  cliOutput.textContent = '';
  decisionOutput.textContent = '';
  delete stepStrip.dataset.decision;
  stepSummary.textContent = '';
  replayOutcome.hidden = true;
  markSteps(0);
}

function markSteps(count) {
  for (const [index, marker] of [...stepStrip.children].entries()) {
    marker.classList.toggle('completed', index < count);
  }
}

function updateScore(animate = false) {
  resetTranscript();
  if (!threshold.validity.valid) {
    decisionOutput.textContent = 'Enter a threshold between 0 and 100.';
    return;
  }
  let features;
  try {
    features = JSON.parse(input.value);
  } catch {
    decisionOutput.textContent = 'Enter valid JSON.';
    return;
  }
  if (!features || typeof features !== 'object' || Array.isArray(features) ||
      Object.values(features).some(value => !Number.isFinite(value))) {
    decisionOutput.textContent = 'Enter a JSON object containing only finite numeric feature values.';
    return;
  }

  const healthScore = scoreFeatures(features);
  const cutoff = threshold.valueAsNumber;
  const abort = healthScore < cutoff;
  const transcript = JSON.stringify({ health_score: healthScore });
  function showResult() {
    terminal.removeAttribute('data-running');
    delete terminal.dataset.phase;
    command.textContent = commandText;
    cliOutput.textContent = transcript;
    decisionOutput.textContent = `${abort ? 'Abort' : 'Continue'} at threshold ${cutoff}`;
    stepStrip.dataset.decision = abort ? 'abort' : 'continue';
    markSteps(abort ? prefixSteps : totalSteps);
    stepSummary.textContent = abort
      ? `Aborted at step ${prefixSteps} · ${remainingSteps} steps skipped`
      : `Completed · ${totalSteps} of ${totalSteps} steps run`;
    if (animate) {
      replayAbort.hidden = !abort;
      replayImage.hidden = abort;
      replayOutcome.hidden = false;
    }
  }

  if (!animate || reducedMotion.matches) {
    showResult();
    return;
  }
  terminal.setAttribute('data-running', '');
  command.textContent = '';
  stepSummary.textContent = `Running steps 1–${prefixSteps}…`;
  const stepDuration = 70;
  const characterDuration = 12;
  const prefixDuration = prefixSteps * stepDuration;
  const promptDuration = (commandText.length - 2) * characterDuration;
  const start = performance.now();
  function replay(now) {
    const elapsed = now - start;
    const afterScoring = elapsed - prefixDuration - promptDuration;
    if (reducedMotion.matches || afterScoring >= (abort ? 0 : remainingSteps * stepDuration)) {
      showResult();
      return;
    }
    if (elapsed < prefixDuration) markSteps(Math.floor(elapsed / stepDuration));
    else if (afterScoring < 0) {
      markSteps(prefixSteps);
      terminal.dataset.phase = 'typing';
      command.textContent = commandText.slice(0, 2 + Math.floor((elapsed - prefixDuration) / characterDuration));
    } else {
      if (terminal.dataset.phase !== 'continuing') {
        terminal.dataset.phase = 'continuing';
        command.textContent = commandText;
        cliOutput.textContent = transcript;
        decisionOutput.textContent = `Continue at threshold ${cutoff}`;
        stepSummary.textContent = `Running steps ${prefixSteps + 1}–${totalSteps}…`;
      }
      markSteps(prefixSteps + Math.floor(afterScoring / stepDuration));
    }
    replayFrame = requestAnimationFrame(replay);
  }
  replayFrame = requestAnimationFrame(replay);
}

form.addEventListener('submit', event => {
  event.preventDefault();
  updateScore(true);
});
threshold.addEventListener('input', () => updateScore());
input.addEventListener('input', () => updateScore());

try {
  const response = await fetch('./examples.json');
  if (!response.ok) throw new Error('Examples unavailable');
  const examples = await response.json();
  for (const [index, { label }] of examples.entries()) example.add(new Option(label, index));
  function loadExample() {
    input.value = JSON.stringify(examples[example.value].features, null, 2);
    updateScore();
  }
  example.disabled = false;
  example.addEventListener('change', loadExample);
  loadExample();
} catch {
  form.querySelector('#feature-editor').open = true;
  decisionOutput.textContent = 'Examples could not load. Paste a feature object to score it.';
}
form.querySelector('button').disabled = false;
