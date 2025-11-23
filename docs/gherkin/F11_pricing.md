<span style="color:red">Feature</span>: F11 – Díjkalkuláció hallgatói kedvezménnyel  
&nbsp;&nbsp;<span style="color:red">As a</span> játékos  
&nbsp;&nbsp;<span style="color:red">I want to</span> látni hogyan változik az ár a hallgatói státusz szerint  
&nbsp;&nbsp;<span style="color:red">So that</span> a megfelelő összeget fizessem  

&nbsp;&nbsp;<span style="color:red">Background</span>:  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> the ReservationCheckout oldal a usePrice hookot használja az óradíj kiszámításához  

&nbsp;&nbsp;<span style="color:red">Scenario</span>: Hallgatói kapcsoló alkalmazása csökkenti az alapárat  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> I érkezem a checkout oldalra egy beltéri pálya reggeli két órás foglalásával  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">When</span> I aktiválom a Student reservation toggle-t  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Then</span> the getPrice hívások student true paraméterrel futnak  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">And</span> a Payment summary összeg a hallgatói tarifák szerint csökken  

&nbsp;&nbsp;<span style="color:red">Scenario</span>: Hiányzó ár esetén figyelmeztetés jelenik meg  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> I hoztam létre téli kültéri foglalást, ahol a price konfiguráció null értéket ad  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">When</span> the basePrice számítás lefut  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Then</span> the felület jelzi hogy <span style="color:green">"no price"</span> a megfelelő sorban és discountedPrice változatlan marad  
