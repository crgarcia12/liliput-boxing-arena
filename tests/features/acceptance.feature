Feature: 2D Browser Boxing Game

  Scenario: Canvas renders boxing ring with fighters
    Given the game page is loaded
    When the canvas initializes
    Then the boxing ring background is visible
    And the player boxer sprite is positioned on the left side
    And the opponent boxer sprite is positioned on the right side

  Scenario: Player executes jab attack
    Given the game is in PLAYING state
    And player stamina is at 100
    When the player presses J key
    Then the player sprite plays jab animation
    And player stamina decreases by 10
    And opponent health decreases by 5 if in range

  Scenario: Player executes hook attack
    Given the game is in PLAYING state
    And player stamina is at 100
    When the player presses H key
    Then the player sprite plays hook animation
    And player stamina decreases by 20
    And opponent health decreases by 15 if in range
    And opponent enters staggered state for 1000ms if hit

  Scenario: Player performs footwork with i-frames
    Given the game is in PLAYING state
    And player stamina is at 100
    When the player presses F key
    Then the player sprite moves laterally 50 pixels
    And player stamina decreases by 15
    And player is invulnerable for 300ms
    And opponent punches do not connect during invulnerability

  Scenario: Stamina regenerates over time
    Given the game is in PLAYING state
    And player stamina is at 50
    When 1 second passes without player actions
    Then player stamina increases to 70

  Scenario: Actions blocked when stamina insufficient
    Given the game is in PLAYING state
    And player stamina is at 5
    When the player presses H key
    Then the hook action does not execute
    And player stamina remains at 5

  Scenario: AI opponent throws punches autonomously
    Given the game is in PLAYING state
    When 3 seconds elapse
    Then the AI opponent has thrown at least 2 punches
    And punches are a mix of jabs and hooks

  Scenario: HUD displays real-time stats
    Given the game is in PLAYING state
    When player health is 80 and opponent health is 60
    Then the player health bar shows 80% filled
    And the opponent health bar shows 60% filled
    And the stamina bar reflects current player stamina percentage

  Scenario: Stagger effect prevents opponent actions
    Given the opponent is in normal state
    When the player lands a hook on the opponent
    Then the opponent enters staggered state
    And the opponent cannot throw punches for 1000ms
    And the opponent sprite displays stagger animation

  Scenario: Player wins when opponent health depleted
    Given the game is in PLAYING state
    And opponent health is at 10
    When the player lands a hook dealing 15 damage
    Then opponent health drops to 0
    And the game state changes to GAMEOVER
    And "You Win!" message is displayed
    And a restart button is visible

  Scenario: Player loses when own health depleted
    Given the game is in PLAYING state
    And player health is at 8
    When the AI opponent lands a jab dealing 10 damage
    Then player health drops to 0
    And the game state changes to GAMEOVER
    And "You Lose!" message is displayed
    And a restart button is visible

  Scenario: Restart button resets the match
    Given the game is in GAMEOVER state
    When the player clicks the restart button
    Then the game state changes to PLAYING
    And both fighters have 100 health
    And player stamina is at 100
    And fighters are repositioned to starting positions
