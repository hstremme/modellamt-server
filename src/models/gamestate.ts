import mongoose from 'mongoose';

const gameStateSchema = new mongoose.Schema({
    budget: Number,
    time: Number,
    ressources: Map,
    scenario: Number
});

export const GameState = new mongoose.Model('GameState', gameStateSchema);

