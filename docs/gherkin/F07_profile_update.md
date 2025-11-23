<span style="color:red">Feature</span>: F07 – Profiladat és jelszó módosítás  
&nbsp;&nbsp;<span style="color:red">As a</span> játékos  
&nbsp;&nbsp;<span style="color:red">I want to</span> frissíteni az elérhetőségeimet és jelszavamat  
&nbsp;&nbsp;<span style="color:red">So that</span> naprakész maradjon a fiókom  

&nbsp;&nbsp;<span style="color:red">Background</span>:  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> the ProfileSettings komponens kitölti a mezők placeholderét az aktuális profilból  

&nbsp;&nbsp;<span style="color:red">Scenario</span>: Adatmódosítás sikeresen mentődik a backendre  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> I change my first name and phone number helyben  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">When</span> I submit the Details űrlapot  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Then</span> a PUT kérés indul a <span style="color:green">"/api/Users/edit"</span> végpontra az új értékekkel  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">And</span> pozitív válasz esetén onUpdateSuccess lefut a felület frissítéséhez  

&nbsp;&nbsp;<span style="color:red">Scenario</span>: Hibás aktuális jelszó megadása elutasítja a csere kérelmet  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> I töltöm a Current password mezőt érvénytelen értékkel  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">And</span> I adok meg szabályos új jelszót  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">When</span> I submit the Password űrlapot  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Then</span> a POST kérés indul a <span style="color:green">"/api/ChangePassword"</span> végpontra  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">And</span> 401-es válasz esetén <span style="color:green">"Invalid current password"</span> placeholder jelenik meg és mindkét mező törlődik  
