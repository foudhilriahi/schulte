import nodemailer from 'nodemailer';
import { env } from '../config/env';
import logger from '../utils/logger';
import { generateICS } from '../utils/ics';

// ── Transporter (lazy-created once) ─────────────────────────────────────────

let _transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }
  return _transporter;
}

// ── Design tokens ────────────────────────────────────────────────────────────

const C = {
  brand:      '#1a3c6e',
  brandLight: '#e8eef7',
  accent:     '#2563eb',
  ok:         '#16a34a',
  okLight:    '#dcfce7',
  warn:       '#d97706',
  warnLight:  '#fef3c7',
  err:        '#dc2626',
  errLight:   '#fee2e2',
  info:       '#0284c7',
  infoLight:  '#e0f2fe',
  text:       '#1e293b',
  textMuted:  '#64748b',
  border:     '#e2e8f0',
  bg:         '#f8fafc',
  white:      '#ffffff',
};

// ── Mobile-first HTML shell ──────────────────────────────────────────────────

function htmlShell(body: string, accentColor = C.brand): string {
  return `<!DOCTYPE html>
<html lang="fr" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Schulte Tunisia</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    @media only screen and (max-width: 600px) {
      .email-wrapper { padding: 12px !important; }
      .email-card    { border-radius: 12px !important; }
      .email-header  { padding: 24px 20px !important; }
      .email-body    { padding: 24px 20px !important; }
      .email-footer  { padding: 16px 20px !important; }
      .info-table td { display: block !important; width: 100% !important; padding: 4px 0 !important; }
      .info-label    { font-weight: 700 !important; color: ${C.brand} !important; }
      .btn-cta       { display: block !important; text-align: center !important; }
      h2             { font-size: 20px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${C.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${C.bg};">
    <tr>
      <td class="email-wrapper" style="padding:32px 16px;">
        <table role="presentation" class="email-card" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;margin:0 auto;background-color:${C.white};border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td class="email-header" style="background:linear-gradient(135deg,${accentColor} 0%,${C.accent} 100%);padding:32px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:8px;padding:6px 14px;margin-bottom:12px;">
                      <span style="color:rgba(255,255,255,0.9);font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Schulte Tunisia</span>
                    </div>
                    <p style="margin:0;color:rgba(255,255,255,0.75);font-size:13px;">Plateforme de recrutement</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td class="email-body" style="padding:36px 40px;color:${C.text};">
              ${body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="email-footer" style="background-color:${C.bg};padding:20px 40px;border-top:1px solid ${C.border};">
              <p style="margin:0;font-size:12px;color:${C.textMuted};text-align:center;line-height:1.6;">
                &copy; ${new Date().getFullYear()} Schulte Tunisia &mdash; Cet e-mail est automatique, merci de ne pas y répondre.<br/>
                <span style="font-size:11px;">Si vous avez des questions, contactez votre équipe RH.</span>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Reusable building blocks ─────────────────────────────────────────────────

function greeting(name: string): string {
  return `<p style="margin:0 0 20px;font-size:15px;color:${C.text};">Bonjour <strong>${name}</strong>,</p>`;
}

function infoBox(rows: { label: string; value: string }[], borderColor = C.brand): string {
  const rowsHtml = rows.map(r => `
    <tr>
      <td class="info-label" style="padding:6px 0;font-size:13px;color:${C.textMuted};white-space:nowrap;padding-right:16px;vertical-align:top;">${r.label}</td>
      <td style="padding:6px 0;font-size:13px;color:${C.text};font-weight:600;">${r.value}</td>
    </tr>`).join('');

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
      style="background-color:${C.brandLight};border-left:4px solid ${borderColor};border-radius:0 8px 8px 0;padding:16px 20px;margin:20px 0;">
      <tr><td>
        <table role="presentation" class="info-table" cellpadding="0" cellspacing="0" border="0" width="100%">
          ${rowsHtml}
        </table>
      </td></tr>
    </table>`;
}

