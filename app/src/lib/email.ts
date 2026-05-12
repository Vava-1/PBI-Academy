interface EmailConfig {
  to: string
  subject: string
  html: string
}

// Simple email client using Resend API
class EmailService {
  private apiKey: string
  private fromEmail: string

  constructor() {
    this.apiKey = import.meta.env.VITE_RESEND_API_KEY || ''
    this.fromEmail = import.meta.env.VITE_RESEND_FROM_EMAIL || 'noreply@pbiacademy.com'
  }

  async sendEmail(config: EmailConfig): Promise<any> {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `PBI Academy <${this.fromEmail}>`,
        to: [config.to],
        subject: config.subject,
        html: config.html,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to send email')
    }

    return response.json()
  }

  async sendEnrollmentEmail(config: {
    to: string
    studentName: string
    courseTitle: string
    dashboardUrl: string
  }) {
    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:auto">
        <div style="background:#6366f1;padding:20px;text-align:center;border-radius:8px 8px 0 0">
          <h1 style="color:white;margin:0;font-size:24px">PBI Academy</h1>
        </div>
        <div style="background:white;padding:40px;border-radius:0 0 8px 8px;box-shadow:0 2px 10px rgba(0,0,0,0.1)">
          <h2 style="color:#1e293b;margin:0 0 20px 0">Welcome, ${config.studentName}! 🎉</h2>
          <p style="color:#64748b;margin:0 0 20px 0;line-height:1.6">
            You've successfully enrolled in <strong>${config.courseTitle}</strong>.
          </p>
          <div style="text-align:center;margin:30px 0">
            <a href="${config.dashboardUrl}" 
               style="background:#6366f1;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:600">
              Go to Dashboard →
            </a>
          </div>
          <p style="color:#64748b;margin:20px 0 0 0;font-size:14px">
            Start learning immediately and track your progress in your dashboard.
          </p>
        </div>
        <div style="text-align:center;margin-top:20px;color:#64748b;font-size:12px">
          <p>— The PBI Academy Team</p>
          <p style="margin-top:10px">Rwanda's Premier AI-Powered Learning Platform</p>
        </div>
      </div>
    `

    return this.sendEmail({
      to: config.to,
      subject: `✅ You're enrolled in ${config.courseTitle}!`,
      html,
    })
  }

  async sendWelcomeEmail(config: {
    to: string
    studentName: string
  }) {
    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:auto">
        <div style="background:#6366f1;padding:20px;text-align:center;border-radius:8px 8px 0 0">
          <h1 style="color:white;margin:0;font-size:24px">PBI Academy</h1>
        </div>
        <div style="background:white;padding:40px;border-radius:0 0 8px 8px;box-shadow:0 2px 10px rgba(0,0,0,0.1)">
          <h2 style="color:#1e293b;margin:0 0 20px 0">Hi ${config.studentName}, welcome aboard! 🚀</h2>
          <p style="color:#64748b;margin:0 0 20px 0;line-height:1.6">
            You've joined <strong>PBI Academy</strong> — Rwanda's platform for AI and Tech education.
          </p>
          <p style="color:#64748b;margin:0 0 30px 0;line-height:1.6">
            Start exploring our courses and begin your journey today.
          </p>
          <div style="text-align:center;margin:30px 0">
            <a href="https://pbiacademy.com/courses" 
               style="background:#6366f1;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:600">
              Browse Courses →
            </a>
          </div>
        </div>
        <div style="text-align:center;margin-top:20px;color:#64748b;font-size:12px">
          <p>— The PBI Academy Team</p>
          <p style="margin-top:10px">Empowering Rwanda's Future Through Education</p>
        </div>
      </div>
    `

    return this.sendEmail({
      to: config.to,
      subject: `👋 Welcome to PBI Academy, ${config.studentName}!`,
      html,
    })
  }

  async sendPasswordResetEmail(config: {
    to: string
    studentName: string
    resetUrl: string
  }) {
    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:auto">
        <div style="background:#6366f1;padding:20px;text-align:center;border-radius:8px 8px 0 0">
          <h1 style="color:white;margin:0;font-size:24px">PBI Academy</h1>
        </div>
        <div style="background:white;padding:40px;border-radius:0 0 8px 8px;box-shadow:0 2px 10px rgba(0,0,0,0.1)">
          <h2 style="color:#1e293b;margin:0 0 20px 0">Password Reset Request 🔐</h2>
          <p style="color:#64748b;margin:0 0 20px 0;line-height:1.6">
            Hi ${config.studentName}, we received a request to reset your password.
          </p>
          <div style="text-align:center;margin:30px 0">
            <a href="${config.resetUrl}" 
               style="background:#ef4444;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:600">
              Reset Password →
            </a>
          </div>
          <p style="color:#64748b;margin:20px 0 0 0;font-size:14px">
            This link expires in 1 hour. If you didn't request this, please ignore this email.
          </p>
        </div>
        <div style="text-align:center;margin-top:20px;color:#64748b;font-size:12px">
          <p>— The PBI Academy Team</p>
        </div>
      </div>
    `

    return this.sendEmail({
      to: config.to,
      subject: '🔐 Reset Your PBI Academy Password',
      html,
    })
  }
}

export const emailService = new EmailService()

// Export individual functions for easier usage
export const sendEnrollmentEmail = emailService.sendEnrollmentEmail.bind(emailService)
export const sendWelcomeEmail = emailService.sendWelcomeEmail.bind(emailService)
export const sendPasswordResetEmail = emailService.sendPasswordResetEmail.bind(emailService)
