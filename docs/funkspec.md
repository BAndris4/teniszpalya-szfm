# Funkcionális specifikáció – Teniszpálya foglalási rendszer

## 1. Bevezetés
A dokumentum a teniszpálya foglalási rendszer megvalósított funkcióit részletezi a követelményspecifikációban meghatározott nyolc fő követelmény mentén. Minden követelményhez több, egymással együttműködő funkció tartozik, amelyek lefedik a felhasználói és adminisztratív folyamatok lépéseit, adatfolyamait, valamint a hibakezelési forgatókönyveket. A leírás a jelenlegi frontend és backend implementáció alapján készült, és tartalmazza az API végpontokra, komponensekre, adatmodellekre és jogosultságokra vonatkozó hivatkozásokat is.

## 2. Szereplők
- **Látogató:** be nem jelentkezett felhasználó, aki információt keres.
- **Játékos:** regisztrált és bejelentkezett felhasználó, aki pályát foglalhat, kuponokat használhat, tornára jelentkezhet.
- **Admin:** üzemeltető, aki a foglalásokat és tornákat felügyeli, illetve kuponokat kezel.

## 3. Követelményekhez rendelt funkciók

### 3.1 K01 – Publikus élmény: Nyilvános információk egységes bemutatása
A látogatók elsődleges célja, hogy gyorsan áttekintsék a szolgáltatásokat, az árakat és kapcsolatfelvételi lehetőségeket. A publikus felület reszponzív és vizuálisan konzisztens élményt nyújt.

#### F01 – Landing oldali szekciók összeállítása
- **Cél:** a Hero, Courts Preview, Price List és Contact szekciók sorrendben történő megjelenítése a `HomePage` komponensben.
- **Trigger:** a felhasználó betölti a főoldalt (`/`).
- **Előfeltételek:** a statikus tartalmak, valamint a pályalistát szolgáltató `/api/Courts` végpont elérhető.
- **Normál folyamat:**
  1. A frontend inicializáláskor betölti a statikus konfigurációt (szekciók metaadatai).
  2. A `CourtsPreview` komponens GET kérést küld az API-hoz, és a válasz alapján megjeleníti a pályákat.
  3. A Price List szekció előkalkulált, szezonfüggő árakat renderel.
  4. A Contact szekció űrlapja inicializálódik validációs sémával.
- **Alternatívák:** API hiba esetén a pályalistát helykitöltő üzenet helyettesíti; a rendszer logolja a hibát.
- **Kimenet:** teljes landing oldal 3 másodpercen belül renderelve.

#### F02 – Háttér animációk és reszponzív töréspontok kezelése
- **Cél:** az animált canvas hátterek eszközméret alapján optimalizált renderelése.
- **Trigger:** a `BackgroundController` komponens a viewport méretét érzékeli.
- **Előfeltételek:** böngésző támogatja a `requestAnimationFrame` hívást.
- **Normál folyamat:**
  1. A komponens inicializálja az animációs konfigurációt (színek, részecskeszám).
  2. Viewport-változáskor throttle-olt módon újraszámolja az animáció paramétereit.
  3. Animáció futása közben figyeli az oldal görgetését, és ennek alapján vált hátteret.
- **Alternatívák:** teljesítmény-probléma esetén a rendszer statikus háttérre vált (CSS class).
- **Kapcsolódó adatok:** nincs adatbázis művelet, csak kliens oldali állapot.

#### F03 – Kapcsolatfelvételi űrlap validáció és visszajelzés
- **Cél:** a látogatók hibamentesen küldhessenek üzenetet demo üzemmódban.
- **Trigger:** felhasználó kitölti és elküldi az űrlapot.
- **Előfeltételek:** a `ContactForm` komponens betöltődött, és a validációs szabályok (név ≥ 3 karakter, érvényes e-mail, üzenet ≥ 10 karakter) aktívak.
- **Normál folyamat:**
  1. A felhasználó mezőnként azonnali visszajelzést kap.
  2. Sikeres submit után a rendszer faux API-hívást szimulál 500 ms késleltetéssel.
  3. A visszajelző modál megjelenik, majd az űrlap mezői resetelődnek.
