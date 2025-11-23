<span style="color:red">Feature</span>: F19 – Admin torna menedzsment  
&nbsp;&nbsp;<span style="color:red">As an</span> admin  
&nbsp;&nbsp;<span style="color:red">I want to</span> létrehozni, szerkeszteni és törölni tornákat  
&nbsp;&nbsp;<span style="color:red">So that</span> karbantarthassam az eseményeket  

&nbsp;&nbsp;<span style="color:red">Background</span>:  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> az admin felület Create Tournament űrlapot és szerkesztési vezérlőket kínál  

&nbsp;&nbsp;<span style="color:red">Scenario</span>: Új torna létrehozása sikerrel jár  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> I kitöltöm a Title, Description, Start date, Location, Max participants és Fee mezőket  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">When</span> I beküldöm az űrlapot  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Then</span> POST kérés megy a <span style="color:green">"/api/tournaments"</span> végpontra admin jogosultsággal  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">And</span> siker esetén siker üzenet jelenik meg és a lista újra lekérdezésre kerül  

&nbsp;&nbsp;<span style="color:red">Scenario</span>: Torna szerkesztése hibát ad érvénytelen dátum esetén  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> I aktiválom az Edit módot és módosítom a dátum mezőt érvénytelen ISO formátumra  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">When</span> a handleUpdateTournament hívás lefut  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Then</span> a backend hibaüzenetet ad vissza és piros értesítés jelenik meg a felületen  
