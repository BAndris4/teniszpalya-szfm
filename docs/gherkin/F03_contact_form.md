<span style="color:red">Feature</span>: F03 – Kapcsolatfelvételi űrlap validáció és visszajelzés  
&nbsp;&nbsp;<span style="color:red">As a</span> látogató  
&nbsp;&nbsp;<span style="color:red">I want to</span> send a kapcsolatfelvételi üzenetet  
&nbsp;&nbsp;<span style="color:red">So that</span> választ kapjak a kérdéseimre  

&nbsp;&nbsp;<span style="color:red">Background</span>:  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> the Contact nézet animált űrlapot renderel név, email és üzenet mezőkkel  

&nbsp;&nbsp;<span style="color:red">Scenario</span>: Érvényes adatokkal sikeres visszajelzés jelenik meg  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> I provide a non-empty name, valid email and hosszabb üzenet  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">When</span> I submit the form  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Then</span> the Submit gomb Sending... állapotba vált <span style="color:green">"1.2"</span> másodpercre  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">And</span> the mezők kiürülnek  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">And</span> a zöld státusz üzenet jelenik meg <span style="color:green">"Thank you for contacting us!"</span> szöveggel  

&nbsp;&nbsp;<span style="color:red">Scenario</span>: Hibás email esetén hibaüzenet látszik és nincs küldés  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> I töltöm a név és üzenet mezőt  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">And</span> I provide an invalid email formátumot  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">When</span> I submit the form  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Then</span> a piros hibaszöveg kéri a valid email címet  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">And</span> a submit nem indul el és az űrlap mezők értékei megmaradnak  
