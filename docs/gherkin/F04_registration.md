<span style="color:red">Feature</span>: F04 – Regisztráció folyamat  
&nbsp;&nbsp;<span style="color:red">As a</span> látogató  
&nbsp;&nbsp;<span style="color:red">I want to</span> create a player account  
&nbsp;&nbsp;<span style="color:red">So that</span> foglalhassak pályát  

&nbsp;&nbsp;<span style="color:red">Background</span>:  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> the Register nézet InputField komponensekkel gyűjti az adatokat  

&nbsp;&nbsp;<span style="color:red">Scenario</span>: Érvényes mezők esetén sikeres regisztráció és automatikus bejelentkezés  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> I enter alphabetic first and last name értékeket  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">And</span> I provide a phone number that matches the <span style="color:green">"+digit"</span> pattern  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">And</span> I fill a valid email formátumot és erős jelszót  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">When</span> I submit the Sign up űrlapot  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Then</span> the frontend POST kérést küld a <span style="color:green">"/api/auth/register"</span> végpontra  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">And</span> a sikeres válasz után ugyanazon credentialekkel login kérést indít  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">And</span> the böngésző a főoldalra navigál  

&nbsp;&nbsp;<span style="color:red">Scenario</span>: Hibás jelszó minta esetén hibaüzenet és blokkolt beküldés  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> I megadok egy 6 karakteres jelszót szám nélkül  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">When</span> I submit the űrlapot  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Then</span> a piros figyelmeztetés jelenik meg hogy a jelszónak 8 karakteresnek kell lennie és tartalmaznia kell nagybetűt, kisbetűt és számot  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">And</span> the jelszó mező kiürül és a POST kérés nem indul el  
