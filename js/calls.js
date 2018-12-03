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

// const search = (access_token, query, res_func) =>{
//   $.ajax(
//     {
//       type: "GET"
//       url: '/search',
//         data:{
//           'access_token': access_token,
//           'query': query
//         },
//         fail: () => { console.log('fail'); }
//     }
//   ).done((data) => { res_func(data.query); });
// }



