<span style="color:red">Feature</span>: F13 – Foglalás mentése és visszajelzés  
&nbsp;&nbsp;<span style="color:red">As a</span> játékos  
&nbsp;&nbsp;<span style="color:red">I want to</span> véglegesíteni a kiválasztott idősávot  
&nbsp;&nbsp;<span style="color:red">So that</span> biztosítva legyen a pálya  

&nbsp;&nbsp;<span style="color:red">Background</span>:  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> the ConfirmReservation gomb POST kérést küld a <span style="color:green">"/api/Reservations"</span> végpontra  

&nbsp;&nbsp;<span style="color:red">Scenario</span>: Sikeres mentés visszaigazoló modált és átirányítást eredményez  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> a payload tartalmazza a createdAt, reservedAt, hours, courtID és opcionális couponCode mezőket  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">When</span> the backend 200-as választ ad vissza  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Then</span> a ConfirmResponsePopup pozitív állapotban jelenik meg  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">And</span> 2.5 másodperc múlva a rendszer a főoldalra navigál  

&nbsp;&nbsp;<span style="color:red">Scenario</span>: Hibás válasz esetén hibaüzenet marad az oldalon  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> a backend válasza nem OK státuszú  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">When</span> a fetch promise catch ágba fut  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Then</span> a felhasználó piros hibaüzenetet kap hogy próbálja újra  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">And</span> az isSubmitting flag false-ra áll vissza hogy ismét próbálkozhassak  
