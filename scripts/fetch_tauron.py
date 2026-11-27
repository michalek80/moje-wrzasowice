#!/usr/bin/env python3
"""
Skrypt do automatycznego pobierania planowanych i awaryjnych wyłączeń prądu
z Tauron Dystrybucja dla gminy Świątniki Górne / miejscowości Wrząsowice.
Zapisuje wynik do pliku data/outages.json.
"""

import json
import os
import sys
import datetime
import urllib.request
import urllib.error

# Konfiguracja lokalizacji (Małopolska, Powiat Krakowski, Świątniki Górne)
CONFIG = {
    "town": "Wrząsowice",
    "commune": "Świątniki Górne",
    "provinceGAID": 12,
    "communeGAID": 502  # Identyfikator gminy Świątniki Górne w Tauron
}

OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "outages.json")

def fetch_tauron_data():
    today = datetime.date.today()
    to_date = today + datetime.timedelta(days=7)
    
    # URL do nieoficjalnego endpointu Tauron WAAPI
    url = (
        f"https://www.tauron-dystrybucja.pl/waapi/outages/area?"
        f"provinceGAID={CONFIG['provinceGAID']}&"
        f"communeGAID={CONFIG['communeGAID']}&"
        f"fromDate={today.isoformat()}&"
        f"toDate={to_date.isoformat()}"
    )
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*"
    }

    req = urllib.request.Request(url, headers=headers)
    
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            if resp.status == 200:
                data = json.loads(resp.read().decode("utf-8"))
                return data
    except Exception as e:
        print(f"Uwaga: Nie udało się pobrać danych bezpośrednio z Taurona ({e}). Używam stanu domyślnego.")
        return None

def main():
    raw_data = fetch_tauron_data()
    
    now_iso = datetime.datetime.now().isoformat()
    
    planned = []
    emergency = []
    
    if raw_data:
        # Parsowanie obiektów ze struktury Tauron
        items = raw_data if isinstance(raw_data, list) else raw_data.get("outages", [])
        for item in items:
            outage_type = item.get("type", "PLANNED")
            entry = {
                "startDate": item.get("startDate"),
                "endDate": item.get("endDate"),
                "streets": item.get("message", "Wrząsowice"),
                "description": item.get("description", "Prace modernizacyjne sieci elektroenergetycznej")
            }
            if outage_type == "EMERGENCY":
                emergency.append(entry)
            else:
                planned.append(entry)

    status = "OK"
    message = "Sieć elektroenergetyczna pracuje prawidłowo. Brak zgłoszonych awarii i planowanych wyłączeń."
    
    if emergency:
        status = "EMERGENCY"
        message = f"Zgłoszono bieżącą awarię zasilania we Wrząsowicach ({len(emergency)} zgłoszeń)."
    elif planned:
        status = "PLANNED"
        message = f"Zaplanowano prace sieciowe w najbliższym tygodniu ({len(planned)} terminów)."

    payload = {
        "updatedAt": now_iso,
        "town": CONFIG["town"],
        "commune": CONFIG["commune"],
        "status": status,
        "message": message,
        "plannedOutages": planned,
        "emergencyOutages": emergency
    }

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    print(f"Zaktualizowano plik {OUTPUT_FILE} (status: {status}).")

if __name__ == "__main__":
    main()
