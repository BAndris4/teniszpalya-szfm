
# ═══════════════════════════════════════════

# :pencil: Jegyzőkönyv — Projektmegbeszélés (2025.10.04.)

## :dart: Téma:
A nagy projekt (Teniszpálya-foglaló rendszer) első lépései

## :bulb: Megbeszéltek

* **Projekt témája:** Teniszpálya-foglaló webalkalmazás.
* **Első feladat:** **Login és regisztrációs rendszer** (auth) elkészítése.
* **Teljes projektre tervezett funkciók (későbbi sprintekben):**
    * **Főoldal:**
        * Láthatók a pályák és árak.
        * Időpont-foglalás lehetséges (X órára, Y pályára).
        * Email értesítés a foglalásról.
    * **Admin felület:** Az admin megtekintheti a foglalásokat.

## :brain: Döntések
Első sprint: **csak auth rendszer**.
Balogh András: elkezdi a **követelményspecifikáció és feature specifikáció vázlatát**.
Orosz István és Halász Ádám: holnap este csatlakoznak a **review-ra**, és közösen alakítják a dokumentumokat.

## :pushpin: Konklúzió
:arrow_right: Projekt téma fixálva: **Teniszpálya-foglaló app**.
:arrow_right: **Első sprint célja:** login és regisztrációs rendszer.
:arrow_right: **Közös review holnap este**.

# ═══════════════════════════════════════════
# :pencil: Jegyzőkönyv — Projektmegbeszélés (2025.10.06.)

## :dart: Téma:
Teniszpálya-foglaló rendszer fejlesztése – haladás és admin funkciók tervezése

## :bulb: Megbeszéltek

* Felmerült, hogy az admin számára szükséges funkciók (új pálya létrehozása, módosítása, törlése) hiányoznak a jelenlegi verzióból.
    * **Megállapodás:** ezek a funkciók **későbbi sprintben** kerülnek bevezetésre.

* **Fejlesztési státusz:**
    * **Balogh András** elkészült a főoldal alapjaival, beépített egy **animációt**, és megtervezte, hogy az oldal **scrollozható** lesz.
    * A menüpontokra kattintva az oldal automatikusan **legörget** a megfelelő szekcióhoz.
    * A fejlesztés külön **branch-en** történik, később merge következik.

* **Orosz István** közben készített egy **.bat fájlt**, amivel egyszerre elindítható a **backend és a frontend**, illetve összekötötte a **Vite-ot** a backenddel.
* Tisztázták a **branch merge** folyamatát, mivel korábban felmerült, hogy merge után a branch eltűnik-e.

## :brain: Döntések
Az admin **CRUD funkciók** (pályák létrehozása, módosítása, törlése) a **következő sprintben** készülnek el.
A jelenlegi sprint célja a **frontend struktúra befejezése** és a **backend integráció**.
A **merge folyamatot egységesítik**, hogy elkerüljék az esetleges hibákat.

## :pushpin: Konklúzió
:arrow_right: Admin funkciók **átkerülnek a következő sprintbe**.
:arrow_right: A **főoldal fejlesztése** folyamatban, animáció és görgetés megvalósítva.
:arrow_right: **Backend–frontend kapcsolat működik** (.bat fájl segítségével).
:arrow_right: Merge folyamat tisztázva, fejlesztés **stabilan halad**.

# ═══════════════════════════════════════════

# :pencil: Jegyzőkönyv — Projektmegbeszélés (2025.10.08.)

## :dart: Téma:
Teniszpálya-foglaló rendszer – árlista, adatbázis-terv és frontend integráció

## :bulb: Megbeszéltek

* **Orosz István** rákérdezett, hogy az árlista a frontendbe vagy a backendbe kerüljön.
    * **Balogh András** szerint a **backendben** célszerű kezelni, mivel az admin panelen keresztül módosítható kell legyen.
* **Árlista Adatbázis-séma kidolgozása (CourtPrices):**
    * **`Outdoor`** mező jelzi, hogy fedett vagy nyitott pályáról van szó.
    * **`Season`** mező jelöli az évszakot (nyári / téli) – ez **enum típusú** lesz.
    * **`Price`, `ValidFrom`, `ValidTo`** mezők kezelik az árakat és akciókat.
    * Ha `ValidTo` nem null → akciós ár (pl. Black Friday). A rendszer automatikusan törli az akciós árakat, ha lejár a dátum.
* Megállapodtak, hogy **JOIN** nem szükséges, mivel az árakat az `Outdoor` és `Season` mezők alapján lehet kezelni.
* István megemlítette, hogy **CORS beállításokat** kellett konfigurálni a backendben, ezt András sikeresen megoldotta.
* András kérte, hogy István **dummy adatokat** adjon a pályákhoz (kb. 7 db), hogy a frontend görgetése tesztelhető legyen.
* Este András feltöltötte a **PlantUML class diagramot** és a táblaterveket, amelyek a végleges adatbázis-struktúrát mutatják.

## :brain: Döntések
- Árlista a **backendben** kerül megvalósításra.
- **CourtPrices tábla véglegesítve** a következő mezőkkel: `Outdoor`, `Season (enum)`, `Price`, `ValidFrom`, `ValidTo (null = aktuális, nem akciós)`.
- **Class diagram és adatbázis-terv frissítése** András feladata.
- **Dummy adatok hozzáadása** a teszteléshez István feladata.

