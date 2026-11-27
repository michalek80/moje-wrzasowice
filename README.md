# Moje Wrząsowice - Informator Mieszkańca (PWA)

Nowoczesna, lekka i w 100% niezawodna aplikacja mobilna (Progressive Web App) zaprojektowana specjalnie dla mieszkańców miejscowości Wrząsowice (gmina Świątniki Górne, powiat krakowski).

---

## 🚀 Co zawiera aplikacja?

### 1. Ekran Główny (Pulpit):
* **🚏 Widget Najbliższego Odjazdu MPK:**
  * Wyświetla wybrany przez Ciebie przystanek (np. *Wrząsowice Centrum* w stronę *Borku Fałęckiego*).
  * Oblicza godzinę najbliższego odjazdu wraz z odliczaniem na żywo (*„za 8 min”*, *„TERAZ”* lub informacją o porannym kursie, jeśli jest późny wieczór).
  * Wyświetla podgląd kolejnych kursów oraz przycisk szybkiej zmiany przystanku.
* **🌤️ Pogoda i Jakość Powietrza na żywo (Open-Meteo):**
  * Dokładne współrzędne Wrząsowic (49.957° N, 19.948° E).
  * Temperatura bieżąca, odczuwalna, min/max, opady i wiatr.
  * Pomiar czystości powietrza: wskaźnik pyłów PM10 i PM2.5.
  * Przewijana oś prognozy godzinowej na cały bieżący dzień.
* **🚛 Wywóz odpadów:**
  * Duży baner z najbliższym terminem odbioru, licznikiem dni (*„W ten poniedziałek”*, *„Jutro rano”*) i opisem frakcji (Zmieszane + Bioodpady z limitem do 3 worków zielonych vs Wszystkie Segregowane Razem).
* **⚡ Stan Mediów (Prąd • Woda • Gaz):**
  * Automatycznie sprawdza stan trzech kluczowych sieci we Wrząsowicach w jednym rzędzie:
    * ⚡ **Prąd (Tauron):** status sieci, awarie, planowane wyłączenia.
    * 💧 **Woda (ZGK Świątniki Górne):** status dostaw, zdatność wody, komunikaty o płukaniu sieci.
    * 🔥 **Gaz (PSG):** status dostaw gazociągu, planowane przerwy.
  * Wyświetla zielony status *„🟢 Wszystko OK”*, a w razie problemów podświetla na pomarańczowo/czerwono medium objęte zakłóceniem.
  * Bezpośredni odnośnik do szczegółów, wyszukiwarki ulic oraz telefonów alarmowych.
* **📞 Kafelki szybkiego kontaktu:**
  * Bezpośrednie połączenia telefoniczne (`tel:`) z akcją zima (odśnieżanie gminne), pomocą nocną (NiŚOZ Mogilany), ZGK (woda/ścieki 12 270 40 30), pogotowiem energetycznym (991) i gazowym (992).

### 2. Rozkład Jazdy MPK Kraków:
* Obsługa linii **215** (korytarz Centrum / Spacerowa / Kowaleca / Bonifraterska / Zielona) oraz **225** (korytarz Nad Wilgą / Pod Skałą) oraz nocnej **915**.
* Dokładne czasy odjazdów dla dni powszednich, sobót oraz niedziel i świąt.
* Podświetlanie najbliższego kursu na żółto.
* Przycisk **„★ Ustaw ten przystanek w widgecie na ekranie głównym”**.
* Skróty do śledzenia autobusów na radarze GPS (Jakdojade, Time4BUS).

### 3. Terminarz wywozu śmieci:
* Pełna lista nadchodzących odbiorów.
* Wbudowany edytor JSON – możliwość błyskawicznej korekty terminów z trwałym zapisem w telefonie (`localStorage`).
* Zasady segregacji i dane kontaktowe PSZOK Świątniki Górne.

### 4. Centrum Mediów i Awarii (Prąd, Woda, Gaz):
* Dedykowana sekcja w zakładce SOS:
  * **Prąd:** wyszukiwarka po ulicach we Wrząsowicach (np. ul. Nad Wilgą, Pileckiego, Spacerowa), mapa wyłączeń Tauron, tel. 991.
  * **Woda:** komunikaty ZGK Świątniki Górne o pracach i płukaniu sieci, numer awaryjny ZGK (606 720 033) oraz pogotowie wodociągowe (994).
  * **Gaz:** status sieci PSG, mapa przerw w dostawie gazu i pogotowie gazowe (992).
* Gotowy darmowy workflow GitHub Actions (`.github/workflows/sync-tauron.yml`) oraz skrypt (`scripts/fetch_utilities.py`), który co 6 godzin automatycznie pobiera status mediów dla gminy Świątniki Górne.

### 5. SOS, Zima i Zdrowie:
* Akcja Zima: odśnieżanie dróg gminnych (508 115 902) oraz powiatowych Eurovia (515 126 395).
* Zdrowie: NiŚOZ Mogilany (ul. Rynek 4), NiŚOZ Szpital św. Rafała, apteki w Swoszowicach i Świątnikach oraz dyżur całodobowy 24/7.
* Awarie mediów: ZGK (12 270 40 30, awaria: 606 720 033), Tauron (991), Gaz (992).

### 5. Wieś i Kultura:
* Stara Szkoła we Wrząsowicach (Filia CK) – harmonogram zajęć tygodniowych (Joga, Zumba, Zdrowy Kręgosłup, Warsztaty, KGW, Klub Seniora).
* Godziny Mszy Świętych w parafiach we Wróblowicach i Świątnikach Górnych.

---

## 🛠️ Jak uruchomić aplikację?

1. **Lokalnie w przeglądarce:**
   * Wystarczy dwukrotnie kliknąć plik `index.html` w eksploratorze plików na komputerze, aby otworzyć aplikację w Chrome, Edge, Firefox lub Safari.
2. **Jako aplikacja na telefonie (PWA):**
   * Pliki projektu można wgrać za darmo na dowolny darmowy hosting (np. **GitHub Pages**, **Cloudflare Pages**, **Netlify** lub **Vercel**).
   * Po wejściu pod wygenerowany adres w przeglądarce telefonu:
     * **Android (Chrome):** Kliknij `⋮` (menu) ➔ **Zainstaluj aplikację** / **Dodaj do ekranu głównego**.
     * **iPhone (Safari):** Kliknij ikonę Udostępnij (kwadrat ze strzałką) ➔ **Do ekranu początkowego**.
   * Aplikacja otworzy się na pełnym ekranie jak natywna aplikacja, z własną ikoną i działaniem offline!

---

## 📁 Struktura plików

```
moje-wrzasowice/
├── index.html          # Główny szkielet aplikacji
├── manifest.json       # Konfiguracja PWA (nazwa, ikony, kolory)
├── sw.js               # Service Worker (działanie offline, cache)
├── css/
│   └── style.css       # Style, responsywność, obsługa bezpiecznych marginesów
├── js/
│   ├── data.js         # Baza danych: MPK, śmieci, telefony, kultura
│   ├── bus.js          # Silnik obliczania odjazdów MPK na żywo
│   ├── weather.js      # Pobieranie pogody i jakości powietrza (Open-Meteo)
│   ├── waste.js        # Obliczanie terminów odbioru śmieci
│   └── app.js          # Główna logika UI, nawigacja i modale
└── icons/
    ├── icon-192.svg    # Ikona PWA 192x192
    └── icon-512.svg    # Ikona PWA 512x512
```
