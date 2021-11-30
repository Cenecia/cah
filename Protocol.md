# Client-Server Websocket Protocol


## Client-To-Server Messages
The client can send the following to the server. The message must be JSON in the following format.
```json
{
    "action":       string with a valid action command,
    "player_id":    string containining the requesting player's ID,
    "payload":      request-specific object containing relevant fields
}
```

- create
    ```json
  "payload":
  {
  "gameID":   null,
  "player":   string with creating player's name,
  "sets":     [list of strings, each being a selected card set ID],
  "time_limit":   value for the time limit,
  "score_limit":  value for the score limit
  }
    ```

- join
- start_round
- hand
- submit_white
  ```json
  "payload":
  {"gameID":    string containing the game ID,
  "roundID":    string containing the round ID,
  "whiteCards": list of whiteCard objects,
  "playerID":   string containining the requesting player's ID,
  }
  ```
- select_candidate
- kick
- mulligan
  ```json
  "payload":
  {"gameID":    string containing the game ID,
  "roundID":    string containing the round ID,
  "whiteCards": list of whiteCard objects,
  "playerID":   string containining the requesting player's ID,
  }
  ```


## Server-To-Client Messages
The server can send the following to the attached clients. Generally this will be all players in a game. The message
will be in JSON format, similar to client commands.
```json
{
"action":       string with a valid action command,
"player_id":    string containining the reqesting player's ID,
"payload":      request-specific object containing relevant fields
}
```

- info 
  
    This message is an informational message from the server. No action is needed.

  - create
  
      ```json
    "payload":
    {
    "whiteCardCount":   number of white cards available,
    "blackCardCount":   number of black cards available,
    "gameID":           string containing the game ID,
    "players":          [list containing Player data],
    "owner":            string containing the player ID of the game owner
    }  
      ```

- round
- join
- update
- hand
- kick
