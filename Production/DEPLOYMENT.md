# 🚀 Deployment Guide

## 1. Netlify Deployment
**Folder:** `dist_netlify/`

This folder is built for root-level deployment (e.g., `https://your-site.netlify.app/`).

- **Deploy manually:** Drag and drop the `dist_netlify` folder into the Netlify dashboard.
- **Deploy via CLI:** `netlify deploy --dir=dist_netlify --prod`

## 2. GitHub Pages Deployment
**Folder:** `dist_github/`

This folder is built for repository-level deployment (e.g., `https://user.github.io/bicepcurls-IDE/`).

- **Deploy command:**
  ```bash
  npx gh-pages -d dist_github
  ```
  *(Note: The default `npm run deploy` script uses the `out` folder, which is overwritten by each build. Using the specific folder is safer.)*

## 3. GitHub Staging (Source Code)

If you meant pushing the source code to a staging branch:
```bash
git checkout -b staging
git push origin staging
```

---

## Build Commands Used
I generated these folders using:
- **Netlify**: `DEPLOY_TARGET=netlify npm run build` -> `dist_netlify`
- **GitHub**: `DEPLOY_TARGET=github npm run build` -> `dist_github`

*To rebuild locally, you can use these environment variables.*