function alertBox(text: string, color: string, bgColor: string): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
      style="background-color:${bgColor};border:1px solid ${color}33;border-radius:8px;padding:14px 18px;margin:20px 0;">
      <tr><td style="font-size:13px;color:${color};line-height:1.6;">${text}</td></tr>
    </table>`;
}

function statusBadge(label: string, bgColor: string, textColor: string): string {
  return `<span style="display:inline-block;padding:6px 18px;border-radius:20px;font-weight:700;font-size:13px;background-color:${bgColor};color:${textColor};">${label}</span>`;
}

function signature(): string {
  return `<p style="margin:28px 0 0;font-size:14px;color:${C.text};">Cordialement,<br/><strong>L'équipe RH — Schulte Tunisia</strong></p>`;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function frenchDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year:    'numeric',
    month:   'long',
    day:     'numeric',
  });
}

function frenchTime(date: Date): string {
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

const STATUS_LABELS: Record<string, string> = {
  reviewing: "En cours d'examen",
  interview: 'Entretien planifié',
  accepted:  'Candidature acceptée',
  rejected:  'Candidature non retenue',
};

const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  reviewing: { bg: C.warnLight,  color: C.warn },
  interview: { bg: C.infoLight,  color: C.info },
  accepted:  { bg: C.okLight,    color: C.ok   },
  rejected:  { bg: C.errLight,   color: C.err  },
};

const OUTCOME_LABELS: Record<'pass' | 'fail' | 'no_show', string> = {
  pass:    'Entretien validé ✓',
  fail:    'Entretien non retenu',
  no_show: "Absence à l'entretien",
};

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Status-change notification email.
 */
export async function sendStatusChangeEmail(
  candidate: { email: string; name: string },
  offer:     { title: string },
  newStatus: string,
): Promise<void> {
  if (!env.SMTP_USER) {
    logger.warn('[EmailService] SMTP_USER not configured — skipping sendStatusChangeEmail');
    return;
  }

  try {
    const label = STATUS_LABELS[newStatus] ?? newStatus;
    const badge = STATUS_BADGE[newStatus] ?? { bg: C.brandLight, color: C.brand };
    const accentColor = newStatus === 'accepted' ? C.ok : newStatus === 'rejected' ? C.err : C.brand;

    const body = `
      <h2 style="margin:0 0 20px;font-size:22px;font-weight:800;color:${C.brand};">Mise à jour de votre candidature</h2>
      ${greeting(candidate.name)}
      <p style="margin:0 0 20px;font-size:14px;color:${C.textMuted};line-height:1.7;">
        Le statut de votre candidature pour le poste <strong style="color:${C.text};">${offer.title}</strong> vient d'être mis à jour.
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
        <tr>
          <td style="font-size:13px;color:${C.textMuted};padding-right:12px;">Nouveau statut :</td>
          <td>${statusBadge(label, badge.bg, badge.color)}</td>
        </tr>
      </table>
      ${newStatus === 'accepted' ? alertBox('🎉 Félicitations ! Votre candidature a été retenue. Notre équipe vous contactera prochainement pour les prochaines étapes.', C.ok, C.okLight) : ''}
      ${newStatus === 'rejected' ? alertBox('Nous vous remercions de l\'intérêt que vous portez à notre entreprise. Nous vous encourageons à postuler à de futures offres.', C.textMuted, C.bg) : ''}
      <p style="margin:20px 0 0;font-size:13px;color:${C.textMuted};">
        Connectez-vous à votre espace candidat pour consulter les détails de votre dossier.
      </p>
      ${signature()}
    `;

    await getTransporter().sendMail({
      from:    `"Schulte Tunisia RH" <${env.FROM_EMAIL}>`,
      to:      candidate.email,
      subject: `Candidature ${offer.title} — ${label}`,
      html:    htmlShell(body, accentColor),
    });

    logger.info(`[EmailService] Status-change email sent to ${candidate.email} (${newStatus})`);
  } catch (err) {
    logger.error('[EmailService] sendStatusChangeEmail failed:', err);
  }
}

/**
 * Interview invitation email with ICS calendar attachment.
 */
