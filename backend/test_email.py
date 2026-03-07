import os
import resend

resend.api_key = os.getenv("RESEND_API_KEY")

response = resend.Emails.send({
    "from": "onboarding@resend.dev",
    "to": "rahuljangir5368@gmail.com",
    "subject": "Resend Test Email",
    "html": "<h1>It Works 🎉</h1>"
})

print(response)