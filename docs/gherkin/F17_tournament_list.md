<span style="color:red">Feature</span>: F17 – Tornák listázása  
&nbsp;&nbsp;<span style="color:red">As a</span> látogató  
&nbsp;&nbsp;<span style="color:red">I want to</span> áttekinteni az elérhető tornákat  
&nbsp;&nbsp;<span style="color:red">So that</span> eldöntsem melyikre jelentkezzek  

&nbsp;&nbsp;<span style="color:red">Background</span>:  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> the Tournaments nézet GET kérést küld a <span style="color:green">"/api/tournaments"</span> végpontnak  

&nbsp;&nbsp;<span style="color:red">Scenario</span>: Elérhető tornák megjelenítése kártyákon  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> the backend legalább egy tornát ad vissza currentParticipants és maxParticipants mezőkkel  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">When</span> a fetch sikeresen lefut  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Then</span> a lista kártyái kiírják a létszámot és határidőt  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">And</span> a Join részletek gomb a részletező oldalra navigál  

&nbsp;&nbsp;<span style="color:red">Scenario</span>: Üres válasz esetén hangulatos üzenet látszik  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> a lista üres tömböt ad vissza  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">When</span> a komponens renderel  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Then</span> egy illusztráció és tájékoztató szöveg jelenik meg <span style="color:green">"No tournaments yet"</span> jelentéssel  
