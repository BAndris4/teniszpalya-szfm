Feature: F19 – Admin torna menedzsment
  As an admin
  I want to létrehozni, szerkeszteni és törölni tornákat
  So that karbantarthassam az eseményeket

  Background:
    Given az admin felület Create Tournament űrlapot és szerkesztési vezérlőket kínál

  Scenario: Új torna létrehozása sikerrel jár
    Given I kitöltöm a Title, Description, Start date, Location, Max participants és Fee mezőket
    When I beküldöm az űrlapot
    Then POST kérés megy a "/api/tournaments" végpontra admin jogosultsággal
    And siker esetén siker üzenet jelenik meg és a lista újra lekérdezésre kerül

  Scenario: Torna szerkesztése hibát ad érvénytelen dátum esetén
    Given I aktiválom az Edit módot és módosítom a dátum mezőt érvénytelen ISO formátumra
    When a handleUpdateTournament hívás lefut
    Then a backend hibaüzenetet ad vissza és piros értesítés jelenik meg a felületen