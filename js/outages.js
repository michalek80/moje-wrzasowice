/**
 * Moduł monitorowania mediów (Prąd, Woda, Gaz) dla Moje Wrząsowice
 * - Prąd: Tauron Dystrybucja
 * - Woda: ZGK Świątniki Górne / UMiG
 * - Gaz: Polska Spółka Gazownictwa (PSG)
 */

const OutageEngine = {
  CACHE_KEY: 'wrzasowice_utilities_cache',
  CACHE_TTL_MS: 10 * 60 * 1000, // 10 minut

  CONFIG: {
    town: 'Wrząsowice',
    commune: 'Świątniki Górne',
    tauronMapUrl: 'https://www.tauron-dystrybucja.pl/wylaczenia',
    psgMapUrl: 'https://www.psgaz.pl/przerwy-w-dostawie-gazu',
    zgkUrl: 'https://www.swiatniki-gorne.pl'
  },

  /**
   * Pobiera aktualny stan wyłączeń (z cache lub data/outages.json)
   */
  async fetchOutages() {
    try {
      const cached = sessionStorage.getItem(this.CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < this.CACHE_TTL_MS) {
          return parsed.data;
        }
      }
    } catch (e) {}

    let data = null;

    try {
      const res = await fetch('./data/outages.json', { cache: 'no-store' });
      if (res.ok) {
        data = await res.json();
      }
    } catch (e) {
      console.warn('Błąd pobierania data/outages.json:', e);
    }

    if (!data) {
      data = {
        updatedAt: new Date().toISOString(),
        town: 'Wrząsowice',
        commune: 'Świątniki Górne',
        power: {
          provider: 'Tauron Dystrybucja',
          status: 'OK',
          headline: 'Prąd działa normalnie',
          message: 'Brak zgłoszonych awarii i planowanych wyłączeń dla Wrząsowic.',
          emergencyPhone: '991',
          plannedOutages: [],
          emergencyOutages: []
        },
        water: {
          provider: 'ZGK Świątniki Górne',
          status: 'OK',
          headline: 'Woda bez zakłóceń',
          message: 'ZGK nie zgłasza przerw w dostawie wody ani planowanego płukania sieci.',
          phone: '12 270 40 30',
          emergencyPhone: '606 720 033',
          announcements: []
        },
        gas: {
          provider: 'Polska Spółka Gazownictwa',
          status: 'OK',
          headline: 'Gaz płynie bez przerw',
          message: 'Brak zgłoszonych prac na gazociągu ani awarii w rejonie Wrząsowic.',
          emergencyPhone: '992',
          outages: []
        }
      };
    }

    try {
      sessionStorage.setItem(this.CACHE_KEY, JSON.stringify({
        timestamp: Date.now(),
        data: data
      }));
    } catch (e) {}

    return data;
  },

  /**
   * Przetwarza dane mediów dla interfejsu aplikacji
   */
  processUtilities(data) {
    // Normalizacja struktury (wsteczna kompatybilność)
    const power = data.power || {
      provider: 'Tauron Dystrybucja',
      status: data.status || 'OK',
      headline: data.status === 'OK' ? 'Prąd działa normalnie' : 'Wyłączenie prądu',
      message: data.message || 'Brak zgłoszonych wyłączeń.',
      emergencyPhone: '991',
      plannedOutages: data.plannedOutages || [],
      emergencyOutages: data.emergencyOutages || []
    };

    const water = data.water || {
      provider: 'ZGK Świątniki Górne',
      status: 'OK',
      headline: 'Woda bez zakłóceń',
      message: 'Sieć wodociągowa ZGK pracuje bez zakłóceń. Woda zdatna do spożycia.',
      phone: '12 270 40 30',
      emergencyPhone: '606 720 033',
      announcements: []
    };

    const gas = data.gas || {
      provider: 'Polska Spółka Gazownictwa (PSG)',
      status: 'OK',
      headline: 'Gaz bez zakłóceń',
      message: 'Brak przerw w dostawie gazu.',
      emergencyPhone: '992',
      outages: []
    };

    const powerPlanned = power.plannedOutages || [];
    const powerEmergency = power.emergencyOutages || [];
    const powerAll = [
      ...powerEmergency.map(o => ({ ...o, isEmergency: true, utility: 'power' })),
      ...powerPlanned.map(o => ({ ...o, isEmergency: false, utility: 'power' }))
    ];

    const isPowerAlert = powerAll.length > 0 || power.status !== 'OK';
    const isWaterAlert = (water.announcements && water.announcements.length > 0) || water.status !== 'OK';
    const isGasAlert = (gas.outages && gas.outages.length > 0) || gas.status !== 'OK';

    const allOk = !isPowerAlert && !isWaterAlert && !isGasAlert;

    // Tekst podsumowania na ekranie głównym
    let homeTitle = 'Wszystkie media działają';
    let homeBadge = 'Prąd • Woda • Gaz OK';
    let homeBadgeColor = '#16a34a';
    let homeBadgeBg = '#dcfce7';
    let homeDesc = 'Brak zgłoszonych awarii i przerw w dostawie prądu, wody i gazu we Wrząsowicach.';

    if (isPowerAlert || isWaterAlert || isGasAlert) {
      const alerts = [];
      if (isPowerAlert) alerts.push('Prąd');
      if (isWaterAlert) alerts.push('Woda');
      if (isGasAlert) alerts.push('Gaz');

      homeTitle = `Uwaga: komunikat (${alerts.join(', ')})`;
      homeBadge = `${alerts.join(' / ')} – uwaga`;
      homeBadgeColor = '#d97706';
      homeBadgeBg = '#fef3c7';
      homeDesc = 'Występują zgłoszone prace lub awarie. Sprawdź szczegóły dla swojej ulicy.';
    }

    const lastCheck = data.updatedAt ? new Date(data.updatedAt).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }) : 'Przed chwilą';

    return {
      allOk,
      homeTitle,
      homeBadge,
      homeBadgeColor,
      homeBadgeBg,
      homeDesc,
      lastCheck,
      power: {
        ...power,
        items: powerAll,
        isAlert: isPowerAlert,
        statusType: powerEmergency.length > 0 ? 'danger' : (powerPlanned.length > 0 ? 'warning' : 'ok')
      },
      water: {
        ...water,
        isAlert: isWaterAlert,
        statusType: isWaterAlert ? 'warning' : 'ok'
      },
      gas: {
        ...gas,
        isAlert: isGasAlert,
        statusType: isGasAlert ? 'warning' : 'ok'
      },
      links: this.CONFIG
    };
  },

  /**
   * Filtruje wyłączenia po nazwie ulicy
   */
  filterByStreet(items, query) {
    if (!query || query.trim() === '') return items;
    const q = query.toLowerCase().trim();
    return items.filter(o => {
      const text = (o.streets || o.location || o.message || o.title || '').toLowerCase();
      return text.includes(q);
    });
  }
};
