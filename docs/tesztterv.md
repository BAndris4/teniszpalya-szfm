# Teniszpálya foglaló alkalmazás tesztterv - Frontend

---

## 1. Bevezetés

Ez a dokumentum a Teniszpálya foglaló webalkalmazás frontend részének **részletes tesztterve**, amely lefedi:

- az összes React-komponenst  
- a custom hookokat és context-eket  
- a teljes foglalási folyamatot  
- az admin funkciókat  
- a profilkezelést  
- a kuponrendszert  
- a minijátékot  
- valamint az auth folyamatot  

A tesztek Vitest + React Testing Library környezetre épülnek.

---

## 2. Tesztelés Terjedelme

### Tartalmazza:
- Frontend UI komponensek (összes)
- Oldal nézetek / view-k
- Context-ek és custom hookok
- Navigáció és redirect
- Fetch-alapú adatfolyamatok mockolása
- User flow-k (login → foglalás → checkout → kupon → profil)

### Nem tartalmazza:
- Backend API valós működése
- E2E böngészőtesztek
- E-mail küldés
- Canvas valódi renderelése (mockolva)

---

## 3. Tesztstratégia

- **Unit tesztek** – egyszerű komponensek viselkedése
- **Integrációs tesztek** – több komponens, hook, context együtt
- **Mockolt környezet** – router, fetch, canvas, auth
- **Aszinkron műveletek felügyelete** – `waitFor`, időzítők, eventek

---

## 4. Tesztkörnyezet

- Vitest  
- React Testing Library  
- JSDOM  
- Mockolt `fetch`  
- Mockolt Canvas API  
- Mockolt router navigáció  

---

# 5. TESZTESETEK RÉSZLETESEN

Az alábbi fejezetek a beadott listád alapján a projekt **teljes** tesztlefedettségének kidolgozott teszttervét tartalmazzák.

---

# 5.1 COMPONENTS

---

## AccountDropdown

### Tesztesetek:
1. **Megjeleníti a menüpontokat**
2. **Kattintásra megfelelő route-ra navigál**
3. **Admin menü csak admin felhasználóknak jelenik meg**
4. **Admin menü rejtve marad normál user esetén**
5. **Logout meghívja a fetch-et és `navigate(0)`**

### Tesztcél:
- Felhasználói menü logikájának ellenőrzése  
- Jogosultsági szintek kezelésének validálása  

---

## AdminTopbar

### Tesztesetek:
1. Rendereli a fejléc elemeket
2. `onTabChange` megfelelő paraméterrel hívódik
3. Aktív tab vizuális kiemelése
4. “Back to site” → navigate(`/`)

---

## ConfirmResponsePopup

### Tesztesetek:
1. Siker popup címe + leírása megjelenik
2. Auto-close időzítő működik → `onCancel()`
3. Ha `showCalendarButton=true`, auto-close NEM fut
4. Google Calendar gomb megjelenik, ha success + calendar
5. Google Calendar link helyes URL-re mutat
6. Confirm mód → Confirm/Cancel gombok működnek
7. Háttérre kattintás → onCancel()

---

## Coupons

### Tesztesetek:
1. Kezdő állapot → Loading
2. Fetch error → hibaüzenet
3. Üres lista → empty state + CTA gomb
4. CTA navigál `"/minigame"`
5. Kuponok renderelése
6. “Active” és “Used” badge-ek helyesek
7. Play minigame navigál üres + nem üres állapotban is

---

## CourtCard

### Tesztesetek:
1. Court info helyes megjelenítése
2. Alternatív ID mezők támogatása (ID / Id)
3. Click → `onClick(court)`
4. Enter → `onClick`
5. Space → `onClick`
6. Selected styling aktív
7. Alap styling inaktív

---

## CourtCardMid

### Tesztesetek:
1. Court id, material, type megjelenése
2. Click → `onClick`
3. Active = true → aktív színek
4. Active = false → normál színek
5. Disabled → opacity + pointer-events-none

---

## CourtCardSmall
Hasonló a CourtCardMid-hez:
1. Megjelenítés
2. Click működik
3. Active styling
4. Inactive styling

---

## CourtsTab

### Tesztesetek:
1. Auth hiányában → `/login` redirect
2. Nem admin user → `/` redirect
3. Courts lista betöltése és megjelenítése
4. Hibaüzenet fetch error esetén
5. Üres állapot kezelése
6. Add New Court megnyitja a panelt
7. Toggle + Material gombok működnek
8. Create flow → POST + frissül a lista
9. Update flow működik
10. Delete flow → megerősítés + DELETE + popup
11. Create cancel → panel bezár
12. Edit cancel → panel bezár

---

## DatePicker

### Tesztesetek:
1. Helyesen formázott magyar dátum
2. Next → +1 nap
3. Prev → -1 nap, de nem mehet ma alá

---

## History

### Tesztesetek:
1. Üres lista
2. Rendezés: reservedAt DESC
3. Status badge (upcoming, ongoing, completed)
4. Dátum + idő helyes megjelenítése

---

## InputField

### Tesztesetek:
1. Label, placeholder, value renderelése
2. onChange működése
3. Error state styling
4. Type override

---

## Navbar

