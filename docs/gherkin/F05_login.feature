Feature: F05 – Bejelentkezés és session létrehozás
  As a játékos
  I want to authenticate my account
  So that hozzáférjek a foglalási funkciókhoz

  Background:
    Given the Login nézet e-mail és jelszó mezőt jelenít meg

  Scenario: Helyes hitelesítő adatok sikeres bejelentkezést eredményeznek
    Given I provide an email and password that exist in the rendszer
    When I submit the login űrlapot
    Then the frontend POST kérést küld a "/api/auth/login" végpontra HTTP-only süti beállítással
    And a 200-as válasz után a felület a főoldalra navigál

  Scenario: Rossz jelszó esetén hibajelzés és session nélkül maradok
    Given I provide an existing email but rossz jelszót
    When the backend 401-et ad vissza "Invalid credentials" üzenettel
    Then a böngésző alertet jelenít meg "Invalid email or password" tartalommal
    And az űrlap értékei megmaradnak új próbálkozáshoz