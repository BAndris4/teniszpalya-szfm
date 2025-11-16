Feature: F23 – Jogosultságkezelés és védelem
  As a rendszer gazda
  I want to biztosítani hogy csak jogosult szereplők érjenek el kritikus végpontokat
  So that az adatok védettek maradjanak

  Background:
    Given az ASP.NET végpontok [Authorize] attribútumot használnak és JWT sütit várnak

  Scenario: Admin-only végpont védelme
    Given a /api/Reservations GET végpont [Authorize] attribútummal és Role ellenőrzéssel rendelkezik
    When egy nem admin felhasználó próbálja meghívni
    Then Forbid válasz érkezik és a frontend visszairányít a főoldalra

  Scenario: Auth nélküli kérés elutasítása
    Given a /api/coupon/request végpont hitelesítést igényel
    When a kérés AuthToken nélkül érkezik
    Then a rendszer Unauthorized státuszt ad vissza és nem generál kupont