# Kajetan Karbowski’s portfolio

To preview the site locally, run this from the repository root:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open [localhost:8000](http://localhost:8000). The site uses plain HTML, CSS, and JavaScript without a build step.

- `index.html` contains the site shell, navigation, controls, and Home introduction.
- `portfolio.css` contains the responsive layout and cream and gray themes, with a muted rust accent.
- `portfolio.js` contains the entries, page and perspective state, search, and transitions.
- `portfolio-content.js` contains the editable profile, projects, tools, education, experience, and skills.
- `psag-demo.html` is the PSAG walkthrough preview. The Tools card also links to the live association website.
- `fonts/` contains the locally served IBM Plex Sans and IBM Plex Mono files and their license.

Click the command bar to search. The **Ctrl / ⌘ K** button and the `Ctrl+K` / `Cmd+K` shortcuts toggle search. Use the arrow keys to select a result, Enter to open it, and Escape to close the panel. The **Ctrl / ⌘ E** button and the `Ctrl+E` / `Cmd+E` shortcuts toggle Explorer. Use `Ctrl+1–6` or `Cmd+1–6` to select a portfolio tab. If the browser handles those keys, use `Ctrl+Shift+1–6`.

The bar also accepts `cd tools`, `cd projects`, `cd experience`, `cd education`, `cd contact`, `open psag`, `open tools/diffgate`, `view ai-ml`, `view research`, `view software`, `view education`, `view general`, and `help`. The legacy `cd skills` command opens Tools, and `view ai` still selects Research. Click a skill or project tag, or use `filter --tag python`, to show all matching projects. The command bar displays the query in SQL syntax while the browser filters the static portfolio data. Use the active filter chip or `filter --clear` to clear it.

Use the current address to share a page, project, perspective, or project filter. `?section=projects&role=ai-ml` opens AI & ML projects, `?section=projects&role=teaching` opens Education-related projects, and `?section=projects&project=psag` opens the PSAG Platform project.

Home uses the supplied WebP portrait with a JPEG fallback. The original PNG is retained in `assets/`.

## Portfolio interface

CV Abstract is the default homepage. IBM Plex Sans is used for reading content. JetBrains Mono is used for page headings, tabs, Perspective, Explorer, Copy email, and the command bar. The alternate theme uses silver panels, a muted teal backdrop, and a navy active tab.

The portrait uses the site palette in both themes. Dotted terms with a preview icon open inline previews. Links marked ↗ go to external websites.

Home highlights up to three projects, selected roles, and key skills for the current perspective. Project titles open case studies. On the Experience and Education listings, select a title to expand or collapse its details. At a glance is rendered in HTML so the summary is readable without JavaScript. **CV details & Contact** opens the contact page. The Phone disclosure directs readers to the configured CV download.

In Projects, Experience, and Education, the selected perspective shows relevant entries first and collapses the rest at the bottom. Search can still open individual archive entries. Projects use canonical records with optional case study sections, results tables and public source links. Tools keeps every card visible and changes the order.

Click **? Help** or press `?` to toggle the guide to navigation, perspectives, and shortcuts. The command bar uses `~` as the portfolio root. The `$` prompt types for 600–880 ms, holds for 600 ms or 750 ms for SQL, and fades to idle in 180 ms. Input interrupts the effect and reduced motion skips it. **Esc** closes Explorer, which opens as a drawer on narrow screens.

Listings support optional `pinned`, `date`, `start`, `end`, and `ongoing` fields in `portfolio-content.js`. Use ISO values such as `YYYY` or `YYYY-MM-DD`. An optional `date_label` preserves the wording of dates supplied in the CV. The BSc entry uses the confirmed 8.4/10 final grade. The `contact` record in `portfolio.js` can hold an approved email address, a LinkedIn URL and CV records with a `title`, `url` and optional `role`.

The Current baseline is tagged `portfolio-before-cv-abstract` at `bd34584`. To open that exact interface without modifying this checkout, run `git worktree add --detach ../portfolio-current portfolio-before-cv-abstract` and start a server in that worktree on a different port. The earlier pre-workstation checkout remains on `portfolio-classic` at `04cc152`.

## Tools & Products

Tools is an action-oriented catalogue. Projects contains the research or engineering case studies. Open `?section=tools`, or link to a card with a fragment such as `?section=tools&role=research#tool-diffgate`. Tools appears in search and the Explorer. Legacy `?section=skills` links resolve to Tools, and skill links open the Technical skills disclosure at the bottom.

Add an entry to `tools` in `portfolio-content.js`. Give it a unique URL-safe `id`, a `title`, a short `description`, a `category`, a `status`, a `technologies` array and a numeric `priority`. Search indexes the title, category, description and technologies. A `primaryAction` or any entry in `secondaryActions` uses `{ label, url }`. Use the highlighted primary action for a demo or live product and put repository links in the secondary actions. Set `localOnly: true` for loopback previews or `available: false` to hide an action. An optional `preview` uses `{ src, alt }` for a cleared image, and an optional `example` uses `{ label, description, command }` for a documented CLI example.

Set `project` to the ID of the canonical entry in `projects`. This adds links in both directions. Use `projectLabel` to customise the card’s link. Higher `priority` values appear first. Optional values in `perspectives` override that tool’s priority for `ai-ml`, `research`, `engineering` or `teaching`. The default priority breaks ties and applies to General and perspectives without overrides.

### Standalone demonstrations

Place a cleared static export in `tools/<id>/`. Keep its asset and data URLs relative and use a trailing slash in the action URL, such as `./tools/<id>/`. Include a relative return link to the relevant card, following the pattern `../../?section=tools#tool-<id>`. Preview over HTTP and test the deep URL, data loading, mobile layout and return link before enabling the action.

The Wildfire Policy Explorer is integrated locally under the Git-ignored `tools/wildfire/` directory. Open [the local explorer](http://localhost:8000/tools/wildfire/) while running the preview server. The copy contains the standalone HTML, CSS, JavaScript and replay data. Its attribution credits the Wildfire Intervention course project and the planning paper. Each replay illustrates an individual simulation episode from a wider evaluation. [Peralez et al., AAAI 2025](https://doi.org/10.1609/aaai.v39i22.34494)

The **Launch demo** button is enabled on loopback previews. For public release, review the files covered by the redistribution clearance, remove the `/tools/wildfire/` ignore rule, and publish the cleared bundle with its attribution. Verify the deployed explorer at `/tools/wildfire/` before removing `localOnly: true` and the public-launch notice.

The PSAG card opens the in-progress walkthrough first. The live association site is the secondary action. Before replacing the preview with the completed demonstration, verify that the walkthrough and administrative features use the isolated environment.

The document-local links draw on [Acme](https://9p.io/sys/doc/acme/acme.html), [Oberon](https://people.inf.ethz.ch/wirth/ProjectOberon/index.html), and [HyperCard](https://vintageapple.org/macmanuals/pdf/HyperCard_Users_Guide_1987.pdf). The contextual pane and status strip take cues from [Smalltalk-80](https://vtda.org/books/Computing/Programming/Smalltalk-80_GoldbergRobson.pdf), [NeXTSTEP](https://www.typewritten.org/Manual/NeXT/NEXTSTEP/3.3/man1/AppInspector.html), and [Turbo Vision](https://bitsavers.org/pdf/borland/turbo_pascal/Turbo_Pascal_Version_6.0_Turbo_Vision_1990.pdf). Search and file previews build on patterns from [fzf](https://github.com/junegunn/fzf) and [Yazi](https://yazi-rs.github.io/docs/quick-start/).
