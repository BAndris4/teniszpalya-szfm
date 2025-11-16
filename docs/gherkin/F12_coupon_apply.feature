Feature: F12 – Kupon validálás és alkalmazás
  As a játékos
  I want to felhasználni kuponkódot a foglalásnál
  So that kedvezményt kapjak

  Background:
    Given the checkout oldal lekéri a "/api/coupon/my" végpontból az elérhető kuponokat

  Scenario: Listában szereplő kupon elfogadása
    Given the coupons API listában szerepel az "SAVE20" kód used false státusszal
    And I írom be a kódot az input mezőbe és Apply gombot nyomok
    Then a match találtatik és appliedCoupon értéke a kód objektuma lesz
    And a képernyő zöld üzenetet jelenít meg hogy 20% kedvezmény alkalmazva

  Scenario: Érvénytelen kupon visszautasítása
    Given a felhasználó olyan kódot ad meg, ami nincs a listában vagy used true
    When handleApplyCoupon fut
    Then appliedCoupon null értéket kap és couponStatus "invalid" lesz
    And a felhasználó piros visszajelzést kap hogy a kupon érvénytelen