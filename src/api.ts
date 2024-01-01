import express from 'express';
import { Ressource } from './models/ressource.js'

const router = express.Router();

router.post('/ressource', async (req: express.Request, res: express.Response) => {
    if (req.body.resId == null || req.body.gameId == null) {
        res.status(400).send('Parameters missing.');
        return;
    }
    const query = await Ressource.findById(req.body.resId);
    res.send(query);
})


