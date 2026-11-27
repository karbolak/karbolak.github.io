# Kajetan Karbowski — Portfolio

**[Visit the live portfolio](https://karbolak.github.io/)**

I study Artificial Intelligence at the University of Groningen. This portfolio documents my work in AI research, scientific computing, software engineering and education, including my ASTRON research internship through the University of Groningen’s HTSM Honours Master.

[General](https://karbolak.github.io/) · [AI & ML](https://karbolak.github.io/?role=ai-ml) · [Research](https://karbolak.github.io/?role=research) · [Software Engineering](https://karbolak.github.io/?role=engineering) · [Education](https://karbolak.github.io/?role=teaching)

- **Projects** collects case studies with shareable URLs and links to public evidence where available. **Experience** and **Education** cover research, teaching, leadership and academic credentials.
- **Tools & Products** includes the DiffGate CLI and browser scoring demo, the static Wildfire Policy Explorer and the Association Management Platform (AMP), an independent product whose first production deployment is for the Polish Student Association Groningen.
- **Contact** includes professional links and all five PDF CVs. Home and Contact offer direct viewing and download for the active perspective. Contact lists the remaining versions under **Other CVs**.

The selected perspective prioritises relevant work across the site. Search and Explorer provide keyboard navigation. The interface is responsive and has light and dark themes.

## Local preview

Run from the repository root, then open [localhost:8000](http://localhost:8000/).

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

The site uses HTML, CSS and vanilla JavaScript with locally served fonts. It runs without a build step or backend.

## Maintenance

- Edit canonical project, tool, experience and education records in [portfolio-content.js](portfolio-content.js). Keep existing IDs stable for shared links. AMP uses the [canonical project URL](https://karbolak.github.io/?section=projects&project=amp) and the `#tool-amp` anchor. The old project IDs, tool anchor, terminal paths and preview filename still resolve. [portfolio.js](portfolio.js) handles rendering, routing and perspective state.
- Replace the five public PDFs in [assets/cv/](assets/cv/) using the filenames in the `cvFiles` mapping in `portfolio.js`.
- The [DiffGate score demo](tools/diffgate/) runs without a backend. Its [verification and fixture instructions](tools/diffgate/README.md) describe the supported CLI subset.
- Project figures live in [assets/research/](assets/research/). Case-study captions link to source assets or data where available. The wildfire figure comes from the bundled reactive replay for seed 50000 at spread 0.30, sensor 5, frame 7.
- Update [tools/wildfire/](tools/wildfire/) with the cleared static viewer and replay catalogue. Keep its URLs relative, retain attribution and test a direct visit and the portfolio return link over HTTP.
- GitHub Pages serves the root of the `portfolio-preview` branch. When synchronising the default branch, merge the reviewed portfolio history into `main` and keep the current tree and relative README links. Check the live site, PDF actions and both tools after a deployment.
