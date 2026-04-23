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

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Wraps content in a consistent branded HTML shell. */
function htmlShell(body: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin: 0; padding: 0; background: #f4f6f8; font-family: Arial, sans-serif; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header  { background: #1a3c6e; padding: 28px 32px; }
    .header h1 { margin: 0; color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: 0.5px; }
    .header p  { margin: 4px 0 0; color: #a8c4e0; font-size: 13px; }
    .content { padding: 32px; color: #2d3748; line-height: 1.6; }
    .content h2 { margin: 0 0 16px; font-size: 18px; color: #1a3c6e; }
    .info-box { background: #f0f4ff; border-left: 4px solid #1a3c6e; border-radius: 4px; padding: 16px 20px; margin: 20px 0; }
    .info-box p { margin: 6px 0; font-size: 14px; }
    .info-box strong { color: #1a3c6e; min-width: 110px; display: inline-block; }
    .badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-weight: 700; font-size: 14px; }
    .badge-reviewing  { background: #fff3cd; color: #856404; }
    .badge-interview  { background: #cce5ff; color: #004085; }
    .badge-accepted   { background: #d4edda; color: #155724; }
    .badge-rejected   { background: #f8d7da; color: #721c24; }
    .footer { background: #f4f6f8; padding: 20px 32px; text-align: center; font-size: 12px; color: #718096; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>Schulte Tunisia</h1>
      <p>Plateforme de recrutement</p>
    </div>
    <div class="content">
      ${body}
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Schulte Tunisia &mdash; Cet e-mail est automatique, merci de ne pas y répondre.
    </div>
  </div>
</body>
</html>`;
}

const STATUS_LABELS: Record<string, string> = {
  reviewing: "En cours d'examen",
  interview: 'Entretien planifié',
  accepted: 'Acceptée',
  rejected: 'Non retenue',
};

const STATUS_BADGE_CLASS: Record<string, string> = {
  reviewing: 'badge-reviewing',
  interview: 'badge-interview',
  accepted: 'badge-accepted',
  rejected: 'badge-rejected',
};

/** Parses a time string like "14:30" and sets those hours/minutes on a Date copy (UTC). */
function combineDateAndTime(date: Date, time: string): Date {
  const combined = new Date(date);
  const [hoursStr, minutesStr] = time.split(':');
  combined.setUTCHours(
    parseInt(hoursStr  ?? '9',  10),
    parseInt(minutesStr ?? '0', 10),
    0,
    0,
  );
  return combined;
}

/** Formats a Date to a French locale date string. */
function frenchDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year:    'numeric',
    month:   'long',
    day:     'numeric',
  });
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Sends a French HTML email notifying the candidate that their application
 * status has changed.
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
    const label      = STATUS_LABELS[newStatus]      ?? newStatus;
    const badgeClass = STATUS_BADGE_CLASS[newStatus] ?? 'badge-reviewing';

    const body = `
      <h2>Mise à jour de votre candidature</h2>
      <p>Bonjour <strong>${candidate.name}</strong>,</p>
      <p>Nous vous informons que le statut de votre candidature pour le poste
         <strong>${offer.title}</strong> a été mis à jour.</p>
      <p style="margin-top:20px;">Nouveau statut :&nbsp;
        <span class="badge ${badgeClass}">${label}</span>
      </p>
      <p style="margin-top:24px;">
        Connectez-vous à votre espace candidat pour consulter les détails de votre dossier.
      </p>
      <p>Cordialement,<br /><strong>L'équipe RH — Schulte Tunisia</strong></p>
    `;

    await getTransporter().sendMail({
      from:    `"Schulte Tunisia RH" <${env.FROM_EMAIL}>`,
      to:      candidate.email,
      subject: `Candidature ${offer.title} — ${label}`,
      html:    htmlShell(body),
    });

    logger.info(`[EmailService] Status-change email sent to ${candidate.email} (${newStatus})`);
  } catch (err) {
    logger.error('[EmailService] sendStatusChangeEmail failed:', err);
  }
}

/**
 * Sends a French HTML interview-invitation email with an attached ICS file.
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
    const timeStr = startDate.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });

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
      ? `<div class="info-box"><p><strong>Notes :</strong> ${interview.notes}</p></div>`
      : '';

    const body = `
      <h2>Invitation à un entretien</h2>
      <p>Bonjour <strong>${candidate.name}</strong>,</p>
      <p>Nous avons le plaisir de vous inviter à un entretien pour le poste de
         <strong>${offer.title}</strong>.</p>
      <div class="info-box">
        <p><strong>Poste :</strong> ${offer.title}</p>
        <p><strong>Date :</strong> ${frenchDate(startDate)}</p>
        <p><strong>Heure :</strong> ${timeStr}</p>
        <p><strong>Lieu :</strong> ${interview.location}</p>
      </div>
      ${notesSection}
      <p>Un fichier de calendrier (.ics) est joint à cet e-mail pour vous permettre
         d'ajouter cet événement directement à votre agenda.</p>
      <p>Merci de confirmer votre présence en répondant à cet e-mail.</p>
      <p>Cordialement,<br /><strong>L'équipe RH — Schulte Tunisia</strong></p>
    `;

    await getTransporter().sendMail({
      from:    `"Schulte Tunisia RH" <${env.FROM_EMAIL}>`,
      to:      candidate.email,
      subject: `Invitation à un entretien — ${offer.title}`,
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
 * Sends a French HTML reminder email: "Votre entretien est demain".
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
    const timeStr = interview.scheduledAt.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const body = `
      <h2>Rappel : votre entretien est demain</h2>
      <p>Bonjour <strong>${candidate.name}</strong>,</p>
      <p>Nous vous rappelons que vous avez un entretien prévu demain pour le poste de
         <strong>${offer.title}</strong>.</p>
      <div class="info-box">
        <p><strong>Poste :</strong> ${offer.title}</p>
        <p><strong>Date :</strong> ${frenchDate(interview.scheduledAt)}</p>
        <p><strong>Heure :</strong> ${timeStr}</p>
        <p><strong>Lieu :</strong> ${interview.location}</p>
      </div>
      <p>Pensez à apporter votre CV et toute pièce justificative nécessaire.</p>
      <p>En cas d'empêchement, veuillez nous contacter dès que possible.</p>
      <p>Cordialement,<br /><strong>L'équipe RH — Schulte Tunisia</strong></p>
    `;

    await getTransporter().sendMail({
      from:    `"Schulte Tunisia RH" <${env.FROM_EMAIL}>`,
      to:      candidate.email,
      subject: `Rappel entretien demain — ${offer.title}`,
      html:    htmlShell(body),
    });

    logger.info(`[EmailService] Interview reminder email sent to ${candidate.email}`);
  } catch (err) {
    logger.error('[EmailService] sendInterviewReminderEmail failed:', err);
  }
}

/**
 * Sends a password reset email with a secure reset link.
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetUrl: string
): Promise<void> {
  if (!env.SMTP_USER) {
    logger.warn('[EmailService] SMTP_USER not configured — skipping sendPasswordResetEmail');
    return;
  }

  try {
    const body = `
      <h2>Réinitialisation de mot de passe</h2>
      <p>Bonjour <strong>${name}</strong>,</p>
      <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte Schulte Tunisia.</p>
      <p>Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background: #1a3c6e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
          Réinitialiser mon mot de passe
        </a>
      </div>
      <div class="info-box">
        <p><strong>Important :</strong> Ce lien est valide pendant 15 minutes seulement.</p>
        <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Votre mot de passe restera inchangé.</p>
      </div>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">
        Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
        <span style="word-break: break-all;">${resetUrl}</span>
      </p>
    `;

    await getTransporter().sendMail({
      from: `"Schulte Tunisia" <${env.FROM_EMAIL}>`,
      to: email,
      subject: 'Réinitialisation de mot de passe - Schulte Tunisia',
      html: htmlShell(body),
    });

    logger.info(`[EmailService] Password reset email sent to ${email}`);
  } catch (err) {
    logger.error('[EmailService] sendPasswordResetEmail failed:', err);
  }
}

/**
 * Sends a verification email with a 6-digit code after registration.
 */
export async function sendVerificationEmail(
  email: string,
  name: string,
  code: string
): Promise<void> {
  if (!env.SMTP_USER) {
    logger.warn('[EmailService] SMTP_USER not configured — skipping sendVerificationEmail');
    return;
  }

  try {
    const spaced = code.split('').join(' &nbsp; ');
    const body = `
      <h2>Vérification de votre adresse email</h2>
      <p>Bonjour <strong>${name}</strong>,</p>
      <p>Merci de vous être inscrit sur Schulte Tunisia. Pour activer votre compte,
         entrez le code ci-dessous dans l'application :</p>
      <div style="text-align: center; margin: 30px 0;">
        <div style="display: inline-block; background: #f0f4ff; border: 2px solid #1a3c6e; border-radius: 12px; padding: 20px 36px; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #1a3c6e;">
          ${spaced}
        </div>
      </div>
      <div class="info-box">
        <p><strong>Important :</strong> Ce code est valide pendant 15 minutes seulement.</p>
        <p>Si vous n'avez pas créé de compte, ignorez cet email.</p>
      </div>
      <p>Cordialement,<br /><strong>L'équipe — Schulte Tunisia</strong></p>
    `;

    await getTransporter().sendMail({
      from: `"Schulte Tunisia" <${env.FROM_EMAIL}>`,
      to: email,
      subject: 'Code de vérification - Schulte Tunisia',
      html: htmlShell(body),
    });

    logger.info(`[EmailService] Verification email sent to ${email}`);
  } catch (err) {
    logger.error('[EmailService] sendVerificationEmail failed:', err);
  }
}