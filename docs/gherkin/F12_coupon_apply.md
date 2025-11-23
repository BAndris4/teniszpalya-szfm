<span style="color:red">Feature</span>: F12 – Kupon validálás és alkalmazás  
&nbsp;&nbsp;<span style="color:red">As a</span> játékos  
&nbsp;&nbsp;<span style="color:red">I want to</span> felhasználni kuponkódot a foglalásnál  
&nbsp;&nbsp;<span style="color:red">So that</span> kedvezményt kapjak  

&nbsp;&nbsp;<span style="color:red">Background</span>:  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> the checkout oldal lekéri a <span style="color:green">"/api/coupon/my"</span> végpontból az elérhető kuponokat  

&nbsp;&nbsp;<span style="color:red">Scenario</span>: Listában szereplő kupon elfogadása  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> the coupons API listában szerepel az <span style="color:green">"SAVE20"</span> kód used false státusszal  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">And</span> I írom be a kódot az input mezőbe és Apply gombot nyomok  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Then</span> a match találtatik és appliedCoupon értéke a kód objektuma lesz  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">And</span> a képernyő zöld üzenetet jelenít meg hogy 20% kedvezmény alkalmazva  

&nbsp;&nbsp;<span style="color:red">Scenario</span>: Érvénytelen kupon visszautasítása  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> a felhasználó olyan kódot ad meg, ami nincs a listában vagy used true  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">When</span> handleApplyCoupon fut  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Then</span> appliedCoupon null értéket kap és couponStatus <span style="color:green">"invalid"</span> lesz  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">And</span> a felhasználó piros visszajelzést kap hogy a kupon érvénytelen  
