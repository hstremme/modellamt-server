import mongoose from 'mongoose';

const ressourceSchema = new mongoose.Schema({
    name: String,
    info: String,
    isExpandable: Boolean,
    price: Number,
    baseTime: Number
});

export const Ressource = new mongoose.Model('Ressource', ressourceSchema);

