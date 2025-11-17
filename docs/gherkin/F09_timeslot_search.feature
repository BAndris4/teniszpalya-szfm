Feature: F09 – Idősáv szerinti keresés
  As a játékos
  I want to látni mely pályák szabadok egy adott idősávban
  So that optimális időpontot válasszak

  Background:
    Given the ReserveByTime nézet a kiválasztott időpontra tölti a pályalistát

  Scenario: Idő kiválasztása után pályalistát látok elérhetőségi státusszal
    Given I nyitom a Time picker modált és a "10:00" idősávot választom
    When the választás megtörtént
    Then a komponens lekéri a "/api/Courts" listát
    And minden pályához disabled flaget generál a szezon és random logika alapján
    And a CourtCardMid kártyák a disabled mező szerint jelölik az elérhetőséget

  Scenario: Tiltott pálya választása hibát jelez
    Given I kiválasztok egy olyan CourtCardMid kártyát, ahol disabled true
    When I próbálom elindítani a foglalást
    Then figyelmeztető alert jelenik meg hogy válasszak másik pályát
    And a checkout navigáció nem történik me