### Tesztesetek:
1. Authed → összes menüpont megjelenik
2. Tournaments → navigate(`/tournaments`)
3. Contact → navigate(`/contact`)
4. Reserve → `setIsReserveMenuVisible(true)`
5. Unauthed → Login gomb

---

## ProfileSettings

### Tesztesetek:
1. Minden input mező jelen van
2. Mentés → `onUpdateSuccess`
3. Jelszóváltás sikeres → callback
4. Invalid new password → error
5. Invalid firstname → reseteli a mezőt

---

## ReservationsTab

### Tesztesetek:
1. Fetch reservations + users → táblázat
2. Delete → confirm popup
3. Confirm delete → DELETE + success popup
4. Cancel delete → modal záródik

---

## ReserveMenu

### Tesztesetek:
1. Menü megjelenik
2. Close → eltűnik
3. Courts → jó route ha authed
4. Courts → login redirect ha nem authed
5. Time → jó route
6. Time → login redirect

---

## TimeBlock

### Tesztesetek:
1. Megjeleníti a time text-et
2. Click hívja az onClick-et
3. Active styling
4. Disabled styling

---

# 5.2 CONTEXT & HOOK TESZTEK

---

## ReserveMenuContext

### Tesztesetek:
1. Default érték (false)
2. setIsReserveMenuVisible működik
3. Provider nélkül → undefined értékek

---

## useAdminTabSync

### Tesztesetek:
1. URL alapján tab = courts
2. URL nélkül → localStorage értéke
3. Mindkettő hiányában → default tab
4. Invalid URL tab → ignorálja
5. Hozzáadja a `?tab=` paramétert
6. setActiveTab → frissíti LS-t + URL-t
7. Invalid érték → sanitize

---

## useCurrentUser

### Tesztesetek:
1. fetch success → user + authenticated=true
2. fetch not ok → authenticated=false
3. fetch error → authenticated=false
4. fetch egyszer hívódik
5. fetch helyes opciókkal történik

---

## usePrice

### Tesztesetek:
1. Summer outside
2. Summer inside
3. Winter outside → null
4. Winter inside
5. Default params → summer/outside/non-student/morning false
6. Invalid season → null
7. getPrice reference stabil marad

---

# 5.3 SECTIONS TESZTEK

---

## Courts section

### Tesztesetek:
1. Courts renderelése API-ból
2. Navigáció több mint 4 court esetén
3. Slider next működik
4. Court card → navigate(court)
5. Prev disabled index=0-nál

---

## Hero

### Tesztesetek:
1. Gépelős animáció működik
2. isLoaded = true 100ms után
3. Reserve gomb → reserve menu open
4. View Courts → scrollIntoView megfelelő ID-re

---

## PriceList

### Tesztesetek:
1. Headers + sections render
2. Summer árak (mocked getPrice)
3. Winter outside → “–”
4. Winter inside → helyes ár

---

# 5.4 VIEWS TESZTEK

---

## AdminPanel

### Tesztesetek:
1. Default: ReservationsTab render
2. CourtsTab render, ha activeTab=courts
3. Topbar gombok → setActiveTab működik
4. activeTab helyesen átadódik a topbarnak

---

## Contact

### Tesztesetek:
1. Üres mezők → validation error
2. Invalid email → nem submitol
3. Success → thank-you message
4. Teniszlabda → navigate(`/`)

---

## CourtsPage

### Tesztesetek:
1. Courts render API-ból
2. Filter material
3. Filter indoor/outdoor
4. Sort A→Z
5. Back → navigate(`/`)

---

## Home

### Tesztesetek:
1. Main sections render
2. Scroll → `#Navbar`-ra ugrik
3. Background animációk nem crash-elnek

---

## Login

### Tesztesetek:
1. Login mezők render
2. Authed → redirect(`/`)
3. Inputokba gépelés működik
4. Success login → navigate(`/`)
5. Invalid login → alert
6. Sign up link → navigate(`/register`)

---

## ProfilePage

### Tesztesetek:
1. Not authed → redirect(`/login`)
2. Authenticated → first name megjelenik
3. Default: settings tab
4. History tab click → vált
5. History tab query param → betölt

---

## Register

### Tesztesetek:
1. Authenticated → redirect(`/`)
2. Password visibility toggle
3. Invalid input error
4. Valid submit → register → login → navigate home

---

## ReservationCheckout

### Tesztesetek:
1. Not authed → redirect(`/login`)
2. Missing reservation data → error + disable confirm
3. Summary render + base price kalkuláció
4. Valid coupon → -20%
5. Invalid coupon → nincs változás
6. Student toggle → info msg
7. Submit → success popup + navigate(`/`)

---

## ReserveByCourts

### Tesztesetek:
1. Not authed → redirect(`/login`)
2. Courts API load
3. Court selection működik
4. Outdoor winter → minden idő disabled
5. Indoor → választható
6. Navigate checkout helyes meta adatokkal

---

## ReserveByTime

### Tesztesetek:
1. Not authed → redirect
2. Time select után courts load
3. Outdoor winter → disabled
4. Enabled court kiválasztható
5. Checkout navigate

---

## TennisMiniGame

### Tesztesetek:
1. Not authed → redirect(`/login`)
2. Default screen → menu
3. Start → játék indul
4. ESC → pause → resume
5. Game over → overlay “You won”
6. Back to coupons → navigate(`/profile?tab=coupons`)
