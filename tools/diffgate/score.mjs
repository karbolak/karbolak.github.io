// Default uncalibrated scorer ported from DiffGate (MIT), src/diffgate/health.py.
const signalWeights = {
  latent_volatility_rms: 0.30,
  latent_update_cosine: 0.20,
  denoiser_pred_delta_rms: 0.15,
  denoiser_pred_cosine_prev: 0.20,
  denoising_update_pred_cosine: 0.35,
  cfg_alignment_cosine: 0.20,
  cfg_divergence_rms: 0.10,
  guided_minus_cond_rms: 0.05,
  latent_rms: -0.15,
  cfg_divergence_relative: -0.20,
  denoising_consistency_residual: -0.40,
};
const summaryWeights = { mean: 1, last: 0.75, slope: 0.50, max: 0.25, std: 0.25 };

export function scoreFeatures(features) {
  let rawScore = 0;
  for (const [feature, value] of Object.entries(features)) {
    const [, signal, summary] = feature.match(/^(.*)_(mean|max|std|slope|last)$/) ?? ['', feature, 'mean'];
    if (Object.hasOwn(signalWeights, signal) && Number.isFinite(value)) {
      rawScore += signalWeights[signal] * summaryWeights[summary] * Math.tanh(value);
    }
  }
  return 100 / (1 + Math.exp(-rawScore));
}
