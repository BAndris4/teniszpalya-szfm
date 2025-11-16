Feature: F06 – Aktuális felhasználó lekérdezése
  As a játékos
  I want my session állapotát betölteni oldalfrissítés után
  So that ne kelljen újra bejelentkeznem

  Background:
    Given the useCurrentUser hook komponens mountoláskor meghívja a "/api/auth/me" végpontot credentials: include beállítással

  Scenario: Érvényes sütivel a profil adatok visszatérnek
    Given my böngészőben érvényes AuthToken süti van
    When the hook sikeres 200-as választ kap JSON profillal
    Then the user state id, firstName, lastName, email, phoneNumber és roleID mezőkkel frissül
    And the authenticated állapot true értéket vesz fel

  Scenario: Hiányzó vagy lejárt süti esetén kijelentkeztetett állapot
    Given nincs AuthToken sütim
    When the "/api/auth/me" hívás 401 státuszt ad vissza
    Then the hook authenticated értéke false-ra áll
    And a függő komponensek (például foglalási nézet) automatikusan login oldalra irányítanak