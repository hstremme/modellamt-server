import express from 'express';
import { Ressource } from './models/ressource.js'
import { GameState } from './models/gamestate.js'

const router = express.Router();

// TODO change to post, possibly using body instead of query (cookie for gamestate)
router.post('/ressource', async (req: express.Request, res: express.Response) => {
    if (!req.query.resId || !req.query.gameId ) {
        res.status(400).send('Parameters missing.');
        return;
    }
    const ressource = await Ressource.findById(req.query.resId);
    const gameState = await GameState.findById(req.query.gameId);
    if (ressource == null || gameState == null){
        res.status(400).send('DB entry not found.');
        return;
    }
    // Checks if the Ressource can be expanded
    if (!ressource.isExpandable && gameState.ressources.get(ressource.name)! > 0){
       res.status(500).send('Ressource not expandable.');
       return;
    }
    const newBudget = gameState.budget - ressource.price;
    const newTime = gameState.time - ressource.baseTime;
    if (newBudget <= 0){
        res.status(500).send('Not enough budget.');
        return;
    }
    try {
        const response = await GameState.updateOne({ _id: req.query.id },{ 
            budget: newBudget,
            time: newTime,
            $set: {
                [`ressources.${ressource.name}`]: gameState.ressources.get(ressource.name)! + 1
            }
        });
        console.log(response);
    } catch (e: any) {
        res.status(500).send('Updating GameState failed: ' + e);
        return;
    }
    res.send(gameState);
});

// TODO Delete
router.post('/add/ressource', async (req: express.Request, res: express.Response) => {
    const randomRes = new Ressource({ 
        name: 'Mitarbeiter', 
        info: 'Lange Information ueber die Ressource', 
        isExpandable: true, 
        price: 180, 
        baseTime: 550 
    });
    randomRes.save()
    .catch((e: any) => res.status(500).send(e))
    .then(() => res.status(200).send('Ressource added succesfully'))
});

// TODO Delete
router.post('/add/gamestate', async (req: express.Request, res: express.Response) => {
    const randomState = new GameState({ 
        budget: 5000, 
        time: 1000, 
        ressources: { 
            'Mitarbeiter': 2,
            'ScanStrecke': 1,
        },
        scenario: 2, 
    });
    randomState.save()
    .catch((e: any) => res.status(500).send(e))
    .then(() => res.status(200).send('State added succesfully'))
});

export { router as api };
