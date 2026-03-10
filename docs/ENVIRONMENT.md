# Environment Variables Configuration

To run the **Event Organizer Platform** locally or in production, you must configure the following environment variables.

## Backend (.env)

The backend uses a `.env` file located in the `backend/` directory.

### Core Configuration
| Variable | Description | Example |
|----------|-------------|---------|
| `PROJECT_NAME` | The name of your application. | `EventPlatform` |
| `MONGO_URI` | Your MongoDB connection string. | `mongodb://localhost:27017/event_db` |

### Payment Integration (Razorpay)
| Variable | Description | Example |
|----------|-------------|---------|
| `RAZORPAY_KEY_ID` | Your Razorpay API Key ID. | `rzp_test_...` |
| `RAZORPAY_KEY_SECRET` | Your Razorpay API Key Secret. | `...secret...` |

### Media Storage (Cloudinary)
Used for event banners and certificate storage.
| Variable | Description | Example |
|----------|-------------|---------|
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name. | `d...` |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key. | `123456789...` |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret. | `...` |

### Email Notifications (SMTP)
Required for sending tickets and certificates.
| Variable | Description | Example |
|----------|-------------|---------|
| `SMTP_HOST` | The SMTP server host. | `smtp.gmail.com` |
| `SMTP_PORT` | The SMTP server port. | `587` |
| `EMAIL_USER` | The email address used to send emails. | `your_email@gmail.com` |
| `EMAIL_PASS` | The app-specific password for the email. | `abcd-efgh-ijkl-mnop` |
| `SMTP_STARTTLS` | Whether to use STARTTLS (true/false). | `true` |
| `SMTP_USE_TLS` | Whether to use TLS (true/false). | `false` |

### Frontend URLs
Required for generating verification links in certificates.
| Variable | Description | Example |
|----------|-------------|---------|
| `FRONTEND_URL` | The base URL where the frontend is hosted. | `http://localhost:5173` |

---

## Frontend

The frontend currently uses default values for development, but for production, you should configure the base API URL in `frontend/src/services/api.ts`.

> [!IMPORTANT]
> Always ensure `.env` files are included in `.gitignore` to prevent leaking sensitive credentials.
