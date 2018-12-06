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
	setCookie('bonfire_playlist_id', res.id, 1);
	setCookie('bonfire_playlist_uri', res.uri, 1); 
	$.ajax({
        url: url_id,
        method: 'PUT',
        success: (response) => { console.log('playlist id is: ' + getCookie('bonfire_playlist_id'))}
    });

    $.ajax({
        url: url_uri,
        method: 'PUT',
        success: (response) => { console.log('playlist uri is: ' + getCookie('bonfire_playlist_uri'))}
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

const update_queue_dev_id = (dev_id, queue_id) => {
    const url = '/queue/update/device_id' +
                '?device_id=' + dev_id + 
                '&id='        + queue_id;

    $.ajax({
        url: url,
        method: 'PUT',
        success: (response) => { console.log(response); }
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

const start = (access_token, device_id, playlist_uri) =>{
	console.log('access: ' + access_token);
	console.log('device_id: ' + device_id);
	console.log('uri: ' + playlist_uri);
	const url = '/start?access_token=' + access_token + '&playlist_uri=' + playlist_uri + '&device_id=' + device_id;
	$.ajax({
	   url: url,
	   method: 'PUT',
	   success: (response) => { console.log(response); }
	 });
}


const search = (access_token, query, key, view) =>{

    var new_access_token = access_token;
    console.log("old access", access_token);
    $.ajax(
        {
            type: "GET",
            url: '/queue',
            data:{
                'id':key
            },
            success:(res) =>{
                setCookie('bonfire_playlist_id', res.playlistId);
                new_access_token = res.accessToken;
                $.ajax(
                    {
                      type: "GET",
                      url: '/search',
                        data:{
                            'access_token': new_access_token,
                            'query': query
                        },
                        fail: () => { console.log('fail'); },
                        success:(res)=>{console.log(res);}
                    }).done((data) => { 
                      var resultsContainer = document.getElementById('search-results-container');
                      removeChildNodes(resultsContainer);
                      
                      for(var i = 0; i < data.tracks.items.length; i++){
                        console.log(data.tracks.items[i].name + " " + data.tracks.items[i].uri + " " + data.tracks.items[i].id);
                        var track_uri = data.tracks.items[i].uri;
                        var song_id = data.tracks.items[i].id;
                        if(view){  
                           var results = document.createElement('div');
                           var img_url = data.tracks.items[i].album.images[0].url;
                           var img = document.createElement('img');
                           img.src = img_url;
                           img.className = "search-results-image";
                           results.appendChild(img);
                           var para = document.createElement('p');
                           var name = document.createTextNode(data.tracks.items[i].name);
                           para.appendChild(name);
                           results.appendChild(para);
                           var para = document.createElement('p');
                           var artist = document.createTextNode(data.tracks.items[i].artists[0].name);
                           para.appendChild(artist);
                           results.appendChild(para);

                            results.appendChild(addTrackBtn(new_access_token, track_uri, song_id, data.tracks.items[i].artists[0].name, data.tracks.items[i].name, getCookie('bonfire_playlist_id')));
                            results.className = 'search-results';
                         }
                        else{
                            console.log(data.tracks.items[i].name + " " + data.tracks.items[i].uri + " " + data.tracks.items[i].id);
                            var results = document.createElement('div');
                            var para = document.createElement('p');
                          var name = document.createTextNode(data.tracks.items[i].name);
                           para.appendChild(name);
                           results.appendChild(para);
                           var para = document.createElement('p');
                           var artist = document.createTextNode(data.tracks.items[i].artists[0].name);
                           para.appendChild(artist);
                           results.appendChild(para);
                            results.appendChild(addTrackBtn(new_access_token, track_uri, song_id, data.tracks.items[i].artists[0].name, data.tracks.items[i].name, getCookie('bonfire_playlist_id')));
                            results.className = 'search-results-list';
                    
                        }
                        resultsContainer.appendChild(results);
                       }
                    });
            }

        }
    );


    // Add track button functionality for each search result
    var addTrackBtn = function(access_token, track_uri, song_id, artist_name, song_name, playlist_id){
        // $("#playlist-creator-name")
        var addBtn = document.createElement('button');
        var btnText = document.createTextNode("Add Track");
        
        addBtn.appendChild(btnText);
            addBtn.addEventListener("click",
                ()=>{
                    alert("Track has been added");
                    //key, songId, songName, addedBy
                    
                    console.log(artist_name);
                    addSongToQueue(key, song_id, artist_name, song_name, "Anonymous", track_uri);
                    add_track(access_token, track_uri, playlist_id);
                }, false
            );
        addBtn.className = "btn btn-secondary btn-sm";
        return addBtn;
    }

  
}

    // Recursively removes child nodes in the html
    var removeChildNodes = function(parentDiv){
		while (parentDiv.hasChildNodes()) {
			parentDiv.removeChild(parentDiv.firstChild);
		}
    };

    const updateQueueDisplay = (key)=>{
        var body = document.getElementById("queue-body");
        removeChildNodes(body);
        var url = '/queue' +
        '?id=' + key;
        
        $.ajax(
            {
              type: "GET",
              url: url,
                data:{
                },
                success: (response) =>{
                    if(response == null){
                    }
                    else{
                    }
                },
                fail: () => { console.log('fail');},
                success: (response) =>{
                    for(var i = 0; i < response.songs.length; i++){
                        var tr = document.createElement('tr');
                        var th = document.createElement('th');
                        var songName = response.songs[i].name;
                        var artistName = response.songs[i].artistName;
                        var addedBy = response.songs[i].addedBy;
                        var para = document.createTextNode(""+(parseInt(i)+1));
                        th.appendChild(para);
                        th.setAttribute("scope", "row");
                        tr.appendChild(th);
                        var td = document.createElement('td');
                        para = document.createTextNode(songName);
                        td.appendChild(para);
                        tr.appendChild(td);
                        td = document.createElement('td');
                        para = document.createTextNode(artistName);
                        td.appendChild(para);
                        tr.appendChild(td);
                        td = document.createElement('td');
                        para = document.createTextNode(addedBy);
                        td.appendChild(para);
                        tr.appendChild(td);
                        body.appendChild(tr);
                //     <tr>
                //     <th scope="row">1</th>
                //     <td>Mark</td>
                //     <td>Otto</td>
                //      <td></td>
                //     </tr>
                    }

                }
            }
        );
        
    }
    const addSongToQueue = (key, songId, artistName, songName, addedBy, trackURI) => {
        console.log(artistName, "TESTTEST");
      var url = '/queue'+
      '?id='+key +
      '&songId='+songId+
      '&songName='+songName +
      '&addedBy='+addedBy+
      '&artistName='+artistName+
      '&trackURI='+trackURI;
        $.ajax({
            url: url,
            method: 'PUT',
            data: {
            //   'id' : key,
            //   'songId' : songId,
            //   'songName' : songName,
            //   'addedBy' : addedBy,
            //   'trackURI' : trackURI
            },
            processData: false,
            success: (res) => { console.log("i put the song", res); }
        }).done(()=>{
            updateQueueDisplay(key);
            
        });
    }


// Checks if key entered by user is valid 
const usingPlaylist = (key)=>{
    var url = '/queue' +
    '?id=' + key;
    console.log(url);
   $.ajax(
    {
      type: "GET",
      url: url,
        data:{
        },
        success: (response) =>{
            if(response == null){
                $("#current-creator-name").text("Invalid Key");
                $("#current-key").text("");
                // setCookie("bonfire_queue_user", "null", 1);
            }
            else{
                $("#current-creator-name").text(response.creator);
                $("#current-key").text(key);
                // setCookie("bonfire_queue_user", key, 1);
            }
        },
        fail: () => { console.log('fail'); }
    }).done(()=>{
        updateQueueDisplay(key);
    });
}


const list_devices = (devlist) => {
    let dev_list   = '<ul style = "list-style-type: none">';
    const queue_id = getCookie('bonfire_queue_id');
    if (devlist.length) {
        for (var i = 0; i < devlist.length; ++i) {
            var dev = '<li><a href="javascript:select_id(\'' + devlist[i].id +'\',\'' + queue_id + '\', \'' + devlist[i].name + '\');">name: ' + devlist[i].name + '</a></li>';
            dev_list += dev;
        }
    }
    else {
        dev_list += '<li>no devices available</li>';
    }

    dev_list += '</ul>';
    document.getElementById('device_list').innerHTML = dev_list;
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
      ).done((data) => { res_func(data.devices);  });
      
}

const select_id = (dev_id, queue_id, dev_name) => {
    setCookie('bonfire_dev_id', dev_id);
    setCookie('bonfire_dev_name', dev_name);
    update_queue_dev_id(dev_id, queue_id);
    console.log('current device id is: ' + getCookie('bonfire_dev_id'));

    $('#device_list').html('<p>Current device: '+ getCookie('bonfire_dev_name') +'</p>');
    $('#new-dev').html('select new device');
    $('#new-dev').on('click', () => { 
        $('#new-dev').html('refresh devices');
        setCookie('bonfire_dev_id', "", 1); 
        avail_dev(getCookie('spotify_acc_token'), list_devices); });
}