- **Alternatívák:** validációs hiba esetén a mező pirossal keretezett, submit nem indítható el.
- **Utófeltétel:** interakció logja rögzül a kliens oldali analitikában.

### 3.2 K02 – Felhasználói fiókkezelés: Hitelesítés és profil karbantartás
A fiókkezelés biztosítja az azonosítást, jogosultságot és személyes adatok frissen tartását. Az auth modul a backend ASP.NET Identity implementációjára épül.

#### F04 – Regisztráció folyamat
- **Trigger:** látogató a "Sign up" gombra kattint.
- **Előfeltételek:** a `/api/auth/register` végpont elérhető, nincs aktív session.
- **Lépések:**
  1. Frontend validálja az űrlapot (email formátum, jelszó ≥ 8 karakter, telefonszám minta).
  2. POST kérés kerül kiküldésre hash-elt jelszóval.
  3. Backend egyedi e-mailt ellenőriz, majd új felhasználót hoz létre.
  4. Siker esetén visszaadott státusz 201, a felhasználó értesítést kap.
- **Hibakezelés:** duplikált e-mail 409-es státuszt eredményez, amit a frontend piros értesítővel jelez.

#### F05 – Bejelentkezés és session létrehozás
- **Trigger:** felhasználó a login űrlapot beküldi.
- **Előfeltételek:** létező fiók, aktív backend.
- **Folyamat:**
  1. A `LoginForm` elküldi a hitelesítő adatokat a `/api/auth/login` végpontra.
  2. Siker esetén a backend JWT-t ad vissza, amely HTTP-only sütiben kerül tárolásra.
  3. A frontend frissíti a globális auth állapotot és a fő navigációt.
- **Alternatívák:** hibás jelszó -> 401, a mezők kitisztulnak, audit log keletkezik.

#### F06 – Aktuális felhasználó lekérdezése
- **Cél:** az oldal újratöltésekor is megőrizni a session állapotát.
- **Lépések:**
  1. Az `AuthProvider` komponens indításkor meghívja a `/api/auth/me` végpontot.
  2. Érvényes süti esetén visszaadja a felhasználó profilját és szerepét.
  3. A válasz alapján engedélyeződnek a játékos/admin menüpontok.
- **Hibakezelés:** 401 esetén a rendszer kijelentkeztet és törli a lokális auth állapotot.

#### F07 – Profiladat és jelszó módosítás
- **Cél:** játékos adatai naprakészek maradjanak.
- **Folyamat:**
  1. Felhasználó a `Profile` felület "Account" fülén módosítja nevét, e-mailjét, telefonszámát.
  2. A `PUT /api/Users/edit` hívás validálja az adatokat és frissíti az adatbázist.
  3. Jelszócsere a `PUT /api/auth/password` végponton történik aktuális jelszó ellenőrzésével.
- **Hibakezelés:** hibás aktuális jelszó -> 401, mező alatti hibaüzenet; e-mail ütközés -> 409.

### 3.3 K03 – Foglalási előkészítés: Szabad pályák és idősávok feltárása

#### F08 – Dátum- és pályaválasztó nézet
- **Trigger:** játékos a "Foglalás" menüpontot megnyitja.
- **Lépések:**
  1. A `CourtSchedule` komponens megjeleníti az elérhető pályákat a GET `/api/Courts` válaszából.
  2. A felhasználó dátumot választ; a rendszer téli időszakban szűri a kültéri pályákat.
  3. Idősáv kiválasztás nélkül a "Tovább" gomb inaktív.
- **Alternatívák:** ha nincs elérhető pálya, információs banner jelenik meg.

#### F09 – Idősáv szerinti keresés
- **Cél:** adott idősávra összes pálya elérhetőségének megtekintése.
- **Folyamat:**
  1. A `TimeslotView` az `/api/Reservations/availability` végponttal lekéri a szabadságot.
  2. A válasz JSON-ban pályánként jelzi a státuszt (free/occupied/blocked).
  3. A frontend színkódokkal jeleníti meg, a blokkolt elemek disable állapotúak.
