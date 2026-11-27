# Kajetan Karbowski — Portfolio

**[Visit the live portfolio](https://karbolak.github.io/)**

I study Artificial Intelligence at the University of Groningen. This portfolio documents my work in AI research, scientific computing, software engineering and education, including my ASTRON research internship through the University of Groningen’s HTSM Honours Master.

[General](https://karbolak.github.io/) · [AI & ML](https://karbolak.github.io/?role=ai-ml) · [Research](https://karbolak.github.io/?role=research) · [Software Engineering](https://karbolak.github.io/?role=engineering) · [Education](https://karbolak.github.io/?role=teaching)

- **Projects** collects case studies with shareable URLs and links to public evidence where available. **Experience** and **Education** cover research, teaching, leadership and academic credentials.
- **Tools & Products** includes DiffGate, the static Wildfire Policy Explorer and the Association Management Platform, an independent product whose first production deployment is for the Polish Student Association Groningen.
- **Contact** includes professional links and all five PDF CVs. Home and Contact highlight the CV for the active perspective.

The selected perspective prioritises relevant work across the site. Search and Explorer provide keyboard navigation. The interface is responsive and has light and dark themes.

## Local preview

Switch to the `portfolio-preview` branch and run from the repository root, then open [localhost:8000](http://localhost:8000/).

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

The site uses HTML, CSS and vanilla JavaScript with locally served fonts. It runs without a build step or backend.

## Maintenance

- Edit canonical project, tool, experience and education records in [portfolio-content.js](https://github.com/karbolak/karbolak.github.io/blob/portfolio-preview/portfolio-content.js). Keep existing IDs stable for shared links. [portfolio.js](https://github.com/karbolak/karbolak.github.io/blob/portfolio-preview/portfolio.js) handles rendering, routing and perspective state.
- Replace the five public PDFs in [assets/cv/](https://github.com/karbolak/karbolak.github.io/tree/portfolio-preview/assets/cv/) using the filenames in the `cvFiles` mapping in `portfolio.js`.
- Update [tools/wildfire/](https://github.com/karbolak/karbolak.github.io/tree/portfolio-preview/tools/wildfire/) with the cleared static viewer and replay catalogue. Keep its URLs relative, retain attribution and test a direct visit and the portfolio return link over HTTP.
- GitHub Pages serves the root of the `portfolio-preview` branch. After publishing there, check the site, CV downloads and [Wildfire Policy Explorer](https://karbolak.github.io/tools/wildfire/).
