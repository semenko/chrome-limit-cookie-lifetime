/*
Author: Nick Semenkovich <semenko@alum.mit.edu>
License: MIT
*/

"use strict";


var select = document.getElementById("selectCookieLimit");

// Add days 1-60
for (var i=1; i<=60; i++){
    select.options[select.options.length]=new Option(i)
}

// Default to 7 if LSO isn't set
var cookieLimit = JSON.parse(localStorage.cookieLimit || 7);
select.selectedIndex = cookieLimit - 1;  // Zero indexed.


// Called when the select is changed by the user.
function updateLimit() {
    var newLimit = select.selectedIndex + 1; // Zero indexed.
    localStorage.cookieLimit = newLimit;
}

select.addEventListener('change', function() { updateLimit(); }, false);