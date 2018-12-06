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
const session       = require('express-session');

const multer        = require('multer'); 
const passport      = require('passport');
const express       = require('express'); // Express web server framework
const request       = require('request'); // "Request" library
const cors          = require('cors');
const cookieParser  = require('cookie-parser');
const queue         = require('./js/queueController.js');
const mongoose      = require('mongoose');
const bodyParser    = require('body-parser');
const stateKey      = 'spotify_auth_state';
const accTokenKey   = 'spotify_acc_token';
const refTokenKey   = 'spotify_ref_token';
const queueIdKey    = 'bonfire_queue_id';
const devIdKey      = 'bonfire_dev_id'; 
const client_id     = '8aa11aaababa4e6c968030e37d1540a5'; // client id
const client_secret = '95b7bbc7b3a442e9b5885a8d5d1106b9'; // secret
const redirect_uri  = 'http://localhost:8080/callback/';   // redirect uri


const scope         = 'user-read-recently-played user-follow-read user-modify-playback-state user-library-read user-library-modify user-top-read user-read-private playlist-read-collaborative playlist-read-private app-remote-control user-read-currently-playing user-read-email user-read-playback-state playlist-modify-public playlist-modify-private';


//Cookie-Generator
const generateRandomString = (length) => {
    var   text     = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
};
exports.generateRandomString = generateRandomString;
//Create server
const app = express();
app.listen(process.env.PORT || 8080);



//Set html directory, cors, cookieParser
app.use(express.static(__dirname + '/html'))
   .use(express.static(__dirname))
   .use(cors())
   .use(cookieParser())
   .use(bodyParser.json())
   .use(bodyParser.urlencoded({ extended: true }))
   .use(session({
    secret: 'this is the secret',
    resave: true,
    saveUninitialized: true
    }))
   .use(passport.initialize())
   .use(passport.session());
   
console.log('url' + __dirname);
multer();

require("./app/app.js")(app);


// Routing for queues
app.route('/queue')
  .post(queue.create)
  .get(queue.get)
  .put(queue.addSong)
  .delete(queue.delete);


// PUT: Update Queue with CreatorID, Playlist ID, Playlist URI, & Device ID
app.put('/queue/update/creator', queue.updateCreator);
app.put('/queue/update/playlist_id', queue.updatePlaylistId);
app.put('/queue/update/playlist_uri', queue.updatePlaylistURI);
app.put('/queue/update/device_id', queue.updateDeviceId);
app.put('/queue/update/queue_id', queue.updateQueueId);

// SONG Controller
app.get('/queue/songs', queue.playNextSong);
app.delete('/queue/songs', queue.deleteSong);

// Connect to database
mongoose.connect("mongodb://admin:webapps7@ds239557.mlab.com:39557/bonfire-queue", {useNewUrlParser:true});

const create_queue = (access_token, refresh_token, res, red_url) => {
    const url = 'http://localhost:8080/queue' +
                '?access_token='  + access_token +
                '&refresh_token=' + refresh_token;

    const options = {
        url: url,
        json: true
    };
    
    request.post(options, (error, response, body) => {
        if (!error && response.statusCode === 200) { 
            console.log(body); 
            res.cookie(queueIdKey, body.queueId, { secure: false });
            res.redirect(302, red_url); 
        };
    });


}

//GET: /login 
app.get('/login', (req, res) => {
    const state = generateRandomString(16);
    res.cookie(stateKey, state); //Save cookie

    const url = 'https://accounts.spotify.com/authorize' +
                '?response_type=code' +
                '&client_id='    + client_id +
                '&scope='        + scope +
                '&redirect_uri=' + redirect_uri +
                '&state='        + state;
    console.log(url);
    res.redirect(url);
});

