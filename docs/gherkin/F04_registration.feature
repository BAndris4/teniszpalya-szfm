Feature: F04 – Regisztráció folyamat
  As a látogató
  I want to create a player account
  So that foglalhassak pályát

  Background:
    Given the Register nézet InputField komponensekkel gyűjti az adatokat

  Scenario: Érvényes mezők esetén sikeres regisztráció és automatikus bejelentkezés
    Given I enter alphabetic first and last name értékeket
    And I provide a phone number that matches the +digit pattern
    And I fill a valid email formátumot és erős jelszót
    When I submit the Sign up űrlapot
    Then the frontend POST kérést küld a "/api/auth/register" végpontra
    And a sikeres válasz után ugyanazon credentialekkel login kérést indít
    And the böngésző a főoldalra navigál

  Scenario: Hibás jelszó minta esetén hibaüzenet és blokkolt beküldés
    Given I megadok egy 6 karakteres jelszót szám nélkül
    When I submit the űrlapot
    Then a piros figyelmeztetés jelenik meg hogy a jelszónak 8 karakteresnek kell lennie és tartalmaznia kell nagybetűt, kisbetűt és számot
    And the jelszó mező kiürül és a POST kérés nem indul el