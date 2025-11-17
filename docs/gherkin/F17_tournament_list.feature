Feature: F17 – Tornák listázása
  As a látogató
  I want to áttekinteni az elérhető tornákat
  So that eldöntsem melyikre jelentkezzek

  Background:
    Given the Tournaments nézet GET kérést küld a "/api/tournaments" végpontnak

  Scenario: Elérhető tornák megjelenítése kártyákon
    Given the backend legalább egy tornát ad vissza currentParticipants és maxParticipants mezőkkel
    When a fetch sikeresen lefut
    Then a lista kártyái kiírják a létszámot és határidőt
    And a Join részletek gomb a részletező oldalra navigál

  Scenario: Üres válasz esetén hangulatos üzenet látszik
    Given a lista üres tömböt ad vissza
    When a komponens renderel
    Then egy illusztráció és tájékoztató szöveg jelenik meg "No tournaments yet" jelentéssel