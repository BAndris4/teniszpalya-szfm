Feature: F08 – Dátum- és pályaválasztó nézet
  As a játékos
  I want to kiválasztani egy pályát és dátumot
  So that továbbléphessek a foglalásra

  Background:
    Given the ReserveByCourts nézet DatePicker, CourtCardSmall és TimeBlock elemeket renderel

  Scenario: Téli szezonban kültéri pálya választása tiltja az idősávot
    Given the DatePicker dátuma decemberre esik
    And I open the court picker and select an outdoor court (outdoors true)
    When the component recalculates freeTimes
    Then allTimesDisabledForCourt értéke true lesz és nem választható időpont

  Scenario: Érvényes kiválasztás után a Tovább gomb checkout állapotot kap
    Given I choose a court és egy szabad idősávot a listából
    When I click on Reserve a Court gombot
    Then a navigate hívás történik a "/checkout" útvonalra a kiválasztott dátum, óraszám és court meta adatokkal