<span style="color:red">Feature</span>: F05 – Bejelentkezés és session létrehozás  
&nbsp;&nbsp;<span style="color:red">As a</span> játékos  
&nbsp;&nbsp;<span style="color:red">I want to</span> authenticate my account  
&nbsp;&nbsp;<span style="color:red">So that</span> hozzáférjek a foglalási funkciókhoz  

&nbsp;&nbsp;<span style="color:red">Background</span>:  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> the Login nézet e-mail és jelszó mezőt jelenít meg  

&nbsp;&nbsp;<span style="color:red">Scenario</span>: Helyes hitelesítő adatok sikeres bejelentkezést eredményeznek  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> I provide an email and password that exist in the rendszer  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">When</span> I submit the login űrlapot  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Then</span> the frontend POST kérést küld a <span style="color:green">"/api/auth/login"</span> végpontra HTTP-only süti beállítással  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">And</span> a 200-as válasz után a felület a főoldalra navigál  

&nbsp;&nbsp;<span style="color:red">Scenario</span>: Rossz jelszó esetén hibajelzés és session nélkül maradok  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> I provide an existing email but rossz jelszót  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">When</span> the backend 401-et ad vissza <span style="color:green">"Invalid credentials"</span> üzenettel  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Then</span> a böngésző alertet jelenít meg <span style="color:green">"Invalid email or password"</span> tartalommal  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">And</span> az űrlap értékei megmaradnak új próbálkozáshoz  
