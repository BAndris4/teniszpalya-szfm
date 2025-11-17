Feature: F10 – Szűrők és állapot kezelés
  As a játékos
  I want to megőrizni vagy visszaállítani a választott szűrőimet
  So that következetes felhasználói élményt kapjak

  Background:
    Given the ReserveByCourts és ReserveByTime nézetek belső useState állapotot használnak dátumra, pályára és idősávra

  Scenario: Dátumváltáskor a nézetek alapállapotba térnek
    Given I already selected a court és idősáv
    When I átállítom a DatePicker értékét
    Then a komponens useEffect hookja visszaállítja a length-et 1-re és törli a kiválasztott court/time állapotot

  Scenario: Nincs perzisztencia oldal elhagyása után
    Given I kiválasztottam adatokat ReserveByCourts nézetben
    When I elnavigálok másik route-ra és visszatérek
    Then the state entirely resets because nincs sessionStorage vagy cache implementáció