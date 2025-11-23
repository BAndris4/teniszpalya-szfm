<span style="color:red">Feature</span>: F02 – Háttér animációk és reszponzív töréspontok kezelése  
&nbsp;&nbsp;<span style="color:red">As a</span> látogató  
&nbsp;&nbsp;<span style="color:red">I want the</span> Home oldal hátterét gördülékenyen változni látni  
&nbsp;&nbsp;<span style="color:red">So that</span> az animáció nem zavarja a navigációt  

&nbsp;&nbsp;<span style="color:red">Background</span>:  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> the Home komponens két motion divet renderel topBlob és bottomBlob animációval  

&nbsp;&nbsp;<span style="color:red">Scenario</span>: Scrolloláskor a megfelelő blob pozíciók lépnek életbe  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> the section ids Hero, Reserve, Courts, PriceList and Contact are tracked by useScrollSection  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">When</span> I scroll so that the Courts blokk kerül fókuszba  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Then</span> the currentSection value switches to <span style="color:green">"Courts"</span>  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">And</span> the topBlob animáció top: <span style="color:green">"25vh"</span>, left: <span style="color:green">"70vw"</span> értékre frissül  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">And</span> the bottomBlob animáció top: <span style="color:green">"70vh"</span>, left: <span style="color:green">"-10vw"</span> értékre frissül  

&nbsp;&nbsp;<span style="color:red">Scenario</span>: Nem definiált szekció esetén a Hero beállításai maradnak érvényben  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Given</span> backgroundPositions csak Hero és Courts kulcsokat tartalmaz  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">When</span> the observer egy olyan szekciót észlel, amelyhez nincs bejegyzés  
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">Then</span> the motion div animációi a Hero pozícióival renderelődnek  
