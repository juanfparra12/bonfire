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
	const url_id   = '/queue/update/playlist_id?playlist_id='   + res.id  + '&id=' + queue_id;
	const url_uri  = '/queue/update/playlist_uri?playlist_uri=' + res.uri + '&id=' + queue_id;
	$.ajax({
        url: url_id,
        method: 'PUT',
        success: (response) => { setCookie('bonfire_playlist_id', res.id, 1); console.log('playlist id is: ' + getCookie('bonfire_playlist_id'))}
    });

    $.ajax({
        url: url_uri,
        method: 'PUT',
        success: (response) => { setCookie('bonfire_playlist_uri', res.uri, 1); console.log('playlist uri is: ' + getCookie('bonfire_playlist_uri'))}
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

const search = (access_token, user_id, res_func) =>{
$.ajax({
   url: '/search',
   data: {
     access_token: access_token,
     query: query 
   },
   success: (response) => { res_func(response); }
 });
}

const create_pl = (access_token, user_id, res_func) =>{
$.ajax({
   url: '/create_pl',
   method: 'POST',
   data: {
     access_token: access_token,
     user_id: user_id 
   },
   success: (response) => { res_func(response); }
 });
}

const add_track = (access_token, track_uri, res_func) =>{
$.ajax({
   url: '/add_track',
   method: 'POST',
   data: {
     access_token: access_token,
     track_uri: track_uri 
   },
   success: (response) => { console.log(response); }
 });
}

const start = (access_token, device_id, playlist_uri, res_func) =>{
$.ajax({
   url: '/start',
   method: 'POST',
   data: {
     access_token: access_token,
     device_id: device_id,
     playlist_uri: playlist_uri 
   },
   success: (response) => { console.log(response); }
 });
}

var t = null;
$.getJSON('http://localhost:8080/search?access_token=BQBpppr33JJHQObwpuIgNJuc9jTojgSoHKxLLdRjt11LR140sG8imThbdEPk8ONU0EUu-4zsKCXm3Ncr6Ukd18G_Q-TFG6070KGRJQ4AXTPG6cmFF1DjfixxQEgMUNy3fC41Tofjwu5YfmhlpmWpU6JXxOMnTbJJXZ2NyehJuIjP8Ap-ZagM0i1EoYrVBnEUeRxF0jrbDGZ-c89dn1k7cj1oI-_WR8zueg4nGSyRAoOI92lqLzrlgRHrfgQBE4EzkXIxXVA-bL2rE4ngoONg54hAw_aB6aCoa2g&query=Gold%20Digger'
  ,function(data){
    for(var i = 0; i<data.tracks.items.length; i++)
      alert(data.tracks.items[i].album.name);
  });