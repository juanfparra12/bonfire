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
const querystring  = require('querystring');
const cookieParser = require('cookie-parser');

const stateKey      = 'spotify_auth_state';
const client_id     = '8aa11aaababa4e6c968030e37d1540a5'; // client id
const client_secret = '95b7bbc7b3a442e9b5885a8d5d1106b9'; // secret
const redirect_uri  = 'http://localhost:8080/callback';   // redirect uri
const scope         = 'user-read-private user-read-email user-read-playback-state';


//Cookie-Generator
const generateRandomString = function(length) {
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
   .use(cors())
   .use(cookieParser());



//GET: /login 
app.get('/login', function(req, res) {
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
app.get('/callback', function(req, res) {

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
    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        const access_token  = body.access_token; 
        const refresh_token = body.refresh_token;

        //Pass the token to the browser to make requests from there
        const url = '/main.html' +
                    '#access_token=' + access_token +
                    '&refresh_token=' + refresh_token;
        res.redirect(url);
      } 
      else { //Failed
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
        console.log('ERROR in callback to main.');
      }
    });
  }
});

//GET: /re
app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };


  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });

});



app.get('/avail_dev', function(req, res) {

  var access_token = req.query.access_token;
  var options = {
    url: 'https://api.spotify.com/v1/me/player/devices',
    headers: {
      'Authorization': 'Bearer ' + access_token
    },
    json: true
  };

  request.get(options, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      if (body.devices.length)
        console.log(body.devices[0].id);
      res.send(body);
    }
  })


});

/*


app.get('/avail-dev', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };


  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });


});




app.get('/avail-dev', function(req, res)
{
    res.redirect('/test1');
});

app.get('/test1', function(req, res)
{
    console.log('likin');
    res.send({
      'dat' : 12
    })
});


*/




/////////////////////////////////////////////////
console.log('Listening on 8080');
//app.listen(8080);