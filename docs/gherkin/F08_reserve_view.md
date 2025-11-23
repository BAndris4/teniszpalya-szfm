<span style="color:red">Feature</span>: F08 – Dátum- és pályaválasztó nézet  
&nbsp;&nbsp;<span style="color:red">As a</span> játékos  
&nbsp;&nbsp;<span style="color:red">I want to</span> kiválasztani egy pályát és dátumot  
&nbsp;&nbsp;<span style="color:red">So that</span> továbbléphessek a foglalásra  

&nbsp;&nbsp;<span style="color:red">Background</span>:  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> the ReserveByCourts nézet DatePicker, CourtCardSmall és TimeBlock elemeket renderel  

&nbsp;&nbsp;<span style="color:red">Scenario</span>: Téli szezonban kültéri pálya választása tiltja az idősávot  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> the DatePicker dátuma decemberre esik  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">And</span> I open the court picker and select an outdoor court (outdoors true)  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">When</span> the component recalculates freeTimes  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Then</span> allTimesDisabledForCourt értéke true lesz és nem választható időpont  

&nbsp;&nbsp;<span style="color:red">Scenario</span>: Érvényes kiválasztás után a Tovább gomb checkout állapotot kap  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> I choose a court és egy szabad idősávot a listából  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">When</span> I click on Reserve a Court gombot  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Then</span> a navigate hívás történik a <span style="color:green">"/checkout"</span> útvonalra a kiválasztott dátum, óraszám és court meta adatokkal  
