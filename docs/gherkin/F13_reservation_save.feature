Feature: F13 – Foglalás mentése és visszajelzés
  As a játékos
  I want to véglegesíteni a kiválasztott idősávot
  So that biztosítva legyen a pálya

  Background:
    Given the ConfirmReservation gomb POST kérést küld a "/api/Reservations" végpontra

  Scenario: Sikeres mentés visszaigazoló modált és átirányítást eredményez
    Given a payload tartalmazza a createdAt, reservedAt, hours, courtID és opcionális couponCode mezőket
    When the backend 200-as választ ad vissza
    Then a ConfirmResponsePopup pozitív állapotban jelenik meg
    And 2.5 másodperc múlva a rendszer a főoldalra navigál

  Scenario: Hibás válasz esetén hibaüzenet marad az oldalon
    Given a backend válasza nem OK státuszú
    When a fetch promise catch ágba fut
    Then a felhasználó piros hibaüzenetet kap hogy próbálja újra
    And az isSubmitting flag false-ra áll vissza hogy ismét próbálkozhassak