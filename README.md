# cah - API Endpoints
**Start New Game**
----
  Start a new game of CAH. Just pass the name of Player One.

* **URL**

  /games/new

* **Method:**

  `POST`
  

* **Data Params**

  { player: "playerName" }

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** 
    ```javascript
    {
      status: "success",
      data: {
        whiteCardCount: 1589,
        blackCardCount: 419,
        gameID: "5e07c3cc4aa7a17b47cbd6af",
        players: ["5e07c3cc4aa7a17b47cbd6ae"]
      }
    }
    ```
 

* **Sample Call:**

  ```javascript
    $.ajax({
      url: "/games/new",
      dataType: "json",
      type : "POST",
      data: { "player": "playerOne" },
      success : function(r) {
        console.log(r);
      }
    });
  ```
----  
**Join Game**
----
  Use a gameID to join an existing game of CAH. Need to pass new PlayerName.

* **URL**

  /games/join

* **Method:**

  `POST`
  

* **Data Params**

  { player: "playerName", gameID: "5e07c3cc4aa7a17b47cbd6af" }

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** 
    ```javascript
    {
      status: "success",
      data: {
        whiteCardCount: 1589,
        blackCardCount: 419,
        gameID: "5e07c3cc4aa7a17b47cbd6af",
        players: ["5e07c3cc4aa7a17b47cbd6ae","5e07c3cc4aa7a17b47cbd6f4"]
      }
    }
    ```
 

* **Sample Call:**

  ```javascript
    $.ajax({
      url: "/games/join",
      dataType: "json",
      type : "POST",
      data: { "player": "playerTwo", "gameID": "5e07c3cc4aa7a17b47cbd6af" },
      success : function(r) {
        console.log(r);
      }
    });
  ```
----  
**Start Round**
----
  Use a gameID to start a new round of CAH. Initial status of a round is 'Submit'

* **URL**

  /games/startRound

* **Method:**

  `POST`
  

* **Data Params**

  { gameID: "5e07c3cc4aa7a17b47cbd6af" }

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** 
    ```javascript
    {
      "status": "success",
      "data": {
          "players": [
              "5e07c3cc4aa7a17b47cbd6ae"
          ],
          "submittedWhiteCards": [],
          "_id": "5e07c3e94aa7a17b47cbd6b0",
          "status": "submit",
          "game": "5e07c3cc4aa7a17b47cbd6af",
          "blackCard": {
              "_id": "5e043a47715a062a629199f8",
              "set": "5e041b3b9a8f6226d6bebe73",
              "text": "The healing process began when I joined a support group for victims of _.",
              "pick": 1,
              "__v": 0
          },
          "__v": 0
      }
    }
    ```
 

* **Sample Call:**

  ```javascript
    $.ajax({
      url: "/games/startRound",
      dataType: "json",
      type : "POST",
      data: { "gameID": "5e07c3cc4aa7a17b47cbd6af" },
      success : function(r) {
        console.log(r);
      }
    });
  ```
----  
**Get Hand**
----
  Pass your playerID and get your current hand of White Cards.

* **URL**

  /games/getHand

* **Method:**

  `POST`
  

