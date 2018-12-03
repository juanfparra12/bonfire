var mongoose = require('mongoose');
    Schema = mongoose.Schema;

var songSchema = new Schema({
    songId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    addedBy:{
        type: String,
        required: true
    }
});

//Export the Schemas
var Song = mongoose.model('Song', songSchema);
module.exports = Song;