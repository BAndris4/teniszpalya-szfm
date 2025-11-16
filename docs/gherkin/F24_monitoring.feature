Feature: F24 – Monitorozás és hibalogolás
  As an üzemeltető
  I want to kapni visszajelzést a hibákról
  So that gyorsan reagálhassak a problémákra

  Background:
    Given a frontend komponensek console alapú hibalogolást használnak és a backend standard middleware-je rögzíti az exceptionöket

  Scenario: API hiba kliens oldali naplózása
    Given a Courts komponens nem tudja elérni a "/api/Courts" végpontot
    When a fetch catch ágba kerül
    Then console.error üzenet kerül a naplóba a sikertelen lekérésről
    And a felhasználó a UI-ban nem kap crash-t, csak üres listát lát

  Scenario: Backend hiba esetén általános üzenet jelenik meg a checkout oldalon
    Given a "/api/Reservations" POST hibát dob
    When a catch blokk elkapja az exceptiont
    Then a hiba szöveg "Something went wrong while creating your reservation" jelenik meg és a console is naplózza az error stack-et