## :pushpin: Konklúzió
* **Árlista backendbe kerül**, adminon keresztül módosítható lesz.
* **Új CourtPrices tábla megtervezve**, enum-os évszakkezeléssel.
* **Diagramok és adatbázisterv frissítve**.
* **CORS beállítás megoldva**, API működik.
* **Frontendre görgethető lista és tesztadatok** készülnek.

# ═══════════════════════════════════════════

# :pencil: Jegyzőkönyv — Projektmegbeszélés (2025.10.09.)

## :dart: Téma:
Teniszpálya-foglaló rendszer – adatfeltöltés, sprinttervezés és hibajavítás

## :bulb: Megbeszéltek

* **István** hozzáadta a **CourtPrice táblát** az adatbázishoz, és rákérdezett, mi hiányzik még a backendből.
* **András** kérte, hogy **dummy adatok** is kerüljenek be a teniszpályákhoz, hogy a frontend görgetése és megjelenítés teszthető legyen.
    * István javasolta a **DB Browser for SQLite** használatát a manuális adatbevitelhez.
* **András** elkészült a **pályainformációs (Court Info) rész frontendjével**, és pusholta a kódot.
    * Közben elkezdte a **Trello feladatok kiosztását** a következő hétre, és backlogba helyezte a terveket.
    * Jelezte, hogy a tervezett mennyiség talán sok lesz.
* **István** szerint az aktuális sprint feladatai gyorsan elvégezhetők voltak, nem túlterhelő a következő hét sem.
* **András** viszont kiemelte, hogy a frontend implementálása **időigényes volt a CSS hibák és a carousel miatt**.
* **Ádám** a jelen sprintre tervezett galéria és árlista frontend részeket kapta, de **beteg**, így ez átcsúszik a következő hétre.
* **A következő sprint célja:**
    * Bejelentkezés és jelszó-visszaállítás funkciók implementálása.
* Késő este **András** jelezte, hogy a **backend nem indul el**, mert nem kap adatot – kiderült, hogy hiányzott egy **route**.
    * István gyorsan javította a hibát.
    * András holnap újra ránéz, mert a frontendben is talált egy **bugot**.
* Felmerült az igény egy **Jira** bevezetésére a feladat- és bugkövetéshez, mivel eddig nem volt formális tesztelés.
    * István megemlítette, hogy a frontend tesztek valószínűleg **manuálisak** maradnak, mivel a reszponzivitás nehezen automatizálható.

## :brain: Döntések

- CourtPrice adatbázis-tábla elkészült, dummy adatok felvitele folyamatban.
- Trello továbbra is használatban marad, de a Jira bevezetése megfontolás alatt.
- Ádám feladatai (galéria + árlista frontend) a következő sprintbe kerülnek.
- Következő sprint fókusza: auth rendszer (login + password reset).
- István javította a backend route hibát, András ellenőrzi a frontend bugokat.

## :pushpin: Konklúzió

:arrow_right: CourtPrice tábla kész, dummy adatok jönnek
:arrow_right: Trello feladatok kiosztva, következő sprint előkészítve
:arrow_right: Auth rendszer fejlesztése következik
:arrow_right: Backend hibák javítva, frontend bugfix folyamatban
:arrow_right: Jira bevezetése mérlegelés alatt, frontend tesztelés egyelőre manuális


# ═══════════════════════════════════════════

# :pencil: Jegyzőkönyv — Projektmegbeszélés (2025.10.10.)

## :dart: Téma:
Teniszpálya-foglaló rendszer – Pályaárstruktúra és adatbázis-tervezés felülvizsgálata

## :bulb: Megbeszéltek

* **István** jelezte, hogy **elégedetlen a jelenlegi pályaár-kezeléssel**, és tervezi a struktúra átalakítását még aznap.
* Az átalakítás célja a **designhoz való igazodás**, a valós foglaló oldalak mintájára.
* Felmerült az igény a **bérletek/előfizetések (Subscription)** kezelésére is a későbbiekben (István ezt is figyelembe vette).
* Megvitatták az árlista vizuális megjelenítését (pl. érdemes-e a jelenlegi szezontól eltérő árakat is mutatni). **István** szerint a "FOMO" (Fear of Missing Out) marketing hatás miatt esetleg érdemes, **András elutasította a FOMO szempontot**.
* **András** javaslatot tett az **adatbázis táblák frissítésére** a felmerült igények alapján:
  * `Subscription` tábla (egyelőre későbbi megvalósítással): `id`, `name`, `price` mezőkkel.
  * Sima ártábla (`CourtPrice` helyett, vagy módosítva):
    * `id`, `season`, `price` (kötelező)
    * `outdoor` (bool)
    * `morning` (bool, a daytime string helyett)
    * `student` (bool)
  * Az összes kategóriát (`outdoor`, `morning`, `student`) **bool-ként kezeljék**.
* **István** kérte **Andrást**, hogy beszéljenek a felmerült táblamódosításokról. András ezt elfogadta.
* **András** javasolta, hogy a **`Subscription`** részt halasszák későbbre, de az **árlistát** (Price list) hozzák rendbe.

