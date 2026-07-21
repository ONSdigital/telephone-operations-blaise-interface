Feature: TOBI UI

  # Scenario 1
  Scenario: View live survey list in TOBI
    Given I am a Telephone Operations TO Interviewer
    When I launch TOBI
    Then I will be able to view all live surveys with questionnaires loaded in Blaise, identified by their three letter acronym TLA, i.e. OPN, LMS

  # Scenario 2
  Scenario: Select survey
    Given I can view a list of surveys on Blaise within TOBI
    When I select the survey I am working on
    Then I am presented with a list of active questionnaires to be worked on that day for that survey, i.e. within the the survey period start and end dates
    And listed in order with latest installed questionnaire first

  # Scenario 3a
  @integration
  Scenario: Select questionnaire
    Given I can view a list of live questionnaires for the survey I am allocated to
    When I select a link to interview against the questionnaire with the survey dates I am working on
    Then I am presented with the Blaise log in

  # Scenario 3b
  @server
  Scenario: Show surveys that have a TelOps start date of today and an active survey day in TOBI
    Given a survey questionnaire has a TelOps start date of today
    And an active survey day
    When I select the survey I am working on
    Then I will see that questionnaire listed for the survey

  @server
  Scenario: Show surveys that have a TelOps start date in the past and an active survey day in TOBI
    Given a survey questionnaire has a TelOps start date in the past
    And an active survey day
    When I select the survey I am working on
    Then I will see that questionnaire listed for the survey

  @server
  Scenario: Do not show surveys that have an active survey day but TelOps start date in the future in TOBI
    Given a survey questionnaire has a TelOps start date is in the future
    And an active survey day
    When I select the survey I am working on
    Then I will not see that questionnaire listed for the survey

  @server
  Scenario: Do not show surveys that have a TelOps start date in the past but no active survey day in TOBI
    Given a survey questionnaire has a TelOps start date in the past
    And does not have an active survey day
    When I select the survey I am working on
    Then I will not see that questionnaire listed for the survey

  @server
  Scenario: Show surveys that do not have a TelOps start date but have an active survey day in TOBI
    Given a survey questionnaire does not have a TelOps start date
    And an active survey day
    When I select the survey I am working on
    Then I will see that questionnaire listed for the survey

  @server
  Scenario: Do not show surveys that do not have a TelOps start date and do not have an active survey day in TOBI
    Given a survey questionnaire does not have a TelOps start date
    And does not have an active survey day
    When I select the survey I am working on
    Then I will not see that questionnaire listed for the survey

  # Scenario 3c
  Scenario: Return to select survey
    Given I have selected a survey
    When I do not see the questionnaire that I am working on
    Then I am able to go back to view the list of surveys

  # Scenario 4
  @integration
  Scenario: Accessing questionnaire data entry
    Given I am a TO Interviewer that has been presented with the Blaise log in
    When I enter my credentials
    Then I am presented with a case in the daybatch of the selected survey
