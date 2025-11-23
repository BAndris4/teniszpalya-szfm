<span style="color:red">Feature</span>: F14 – Kuponlista megjelenítés a profilban  
&nbsp;&nbsp;<span style="color:red">As a</span> játékos  
&nbsp;&nbsp;<span style="color:red">I want to</span> áttekinteni az aktív kuponjaimat  
&nbsp;&nbsp;<span style="color:red">So that</span> tudjam melyik kódot használhatom  

&nbsp;&nbsp;<span style="color:red">Background</span>:  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> a profil Coupons komponens a <span style="color:green">"/api/coupon/my"</span> végpontból tölti a kedvezményeket  

&nbsp;&nbsp;<span style="color:red">Scenario</span>: Sikeres lekérés aktív kuponokat listáz  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> the API non-empty tömböt ad vissza used false kuponokkal  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">When</span> a request sikeresen lefut  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Then</span> a komponens gridben megjeleníti a kupon kódokat és státuszukat  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">And</span> a felső gomb a minijáték oldalra navigál  

&nbsp;&nbsp;<span style="color:red">Scenario</span>: Üres lista esetén minijáték CTA jelenik meg  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> the API üres tömböt ad  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">When</span> a komponens renderel  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Then</span> a <span style="color:green">"Play mini game & win a coupon"</span> gomb és tájékoztató üzenet látható  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">And</span> nincs kupon kártya listázva  