## :brain: Döntések

* Pályaár-struktúra felülvizsgálata/átalakítása elindult (**István felelőssége**).
* Az előfizetés (Subscription) rendszer bevezetését későbbre halasztják, de a CourtPrice tábla struktúrájának frissítésére sor kerül.
* Az új ártábla logikai mezőinek kialakítása elfogadott: **season, outdoor, morning, student, price**.

## :pushpin: Konklúzió

:arrow_right: A pályaárlista/árazás redesignja és a kapcsolódó backend struktúra módosítása a fókusz.  
:arrow_right: A bérlet/előfizetés (Subscription) funkciót a jelenlegi sprintből kiveszik/későbbre halasztják.  
:arrow_right: Az ártábla adatbázis sémája pontosításra került, **András** fogja a módosításokat implementálni (István kérésére/designja alapján).

# ═══════════════════════════════════════════

# :pencil: Jegyzőkönyv — Projektmegbeszélés (2025.10.13.)

## :dart: Téma:
Sprinttervezés (Autentikációs funkciók), Sprint Review és Repository Láthatóság

## :bulb: Megbeszéltek

* **István** megerősítést kért a jelenlegi sprint fókuszáról, amely a **regisztráció, bejelentkezés (login), jelszó-visszaállítás** és a **profil** funkciók implementálása.
* **András** pontosította, hogy a közös munka ezen része két hétre tervezett **2 hetes sprint** formájában zajlik.
* **András** kiemelte a fejlesztési folyamat részét képező **heti Sprint Review** fontosságát, ahol bemutatják az aktuális haladást és a terveket. Megerősítette, hogy a mai (október 13-i) bemutató megtörtént.
* **István** arra kérte **Andrást**, hogy tegye **publikussá a repository-kat** (különösen a backend kódot), hogy a projektet felvehesse a saját szakmai portfóliójába. András elfogadta a kérést.

## :brain: Döntések

* Sprint időtartama: 2 hét.
* Sprint fókusz: Teljes autentikációs rendszer implementálása (regisztráció, login, jelszó-visszaállítás, profil).
* Folyamat: Heti rendszerességű Sprint Review bemutató megtartása.
* Repository Láthatóság: A projektrepositorie-k (backend) publikussá tétele István portfóliójához elfogadva (**András feladata**).

## :pushpin: Konklúzió

:arrow_right: 2 hetes sprint kezdődött az auth rendszer fejlesztésére.  
:arrow_right: A haladás bemutatása heti Sprint Review keretében történik.  
:arrow_right: A repository publikálása István portfólió igénye miatt folyamatban.

# ═══════════════════════════════════════════

# :pencil: Jegyzőkönyv — Projektmegbeszélés (2025.10.14.)

## :dart: Téma:
Autentikációs adatok (User Data) validációs és megkötések (Restrictions)

## :bulb: Megbeszéltek

* **István** felvetette a felhasználói adatok (user data) mezőinek **validációs megkötésekkel** való ellátását (pl. maximális hossz, engedélyezett karakterek).
* **István** hangsúlyozta, hogy a megkötések bevezetése a kezdeti fázisban **könnyebb**, mint utólag beépíteni.
* **András** javaslatot tett a **jelszóra vonatkozó követelményekre**:
  * Minimum 8 karakter
  * Tartalmazzon nagybetűt
  * Tartalmazzon kisbetűt
  * Tartalmazzon számot
* **András** szerint a többi regisztrációs mezőre (vezetéknév, keresztnév, e-mail) **nem szükséges különösebb megkötés**, az alapvető validáción (pl. e-mail formátum) túl.
* Megerősítették, hogy a regisztráció során a következő adatok szükségesek: **keresztnév** (first name), **vezetéknév** (last name), **e-mail** és **jelszó**.

## :brain: Döntések

* **Jelszó validáció:** A jelszónak kötelezően tartalmaznia kell minimum 8 karaktert, nagybetűt, kisbetűt és számot.
* **Egyéb mezők:** A többi felhasználói adatra (név, e-mail) nem kerülnek bevezetésre szigorú extra megkötések (az alapvető validáción túl).

## :pushpin: Konklúzió

:arrow_right: A felhasználói adatok beviteli validációjának specifikációja megtörtént, a hangsúly a jelszó erősségének biztosításán van.

# ═══════════════════════════════════════════

# :pencil: Jegyzőkönyv — Projektmegbeszélés (2025.10.16.)

## :dart: Téma:
Felhasználói adatbázis és Session Management státusz

## :bulb: Megbeszéltek

* **István** jelezte, hogy elkészítette a **felhasználói adatbázis (User Database) alap verzióját**.
* **András** nyugtázta a haladást, és jelezte, hogy ő **holnap** (október 17-én) fog tudni a projekten dolgozni.
* **István** hozzátette, hogy elkezdte a **Session Management** implementálását is (az autentikáció kulcsfontosságú része), de valószínűleg csak holnap fog végezni vele.

## :brain: Döntések

* Felhasználói adatbázis (alap) elkészült.
* Session Management fejlesztése folyamatban (**István**).
* **András** a munkát a következő munkanapon folytatja.

## :pushpin: Konklúzió

