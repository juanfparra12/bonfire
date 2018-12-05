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

const update_queue_playlist = (res) => {
	const queue_id = getCookie('bonfire_queue_id');
  console.log(queue_id);
  console.log('ID PLAYLIST 1 ' + res.id);
  console.log('the uri of pl is: ' + res.uri);
	const url_id   = '/queue/update/playlist_id?playlist_id='   + res.id  + '&id=' + queue_id;
	const url_uri  = '/queue/update/playlist_uri?playlist_uri=' + res.uri + '&id=' + queue_id;
  setCookie('bonfire_playlist_id', res.id, 1);
  setCookie('bonfire_playlist_uri', res.uri, 1);
  console.log('ID PLAYLIST 2: ' + getCookie('bonfire_playlist_id'));

	$.ajax({
        url: url_id,
        success: (response) => { setCookie('bonfire_playlist_id', res.id, 1); console.log('ID PLAYLIST 2: ' + getCookie('bonfire_playlist_id')); }
    });

    $.ajax({
        url: url_uri,
        success: (response) => { setCookie('bonfire_playlist_uri', res.uri, 1); console.log('playlist uri is: ' + getCookie('bonfire_playlist_uri')); }
    });
}

const update_queue_user = (res) => {
	const queue_id = getCookie('bonfire_queue_id');
	const url      = '/queue/update/creator?creator=' + res.id + '&id=' + queue_id;
	$.ajax({
        url: url,
        method: 'PUT',
        success: (response) => { setCookie('bonfire_user_id', res.id, 1); console.log('id is: ' + getCookie('bonfire_user_id'))}
    });
}

const get_user = (access_token, res_func) => {
	$.ajax({
        url: 'https://api.spotify.com/v1/me',
        headers: {
          'Authorization': 'Bearer ' + access_token
        },
        success: (response) => { console.log('user info:\n' + response.id); res_func(response); }
    });
}

const refreshtoken = (refresh_token, res_func) => {
	$.ajax(
 		{
          url: '/refresh_token',
          data: {
            'refresh_token': refresh_token
          }
        })
    .done( (data) => { res_func(data.access_token); } );
}

const avail_dev = (access_token, res_func) => {
	$.ajax(
        {
        	url: '/avail_dev',
            data: { 
          		'access_token': access_token
            },
            
  			fail: () => { console.log('fail'); }
    	}
  	).done((data) => { res_func(data.devices); });

}

const create_pl = (access_token, user_id, res_func) =>{
$.ajax({
   url: '/create_pl?access_token=' + access_token + '&user_id='+user_id,
   method: 'POST',
   data: {
     'access_token': access_token,
     'user_id': user_id 
   },
   success: (response) => {res_func(response);},
 });
}
 // stringToQuery(track_uri, true)
const add_track = (access_token, track_uri, playlist_id, res_func) =>{
//console.log('DEBUG: ' + res.id);
$.ajax({
   url: '/add_track?access_token=' + access_token + '&track_uri=' +'spotify%3Atrack%3A2FRnf9qhLbvw8fu4IBXx78' + '&playlist_id=' + getCookie('bonfire_playlist_id'),
   method: 'POST',
   data: {
     'access_token': access_token,
     'track_uri': track_uri,
     'playlist_id': playlist_id  
   },
   success: (response) => { console.log(response); }
 });
}

const start = (access_token, device_id, playlist_uri, res_func) =>{
$.ajax({
   url: '/start',
   method: 'POST',
   data: {
     'access_token': access_token,
     'device_id': device_id,
     'playlist_uri': playlist_uri 
   },
   success: (response) => { console.log(response); }
 });
}



