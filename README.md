# U-Cloud Monitor

Modern szerverfigyelő rendszer valós idejű metrikákkal, üzemidő követéssel és értesítésekkel.

## 🚀 Funkciók

- **Valós idejű Monitorozás**: CPU, RAM és lemezhasználat követése
- **Üzemidő Követés**: Részletes üzemidő statisztikák és grafikonok
- **Értesítések**: Azonnali értesítések szerver problémák esetén
- **Kategória Kezelés**: Szerverek rugalmas csoportosítása
- **Admin Felület**: Könnyen használható, modern kezelőfelület
- **API Integráció**: Egyszerű integráció a meglévő rendszerekkel

## 📋 Telepítés és Futtatás

### Előfeltételek

- Node.js 20.x vagy újabb
- npm 9.x vagy újabb
- Python 3.6+ (a monitoring agent-hez)

### Fejlesztői Környezet

```bash
# Projekt klónozása
git clone https://github.com/yourusername/ucloud-monitor.git
cd ucloud-monitor

# Függőségek telepítése
npm install

# Fejlesztői szerverek indítása
npm run dev
```

A fejlesztői környezetben két szerver fut párhuzamosan:
- Backend API: http://localhost:3000
- Frontend Dev Server: http://localhost:5173

### Éles Környezet

```bash
# Frontend build
npm run build

# Szerver indítása
npm start
```

Az éles környezetben csak a backend szerver fut (port: 3000), amely kiszolgálja mind az API-t, mind a statikus frontend fájlokat.

## 🔧 Konfiguráció

### Környezeti Változók

```env
NODE_ENV=production
PORT=3000
```

### Adatkönyvtár Struktúra

```
data/
├── categories.json    # Szerver kategóriák és konfigurációk
├── notifications.json # Rendszerértesítések
├── metrics/          # Szerver metrikák (JSON fájlok szerverenként)
└── history/          # Történeti adatok (JSON fájlok szerverenként)
```

## 📡 API Dokumentáció

### Kategória Kezelés

#### GET /api/categories
- **Leírás**: Összes kategória lekérése
- **Válasz**: `Category[]`

#### POST /api/categories
- **Leírás**: Új kategória létrehozása
- **Body**: `{ name: string }`
- **Válasz**: `Category`

#### PUT /api/categories/:id
- **Leírás**: Kategória módosítása
- **Body**: `{ name: string }`
- **Válasz**: `Category`

#### DELETE /api/categories/:id
- **Leírás**: Kategória törlése
- **Válasz**: `{ success: boolean }`

### Szerver Kezelés

#### GET /api/servers
- **Leírás**: Szerverek lekérése kategóriánként csoportosítva
- **Válasz**: `{ [categoryName: string]: ServerStatus[] }`

#### POST /api/servers
- **Leírás**: Új szerver hozzáadása
- **Body**: `{ name: string, location: string, categoryId: string }`
- **Válasz**: `Server`

#### PUT /api/servers/:id
- **Leírás**: Szerver módosítása
- **Body**: `{ name: string, location: string, categoryId: string }`
- **Válasz**: `Server`

#### DELETE /api/servers/:id
- **Leírás**: Szerver törlése
- **Válasz**: `{ success: boolean }`

### Metrika Kezelés

#### POST /api/metrics
- **Leírás**: Szerver metrikák frissítése
- **Headers**: `Authorization: Bearer <api_key>`
- **Body**:
  ```json
  {
    "metrics": {
      "cpu": number,
      "ram": number,
      "disk": number
    },
    "timestamp": string,
    "hostname": string
  }
  ```
- **Válasz**: `{ success: boolean }`

### Értesítések

#### GET /api/notifications
- **Leírás**: Aktív értesítések lekérése
- **Válasz**: `Notification[]`

#### POST /api/notifications
- **Leírás**: Új értesítés létrehozása
- **Body**: `{ type: "info" | "warning" | "error", message: string }`
- **Válasz**: `Notification`

#### DELETE /api/notifications/:id
- **Leírás**: Értesítés elrejtése
- **Válasz**: `{ success: boolean }`

## 🔒 Biztonság

### Admin Felület

- Alapértelmezett bejelentkezési adatok:
  - Felhasználónév: `tibor`
  - Jelszó: `Gumibogyo5`

### API Kulcsok

- Minden szerverhez egyedi API kulcs generálódik
- Az API kulcsok a szerver létrehozásakor automatikusan generálódnak
- A kulcsok a szerver beállításainál megtekinthetők és másolhatók

## 📊 Monitoring Agent

### Telepítés

1. Másold át a `python-agent` könyvtárat a célszerverre
2. Telepítsd a függőségeket:
   ```bash
   pip install psutil
   ```

### Konfiguráció

Szerkeszd a `config.json` fájlt:
```json
{
  "api_endpoint": "http://monitor-server:3000/api/metrics",
  "api_key": "az_api_kulcsod",
  "interval": 60,
  "debug": false
}
```

### Indítás

```bash
python server_monitor.py
```

### Systemd Szolgáltatásként

1. Hozz létre egy service fájlt:
```bash
sudo nano /etc/systemd/system/ucloud-monitor.service
```

2. Add hozzá a következő konfigurációt:
```ini
[Unit]
Description=U-Cloud Monitoring Agent
After=network.target

[Service]
ExecStart=/usr/bin/python3 /path/to/server_monitor.py
WorkingDirectory=/path/to/agent
Restart=always
User=root

[Install]
WantedBy=multi-user.target
```

3. Engedélyezd és indítsd el:
```bash
sudo systemctl enable ucloud-monitor
sudo systemctl start ucloud-monitor
```

## 🔍 Hibaelhárítás

### Gyakori Problémák

1. **A szerver offline állapotba kerül**
   - Ellenőrizd a monitoring agent futását
   - Ellenőrizd az API kulcs helyességét
   - Ellenőrizd a hálózati kapcsolatot

2. **Magas erőforráshasználat**
   - Az adatok 60 másodpercenként frissülnek
   - A history adatok 365 napig tárolódnak
   - Nagy számú szerver esetén növeld a memória limitet

3. **Értesítések nem érkeznek**
   - Ellenőrizd az értesítési beállításokat
   - Ellenőrizd a határértékeket
   - Ellenőrizd a szerver státuszát

### Logok

- Backend: `server.log`
- Monitoring Agent: `server_monitor.log`

## 🔄 Frissítés

1. Állítsd le a szervert
2. Készíts biztonsági másolatot a `data` könyvtárról
3. Húzd le a legújabb verziót
4. Telepítsd a függőségeket: `npm install`
5. Építsd újra a frontendet: `npm run build`
6. Indítsd újra a szervert: `npm start`

## 📝 Licensz

MIT License - lásd a [LICENSE](LICENSE) fájlt a részletekért.
