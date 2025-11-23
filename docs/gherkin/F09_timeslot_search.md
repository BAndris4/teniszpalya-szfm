<span style="color:red">Feature</span>: F09 – Idősáv szerinti keresés  
&nbsp;&nbsp;<span style="color:red">As a</span> játékos  
&nbsp;&nbsp;<span style="color:red">I want to</span> látni mely pályák szabadok egy adott idősávban  
&nbsp;&nbsp;<span style="color:red">So that</span> optimális időpontot válasszak  

&nbsp;&nbsp;<span style="color:red">Background</span>:  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> the ReserveByTime nézet a kiválasztott időpontra tölti a pályalistát  

&nbsp;&nbsp;<span style="color:red">Scenario</span>: Idő kiválasztása után pályalistát látok elérhetőségi státusszal  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> I nyitom a Time picker modált és a <span style="color:green">"10:00"</span> idősávot választom  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">When</span> the választás megtörtént  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Then</span> a komponens lekéri a <span style="color:green">"/api/Courts"</span> listát  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">And</span> minden pályához disabled flaget generál a szezon és random logika alapján  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">And</span> a CourtCardMid kártyák a disabled mező szerint jelölik az elérhetőséget  

&nbsp;&nbsp;<span style="color:red">Scenario</span>: Tiltott pálya választása hibát jelez  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> I kiválasztok egy olyan CourtCardMid kártyát, ahol disabled true  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">When</span> I próbálom elindítani a foglalást  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Then</span> figyelmeztető alert jelenik meg hogy válasszak másik pályát  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">And</span> a checkout navigáció nem történik meg  
