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
      datae: { "player": "playerOne" },
      success : function(r) {
        console.log(r);
      }
    });
  ```
  
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
      datae: { "player": "playerTwo", "gameID": "5e07c3cc4aa7a17b47cbd6af" },
      success : function(r) {
        console.log(r);
      }
    });
  ```
  
    **Start Round**
----
  Use a gameID to start a new round of CAH.

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
      url: "/games/join",
      dataType: "json",
      type : "POST",
      datae: { "player": "playerTwo", "gameID": "5e07c3cc4aa7a17b47cbd6af" },
      success : function(r) {
        console.log(r);
      }
    });
  ```
