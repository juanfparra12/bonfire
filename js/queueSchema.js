var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
/*
var playlistId = req.query.playlist_id;
var playlistURI = req.query.playlist_uri;
var deviceId = req.query.device_id;
var accessToken = req.query.access_token;
var refreshToken = req.query.refresh_token;
*/
var queueSchema = new Schema({
    playlistId: {
        type: String,
        required: true
    },
    playlistURI: {
        type: String,
        required: true
    },
    creator: {
        type: String,
        required: true
    },
    deviceId: {
        type:String,
        required:true
    },
    accessToken:{
        type: String,
        required:true
    },
    refreshToken:{
        type: String,
        required: true
    },
    songs:{
        type: Array,
        required:false
    }
});

//Export the Schemas
var Queue = mongoose.model('Queue', queueSchema);
module.exports = Queue;