//GET: /callback from Spotify with state to get Auth tokens
app.get('/callback', (req, res) => {
    //console.log('the base url is: ' + req.url + '\n\n');
    const code        = req.query.code || null;
    const state       = req.query.state || null;
    const storedState = req.cookies ? req.cookies[stateKey] : null;

    //Check for the correct state, i.e. compare cookie, and the cookie came back
    if (state === null || state !== storedState) {
        res.redirect('/main.html#error=state_mismatch');
    } 
    else { //Continue
        res.clearCookie(stateKey);

        const authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code: code,
                redirect_uri: redirect_uri,
                grant_type: 'authorization_code'
            },
            headers: {
                'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
            },
            json: true
        };

        //Make a POST request to get tokens, then redirect to /main with the tokens as parameters
        request.post(authOptions, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                const access_token  = body.access_token; 
                const refresh_token = body.refresh_token;
                

                //Create cookies with the tokens
                const url = '/main.html';
                res.cookie(refTokenKey, refresh_token, { secure: false });
                res.cookie(accTokenKey, access_token,  { secure: false });
                create_queue(access_token, refresh_token, res, url);
            } 
            else { //Failed
                const url = '/#error=invalid_token';
                res.redirect(url);
                console.log('ERROR in callback to main.');
            }
        });
    }
});

//GET: /refresh_token used to obtain the new access token with the provided refresh_token
app.get('/refresh_token', (req, res) => {
    const refresh_token = req.query.refresh_token;

    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
        form: {
            grant_type: 'refresh_token',
            refresh_token: refresh_token
        },
        json: true
    };

    request.post(authOptions, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            const access_token = body.access_token;
            res.send( {'access_token': access_token} );
        }
    });
});

//GET: /avail_dev obtains list of current devices
app.get('/avail_dev', (req, res) => {
    const access_token = req.query.access_token;

    const options = {
        url: 'https://api.spotify.com/v1/me/player/devices',
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        json: true
    };

    request.get(options, (error, response, body) => {
        if (!error && response.statusCode === 200) { res.send(body); }
    })
});

//POST: /create_pl
app.post('/create_pl', (req, res) => {
    const access_token = req.query.access_token;
    const user_id      = req.query.user_id;

    
    const options      = {
        url: 'https://api.spotify.com/v1/users/'+ user_id +'/playlists',
        headers: {
            'Authorization': 'Bearer ' + access_token,
            'Content-Type': 'application/json'
        },
        body: {
            name: 'Queue, made by Bonfire', 
            public: true
        },
        json: true
    };

    request.post(options, (error, response, body) => {
        if (!error && response.statusCode === 201) { res.send(body); }
    });  
});

//GET: /search returns JSON, with field "tracks" that is an array of all tracks found, as JSONs, where we can access their id, name, and uri
app.get('/search', (req, res) => {
    const access_token = req.query.access_token;
    const query        = req.query.query; 
    const url          ='https://api.spotify.com/v1/search' +
                        '?q=' + query +
                        '&type=track&market=US&limit=12&offset=0';

    const options = {
        url: url,
        headers: {
            'Authorization': 'Bearer ' + access_token,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        json: true
    };

    request.get(options, (error, response, body) => {
        if (!error && response.statusCode === 200) { res.send(body); }
    })
});

//POST: /add_track adds the respective track to the playlist using the track's uri
app.post('/add_track', (req, res) => {
    const access_token = req.query.access_token;
    const playlist_id  = req.query.playlist_id;
    const track_uri    = req.query.track_uri;
    const url          = 'https://api.spotify.com/v1/playlists/' + playlist_id + 
                         '/tracks?uris=' + track_uri;

    const options      = {
        url: url,
        headers: {
            'Authorization': 'Bearer ' + access_token,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        json: true
    };

    request.post(options, (error, response, body) => {
        if (!error && response.statusCode === 201) { res.send(body); }
    });  
});

//PUT: /start starts playing the playlist
app.put('/start', (req, res) => {
    const access_token = req.query.access_token;
    const playlist_uri = req.query.playlist_uri;
    const device_id    = req.query.device_id;

    const options      = {
        url: 'https://api.spotify.com/v1/me/player/play?device_id=' + device_id,
        headers: {
            'Authorization': 'Bearer ' + access_token,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: {
            context_uri: playlist_uri
        },
        json: true
    };
    console.log('here');
    request.put(options, (error, response, body) => {
        if (!error && response.statusCode === 204) { res.send('Playlist started'); }
    });  
});


/////////////////////////////////////////////////
console.log('Listening on 8080');
