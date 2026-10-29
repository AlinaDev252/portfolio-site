# Portfolio

Personal portfolio of Alina Goiea, built with Astro, Tailwind CSS and Vue.

## Run it

Needs Node 22.23.4 or newer (see `.nvmrc`).

```sh
npm install
npm run dev
```

`npm run build` writes the static site to `dist/`. Pushing to `main` deploys to GitHub Pages through `.github/workflows/deploy.yml`.

## Add a project

1. Put the images in `src/assets/work/<slug>/`: a `cover`, plus a desktop and a mobile shot for each gallery slide.
2. Copy one of the files in `src/content/work/` to `<slug>.md` and update the frontmatter and text.
3. Set `placeholder: false` once the real screenshots and copy are in. Use `draft: true` to hide a project.

Projects are sorted by `order`.

## Replace the hero image

Swap `src/assets/hero.png` for your photo or a work image (portrait, about 4:5), update the import in `src/data/site.ts` if the file name changes, and add a short `alt` text there.
