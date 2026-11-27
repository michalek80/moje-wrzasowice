/**
 * Baza danych lokalnych dla aplikacji Moje Wrząsowice
 * Zawiera rozkłady MPK Kraków, harmonogram odpadów, ważne kontakty i placówki.
 */

const APP_CONFIG = {
  town: 'Wrząsowice',
  commune: 'Świątniki Górne',
  county: 'krakowski',
  geo: {
    lat: 49.957,
    lon: 19.948
  },
  defaultStop: {
    line: '215',
    stopId: 'wrzasowice_centrum',
    direction: 'to_krakow'
  }
};

// ==========================================
// 1. ROZKŁAD JAZDY MPK KRAKÓW (215, 225, 915)
// ==========================================
// === MPK_DATA_START ===
const MPK_DATA = {
  "gtfsVersion": "20261126_20261128",
  "gtfsSyncedAt": "2026-11-27",
  "lines": {
    "215": {
      "number": "215",
      "name": "Borek Fałęcki ⇄ Rzeszotary Panciawa Pętla",
      "type": "dzienna",
      "zone": "Strefa II Aglomeracyjna",
      "directions": {
        "to_krakow": {
          "title": "Kierunek: Borek Fałęcki (Kraków)",
          "dest": "Borek Fałęcki",
          "via": "przez Wróblowice, Swoszowice"
        },
        "to_suburb": {
          "title": "Kierunek: Rzeszotary Panciawa",
          "dest": "Rzeszotary Panciawa Pętla",
          "via": "przez Świątniki Górne"
        }
      },
      "stops": [
        {
          "id": "wrzasowice_zielona",
          "name": "Wrząsowice Zielona (NŻ)"
        },
        {
          "id": "wrzasowice_bonifraterska",
          "name": "Wrząsowice Bonifraterska (NŻ)"
        },
        {
          "id": "wrzasowice_kowaleca",
          "name": "Wrząsowice Kowaleca (NŻ)"
        },
        {
          "id": "wrzasowice_pileckiego",
          "name": "Wrząsowice Pileckiego (NŻ)"
        },
        {
          "id": "wrzasowice_centrum",
          "name": "Wrząsowice Centrum",
          "isMain": true
        },
        {
          "id": "wrzasowice_wrzosowa",
          "name": "Wrząsowice Wrzosowa (NŻ)"
        },
        {
          "id": "wrzasowice_spacerowa",
          "name": "Wrząsowice Spacerowa (NŻ)"
        }
      ],
      "stopSchedules": {
        "wrzasowice_zielona": {
          "to_krakow": {
            "weekdays": [
              "04:23",
              "05:03",
              "05:57",
              "06:48",
              "07:28",
              "08:32",
              "09:42",
              "10:42",
              "11:42",
              "12:42",
              "13:42",
              "14:42",
              "15:42",
              "16:23",
              "17:23",
              "18:23",
              "19:19",
              "20:17",
              "21:14",
              "22:14",
              "23:56"
            ],
            "saturday": [
              "04:44",
              "06:14",
              "07:49",
              "09:29",
              "11:04",
              "12:39",
              "14:14",
              "15:54",
              "17:29",
              "19:04",
              "20:44",
              "22:19"
            ],
            "sunday": [
              "04:44",
              "06:14",
              "07:49",
              "09:29",
              "11:04",
              "12:39",
              "14:14",
              "15:54",
              "17:29",
              "19:04",
              "20:44",
              "22:19"
            ]
          },
          "to_suburb": {
            "weekdays": [
              "05:29",
              "06:13",
              "06:59",
              "08:01",
              "09:01",
              "10:01",
              "11:01",
              "12:01",
              "13:01",
              "14:01",
              "15:09",
              "15:49",
              "16:49",
              "17:44",
              "18:44",
              "19:44",
              "20:44",
              "21:44",
              "23:28"
            ],
            "saturday": [
              "05:44",
              "07:19",
              "08:59",
              "10:34",
              "12:09",
              "13:44",
              "15:24",
              "16:59",
              "18:34",
              "20:14",
              "21:49",
              "23:23"
            ],
            "sunday": [
              "05:44",
              "07:19",
              "08:59",
              "10:34",
              "12:09",
              "13:44",
              "15:24",
              "16:59",
              "18:34",
              "20:14",
              "21:49",
              "23:23"
            ]
          }
        },
        "wrzasowice_bonifraterska": {
          "to_krakow": {
            "weekdays": [
              "04:24",
              "05:04",
              "05:58",
              "06:49",
              "07:29",
              "08:33",
              "09:43",
              "10:43",
              "11:43",
              "12:43",
              "13:43",
              "14:43",
              "15:43",
              "16:24",
              "17:24",
              "18:24",
              "19:20",
              "20:18",
              "21:15",
              "22:15",
              "23:57"
            ],
            "saturday": [
              "04:45",
              "06:15",
              "07:50",
              "09:30",
              "11:05",
              "12:40",
              "14:15",
              "15:55",
              "17:30",
              "19:05",
              "20:45",
              "22:20"
            ],
            "sunday": [
              "04:45",
              "06:15",
              "07:50",
              "09:30",
              "11:05",
              "12:40",
              "14:15",
              "15:55",
              "17:30",
              "19:05",
              "20:45",
              "22:20"
            ]
          },
          "to_suburb": {
            "weekdays": [
              "05:27",
              "06:11",
              "06:57",
              "07:59",
              "08:59",
              "09:59",
              "10:59",
              "11:59",
              "12:59",
              "13:59",
              "15:07",
              "15:47",
              "16:47",
              "17:42",
              "18:42",
              "19:42",
              "20:42",
              "21:42",
              "23:26"
            ],
            "saturday": [
              "05:42",
              "07:17",
              "08:57",
              "10:32",
              "12:07",
              "13:42",
              "15:22",
              "16:57",
              "18:32",
              "20:12",
              "21:47",
              "23:21"
            ],
            "sunday": [
              "05:42",
              "07:17",
              "08:57",
              "10:32",
              "12:07",
              "13:42",
              "15:22",
              "16:57",
              "18:32",
              "20:12",
              "21:47",
              "23:21"
            ]
          }
        },
        "wrzasowice_kowaleca": {
          "to_krakow": {
            "weekdays": [
              "04:25",
              "05:05",
              "05:59",
              "06:50",
              "07:30",
              "08:34",
              "09:44",
              "10:44",
              "11:44",
              "12:44",
              "13:44",
              "14:44",
              "15:44",
              "16:25",
              "17:25",
              "18:25",
              "19:21",
              "20:19",
              "21:16",
              "22:16",
              "23:58"
            ],
            "saturday": [
              "04:46",
              "06:16",
              "07:51",
              "09:31",
              "11:06",
              "12:41",
              "14:16",
              "15:56",
              "17:31",
              "19:06",
              "20:46",
              "22:21"
            ],
            "sunday": [
              "04:46",
              "06:16",
              "07:51",
              "09:31",
              "11:06",
              "12:41",
              "14:16",
              "15:56",
              "17:31",
              "19:06",
              "20:46",
              "22:21"
            ]
          },
          "to_suburb": {
            "weekdays": [
              "05:26",
              "06:10",
              "06:56",
              "07:58",
              "08:58",
              "09:58",
              "10:58",
              "11:58",
              "12:58",
              "13:58",
              "15:06",
              "15:46",
              "16:46",
              "17:41",
              "18:41",
              "19:41",
              "20:41",
              "21:41",
              "23:25"
            ],
            "saturday": [
              "05:41",
              "07:16",
              "08:56",
              "10:31",
              "12:06",
              "13:41",
              "15:21",
              "16:56",
              "18:31",
              "20:11",
              "21:46",
              "23:20"
            ],
            "sunday": [
              "05:41",
              "07:16",
              "08:56",
              "10:31",
              "12:06",
              "13:41",
              "15:21",
              "16:56",
              "18:31",
              "20:11",
              "21:46",
              "23:20"
            ]
          }
        },
        "wrzasowice_pileckiego": {
          "to_krakow": {
            "weekdays": [
              "04:26",
              "05:06",
              "06:00",
              "06:51",
              "07:31",
              "08:35",
              "09:45",
              "10:45",
              "11:45",
              "12:45",
              "13:45",
              "14:45",
              "15:45",
              "16:26",
              "17:26",
              "18:26",
              "19:22",
              "20:20",
              "21:17",
              "22:17",
              "23:59"
            ],
            "saturday": [
              "04:47",
              "06:17",
              "07:52",
              "09:32",
              "11:07",
              "12:42",
              "14:17",
              "15:57",
              "17:32",
              "19:07",
              "20:47",
              "22:22"
            ],
            "sunday": [
              "04:47",
              "06:17",
              "07:52",
              "09:32",
              "11:07",
              "12:42",
              "14:17",
              "15:57",
              "17:32",
              "19:07",
              "20:47",
              "22:22"
            ]
          },
          "to_suburb": {
            "weekdays": [
              "05:25",
              "06:09",
              "06:55",
              "07:57",
              "08:57",
              "09:57",
              "10:57",
              "11:57",
              "12:57",
              "13:57",
              "15:05",
              "15:45",
              "16:45",
              "17:40",
              "18:40",
              "19:40",
              "20:40",
              "21:40",
              "23:24"
            ],
            "saturday": [
              "05:40",
              "07:15",
              "08:55",
              "10:30",
              "12:05",
              "13:40",
              "15:20",
              "16:55",
              "18:30",
              "20:10",
              "21:45",
              "23:19"
            ],
            "sunday": [
              "05:40",
              "07:15",
              "08:55",
              "10:30",
              "12:05",
              "13:40",
              "15:20",
              "16:55",
              "18:30",
              "20:10",
              "21:45",
              "23:19"
            ]
          }
        },
        "wrzasowice_centrum": {
          "to_krakow": {
            "weekdays": [
              "04:27",
              "05:07",
              "06:01",
              "06:52",
              "07:32",
              "08:36",
              "09:46",
              "10:46",
              "11:46",
              "12:46",
              "13:46",
              "14:46",
              "15:46",
              "16:27",
              "17:27",
              "18:27",
              "19:23",
              "20:21",
              "21:18",
              "22:18",
              "00:00"
            ],
            "saturday": [
              "04:48",
              "06:18",
              "07:53",
              "09:33",
              "11:08",
              "12:43",
              "14:18",
              "15:58",
              "17:33",
              "19:08",
              "20:48",
              "22:23"
            ],
            "sunday": [
              "04:48",
              "06:18",
              "07:53",
              "09:33",
              "11:08",
              "12:43",
              "14:18",
              "15:58",
              "17:33",
              "19:08",
              "20:48",
              "22:23"
            ]
          },
          "to_suburb": {
            "weekdays": [
              "05:24",
              "06:08",
              "06:54",
              "07:56",
              "08:56",
              "09:56",
              "10:56",
              "11:56",
              "12:56",
              "13:56",
              "15:04",
              "15:44",
              "16:44",
              "17:39",
              "18:39",
              "19:39",
              "20:39",
              "21:39",
              "23:23"
            ],
            "saturday": [
              "05:39",
              "07:14",
              "08:54",
              "10:29",
              "12:04",
              "13:39",
              "15:19",
              "16:54",
              "18:29",
              "20:09",
              "21:44",
              "23:18"
            ],
            "sunday": [
              "05:39",
              "07:14",
              "08:54",
              "10:29",
              "12:04",
              "13:39",
              "15:19",
              "16:54",
              "18:29",
              "20:09",
              "21:44",
              "23:18"
            ]
          }
        },
        "wrzasowice_wrzosowa": {
          "to_krakow": {
            "weekdays": [
              "04:28",
              "05:08",
              "06:02",
              "06:53",
              "07:33",
              "08:37",
              "09:47",
              "10:47",
              "11:47",
              "12:47",
              "13:47",
              "14:47",
              "15:47",
              "16:28",
              "17:28",
              "18:28",
              "19:24",
              "20:22",
              "21:19",
              "22:19",
              "00:01"
            ],
            "saturday": [
              "04:49",
              "06:19",
              "07:54",
              "09:34",
              "11:09",
              "12:44",
              "14:19",
              "15:59",
              "17:34",
              "19:09",
              "20:49",
              "22:24"
            ],
            "sunday": [
              "04:49",
              "06:19",
              "07:54",
              "09:34",
              "11:09",
              "12:44",
              "14:19",
              "15:59",
              "17:34",
              "19:09",
              "20:49",
              "22:24"
            ]
          },
          "to_suburb": {
            "weekdays": [
              "05:23",
              "06:07",
              "06:53",
              "07:55",
              "08:55",
              "09:55",
              "10:55",
              "11:55",
              "12:55",
              "13:55",
              "15:03",
              "15:43",
              "16:43",
              "17:38",
              "18:38",
              "19:38",
              "20:38",
              "21:38",
              "23:22"
            ],
            "saturday": [
              "05:38",
              "07:13",
              "08:53",
              "10:28",
              "12:03",
              "13:38",
              "15:18",
              "16:53",
              "18:28",
              "20:08",
              "21:43",
              "23:17"
            ],
            "sunday": [
              "05:38",
              "07:13",
              "08:53",
              "10:28",
              "12:03",
              "13:38",
              "15:18",
              "16:53",
              "18:28",
              "20:08",
              "21:43",
              "23:17"
            ]
          }
        },
        "wrzasowice_spacerowa": {
          "to_krakow": {
            "weekdays": [
              "04:30",
              "05:10",
              "06:04",
              "06:55",
              "07:35",
              "08:39",
              "09:49",
              "10:49",
              "11:49",
              "12:49",
              "13:49",
              "14:49",
              "15:49",
              "16:30",
              "17:30",
              "18:30",
              "19:26",
              "20:24",
              "21:21",
              "22:21",
              "00:03"
            ],
            "saturday": [
              "04:51",
              "06:21",
              "07:56",
              "09:36",
              "11:11",
              "12:46",
              "14:21",
              "16:01",
              "17:36",
              "19:11",
              "20:51",
              "22:26"
            ],
            "sunday": [
              "04:51",
              "06:21",
              "07:56",
              "09:36",
              "11:11",
              "12:46",
              "14:21",
              "16:01",
              "17:36",
              "19:11",
              "20:51",
              "22:26"
            ]
          },
          "to_suburb": {
            "weekdays": [
              "05:21",
              "06:05",
              "06:51",
              "07:53",
              "08:53",
              "09:53",
              "10:53",
              "11:53",
              "12:53",
              "13:53",
              "15:01",
              "15:41",
              "16:41",
              "17:36",
              "18:36",
              "19:36",
              "20:36",
              "21:36",
              "23:20"
            ],
            "saturday": [
              "05:36",
              "07:11",
              "08:51",
              "10:26",
              "12:01",
              "13:36",
              "15:16",
              "16:51",
              "18:26",
              "20:06",
              "21:41",
              "23:15"
            ],
            "sunday": [
              "05:36",
              "07:11",
              "08:51",
              "10:26",
              "12:01",
              "13:36",
              "15:16",
              "16:51",
              "18:26",
              "20:06",
              "21:41",
              "23:15"
            ]
          }
        }
      }
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
          "via": "przez Zbydniowice, Wróblowice, Swoszowice"
        },
        "to_suburb": {
          "title": "Kierunek: Świątniki Górne UMiG",
          "dest": "Świątniki Górne UMiG",
          "via": "przez Ochojno, Rzeszotary"
        }
      },
      "stops": [
        {
          "id": "wrzasowice_nad_wilga",
          "name": "Wrząsowice Nad Wilgą",
          "isMain": true
        },
        {
          "id": "wrzasowice_pod_skala",
          "name": "Wrząsowice Pod Skałą (NŻ)"
        }
      ],
      "stopSchedules": {
        "wrzasowice_nad_wilga": {
          "to_krakow": {
            "weekdays": [
              "04:46",
              "05:34",
              "06:20",
              "06:46",
              "07:16",
              "07:47",
              "08:17",
              "08:47",
              "09:17",
              "10:01",
              "11:01",
              "12:01",
              "13:01",
              "13:59",
              "14:59",
              "15:37",
              "16:17",
              "16:47",
              "17:17",
              "17:47",
              "18:17",
              "18:47",
              "19:17",
              "20:02",
              "21:02",
              "21:57",
              "22:52"
            ],
            "saturday": [
              "04:58",
              "06:52",
              "08:32",
              "10:12",
              "11:47",
              "13:22",
              "14:57",
              "16:32",
              "18:12",
              "19:52",
              "21:42",
              "23:26"
            ],
            "sunday": [
              "04:58",
              "06:52",
              "08:32",
              "10:12",
              "11:47",
              "13:22",
              "14:57",
              "16:32",
              "18:12",
              "19:52",
              "21:42",
              "23:26"
            ]
          },
          "to_suburb": {
            "weekdays": [
              "04:44",
              "05:33",
              "05:56",
              "06:23",
              "06:55",
              "07:23",
              "07:40",
              "08:23",
              "09:06",
              "10:06",
              "11:06",
              "12:06",
              "13:06",
              "14:06",
              "14:48",
              "15:23",
              "15:53",
              "16:23",
              "16:53",
              "17:22",
              "17:52",
              "18:22",
              "19:11",
              "20:11",
              "21:06",
              "22:06",
              "22:56"
            ],
            "saturday": [
              "06:06",
              "07:46",
              "09:26",
              "11:01",
              "12:36",
              "14:11",
              "15:46",
              "17:26",
              "19:06",
              "20:56",
              "22:41"
            ],
            "sunday": [
              "06:06",
              "07:46",
              "09:26",
              "11:01",
              "12:36",
              "14:11",
              "15:46",
              "17:26",
              "19:06",
              "20:56",
              "22:41"
            ]
          }
        },
        "wrzasowice_pod_skala": {
          "to_krakow": {
            "weekdays": [
              "04:45",
              "05:33",
              "06:19",
              "06:45",
              "07:15",
              "07:46",
              "08:16",
              "08:46",
              "09:16",
              "10:00",
              "11:00",
              "12:00",
              "13:00",
              "13:58",
              "14:58",
              "15:36",
              "16:16",
              "16:46",
              "17:16",
              "17:46",
              "18:16",
              "18:46",
              "19:16",
              "20:01",
              "21:01",
              "21:56",
              "22:51"
            ],
            "saturday": [
              "04:57",
              "06:51",
              "08:31",
              "10:11",
              "11:46",
              "13:21",
              "14:56",
              "16:31",
              "18:11",
              "19:51",
              "21:41",
              "23:25"
            ],
            "sunday": [
              "04:57",
              "06:51",
              "08:31",
              "10:11",
              "11:46",
              "13:21",
              "14:56",
              "16:31",
              "18:11",
              "19:51",
              "21:41",
              "23:25"
            ]
          },
          "to_suburb": {
            "weekdays": [
              "04:46",
              "05:35",
              "05:58",
              "06:25",
              "06:57",
              "07:25",
              "07:42",
              "08:25",
              "09:08",
              "10:08",
              "11:08",
              "12:08",
              "13:08",
              "14:08",
              "14:50",
              "15:25",
              "15:55",
              "16:25",
              "16:55",
              "17:24",
              "17:54",
              "18:24",
              "19:13",
              "20:13",
              "21:08",
              "22:08",
              "22:58"
            ],
            "saturday": [
              "06:08",
              "07:48",
              "09:28",
              "11:03",
              "12:38",
              "14:13",
              "15:48",
              "17:28",
              "19:08",
              "20:58",
              "22:43"
            ],
            "sunday": [
              "06:08",
              "07:48",
              "09:28",
              "11:03",
              "12:38",
              "14:13",
              "15:48",
              "17:28",
              "19:08",
              "20:58",
              "22:43"
            ]
          }
        }
      }
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
          "via": "przez Swoszowice"
        },
        "to_suburb": {
          "title": "Kierunek: Świątniki Górne UMiG",
          "dest": "Świątniki Górne UMiG",
          "via": "przez Wrząsowice"
        }
      },
      "stops": [
        {
          "id": "wrzasowice_centrum_915",
          "name": "Wrząsowice Centrum (kier. Świątniki)",
          "isMain": true
        },
        {
          "id": "wrzasowice_nad_wilga_915",
          "name": "Wrząsowice Nad Wilgą (kier. Łagiewniki)"
        },
        {
          "id": "wrzasowice_pod_skala_915",
          "name": "Wrząsowice Pod Skałą (NŻ, kier. Łagiewniki)"
        },
        {
          "id": "wrzasowice_zielona_915",
          "name": "Wrząsowice Zielona (NŻ, kier. Świątniki)"
        },
        {
          "id": "wrzasowice_bonifraterska_915",
          "name": "Wrząsowice Bonifraterska (NŻ, kier. Świątniki)"
        },
        {
          "id": "wrzasowice_kowaleca_915",
          "name": "Wrząsowice Kowaleca (NŻ, kier. Świątniki)"
        },
        {
          "id": "wrzasowice_pileckiego_915",
          "name": "Wrząsowice Pileckiego (NŻ, kier. Świątniki)"
        },
        {
          "id": "wrzasowice_wrzosowa_915",
          "name": "Wrząsowice Wrzosowa (NŻ, kier. Świątniki)"
        },
        {
          "id": "wrzasowice_spacerowa_915",
          "name": "Wrząsowice Spacerowa (NŻ, kier. Świątniki)"
        }
      ],
      "stopSchedules": {
        "wrzasowice_centrum_915": {
          "to_krakow": {
            "weekdays": [],
            "saturday": [],
            "sunday": []
          },
          "to_suburb": {
            "weekdays": [],
            "saturday": [
              "01:48"
            ],
            "sunday": [
              "01:48"
            ]
          }
        },
        "wrzasowice_nad_wilga_915": {
          "to_krakow": {
            "weekdays": [],
            "saturday": [
              "02:13"
            ],
            "sunday": [
              "02:13"
            ]
          },
          "to_suburb": {
            "weekdays": [],
            "saturday": [],
            "sunday": []
          }
        },
        "wrzasowice_pod_skala_915": {
          "to_krakow": {
            "weekdays": [],
            "saturday": [
              "02:12"
            ],
            "sunday": [
              "02:12"
            ]
          },
          "to_suburb": {
            "weekdays": [],
            "saturday": [],
            "sunday": []
          }
        },
        "wrzasowice_zielona_915": {
          "to_krakow": {
            "weekdays": [],
            "saturday": [],
            "sunday": []
          },
          "to_suburb": {
            "weekdays": [],
            "saturday": [
              "01:53"
            ],
            "sunday": [
              "01:53"
            ]
          }
        },
        "wrzasowice_bonifraterska_915": {
          "to_krakow": {
            "weekdays": [],
            "saturday": [],
            "sunday": []
          },
          "to_suburb": {
            "weekdays": [],
            "saturday": [
              "01:51"
            ],
            "sunday": [
              "01:51"
            ]
          }
        },
        "wrzasowice_kowaleca_915": {
          "to_krakow": {
            "weekdays": [],
            "saturday": [],
            "sunday": []
          },
          "to_suburb": {
            "weekdays": [],
            "saturday": [
              "01:50"
            ],
            "sunday": [
              "01:50"
            ]
          }
        },
        "wrzasowice_pileckiego_915": {
          "to_krakow": {
            "weekdays": [],
            "saturday": [],
            "sunday": []
          },
          "to_suburb": {
            "weekdays": [],
            "saturday": [
              "01:49"
            ],
            "sunday": [
              "01:49"
            ]
          }
        },
        "wrzasowice_wrzosowa_915": {
          "to_krakow": {
            "weekdays": [],
            "saturday": [],
            "sunday": []
          },
          "to_suburb": {
            "weekdays": [],
            "saturday": [
              "01:47"
            ],
            "sunday": [
              "01:47"
            ]
          }
        },
        "wrzasowice_spacerowa_915": {
          "to_krakow": {
            "weekdays": [],
            "saturday": [],
            "sunday": []
          },
          "to_suburb": {
            "weekdays": [],
            "saturday": [
              "01:45"
            ],
            "sunday": [
              "01:45"
            ]
          }
        }
      }
    }
  }
};
// === MPK_DATA_END ===

