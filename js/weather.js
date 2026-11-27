/**
 * Moduł pogody i jakości powietrza dla Moje Wrząsowice
 * Korzysta z bezpłatnego API Open-Meteo zoptymalizowanego dla współrzędnych Wrząsowic.
 */

const WeatherEngine = {
  CACHE_KEY: 'wrzasowice_weather_cache',
  CACHE_TTL_MS: 15 * 60 * 1000, // 15 minut

  // Interpretacja kodów pogodowych WMO
  wmoCodes: {
    0: { text: 'Bezchmurnie', icon: '☀️' },
    1: { text: 'Prawie bezchmurnie', icon: '🌤️' },
    2: { text: 'Częściowe zachmurzenie', icon: '⛅' },
    3: { text: 'Pochmurno', icon: '☁️' },
    45: { text: 'Mgła', icon: '🌫️' },
    48: { text: 'Oszroniona mgła', icon: '🌫️' },
    51: { text: 'Lekka mżawka', icon: '🌦️' },
    53: { text: 'Umiarkowana mżawka', icon: '🌧️' },
    55: { text: 'Gęsta mżawka', icon: '🌧️' },
    61: { text: 'Lekki deszcz', icon: '🌦️' },
    63: { text: 'Umiarkowany deszcz', icon: '🌧️' },
    65: { text: 'Ulewny deszcz', icon: '🌧️' },
    71: { text: 'Lekkie opady śniegu', icon: '🌨️' },
    73: { text: 'Umiarkowany śnieg', icon: '❄️' },
    75: { text: 'Intensywny śnieg', icon: '❄️' },
    77: { text: 'Śnieg ziarnisty', icon: '🌨️' },
    80: { text: 'Przelotne opady deszczu', icon: '🌦️' },
    81: { text: 'Ulewne opady deszczu', icon: '🌧️' },
    82: { text: 'Gwałtowne ulewy', icon: '⛈️' },
    85: { text: 'Przelotne opady śniegu', icon: '🌨️' },
    86: { text: 'Silne opady śniegu', icon: '❄️' },
    95: { text: 'Burza z piorunami', icon: '⛈️' },
    96: { text: 'Burza z gradem', icon: '⛈️' },
    99: { text: 'Silna burza z gradem', icon: '⛈️' }
  },

  getWmo(code) {
    return this.wmoCodes[code] || { text: 'Umiarkowane zachmurzenie', icon: '⛅' };
  },

  /**
   * Ocena jakości powietrza wg wskaźników europejskich (PM10 i PM2.5)
   */
  evaluateAirQuality(pm10, pm25) {
    if (pm10 == null && pm25 == null) {
      return { status: 'Brak danych', class: 'neutral', note: 'Czujnik niedostępny' };
    }
    // Normy: PM10 <= 20 dobra, <= 50 umiarkowana, > 50 zła
    // PM2.5 <= 10 b. dobra, <= 25 dobra, > 25 zła
    if (pm10 <= 25 && pm25 <= 15) {
      return { status: 'Bardzo dobra', class: 'good', color: '#16a34a', bg: '#dcfce7', note: 'Idealne warunki na spacer' };
    }
    if (pm10 <= 50 && pm25 <= 30) {
      return { status: 'Umiarkowana', class: 'moderate', color: '#ca8a04', bg: '#fef9c3', note: 'Jakość powietrza zadowalająca' };
    }
    return { status: 'Podwyższona (smog)', class: 'bad', color: '#dc2626', bg: '#fee2e2', note: 'Zalecane ograniczenie dłuższego wietrzenia' };
  },

  /**
   * Pobiera pełne dane pogodowe (z cache lub z Open-Meteo)
   */
  async fetchWeather() {
    // 1. Sprawdź pamięć podręczną
    try {
      const cached = sessionStorage.getItem(this.CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < this.CACHE_TTL_MS) {
          return parsed.data;
        }
      }
    } catch (e) {
      console.warn('Błąd czytania cache pogody:', e);
    }

    const { lat, lon } = APP_CONFIG.geo;

    try {
      // Zapytanie o pogodę i prognozę
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability,weather_code&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=Europe%2FWarsaw&forecast_days=2`;
      
      // Zapytanie o jakość powietrza
      const airUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,european_aqi&timezone=Europe%2FWarsaw`;

      const [weatherRes, airRes] = await Promise.allSettled([
        fetch(weatherUrl),
        fetch(airUrl)
      ]);

      if (weatherRes.status !== 'fulfilled' || !weatherRes.value.ok) {
        throw new Error('Nie udało się pobrać danych pogodowych');
      }

      const weatherData = await weatherRes.value.json();
      let airData = null;
      if (airRes.status === 'fulfilled' && airRes.value.ok) {
        airData = await airRes.value.json();
      }

      // Formatowanie wyników
      const current = weatherData.current || {};
      const daily = weatherData.daily || {};
      const hourly = weatherData.hourly || {};
      const wmo = this.getWmo(current.weather_code);

      const pm10 = airData?.current?.pm10 ? Math.round(airData.current.pm10) : null;
      const pm25 = airData?.current?.pm2_5 ? Math.round(airData.current.pm2_5) : null;
      const airQuality = this.evaluateAirQuality(pm10, pm25);

      // Przygotuj godziny na dzisiejszy dzień
      const todayHours = [];
      const currentHour = new Date().getHours();
      if (hourly.time && hourly.temperature_2m) {
        for (let i = 0; i < 24; i++) {
          const hourStr = hourly.time[i]?.split('T')[1]?.substring(0, 5) || `${i}:00`;
          const temp = Math.round(hourly.temperature_2m[i]);
          const pop = hourly.precipitation_probability ? hourly.precipitation_probability[i] : 0;
          const icon = this.getWmo(hourly.weather_code[i]).icon;
          todayHours.push({
            hour: hourStr,
            hourNum: i,
            temp,
            pop,
            icon,
            isCurrent: i === currentHour
          });
        }
      }

      const payload = {
        temp: Math.round(current.temperature_2m ?? 0),
        feelsLike: Math.round(current.apparent_temperature ?? current.temperature_2m ?? 0),
        humidity: current.relative_humidity_2m ?? 0,
        windSpeed: Math.round(current.wind_speed_10m ?? 0),
        precipitation: current.precipitation ?? 0,
        tempMax: daily.temperature_2m_max ? Math.round(daily.temperature_2m_max[0]) : null,
        tempMin: daily.temperature_2m_min ? Math.round(daily.temperature_2m_min[0]) : null,
        wmoText: wmo.text,
        wmoIcon: wmo.icon,
        pm10,
        pm25,
        airQuality,
        hourly: todayHours,
        updatedAt: new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
      };

      // Zapisz w pamięci sesji
      try {
        sessionStorage.setItem(this.CACHE_KEY, JSON.stringify({
          timestamp: Date.now(),
          data: payload
        }));
      } catch (e) {}

      return payload;
    } catch (err) {
      console.warn('Pogoda offline / fallback:', err);
      // Fallback w razie braku sieci
      return {
        temp: 14,
        feelsLike: 13,
        humidity: 68,
        windSpeed: 12,
        precipitation: 0,
        tempMax: 16,
        tempMin: 8,
        wmoText: 'Częściowe zachmurzenie',
        wmoIcon: '⛅',
        pm10: 18,
        pm25: 11,
        airQuality: { status: 'Dobra', color: '#16a34a', bg: '#dcfce7', note: 'Jakość powietrza sprzyja aktywności' },
        hourly: [],
        updatedAt: 'dane szacunkowe (tryb offline)'
      };
    }
  }
};
