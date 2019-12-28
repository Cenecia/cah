# cah
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
