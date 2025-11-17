# Teniszpálya foglalási rendszer

A projekt egy teljes körű teniszpálya-foglaló megoldás ASP.NET Core alapú REST API-val és Vite + React frontenddel. A megoldás célja, hogy a látogatók információt szerezhessenek a pályákról, a játékosok online foglalhassanak, az adminisztrátorok pedig kezelhessék az árakat, kedvezményeket és tornákat.

## Fő technológiák
- **Backend:** .NET 8, ASP.NET Core Web API, Entity Framework Core + SQLite, JWT alapú autentikáció
- **Frontend:** React 19, Vite, Tailwind CSS, Framer Motion, React Router
- **Egyéb:** Google Calendar integráció, Swagger UI, ESLint

## Könyvtárstruktúra
| Mappa | Tartalom |
| --- | --- |
| `API/Teniszpalya.API` | ASP.NET Core Web API projekt, EF Core migrációk és seed adatok |
| `frontend/` | React + Vite kliensalkalmazás forráskódja |
| `docs/` | Funkcionális és követelményspecifikációk, Architektúra és rendszerterv összefoglaló, Gherkin forgatókönyvek, meeting jegyzetek |
| `static/` | Statikus képi anyagok (landing oldal illusztrációk) |
| `start-dev.bat` | Windows segédszkript a backend és frontend párhuzamos indításához |

## Dokumentációk
- `docs/funkspec.md`: részletes funkcionális specifikáció
- `docs/kovspec.md`: követelményspecifikáció és prioritások
- `docs/gherkin/`: BDD forgatókönyvek a kritikus felhasználói utakra
- `docs/minutes_of_meeting.md`: egyeztetések jegyzőkönyvei
- `docs/rendszerterv.md`: infrastruktúra, komponensdiagramok és üzemeltetési ajánlások

## Előkövetelmények
- .NET SDK 8.0+
- Node.js 20+ és npm
- EF Core CLI (`dotnet tool install --global dotnet-ef`) a migrációk futtatásához
- SQLite (beágyazott fájl adatbázis, alapból `site.db` néven jön létre)

## Fejlesztői futtatás
### 1. Backend (ASP.NET Core API)
```bash
cd API/Teniszpalya.API
dotnet restore
dotnet ef database update   # adatbázis létrehozása/migrálása
dotnet run                  # alapértelmezett: http://localhost:5044
```
- Az indításkor a `Program.cs` automatikusan seedeli az admin (`admin@test.com` / `admin123`) és teszt felhasználót (`test@test.com` / `test123`), a pályákat és az árlistát.
- Swagger UI: [http://localhost:5044/swagger](http://localhost:5044/swagger)

### 2. Frontend (Vite + React)
```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```
- A frontend `http://localhost:5173`-ról kommunikál az API-val, ezért CORS engedélyezve van erre az originre.

### 3. Gyors indítás Windows alatt
```bat
start-dev.bat
```
Ez két parancssort nyit: az egyikben `dotnet run` indul az API számára, a másikban `npm run dev` a React klienshez.

## Build és éles üzem
- **Frontend build:** `cd frontend && npm run build` → a Vite `dist/` könyvtárában statikus állományokat hoz létre.
- **Backend publikálás:** `cd API/Teniszpalya.API && dotnet publish -c Release -o out` → az `out/` mappában található a futtatható API.
- Az éles környezetben frissítsd az `appsettings.json` értékeit (adatbázis, `Jwt` kulcsok, `GoogleAuth` kliensadatok) és állíts be HTTPS-t vagy reverse proxy-t.

## Konfiguráció
- **Adatbázis:** `ConnectionStrings:DefaultConnection` → alapból `site.db` fájl a projekten belül.
- **JWT:** `Jwt:Key`, `Jwt:Issuer`, `Jwt:Audience` → fejlesztéshez adott hosszú kulcs, produkcióban cseréld le.
- **GoogleAuth:** `ClientID`, `ClientSecret`, `RedirectUri` → Google OAuth integrációhoz szükséges.
- Opcionálisan használhatod az `appsettings.Development.json` fájlt gépspecifikus beállításokra.

## Tesztadatok és szerepkörök
| Szerep | E-mail | Jelszó |
| --- | --- | --- |
| Admin | `admin@admin.com` | `admin` |
| Felhasználó | `user@user.com` | `user` |

Az `AppDBContext` seed-je gondoskodik a fenti fiókokról és az alap pálya-/árlistáról, így a fejlesztői környezet azonnal használható.

## További erőforrások
- `static/img/` – adatbázis diagram, class diagram és usecase diagram fájlok találhatóak
- `docs/gherkin/*.feature` – automatizált tesztek forgatókönyvei
- `docs/minutes_of_meeting.md` – csapatszintű döntések kronológiája