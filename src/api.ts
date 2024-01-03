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
        const filter = { '_id': req.query.gameId as string};
        await GameState.updateOne( filter,{ 
            budget: newBudget,
            time: newTime,
            $set: {
                [`ressources.${ressource.name}`]: gameState.ressources.get(ressource.name)! + 1
            }
        });
    } catch (e: any) {
        res.status(500).send('Updating GameState failed: ' + e);
        return;
    }
    res.status(200).send({newBudget});
});

router.delete('/ressource', async (req: express.Request, res: express.Response) => {
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
    if (gameState.ressources.get(ressource.name)! < 1){
       res.status(500).send('Ressource not existing.');
       return;
    }
    const newBudget = gameState.budget + ressource.price;
    const newTime = gameState.time + ressource.baseTime;
    try {
        const filter = { '_id': req.query.gameId as string};
        await GameState.updateOne( filter,{ 
            budget: newBudget,
            time: newTime,
            $set: {
                [`ressources.${ressource.name}`]: gameState.ressources.get(ressource.name)! - 1
            }
        });
    } catch (e: any) {
        res.status(500).send('Updating GameState failed: ' + e);
        return;
    }
    res.status(200).send({newBudget});
});

router.get('/gamestate', async (req: express.Request, res: express.Response) => {
    if (!req.query.gameId){
        res.status(400).send('Params missing.');
        return;
    }
    try {
        const gameState = await GameState.findById(req.query.gameId);
        if (gameState == null){
            res.status(400).send('Entry not found');
            return;
        }
        res.status(200).send(gameState);
    } catch (e) {
        res.status(500).send('DB Query failed: ' + e);
    }
});

export { router as api };
