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

const getHashParams = () => {
	var hashParams = {};
	var e, r = /([^&;=]+)=?([^&;]*)/g,
	q = window.location.hash.substring(1);

	while ( e = r.exec(q)) {
		hashParams[e[1]] = decodeURIComponent(e[2]);
	}

	return hashParams;
}

const setCookie = function(cname, cvalue, exdays) {
    const date = new Date(); //Create an date object
    date.setTime(date.getTime() + (exdays*1000*60*60*24));
    const expires = "expires=" + date.toGMTString();
    window.document.cookie = cname+"="+cvalue+"; "+expires;
}

const getCookie = (cname) => {
    const name = cname + "="; 
    const cArr = window.document.cookie.split(';'); 
     
   	for(var i = 0; i < cArr.length; i++) {
        var cookie = cArr[i].trim();
        if (cookie.indexOf(name) == 0) 
            return cookie.substring(name.length, cookie.length);
    }
     
    return "";
}

const list_devices = (devlist) => {
    let dev_list = '<ul style = "list-style-type: none">';
    const queue_id = getCookie('bonfire_queue_id');
    if (devlist.length) {
        for (var i = 0; i < devlist.length; ++i) {
            dev_list += '<li><a href = "/select_id?dev_id=' + devlist[i].id +'&queue_id=' + queue_id +'">name: ' + devlist[i].name + ' | ID: ' + devlist[i].id + '</a></li>';
        }
    }
    else {
        dev_list += '<li>no devices available</li>';
    }

    dev_list += '</ul>';
        document.getElementById('device_list').innerHTML = dev_list;    
}





// changing string for query example
function stringToQuery(str) {
    str = document.getElementById("query").value;
    var res = encodeURI(str);
    return res;
}