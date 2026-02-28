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

```
Event-Organizer-Platform/
├── docker-compose.yml
├── README.md
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── eslint.config.js
│   ├── Dockerfile
│   ├── .gitignore
│   ├── .dockerignore
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── App.css
│       ├── index.css
│       ├── assets/
│       │   └── react.svg
│       ├── components/
│       │   ├── Navbar.tsx
│       │   ├── Footer.tsx
│       │   ├── EventCard.tsx
│       │   ├── HeroSearch.tsx
│       │   ├── CityGrid.tsx
│       │   ├── Categoryfilter.tsx
│       │   ├── Breadcrumbs.tsx
│       │   ├── BookingModal.tsx
│       │   └── ProtectedRoute.tsx
│       ├── context/
│       │   └── AuthContext.tsx
│       ├── layout/
│       │   ├── PublicLayout.tsx
│       │   └── OrganizerLayout.tsx
│       ├── pages/
│       │   ├── Home.tsx
│       │   ├── Login.tsx
│       │   ├── EventDetail.tsx
│       │   ├── CreateEvent.tsx
│       │   ├── MyBookings.tsx
│       │   ├── MyEvents.tsx
│       │   ├── ApplyOrganizer.tsx
│       │   ├── OrganizerDashboard.tsx
│       │   ├── admin/
│       │   │   ├── AdminLayout.tsx
│       │   │   ├── AdminDashboard.tsx
│       │   │   ├── UsersList.tsx
│       │   │   ├── Organizers.tsx
│       │   │   ├── Events.tsx
│       │   │   └── Analytics.tsx
│       │   └── organizer/
│       │       ├── ManageEvent.tsx
│       │       ├── EditEvent.tsx
│       │       ├── Overview.tsx
│       │       ├── Details.tsx
│       │       ├── Forms.tsx
│       │       ├── Tickets.tsx
│       │       ├── Addons.tsx
│       │       ├── Discounts.tsx
│       │       ├── EventBookings.tsx
│       │       ├── Settings.tsx
│       │       └── attendees/
│       │           ├── AttendeesPage.tsx
│       │           ├── AttendeesTable.tsx
│       │           ├── EventSelector.tsx
│       │           └── QrScannerModal.tsx
│       └── services/
│           ├── api.ts
│           ├── auth_api.ts
│           └── organizerAnalytics.ts
│
└── backend/
    ├── requirements.txt
    ├── test_email.py
    ├── Dockerfile
    ├── .gitignore
    ├── .dockerignore
    ├── tickets/                    # Generated ticket PDFs
    └── app/
        ├── main.py
        ├── core/
        │   ├── config.py
        │   ├── database.py
        │   └── payment.py
        ├── common/
        │   ├── razorpay_client.py
        │   └── utils/
        │       ├── security.py
        │       ├── jwt.py
        │       ├── email.py
        │       ├── pdf.py
        │       ├── qr.py
        │       └── dependencies.py
        ├── modules/
        │   ├── users/
        │   │   ├── models.py
        │   │   └── routes.py
        │   ├── events/
        │   │   ├── models.py
        │   │   ├── routes.py
        │   │   ├── schemas.py
        │   │   └── service.py
        │   ├── tickets/
        │   │   ├── models.py
        │   │   ├── routes.py
        │   │   └── service.py
        │   ├── bookings/
        │   │   ├── models.py
        │   │   ├── routes.py
        │   │   └── service.py
        │   ├── payments/
        │   │   ├── models.py
        │   │   ├── routes.py
        │   │   └── webhook.py
        │   ├── organizers/
        │   │   ├── models.py
        │   │   └── routes.py
        │   └── admin/
        │       └── routes.py
        └── templates/
            └── email/
                ├── ticket_booking.html
                └── event_created.html
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
