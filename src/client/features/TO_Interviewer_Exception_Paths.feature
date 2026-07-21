Feature: TOBI UI Unhappy path

  Scenario: Accessing Blaise via Blaise 5 User Interface: Blaise is down/not responding
    Given I am a Blaise user trying to access via TOBI
    When Blaise is down/not responding
    Then I am presented with an error message informing me that Blaise cannot be accessed Message to be displayed
    # Message Displayed
    #  Sorry, there is a problem with this service. We are working to fix the problem. Please try again later.