- **Hibakezelés:** kommunikációs hiba esetén újratöltést ajánló toast jelenik meg.

#### F10 – Szűrők és cache kezelés
- **Cél:** felhasználói szűrők megtartása és API terhelés csökkentése.
- **Mechanizmus:**
  - A `BookingContext` a kiválasztott dátumot, pályát, idősávot `sessionStorage`-ban őrzi.
  - Az API válaszokat 60 másodperces kliens oldali cache-ben tartja.
  - Nézetváltáskor ezekből az állapotokból tölti vissza a felületet.
- **Eredmény:** legfeljebb 2 API hívás történik egy böngészési szekció alatt.

### 3.4 K04 – Foglalás véglegesítés: Checkout, díjkalkuláció és mentés

#### F11 – Díjkalkuláció hallgatói kedvezménnyel
- **Trigger:** játékos a "Checkout" lépésre lép.
- **Lépések:**
  1. A rendszer a kiválasztott időpontból és pálya attribútumaiból meghatározza az óradíjat.
  2. Hallgatói kapcsoló bekapcsolásával 10% kedvezmény számítódik.
  3. A kupon mező előzetesen ellenőrzi a formátumot.
- **Alternatívák:** ha nincs aktív kedvezmény, alapár jelenik meg.

#### F12 – Kupon validálás és alkalmazás
- **Folyamat:**
  1. A felhasználó beírja a kódot, a rendszer a `POST /api/coupon/validate` végpontot hívja.
  2. A válasz jelzi a kedvezmény mértékét és a `once` attribútumot.
  3. Elfogadott kód esetén a fizetendő összeg újraszámolódik, a kupon "locked" állapotba kerül.
- **Hibakezelés:** lejárt vagy használt kód -> 400; a felület hibaüzenetet jelenít meg.

#### F13 – Foglalás mentése és visszajelzés
- **Lépések:**
  1. A "Foglalás megerősítése" gomb POST kérést indít a `/api/Reservations` végpontra.
  2. Sikeres válasz esetén a rendszer megjeleníti a visszaigazoló modált, majd 2,5 mp után a kezdőlapra navigál.
  3. Kupon használata esetén a backend a kapcsolódó rekord `Used` mezőjét igazra állítja.
- **Hibakezelés:** ütköző idősáv -> 409; a felhasználó új idősáv választását kérő üzenetet kap.

### 3.5 K05 – Hűség és kuponkezelés: Kuponok kiosztása, listázása és felhasználása

#### F14 – Kuponlista megjelenítés a profilban
- **Trigger:** játékos a profil "Coupons" fülére lép.
- **Folyamat:**
  1. GET `/api/coupon/my` hívás betölti az aktív kuponokat.
  2. A lista csak fel nem használt kódokat tartalmaz, rendezve lejárat szerint.
  3. Üres lista esetén illusztráció és CTA jelenik meg a minijátékra.

#### F15 – Kupon igénylése minijátékkal
- **Trigger:** játékos befejezi a Tennis Mini Game-et győzelemmel.
- **Mechanizmus:**
  1. A játék eseményt küld a `/api/coupon/redeem-mini-game` végpontra.
  2. Backend új kuponkódot generál, ellenőrzi az 1 napos rate limitet.
  3. A frontend értesítést jelenít meg és frissíti a kuponlistát.
- **Hibakezelés:** rate limit túllépése -> 429, tájékoztató üzenet jelenik meg.

#### F16 – Admin kuponkezelés előkészítése
- **Cél:** az admin felület alapot adjon kuponok létrehozásához.
- **Folyamat:**
  1. Az admin nézet listázza a kuponokat és azok állapotát.
  2. Az új kupon és mentés gombok későbbi fejlesztésre disable állapotban jelennek meg.
  3. A felület figyelmezteti az admint a hiányzó jogosultságokra (például e-mail értesítés nincs integrálva).

### 3.6 K06 – Versenyszervezés: Tornák menedzsmentje és jelentkezés

