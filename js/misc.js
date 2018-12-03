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
    let dev_list = '<ul style = "list-style-type: none">'
    if (devlist.length) {
        for (var i = 0; i < devlist.length; ++i) {
            dev_list += '<li><a href = "/lmaoo' + devlist[i].id +'">name: ' + devlist[i].name + ' | ID: ' + devlist[i].id + '</a></li>';
        }
    }
    else {
        dev_list += '<li>no devices available</li>';
    }

    dev_list += '</ul>';
        document.getElementById('device_list').innerHTML = dev_list;    
}

// changing string for query example
function stringToQuery() {
    var str = document.getElementById("query").value;
    var res = encodeURI(str);
    return res;
}