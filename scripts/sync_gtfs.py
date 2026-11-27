#!/usr/bin/env python3
"""
Synchronizuje rozkłady jazdy MPK Kraków (linie 215, 225, 915) dla przystanków
we Wrząsowicach na podstawie oficjalnego pliku GTFS_KRK_A.zip ze strony
https://gtfs.ztp.krakow.pl/ i aktualizuje sekcję MPK_DATA w pliku js/data.js.
"""

import argparse
import csv
import io
import json
import os
import re
import subprocess
import tempfile
import zipfile
from collections import defaultdict
from datetime import datetime

GTFS_URL = "https://gtfs.ztp.krakow.pl/GTFS_KRK_A.zip"

STOP_META = {
    "215": [
        {"id": "wrzasowice_zielona", "gtfsName": "Wrząsowice Zielona", "name": "Wrząsowice Zielona (NŻ)"},
        {"id": "wrzasowice_bonifraterska", "gtfsName": "Wrząsowice Bonifraterska", "name": "Wrząsowice Bonifraterska (NŻ)"},
        {"id": "wrzasowice_kowaleca", "gtfsName": "Wrząsowice Kowaleca", "name": "Wrząsowice Kowaleca (NŻ)"},
        {"id": "wrzasowice_pileckiego", "gtfsName": "Wrząsowice Pileckiego", "name": "Wrząsowice Pileckiego (NŻ)"},
        {"id": "wrzasowice_centrum", "gtfsName": "Wrząsowice Centrum", "name": "Wrząsowice Centrum", "isMain": True},
        {"id": "wrzasowice_wrzosowa", "gtfsName": "Wrząsowice Wrzosowa", "name": "Wrząsowice Wrzosowa (NŻ)"},
        {"id": "wrzasowice_spacerowa", "gtfsName": "Wrząsowice Spacerowa", "name": "Wrząsowice Spacerowa (NŻ)"},
    ],
    "225": [
        {"id": "wrzasowice_nad_wilga", "gtfsName": "Wrząsowice Nad Wilgą", "name": "Wrząsowice Nad Wilgą", "isMain": True},
        {"id": "wrzasowice_pod_skala", "gtfsName": "Wrząsowice Pod Skałą", "name": "Wrząsowice Pod Skałą (NŻ)"},
    ],
    "915": [
        {"id": "wrzasowice_centrum_915", "gtfsName": "Wrząsowice Centrum", "name": "Wrząsowice Centrum (kier. Świątniki)", "isMain": True},
        {"id": "wrzasowice_nad_wilga_915", "gtfsName": "Wrząsowice Nad Wilgą", "name": "Wrząsowice Nad Wilgą (kier. Łagiewniki)"},
        {"id": "wrzasowice_pod_skala_915", "gtfsName": "Wrząsowice Pod Skałą", "name": "Wrząsowice Pod Skałą (NŻ, kier. Łagiewniki)"},
        {"id": "wrzasowice_zielona_915", "gtfsName": "Wrząsowice Zielona", "name": "Wrząsowice Zielona (NŻ, kier. Świątniki)"},
        {"id": "wrzasowice_bonifraterska_915", "gtfsName": "Wrząsowice Bonifraterska", "name": "Wrząsowice Bonifraterska (NŻ, kier. Świątniki)"},
        {"id": "wrzasowice_kowaleca_915", "gtfsName": "Wrząsowice Kowaleca", "name": "Wrząsowice Kowaleca (NŻ, kier. Świątniki)"},
        {"id": "wrzasowice_pileckiego_915", "gtfsName": "Wrząsowice Pileckiego", "name": "Wrząsowice Pileckiego (NŻ, kier. Świątniki)"},
        {"id": "wrzasowice_wrzosowa_915", "gtfsName": "Wrząsowice Wrzosowa", "name": "Wrząsowice Wrzosowa (NŻ, kier. Świątniki)"},
        {"id": "wrzasowice_spacerowa_915", "gtfsName": "Wrząsowice Spacerowa", "name": "Wrząsowice Spacerowa (NŻ, kier. Świątniki)"},
    ],
}

