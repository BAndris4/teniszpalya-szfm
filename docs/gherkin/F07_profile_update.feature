Feature: F07 – Profiladat és jelszó módosítás
  As a játékos
  I want to frissíteni az elérhetőségeimet és jelszavamat
  So that naprakész maradjon a fiókom

  Background:
    Given the ProfileSettings komponens kitölti a mezők placeholderét az aktuális profilból

  Scenario: Adatmódosítás sikeresen mentődik a backendre
    Given I change my first name and phone number helyben
    When I submit the Details űrlapot
    Then a PUT kérés indul a "/api/Users/edit" végpontra az új értékekkel
    And pozitív válasz esetén onUpdateSuccess lefut a felület frissítéséhez

  Scenario: Hibás aktuális jelszó megadása elutasítja a csere kérelmet
    Given I töltöm a Current password mezőt érvénytelen értékkel
    And I adok meg szabályos új jelszót
    When I submit the Password űrlapot
    Then a POST kérés indul a "/api/ChangePassword" végpontra
    And 401-es válasz esetén "Invalid current password" placeholder jelenik meg és mindkét mező törlődik