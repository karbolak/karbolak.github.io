# Wildfire Policy Explorer

This static viewer replays 45 held-out episodes from the Wildfire Intervention course project’s full-network evaluation. The bundle covers three spread probabilities, three seeds and five policies. The wider evaluation used 100 held-out seeds per spread setting and three GRU replicates. The viewer shows replicate 0 and individual episodes. The selected episodes illustrate the control problem and do not establish a general policy ranking.

The simulator, evaluated policies and original viewer come from the Wildfire Intervention course project by Beatrice Ursan-Rácz, Iulia Bugan, Katya Toncheva and Kajetan Karbowski. The sampled planner draws on Johan Peralez, Aurélien Delage, Jacopo Castellini, Rafael F. Cunha and Jilles S. Dibangoye, *Optimally Solving Simultaneous-Move Dec-POMDPs: The Sequential Central Planning Approach*, AAAI 2025. [Paper](https://doi.org/10.1609/aaai.v39i22.34494)

Redistribution clearance covers this adapted viewer and its replay bundle. The original research repository, model and policy artifacts, reports and raw inputs are outside that clearance. The paper citation provides scholarly credit.

Serve this directory over HTTP. Replay assets use relative paths and the viewer fetches only the selected episodes. See the [portfolio README](../../README.md) for the local preview command.
