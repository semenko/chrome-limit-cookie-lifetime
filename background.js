/*
Limit the lifetime of cookies in Chrome.

WARNING: This might break sites that do unexpected things based on cookie expiry. Who knows.

Author: Nick Semenkovich <semenko@alum.mit.edu>
License: MIT
*/

// Set lifetime
var maxCookieLifeInDays = 4;


var maxCookieLifeInSeconds = maxCookieLifeInDays * 24 * 60 * 60;

function scanCookies() {
    var maxTime = (Date.now() / 1000) + maxCookieLifeInSeconds;
    var newCookie;
    chrome.cookies.getAllCookieStores(function stores(cookieStores) {
	    for (var i = 0; i < cookieStores.length; i++) {
		var cookieStoreId = cookieStores[i].id;
		console.log('Working on store: ' + cookieStoreId);
		chrome.cookies.getAll({ session: false, storeId: cookieStoreId }, function cookieList(allCookies) {
			console.log('Parsing ' + allCookies.length + ' cookies.');
			for (var j = 0; j < allCookies.length; j++) {
			    if (allCookies[j].expirationDate > maxTime) {
			    // if ((allCookies[j].expirationDate > maxTime) && (allCookies[j].hostOnly == false)) {
				console.log('Limiting ' + allCookies[j].domain);
				console.log(allCookies[j]);
				var newCookie = {name:allCookies[j].name, value:allCookies[j].value,
						 path:allCookies[j].path,
						 secure:allCookies[j].secure, httpOnly:allCookies[j].httpOnly,
						 expirationDate:maxTime, storeId:cookieStoreId };
				if (!allCookies[j].hostOnly) {
				    newCookie.domain = allCookies[j].domain;
				}
				if (allCookies[j].domain[0] == ".") {
				    newCookie.url = "http://www"+allCookies[j].domain + allCookies[j].path;
				} else {
				    newCookie.url = "http://"+allCookies[j].domain + allCookies[j].path;
				}
				console.log(newCookie);
				chrome.cookies.set(newCookie, function errord(cook) { console.warn(chrome.runtime.lastError); });
			    }
			}
		    });
	    }
	});
};


// On first run/update
function setup() {
    // Run every hour
    chrome.alarms.create("scanCookies", { periodInMinutes: 100 });
    // And let's run once right now!
    scanCookies();
};

// Set some onInstalled listeners to fire, since we're not a persistent background page.
chrome.runtime.onInstalled.addListener(setup);

chrome.alarms.onAlarm.addListener(function callback(alarm) { scanCookies(); });


