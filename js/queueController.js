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
    var name = req.query.creator;
    var playlistId = req.query.playlist_id;
    var playlistURI = req.query.playlist_uri;
    var deviceId = req.query.device_id;
    var accessToken = req.query.access_token;
    var refreshToken = req.query.refresh_token;

    var queueJson = 
    {
        "playlistId" : playlistId,
        "playlistURI" : playlistURI,
        "creator": name,
        "deviceId": deviceId,
        "accessToken" : accessToken,
        "refreshToken" : refreshToken 
    }

    var query = Queue.where({creator:name});
    
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
                        res.json(queue);
                    }
                });
            
            }// If queue exists, then new queue is not created
            else{
                res.send("Account already has a playlist");
            }
        }
    });

};

//Searches Queue by CreatorID
exports.get = function(req, res){
    var name = req.query.creator;
    var query = Queue.where({creator:name});
    query.find(function(err, queue){
        if(err){
            console.log(err);
            res.status(400).send(err);
        }else{
            res.json(queue);
        }
    });
}

// Delete Queue
exports.delete = function(req, res){
    var creatorName = req.query.creator;
    var query = Queue.where({creator:creatorName});
    query.findOneAndRemove(function(err, queue){
        if(err){
            console.log(err);
            res.status(400).send(err);
        }else{
            res.json(queue + " has been removed");
        }
    });
}

// Update queue with songs
// Requires CreatorID, songId, songName, and addedBy name
exports.addSong = function(req, res){
    var creatorName = req.query.creator;
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

    // // Check if player already has a playlist
    Queue.findOne({creator:creatorName}, (err, queue) => {
        if(err){
            console.log(err);
            res.status(400).send(err);
        }else{
            // If creator exists
            if(queue != null){
                var data = queue.songs;
                data.push(song);
                // res.send(data);
                Queue.findOneAndUpdate({creator:creatorName}, {$set:{songs:data}}, {new:true}, (error,doc)=>{
                    if(err){
                        console.log(err);
                        res.send(err);
                    }else{
                        res.send(doc);
                    }
                });
            }else{
                res.send("Creator does not exist");
            }
        }

        
    });
  
};