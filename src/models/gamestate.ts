import mongoose from 'mongoose';

const gameStateSchema = new mongoose.Schema({
    budget: {
        type: Number,
        required: true
    },
    time: {
        type: Number,
        required: true
    },
    ressources: {
        type: Map,
        of: Number,
        required: true
    },
    scenario: { 
        type: String,
        required: true
    }
});

export const GameState = mongoose.model('GameState', gameStateSchema);

