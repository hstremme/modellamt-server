import mongoose from 'mongoose';

const ressourceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    info: {
        type: String,
        required: true
    },
    isExpandable: {
        type: Boolean,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    baseTime: {
        type: Number,
        required: true
    }
});

export const Ressource = mongoose.model('Ressource', ressourceSchema);

