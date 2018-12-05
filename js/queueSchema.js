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
/*
var playlistId = req.query.playlist_id;
var playlistURI = req.query.playlist_uri;
var deviceId = req.query.device_id;
var accessToken = req.query.access_token;
var refreshToken = req.query.refresh_token;
*/
const queueSchema = new Schema({
    queueId: {
        type: String,
        require: false
    },
    playlistId: {
        type: String,
        required: false
    },
    playlistURI: {
        type: String,
        required: false
    },
    creator: {
        type: String,
        required: false
    },
    deviceId: {
        type:String,
        required: false
    },
    accessToken:{
        type: String,
        required: true
    },
    refreshToken:{
        type: String,
        required: true
    },
    songs:{
        type: Array,
        required: false
    }
});

//Export the Schemas
const Queue    = mongoose.model('Queue', queueSchema);
module.exports = Queue;