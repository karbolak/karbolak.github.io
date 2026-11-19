# Kajetan Karbowski’s portfolio

To preview the site locally, run this from the repository root:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open [localhost:8000](http://localhost:8000). The site uses plain HTML, CSS, and JavaScript without a build step.

- `index.html` contains the site shell, navigation, controls, and Home introduction.
- `portfolio.css` contains the responsive layout and cream and gray themes, with a muted rust accent.
- `portfolio.js` contains the entries, page and perspective state, search, and transitions.
- `fonts/` contains the locally served IBM Plex Sans and IBM Plex Mono files and their license.

Click the command bar or press `Ctrl+K` / `Cmd+K` to search. Use the arrow keys to select a result, Enter to open it, and Escape to close the panel. **Outline** or `E` opens the project directory or the current page’s section index.

The bar also accepts `cd projects`, `cd experience`, `cd education`, `cd contact`, `open psag`, `view ai`, `view software`, `view education`, `view general`, and `help`. Click a project tag or use `filter --tag python` to filter. Use the active filter chip or `filter --clear` to clear it.

Use the current address to share a page, project, perspective, or project filter. For example, `?section=projects&role=teaching` opens Projects with the teaching perspective, and `?section=projects&project=psag` opens the sample project.

The portrait, screenshots, PSAG details, and contact address are placeholders. The CV and LinkedIn placements indicate that their links are pending.
