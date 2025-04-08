import logger from '../logger';


export function getMailIcon(mail: string): any {
    try {
        const domain = mail.split('@')[1];
        
        if (!domain) return { fallback: '../images/mail.png' }

        return {
            favicon: `https://${domain}/favicon.ico`,
            appleTouchIcon: `https://${domain}/apple-touch-icon.png`,
            googleFavicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
            duckDuckGoFavicon: `https://icons.duckduckgo.com/ip3/${domain}.ico`,
            faviconkit: `https://api.faviconkit.com/${domain}/144`,
            fallback: '../images/mail.png'
        }
    } catch (error) {
        logger.error(`Error getting mail icon: ${error}`);
        return { fallback: '../images/mail.png' };
    }
}

const baseEmails = [
    {
      id: 1,
      subject: 'Willkommen beim eigenen E-Mail-Client!',
      from: {
        name: 'MecryTv',
        email: 'admin@mecrytv.de',
        faviconUrls: getMailIcon('admin@mecrytv.de')
      },
      to: 'user@example.com',
      date: new Date('2025-04-06T10:00:00'),
      body: 'Herzlich willkommen bei Ihrem neuen E-Mail-Client! Diese Nachricht ist eine Test-E-Mail.',
      isRead: false,
      isStarred: false,
      hasAttachments: false,
      attachments: []
    },
    {
      id: 2,
      subject: 'Testmail mit Dummy-Anhang',
      from: {
        name: 'System',
        email: 'noreply@mecrytv.de',
        faviconUrls: getMailIcon('noreply@mecrytv.de')
      },
      to: 'user@example.com',
      date: new Date('2025-04-05T15:30:00'),
      body: 'Diese E-Mail enthält einen Dummy-Anhang zum Testen der Anhangs-Funktionalität.',
      isRead: false,
      isStarred: false,
      hasAttachments: true,
      attachments: [
        {
          filename: 'testdokument.pdf',
          size: 245000,
          fileType: 'application/pdf',
          id: 1
        }
      ]
    },
    {
      id: 3,
      subject: 'Meeting am Montag',
      from: {
        name: 'Projektteam',
        email: 'projekt@mecrytv.de',
        faviconUrls: getMailIcon('projekt@mecrytv.de')
      },
      to: 'user@example.com',
      date: new Date('2025-04-04T09:15:00'),
      body: 'Reminder: Wir haben am Montag um 10:00 Uhr ein wichtiges Meeting. Bitte bereite dich entsprechend vor.',
      isRead: false,
      isStarred: false,
      hasAttachments: false,
      attachments: []
    }
];

const senders = [
    { name: 'MecryTv', email: 'admin@mecrytv.de' },
  { name: 'Technischer Support', email: 'support@mecrytv.de' },
  { name: 'Projektteam', email: 'projekt@mecrytv.de' },
  { name: 'Newsletter', email: 'news@mecrytv.de' },
  { name: 'Marketing', email: 'marketing@mecrytv.de' },
  { name: 'Webmaster', email: 'webmaster@mecrytv.de' }
];

const subjects = [
    'Wichtige Mitteilung zu Ihrem Konto',
    'Neues Feature verfügbar',
    'Terminbestätigung',
    'Ihr wöchentlicher Newsletter',
    'Sicherheitshinweis',
    'Update zu Ihrem Projekt',
    'Einladung zur Teilnahme',
    'Statusbericht KW-14',
    'Kundenfeedback',
    'Wichtige Ankündigung'
];

function genDummyMails() {
    const mails = [...baseEmails];

    for (let i = 4; i <= 26; i++){
        const randSend = senders[Math.floor(Math.random() * senders.length)];
        const randSubj = subjects[Math.floor(Math.random() * senders.length)];

        const isRead = false;
        const hastAttachments = Math.random() < 0.5;

        const date = new Date();
        const randDays = Math.floor(Math.random() * 31);
        const randHours = Math.floor(Math.random() * 24);
        const randDate = new Date(date);

        randDate.setDate(date.getDate() - randDays);
        randDate.setHours(date.getHours() - randHours);

        const mail = {
            id: i,
            subject: `${randSubj} #${i}`,
            from: {
                name: randSend.name,
                email: randSend.email,
                faviconUrls: getMailIcon(randSend.email)
            },
            to: 'user@example.com',
            date: randDate,
            body: `Dies ist eine automatisch generierte Test-E-Mail #${i} für Pagination-Tests.`,
            isRead: isRead,
            isStarred: false,
            hasAttachments: hastAttachments,
            attachments: hastAttachments ? [
                {
                filename: `attachment-${i}.pdf`,
                size: Math.floor(Math.random() * 900000) + 100000,
                fileType: 'application/pdf',
                id: i
                }
            ] : []
        };

        mails.push(mail);
    }

    return mails.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export const dummyMails = genDummyMails();