:arrow_right: A 2 hetes sprint (Auth rendszer) keretében a User Database alapja kész.  
:arrow_right: Folyamatban a Session Management implementálása, ami a bejelentkezéshez elengedhetetlen.

# ═══════════════════════════════════════════

# :pencil: Jegyzőkönyv — Projektmegbeszélés (2025.10.17.)

## :dart: Téma:
Jelszótárolás és salt (só) kezelése

## :bulb: Megbeszéltek

* **András** rákérdezett a jelszótárolás biztonsági aspektusára, konkrétan arra, hogy külön tárolják-e a **salt-ot** (sót), vagy csak nem küldik ki a válaszban (response).
* **István** elmagyarázta, hogy a használt kriptográfiai könyvtár, a **BCrypt**, a hash-elési folyamat részeként **magában a hash-ben tárolja a salt-ot**. Ez azt jelenti, hogy nem szükséges külön adatbázis mező a só tárolásához.
* **András** megerősítést kért, hogy a regisztráció/jelszó beállítás során a **plain text (sima) jelszót** küldik el (`POST` kérésben), és a **BCrypt** végzi el a hashelést és a sózást automatikusan.
* **István** megerősítette ezt.

## :brain: Döntések

* Jelszótárolás metódusa: **BCrypt** használata.
* **Salt kezelése:** Külön salt mező nem szükséges az adatbázisban, mivel a BCrypt a salt-ot magába a hashelt jelszóba ágyazza be.
* A kliens oldalon (Frontend) a **plain text jelszót** küldik be, a **Backend végzi a hashelést**.

## :pushpin: Konklúzió

:arrow_right: A jelszótárolási mechanizmus biztonságos és a **BCrypt standardjainak megfelelő**.  
:arrow_right: A jelszótárolási kérdések tisztázva lettek a backend implementáció szempontjából.

# ═══════════════════════════════════════════

# :pencil: Jegyzőkönyv — Projektmegbeszélés (2025.10.18.)

## :dart: Téma:
Regisztrációs felület (Frontend) státusza

## :bulb: Megbeszéltek

* **András** (szombat hajnalban) jelentette, hogy elkészült a **regisztrációs űrlap (Register Form) frontend implementációjával**.
* Jelezte, hogy a következő feladat a **tényleges regisztrációs logika és backend integráció** befejezése, hogy az űrlap valós adatbázis bejegyzést hozzon létre.
* **István** nyugtázta a frontend haladását.

## :brain: Döntések

* Regisztrációs űrlap (Frontend) kész.
* Következő lépés a Backend regisztrációs endpoint összekötése az űrlappal, és a sikeres felhasználói adatbázisba történő bejegyzés implementálása.

## :pushpin: Konklúzió

:arrow_right: A 2 hetes sprint (Auth rendszer) keretében a Regisztrációs felület vizuálisan kész.  
:arrow_right: A fókusz áthelyeződik a frontend és backend közötti adatküldés és validáció befejezésére.

# ═══════════════════════════════════════════

# :pencil: Jegyzőkönyv — Projektmegbeszélés (2025.10.19.)

## :dart: Téma:
Regisztráció befejezése, Session Management és Felhasználó validáció optimalizálása

## :bulb: Megbeszéltek

* **:rocket: Fejlesztési státuszjelentés (Balogh András)**
  * **Regisztráció kész:** András bejelentette, hogy a regisztrációs funkció teljes mértékben kész (frontend + backend logika).
  * **Ideiglenes Session Management:** Készített egy mikro Session Management megoldást, ami regisztráláskor létrehoz egy **cookie-t**, és ez alapján váltja a navigációs sáv (navbar) tartalmát.
  * **Validáció problémák:**
    * András jelezte, hogy a regisztráció során a **duplikált e-mail/telefonszám ellenőrzést** úgy oldotta meg, hogy lekérte az összes usert (`GET /users` endpointon keresztül), és manuálisan kereste a duplikátumot.
    * Kiemelte, hogy ez a módszer **lassú** lehet, ha sok felhasználó van az adatbázisban.
    * Megkérte **Istvánt**, hogy készítsen egy **optimalizált backend endpointot** a gyorsabb egyediség-ellenőrzésre.

* **:gear: Backend visszajelzés (Orosz István)**
  * **István** nyugtázta a validációs problémát.
  * Megjegyezte, hogy a backend oldalon is meg kell nézni, hogy az adott felhasználó már létezik-e az adatbázisban, de **vállalta, hogy elkészít egy dedikált endpointot** (bár a lekérdezést alapvetően nem lehet megúszni, de optimalizálható).

* **:busts_in_silhouette: Ádám feladata**
  * **András** rákérdezett **Ádámnál** a **bejelentkezés (login) felület** állapotára.
  * **Ádám** jelezte, hogy **holnap (október 20-án)** megcsinálja a **login frontendet**.
  * **András** figyelmeztette Ádámot, hogy a **design alapján** készítse el, mivel a backend login endpoint még nem áll készen.

## :brain: Döntések

* Regisztrációs funkció kész.
* Ideiglenes session/auth kezelés (cookie alapú navbar váltás) implementálva.
* **István feladata:** Optimalizált backend endpoint készítése a regisztrációhoz szükséges e-mail/telefonszám egyediség-ellenőrzéshez.
* **Ádám feladata:** A bejelentkezési felület (Login Frontend) elkészítése (másnap).

