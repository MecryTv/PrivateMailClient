// Email-Interface für die Frontend-Anzeige
export interface Email {
  id: number;
  sender: string;
  senderEmail?: string; // E-Mail-Adresse des Absenders
  senderFaviconUrls?: {
    favicon?: string;
    appleTouchIcon?: string;
    googleFavicon?: string;
    duckDuckGoFavicon?: string;
    faviconkit?: string;
    fallback?: string;
  };
  subject: string;
  content?: string;
  date: Date | string;
  hasAttachment: boolean;
  attachments?: Array<any>; // Anhänge-Array für die Anzeige der Anzahl
  isRead: boolean;
  isFlagged?: boolean; // Ob die E-Mail markiert/mit Stern versehen ist
  category?: string;
}

// Backend Email-Struktur
export interface BackendEmail {
  id: number;
  subject: string;
  from: {
    name: string;
    email: string;
    faviconUrls?: any;
  };
  to: string;
  date: string | Date;
  body: string;
  isRead: boolean;
  isStarred: boolean;
  hasAttachments: boolean;
  attachments: any[];
}