export async function sendInterviewInviteEmail(
  candidate: { email: string; name: string },
  interview: { scheduledAt: Date; location: string; notes?: string },
  offer:     { title: string },
): Promise<void> {
  if (!env.SMTP_USER) {
    logger.warn('[EmailService] SMTP_USER not configured — skipping sendInterviewInviteEmail');
    return;
  }

  try {
    const startDate = interview.scheduledAt;

    const icsContent = generateICS({
      title:           `Entretien — ${offer.title}`,
      description:     `Entretien pour le poste : ${offer.title}${interview.notes ? `\n\nNotes : ${interview.notes}` : ''}`,
      location:        interview.location,
      startDate,
      durationMinutes: 60,
      organizerEmail:  env.FROM_EMAIL,
      attendeeEmail:   candidate.email,
    });

    const notesSection = interview.notes
      ? alertBox(`<strong>Notes de l'équipe RH :</strong><br/>${interview.notes}`, C.info, C.infoLight)
      : '';

    const body = `
      <h2 style="margin:0 0 20px;font-size:22px;font-weight:800;color:${C.brand};">Invitation à un entretien</h2>
      ${greeting(candidate.name)}
      <p style="margin:0 0 4px;font-size:14px;color:${C.textMuted};line-height:1.7;">
        Nous avons le plaisir de vous inviter à un entretien pour le poste de
        <strong style="color:${C.text};">${offer.title}</strong>.
      </p>
      ${infoBox([
        { label: '📋 Poste',  value: offer.title },
        { label: '📅 Date',   value: frenchDate(startDate) },
        { label: '🕐 Heure',  value: frenchTime(startDate) },
        { label: '📍 Lieu',   value: interview.location },
      ])}
      ${notesSection}
      ${alertBox('Un fichier de calendrier (.ics) est joint à cet e-mail. Ajoutez cet événement à votre agenda en un clic.', C.info, C.infoLight)}
      <p style="margin:20px 0 0;font-size:13px;color:${C.textMuted};line-height:1.7;">
        Pensez à apporter votre CV et toute pièce justificative nécessaire.<br/>
        En cas d'empêchement, veuillez nous contacter dès que possible.
      </p>
      ${signature()}
    `;

    await getTransporter().sendMail({
      from:    `"Schulte Tunisia RH" <${env.FROM_EMAIL}>`,
      to:      candidate.email,
      subject: `📅 Invitation à un entretien — ${offer.title}`,
      html:    htmlShell(body),
      attachments: [
        {
          filename:    'entretien.ics',
          content:     icsContent,
          contentType: 'text/calendar; method=REQUEST',
        },
      ],
    });

    logger.info(`[EmailService] Interview invite email sent to ${candidate.email}`);
  } catch (err) {
    logger.error('[EmailService] sendInterviewInviteEmail failed:', err);
  }
}

/**
 * J-1 reminder email.
 */
export async function sendInterviewReminderEmail(
  candidate: { email: string; name: string },
  interview: { scheduledAt: Date; location: string },
  offer:     { title: string },
): Promise<void> {
  if (!env.SMTP_USER) {
    logger.warn('[EmailService] SMTP_USER not configured — skipping sendInterviewReminderEmail');
    return;
  }

  try {
    const body = `
      <h2 style="margin:0 0 20px;font-size:22px;font-weight:800;color:${C.brand};">⏰ Rappel : entretien demain</h2>
      ${greeting(candidate.name)}
      <p style="margin:0 0 4px;font-size:14px;color:${C.textMuted};line-height:1.7;">
        Votre entretien pour le poste <strong style="color:${C.text};">${offer.title}</strong> est prévu <strong>demain</strong>.
      </p>
      ${infoBox([
        { label: '📋 Poste',  value: offer.title },
        { label: '📅 Date',   value: frenchDate(interview.scheduledAt) },
        { label: '🕐 Heure',  value: frenchTime(interview.scheduledAt) },
        { label: '📍 Lieu',   value: interview.location },
      ], C.warn)}
      ${alertBox('💡 <strong>Conseils :</strong> Pensez à apporter votre CV, vos diplômes et toute pièce justificative. Prévoyez d\'arriver 10 minutes en avance.', C.warn, C.warnLight)}
      <p style="margin:20px 0 0;font-size:13px;color:${C.textMuted};">
        En cas d'empêchement, veuillez nous contacter dès que possible.
      </p>
      ${signature()}
    `;

    await getTransporter().sendMail({
      from:    `"Schulte Tunisia RH" <${env.FROM_EMAIL}>`,
      to:      candidate.email,
      subject: `⏰ Rappel entretien demain — ${offer.title}`,
      html:    htmlShell(body, C.warn),
    });

    logger.info(`[EmailService] Interview reminder email sent to ${candidate.email}`);
  } catch (err) {
    logger.error('[EmailService] sendInterviewReminderEmail failed:', err);
  }
}

