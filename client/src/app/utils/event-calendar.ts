import { Evenement } from '../models/evenement';

// Les horaires sont des indications libres : conserver un évènement à la journée.
export function createEventCalendar(event: Evenement, applicationUrl: string, now = new Date()): string {
  const date = event.dateEvenement;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Date de l’évènement invalide');
  const nextDay = new Date(`${date}T00:00:00Z`);
  if (!Number.isFinite(nextDay.getTime()) || nextDay.toISOString().slice(0, 10) !== date) {
    throw new Error('Date de l’évènement invalide');
  }
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);
  const description = [
    event.adresse?.trim() ? `Adresse : ${event.adresse}` : '',
    event.indicationsDebut?.trim() ? `Début : ${event.indicationsDebut}` : '',
    event.indicationsFin?.trim() ? `Fin : ${event.indicationsFin}` : '',
    `Application bénévole : ${applicationUrl}`,
  ].filter(Boolean).join('\n\n');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Benevole//Calendrier evenement//FR',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:evenement-${event.id}@${new URL(applicationUrl).host}`,
    `DTSTAMP:${now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
    `DTSTART;VALUE=DATE:${date.replace(/-/g, '')}`,
    `DTEND;VALUE=DATE:${nextDay.toISOString().slice(0, 10).replace(/-/g, '')}`,
    `SUMMARY:${escapeText(event.eventName)}`,
    `LOCATION:${escapeText(event.adresse ?? '')}`,
    `DESCRIPTION:${escapeText(description)}`,
    `URL:${applicationUrl}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.map(foldLine).join('\r\n') + '\r\n';
}

function escapeText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
}

function foldLine(line: string): string {
  const encoder = new TextEncoder();
  let result = '';
  let bytes = 0;
  for (const character of line) {
    const size = encoder.encode(character).length;
    if (bytes + size > 75) {
      result += '\r\n ';
      bytes = 1;
    }
    result += character;
    bytes += size;
  }
  return result;
}