## :pushpin: Konklúzió

:arrow_right: A regisztrációs rendszer elkészült.  
:arrow_right: A felhasználói adat validáció sebességét optimalizálni kell a backend oldalon, ez **István** feladata.  
:arrow_right: A Login Frontend megvalósítása a következő prioritás.

# ═══════════════════════════════════════════

# :pencil: Jegyzőkönyv — Projektmegbeszélés (2025.10.22.)

## :dart: Téma:
Munka tempójának ösztönzése és a fejlesztés folytatása

## :bulb: Megbeszéltek

* **András** (a projektvezető/koordinátor szerepében) kezdeményezte a beszélgetést, sürgetve a csapattagokat a projekten való **folyamatos haladás** érdekében.
* **István** nyugtázta a felvetést és megerősítette, hogy a munka folytatódni fog.

## :brain: Döntések

* Nincs új technikai döntés. A megbeszélés célja a munkatempó fenntartása volt.

## :pushpin: Konklúzió

:arrow_right: Folyamatos haladás elvárása megerősítve a csapat felé.  
:arrow_right: A folyamatban lévő Auth rendszer sprint folytatódik (beleértve az **Istvánra bízott optimalizált validációs endpointot** és az **Ádámra bízott Login Frontendet**).

# ═══════════════════════════════════════════

# :pencil: Jegyzőkönyv — Projektmegbeszélés (2025.10.23.)

## :dart: Téma:
Login, Register, Session Management, CORS/Cookie és Jelszó-visszaállítás (Reset Password) implementáció

## :bulb: Megbeszéltek

* **:key: Login/Register és Adatellenőrzés**
  * **István** átadta a teszt **admin belépési adatokat** (admin@admin.com / admin) Andrásnak tesztelés céljából.
  * Felmerült a `/users` POST endpoint lecserélésének kérdése. István megszüntette a generikus `/users` POST-ot, és létrehozta a dedikált **`/register`** endpointot, azzal érvelve, hogy az admin nem hoz létre felhasználót. András egyetértett.
  * **István** jelezte, hogy feltöltötte a `/register` endpointot, valamint az **`/me`** endpointot és az **optimalizált validációs logikát** is.

* **:cookie: Session Management és Cookie Problémák**
  * **István** kérdezte **Andrást** a korábbi "temporary session management" állapotáról. András megerősítette, hogy azzal már nem kell foglalkozni, mivel az csak egy ideiglenes megoldás volt a **navbar állapotának tesztelésére**.
  * **András** hibát jelzett: a **CORS policy** miatt a frontend **nem tudja fogadni a cookie-t**.
  * **István** gyorsan válaszolt a CORS hibára egy lehetséges konfigurációs megoldással, amit András beépített.
  * **András** észrevette, hogy a cookie **`HttpOnly`** beállítása miatt a frontend kód **nem tudja elérni** a cookie tartalmát (pl. a navbar állapotának frissítéséhez).
  * **András** emiatt kiemelte az **`/me`** endpoint fontosságát, ami lehetővé teszi a kliens számára a bejelentkezési státusz lekérdezését a cookie használata nélkül.

* **:e_mail: Jelszó-visszaállítás (Reset Password) Tervezése**
  * **István** felvetette a jelszó-visszaállítás implementálásának technikai részleteit:
    * Lokális **SMTP szerver** tesztelésre.
    * Vagy csak **konzolban logolás**.
  * **András** kérte, hogy a rendszer **küldjön valódi e-mailt** (pl. noreply Gmail címről) a felhasználó címére.
  * **István** kétséget fejezett ki a "rendes service nélkül" történő e-mail küldés miatt, de később megerősítette, hogy **megoldható**.

* **:tools: Következő lépések/Státuszjelentés**
  * **András** bejelentette, hogy a **Register és Login logika** a frontend oldalról elvileg kész.
    * Kérte **Ádámot**, hogy a **design alapján** implementálja a login felületet.
  * **András** elkezdte a **Profil oldal (Profile Page)** fejlesztését.
  * **András** egy kisebb hibát jelzett: véletlenül kitörölte a teszt usereket (`admin`, `amongus`) mergelés közben, de vissza kellett állítani őket.
  * **András** kérte **Istvánt**, hogy készítsen egy **`/logout`** endpointot, ami a **`HttpOnly` cookie-t** törölné (vagy expire-age 0-ra állítaná). István ezt későbbi feladatként elfogadta.

## :brain: Döntések

* **Backend Autentikációs Endpointok:** Létrejött a dedikált `/register` endpoint. Elkészült a `/me` endpoint a bejelentkezési státusz lekérdezésére.
* **Cookie Kezelés:** A CORS beállítások korrigálva a cookie fogadásához, megerősítve a `HttpOnly` használatát.
* **Reset Password:** Cél a valós e-mail küldés implementálása.
* **Logout:** István implementálja a `/logout` endpointot a `HttpOnly` cookie törlésére (későbbi feladat).
* **Folyamatban lévő feladatok:** Profil oldal fejlesztése (András) és Login design implementálása (Ádám).

## :pushpin: Konklúzió