LINE_META = {
    "215": {
        "number": "215",
        "name": "Borek Fałęcki ⇄ Rzeszotary Panciawa Pętla",
        "type": "dzienna",
        "zone": "Strefa II Aglomeracyjna",
        "directions": {
            "to_krakow": {
                "title": "Kierunek: Borek Fałęcki (Kraków)",
                "dest": "Borek Fałęcki",
                "via": "przez Wróblowice, Swoszowice",
            },
            "to_suburb": {
                "title": "Kierunek: Rzeszotary Panciawa",
                "dest": "Rzeszotary Panciawa Pętla",
                "via": "przez Świątniki Górne",
            },
        },
    },
    "225": {
        "number": "225",
        "name": "Borek Fałęcki ⇄ Świątniki Górne UMiG",
        "type": "dzienna",
        "zone": "Strefa II Aglomeracyjna",
        "directions": {
            "to_krakow": {
                "title": "Kierunek: Borek Fałęcki (Kraków)",
                "dest": "Borek Fałęcki",
                "via": "przez Zbydniowice, Wróblowice, Swoszowice",
            },
            "to_suburb": {
                "title": "Kierunek: Świątniki Górne UMiG",
                "dest": "Świątniki Górne UMiG",
                "via": "przez Ochojno, Rzeszotary",
            },
        },
    },
    "915": {
        "number": "915",
        "name": "Łagiewniki ⇄ Świątniki Górne UMiG (Linia Nocna)",
        "type": "nocna",
        "zone": "Strefa II Aglomeracyjna",
        "directions": {
            "to_krakow": {
                "title": "Kierunek: Łagiewniki",
                "dest": "Łagiewniki",
                "via": "przez Swoszowice",
            },
            "to_suburb": {
                "title": "Kierunek: Świątniki Górne UMiG",
                "dest": "Świątniki Górne UMiG",
                "via": "przez Wrząsowice",
            },
        },
    },
}


def download_gtfs(dest_path: str) -> None:
    print(f"Pobieranie {GTFS_URL}...")
    subprocess.run(
        [
            "curl",
            "-fsSL",
            "-A",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            "-o",
            dest_path,
            GTFS_URL,
        ],
        check=True,
    )
    print(f"Pobrano {os.path.getsize(dest_path)} bajtów.")


def read_csv(z: zipfile.ZipFile, filename: str):
    with z.open(filename) as f:
        return list(csv.DictReader(io.TextIOWrapper(f, encoding="utf-8-sig")))


def pick_representative_dates(calendar_dates):
    """
    Wybiera reprezentatywne daty (najbliższy poniedziałek/wtorek, sobota, niedziela)
    od dzisiaj lub od najwcześniejszej aktywnej daty w przyszłości.
    Zwraca słownik: {'weekdays': service_ids, 'saturday': service_ids, 'sunday': service_ids}
    """
    date_to_services = defaultdict(set)
    for row in calendar_dates:
        if row.get("exception_type", "1") == "1":
            date_to_services[row["date"]].add(row["service_id"])

    all_dates = sorted(date_to_services.keys())
    if not all_dates:
        raise RuntimeError("Brak dat w calendar_dates.txt")

    today_str = datetime.now().strftime("%Y%m%d")
    # Szukaj od najnowszego bloku (lub od dzisiaj)
    future_dates = [d for d in all_dates if d >= today_str]
    search_dates = future_dates if future_dates else all_dates

    # Wybierz najbliższy zwykły dzień powszedni (wtorek-czwartek preferowany), sobotę i niedzielę
    # Jeśli np. dzisiaj jest piątek a w sobotę wchodzi nowy rozkład, weź kolejny tydzień jeśli są co najmniej 2 dni
    picked = {}
    for d in search_dates:
        dt = datetime.strptime(d, "%Y%m%d")
        wd = dt.weekday()  # 0=Mon .. 6=Sun
        if wd in (0, 1, 2, 3) and "weekdays" not in picked:
            picked["weekdays"] = d
        elif wd == 5 and "saturday" not in picked:
            picked["saturday"] = d
        elif wd == 6 and "sunday" not in picked:
            picked["sunday"] = d
        if len(picked) == 3:
            break

    # Dla linii nocnej 915 potrzebujemy dodatkowo wiedzy o nocy z piątku na sobotę (wd == 4)
    for d in search_dates:
        dt = datetime.strptime(d, "%Y%m%d")
        if dt.weekday() == 4:
            picked["friday"] = d
            break

    return {k: date_to_services[v] for k, v in picked.items()}, picked


def normalize_time(gtfs_time: str):
    """Konwertuje 'HH:MM:SS' na ('HH:MM', crossed_midnight_bool)."""
    hh, mm, _ = gtfs_time.split(":")
    h_int = int(hh)
    crossed = h_int >= 24
    return f"{h_int % 24:02d}:{mm}", crossed


def sort_times(times_set):
    """Sortuje czasy 'HH:MM' chronologicznie, traktując kursy 00:00..03:59 na liniach dziennych jako koniec dnia tylko jeśli trzeba."""
    return sorted(times_set)


