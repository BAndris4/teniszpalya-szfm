<span style="color:red">Feature</span>: F10 – Szűrők és állapot kezelés  
&nbsp;&nbsp;<span style="color:red">As a</span> játékos  
&nbsp;&nbsp;<span style="color:red">I want to</span> megőrizni vagy visszaállítani a választott szűrőimet  
&nbsp;&nbsp;<span style="color:red">So that</span> következetes felhasználói élményt kapjak  

&nbsp;&nbsp;<span style="color:red">Background</span>:  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> the ReserveByCourts és ReserveByTime nézetek belső useState állapotot használnak dátumra, pályára és idősávra  

&nbsp;&nbsp;<span style="color:red">Scenario</span>: Dátumváltáskor a nézetek alapállapotba térnek  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> I already selected a court és idősáv  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">When</span> I átállítom a DatePicker értékét  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Then</span> a komponens useEffect hookja visszaállítja a length-et 1-re és törli a kiválasztott court/time állapotot  

&nbsp;&nbsp;<span style="color:red">Scenario</span>: Nincs perzisztencia oldal elhagyása után  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> I kiválasztottam adatokat ReserveByCourts nézetben  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">When</span> I elnavigálok másik route-ra és visszatérek  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Then</span> the state entirely resets because nincs sessionStorage vagy cache implementáció  
