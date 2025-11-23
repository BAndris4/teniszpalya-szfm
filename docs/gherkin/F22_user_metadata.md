<span style="color:red">Feature</span>: F22 – Felhasználói metaadatok szinkronizálása  
&nbsp;&nbsp;<span style="color:red">As an</span> admin  
&nbsp;&nbsp;<span style="color:red">I want to</span> látni a foglalásokhoz tartozó felhasználói adatokat  
&nbsp;&nbsp;<span style="color:red">So that</span> gyorsan kapcsolatba léphessek velük  

&nbsp;&nbsp;<span style="color:red">Background</span>:  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> a ReservationsTab a felhasználókat külön lekéri és Map segítségével összekapcsolja a foglalásokkal  

&nbsp;&nbsp;<span style="color:red">Scenario</span>: Létező felhasználó esetén név és email jelenik meg  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> a Users végpont visszaadja azonosítóval ellátott rekordokat  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">When</span> a rows normálása megtörténik  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Then</span> a táblázatban a user teljes neve és emailje látható a foglalás sorában  

&nbsp;&nbsp;<span style="color:red">Scenario</span>: Hiányzó felhasználó esetén generikus jelölés  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> a foglalás userID-ja nem található a users listában  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">When</span> a sor renderelődik  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Then</span> a név oszlop <span style="color:green">"User {id}"</span> formát mutat és az email oszlop <span style="color:green">"—"</span> karaktert jelenít meg  
