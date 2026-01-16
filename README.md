# 🗺️ Manifold Map Generator

A procedural map generator that creates 2D hinged nets and folds them into 3D manifolds using port-based alignment logic.

## ✨ Features
- **Procedural Generation**: Uses a seeded PRNG (Mulberry32) for reproducible results.
- **Port-Based Alignment**: Shapes connect LEGO-style via boundary ports, ensuring no overlaps and perfect connectivity.
- **Bi-Directional Folding**: Uses a BFS hinge-tree and Three.js to fold the 2D map into a 3D object (both intrinsic and extrinsic folding).
- **Responsive UI**: Adjust piece counts (2-10) and seeds in real-time.

## 🛠️ Tech Stack
- **React**: UI State and component logic.
- **Three.js**: 3D rendering and articulation.
- **Tailwind CSS**: Modern, responsive styling.
- **Lucide React**: Iconography.

## 🚀 Deployment
This project is ready to be hosted on **Vercel**, **Netlify**, or **GitHub Pages**. Simply connect your repo to Vercel and it will auto-deploy.


4. Pushing to GitHub

git init
git add .
git commit -m "Initial commit: Manifold Generator"
git branch -M main
git remote add origin [https://github.com/YOUR_USERNAME/manifold-generator.git](https://github.com/YOUR_USERNAME/manifold-generator.git)
git push -u origin main
