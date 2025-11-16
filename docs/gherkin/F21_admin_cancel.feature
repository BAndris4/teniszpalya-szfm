Feature: F21 – Foglalás törlése admin által
  As an admin
  I want to törölni szabálytalan vagy ütköző foglalásokat
  So that felszabadítsam az idősávokat

  Background:
    Given a ReservationsTab soronként Delete gombot jelenít meg és ConfirmResponsePopup dialógust használ

  Scenario: Törlés megerősítése eltávolítja a sort
    Given I egy sor Delete gombjára kattintok
    When a megerősítő párbeszéd megjelenik és jóváhagyom
    Then DELETE kérés megy a "/api/Reservations/{id}" végpontra
    And sikeres válasz esetén a sor eltűnik és success popup jelenik meg

  Scenario: Backend hiba esetén hibaüzenet érkezik
    Given a törlés kísérlete 500-as hibát ad vissza
    When a fetch res.ok hamis értéket ad
    Then egy alert jelzi hogy a törlés sikertelen maradt és a sor a listában marad