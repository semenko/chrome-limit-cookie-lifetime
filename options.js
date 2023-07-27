/*
 Author: Nick Semenkovich <semenko@alum.mit.edu>
 License: MIT
 */

"use strict";

const DEFAULT_DAYS = 21;

var input = document.getElementById("selectCookieLimit");

// Default to 21 if LSO isn't set
var cookieLimit = JSON.parse(localStorage.cookieLimit || DEFAULT_DAYS);

input.value = cookieLimit;

// Called when the input is changed by the user.
function updateLimit() {
    localStorage.cookieLimit = (Number(input.value) || DEFAULT_DAYS) + 1; // Zero indexed.
    var statusBar = document.getElementById("statusBar");
    statusBar.innerHTML = 'Saved.';
    setTimeout(function(){ statusBar.innerHTML = '&nbsp;'; }, 2000);
}

input.addEventListener('change', function() { updateLimit(); }, false);
