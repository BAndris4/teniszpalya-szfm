Feature: F22 – Felhasználói metaadatok szinkronizálása
  As an admin
  I want to látni a foglalásokhoz tartozó felhasználói adatokat
  So that gyorsan kapcsolatba léphessek velük

  Background:
    Given a ReservationsTab a felhasználókat külön lekéri és Map segítségével összekapcsolja a foglalásokkal

  Scenario: Létező felhasználó esetén név és email jelenik meg
    Given a Users végpont visszaadja azonosítóval ellátott rekordokat
    When a rows normálása megtörténik
    Then a táblázatban a user teljes neve és emailje látható a foglalás sorában

  Scenario: Hiányzó felhasználó esetén generikus jelölés
    Given a foglalás userID-ja nem található a users listában
    When a sor renderelődik
    Then a név oszlop "User {id}" formát mutat és az email oszlop "—" karaktert jelenít meg