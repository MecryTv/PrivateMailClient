import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CategoryIconService {

  private iconMap: Record<string, string> = {
    // Allgemeine Kategorien
    'allgemein': 'fa-inbox',
    'diverse': 'fa-layer-group',
    'sonstige': 'fa-folder',
    'andere': 'fa-folder',
    'misc': 'fa-folder-open',
    'various': 'fa-layer-group',
    
    // Arbeitsbezogene Kategorien
    'arbeit': 'fa-briefcase',
    'work': 'fa-briefcase',
    'business': 'fa-business-time',
    'büro': 'fa-building',
    'office': 'fa-building',
    'projekt': 'fa-tasks',
    'project': 'fa-tasks',
    'meeting': 'fa-users',
    'besprechung': 'fa-users',

    // Persönliche Kategorien
    'privat': 'fa-home',
    'personal': 'fa-user',
    'familie': 'fa-users',
    'family': 'fa-users',
    'freunde': 'fa-user-friends',
    'friends': 'fa-user-friends',
    
    // Finanzen
    'rechnung': 'fa-file-invoice-dollar',
    'finanzen': 'fa-euro-sign',
    'geld': 'fa-money-bill-wave',
    'invoice': 'fa-file-invoice-dollar',
    'finance': 'fa-euro-sign',
    'money': 'fa-money-bill-wave',
    'bank': 'fa-landmark',
    
    // Einkaufen
    'einkauf': 'fa-shopping-cart',
    'bestellung': 'fa-shopping-basket',
    'shopping': 'fa-shopping-cart',
    'order': 'fa-shopping-basket',
    'bestätigung': 'fa-check-circle',
    'confirmation': 'fa-check-circle',
    
    // Reisen
    'reise': 'fa-plane',
    'travel': 'fa-plane',
    'flug': 'fa-plane-departure',
    'flight': 'fa-plane-departure',
    'hotel': 'fa-hotel',
    'urlaub': 'fa-umbrella-beach',
    'vacation': 'fa-umbrella-beach',
    
    // Soziale Medien
    'social': 'fa-hashtag',
    'sozial': 'fa-hashtag',
    'facebook': 'fa-facebook',
    'twitter': 'fa-twitter',
    'instagram': 'fa-instagram',
    'linkedin': 'fa-linkedin',
    'youtube': 'fa-youtube',
    
    // Bildung
    'bildung': 'fa-graduation-cap',
    'education': 'fa-graduation-cap',
    'schule': 'fa-school',
    'school': 'fa-school',
    'uni': 'fa-university',
    'university': 'fa-university',
    'lernen': 'fa-book',
    'learning': 'fa-book',
    'kurs': 'fa-chalkboard-teacher',
    'course': 'fa-chalkboard-teacher',
    
    // Gesundheit
    'gesundheit': 'fa-heartbeat',
    'health': 'fa-heartbeat',
    'arzt': 'fa-user-md',
    'doctor': 'fa-user-md',
    'medizin': 'fa-pills',
    'medicine': 'fa-pills',
    'termin': 'fa-calendar-check',
    'appointment': 'fa-calendar-check',
    
    // Prioritäten
    'wichtig': 'fa-exclamation-circle',
    'important': 'fa-exclamation-circle',
    'dringend': 'fa-exclamation-triangle',
    'urgent': 'fa-exclamation-triangle',
    'todo': 'fa-clipboard-list',
    'später': 'fa-clock',
    'later': 'fa-clock',
    'archiv': 'fa-archive',
    'archive': 'fa-archive',
    
    // Tech
    'tech': 'fa-laptop-code',
    'technik': 'fa-laptop-code',
    'it': 'fa-server',
    'software': 'fa-code',
    'hardware': 'fa-microchip',
    'computer': 'fa-desktop',
    'programmierung': 'fa-code',
    'coding': 'fa-code',
    
    // Newsletter und Updates
    'newsletter': 'fa-newspaper',
    'updates': 'fa-sync',
    'news': 'fa-newspaper',
    'nachrichten': 'fa-newspaper',
    
    // Spam und Werbung
    'spam': 'fa-ban',
    'junk': 'fa-trash-alt',
    'werbung': 'fa-ad',
    'ads': 'fa-ad',
    'marketing': 'fa-bullhorn'
  };

  private defaultIcon = 'fa-tag';

  constructor() { }

  findIconForCategory(categoryName: string): string {
    if (!categoryName) return this.defaultIcon;
    
    const nameLower = categoryName.toLowerCase().trim();
    
    for (const [keyword, icon] of Object.entries(this.iconMap)) {
      if (nameLower === keyword) {
        return icon;
      }
    }
    
    for (const [keyword, icon] of Object.entries(this.iconMap)) {
      if (nameLower.startsWith(keyword + ' ') || nameLower === keyword) {
        return icon;
      }
    }
    
    const words = nameLower.split(/\s+/);
    for (const word of words) {
      if (word.length > 3) {
        const matchingKeyword = Object.keys(this.iconMap).find(k => k === word);
        if (matchingKeyword) {
          return this.iconMap[matchingKeyword];
        }
      }
    }
    
    for (const [keyword, icon] of Object.entries(this.iconMap)) {
      if (keyword.length > 3 && nameLower.includes(keyword)) {
        return icon;
      }
    }
    
    let bestMatch = { keyword: '', score: 0 };
    for (const [keyword, icon] of Object.entries(this.iconMap)) {
      if (keyword.length < 4) continue;
      
      let score = 0;
      if (nameLower.includes(keyword)) {
        score = keyword.length * 2;
      } else if (keyword.includes(nameLower) && nameLower.length > 3) {
        score = nameLower.length;
      }

      if (score > bestMatch.score) {
        bestMatch = { keyword, score };
      }
    }
    
    if (bestMatch.score > 0) {
      return this.iconMap[bestMatch.keyword];
    }
   
    return this.defaultIcon;
  }
}
