# Követelményspecifikáció – Teniszpálya foglalási rendszer

| Azonosító  | Követelmény neve | Rövid leírás | Érintett szereplők | Prioritás (MoSCoW) | Kapcsolódó funkciók |
| --- | --- | --- | --- | --- | --- | 
| K01 | Nyilvános információk egységes bemutatása | A landing oldal szekciói (hero, pályalista kivonat, árak, kapcsolat) és az animált hátterek eszközfüggetlenül elérhetők. | Látogató, Játékos | Must | F01, F02, F03 |
| K02 | Hitelesítés és profil karbantartás | A felhasználók regisztrálhatnak, bejelentkezhetnek, jelszót módosíthatnak és személyes adataikat frissíthetik. | Látogató, Játékos, Admin | Must | F04, F05, F06, F07 | 
| K03 | Szabad pályák és idősávok feltárása | A felhasználó dátum, pálya vagy idősáv szerint böngészhet, a rendszer pedig szezonfüggő tiltásokat alkalmaz. | Játékos | Must | F08, F09, F10 |
| K04 | Checkout, díjkalkuláció és foglalás mentés | A pénztári folyamat összegezi a díjat, alkalmazza a kedvezményeket, majd létrehozza a foglalást és visszajelzést ad. | Játékos | Must | F11, F12, F13 |
| K05 | Kuponok kiosztása, listázása és felhasználása | A játékosok kuponokat szerezhetnek minijátékkal vagy adminisztratív úton, majd foglaláskor beválthatják. | Játékos, Admin | Should | F14, F15, F16 |
| K06 | Tornák menedzsmentje és jelentkezés | A rendszer nyilvántartja a versenyeket, megjeleníti a részleteket, kezeli a jelentkezést és adminisztrációt. | Látogató, Játékos, Admin | Should | F17, F18, F19 |
| K07  | Foglalások felügyelete és adatok szinkronja | Az admin felület teljes foglaláslistát, szűrőket, törlést és felhasználói metaadatokat biztosít. | Admin | Must | F20, F21, F22 | 
| K08 | Teljesítmény, biztonság és rendelkezésre állás | A rendszernek biztosítania kell a gyors válaszidőt, a jogosultságok betartását, valamint a stabil működést. | Minden szereplő | Must | F23, F24 |