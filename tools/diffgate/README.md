# DiffGate score demo

The static demo ports the default training-free score from [DiffGate’s health scorer](https://github.com/karbolak/DiffGate/blob/9f72f52b3d64da874c83702c832cd27844edfc64/src/diffgate/health.py). It accepts small JSON objects of finite numeric features and uses the original weights, bounded transform and score scaling. Its threshold comparison follows [DiffGate’s fixed abort policy](https://github.com/karbolak/DiffGate/blob/9f72f52b3d64da874c83702c832cd27844edfc64/src/diffgate/abort.py). It runs locally in the browser and does not load model weights. Feature extraction, custom calibration, supervised scoring and generation remain in the CLI.

The first example comes from the upstream health test. The other fixtures illustrate a stronger penalty and unknown-feature handling. These are scorer inputs for demonstration, with no claim about observed image quality. The `cli` values in [examples.json](examples.json) came from the Python CLI.

The walkthrough uses the thesis defence’s five-of-25 denoising checkpoint. The starting threshold of 50 separates the first two fixtures for demonstration. The preview recalculates whenever the example, threshold or features change. Replay types the CLI command at the checkpoint and stops there on an abort, or fills the remaining steps on a continue. The case study uses the defence plots for global prediction and the matched offline abort comparison.

The walkthrough borrows its prompt and illustrative completion image from the thesis defence. The feature fixtures are independent of that image. A replay reveals it only after all 25 steps complete.

## Recheck or regenerate fixtures

Install the pinned DiffGate revision according to its [README](https://github.com/karbolak/DiffGate/tree/9f72f52b3d64da874c83702c832cd27844edfc64). For each example, save its `features` object as `features.json`, run `diffgate score-features --features features.json`, and copy the returned object into its `cli` field. Keep the case study’s first example in sync. Run `node --test tools/diffgate/score.test.mjs` from the portfolio root and check the demo via the local HTTP preview.

The scorer port retains the upstream [MIT licence](LICENSE).
