Feature: F02 – Háttér animációk és reszponzív töréspontok kezelése
  As a látogató
  I want the Home oldal hátterét gördülékenyen változni látni
  So that az animáció nem zavarja a navigációt

  Background:
    Given the Home komponens két motion divet renderel topBlob és bottomBlob animációval

  Scenario: Scrolloláskor a megfelelő blob pozíciók lépnek életbe
    Given the section ids Hero, Reserve, Courts, PriceList and Contact are tracked by useScrollSection
    When I scroll so that the Courts blokk kerül fókuszba
    Then the currentSection value switches to "Courts"
    And the topBlob animáció top: "25vh", left: "70vw" értékre frissül
    And the bottomBlob animáció top: "70vh", left: "-10vw" értékre frissül

  Scenario: Nem definiált szekció esetén a Hero beállításai maradnak érvényben
    Given backgroundPositions csak Hero és Courts kulcsokat tartalmaz
    When the observer egy olyan szekciót észlel, amelyhez nincs bejegyzés
    Then the motion div animációi a Hero pozícióival renderelődnek