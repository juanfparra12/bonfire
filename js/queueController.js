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
const Queue    = require('./queueSchema.js');
const Song     = require('./songSchema.js');


var data;
// Creates queue
exports.create = function(req, res){
    var accessToken = req.query.access_token;
    var refreshToken = req.query.refresh_token;

    var queueJson = {
        "accessToken" : accessToken,
        "refreshToken" : refreshToken 
    };

    var query = Queue.where({refreshToken:refreshToken});
    
    // Queries to find if user already has an existing queue
    query.find(function(err,queue){
        if(err){
            console.log(err);
            res.send(err);
        }else{
            // If queue is NULL, then create the new playlist 
            if(queue == ""){
                var queue = new Queue(queueJson);
                queue.save(function(err){
                    if(err){
                        console.log(err);
                        res.status(400).send(err);
                    }else{
                        res.status(200).json(queue);
                    }
                });
            
            }// If queue exists, then new queue is not created
            else{
                res.send("Account already has a playlist");
            }
        }
    });

};

// PUT: Update Queue with CreatorID
exports.updateCreator = (req,res) => {
    var _id = req.query.id;
    var creatorName = req.query.creator;

    Queue.findOneAndUpdate({_id:_id}, {$set:{creator: creatorName}}, {new:true}, (error,doc)=>{
        if(error){
            console.log(error);
            res.send(error);
        }else{
            res.status(200).send(doc);
        }
    });
}

// PUT: Update Queue with Playlist ID
exports.updatePlaylistId = (req,res) => {
    var _id = req.query.id;
    var playlist_id = req.query.playlist_id;

    Queue.findOneAndUpdate({_id:_id}, {$set:{playlistId : playlist_id}}, {new:true}, (error,doc)=>{
        if(error){
            console.log(error);
            res.send(error);
        }else{
            res.status(200).send(doc);
        }
    });
}

// PUT: Update Queue with Playlist URI
exports.updatePlaylistURI = (req,res) => {
    var _id = req.query.id;
    var playlist_uri = req.query.playlist_uri;

    Queue.findOneAndUpdate({_id:_id}, {$set:{playlistURI : playlist_uri}}, {new:true}, (error,doc)=>{
        if(error){
            console.log(error);
            res.send(error);
        }else{
            res.status(200).send(doc);
        }
    });
}

// PUT: Update Queue with Device ID
exports.updateDeviceId = (req,res) => {
    var _id = req.query.id;
    var device_id = req.query.device_id;
        
    Queue.findOneAndUpdate({_id:_id}, {$set:{deviceId : device_id}}, {new:true}, (error,doc)=>{
        if(error){
            console.log(error);
            res.send(error);
        }else{
            res.status(200).send(doc);
        }
    });
}

//Searches Queue by CreatorID
exports.get = function(req, res){
    var id = req.query.id;
    var query = Queue.where({_id:id});
    query.find(function(err, queue){
        if(err){
            console.log(err);
            res.status(400).send(err);
        }else{
            res.status(200).json(queue);
        }
    });
}

// Delete Queue
exports.delete = function(req, res){
    var id = req.query.id;
    var query = Queue.where({_id:id});
    query.findOneAndRemove(function(err, queue){
        if(err){
            console.log(err);
            res.status(400).send(err);
        }else{
            res.status(200).json(queue);
        }
    });
}


// Song Controls

// Update queue with songs
// Requires CreatorID, songId, songName, and addedBy name
exports.addSong = function(req, res){
    var id = req.query.id;
    var songId = req.query.songId;
    var songName = req.query.songName;
    var addedBy = req.query.addedBy;

    var song = new Song(
        {
            "songId" : songId,
            "name" : songName,
            "addedBy" : addedBy
        }
    );
    console.log(song);
    // // Check if player already has a playlist
    Queue.findOne({_id:id}, (err, queue) => {
        if(err){
            console.log(err);
            res.status(400).send(err);
        }else{
            // If creator exists
            if(queue != null){
                var data = queue.songs;
                data.push(song);
                // res.send(data);
                Queue.findOneAndUpdate({_id:id}, {$set:{songs:data}}, {new:true}, (error,doc)=>{
                    if(err){
                        console.log(err);
                        res.send(err);
                    }else{
                        res.status(200).send(doc);
                    }
                });
            }else{
                res.status(404).send("Creator does not exist");
            }
        }
    });
};

// GET: Obtains next song information
exports.playNextSong = (req, res)=>{
    var id = req.query.id;

    // // Check if player already has a playlist
    Queue.findOne({_id:id}, (err, queue) => {
        if(err){
            console.log(err);
            res.status(400).send(err);
        }else{
            // If creator exists
            if(queue != null){
                var data = queue.songs;
                var song = data[0];                
                data.shift();

                Queue.findOneAndUpdate({_id:id}, {$set:{songs:data}}, {new:true}, (error,doc)=>{
                    if(err){
                        console.log(err);
                        res.send(err);
                    }else{
                        res.status(200).send(song);
                    }
                });
            }else{
                res.status(404).send("Creator does not exist");
            }
        }
    });
}

// DELETE: Obtains next song information
exports.deleteSong = (req, res)=>{
    var id = req.query.id;

    // // Check if player already has a playlist
    Queue.findOne({_id:id}, (err, queue) => {
        if(err){
            console.log(err);
            res.status(400).send(err);
        }else{
            var songId = req.query.song_id;
            // If creator exists
            if(queue != null){
                var data = queue.songs;
                var song = "";
                for(var i = 0; i < data.length; i++){
                    if(songId == data[i].songId){
                        song = data[i];
                        data.splice(i, 1);
                    }
                }  

                Queue.findOneAndUpdate({_id:id}, {$set:{songs:data}}, {new:true}, (error,doc)=>{
                    if(err){
                        console.log(err);
                        res.send(err);
                    }else{
                        res.status(200).send(song);
                    }
                });
            }else{
                res.status(404).send("Creator does not exist");
            }
        }
    });
}

