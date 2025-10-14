Background Remover Project (Demo)
=================================

This project is a minimal, ready-to-run skeleton for an image background remover web app.
It includes:
- Backend (Node.js + Express + MongoDB)
  - User auth (register/login)
  - Trial tracking (5 free uses)
  - Mock payment flow and mock Telebirr callback to simulate 1-day access
  - Remove-bg endpoint (mock - you should replace with real API e.g., remove.bg)
- Frontend (React simple UI)
  - Login/Register, Upload, Mock Payment redirect

How to run
----------
1. Backend:
   - cd backend
   - copy .env.example to .env and fill values (MONGO_URI, JWT_SECRET)
   - npm install
   - npm run dev (or npm start)

2. Frontend:
   - cd frontend
   - npm install
   - npm start

Replace mock payment:
---------------------
- After Telebirr merchant approval, replace the /api/pay route to call Telebirr.
- Handle Telebirr callback at /api/pay/callback and update the user: set isPaid=true and accessExpiresAt = now + 24h.

Notes:
- The remove-bg endpoint currently returns a copied file as "processed". Integrate real background removal API in routes/api.js where noted.
- Secure your production environment: HTTPS, strong JWT secret, rate-limits, input validation.

Need help deploying or integrating Telebirr? Ask me and I will guide you step-by-step.
