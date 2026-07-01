# Deploy internet

GitHub Pages chi host frontend tinh. De website co day du data, can them backend + MongoDB online.

## 1. MongoDB Atlas

Tao MongoDB Atlas cluster mien phi, tao database user, cho phep Network Access `0.0.0.0/0`, roi copy connection string:

```txt
mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/gplx_db?retryWrites=true&w=majority
```

## 2. Render backend

Repo da co `render.yaml`. Tren Render, tao Blueprint/Web Service tu repo nay. Render se chay backend trong thu muc `backend`.

Bien moi truong can co:

```env
NODE_ENV=production
MONGO_URI=mongodb+srv://...
CLIENT_URL=https://danhhehehe.github.io
ADMIN_API_KEY=mot-chuoi-bi-mat
```

Sau khi backend live, kiem tra:

```txt
https://YOUR_RENDER_SERVICE.onrender.com/health
```

## 3. Seed data

Trong Render Shell cua service backend, chay:

```bash
npm run seed:all
```

## 4. Noi GitHub Pages voi backend

Trong GitHub repo, vao `Settings` -> `Secrets and variables` -> `Actions` -> `Variables`, them:

```txt
VITE_API_URL=https://YOUR_RENDER_SERVICE.onrender.com/api
```

Sau do push lai `main` hoac bam chay workflow `Deploy GitHub Pages`. Workflow se build frontend va day ban tinh vao nhanh `gh-pages`.
