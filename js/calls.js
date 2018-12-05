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

// Creating playlist checks if playlist related to the bonfire already exists.
// If not, it creates a playlist.
// If it already exists, it just updates the key if button is pressed
const create_pl = (access_token, user_id, res_func) =>{

    // Update playlist id
    var old_queue_id = getCookie('bonfire_queue_id');
    $.ajax({
    url: '/queue/update/queue_id?refreshToken=' + getCookie('spotify_ref_token'),
    method: 'PUT',
    data:{
    },
    success: (response) => {
        setCookie('bonfire_queue_id', response.queueId, 1); 
        document.getElementById("keyContainer").innerHTML = "Key: " + getCookie('bonfire_queue_id'); 
        
        // Checks if playlist created by bonfire already exists or not
        if(response.playlistId == null){
            $.ajax({
                url: '/create_pl?access_token=' + access_token+'&user_id='+user_id,
                method: 'POST',
                data: {
                    'access_token': access_token,
                    'user_id': user_id 
                },
                success: (response) => {res_func(response);},
            });
        }else console.log("playlist is an already existing playlist");
    }
    });
    
   
}

const add_track = (access_token, track_uri, playlist_id, res_func) =>{
    track_uri = stringToQuery(track_uri, false);
    $.ajax({
        url: '/add_track?access_token=' + access_token + '&track_uri=' + track_uri + '&playlist_id=' + getCookie('bonfire_playlist_id'),
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

var view = true;
var viewSwitch = document.getElementById('switch-view');
viewSwitch.addEventListener("click", function(){
    view = !view;
});
const refresh_token = getCookie('spotify_ref_token');
const search = (access_token, query) =>{
    var url = '/search' +
    '?access_token=' + access_token + 
    '&query=' + stringToQuery(query, true);
    console.log(url);
   $.ajax(
    {
      type: "GET",
      url: '/search',
        data:{
          'access_token': access_token,
          'query': query
        },
        fail: () => { console.log('fail'); }
    }
  ).done((data) => { 
      var resultsContainer = document.getElementById('search-results-container');
      removeChildNodes(resultsContainer);
      
      for(var i = 0; i < data.tracks.items.length; i++){
        console.log(data.tracks.items[i].name + " " + data.tracks.items[i].uri + " " + data.tracks.items[i].id);
        var track_uri = data.tracks.items[i].uri;

        if(view){  
            var results = document.createElement('div');
            var para = document.createElement('p');
            var name = document.createTextNode("Track Name: " + data.tracks.items[i].name);
            para.appendChild(name);
            results.appendChild(para);
            var uri = document.createTextNode("Track URI: " + track_uri);
            para.appendChild(uri);
            results.appendChild(para);
            var id = document.createTextNode("Track ID: " + data.tracks.items[i].id);
            para.appendChild(id);
            results.appendChild(para);
             var img_url = data.tracks.items[i].album.images[0].url;
            var img = document.createElement('img');
            img.src = img_url;
            img.className = "search-results-image";
            results.appendChild(img);
            
            results.appendChild(addTrackBtn(access_token, track_uri, getCookie('bonfire_playlist_id')));
            results.className = 'search-results';
         }
        else{
            console.log(data.tracks.items[i].name + " " + data.tracks.items[i].uri + " " + data.tracks.items[i].id);
            var results = document.createElement('div');
            var para = document.createElement('p');
            var name = document.createTextNode("Track Name: " + data.tracks.items[i].name);
            para.appendChild(name);
            results.appendChild(para);
            var uri = document.createTextNode("Track URI: " + track_uri);
            para.appendChild(uri);
            results.appendChild(para);
            var id = document.createTextNode("Track ID: " + data.tracks.items[i].id);
            para.appendChild(id);
            results.appendChild(para);
            results.appendChild(addTrackBtn(access_token, track_uri, getCookie('bonfire_playlist_id')));
            results.className = 'search-results-list';
    
        }
        resultsContainer.appendChild(results);
       }
    });
    // Recursively removes child nodes in the html
     var removeChildNodes = function(parentDiv){
		while (parentDiv.hasChildNodes()) {
			parentDiv.removeChild(parentDiv.firstChild);
		}
    };

    // Add track button functionality for each search result
    var addTrackBtn = function(access_token, track_uri, playlist_id){
        var addBtn = document.createElement('button');
        var btnText = document.createTextNode("Add Track");
        addBtn.appendChild(btnText);
            addBtn.addEventListener("click",
                ()=>{
                    add_track(access_token, track_uri, playlist_id );
                    console.log("Adding track", track_uri);
                    console.log
                }, false
            );
        return addBtn;
    }
}

