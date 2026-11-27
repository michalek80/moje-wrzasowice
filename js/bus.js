/**
 * Moduł silnika rozkładów jazdy MPK Kraków dla Moje Wrząsowice
 * Obsługuje linie 215, 225, 915, obliczanie odjazdów na żywo i zapis ulubionego przystanku.
 */

const BusEngine = {
  // Klucz w localStorage
  STORAGE_KEY: 'wrzasowice_fav_bus_stop',

  /**
   * Pobiera zapisany ulubiony przystanek lub domyślny (Wrząsowice Centrum -> Borek Fałęcki)
   */
  getFavoriteStop() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const line = MPK_DATA.lines[parsed.line];
        if (line && line.stops.some(s => s.id === parsed.stopId) && line.directions[parsed.direction]) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Błąd odczytu ulubionego przystanku:', e);
    }
    return { ...APP_CONFIG.defaultStop };
  },

  /**
   * Zapisuje ulubiony przystanek
   */
  setFavoriteStop(line, stopId, direction) {
    const fav = { line, stopId, direction };
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(fav));
    } catch (e) {
      console.error('Błąd zapisu ulubionego przystanku:', e);
    }
    return fav;
  },

  /**
   * Sprawdza typ dnia (dni powszednie, sobota, niedziela i święta)
   */
  getDayType(date = new Date()) {
    const day = date.getDay(); // 0 = niedziela, 6 = sobota
    if (day === 0) return 'sunday';
    if (day === 6) return 'saturday';
    return 'weekdays';
  },

  /**
   * Dodaje/odejmuje minuty od formatu "HH:MM"
   */
  shiftTime(timeStr, offsetMinutes) {
    const [h, m] = timeStr.split(':').map(Number);
    let totalMinutes = h * 60 + m + offsetMinutes;
    // Normalizacja do 24h
    while (totalMinutes < 0) totalMinutes += 1440;
    totalMinutes = totalMinutes % 1440;

    const newH = Math.floor(totalMinutes / 60);
    const newM = totalMinutes % 60;
    return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
  },

  /**
   * Przekształca "HH:MM" na liczbę minut od północy
   */
  timeToMinutes(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  },

  /**
   * Przekształca "HH:MM" na minuty w ramach doby komunikacyjnej
   * (dla linii dziennych kursy 00:00-03:59 są traktowane jako koniec doby: 24:00+)
   */
  serviceTimeToMinutes(timeStr, lineType = 'dzienna') {
    const [h, m] = timeStr.split(':').map(Number);
    if (lineType !== 'nocna' && h < 4) {
      return (h + 24) * 60 + m;
    }
    return h * 60 + m;
  },

  /**
   * Pobiera dokładne odjazdy dla danego przystanku (z GTFS lub z przesunięcia bazowego)
   */
  getStopTimetable(lineId, stopId, direction, dayType = 'weekdays') {
    const line = MPK_DATA.lines[lineId];
    if (!line) return [];

    if (line.stopSchedules && line.stopSchedules[stopId] && line.stopSchedules[stopId][direction]) {
      return line.stopSchedules[stopId][direction][dayType] || [];
    }

    const stop = line.stops.find(s => s.id === stopId);
    if (!stop) return [];

    const baseList = (line.baseSchedule && line.baseSchedule[direction] && line.baseSchedule[direction][dayType]) || [];
    const offset = direction === 'to_krakow' ? (stop.offsetKrakow || 0) : (stop.offsetSuburb || 0);

    const computed = baseList.map(t => this.shiftTime(t, offset));
    return computed.sort((a, b) => this.serviceTimeToMinutes(a, line.type) - this.serviceTimeToMinutes(b, line.type));
  },

  /**
   * Zwraca najbliższe odjazdy od podanego czasu (domyślnie teraz)
   */
  getNextDepartures(lineId, stopId, direction, now = new Date(), limit = 3) {
    const line = MPK_DATA.lines[lineId];
    const lineType = line ? line.type : 'dzienna';
    const dayType = this.getDayType(now);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const todayTimes = this.getStopTimetable(lineId, stopId, direction, dayType);
    const results = [];

    // Jeśli jest po północy (00:00 - 03:59) dla linii dziennej, sprawdź końcówkę doby wczorajszej
    if (lineType !== 'nocna' && now.getHours() < 4) {
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const yesterdayTimes = this.getStopTimetable(lineId, stopId, direction, this.getDayType(yesterday));
      for (const timeStr of yesterdayTimes) {
        const [h] = timeStr.split(':').map(Number);
        if (h < 4) {
          const depMinutes = this.timeToMinutes(timeStr);
          if (depMinutes >= currentMinutes) {
            const diff = depMinutes - currentMinutes;
            results.push({
              time: timeStr,
              minutesLeft: diff,
              isToday: true,
              label: diff === 0 ? 'TERAZ' : `za ${diff} min`
            });
            if (results.length >= limit) return results;
          }
        }
      }
    }

    // Szukamy dzisiejszych odjazdów
    for (const timeStr of todayTimes) {
      const depMinutes = this.serviceTimeToMinutes(timeStr, lineType);
      if (depMinutes >= currentMinutes) {
        const diff = depMinutes - currentMinutes;
        results.push({
          time: timeStr,
          minutesLeft: diff,
          isToday: true,
          label: diff === 0 ? 'TERAZ' : (diff < 60 ? `za ${diff} min` : `za ${Math.floor(diff/60)}h ${diff%60}m`)
        });
        if (results.length >= limit) break;
      }
    }

    // Jeśli brakuje do limitu (np. późny wieczór), pobierz pierwsze kursy z jutra
    if (results.length < limit) {
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const tomorrowDayType = this.getDayType(tomorrow);
      const tomorrowTimes = this.getStopTimetable(lineId, stopId, direction, tomorrowDayType);

      for (const timeStr of tomorrowTimes) {
        const depMinutes = this.serviceTimeToMinutes(timeStr, lineType);
        const diff = (1440 - currentMinutes) + depMinutes;
        results.push({
          time: timeStr,
          minutesLeft: diff,
          isToday: false,
          label: `jutro ${timeStr}`
        });
        if (results.length >= limit) break;
      }
    }

    return results;
  },

  /**
   * Zwraca szczegółowe dane przystanku i linii do wyświetlenia
   */
  getStopInfo(lineId, stopId, direction) {
    const line = MPK_DATA.lines[lineId];
    if (!line) return null;
    const stop = line.stops.find(s => s.id === stopId);
    const dirInfo = line.directions[direction];

    return {
      line: line.number,
      lineName: line.name,
      stopName: stop ? stop.name : stopId,
      directionTitle: dirInfo ? dirInfo.title : direction,
      destination: dirInfo ? dirInfo.dest : '',
      via: dirInfo ? dirInfo.via : ''
    };
  }
};
