import mongoose from 'mongoose';

const scenarioSchema = new mongoose.Schema({
    budget: {
        type: Number,
        required: true
    },
    time: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    }
});

export const Scenario = mongoose.model('Scenario', scenarioSchema);

