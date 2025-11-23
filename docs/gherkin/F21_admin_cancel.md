<span style="color:red">Feature</span>: F21 – Foglalás törlése admin által  
&nbsp;&nbsp;<span style="color:red">As an</span> admin  
&nbsp;&nbsp;<span style="color:red">I want to</span> törölni szabálytalan vagy ütköző foglalásokat  
&nbsp;&nbsp;<span style="color:red">So that</span> felszabadítsam az idősávokat  

&nbsp;&nbsp;<span style="color:red">Background</span>:  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> a ReservationsTab soronként Delete gombot jelenít meg és ConfirmResponsePopup dialógust használ  

&nbsp;&nbsp;<span style="color:red">Scenario</span>: Törlés megerősítése eltávolítja a sort  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> I egy sor Delete gombjára kattintok  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">When</span> a megerősítő párbeszéd megjelenik és jóváhagyom  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Then</span> DELETE kérés megy a <span style="color:green">"/api/Reservations/{id}"</span> végpontra  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">And</span> sikeres válasz esetén a sor eltűnik és success popup jelenik meg  

&nbsp;&nbsp;<span style="color:red">Scenario</span>: Backend hiba esetén hibaüzenet érkezik  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> a törlés kísérlete 500-as hibát ad vissza  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">When</span> a fetch res.ok hamis értéket ad  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Then</span> egy alert jelzi hogy a törlés sikertelen maradt és a sor a listában marad  
