<span style="color:red">Feature</span>: F18 – Torna részletek és jelentkezés  
&nbsp;&nbsp;<span style="color:red">As a</span> játékos  
&nbsp;&nbsp;<span style="color:red">I want to</span> belépni vagy kilépni egy tornáról  
&nbsp;&nbsp;<span style="color:red">So that</span> menedzselhessem a részvételemet  

&nbsp;&nbsp;<span style="color:red">Background</span>:  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> the TournamentDetails nézet betölti a torna és résztvevő adatokat azonosító alapján  

&nbsp;&nbsp;<span style="color:red">Scenario</span>: Jelentkezés sikeres visszajelzést ad  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> I be vagyok jelentkezve és a torna még nem telt be  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">When</span> I kattintok a Register gombra  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Then</span> POST kérés indul a <span style="color:green">"/api/tournaments/{id}/register"</span> végpontra  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">And</span> sikeres válasz esetén zöld üzenet jelenik meg és a résztvevő lista frissül  

&nbsp;&nbsp;<span style="color:red">Scenario</span>: Torna megteltsége miatt hibaüzenet jelenik meg  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> a backend <span style="color:green">"Tournament is full"</span> üzenettel tér vissza  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">When</span> a handleRegister függvény megkapja a hibát  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Then</span> piros üzenet jelzi hogy a torna megtelt és a gomb disabled marad  