// ==========================================
// 2. HARMONOGRAM WYWOZU ODPADÓW (Gmina Świątniki Górne - Wrząsowice)
// ==========================================
const DEFAULT_WASTE_SCHEDULE = [
  // Zmieszane + Bioodpady (co 2 tyg. w poniedziałki)
  { date: '2026-01-12', type: 'mixed_bio' },
  { date: '2026-01-26', type: 'mixed_bio' },
  { date: '2026-02-09', type: 'mixed_bio' },
  { date: '2026-02-23', type: 'mixed_bio' },
  { date: '2026-03-09', type: 'mixed_bio' },
  { date: '2026-03-23', type: 'mixed_bio' },
  { date: '2026-04-06', type: 'mixed_bio' },
  { date: '2026-04-20', type: 'mixed_bio' },
  { date: '2026-05-04', type: 'mixed_bio' },
  { date: '2026-05-18', type: 'mixed_bio' },
  { date: '2026-06-01', type: 'mixed_bio' },
  { date: '2026-06-15', type: 'mixed_bio' },
  { date: '2026-06-29', type: 'mixed_bio' },
  { date: '2026-07-13', type: 'mixed_bio' },
  { date: '2026-07-27', type: 'mixed_bio' },
  { date: '2026-08-10', type: 'mixed_bio' },
  { date: '2026-08-24', type: 'mixed_bio' },
  { date: '2026-09-07', type: 'mixed_bio' },
  { date: '2026-09-21', type: 'mixed_bio' },
  { date: '2026-10-05', type: 'mixed_bio' },
  { date: '2026-10-19', type: 'mixed_bio' },
  { date: '2026-11-02', type: 'mixed_bio' },
  { date: '2026-11-16', type: 'mixed_bio' },
  { date: '2026-11-30', type: 'mixed_bio' },
  { date: '2026-12-14', type: 'mixed_bio' },
  { date: '2026-12-28', type: 'mixed_bio' },

  // Segregowane razem: Plastik/Metale + Papier + Szkło (raz w miesiącu w poniedziałki)
  { date: '2026-01-19', type: 'segregated' },
  { date: '2026-02-16', type: 'segregated' },
  { date: '2026-03-16', type: 'segregated' },
  { date: '2026-04-13', type: 'segregated' },
  { date: '2026-05-11', type: 'segregated' },
  { date: '2026-06-08', type: 'segregated' },
  { date: '2026-07-06', type: 'segregated' },
  { date: '2026-08-03', type: 'segregated' },
  { date: '2026-08-31', type: 'segregated' },
  { date: '2026-09-28', type: 'segregated' },
  { date: '2026-10-26', type: 'segregated' },
  { date: '2026-11-23', type: 'segregated' },
  { date: '2026-12-21', type: 'segregated' },

  // Początek 2027 dla płynnego przejścia
  { date: '2027-01-11', type: 'mixed_bio' },
  { date: '2027-01-18', type: 'segregated' },
  { date: '2027-01-25', type: 'mixed_bio' }
];