/**
 * Interview outcome notification email.
 */
export async function sendInterviewOutcomeEmail(
  candidate: { email: string; name: string },
  interview: { scheduledAt: Date; location: string },
  offer:     { title: string },
  outcome:   'pass' | 'fail' | 'no_show',
  noShowCount = 0,
): Promise<void> {
  if (!env.SMTP_USER) {
    logger.warn('[EmailService] SMTP_USER not configured — skipping sendInterviewOutcomeEmail');
    return;
  }

  try {
    const accentColor = outcome === 'pass' ? C.ok : outcome === 'fail' ? C.err : C.textMuted;

    const outcomeMessages: Record<'pass' | 'fail' | 'no_show', string> = {
      pass:
        `Votre entretien pour le poste <strong>${offer.title}</strong> a été validé avec succès. ` +
        `Notre équipe vous contactera prochainement pour les prochaines étapes.`,
      fail:
        `Nous vous informons que votre entretien pour le poste <strong>${offer.title}</strong> n'a pas été retenu. ` +
        `Nous vous remercions pour votre participation et vous encourageons à postuler à de futures offres.`,
      no_show:
        `Votre absence à l'entretien du <strong>${frenchDate(interview.scheduledAt)}</strong> pour le poste <strong>${offer.title}</strong> a été enregistrée. ` +
        `Nombre d'absences enregistrées : <strong>${noShowCount}</strong>.`,
    };

    const outcomeAlerts: Record<'pass' | 'fail' | 'no_show', string> = {
      pass:    alertBox('🎉 Félicitations ! Votre candidature progresse vers la prochaine étape.', C.ok, C.okLight),
      fail:    alertBox('Merci pour le temps que vous nous avez accordé. Nous vous souhaitons bonne chance dans vos recherches.', C.textMuted, C.bg),
      no_show: alertBox(`⚠️ Si cette absence est une erreur, veuillez contacter votre équipe RH immédiatement.${noShowCount >= 2 ? '<br/><strong>Attention :</strong> 2 absences enregistrées — votre candidature a été automatiquement clôturée.' : ''}`, C.warn, C.warnLight),
    };

    const body = `
      <h2 style="margin:0 0 20px;font-size:22px;font-weight:800;color:${accentColor};">${OUTCOME_LABELS[outcome]}</h2>
      ${greeting(candidate.name)}
      <p style="margin:0 0 4px;font-size:14px;color:${C.textMuted};line-height:1.7;">
        ${outcomeMessages[outcome]}
      </p>
      ${infoBox([
        { label: '📋 Poste',  value: offer.title },
        { label: '📅 Date',   value: frenchDate(interview.scheduledAt) },
        { label: '🕐 Heure',  value: frenchTime(interview.scheduledAt) },
        { label: '📍 Lieu',   value: interview.location },
      ], accentColor)}
      ${outcomeAlerts[outcome]}
      ${signature()}
    `;

    await getTransporter().sendMail({
      from:    `"Schulte Tunisia RH" <${env.FROM_EMAIL}>`,
      to:      candidate.email,
      subject: `${OUTCOME_LABELS[outcome]} — ${offer.title}`,
      html:    htmlShell(body, accentColor),
    });

    logger.info(`[EmailService] Interview outcome email sent to ${candidate.email}`);
  } catch (err) {
    logger.error('[EmailService] sendInterviewOutcomeEmail failed:', err);
  }
}

