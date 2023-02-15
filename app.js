const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3003, () => {
      console.log("Server Running at http://localhost:3003/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayersData = `
    SELECT 
    * 
    FROM 
    cricket_team 
    ORDER BY 
    player_id 
    `;
  const playersData = await db.all(getPlayersData);
  response.send(
    playersData.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { player_id, player_name, jersey_number, role } = playerDetails;
  const addPlayerDetails = `
  INSERT INTO 
  cricket_team 
  (player_id, player_name, jersey_number, role)
  VALUES (
      ${player_id},
      ${player_name},
      ${jersey_number},
      ${role},
  )
  `;
  const dbResponse = await db.run(addPlayerDetails);
  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayersData = `
    SELECT 
    * 
    FROM 
    cricket_team 
    WHERE
    player_id = ${playerId}
    `;
  const playersData = await db.all(getPlayersData);
  response.send(
    playersData.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { player_id, player_name, jersey_number, role } = playerDetails;
  const updatePlayerDetails = `
  UPDATE
  cricket_team 
  SET
     player_id = ${player_id},
     player_name =  ${player_name},
     jersey_number = ${jersey_number},
     role =  ${role},
  WHERE player_id = ${playerId}
  `;
  const playersData = await db.run(updatePlayersData);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayersData = `
    DELETE FROM 
    cricket_team 
    WHERE
    player_id = ${playerId}
    `;
  const playersData = await db.run(deletePlayersData);
  response.send("Player Removed");
});

module.exports = app;