#### F17 – Tornák listázása
- **Trigger:** felhasználó megnyitja a "Tournaments" oldalt.
- **Folyamat:**
  1. GET `/api/Tournaments` lekérdezi az összes aktív tornát.
  2. A lista kártyákon jelenik meg létszám és határidő információval.
  3. Üres válasz esetén illusztráció és információs szöveg jelenik meg.

#### F18 – Torna részletek és jelentkezés
- **Folyamat:**
  1. Felhasználó részletező nézetre lép; a rendszer a `/api/Tournaments/{id}` végpontot hívja.
  2. A jelentkezés gomb csak játékos szerepkörben aktív.
  3. `POST /api/Tournaments/{id}/join` ellenőrzi a létszám limitet és a duplikációt.
  4. Siker után a résztvevő lista frissül, a felhasználó visszajelzést kap.
- **Alternatívák:** megtelt torna -> 409; a gomb disabled.

#### F19 – Admin torna menedzsment
- **Trigger:** admin a "Tournaments" admin nézetet használja.
- **Folyamat:**
  1. Új torna létrehozása `POST /api/Tournaments` validációval (név, dátum, limit kötelező).
  2. Szerkesztés `PUT /api/Tournaments/{id}` útján, változáskor audit napló készül.
  3. Törlés `DELETE /api/Tournaments/{id}`, megerősítő modál után.
- **Hibakezelés:** érvénytelen dátum -> 400; a felület jelzi a hibás mezőt.

### 3.7 K07 – Adminisztráció: Foglalások felügyelete és adatok szinkronja

#### F20 – Foglalások listázása és szűrése
- **Trigger:** admin belép az admin panel "Reservations" oldalára.
- **Folyamat:**
  1. GET `/api/Reservations/admin` összes foglalást lekérdezi.
  2. A táblázat támogatja a név, pálya, státusz szerinti szűrést és az oszlop szerinti rendezést.
  3. Lapozás 25 soros oldalanként történik.
- **Alternatívák:** nincs találat -> üres állapot magyarázattal.

#### F21 – Foglalás törlése admin által
- **Folyamat:**
  1. Admin a táblázat sorában törlés ikonra kattint.
  2. Megerősítő modál jelenik meg, a "Megerősítés" gomb POST hívást indít a `/api/Reservations/{id}/cancel` végpontnak.
  3. Siker esetén a sor eltűnik, snackbar visszajelzést kap.
- **Hibakezelés:** hálózati hiba -> modál hibaüzenetet jelez, a sor állapota változatlan.

#### F22 – Felhasználói metaadatok szinkronizálása
- **Cél:** minden foglalásnál látható legyen a felhasználó neve és e-mailje.
- **Mechanizmus:**
  - A backend a foglalás lekérdezésekor `Include(User)` hívást használ.
  - A frontend a táblázatban kombinálja a foglalási adatokat a felhasználói objektummal.
  - Hiányzó felhasználó esetén "Törölt felhasználó" megjelölést alkalmaz.

### 3.8 K08 – Nem-funkcionális elvárások: Teljesítmény, biztonság és rendelkezésre állás

#### F23 – Jogosultságkezelés és védelem
- **Cél:** biztosítani, hogy az API végpontokat csak megfelelő szerepkörrel lehessen elérni.
- **Elemek:**
  - ASP.NET `[Authorize(Roles="Admin")]` attribútum a kritikus végpontokon.
  - Frontend route guard, amely a szerepkörtől függően engedélyezi az útvonalakat.
  - Sikertelen próbálkozások rögzítése logban, és egységes 401/403 válaszok küldése.

#### F24 – Monitorozás és hibalogolás
- **Cél:** az üzemeltető időben értesüljön a problémákról.
- **Mechanizmus:**
  - Backend oldalon központi exception middleware logolja a hibákat (fájl + konzol).
  - Frontend `ErrorBoundary` komponens felhasználóbarát hibaoldalt jelenít meg.
  - A kritikus hibákról admin értesítést generál a rendszer (dashboard banner).