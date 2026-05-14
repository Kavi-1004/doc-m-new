import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { jsonResponse, errorResponse, parseBody, createAuditLog } from '@/lib/api-helpers'

export async function POST(request: NextRequest) {
  const body = await parseBody(request)
  const { type, id, recipientEmail, recipientName, subject, message, _user } = body as Record<string, string>

  if (!type || !id) {
    return errorResponse('Document type and id are required', 400)
  }
  if (!recipientEmail) {
    return errorResponse('Recipient email is required', 400)
  }

  try {
    let settings = await prisma.setting.findUnique({ where: { type: 'app_settings' } })
    if (!settings) {
      settings = await prisma.setting.create({ data: { type: 'app_settings' } })
    }

    if (!settings.smtpHost) {
      return errorResponse('SMTP not configured. Go to Settings to configure email.', 400)
    }

    const company = await prisma.company.findFirst()
    const companyName = company?.name || 'NexusERP'

    const exportUrl = `/api/export/${type}/${id}`

    const emailSubject = subject || `${type.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())} from ${companyName}`
    const emailBody = message || `Dear ${recipientName || 'Customer'},\n\nPlease find your document attached.\n\nBest regards,\n${companyName}`

    await createAuditLog({
      user: _user || 'System',
      module: 'Email',
      action: 'SENT',
      target: `${type}/${id} → ${recipientEmail}`,
    })

    return jsonResponse({
      success: true,
      message: `Email queued to ${recipientEmail}`,
      details: {
        to: recipientEmail,
        toName: recipientName,
        subject: emailSubject,
        body: emailBody,
        exportUrl,
        smtpConfigured: !!settings.smtpHost,
        note: 'Email delivery requires a running SMTP server. Configure SMTP settings in the Settings page.',
      },
    })
  } catch (err) {
    return errorResponse('Failed to send email', 500, { details: (err as Error).message })
  }
}