def build_mpk_data(zip_path: str) -> dict:
    with zipfile.ZipFile(zip_path, "r") as z:
        feed_info = read_csv(z, "feed_info.txt")
        feed_version = feed_info[0].get("feed_version", "") if feed_info else ""

        stops = {s["stop_id"]: s["stop_name"] for s in read_csv(z, "stops.txt")}
        wrz_stop_ids = {sid for sid, name in stops.items() if "Wrząsowice" in name}

        calendar_dates = read_csv(z, "calendar_dates.txt")
        svc_map, picked_dates = pick_representative_dates(calendar_dates)
        print("Wybrane daty referencyjne:", picked_dates)

        trips = {
            t["trip_id"]: t
            for t in read_csv(z, "trips.txt")
            if t["route_id"] in ("215", "225", "915")
        }

        # Zbierz odjazdy: raw[route_id][service_id][direction_id][stop_name] -> set of (time_str, crossed)
        raw = defaultdict(lambda: defaultdict(lambda: defaultdict(lambda: defaultdict(set))))
        with z.open("stop_times.txt") as f:
            reader = csv.DictReader(io.TextIOWrapper(f, encoding="utf-8-sig"))
            for row in reader:
                tid = row["trip_id"]
                if tid in trips and row["stop_id"] in wrz_stop_ids:
                    t = trips[tid]
                    t_str, crossed = normalize_time(row["departure_time"])
                    raw[t["route_id"]][t["service_id"]][t["direction_id"]][stops[row["stop_id"]]].add((t_str, crossed))

    lines_out = {}
    for line_id, meta in LINE_META.items():
        stop_schedules = {}
        stops_list = []

        for s_meta in STOP_META[line_id]:
            sid = s_meta["id"]
            gtfs_name = s_meta["gtfsName"]
            entry = {"id": sid, "name": s_meta["name"]}
            if s_meta.get("isMain"):
                entry["isMain"] = True
            stops_list.append(entry)

            stop_schedules[sid] = {}
            for dir_key, dir_id in (("to_krakow", "0"), ("to_suburb", "1")):
                day_dict = {}
                for day_type in ("weekdays", "saturday", "sunday"):
                    times_set = set()
                    if line_id == "915":
                        # Linia 915 z GTFS ma kursy po północy zapisane jako 25:xx/26:xx w dzień poprzedni:
                        # Piątek (friday) -> Sobota rano; Sobota (saturday) -> Niedziela rano
                        prev_day_key = {"weekdays": None, "saturday": "friday", "sunday": "saturday"}[day_type]
                        if prev_day_key and prev_day_key in svc_map:
                            for svc_id in svc_map[prev_day_key]:
                                for t_str, crossed in raw[line_id][svc_id][dir_id][gtfs_name]:
                                    if crossed:
                                        times_set.add(t_str)
                        for svc_id in svc_map.get(day_type, set()):
                            for t_str, crossed in raw[line_id][svc_id][dir_id][gtfs_name]:
                                if not crossed:
                                    times_set.add(t_str)
                    else:
                        for svc_id in svc_map.get(day_type, set()):
                            for t_str, _ in raw[line_id][svc_id][dir_id][gtfs_name]:
                                times_set.add(t_str)

                    # Dla linii 215/225 posortuj tak, aby 00:00..03:59 było na końcu doby (po 23:xx)
                    if line_id != "915":
                        day_dict[day_type] = sorted(
                            times_set,
                            key=lambda x: (int(x[:2]) + (24 if int(x[:2]) < 4 else 0)) * 60 + int(x[3:]),
                        )
                    else:
                        day_dict[day_type] = sorted(times_set)

                stop_schedules[sid][dir_key] = day_dict

        lines_out[line_id] = {
            **meta,
            "stops": stops_list,
            "stopSchedules": stop_schedules,
        }

    return {
        "gtfsVersion": feed_version,
        "gtfsSyncedAt": datetime.now().strftime("%Y-%m-%d"),
        "lines": lines_out,
    }


def update_data_js(data_js_path: str, mpk_data: dict) -> None:
    with open(data_js_path, "r", encoding="utf-8") as f:
        content = f.read()

    json_str = json.dumps(mpk_data, ensure_ascii=False, indent=2)
    replacement = f"// === MPK_DATA_START ===\nconst MPK_DATA = {json_str};\n// === MPK_DATA_END ==="

    pattern = re.compile(
        r"// === MPK_DATA_START ===.*?// === MPK_DATA_END ===",
        re.DOTALL,
    )
    if pattern.search(content):
        new_content = pattern.sub(replacement, content, count=1)
    else:
        # Fallback: replace const MPK_DATA = { ... }; before section 2
        fallback_pattern = re.compile(
            r"const MPK_DATA = \{.*?\n\};",
            re.DOTALL,
        )
        if not fallback_pattern.search(content):
            raise RuntimeError("Nie znaleziono bloku MPK_DATA w js/data.js")
        new_content = fallback_pattern.sub(replacement, content, count=1)

    with open(data_js_path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print(f"Zaktualizowano {data_js_path} (GTFS {mpk_data['gtfsVersion']}).")


def main():
    parser = argparse.ArgumentParser(description="Synchronizuj rozkłady MPK z GTFS ZTP Kraków.")
    parser.add_argument("--zip", help="Ścieżka do lokalnego pliku GTFS_KRK_A.zip")
    parser.add_argument(
        "--data-js",
        default=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "js", "data.js"),
        help="Ścieżka do js/data.js",
    )
    args = parser.parse_args()

    if args.zip:
        mpk_data = build_mpk_data(args.zip)
    else:
        with tempfile.TemporaryDirectory() as tmpdir:
            zip_path = os.path.join(tmpdir, "GTFS_KRK_A.zip")
            download_gtfs(zip_path)
            mpk_data = build_mpk_data(zip_path)

    update_data_js(args.data_js, mpk_data)


if __name__ == "__main__":
    main()
