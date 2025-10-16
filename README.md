# ☕ Café Website

A modern, full-stack café web application built with **React**, **Node.js**, **Express**, and **Sequelize (PostgreSQL)**.  
It allows customers to browse menus, place orders, and manage accounts, while admins can handle inventory, orders, and customer data — all from an elegant, responsive UI.

---

## 🚀 Features

### 🌐 Frontend (React + Tailwind)
- Beautiful, responsive café UI with modern design.
- Menu browsing with item details, prices, and images.
- Role-based login (User / Admin / SuperAdmin).
- Cart management with dynamic totals.
- Order placement and confirmation page.

### ⚙️ Backend (Node.js + Express)
- RESTful APIs for menu items, orders, and user authentication.
- Secure routes using JWT-based authentication.
- Sequelize ORM for database interactions.
- Error-handling and middleware support for cleaner code.

### 🗄️ Database (PostgreSQL)
- Sequelize models for users, menu items, and orders.
- Relationships between users and orders.
- Easy migrations and seeds.

---

## 🧱 Project Structure

cafe_website/
│
├── backend/
│ ├── api/
│ │ ├── routes/
│ │ ├── controllers/
│ │ └── models/
│ ├── config/
│ ├── server.js
│ └── .env
│
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ ├── hooks/
│ │ └── App.jsx
│ └── package.json
│
└── README.md


---

## 🧩 Tech Stack

| Layer        | Technology Used |
|---------------|----------------|
| Frontend UI   | React.js, Tailwind CSS, Axios |
| Backend API   | Node.js, Express.js |
| Database ORM  | Sequelize |
| Database      | PostgreSQL |
| Auth & Tokens | JWT |
| Package Mgmt  | npm / yarn |

---

## ⚡ Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/<your-username>/cafe_website.git
cd cafe_website


cd backend
npm install


cd ../frontend
npm install
npm run dev



🧠 Future Enhancements

Online payment integration (Stripe / Razorpay)

Admin analytics dashboard

Email & SMS order notifications

Mobile-friendly PWA support
