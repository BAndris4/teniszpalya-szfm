Feature: F03 – Kapcsolatfelvételi űrlap validáció és visszajelzés
  As a látogató
  I want to send a kapcsolatfelvételi üzenetet
  So that választ kapjak a kérdéseimre

  Background:
    Given the Contact nézet animált űrlapot renderel név, email és üzenet mezőkkel

  Scenario: Érvényes adatokkal sikeres visszajelzés jelenik meg
    Given I provide a non-empty name, valid email and hosszabb üzenet
    When I submit the form
    Then the Submit gomb Sending... állapotba vált 1.2 másodpercre
    And the mezők kiürülnek
    And a zöld státusz üzenet jelenik meg "Thank you for contacting us!" szöveggel

  Scenario: Hibás email esetén hibaüzenet látszik és nincs küldés
    Given I töltöm a név és üzenet mezőt
    And I provide an invalid email formátumot
    When I submit the form
    Then a piros hibaszöveg kéri a valid email címet
    And a submit nem indul el és az űrlap mezők értékei megmaradnak