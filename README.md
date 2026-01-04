# Event Organizer Platform

A full-scale **Online Event Management Platform** inspired by **Townscript**, built for scalability from **MVP to enterprise level**. The platform enables users to discover, book, and attend events, while empowering organizers to create, manage, and monetize events efficiently.

---

## 🚀 Tech Stack

### Frontend

* React.js
* Tailwind CSS
* React Router
* Context API / Zustand
* Axios

### Backend

* FastAPI (Python)
* MongoDB (Mongoose / Motor)
* JWT Authentication
* Background Jobs (Celery / APScheduler)

### Integrations

* Razorpay / Stripe / PayPal
* Google Maps
* SendGrid / SES (Email)
* SMS & WhatsApp APIs
* Zoom / Google Meet

---

## 👥 User Roles

* Guest
* Attendee / Customer
* Event Organizer
* Admin / Super Admin
* Support / Operations Team (optional)

---

## 🌍 Core Features

### Public / Guest

* Browse & search events
* Filter by location, date, category, price
* Event detail pages
* Organizer preview
* Social sharing
* Sign up / login

### Attendee

* Profile & account management
* Personalized event discovery
* Ticket booking & secure checkout
* Multiple payment options
* E-tickets with QR codes
* Booking history & refunds
* Reviews & ratings

### Event Organizer

* Organizer verification & KYC
* Event creation & publishing
* Ticket & pricing management
* Attendee management
* Sales & revenue analytics
* Marketing tools
* Check-in & access control

### Admin Panel

* User & organizer management
* Event moderation
* Payments & commission handling
* Platform configuration
* Analytics & reports
* Support & dispute resolution

---

## 🔐 Security & Compliance

* JWT / OAuth authentication
* Role-based access control (RBAC)
* Encrypted sensitive data
* PCI-DSS compliant payments
* GDPR & data privacy compliance
* Rate limiting & abuse prevention

---

## 🧠 Advanced / Optional Features

* AI-based recommendations
* Dynamic pricing
* Mobile apps (Android / iOS)
* Face recognition check-in
* NFT / digital tickets
* Virtual expo & booths

---

## 💰 Monetization Models

* Ticket commission
* Organizer subscriptions
* Featured event promotions
* Ads & sponsorships
* Premium analytics

---

## 📁 Project Structure

### Frontend

```bash
frontend/
├── src/
│   ├── app/
│   │   ├── routes/
│   │   ├── providers/
│   │   └── layout/
│   ├── features/
│   │   ├── auth/
│   │   ├── events/
│   │   ├── bookings/
│   │   ├── payments/
│   │   ├── organizer/
│   │   └── admin/
│   ├── shared/
│   │   ├── ui/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── services/
│   └── main.jsx
```

### Backend

```bash
backend/
├── app/
│   ├── main.py
│   ├── core/
│   │   ├── config.py
│   │   ├── database.py
│   │   └── security.py
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── events/
│   │   ├── tickets/
│   │   ├── bookings/
│   │   ├── payments/
│   │   ├── reviews/
│   │   └── admin/
│   ├── common/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── services/
│   └── jobs/
│       ├── email_jobs.py
│       └── payout_jobs.py
```

---

## ⚙️ Setup Instructions

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 📦 Deployment & Ops

* Cloud hosting (AWS / GCP / Azure)
* CI/CD pipelines
* Monitoring & logging
* Backup & disaster recovery

---

## 📌 Roadmap

* MVP launch
* Organizer subscriptions
* Mobile apps
* AI & analytics enhancements

---

## 📄 License

This project is intended for **startup & learning purposes**. Licensing can be added based on business requirements.

---

**Built to scale. Designed for real-world event businesses.**
