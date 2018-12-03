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

const express      = require('express'); // Express web server framework
const request      = require('request'); // "Request" library
const cors         = require('cors');
const cookieParser = require('cookie-parser');

const queue       = require('./js/queueController.js');
const mongoose     = require('mongoose');
const bodyParser   = require('body-parser');

const stateKey      = 'spotify_auth_state';
const accTokenKey   = 'spotify_acc_token';
const refTokenKey   = 'spotify_ref_token';
const client_id     = '8aa11aaababa4e6c968030e37d1540a5'; // client id
const client_secret = '95b7bbc7b3a442e9b5885a8d5d1106b9'; // secret
const redirect_uri  = 'http://localhost:8080/callback';   // redirect uri
const scope         = 'user-read-private user-read-email user-read-playback-state';


//Cookie-Generator
const generateRandomString = (length) => {
    var   text     = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
};

//Create server
const app = express();
app.listen(8080);


//Set html directory, cors, cookieParser
app.use(express.static(__dirname + '/html'))
   .use(express.static(__dirname))
   .use(cors())
   .use(cookieParser())
   .use(bodyParser.json());



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

    res.redirect(url);
});

//GET: /callback from Spotify with state to get Auth tokens
app.get('/callback', (req, res) => {
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
                res.redirect(302, url);
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
  //Requesting access token using the refresh token
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

// Routing for queues
app.route('/queue')
  .post(queue.create)
  .get(queue.get)
  .put(queue.addSong)
  .delete(queue.delete);

// Connect to database
mongoose.connect("mongodb://admin:webapps7@ds239557.mlab.com:39557/bonfire-queue", {useNewUrlParser:true});


/////////////////////////////////////////////////
console.log('Listening on 8080');