Feature: F18 – Torna részletek és jelentkezés
  As a játékos
  I want to belépni vagy kilépni egy tornáról
  So that menedzselhessem a részvételemet

  Background:
    Given the TournamentDetails nézet betölti a torna és résztvevő adatokat azonosító alapján

  Scenario: Jelentkezés sikeres visszajelzést ad
    Given I be vagyok jelentkezve és a torna még nem telt be
    When I kattintok a Register gombra
    Then POST kérés indul a "/api/tournaments/{id}/register" végpontra
    And sikeres válasz esetén zöld üzenet jelenik meg és a résztvevő lista frissül

  Scenario: Torna megteltsége miatt hibaüzenet jelenik meg
    Given a backend "Tournament is full" üzenettel tér vissza
    When a handleRegister függvény megkapja a hibát
    Then piros üzenet jelzi hogy a torna megtelt és a gomb disabled marad