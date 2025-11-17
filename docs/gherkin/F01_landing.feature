Feature: F01 – Landing oldali szekciók összeállítása
  As a látogató
  I want the Home nézet összes fő szekcióját látni
  So that gyorsan áttekinthetem a pályákat és az árakat

  Background:
    Given the frontend renders the Home component with ReserveMenuProvider wrapping the layout

  Scenario: Sikeres betöltéskor minden szekció és pályakártya megjelenik
    Given I navigate to the "/" útvonal
    When the Navbar, Hero, Courts, PriceList and Contact komponensek mount in order
    And the Courts szekció lekéri a "http://localhost:5044/api/Courts" végpontot és négy vagy több pályát kap
    Then the Courts slider renders a CourtCard for each returned court and enables the navigation gombok
    And the PriceList szekció előre definiált szezonális árakat mutat
    And the Contact szekció placeholder komponense renderelődik a landing oldalon

  Scenario: Sikertelen pálya lekérés esetén a slider üres marad
    Given the Courts lekérés hálózati hibát ad vissza
    When the promise visszadobja az exceptiont
    Then the Courts szekció console hibanaplót ír és üres listát tart fenn
    And the bal és jobb navigációs gombok rejtve maradnak, mert kevesebb mint négy elem érhető el