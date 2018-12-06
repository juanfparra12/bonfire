/* * * * * * * * * * * * * * * *
 * BONFIRE - A Live Music Queue
 * Authors:
 *    Gianne Flores
 *    Juan Parra
 *    Jose Torres
 *    Ryan Zeng
 * 
 * UF Web Apps - Fall 2018
 */ 

const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const songSchema = new Schema({
    songId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    artistName:{

    },
    addedBy:{
        type: String,
        required: true
    },
    trackURI:{
        type: String,
        required: true
    }
});

//Export the Schemas
const Song     = mongoose.model('Song', songSchema);
module.exports = Song;