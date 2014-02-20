/*
 Limit the lifetime of cookies in Chrome.

 WARNING: This might break sites that do unexpected things based on cookie expiry. Who knows.

 Author: Nick Semenkovich <semenko@alum.mit.edu>
 License: MIT
 */

"use strict";

function scanCookies() {
    // Grab the cookie preference, or default to 7 days.
    var maxCookieLifeInDays = JSON.parse(localStorage.cookieLimit || 7);

    var maxCookieLifeInSeconds = maxCookieLifeInDays * 24 * 60 * 60;

    var maxTime = (Date.now() / 1000) + maxCookieLifeInSeconds;

    var newCookie;
    // I've never seen a non-zero cookieStoreID, but it's what the API defines.
    chrome.cookies.getAllCookieStores(function(cookieStores) {
        for (var i = 0; i < cookieStores.length; i++) {
            var cookieStoreId = cookieStores[i].id;
            console.log('Working on cookie store: ' + cookieStoreId);

            // Loop over all the non-session cookies in the store.
            chrome.cookies.getAll({ session: false, storeId: cookieStoreId }, function(allCookies) {
                console.log('Parsing ' + allCookies.length + ' cookies.');
                for (var j = 0; j < allCookies.length; j++) {
                    if (allCookies[j].expirationDate > maxTime) {
                        console.log('Limiting ' + allCookies[j].domain);
                        // console.log(allCookies[j]);

                        // Define a new cookie object, which will overwrite the existing cookie.
                        // Unfortunately, there's no simple chrome.cookies.update()
                        var newCookie = {name:allCookies[j].name, value:allCookies[j].value,
                            path:allCookies[j].path, secure:allCookies[j].secure,
                            httpOnly:allCookies[j].httpOnly,
                            expirationDate:maxTime, storeId:cookieStoreId };

                        // The cookie API is kind-of messy ...
                        // hostOnly cookies have no domain set.
                        if (!allCookies[j].hostOnly) {
                            newCookie.domain = allCookies[j].domain;
                        }

                        // The cookie URL needs to be recreated from the domain & path. Again, weird API.
                        if (allCookies[j].domain[0] == ".") {
                            newCookie.url = "http://www" + allCookies[j].domain + allCookies[j].path;
                        } else {
                            newCookie.url = "http://" + allCookies[j].domain + allCookies[j].path;
                        }
                        // console.log(newCookie);
                        chrome.cookies.set(newCookie, function(cookie) {
                            if (chrome.runtime.lasterror) { console.warn(chrome.runtime.lastError); }
                        });
                    }
                }
            });
        }
    });
}


// Called on first run/update
function setup() {
    // Run every three hours
    chrome.alarms.create("scanCookies", { periodInMinutes: 180 });

    // And let's run once right now!
    scanCookies();
}

// Set some onInstalled listeners to fire, since we're not a persistent background page.
chrome.runtime.onInstalled.addListener(setup);

chrome.alarms.onAlarm.addListener(function(alarm) { scanCookies(); });
