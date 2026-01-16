Manifold Map Generator - GitHub Setup Guide

This guide will help you move the code from the Canvas into a professional GitHub repository.

1. Project Structure

Your repository should look like this:

manifold-generator/
├── public/
│   └── favicon.svg
├── src/
│   ├── App.jsx          <-- Copy the Canvas code here
│   ├── index.css        <-- Tailwind directives
│   └── main.jsx         <-- React entry point
├── .gitignore
├── index.html
├── package.json
├── README.md
└── vite.config.js


2. Local Setup Instructions

Initialize the Project:
Open your terminal and run:

npm create vite@latest manifold-generator -- --template react
cd manifold-generator


Install Dependencies:
You need Three.js for the 3D view and Lucide for the icons.

npm install three lucide-react


Install Tailwind CSS:
The code uses Tailwind classes for the UI.

npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p


Edit tailwind.config.js to include the src paths:

content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],


Add the CSS:
In src/index.css, add:

@tailwind base;
@tailwind components;
@tailwind utilities;


Copy the Code:
Replace the contents of src/App.jsx with the code from the Canvas.

Run Locally:

npm run dev


3. Recommended README.md

Copy this into your README.md to make your repository look great:

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
