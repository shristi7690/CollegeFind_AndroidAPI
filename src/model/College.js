const mongoose = require('mongoose');
const validator = require('validator');

const collegeSchema = mongoose.Schema({
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        imgString: {
            type: String,
            required: true
        },
        collegeFees: {
            type: String,
            required: true,
            trim: true
        },
        type: {
            type: String,
            required: true,
            trim: true
        },
        status: {
            type: String,
            required: true,
            trim:true,
            lowercase: true
        },
        locationCoordinates: {
            type: String,
            required: true,
            trim: true
        },
        savedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
    },
    {timestamps: true});

const College = mongoose.model('College', collegeSchema);

module.exports = College;
