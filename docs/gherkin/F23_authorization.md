<span style="color:red">Feature</span>: F23 – Jogosultságkezelés és védelem  
&nbsp;&nbsp;<span style="color:red">As a</span> rendszer gazda  
&nbsp;&nbsp;<span style="color:red">I want to</span> biztosítani hogy csak jogosult szereplők érjenek el kritikus végpontokat  
&nbsp;&nbsp;<span style="color:red">So that</span> az adatok védettek maradjanak  

&nbsp;&nbsp;<span style="color:red">Background</span>:  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> az ASP.NET végpontok [Authorize] attribútumot használnak és JWT sütit várnak  

&nbsp;&nbsp;<span style="color:red">Scenario</span>: Admin-only végpont védelme  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> a <span style="color:green">"/api/Reservations"</span> GET végpont [Authorize] attribútummal és Role ellenőrzéssel rendelkezik  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">When</span> egy nem admin felhasználó próbálja meghívni  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Then</span> Forbid válasz érkezik és a frontend visszairányít a főoldalra  

&nbsp;&nbsp;<span style="color:red">Scenario</span>: Auth nélküli kérés elutasítása  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> a <span style="color:green">"/api/coupon/request"</span> végpont hitelesítést igényel  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">When</span> a kérés AuthToken nélkül érkezik  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Then</span> a rendszer Unauthorized státuszt ad vissza és nem generál kupont  
