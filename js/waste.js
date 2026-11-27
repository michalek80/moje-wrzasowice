/**
 * Moduł gospodarki odpadami dla Moje Wrząsowice
 * Oblicza najbliższe odbiory, formatuje opisy frakcji oraz umożliwia dostosowanie terminów.
 */

const WasteEngine = {
  STORAGE_KEY: 'wrzasowice_waste_schedule',

  /**
   * Zwraca harmonogram (zapisany przez użytkownika, domyślny lub dynamicznie wygenerowany)
   */
  getSchedule() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Błąd odczytu harmonogramu odpadów:', e);
    }

    const base = [...DEFAULT_WASTE_SCHEDULE];
    // Sprawdź czy najpóźniejsza data nie minęła – jeśli tak, uzupełnij automatycznie
    const lastDate = base[base.length - 1]?.date;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (!lastDate || lastDate < todayStr) {
      return this.generateFutureMondays(now, 12);
    }

    return base;
  },

  /**
   * Generuje kolejne poniedziałki dla wywozu odpadów (fallback na przyszłe lata)
   */
  generateFutureMondays(startDate = new Date(), count = 10) {
    const list = [];
    const d = new Date(startDate);
    // Znajdź najbliższy poniedziałek
    const day = d.getDay();
    const diff = (day === 0 ? 1 : (8 - day)) % 7;
    d.setDate(d.getDate() + diff);

    for (let i = 0; i < count; i++) {
      const dateStr = d.toISOString().split('T')[0];
      // Co 2 tygodnie zmieszane+bio, a co 4 tygodnie segregowane
      const type = (i % 2 === 1 && i % 4 === 3) ? 'segregated' : 'mixed_bio';
      list.push({ date: dateStr, type });
      d.setDate(d.getDate() + 7);
    }
    return list;
  },

  /**
   * Zapisuje własny harmonogram
   */
  saveSchedule(newSchedule) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newSchedule));
    } catch (e) {
      console.error('Błąd zapisu harmonogramu:', e);
    }
  },

  /**
   * Resetuje do oficjalnego domyślnego
   */
  resetSchedule() {
    localStorage.removeItem(this.STORAGE_KEY);
  },

  /**
   * Formatuje datę po polsku np. "poniedziałek, 9 lutego 2026"
   */
  formatPolishDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('pl-PL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  },

  /**
   * Oblicza liczbę dni między datami (ignorując godziny)
   */
  daysDiff(targetDateStr, fromDate = new Date()) {
    const target = new Date(targetDateStr + 'T00:00:00');
    const base = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
    const diffMs = target - base;
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  },

  /**
   * Zwraca najbliższy odbiór odpadów
   */
  getNextCollection(now = new Date()) {
    const schedule = this.getSchedule();
    const sorted = [...schedule].sort((a, b) => a.date.localeCompare(b.date));

    for (const item of sorted) {
      const days = this.daysDiff(item.date, now);
      if (days >= 0) {
        const typeInfo = WASTE_TYPES[item.type] || {
          title: item.type,
          badge: item.type,
          color: '#475569',
          bgColor: '#f1f5f9',
          icon: '📦',
          description: 'Odbiór odpadów wg harmonogramu gminy.',
          actionNote: 'Wystaw przed posesję do godz. 6:00 rano'
        };

        let badgeText = '';
        if (days === 0) badgeText = 'DZISIAJ (do 6:00 rano)';
        else if (days === 1) badgeText = 'JUTRO rano';
        else if (days === 2) badgeText = 'POJUTRZE';
        else if (days <= 7) badgeText = `W ten ${this.formatPolishDate(item.date).split(',')[0]} (za ${days} dni)`;
        else badgeText = `Za ${days} dni`;

        return {
          ...item,
          ...typeInfo,
          daysLeft: days,
          badgeText,
          formattedDate: this.formatPolishDate(item.date),
          isUrgent: days <= 1
        };
      }
    }

    return null;
  },

  /**
   * Zwraca listę najbliższych N odbiorów do kalendarza
   */
  getUpcomingCollections(limit = 8, now = new Date()) {
    const schedule = this.getSchedule();
    const sorted = [...schedule].sort((a, b) => a.date.localeCompare(b.date));
    const results = [];

    for (const item of sorted) {
      const days = this.daysDiff(item.date, now);
      if (days >= 0) {
        const typeInfo = WASTE_TYPES[item.type] || {};
        results.push({
          ...item,
          ...typeInfo,
          daysLeft: days,
          formattedDate: this.formatPolishDate(item.date)
        });
        if (results.length >= limit) break;
      }
    }

    return results;
  }
};
