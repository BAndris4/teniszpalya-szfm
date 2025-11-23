<span style="color:red">Feature</span>: F06 – Aktuális felhasználó lekérdezése  
&nbsp;&nbsp;<span style="color:red">As a</span> játékos  
&nbsp;&nbsp;<span style="color:red">I want</span> my session állapotát betölteni oldalfrissítés után  
&nbsp;&nbsp;<span style="color:red">So that</span> ne kelljen újra bejelentkeznem  

&nbsp;&nbsp;<span style="color:red">Background</span>:  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> the useCurrentUser hook komponens mountoláskor meghívja a <span style="color:green">"/api/auth/me"</span> végpontot credentials: include beállítással  

&nbsp;&nbsp;<span style="color:red">Scenario</span>: Érvényes sütivel a profil adatok visszatérnek  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> my böngészőben érvényes AuthToken süti van  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">When</span> the hook sikeres 200-as választ kap JSON profillal  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Then</span> the user state id, firstName, lastName, email, phoneNumber és roleID mezőkkel frissül  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">And</span> the authenticated állapot true értéket vesz fel  

&nbsp;&nbsp;<span style="color:red">Scenario</span>: Hiányzó vagy lejárt süti esetén kijelentkeztetett állapot  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> nincs AuthToken sütim  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">When</span> the <span style="color:green">"/api/auth/me"</span> hívás 401 státuszt ad vissza  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Then</span> the hook authenticated értéke false-ra áll  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">And</span> a függő komponensek (például foglalási nézet) automatikusan login oldalra irányítanak  
