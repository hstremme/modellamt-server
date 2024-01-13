import express from "express";
import mongoose from "mongoose";
import { Ressource } from "./models/ressource.js";
import { GameState } from "./models/gamestate.js";
import { Scenario } from "./models/scenario.js";

const router = express.Router();

// TODO change to post, possibly using body instead of query (cookie for gamestate)
router.post(
  "/ressource",
  async (req: express.Request, res: express.Response) => {
    const ressourceId = req.query.resId;
    const gameId = req.cookies["gameId"];
    if (!ressourceId || !gameId) {
      res.status(400).send("Parameters missing.");
      return;
    }
    var ressource: any;
    var gameState: any;
    try {
      ressource = await Ressource.findById(ressourceId);
      gameState = await GameState.findById(gameId);
    } catch (e) {
      res.status(500).send("db query failed: " + e);
      return;
    }
    if (ressource == null || gameState == null) {
      res.status(400).send("DB entry not found.");
      return;
    }
    // Checks if the Ressource can be expanded
    if (
      !ressource.isExpandable &&
      gameState.ressources.get(ressource.name)! > 0
    ) {
      res.status(240).send("Ressource not expandable.");
      return;
    }
    const newBudget = gameState.budget - ressource.price;
    const newTime = gameState.time - ressource.baseTime;
    if (newBudget <= 0) {
      res.status(250).send("Not enough budget.");
      return;
    }
    try {
      const filter = { _id: gameId as string };
      await GameState.updateOne(filter, {
        budget: newBudget,
        time: newTime,
        $set: {
          [`ressources.${ressource.name}`]:
            gameState.ressources.get(ressource.name)! + 1,
        },
      });
    } catch (e: any) {
      res.status(500).send("Updating GameState failed: " + e);
      return;
    }
    res.status(200).send({ newBudget });
  },
);

router.delete(
  "/ressource",
  async (req: express.Request, res: express.Response) => {
    const ressourceId = req.query.resId;
    const gameId = req.cookies["gameId"];
    if (!ressourceId || !gameId) {
      res.status(400).send("Parameters missing.");
      return;
    }
    var ressource: any;
    var gameState: any;
    try {
      ressource = await Ressource.findById(ressourceId);
      gameState = await GameState.findById(gameId);
    } catch (e) {
      res.status(500).send("db query failed: " + e);
      return;
    }
    if (ressource == null || gameState == null) {
      res.status(400).send("DB entry not found.");
      return;
    }
    // Checks if the Ressource can be expanded
    if (gameState.ressources.get(ressource.name)! < 1) {
      res.status(240).send("Ressource not existing.");
      return;
    }
    const newBudget = gameState.budget + ressource.price;
    const newTime = gameState.time + ressource.baseTime;
    try {
      const filter = { _id: gameId as string };
      await GameState.updateOne(filter, {
        budget: newBudget,
        time: newTime,
        $set: {
          [`ressources.${ressource.name}`]:
            gameState.ressources.get(ressource.name)! - 1,
        },
      });
    } catch (e: any) {
      res.status(500).send("Updating GameState failed: " + e);
      return;
    }
    res.status(200).send({ newBudget });
  },
);

router.get(
  ["/scenario", "/ressource", "/gamestate"],
  async (req: express.Request, res: express.Response) => {
    const scenName = req.query.scenario;
    const ressourceId = req.query.resId;
    const gameId = req.cookies["gameId"];
    if (!scenName && !ressourceId && !gameId) {
      res.status(400).send("Parameter missing.");
      return;
    }
    try {
      var entry: any;
      const path = req.url.split("?")[0];
      switch (path) {
        case "/scenario":
          entry = await Scenario.findOne({ name: scenName });
          break;
        case "/ressource":
          entry = await Ressource.findById(ressourceId);
          break;
        case "/gamestate":
          entry = await GameState.findById(gameId);
          break;
      }
      if (entry == null) {
        res.status(400).send("Entry not found");
        return;
      }
      res.status(200).send(entry);
    } catch (e) {
      res.status(500).send("DB query failed: " + e);
    }
  },
);

router.post("/init", async (req: express.Request, res: express.Response) => {
  const scenName = req.query.scenario;
  if (!scenName) {
    res.status(400).send("Params missing.");
    return;
  }
  try {
    const scenario = await Scenario.findOne({ name: scenName });
    if (scenario == null) {
      res.status(500).send("Entry not found");
      return;
    }
    const id = new mongoose.Types.ObjectId();
    const gameState = new GameState({
      _id: id,
      budget: scenario.budget,
      time: scenario.time,
      ressources: {
        Mitarbeiter: 0,
        ScanStrecke: 0,
        FrontOffice: 0,
      },
      scenario: scenName,
    });
    await gameState.save();
    res.cookie("gameId", id.toString());
    res.status(200).send({ budget: scenario.budget, time: scenario.time });
  } catch (e) {
    res.status(500).send("db query failed: " + e);
  }
});

export { router as api };
