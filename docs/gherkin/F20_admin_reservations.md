<span style="color:red">Feature</span>: F20 – Foglalások listázása és szűrése  
&nbsp;&nbsp;<span style="color:red">As an</span> admin  
&nbsp;&nbsp;<span style="color:red">I want to</span> áttekinteni és szűrni az összes foglalást  
&nbsp;&nbsp;<span style="color:red">So that</span> gyorsan megtaláljam a releváns bejegyzéseket  

&nbsp;&nbsp;<span style="color:red">Background</span>:  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> the ReservationsTab egyszerre tölti be a <span style="color:green">"/api/Reservations"</span> és <span style="color:green">"/api/Users"</span> adatokat és táblázatban jeleníti meg  

&nbsp;&nbsp;<span style="color:red">Scenario</span>: Név szerinti keresés és rendezés működik  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> a táblázat több felhasználót tartalmaz  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">When</span> I beírom a keresőmezőbe egy játékos nevét  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Then</span> csak az adott névre illeszkedő sorok maradnak láthatóak  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">And</span> a SortHeader gombokra kattintva változtathatom a rendezési kulcsot  

&nbsp;&nbsp;<span style="color:red">Scenario</span>: Dátum és státusz szűrők kombinációja  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> I bekapcsolom a Date filter Range módot és megadok kezdő és záró dátumot  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">And</span> a Status szűrőt <span style="color:green">"Upcoming"</span> értékre állítom  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">When</span> a filtered lista frissül  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Then</span> csak a megadott időablakba eső és Upcoming státuszú foglalások szerepelnek  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">And</span> a lapozás a szűrt elemszámhoz igazodik  
