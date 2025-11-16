Feature: F16 – Admin kuponkezelés előkészítése
  As an admin
  I want to látni hol lesznek a kuponkezelő eszközök
  So that tudjam milyen funkciók hiányoznak még

  Background:
    Given the AdminPanel jelenleg csak Reservations és Courts füleket renderel

  Scenario: Kupon tab hiánya jelzi a későbbi fejlesztési igényt
    Given I bejelentkezem adminként és megnyitom az admin felületet
    When megnézem az AdminTopbar füljeit
    Then csak "Reservations" és "Courts" lehetőséget találok
    And nincs kupon létrehozásra szolgáló gomb vagy űrlap

  Scenario: Fejlesztés alatti funkció vizuális jelzés nélkül
    Given az admin felületen nincs disable állapotú kupon gomb
    When igény merül fel kupon létrehozásra
    Then a jelenlegi implementáció utasítja az admint hogy a funkció később lesz elérhető manuális kommunikáció útján