const WASTE_TYPES = {
  'mixed_bio': {
    title: 'Zmieszane + Bioodpady',
    badge: 'Zmieszane + Bio',
    color: '#b45309',
    bgColor: '#fef3c7',
    icon: '🗑️',
    description: 'Pojemnik czarny (odpady zmieszane) + brązowy worek (bioodpady kuchenne) oraz bioodpady zielone z ogrodu (trawa, liście — maks. 3 worki zielone przed posesję).',
    actionNote: 'Wystaw przed posesję do godz. 6:00 rano'
  },
  'segregated': {
    title: 'Wszystkie Segregowane Razem',
    badge: 'Segregowane (Wszystkie)',
    color: '#0284c7',
    bgColor: '#e0f2fe',
    icon: '♻️',
    description: 'Tworzywa sztuczne i metale (żółty worek), papier i makulatura (niebieski worek), szkło opakowaniowe (zielony worek) — odbierane łącznie w jednym terminie.',
    actionNote: 'Wystaw przed posesję do godz. 6:00 rano'
  }
};

// ==========================================
// 3. WAŻNE NUMERY I KONTAKTY LOKALNE
// ==========================================
const CONTACTS_DATA = {
  emergency: [
    { name: 'Numer Alarmowy', number: '112', desc: 'Ogólnoeuropejski numer ratunkowy', icon: '🚨' },
    { name: 'Pogotowie Ratunkowe', number: '999', desc: 'Szybkie wezwanie karetki', icon: '🚑' },
    { name: 'Straż Pożarna (OSP Wrząsowice)', number: '998', desc: 'Alarmowy PSP i OSP', icon: '🚒' },
    { name: 'Policja', number: '997', desc: 'Komisariat Policji Świątniki Górne', icon: '👮' }
  ],
  winter: [
    {
      name: 'Odśnieżanie Dróg Gminnych (Wrząsowice)',
      number: '+48508115902',
      displayNumber: '508 115 902',
      desc: 'Wykonawca akcji zima dla ulic gminnych we Wrząsowicach',
      tag: 'Gminne'
    },
    {
      name: 'Odśnieżanie Dróg Powiatowych (Eurovia)',
      number: '+48515126395',
      displayNumber: '515 126 395',
      desc: 'Zarząd Dróg Powiatu Krakowskiego (drogi główne/powiatowe)',
      tag: 'Powiatowe'
    }
  ],
  utilities: [
    {
      name: 'ZGK Świątniki Górne (Woda i Ścieki)',
      number: '+48122704030',
      displayNumber: '12 270 40 30',
      desc: 'Awarie sieci wodociągowej i kanalizacyjnej (dyżur: 606 720 033)',
      tag: 'Woda'
    },
    {
      name: 'Tauron Dystrybucja (Prąd)',
      number: '991',
      desc: 'Pogotowie energetyczne, zgłaszanie przerw w zasilaniu',
      tag: 'Prąd'
    },
    {
      name: 'Polska Spółka Gazownictwa (Gaz)',
      number: '992',
      desc: 'Pogotowie gazowe, nieszczelności i awarie instalacji',
      tag: 'Gaz'
    },
    {
      name: 'Urząd Miasta i Gminy Świątniki Górne',
      number: '+48122704045',
      displayNumber: '12 270 40 45',
      desc: 'Sekretariat UMiG, ul. Bruchnalskiego 36',
      tag: 'Urząd'
    },
    {
      name: 'PSZOK Świątniki Górne',
      number: '+48122704030',
      displayNumber: '12 270 40 30',
      desc: 'ul. Ekologiczna 16 (Śr 10-18, Sob 8-16)',
      tag: 'PSZOK'
    }
  ],
  health: [
    {
      name: 'NiŚOZ Mogilany (Główna Pomoc Nocna i Świąteczna)',
      number: '+48122700625',
      displayNumber: '12 270 06 25 wew. 6',
      address: 'Mogilany, ul. Rynek 4',
      desc: 'Rejonowy punkt nocnej opieki dla Gminy Świątniki Górne. Czynny 18:00 - 08:00 w dni powszednie, całodobowo w weekendy i święta.',
      isPrimaryNisoz: true,
      mapsUrl: 'https://maps.google.com/?q=Rynek+4,+Mogilany'
    },
    {
      name: 'NiŚOZ Szpital św. Rafała (Kraków Południe)',
      number: '+48123855805',
      displayNumber: '12 385 58 05',
      address: 'Kraków, ul. Bochenka 12',
      desc: 'Punkt bez rejonizacji NFZ po stronie Krakowa, blisko Wrząsowic.',
      mapsUrl: 'https://maps.google.com/?q=Bochenka+12,+Krakow'
    },
    {
      name: 'Apteka DOZ Swoszowice',
      number: '+48126549020',
      displayNumber: '12 654 90 20',
      address: 'Kraków - Swoszowice, ul. Myślenicka 133',
      desc: 'Najbliższa apteka przy trasie autobusu 215/225 (czynna do 20:00/21:00)'
    },
    {
      name: 'Apteka Magda II (Świątniki Górne)',
      number: '+48122704200',
      displayNumber: '12 270 42 00',
      address: 'Świątniki Górne, ul. Bielowicza 54',
      desc: 'Apteka w centrum gminy Świątniki Górne'
    },
    {
      name: 'Apteka Całodobowa 24/7 (Kraków Południe)',
      number: '+48126562224',
      displayNumber: '12 656 22 24',
      address: 'Kraków, ul. Kalwaryjska 94',
      desc: 'Dyżur nocny i świąteczny 24h/7'
    }
  ],
  culture: {
    communityCenter: {
      name: 'Stara Szkoła we Wrząsowicach (Filia CK)',
      address: 'Wrząsowice, ul. Pileckiego 3',
      desc: 'Centrum aktywności wiejskiej, zajęcia dla dzieci, młodzieży, seniorów i KGW.',
      activities: [
        { day: 'Poniedziałek', time: '18:30 - 19:30', title: 'Joga i Rozciąganie' },
        { day: 'Wtorek', time: '17:00 - 18:30', title: 'Warsztaty plastyczne dla dzieci' },
        { day: 'Środa', time: '19:00 - 20:00', title: 'Zumba Fitness' },
        { day: 'Czwartek', time: '17:30 - 19:00', title: 'Klub Seniora & Koło Gospodyń Wiejskich' },
        { day: 'Piątek', time: '18:00 - 19:30', title: 'Zdrowy Kręgosłup' }
      ]
    },
    churches: [
      {
        parish: 'Parafia Przemienienia Pańskiego (Wróblowice - Swoszowice)',
        address: 'Kraków, ul. Niewodniczańskiego 2',
        sundayMasses: '07:00, 09:00, 10:30, 12:00, 18:00',
        weekdayMasses: '06:30, 18:00',
        url: 'https://parafiawroblowice.pl'
      },
      {
        parish: 'Parafia św. Stanisława BM (Świątniki Górne)',
        address: 'Świątniki Górne, ul. Bruchnalskiego 34',
        sundayMasses: '06:30, 08:00, 09:30, 11:00, 17:00',
        weekdayMasses: '06:30, 18:00',
        url: 'https://parafiaswiatnikigorne.pl'
      }
    ]
  }
};
