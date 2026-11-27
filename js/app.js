/**
 * Główny skrypt aplikacji Moje Wrząsowice (app.js)
 * Odpowiada za logikę UI, nawigację, odświeżanie widgetów i zdarzenia użytkownika.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Inicjalizacja nagłówka z datą
  initHeaderDate();

  // 2. Inicjalizacja PWA i Service Workera
  initPWA();

  // 3. Obsługa nawigacji (dolny pasek)
  initNavigation();

  // 4. Inicjalizacja widgetu i ekranu głównego
  refreshBusWidget();
  refreshWeatherWidget();
  refreshWasteWidget();
  refreshOutagesWidget();

  // 5. Inicjalizacja pozostałych zakładek
  initMpkTab();
  initWasteTab();
  initContactsTab();
  initCultureTab();
  initOutagesTab();

  // 6. Inicjalizacja modali
  initModals();

  // Odświeżaj odliczanie autobusu co 30 sekund
  setInterval(() => {
    refreshBusWidget();
  }, 30000);
});

// ==========================================
// 1. NAGŁÓWEK I DATA
// ==========================================
function initHeaderDate() {
  const dateEl = document.getElementById('header-date');
  if (!dateEl) return;
  const now = new Date();
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  const formatted = now.toLocaleDateString('pl-PL', options);
  // Pierwsza litera wielka
  dateEl.textContent = formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

// ==========================================
// 2. PWA & SERVICE WORKER
// ==========================================
let deferredPrompt = null;

function initPWA() {
  const installBtn = document.getElementById('btn-install-pwa');
  const installModal = document.getElementById('modal-install-guide');

  // Sprawdź czy już zainstalowano (standalone)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  if (isStandalone && installBtn) {
    installBtn.style.display = 'none';
  }

  // Rejestracja Service Workera
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then((reg) => console.log('Service Worker zarejestrowany:', reg.scope))
      .catch((err) => console.warn('Błąd Service Workera:', err));
  }

  // Zdarzenie beforeinstallprompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) installBtn.style.display = 'inline-flex';
  });

  // Kliknięcie w przycisk zainstaluj
  if (installBtn) {
    installBtn.addEventListener('click', () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choice) => {
          if (choice.outcome === 'accepted') {
            installBtn.style.display = 'none';
          }
          deferredPrompt = null;
        });
      } else {
        // Pokaż modal z instrukcją dla iOS / innych
        openModal('modal-install-guide');
      }
    });
  }

  // Potwierdzenie w modalu instalacji
  const confirmBtn = document.getElementById('btn-install-confirm');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => closeModal('modal-install-guide'));
  }
}

// ==========================================
// 3. NAWIGACJA MIĘDZY ZAKŁADKAMI
// ==========================================
function initNavigation() {
  const navButtons = document.querySelectorAll('.nav-btn');
  const tabs = document.querySelectorAll('.tab-pane');

  navButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetTabId = btn.getAttribute('data-tab');
      switchTab(targetTabId);
    });
  });

  // Skróty z ekranu głównego do innych tabów
  const linkMpk = document.getElementById('link-goto-mpk-tab');
  if (linkMpk) {
    linkMpk.addEventListener('click', () => switchTab('tab-mpk'));
  }

  const btnWasteTab = document.getElementById('btn-open-waste-tab');
  if (btnWasteTab) {
    btnWasteTab.addEventListener('click', () => switchTab('tab-waste'));
  }

  const linkOutages = document.getElementById('link-goto-outages');
  if (linkOutages) {
    linkOutages.addEventListener('click', () => {
      switchTab('tab-contacts');
      const target = document.getElementById('outages-detail-card');
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  }
}

function switchTab(tabId) {
  // Przyciski dolnego paska
  document.querySelectorAll('.nav-btn').forEach((b) => {
    b.classList.toggle('active', b.getAttribute('data-tab') === tabId);
  });

  // Panele
  document.querySelectorAll('.tab-pane').forEach((tab) => {
    tab.classList.toggle('active', tab.id === tabId);
  });

  // Przewiń do samej góry
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Jeśli otworzono tab MPK, upewnij się że selektory są zsynchronizowane
  if (tabId === 'tab-mpk') {
    const fav = BusEngine.getFavoriteStop();
    const lineSel = document.getElementById('mpk-line-select');
    if (lineSel && lineSel.value !== fav.line) {
      lineSel.value = fav.line;
      populateMpkStopsAndDirs(fav.line, fav.stopId, fav.direction);
    }
    renderMpkTimetableGrid();
  }
}

// ==========================================
// 4. WIDGET ROZKŁADU MPK NA EKRANIE GŁÓWNYM
// ==========================================
function refreshBusWidget() {
  const fav = BusEngine.getFavoriteStop();
  const info = BusEngine.getStopInfo(fav.line, fav.stopId, fav.direction);
  if (!info) return;

  const stopNameEl = document.getElementById('widget-stop-name');
  const stopDirEl = document.getElementById('widget-stop-dir');
  const lineBadgeEl = document.getElementById('widget-line-badge');
  const timeEl = document.getElementById('widget-time');
  const countEl = document.getElementById('widget-countdown');
  const nextListEl = document.getElementById('widget-next-list');

  if (stopNameEl) stopNameEl.textContent = info.stopName;
  if (stopDirEl) stopDirEl.textContent = info.directionTitle;
  if (lineBadgeEl) lineBadgeEl.textContent = `Linia ${info.line}`;

  // Oblicz najbliższe odjazdy
  const deps = BusEngine.getNextDepartures(fav.line, fav.stopId, fav.direction, new Date(), 3);

  if (deps.length > 0) {
    const first = deps[0];
    if (timeEl) timeEl.textContent = first.time;
    if (countEl) countEl.textContent = first.label;

    if (nextListEl) {
      const rest = deps.slice(1);
      if (rest.length > 0) {
        const nextTimes = rest.map(d => `<span>${d.time}</span> (${d.label})`).join(', ');
        nextListEl.innerHTML = `Następne: ${nextTimes}`;
      } else {
        nextListEl.innerHTML = `Ostatni kurs dzisiaj`;
      }
    }
  } else {
    if (timeEl) timeEl.textContent = '--:--';
    if (countEl) countEl.textContent = 'Brak kursów';
    if (nextListEl) nextListEl.textContent = 'Sprawdź rozkład na jutro';
  }
}

// ==========================================
// 5. WIDGET POGODY NA ŻYWO (OPEN-METEO)
// ==========================================
async function refreshWeatherWidget() {
  try {
    const data = await WeatherEngine.fetchWeather();
    
    const tempEl = document.getElementById('weather-temp');
    const feelsEl = document.getElementById('weather-feels');
    const descEl = document.getElementById('weather-desc');
    const iconEl = document.getElementById('weather-icon');
    const maxEl = document.getElementById('weather-max');
    const minEl = document.getElementById('weather-min');
    const windEl = document.getElementById('weather-wind');
    const updatedEl = document.getElementById('weather-updated');

    if (tempEl) tempEl.textContent = data.temp;
    if (feelsEl) feelsEl.textContent = data.feelsLike;
    if (descEl) descEl.textContent = data.wmoText;
    if (iconEl) iconEl.textContent = data.wmoIcon;
    if (maxEl) maxEl.textContent = (data.tempMax != null ? data.tempMax : '--') + '°';
    if (minEl) minEl.textContent = (data.tempMin != null ? data.tempMin : '--') + '°';
    if (windEl) windEl.textContent = data.windSpeed;
    if (updatedEl && data.updatedAt) updatedEl.textContent = `Aktualizacja: ${data.updatedAt}`;

    // Jakość powietrza
    const airStatusEl = document.getElementById('air-status');
    const airBadgeEl = document.getElementById('air-badge');
    const pm10El = document.getElementById('air-pm10');
    const pm25El = document.getElementById('air-pm25');

    if (airStatusEl) airStatusEl.textContent = data.airQuality.status;
    if (pm10El) pm10El.textContent = data.pm10 ?? '--';
    if (pm25El) pm25El.textContent = data.pm25 ?? '--';
    if (airBadgeEl) {
      airBadgeEl.textContent = data.airQuality.status;
      airBadgeEl.style.backgroundColor = data.airQuality.bg;
      airBadgeEl.style.color = data.airQuality.color;
    }

    // Oś godzinowa
    const hourlyContainer = document.getElementById('weather-hourly-container');
    if (hourlyContainer && data.hourly && data.hourly.length > 0) {
      hourlyContainer.innerHTML = '';
      data.hourly.forEach((h) => {
        const item = document.createElement('div');
        item.className = `hourly-item ${h.isCurrent ? 'now' : ''}`;
        item.innerHTML = `
          <div class="hourly-time">${h.isCurrent ? 'TERAZ' : h.hour}</div>
          <div class="hourly-icon">${h.icon}</div>
          <div class="hourly-temp">${h.temp}°</div>
        `;
        hourlyContainer.appendChild(item);
      });
    }
  } catch (err) {
    console.error('Błąd widgetu pogody:', err);
  }
}

// ==========================================
// 6. WIDGET WYWOZU ŚMIECI
// ==========================================
function refreshWasteWidget() {
  const next = WasteEngine.getNextCollection();
  if (!next) return;

  const titleEl = document.getElementById('waste-title');
  const pillEl = document.getElementById('waste-countdown-pill');
  const dateEl = document.getElementById('waste-date');
  const descEl = document.getElementById('waste-desc');
  const iconEl = document.getElementById('waste-icon');
  const bannerEl = document.getElementById('waste-banner');
  const upcomingPreviewEl = document.getElementById('waste-next-upcoming');

  if (titleEl) titleEl.textContent = next.title;
  if (pillEl) {
    pillEl.textContent = next.badgeText;
    pillEl.style.backgroundColor = next.color;
  }
  if (dateEl) dateEl.textContent = next.formattedDate;
  if (descEl) descEl.textContent = next.description;
  if (iconEl) iconEl.textContent = next.icon;
  if (bannerEl) {
    bannerEl.style.backgroundColor = next.bgColor;
    bannerEl.style.borderColor = next.color + '40';
  }

  // Podgląd następnego odbioru po nim
  const upcoming = WasteEngine.getUpcomingCollections(2);
  if (upcoming.length > 1 && upcomingPreviewEl) {
    const after = upcoming[1];
    upcomingPreviewEl.innerHTML = `Następny odbiór: <b>${after.title}</b> (${after.formattedDate})`;
  }
}

// ==========================================
// 7. ZAKŁADKA MPK (PEŁNY ROZKŁAD)
// ==========================================
let currentMpkDay = 'weekdays';

function initMpkTab() {
  const lineSelect = document.getElementById('mpk-line-select');
  const stopSelect = document.getElementById('mpk-stop-select');
  const dirSelect = document.getElementById('mpk-dir-select');
  const dayTabButtons = document.querySelectorAll('.day-tab-btn');
  const pinBtn = document.getElementById('btn-pin-as-fav');

  // Wstępne wypełnienie przystanków
  const fav = BusEngine.getFavoriteStop();
  if (lineSelect) {
    lineSelect.value = fav.line;
    populateMpkStopsAndDirs(fav.line, fav.stopId, fav.direction);
  }

  // Zmiana linii
  if (lineSelect) {
    lineSelect.addEventListener('change', () => {
      populateMpkStopsAndDirs(lineSelect.value);
      renderMpkTimetableGrid();
    });
  }

  // Zmiana przystanku lub kierunku
  if (stopSelect) stopSelect.addEventListener('change', renderMpkTimetableGrid);
  if (dirSelect) dirSelect.addEventListener('change', renderMpkTimetableGrid);

  // Zmiana dnia tygodnia
  dayTabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      dayTabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMpkDay = btn.getAttribute('data-day');
      renderMpkTimetableGrid();
    });
  });

  // Przycisk "Przypnij do ekranu głównego"
  if (pinBtn) {
    pinBtn.addEventListener('click', () => {
      const line = lineSelect.value;
      const stop = stopSelect.value;
      const dir = dirSelect.value;
      BusEngine.setFavoriteStop(line, stop, dir);
      refreshBusWidget();
      alert('★ Zapisano ten przystanek na ekranie głównym aplikacji!');
      switchTab('tab-home');
    });
  }

  renderMpkTimetableGrid();
}

function populateMpkStopsAndDirs(lineId, selectedStopId = null, selectedDir = null) {
  const line = MPK_DATA.lines[lineId];
  if (!line) return;

  const stopSelect = document.getElementById('mpk-stop-select');
  const dirSelect = document.getElementById('mpk-dir-select');

  // Przystanki
  if (stopSelect) {
    stopSelect.innerHTML = '';
    line.stops.forEach((s) => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = s.name + (s.isMain ? ' (Główny)' : '');
      if (selectedStopId && s.id === selectedStopId) opt.selected = true;
      stopSelect.appendChild(opt);
    });
  }

  // Kierunki
  if (dirSelect) {
    dirSelect.innerHTML = '';
    Object.keys(line.directions).forEach((dirKey) => {
      const opt = document.createElement('option');
      opt.value = dirKey;
      opt.textContent = line.directions[dirKey].title;
      if (selectedDir && dirKey === selectedDir) opt.selected = true;
      dirSelect.appendChild(opt);
    });
  }
}

function renderMpkTimetableGrid() {
  const lineSelect = document.getElementById('mpk-line-select');
  const stopSelect = document.getElementById('mpk-stop-select');
  const dirSelect = document.getElementById('mpk-dir-select');
  const grid = document.getElementById('mpk-timetable-grid');
  if (!lineSelect || !stopSelect || !dirSelect || !grid) return;

  const lineId = lineSelect.value;
  const stopId = stopSelect.value;
  const direction = dirSelect.value;

  const times = BusEngine.getStopTimetable(lineId, stopId, direction, currentMpkDay);
  grid.innerHTML = '';

  if (times.length === 0) {
    grid.innerHTML = '<div style="grid-column: span 4; text-align: center; color: #94a3b8; padding: 20px;">Brak kursów w wybranym dniu.</div>';
    return;
  }

  // Porównanie z bieżącym czasem
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const isTodayActive = BusEngine.getDayType(now) === currentMpkDay;

  let foundNext = false;

  const line = MPK_DATA.lines[lineId];
  const lineType = line ? line.type : 'dzienna';

  times.forEach((t) => {
    const slot = document.createElement('div');
    slot.className = 'time-slot';
    slot.textContent = t;

    const tMinutes = BusEngine.serviceTimeToMinutes(t, lineType);

    if (isTodayActive) {
      if (tMinutes < currentMinutes) {
        slot.classList.add('past');
      } else if (!foundNext) {
        slot.classList.add('next');
        foundNext = true;
      }
    }

    grid.appendChild(slot);
  });
}

// ==========================================
// 8. ZAKŁADKA ŚMIECI
// ==========================================
function initWasteTab() {
  const listEl = document.getElementById('waste-full-list');
  if (!listEl) return;

  const upcoming = WasteEngine.getUpcomingCollections(10);
  listEl.innerHTML = '';

  upcoming.forEach((item) => {
    const row = document.createElement('div');
    row.style.background = item.bgColor || '#f8fafc';
    row.style.border = `1px solid ${item.color || '#cbd5e1'}40`;
    row.style.borderRadius = '12px';
    row.style.padding = '12px 14px';
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.gap = '12px';

    row.innerHTML = `
      <span style="font-size: 26px;">${item.icon || '📦'}</span>
      <div style="flex: 1;">
        <div style="display: flex; justify-content: space-between; align-items: baseline;">
          <b style="font-size: 14px; color: #0f172a;">${item.title}</b>
          <span style="font-size: 11px; font-weight: 700; color: ${item.color};">
            ${item.daysLeft === 0 ? 'DZISIAJ' : (item.daysLeft === 1 ? 'JUTRO' : `za ${item.daysLeft} dni`)}
          </span>
        </div>
        <div style="font-size: 13px; color: #334155; margin-top: 2px;">${item.formattedDate}</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${item.description}</div>
      </div>
    `;
    listEl.appendChild(row);
  });

  // Obsługa modala edycji JSON
  const editBtn = document.getElementById('btn-edit-waste-schedule');
  const jsonTextarea = document.getElementById('waste-json-textarea');
  const saveJsonBtn = document.getElementById('btn-save-waste-json');
  const resetJsonBtn = document.getElementById('btn-reset-waste-json');

  if (editBtn) {
    editBtn.addEventListener('click', () => {
      const schedule = WasteEngine.getSchedule();
      if (jsonTextarea) jsonTextarea.value = JSON.stringify(schedule, null, 2);
      openModal('modal-edit-waste');
    });
  }

  if (saveJsonBtn && jsonTextarea) {
    saveJsonBtn.addEventListener('click', () => {
      try {
        const parsed = JSON.parse(jsonTextarea.value);
        if (Array.isArray(parsed)) {
          WasteEngine.saveSchedule(parsed);
          refreshWasteWidget();
          initWasteTab();
          closeModal('modal-edit-waste');
          alert('Zapisano zaktualizowany harmonogram!');
        } else {
          alert('Błąd: Podane dane muszą być tablicą obiektów JSON.');
        }
      } catch (err) {
        alert('Błąd składni JSON: ' + err.message);
      }
    });
  }

  if (resetJsonBtn) {
    resetJsonBtn.addEventListener('click', () => {
      if (confirm('Czy na pewno chcesz przywrócić oficjalne daty gminy?')) {
        WasteEngine.resetSchedule();
        refreshWasteWidget();
        initWasteTab();
        closeModal('modal-edit-waste');
      }
    });
  }
}

// ==========================================
// 9. ZAKŁADKA KONTAKTY / SOS
// ==========================================
function initContactsTab() {
  renderContactList('contacts-winter-list', CONTACTS_DATA.winter);
  renderContactList('contacts-health-list', CONTACTS_DATA.health);
  renderContactList('contacts-utilities-list', CONTACTS_DATA.utilities);
  renderContactList('contacts-emergency-list', CONTACTS_DATA.emergency);
}

function renderContactList(containerId, items) {
  const container = document.getElementById(containerId);
  if (!container || !items) return;

  container.innerHTML = '';
  items.forEach((item) => {
    const div = document.createElement('div');
    div.className = 'contact-item';

    const displayNum = item.displayNumber || item.number;
    const callHref = `tel:${item.number.replace(/\s+/g, '')}`;

    div.innerHTML = `
      <div style="flex: 1; padding-right: 10px;">
        <div class="contact-title">${item.icon ? item.icon + ' ' : ''}${item.name}</div>
        <div class="contact-desc">${item.desc || ''}</div>
        ${item.address ? `<div style="font-size: 11px; color: #0284c7; margin-top: 2px;">📍 ${item.address}</div>` : ''}
      </div>
      <a href="${callHref}" class="call-btn">
        <span>📞</span> <span>${displayNum}</span>
      </a>
    `;
    container.appendChild(div);
  });
}

// ==========================================
// 10. ZAKŁADKA WIEŚ I KULTURA
// ==========================================
function initCultureTab() {
  const actContainer = document.getElementById('culture-activities-list');
  const churchContainer = document.getElementById('culture-churches-list');

  // Zajęcia w Starej Szkole
  if (actContainer && CONTACTS_DATA.culture.communityCenter) {
    actContainer.innerHTML = '';
    CONTACTS_DATA.culture.communityCenter.activities.forEach((act) => {
      const item = document.createElement('div');
      item.style.background = '#f8fafc';
      item.style.border = '1px solid var(--border-color)';
      item.style.borderRadius = '8px';
      item.style.padding = '10px 12px';
      item.style.display = 'flex';
      item.style.justifyContent = 'space-between';
      item.style.alignItems = 'center';

      item.innerHTML = `
        <div>
          <b style="font-size: 13px;">${act.title}</b>
          <div style="font-size: 12px; color: var(--text-muted);">${act.day}</div>
        </div>
        <span style="font-size: 12px; font-weight: 700; color: #0284c7; background: #e0f2fe; padding: 3px 8px; border-radius: 6px;">
          ${act.time}
        </span>
      `;
      actContainer.appendChild(item);
    });
  }

  // Kościoły i Msze Święte
  if (churchContainer && CONTACTS_DATA.culture.churches) {
    churchContainer.innerHTML = '';
    CONTACTS_DATA.culture.churches.forEach((c) => {
      const card = document.createElement('div');
      card.style.background = '#f8fafc';
      card.style.border = '1px solid var(--border-color)';
      card.style.borderRadius = '10px';
      card.style.padding = '12px';

      card.innerHTML = `
        <b style="font-size: 14px; color: var(--text-main);">${c.parish}</b>
        <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">📍 ${c.address}</div>
        
        <div style="font-size: 13px; margin-bottom: 4px;">
          <b>Niedziele i święta:</b> <span style="color: #b45309; font-weight: 600;">${c.sundayMasses}</span>
        </div>
        <div style="font-size: 12px; color: var(--text-muted);">
          <b>Dni powszednie:</b> ${c.weekdayMasses}
        </div>
      `;
      churchContainer.appendChild(card);
    });
  }
}

// ==========================================
// 11. MODUŁ MONITOROWANIA MEDIÓW (PRĄD, WODA, GAZ)
// ==========================================
let currentUtilitiesData = null;

async function refreshOutagesWidget() {
  const iconEl = document.getElementById('outage-home-icon');
  const titleEl = document.getElementById('outage-home-title');
  const badgeEl = document.getElementById('outage-home-badge');
  const descEl = document.getElementById('outage-home-desc');
  const timeEl = document.getElementById('outage-home-time');
  const cardEl = document.getElementById('outage-home-card');

  // Wskaźniki mediów
  const pStatus = document.getElementById('media-status-power');
  const wStatus = document.getElementById('media-status-water');
  const gStatus = document.getElementById('media-status-gas');
  const pPill = document.getElementById('media-pill-power');
  const wPill = document.getElementById('media-pill-water');
  const gPill = document.getElementById('media-pill-gas');

  try {
    const rawData = await OutageEngine.fetchOutages();
    currentUtilitiesData = OutageEngine.processUtilities(rawData);

    if (badgeEl) {
      badgeEl.textContent = currentUtilitiesData.homeBadge;
      badgeEl.style.backgroundColor = currentUtilitiesData.homeBadgeBg;
      badgeEl.style.color = currentUtilitiesData.homeBadgeColor;
    }

    if (titleEl) titleEl.textContent = currentUtilitiesData.homeTitle;
    if (descEl) descEl.textContent = currentUtilitiesData.homeDesc;
    if (timeEl) timeEl.textContent = `Sprawdzono: ${currentUtilitiesData.lastCheck}`;

    // Aktualizacja wskaźnika Prąd
    if (pStatus && pPill) {
      const p = currentUtilitiesData.power;
      pStatus.textContent = p.isAlert ? (p.statusType === 'danger' ? 'AWARIA' : 'PLANOWANE') : 'OK';
      pPill.style.backgroundColor = p.isAlert ? (p.statusType === 'danger' ? '#fee2e2' : '#fef3c7') : '#f0fdf4';
      pPill.style.borderColor = p.isAlert ? (p.statusType === 'danger' ? '#fecaca' : '#fde68a') : '#bbf7d0';
    }

    // Aktualizacja wskaźnika Woda
    if (wStatus && wPill) {
      const w = currentUtilitiesData.water;
      wStatus.textContent = w.isAlert ? 'KOMUNIKAT' : 'OK';
      wPill.style.backgroundColor = w.isAlert ? '#fef3c7' : '#f0fdf4';
      wPill.style.borderColor = w.isAlert ? '#fde68a' : '#bbf7d0';
    }

    // Aktualizacja wskaźnika Gaz
    if (gStatus && gPill) {
      const g = currentUtilitiesData.gas;
      gStatus.textContent = g.isAlert ? 'PRACE' : 'OK';
      gPill.style.backgroundColor = g.isAlert ? '#fef3c7' : '#f0fdf4';
      gPill.style.borderColor = g.isAlert ? '#fde68a' : '#bbf7d0';
    }

  } catch (err) {
    console.warn('Błąd widgetu mediów:', err);
  }
}

function initOutagesTab() {
  const streetSearch = document.getElementById('outage-street-search');
  if (streetSearch) {
    streetSearch.addEventListener('input', () => {
      renderOutagesList(streetSearch.value);
    });
  }

  // Odśwież widok w zakładce SOS
  OutageEngine.fetchOutages().then((raw) => {
    currentUtilitiesData = OutageEngine.processUtilities(raw);
    renderOutagesTab();
  });
}

function renderOutagesTab() {
  if (!currentUtilitiesData) return;

  // 1. Sekcja Prąd
  const p = currentUtilitiesData.power;
  const pBadge = document.getElementById('outages-tab-badge');
  const pBanner = document.getElementById('outages-status-banner');
  const pHeadline = document.getElementById('outages-status-headline');
  const pDetails = document.getElementById('outages-status-details');

  if (pBadge) {
    pBadge.textContent = p.isAlert ? (p.statusType === 'danger' ? 'Awaria' : 'Planowane') : 'Sieć OK';
    pBadge.style.backgroundColor = p.isAlert ? (p.statusType === 'danger' ? '#fee2e2' : '#fef3c7') : '#dcfce7';
    pBadge.style.color = p.isAlert ? (p.statusType === 'danger' ? '#dc2626' : '#d97706') : '#16a34a';

    if (pBanner) {
      pBanner.style.backgroundColor = p.isAlert ? (p.statusType === 'danger' ? '#fef2f2' : '#fffbeb') : '#f0fdf4';
      pBanner.style.borderColor = p.isAlert ? (p.statusType === 'danger' ? '#fecaca' : '#fde68a') : '#bbf7d0';
    }
    if (pHeadline) {
      pHeadline.textContent = p.isAlert ? (p.statusType === 'danger' ? '🚨 Trwa awaria zasilania!' : '⚠️ Zaplanowano wyłączenia prądu') : '🟢 Sieć elektroenergetyczna stabilna';
      pHeadline.style.color = p.isAlert ? (p.statusType === 'danger' ? '#b91c1c' : '#b45309') : '#166534';
    }
    if (pDetails) {
      pDetails.textContent = p.message;
      pDetails.style.color = p.isAlert ? (p.statusType === 'danger' ? '#991b1b' : '#92400e') : '#15803d';
    }
  }

  renderOutagesList();

  // 2. Sekcja Woda (ZGK)
  const w = currentUtilitiesData.water;
  const wBadge = document.getElementById('water-tab-badge');
  const wBanner = document.getElementById('water-status-banner');
  const wHeadline = document.getElementById('water-status-headline');
  const wDetails = document.getElementById('water-status-details');
  const wAnnounce = document.getElementById('water-announcements-container');

  if (wBadge) {
    wBadge.textContent = w.isAlert ? 'Komunikat' : 'Sieć OK';
    wBadge.style.backgroundColor = w.isAlert ? '#fef3c7' : '#dcfce7';
    wBadge.style.color = w.isAlert ? '#d97706' : '#16a34a';

    if (wBanner) {
      wBanner.style.backgroundColor = w.isAlert ? '#fffbeb' : '#f0fdf4';
      wBanner.style.borderColor = w.isAlert ? '#fde68a' : '#bbf7d0';
    }
    if (wHeadline) {
      wHeadline.textContent = w.isAlert ? '⚠️ Komunikat ZGK Świątniki Górne' : '🟢 Dostawy wody bez zakłóceń';
      wHeadline.style.color = w.isAlert ? '#b45309' : '#166534';
    }
    if (wDetails) {
      wDetails.textContent = w.message;
      wDetails.style.color = w.isAlert ? '#92400e' : '#15803d';
    }
  }

  if (wAnnounce && w.announcements) {
    wAnnounce.innerHTML = '';
    w.announcements.forEach((a) => {
      const row = document.createElement('div');
      row.style.background = '#fffbeb';
      row.style.border = '1px solid #fde68a';
      row.style.borderRadius = '8px';
      row.style.padding = '8px 10px';
      row.innerHTML = `
        <b style="font-size: 13px; color: #92400e;">${a.title}</b>
        <div style="font-size: 11px; color: #78350f; margin-top: 2px;">${a.details || ''}</div>
      `;
      wAnnounce.appendChild(row);
    });
  }

  // 3. Sekcja Gaz (PSG)
  const g = currentUtilitiesData.gas;
  const gBadge = document.getElementById('gas-tab-badge');
  const gBanner = document.getElementById('gas-status-banner');
  const gHeadline = document.getElementById('gas-status-headline');
  const gDetails = document.getElementById('gas-status-details');

  if (gBadge) {
    gBadge.textContent = g.isAlert ? 'Prace PSG' : 'Sieć OK';
    gBadge.style.backgroundColor = g.isAlert ? '#fef3c7' : '#dcfce7';
    gBadge.style.color = g.isAlert ? '#d97706' : '#16a34a';

    if (gBanner) {
      gBanner.style.backgroundColor = g.isAlert ? '#fffbeb' : '#f0fdf4';
      gBanner.style.borderColor = g.isAlert ? '#fde68a' : '#bbf7d0';
    }
    if (gHeadline) {
      gHeadline.textContent = g.isAlert ? '⚠️ Zgłoszono wyłączenie gazu' : '🟢 Dostawy gazu prawidłowe';
      gHeadline.style.color = g.isAlert ? '#b45309' : '#166534';
    }
    if (gDetails) {
      gDetails.textContent = g.message;
      gDetails.style.color = g.isAlert ? '#92400e' : '#15803d';
    }
  }
}

function renderOutagesList(filterQuery = '') {
  const container = document.getElementById('outages-items-container');
  if (!container || !currentUtilitiesData) return;

  const items = OutageEngine.filterByStreet(currentUtilitiesData.power.items, filterQuery);
  container.innerHTML = '';

  if (items.length === 0) {
    if (filterQuery) {
      container.innerHTML = `<div style="font-size: 13px; color: #64748b; padding: 10px; background: #f8fafc; border-radius: 8px; text-align: center;">Dla ulicy „${filterQuery}” brak zaplanowanych wyłączeń.</div>`;
    }
    return;
  }

  items.forEach((item) => {
    const card = document.createElement('div');
    card.style.background = item.isEmergency ? '#fef2f2' : '#fffbeb';
    card.style.border = `1px solid ${item.isEmergency ? '#fecaca' : '#fde68a'}`;
    card.style.borderRadius = '8px';
    card.style.padding = '10px 12px';

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
        <b style="font-size: 13px; color: ${item.isEmergency ? '#b91c1c' : '#b45309'};">
          ${item.isEmergency ? '🚨 AWARIA ZASILANIA' : '⚡ PLANOWANE WYŁĄCZENIE'}
        </b>
        <span style="font-size: 11px; font-weight: 700; color: #475569;">
          ${item.startDate ? item.startDate.split('T')[0] : ''}
        </span>
      </div>
      <div style="font-size: 12px; font-weight: 600; color: #0f172a;">
        Ulice: ${item.streets || 'Wrząsowice'}
      </div>
      <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
        ${item.description || 'Prace konserwacyjne na urządzeniach stacji transformatorowej'}
      </div>
    `;
    container.appendChild(card);
  });
}

// ==========================================
// 12. MODALE
// ==========================================
function initModals() {
  // Modal wyboru ulubionego przystanku
  const openFavBtn = document.getElementById('btn-open-fav-modal');
  const closeFavBtn = document.getElementById('modal-fav-close');
  const saveFavBtn = document.getElementById('btn-save-fav-stop');

  const favLine = document.getElementById('modal-fav-line');
  const favStop = document.getElementById('modal-fav-stop-select');
  const favDir = document.getElementById('modal-fav-dir');

  if (openFavBtn) {
    openFavBtn.addEventListener('click', () => {
      const currentFav = BusEngine.getFavoriteStop();
      if (favLine) favLine.value = currentFav.line;
      populateModalFavStops(currentFav.line, currentFav.stopId, currentFav.direction);
      openModal('modal-fav-stop');
    });
  }

  if (favLine) {
    favLine.addEventListener('change', () => {
      populateModalFavStops(favLine.value);
    });
  }

  if (saveFavBtn) {
    saveFavBtn.addEventListener('click', () => {
      const line = favLine.value;
      const stop = favStop.value;
      const dir = favDir.value;
      BusEngine.setFavoriteStop(line, stop, dir);
      refreshBusWidget();
      closeModal('modal-fav-stop');
    });
  }

  if (closeFavBtn) closeFavBtn.addEventListener('click', () => closeModal('modal-fav-stop'));

  // Pozostałe zamykania
  const closeWasteBtn = document.getElementById('modal-waste-close');
  if (closeWasteBtn) closeWasteBtn.addEventListener('click', () => closeModal('modal-edit-waste'));

  const closeInstallBtn = document.getElementById('modal-install-close');
  if (closeInstallBtn) closeInstallBtn.addEventListener('click', () => closeModal('modal-install-guide'));

  // Zamykanie tłem
  document.querySelectorAll('.modal-overlay').forEach((overlay) => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
  });
}

function populateModalFavStops(lineId, selectedStopId = null, selectedDir = null) {
  const line = MPK_DATA.lines[lineId];
  if (!line) return;

  const favStop = document.getElementById('modal-fav-stop-select');
  const favDir = document.getElementById('modal-fav-dir');

  if (favStop) {
    favStop.innerHTML = '';
    line.stops.forEach((s) => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = s.name + (s.isMain ? ' (Główny)' : '');
      if (selectedStopId && s.id === selectedStopId) opt.selected = true;
      favStop.appendChild(opt);
    });
  }

  if (favDir) {
    favDir.innerHTML = '';
    Object.keys(line.directions).forEach((dirKey) => {
      const opt = document.createElement('option');
      opt.value = dirKey;
      opt.textContent = line.directions[dirKey].title;
      if (selectedDir && dirKey === selectedDir) opt.selected = true;
      favDir.appendChild(opt);
    });
  }
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}
