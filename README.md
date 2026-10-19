# Muhammad Zain-ul-Abideen · AI Engineer

A professional portfolio: a paper-white editorial site with my live projects,
experience and stack, plus **My Academy**, six short browser games that teach
how production AI works (each one built from a real project of mine).

Plain HTML, CSS and JavaScript modules. No build step, no dependencies.

## Run it locally

    uv run python -m http.server 8000     # then open http://localhost:8000

## Where things live

    index.html          page structure
    css/site.css        the site's look (paper, ink, serif headlines)
    css/academy.css     the games' look (kept from the arena portfolio)
    js/data.js          ALL the text: projects, experience, stack, certs, beyond-the-code
    js/site.js          boot sequence, live portrait, stacking project cards, accordion
    js/academy/         My Academy: chooser + six games
    assets/video/       the My Academy demo clip (webm + mp4) and its poster
    assets/projects/    screenshots of each live project
    tests/              logic tests for the games:  node tests/academy.test.mjs

To change any wording, edit `js/data.js`. To swap a project screenshot, replace
the file in `assets/projects/` with the same name (16:10 works best).

The 3D Rocket League version of this portfolio: https://m-zain-ul-abideen-portfolio.vercel.app/
