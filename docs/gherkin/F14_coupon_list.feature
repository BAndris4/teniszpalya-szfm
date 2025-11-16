Feature: F14 – Kuponlista megjelenítés a profilban
  As a játékos
  I want to áttekinteni az aktív kuponjaimat
  So that tudjam melyik kódot használhatom

  Background:
    Given a profil Coupons komponens a "/api/coupon/my" végpontból tölti a kedvezményeket

  Scenario: Sikeres lekérés aktív kuponokat listáz
    Given the API non-empty tömböt ad vissza used false kuponokkal
    When a request sikeresen lefut
    Then a komponens gridben megjeleníti a kupon kódokat és státuszukat
    And a felső gomb a minijáték oldalra navigál

  Scenario: Üres lista esetén minijáték CTA jelenik meg
    Given the API üres tömböt ad
    When a komponens renderel
    Then a "Play mini game & win a coupon" gomb és tájékoztató üzenet látható
    And nincs kupon kártya listázva