:arrow_right: Az Auth rendszer központi logikája nagyrészt kész (Register, Login, /me).  
:arrow_right: A fejlesztés fókuszában a Jelszó-visszaállítás (email küldés) és a Profil oldal van.

# ═══════════════════════════════════════════

# :pencil: Jegyzőkönyv — Projektmegbeszélés (2025.10.24.) 

## :dart: Téma:
Auth Rendszer Befejezése (Profile Page és Hiányzó Backend Endpointok)

## :bulb: Megbeszéltek

* **:rocket: Frontend státuszjelentés (Balogh András)**
  * Profil oldal kész: András bejelentette, hogy a Profil oldal (Profile Page) frontend implementációja elkészült.
  * András az elkészült felülethez a következő Backend Endpointokat kérte Istvántól, amelyek elengedhetetlenek a sprint lezárásához:
    * Bejelentkezett felhasználó módosítása (User Modify)
    * Új jelszó kérése/visszaállítása (Reset Password)
    * Kijelentkezés (Logout)
  * András jelezte, hogy az új jelszó kéréséhez szükséges e-mail kiküldés jelenleg nem sürgős, a funkcionalitás tesztelése prioritást élvez.
  * András a hiányzó backend munkára várva a frontend animációk finomhangolását kezdte meg.

* **:gear: Backend státusz (Orosz István)**
  * Jelszó-visszaállítás: István megerősítette, hogy a jelszó-visszaállítási logika alapja (a link generálás és a token létrehozása) már kész van. Jelenleg csak a valódi e-mail kiküldése hiányzik, ami András szerint sem sürgős.

## :brain: Döntések

* Profil oldal (Frontend) kész.
* **István feladatai:** Prioritás a felhasználó módosító, a jelszó-visszaállító inicializáló és a logout endpointok implementálása.
* **András feladata:** Frontend animációk és esztétikai elemek finomhangolása.

## :pushpin: Konklúzió

:arrow_right: A 2 hetes Auth Sprint frontend felületei (Register, Login, Profile Page) elkészültek.  
:arrow_right: A sprint lezárásához szükséges kritikus backend endpointok (User Modify, Reset Password, Logout) István implementációjára várnak.  
:arrow_right: A projekt fókusza a funkcionalitás befejezésére és a felhasználói élmény (animációk) javítására helyeződik át.

# ═══════════════════════════════════════════

# :pencil: Jegyzőkönyv — Projektmegbeszélés (2025.10.26.) 

## :dart: Téma:
Auth Rendszer Befejezése (Backend Endpointok) és Adatbázis kezelési protokoll

## :bulb: Megbeszéltek

* **:gear: Backend Endpointok Befejezése (Orosz István)**
  * István jelezte, hogy az aktuális napon (vasárnap) befejezi a sprinthez szükséges kritikus backend endpointokat:
    * `/logout`
    * `/reset-password` (jelszó visszaállítás inicializálása)
    * `/new-password` (új jelszó beállítása a token alapján)
    * Felhasználó adatok módosítása (modify endpoint)
  * Később, 20:39-kor megerősítette, hogy ezek az endpointok elkészültek és fel vannak pusholva.

* **:floppy_disk: Adatbázis Kezelési Protokoll (Fontos Döntés)**
  * Merge Conflict: István felvetette, hogy a `db` fájl (valószínűleg SQLite adatbázis) folyamatosan merge conflictokat okoz a közös munkában.
  * András megerősítette, hogy nála is volt ilyen probléma.
  * Döntés: A `db` fájlt be kell tenni a `.gitignore` fájlba, hogy ne kerüljön be a verziókövetésbe és ne okozzon konfliktusokat.

* **:arrows_counterclockwise: Adatbázis Inicializálás**
  * Adatbázis hiánya: Miután István kitörölte a db fájlt a Git-ről, András észrevette, hogy a helyi projektjében hiányzik az adatbázis.
  * Inicializálási utasítás: István elmagyarázta a DB inicializálás módját (`dotnet ef database update` paranccsal) és jelezte, hogy ezt be fogja tenni a bash scriptbe is.
  * Dummy adatok: András kérte, hogy a projekt indításakor kerüljön be valamilyen kezdeti/dummy adat (pl. userek) az adatbázisba, hogy a tesztelés működjön. István vállalta, hogy beépít olyan fix adatokat, amelyek mindig létrejönnek az inicializáláskor.
  * András végül belehelyezett egy admin usert és esetleg néhány court adatot is, majd felpusholta, és ezután tette a db fájlt `.gitignore` alá.

## :brain: Döntések

* **Auth Befejezés:** A sprint összes kritikus Backend Autentikációs endpointja elkészült (`Logout`, `Reset Password`, `New Password`, `User Edit`).
* **Verziókövetés protokoll:** Az adatbázis fájl kizárásra kerül a verziókövetésből a `.gitignore` használatával, a merge conflictok elkerülése érdekében.
* **Adatbázis Inicializálás:** Az adatbázis létrehozása a `dotnet ef database update` paranccsal történik, és fix kezdeti/seed adatok kerülnek bele az induláshoz.

## :pushpin: Konklúzió

:arrow_right: A 2 hetes Auth Sprint funkcionalitása a backend oldalon készre jelenthető.  
:arrow_right: A fejlesztési környezet kezeléséhez új protokoll került bevezetésre az adatbázis fájl Git-ből való kizárásával.

