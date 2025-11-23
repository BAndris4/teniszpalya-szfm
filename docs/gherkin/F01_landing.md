<span style="color:red">Feature</span>: F01 – Landing oldali szekciók összeállítása  
&nbsp;&nbsp;<span style="color:red">As a</span> látogató  
&nbsp;&nbsp;<span style="color:red">I want the</span> Home nézet összes fő szekcióját látni  
&nbsp;&nbsp;<span style="color:red">So that</span> gyorsan áttekinthetem a pályákat és az árakat  

&nbsp;&nbsp;<span style="color:red">Background</span>:  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> the frontend renders the Home component with ReserveMenuProvider wrapping the layout  

&nbsp;&nbsp;<span style="color:red">Scenario</span>: Sikeres betöltéskor minden szekció és pályakártya megjelenik  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> I navigate to the <span style="color:green">"/"</span> útvonal  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">When</span> the Navbar, Hero, Courts, PriceList and Contact komponensek mount in order  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">And</span> the Courts szekció lekéri a <span style="color:green">"/api/Courts"</span> végpontot és négy vagy több pályát kap  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Then</span> the Courts slider renders a CourtCard for each returned court and enables the navigation gombok  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">And</span> the PriceList szekció előre definiált szezonális árakat mutat  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">And</span> the Contact szekció placeholder komponense renderelődik a landing oldalon  

&nbsp;&nbsp;<span style="color:red">Scenario</span>: Sikertelen pálya lekérés esetén a slider üres marad  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> the Courts lekérés hálózati hibát ad vissza  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">When</span> the promise visszadobja az exceptiont  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Then</span> the Courts szekció console hibanaplót ír és üres listát tart fenn  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">And</span> the bal és jobb navigációs gombok rejtve maradnak, mert kevesebb mint négy elem érhető el  
