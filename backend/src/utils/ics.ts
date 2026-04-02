import { randomUUID } from 'crypto';

export interface ICSData {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  durationMinutes: number;
  organizerEmail: string;
  attendeeEmail: string;
}

/**
 * Formats a Date object as a UTC iCalendar date-time string: YYYYMMDDTHHmmssZ
 */
function formatICSDate(date: Date): string {
  const pad = (n: number, len = 2): string => String(n).padStart(len, '0');

  const year  = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day   = pad(date.getUTCDate());
  const hours = pad(date.getUTCHours());
  const mins  = pad(date.getUTCMinutes());
  const secs  = pad(date.getUTCSeconds());

  return `${year}${month}${day}T${hours}${mins}${secs}Z`;
}

/**
 * Escapes special characters in iCalendar text values.
 */
function escapeICS(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}

/**
 * Generates a complete .ics file string for a calendar event.
 * Uses METHOD:REQUEST and includes a VALARM 60 minutes before.
 */
export function generateICS(data: ICSData): string {
  const {
    title,
    description,
    location,
    startDate,
    durationMinutes,
    organizerEmail,
    attendeeEmail,
  } = data;

  const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);
  const now     = new Date();

  const uid        = randomUUID();
  const dtStamp    = formatICSDate(now);
  const dtStart    = formatICSDate(startDate);
  const dtEnd      = formatICSDate(endDate);

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Schulte Tunisia//Recruitment Platform//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeICS(title)}`,
    `DESCRIPTION:${escapeICS(description)}`,
    `LOCATION:${escapeICS(location)}`,
    `ORGANIZER;CN=Schulte Tunisia:mailto:${organizerEmail}`,
    `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE;CN=${attendeeEmail}:mailto:${attendeeEmail}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT60M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Rappel : entretien dans 1 heure',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return lines.join('\r\n');
}
