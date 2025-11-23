<span style="color:red">Feature</span>: F16 – Admin kuponkezelés előkészítése  
&nbsp;&nbsp;<span style="color:red">As an</span> admin  
&nbsp;&nbsp;<span style="color:red">I want to</span> látni hol lesznek a kuponkezelő eszközök  
&nbsp;&nbsp;<span style="color:red">So that</span> tudjam milyen funkciók hiányoznak még  

&nbsp;&nbsp;<span style="color:red">Background</span>:  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> the AdminPanel jelenleg csak Reservations és Courts füleket renderel  

&nbsp;&nbsp;<span style="color:red">Scenario</span>: Kupon tab hiánya jelzi a későbbi fejlesztési igényt  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> I bejelentkezem adminként és megnyitom az admin felületet  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">When</span> megnézem az AdminTopbar füljeit  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Then</span> csak <span style="color:green">"Reservations"</span> és <span style="color:green">"Courts"</span> lehetőséget találok  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">And</span> nincs kupon létrehozásra szolgáló gomb vagy űrlap  

&nbsp;&nbsp;<span style="color:red">Scenario</span>: Fejlesztés alatti funkció vizuális jelzés nélkül  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> az admin felületen nincs disable állapotú kupon gomb  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">When</span> igény merül fel kupon létrehozásra  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Then</span> a jelenlegi implementáció utasítja az admint hogy a funkció később lesz elérhető manuális kommunikáció útján  
