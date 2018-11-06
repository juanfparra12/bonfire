/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var stateKey = 'spotify_auth_state';


var client_id = '8aa11aaababa4e6c968030e37d1540a5'; // client id
var client_secret = '95b7bbc7b3a442e9b5885a8d5d1106b9'; // secret
var redirect_uri = 'http://localhost:8080/callback'; // redirect uri
var scope = 'user-read-private user-read-email user-read-playback-state';

//COOKIE-GENERATOR
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};







var app = express(); //constructor


//ACCESS THE INDEX.HTML
app.use(express.static(__dirname + '/html'))
   .use(cors())
   .use(cookieParser());;



//LOGIN 
app.get('/login', function(req, res) {
    console.log(req);
    var state = generateRandomString(16);
    res.cookie(stateKey, state); //KEY-VALUE PAIR 

    // your application requests authorization
    
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify(
        {
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state
        }
    	)
  );
});


////////////////////////////////////////

/////// your application requests refresh and access tokens
////////// after checking the state parameter
app.get('/callback', function(req, res) {

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;


  //CHECK FOR THE CORRECT STATE, I.E. THE COOKIE, RESPONSE CAME BACK TRUE
  if (state === null || state !== storedState) 
  {
    res.redirect('/main.html#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } 
  else //CONTINUE IF CORRECT
  {
    res.clearCookie(stateKey);
    var authOptions = 
    {
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

    request.post(authOptions, function(error, response, body) 
    {
      if (!error && response.statusCode === 200) 
      {

        var access_token = body.access_token, 
            refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body);
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('/main.html#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } 
      else //FAILED
      {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
        console.log('ERROR in callback to main.');
      }
    });
  }
});








//////////REFRESHER FOR AUTH TOKEN

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
app.listen(8080);