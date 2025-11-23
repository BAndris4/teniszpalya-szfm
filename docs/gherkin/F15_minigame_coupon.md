<span style="color:red">Feature</span>: F15 – Kupon igénylése minijátékkal  
&nbsp;&nbsp;<span style="color:red">As a</span> játékos  
&nbsp;&nbsp;<span style="color:red">I want to</span> jutalom kupont kapni győzelem után  
&nbsp;&nbsp;<span style="color:red">So that</span> olcsóbban foglalhassak  

&nbsp;&nbsp;<span style="color:red">Background</span>:  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> the TennisMiniGame autentikált felhasználót igényel és a győzelemkor kupont kér a backendtől  

&nbsp;&nbsp;<span style="color:red">Scenario</span>: Győzelem után egyszeri kupon igénylés  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> I megnyerem a meccset a bot ellen  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">When</span> onGameWon <span style="color:green">"player"</span> győztest állít be  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Then</span> requestCouponFromAPI meghívja a <span style="color:green">"/api/coupon/request"</span> végpontot egyszer  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">And</span> a visszakapott kód megjelenik a nyeremény képernyőn és elmentődik a state-be  

&nbsp;&nbsp;<span style="color:red">Scenario</span>: Ismételt győzelem nem kér új kupont egy sessionön belül  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> couponRequestedRef true értékre állt egy korábbi győzelemkor  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">When</span> ismét nyerek  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Then</span> a requestCouponFromAPI nem hívódik meg és a meglévő kód marad látható  