* **Data Params**

  { playerID: "5e07c3cc4aa7a17b47cbd6ae" }

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** 
    ```javascript
    {
      "status": "success",
      "data": {
          "hand": [
              {
                  "_id": "5e043a45715a062a629194c7",
                  "set": "5e041b3b9a8f6226d6bebe6d",
                  "text": "Founding a major world religion.",
                  "__v": 0
              },
              {
                  "_id": "5e043a45715a062a6291939e",
                  "set": "5e041b3b9a8f6226d6bebe65",
                  "text": "A floor that is literally made of lava.",
                  "__v": 0
              },
              {
                  "_id": "5e043a46715a062a6291970c",
                  "set": "5e041b3b9a8f6226d6bebe74",
                  "text": "Good grammar.",
                  "__v": 0
              },
              {
                  "_id": "5e043a46715a062a62919766",
                  "set": "5e041b3b9a8f6226d6bebe72",
                  "text": "Slapping an old lady.",
                  "__v": 0
              },
              {
                  "_id": "5e043a47715a062a629198f8",
                  "set": "5e041b3b9a8f6226d6bebe76",
                  "text": "Pac-Man uncontrollably guzzling (expletive).",
                  "__v": 0
              },
              {
                  "_id": "5e043a46715a062a629194e3",
                  "set": "5e041b3b9a8f6226d6bebe72",
                  "text": "A spontaneous conga line.",
                  "__v": 0
              },
              {
                  "_id": "5e043a47715a062a629199bd",
                  "set": "5e041b3b9a8f6226d6bebe76",
                  "text": "An icepick lobotomy.",
                  "__v": 0
              },
              {
                  "_id": "5e043a45715a062a629193c2",
                  "set": "5e041b3b9a8f6226d6bebe74",
                  "text": "Media coverage.",
                  "__v": 0
              }
          ],
          "_id": "5e07c3cc4aa7a17b47cbd6ae",
          "name": "playerOne",
          "__v": 1
       }
    }
    ```
 

* **Sample Call:**

  ```javascript
    $.ajax({
      url: "/games/getHand",
      dataType: "json",
      type : "POST",
      data: { playerID: "5e07c3cc4aa7a17b47cbd6ae" },
      success : function(r) {
        console.log(r);
      }
    });
  ```
----
**Submit White Card**
----
  Submit a White Card from your hand to a round. Returns the status of that round after White Card is added. When all players have submitted a white card the round's status is set to 'select'.

* **URL**

  /games/submitWhiteCard

* **Method:**

  `POST`
  

* **Data Params**

  { "roundID": "5e07c3e94aa7a17b47cbd6b0", "whiteCard": "5e043a46715a062a629197bf",	"playerID": "5e07c3cc4aa7a17b47cbd6ae" }

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** 
    ```javascript
    {
      "status": "success",
      "data": {
          "players": [
              "5e07c3cc4aa7a17b47cbd6ae"
          ],
          "submittedWhiteCards": [
              "5e043a45715a062a629194c7"
          ],
          "_id": "5e07c3e94aa7a17b47cbd6b0",
          "status": "submit",
          "game": "5e07c3cc4aa7a17b47cbd6af",
          "blackCard": "5e043a47715a062a629199f8",
          "__v": 1
      }
    }
    ```
 

* **Sample Call:**

  ```javascript
    $.ajax({
      url: "/games/submitWhiteCard",
      dataType: "json",
      type : "POST",
      data: { "roundID": "5e07c3e94aa7a17b47cbd6b0", "whiteCard": "5e043a46715a062a629197bf",	"playerID": "5e07c3cc4aa7a17b47cbd6ae" },
      success : function(r) {
        console.log(r);
      }
    });
  ```
  
  ----
**Select Black Card**
----
  Selects a White Card as the winner of the round. Sets the status of the round to 'Closed'

* **URL**

  /games/selectBlackCard

* **Method:**

  `POST`
  

* **Data Params**

  { "roundID": "5e07c3e94aa7a17b47cbd6b0" }

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** 
    ```javascript
    {
      "status": "success",
      "data": {
          "players": [
              "5e07c3cc4aa7a17b47cbd6ae"
          ],
          "submittedWhiteCards": [
              "5e043a45715a062a629194c7"
          ],
          "_id": "5e07c3e94aa7a17b47cbd6b0",
          "status": "closed",
          "game": "5e07c3cc4aa7a17b47cbd6af",
          "blackCard": "5e043a47715a062a629199f8",
          "__v": 1
      }
    }
    ```
 

* **Sample Call:**

  ```javascript
    $.ajax({
      url: "/games/selectBlackCard",
      dataType: "json",
      type : "POST",
      data: { "roundID": "5e07c3e94aa7a17b47cbd6b0" },
      success : function(r) {
        console.log(r);
      }
    });
  ```
