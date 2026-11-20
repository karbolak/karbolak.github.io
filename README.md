# Kajetan Karbowski’s portfolio

To preview the site locally, run this from the repository root:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open [localhost:8000](http://localhost:8000). The site uses plain HTML, CSS, and JavaScript without a build step.

- `index.html` contains the site shell, navigation, controls, and Home introduction.
- `portfolio.css` contains the responsive layout and cream and gray themes, with a muted rust accent.
- `portfolio.js` contains the entries, page and perspective state, search, and transitions.
- `portfolio-content.js` contains the editable profile, projects, education, experience, and skills used by both designs.
- `fonts/` contains the locally served IBM Plex Sans and IBM Plex Mono files and their license.

Click the command bar to search, or press `Ctrl+K` / `Cmd+K` to toggle search. Use the arrow keys to select a result, Enter to open it, and Escape to close the panel. **Explorer** or `E` opens the project directory or the current page’s section index.

The bar also accepts `cd projects`, `cd experience`, `cd education`, `cd contact`, `open psag`, `view ai`, `view software`, `view education`, `view general`, and `help`. Click a project tag or use `filter --tag python` to filter. Use the active filter chip or `filter --clear` to clear it.

Use the current address to share a page, project, perspective, or project filter. For example, `?section=projects&role=teaching` opens Projects with the teaching perspective, and `?section=projects&project=psag` opens the sample project.

Home uses the supplied WebP portrait with a JPEG fallback. The original PNG is retained in `assets/`. Project screenshots and PSAG Platform implementation details are pending, as are the CV file and email address.

## Portfolio interface

The default portfolio uses JetBrains Mono at 400 for prose and 550 for headings. The grey theme uses `#70736F` behind the `#626662` document, with `#686D68` raised surfaces and `#F6F4ED` text. **Design options** at the bottom lets you compare Mono, Mixed, and Reading typography. The choice is remembered locally. Add `?type=mixed` or `?type=reading` to share a variation. Older Classic links with `?design=classic` still work.

Click **? Help** or press `?` to toggle the guide to navigation, perspectives, and shortcuts. The command bar uses `~` as the portfolio root. The `$` prompt types for 600–880 ms, holds for 600 ms or 750 ms for SQL, and fades to idle in 180 ms. Input interrupts the effect and reduced motion skips it. **E** opens the contextual Explorer and **Esc** closes it. Explorer opens as a drawer on narrow screens.

Listings support optional `pinned`, `date`, `start`, `end`, and `ongoing` fields in `portfolio-content.js`. Use ISO values such as `YYYY` or `YYYY-MM-DD`. An optional `date_label` preserves the wording of dates supplied in the CV. The BSc entry uses the confirmed 8.4/10 final grade. The `contact` record in `portfolio.js` can hold an approved email address, a LinkedIn URL and CV records with a `title`, `url` and optional `role`.

The pre-experiment checkout is saved on `portfolio-classic` at `04cc152`. To run that exact version alongside this branch without moving your current changes, use `git worktree add --detach ../portfolio-classic portfolio-classic` and start a local server in the new checkout on a different port.

The document-local links draw on [Acme](https://9p.io/sys/doc/acme/acme.html), [Oberon](https://people.inf.ethz.ch/wirth/ProjectOberon/index.html), and [HyperCard](https://vintageapple.org/macmanuals/pdf/HyperCard_Users_Guide_1987.pdf). The contextual pane and status strip take cues from [Smalltalk-80](https://vtda.org/books/Computing/Programming/Smalltalk-80_GoldbergRobson.pdf), [NeXTSTEP](https://www.typewritten.org/Manual/NeXT/NEXTSTEP/3.3/man1/AppInspector.html), and [Turbo Vision](https://bitsavers.org/pdf/borland/turbo_pascal/Turbo_Pascal_Version_6.0_Turbo_Vision_1990.pdf). Search and file previews build on patterns from [fzf](https://github.com/junegunn/fzf) and [Yazi](https://yazi-rs.github.io/docs/quick-start/).
