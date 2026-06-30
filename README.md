# 🎧 Audiophile — TypeScript MERN Stack E-Commerce

A full-stack e-commerce application for premium audio equipment, rebuilt from JavaScript to **TypeScript** using the MERN stack (MongoDB, Express, React, Node.js).

---

## 📁 Project Structure

```
audiophile-ts/
├── client/          ← React + TypeScript frontend (Vite + Tailwind)
└── server/          ← Express + TypeScript backend (Node.js)
```

---

## ✨ Features

### Store

- 🎧 Browse headphones, speakers, and earphones
- 🛒 Shopping cart with quantity controls (persisted in localStorage)
- 📦 Checkout with form validation
- 💳 e-Money and Cash on Delivery payment options
- ✅ Order confirmation modal after purchase

### Authentication

- 🔐 JWT-based auth (30-day tokens)
- 📝 Register / Sign In pages
- 👤 Navbar dynamically shows user avatar when logged in
- 🚪 Protected routes for logged-in users only

### User Features (logged-in)

- ⚙️ Profile settings — update name, phone, address, password
- 🖼️ Upload profile avatar (Cloudinary)
- 📦 Order history — view all past orders with status

### Admin Dashboard (admin users only)

- 📊 Dashboard with stats: total orders, revenue, users, pending orders
- 📈 Monthly revenue bar chart
- 📋 Recent orders table
- 🏷️ Product management — create, edit, delete products, upload images
- 📬 Order management — view all orders, update order status
- 👥 User management — view all users, grant/revoke admin, delete users

### Technical

- 🔄 Lazy-loaded pages for fast initial load
- ☁️ Cloudinary for all image storage (avatars + product images)
- 🎨 Custom 404 page (shown by Vercel instead of their default)
- 📱 Fully responsive: mobile, tablet (768px), desktop (1024px+)
- 1366px and 1440px screens look identical
- 🔔 Toast notifications for all user actions

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB Atlas cluster
- A Cloudinary account (free tier works)

---

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd audiophile-ts
```

---

### 2. Set up the Server

```bash
cd server
npm install
```

Create your `.env` file:

```bash
cp .env.example .env
```

Fill in your values in `.env`:

```env
MONGO_URI=mongodb+srv://USER:PASS@cluster.mongodb.net/audiophile
JWT_SECRET=a-very-long-random-secret-string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
ALLOWED_ORIGINS=http://localhost:5173
PORT=5000
NODE_ENV=development
```

Seed the database with products and an admin user:

```bash
npm run seed
```

This creates:

- 6 products (3 headphones, 2 speakers, 1 earphone)
- Admin user: `admin@audiophile.com` / `admin123`

Start the dev server:

```bash
npm run dev
```

Server runs at: `http://localhost:5000`

---

### 3. Set up the Client

```bash
cd ../client
npm install
```

Create your `.env` file:

```bash
cp .env.example .env
```

```env
VITE_API_URL=http://localhost:5000/api
```

Start the dev server:

```bash
npm run dev
```

Client runs at: `http://localhost:5173`

---

## 🌐 Deployment

### Deploy Server to Render

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your repo → select the `server` folder
4. Set:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
5. Add all environment variables from `.env.example`
6. Deploy!

### Deploy Client to Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Connect your repo → set **Root Directory** to `client`
3. Add environment variable:
   - `VITE_API_URL` = your Render server URL + `/api`
4. Add your Vercel URL to the server's `ALLOWED_ORIGINS`
5. Deploy!

> **Custom 404:** The `vercel.json` file ensures your custom `NotFoundPage` shows instead of Vercel's default 404.

---

## 👑 Accessing the Admin Dashboard

1. Log in with: `admin@audiophile.com` / `admin123`
2. Click your avatar in the navbar → **Admin Dashboard**
3. Or navigate directly to `/admin`

To make any user an admin:

- Log into the admin dashboard
- Go to **Users** tab
- Click **Make Admin** next to the user

---

## 🔑 Access Control Summary

| Feature            | Guest | Registered User              | Admin |
| ------------------ | ----- | ---------------------------- | ----- |
| Browse products    | ✅    | ✅                           | ✅    |
| Add to cart        | ✅    | ✅                           | ✅    |
| Checkout           | ✅    | ✅ (order linked to account) | ✅    |
| View order history | ❌    | ✅                           | ✅    |
| Profile settings   | ❌    | ✅                           | ✅    |
| Upload avatar      | ❌    | ✅                           | ✅    |
| Admin dashboard    | ❌    | ❌                           | ✅    |
| Manage products    | ❌    | ❌                           | ✅    |
| Manage orders      | ❌    | ❌                           | ✅    |
| Manage users       | ❌    | ❌                           | ✅    |

---

## 🏗️ Tech Stack

**Frontend:**

- React 18 + TypeScript
- React Router v6 (with lazy loading)
- Tailwind CSS v3
- Axios (with JWT interceptor)
- React Hot Toast
- React Icons

**Backend:**

- Node.js + Express + TypeScript
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- bcryptjs (password hashing)
- Multer (file upload middleware)
- Cloudinary (image storage)
- CORS, dotenv

---

## 📝 Code Style

Every TypeScript-specific line in this project has an inline comment explaining **why** it's written that way — making it ideal for students learning TypeScript for the first time.

Look for comments like:

```ts
// TypeScript type guard — narrows the type from (Product | undefined)[] to Product[]
.filter((p): p is Product => p !== undefined)
```