# ═══════════════════════════════════════════

# :pencil: Projektmegbeszélés Összegzés (2025.10.09 – 2025.10.26.)

## :dart: Fő Téma:
**Autentikációs Rendszer Sprint Befejezése** (Login, Register, Reset Password, Profil) és Árstruktúra felülvizsgálat.

## :rocket: Fejlesztési Eredmények & Státusz

### I. :closed_lock_with_key: Autentikációs Rendszer (KÉSZ/Befejezve)
* **Regisztráció & Login:** Kész (Frontend + Backend logika + validációk).
* **Jelszókezelés:** BCrypt titkosítás beépítve, szigorú követelményekkel (min. 8 karakter, nagybetű, kisbetű, szám).
* **Session Management:** Kész (HTTPOnly Cookie + `/me` endpoint a státusz lekérdezéséhez).
* **Profil oldal:** Kész a bejelentkezett felhasználó adatok lekérdezése és módosítása.
* **Kritikus Endpointok:** Sprinthez szükséges Backend endpointok elkészültek: `/register`, `/login`, `/me`, `/modify-user`, `/reset-password` inicializálás és `/logout`.
* **Végrehajtó felelősök:** **András** (Frontend) és **István** (Backend).

### II. :moneybag: Pályaárstruktúra (Átalakítva)
* A régi **CourtPrice** struktúra felülvizsgálata megtörtént, István implementálta az új sémát (bool kategóriák: `outdoor`, `morning`, `student`).
* A **Bérlet (Subscription)** rendszer bevezetését **elhalasztottuk**.

### III. :tools: Folyamatban / Következő Lépések
* **Jelszó-visszaállítás (Email):** Funkció logikája kész, de a valós e-mail kiküldési szolgáltatás integrációja még hiányzik. (Felelős: István)
* **Login/Galéria Frontend:** Ádám feladata a bejelentkezési felület design szerinti implementálása (és a korábban elhalasztott galéria/árlista).
* **Frontend UX:** András finomítja az animációkat és a felhasználói élményt.
## :gear: Projektvezetés & Döntések

* **Sprint Rendszer:** 2 hetes sprintek heti Sprint Review-val.
* **Adatbázis Kezelés:** A `db` fájl bekerült a **`.gitignore`**-ba a merge conflictok elkerülésére. Inicializálás `dotnet ef database update` paranccsal történik, fix **seed adatokkal** indul.
* **Kód láthatóság:** Backend repository publikussá tétele István portfóliója számára.

## :pushpin: Összefoglaló

:arrow_right: Az Autentikációs Sprint funkcionálisan kész.  
:arrow_right: Hangsúly a frontend finomhangolásra és felhasználói élmény javítására (Ádám és András), valamint az utolsó backend függőségek (e-mail service) befejezésére (István).

# ═══════════════════════════════════════════

# :pencil: Projektmegbeszélés Összegzés (2025.10.31.)

## :dart: Fő Téma:
**A Következő Sprint Fókuszának Áthelyezése** – Technikai adósságok, kód refaktorálás és dokumentáció pótlása.

## :bulb: Megbeszéltek

* A sprintben **nem új funkciók fejlesztése** a prioritás, hanem meglévő Auth rendszer stabilizálása és a projekt tisztítása.
* **Backend (István):** Autentikációs logika centralizálása, Login, Logout, Register endpointok áthelyezése dedikált **`Auth` controllerbe**.
* **Frontend (András):** Kód refaktorálása, UX és animációk finomhangolása.
* **Dokumentáció:** Hiányzó Gherkin User Story-k és tesztforgatókönyvek pótlása.
* **Erőforrások:** Csapattagok ideiglenesen csökkent kapacitása (szakdolgozat, ZH) miatt a haladás lassabb lehet.

## :brain: Döntések

* A következő sprint fő fókusza **technikai adósságok és kód minőség**.
* Backend autentikációs logika átstrukturálása és centralizálása (István felelős).
* Frontend kód refaktorálása és UX finomhangolása (András felelős).
* Hiányzó dokumentáció pótlása (Gherkin User Story-k és tesztforgatókönyvek).
* A projekt adatbázis kezelése protokoll szerint történik (`db` fájl `.gitignore` alatt, inicializálás `dotnet ef database update`).

## :pushpin: Konklúzió

* A sprint során **nem új funkciók, hanem meglévő rendszer stabilizálása** a cél.  
* A backend autentikációs logika és frontend UX refaktorálása javítja a projekt karbantarthatóságát és átláthatóságát.  
* A dokumentáció és tesztforgatókönyvek pótlása biztosítja a sprint teljes lefedettségét, miközben a csapattagok ideiglenes erőforrás-korlátait figyelembe vesszük.

# ═══════════════════════════════════════════

# :pencil: Projektmegbeszélés Összegzés (2025.11.01.)

## :dart: Fő Téma:
**Jelszómódosító Endpoint** (Change Password) implementációja.

## :bulb: Megbeszéltek és Haladás

