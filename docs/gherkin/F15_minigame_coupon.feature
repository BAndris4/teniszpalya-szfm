Feature: F15 – Kupon igénylése minijátékkal
  As a játékos
  I want to jutalom kupont kapni győzelem után
  So that olcsóbban foglalhassak

  Background:
    Given the TennisMiniGame autentikált felhasználót igényel és a győzelemkor kupont kér a backendtől

  Scenario: Győzelem után egyszeri kupon igénylés
    Given I megnyerem a meccset a bot ellen
    When onGameWon "player" győztest állít be
    Then requestCouponFromAPI meghívja a "/api/coupon/request" végpontot egyszer
    And a visszakapott kód megjelenik a nyeremény képernyőn és elmentődik a state-be

  Scenario: Ismételt győzelem nem kér új kupont egy sessionön belül
    Given couponRequestedRef true értékre állt egy korábbi győzelemkor
    When ismét nyerek
    Then a requestCouponFromAPI nem hívódik meg és a meglévő kód marad látható