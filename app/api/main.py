import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from ..models.prediction_engine import NFLPredictionEngine

app = FastAPI()

engine = NFLPredictionEngine()

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/games")
def get_games():
    try:
        with open("../data/production/upcoming-games.json", "r") as f:
            games = json.load(f)
        return games
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Upcoming games file not found.")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Error decoding game data.")

@app.get("/api/games/{game_id}")
def get_game_details(game_id: str):
    try:
        with open("../data/production/upcoming-games.json", "r") as f:
            games = json.load(f)
        for game in games:
            if game.get("game_id") == game_id:
                # Add predictions to the game details
                predictions = engine.predict_game(game['home_team'], game['away_team'])
                game['predictions'] = predictions
                return game
        raise HTTPException(status_code=404, detail="Game not found.")
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Upcoming games file not found.")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Error decoding game data.")

@app.get("/api/player-props")
def get_player_props():
    try:
        with open("../data/player-props.json", "r") as f:
            data = json.load(f)
        return data
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Player props file not found.")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Error decoding player props data.")

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=3001, reload=True) 