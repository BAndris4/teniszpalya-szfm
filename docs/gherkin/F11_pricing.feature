Feature: F11 – Díjkalkuláció hallgatói kedvezménnyel
  As a játékos
  I want to látni hogyan változik az ár a hallgatói státusz szerint
  So that a megfelelő összeget fizessem

  Background:
    Given the ReservationCheckout oldal a usePrice hookot használja az óradíj kiszámításához

  Scenario: Hallgatói kapcsoló alkalmazása csökkenti az alapárat
    Given I érkezem a checkout oldalra egy beltéri pálya reggeli két órás foglalásával
    When I aktiválom a Student reservation toggle-t
    Then the getPrice hívások student true paraméterrel futnak
    And a Payment summary összeg a hallgatói tarifák szerint csökken

  Scenario: Hiányzó ár esetén figyelmeztetés jelenik meg
    Given I hoztam létre téli kültéri foglalást, ahol a price konfiguráció null értéket ad
    When the basePrice számítás lefut
    Then the felület jelzi hogy "no price" a megfelelő sorban és discountedPrice változatlan marad