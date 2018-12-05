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

const setCookie = (cname, cvalue, exdays) => {
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




// changing string for query example
function stringToQuery(str, special) {
    if(special)
        return encodeURI(str);
    else
        return encodeURIComponent(str);
}

// 
function generateRandomString(length) {
    var   text     = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
};