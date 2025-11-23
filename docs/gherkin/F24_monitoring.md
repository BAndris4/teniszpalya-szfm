<span style="color:red">Feature</span>: F24 – Monitorozás és hibalogolás  
&nbsp;&nbsp;<span style="color:red">As an</span> üzemeltető  
&nbsp;&nbsp;<span style="color:red">I want to</span> kapni visszajelzést a hibákról  
&nbsp;&nbsp;<span style="color:red">So that</span> gyorsan reagálhassak a problémákra  

&nbsp;&nbsp;<span style="color:red">Background</span>:  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> a frontend komponensek console alapú hibalogolást használnak és a backend standard middleware-je rögzíti az exceptionöket  

&nbsp;&nbsp;<span style="color:red">Scenario</span>: API hiba kliens oldali naplózása  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> a Courts komponens nem tudja elérni a <span style="color:green">"/api/Courts"</span> végpontot  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">When</span> a fetch catch ágba kerül  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Then</span> console.error üzenet kerül a naplóba a sikertelen lekérésről  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">And</span> a felhasználó a UI-ban nem kap crash-t, csak üres listát lát  

&nbsp;&nbsp;<span style="color:red">Scenario</span>: Backend hiba esetén általános üzenet jelenik meg a checkout oldalon  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> a <span style="color:green">"/api/Reservations"</span> POST hibát dob  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">When</span> a catch blokk elkapja az exceptiont  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Then</span> a hiba szöveg <span style="color:green">"Something went wrong while creating your reservation"</span> jelenik meg és a console is naplózza az error stack-et  
