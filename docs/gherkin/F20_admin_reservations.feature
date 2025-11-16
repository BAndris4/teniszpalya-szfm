Feature: F20 – Foglalások listázása és szűrése
  As an admin
  I want to áttekinteni és szűrni az összes foglalást
  So that gyorsan megtaláljam a releváns bejegyzéseket

  Background:
    Given the ReservationsTab egyszerre tölti be a "/api/Reservations" és "/api/Users" adatokat és táblázatban jeleníti meg

  Scenario: Név szerinti keresés és rendezés működik
    Given a táblázat több felhasználót tartalmaz
    When I beírom a keresőmezőbe egy játékos nevét
    Then csak az adott névre illeszkedő sorok maradnak láthatóak
    And a SortHeader gombokra kattintva változtathatom a rendezési kulcsot

  Scenario: Dátum és státusz szűrők kombinációja
    Given I bekapcsolom a Date filter Range módot és megadok kezdő és záró dátumot
    And a Status szűrőt "Upcoming" értékre állítom
    When a filtered lista frissül
    Then csak a megadott időablakba eső és Upcoming státuszú foglalások szerepelnek
    And a lapozás a szűrt elemszámhoz igazodik