/**
 * Password reset email.
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetUrl: string,
): Promise<void> {
  if (!env.SMTP_USER) {
    logger.warn('[EmailService] SMTP_USER not configured — skipping sendPasswordResetEmail');
    return;
  }

  try {
    const body = `
      <h2 style="margin:0 0 20px;font-size:22px;font-weight:800;color:${C.brand};">Réinitialisation de mot de passe</h2>
      ${greeting(name)}
      <p style="margin:0 0 20px;font-size:14px;color:${C.textMuted};line-height:1.7;">
        Vous avez demandé la réinitialisation de votre mot de passe pour votre compte Schulte Tunisia.
        Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe.
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0;">
        <tr>
          <td style="border-radius:10px;background-color:${C.brand};">
            <a href="${resetUrl}" class="btn-cta"
               style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:${C.white};text-decoration:none;border-radius:10px;letter-spacing:0.3px;">
              Réinitialiser mon mot de passe
            </a>
          </td>
        </tr>
      </table>
      ${alertBox('<strong>⏱ Ce lien est valide pendant 15 minutes seulement.</strong><br/>Si vous n\'avez pas demandé cette réinitialisation, ignorez cet email. Votre mot de passe restera inchangé.', C.warn, C.warnLight)}
      <p style="margin:20px 0 0;font-size:12px;color:${C.textMuted};word-break:break-all;">
        Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br/>
        <span style="color:${C.accent};">${resetUrl}</span>
      </p>
      ${signature()}
    `;

    await getTransporter().sendMail({
      from:    `"Schulte Tunisia" <${env.FROM_EMAIL}>`,
      to:      email,
      subject: 'Réinitialisation de mot de passe — Schulte Tunisia',
      html:    htmlShell(body),
    });

    logger.info(`[EmailService] Password reset email sent to ${email}`);
  } catch (err) {
    logger.error('[EmailService] sendPasswordResetEmail failed:', err);
  }
}

/**
 * Email verification code email.
 */
export async function sendVerificationEmail(
  email: string,
  name: string,
  code: string,
): Promise<void> {
  if (!env.SMTP_USER) {
    logger.warn('[EmailService] SMTP_USER not configured — skipping sendVerificationEmail');
    return;
  }

  try {
    // Render each digit as its own cell — works in Gmail mobile without overflow
    const digitCells = code.split('').map(d =>
      `<td style="padding:0 3px;">` +
        `<div style="width:36px;height:44px;line-height:44px;text-align:center;` +
              `background-color:${C.white};border:2px solid ${C.brand};border-radius:8px;` +
              `font-size:22px;font-weight:900;color:${C.brand};` +
              `font-family:'Courier New',Courier,monospace;">${d}</div>` +
      `</td>`
    ).join('');

    const body = `
      <h2 style="margin:0 0 16px;font-size:20px;font-weight:800;color:${C.brand};">Vérifiez votre adresse email</h2>
      ${greeting(name)}
      <p style="margin:0 0 20px;font-size:14px;color:${C.textMuted};line-height:1.7;">
        Merci de vous être inscrit sur <strong style="color:${C.text};">Schulte Tunisia</strong>.
        Entrez le code ci-dessous dans l'application pour activer votre compte.
      </p>

      <!-- OTP: individual digit boxes, Gmail-safe -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;">
        <tr>
          <td align="center">
            <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${C.textMuted};">
              Votre code
            </p>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>${digitCells}</tr>
            </table>
            <p style="margin:10px 0 0;font-size:11px;color:${C.textMuted};">Valide 15 minutes</p>
          </td>
        </tr>
      </table>

      ${alertBox('Si vous n\'avez pas créé de compte sur Schulte Tunisia, ignorez cet email.', C.textMuted, C.bg)}
      ${signature()}
    `;

    await getTransporter().sendMail({
      from:    `"Schulte Tunisia" <${env.FROM_EMAIL}>`,
      to:      email,
      subject: `${code} — Code de vérification Schulte Tunisia`,
      html:    htmlShell(body),
    });

    logger.info(`[EmailService] Verification email sent to ${email}`);
  } catch (err) {
    logger.error('[EmailService] sendVerificationEmail failed:', err);
  }
}