* **Balogh András** kérte, hogy kerüljön implementálásra egy dedikált **Change Password** endpoint a backendbe.
* A kéréshez szükséges adatok: **bejelentkezett felhasználó tokenje**, **régi jelszó** ellenőrzéshez, **új jelszó**.
* **Orosz István** az endpointot elkészítette, a feladat 2025.11.01-én 19:13-kor **"done"** státuszba került.
* Ezzel a sprinthez szükséges összes kritikus **backend autentikációs endpoint** elkészült.

## :brain: Döntések

* **Change Password Endpoint:** Implementálva és kész, része az Auth rendszer kritikus backend logikájának.
* **Auth Sprint Backend:** Minden kritikus autentikációs endpoint kész: **Register, Login, /me, Modify User, Reset Password, Logout, Change Password**.
* **Verziókövetés protokoll:** A `db` fájl továbbra is a **`.gitignore`** alatt, az adatbázis merge conflictok elkerülése érdekében.
* **Adatbázis Inicializálás:** `dotnet ef database update` paranccsal történik, fix seed adatokkal.

## :pushpin: Konklúzió

* A **backend oldali Auth funkcionalitás teljes**, minden kritikus endpoint elkészült és tesztelhető.
* A projekt környezete stabil, az adatbázis kezelése protokoll szerint zajlik.
* A frontend feladatok (profil oldal, UX finomítás, login design) továbbra is a következő lépésként szerepelnek.

# ═══════════════════════════════════════════

# :pencil: Projektmegbeszélés Összegzés (2025.11.02.)

## :dart: Fő Téma:
**React Frontend Tesztelésének Bevezetése és Felelősségi Körök Tisztázása**

## :bulb: Megbeszéltek és Haladás

* **Balogh András** jelezte, hogy a projekt követelményei szerint a **React frontend tesztelése kötelező/ajánlott**.
* A tesztelés módszertanát **Orosz István** tervezi meg (Test Designer), ő felel a **tesztstratégia, forgatókönyvek és dokumentáció kidolgozásáért**.
* A **tesztek implementálása** a frontend kódra **András feladata**, mivel ő írta a React kódot.
* A tesztelés tervezése és a stratégia kidolgozása **közös megbeszélésen** történik.
* Oktatói iránymutatások (Kusper) alapján István kapta a fő instrukciókat, András ezek alapján végzi a tesztek megvalósítását.

## :brain: Döntések

* **Frontend Tesztelés:** Kötelező/ajánlott, a felelősségi körök tisztázva: István – stratégia és tervek, András – implementáció.
* **Auth Backend:** Minden kritikus endpoint elkészült: **Logout, Reset Password, New Password, User Edit**.
* **Verziókövetés protokoll:** A `db` fájl a **`.gitignore`** alatt marad, merge conflictok elkerülése érdekében.
* **Adatbázis Inicializálás:** `dotnet ef database update` paranccsal történik, fix seed adatokkal.

## :pushpin: Konklúzió

* A **backend Auth funkcionalitás teljes**, tesztelhető és stabil.
* **Új fókusz:** a React frontend tesztelésének megtervezése és implementálása, a felelősségek felosztása szerint.
* A projekt továbbra is követi a stabil fejlesztési környezet protokollját az adatbázis kezeléssel és verziókövetéssel kapcsolatban.

# ═══════════════════════════════════════════

# :pencil: Projektmegbeszélés Összegzés (2025.11.03.)

## :dart: Fő Téma:
**Végső Határidő és Pályafoglalási Logika Implementációja**

## :bulb: Megbeszéltek és Haladás

* **Balogh András** bejelentette a projekt végső határidejét: **November 24.**, a "nagybemutatóra" minden funkciónak működnie kell.
* Oktató a bemutató előtti két hétben nem lesz elérhető, ezért a csapatnak **fokozott tempóban kell dolgoznia**.
* **Frontend fejlesztés:** András elkészítette a foglalás indítási folyamatát (Reserve -> By Courts / By Time), a Login csak a választás után történik.
* **Backend specifikáció (Orosz Istvánnak):**
  1. **`GET /available-courts`** – lekérdezi az adott időpontra elérhető pályákat (`start time`, `length` -> `court_ids`).
  2. **`GET /available-times`** – lekérdezi az adott pályára elérhető kezdési időpontokat (`court_id`, `length` -> `start times`).
  3. **`POST /reserve`** – véglegesíti a foglalást (Court ID, Start Time, Length). Ez az endpoint a Payment szekció implementációja után válik aktívvá.

## :brain: Döntések

* **Auth Backend:** Minden kritikus autentikációs endpoint kész: **Logout, Reset Password, New Password, User Edit**.
* **Verziókövetés protokoll:** Az adatbázis fájl a **`.gitignore`** alatt marad, merge conflictok elkerülése érdekében.
* **Adatbázis inicializálás:** `dotnet ef database update` paranccsal történik, fix seed adatokkal.
* **Fókuszváltás:** Az azonnali fejlesztési prioritás a **Pályafoglalási logika** implementációja a frontend és backend összekötésével, a November 24-i határidő biztosítása érdekében.

## :pushpin: Konklúzió

* Az **Auth sprint backend funkcionalitása teljesen kész** és tesztelhető.
* A projekt **határidőre való elkészülése érdekében** az új prioritás a pályafoglalási logika implementációja.
* A csapat **fokozott tempóban dolgozik**, a frontend és backend feladatok összehangolt végrehajtása kiemelt.

