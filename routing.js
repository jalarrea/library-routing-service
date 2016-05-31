var url="http://routing.shippify.co";
var RoutingService = function() {	
	this.getInfoBase = function( onResponse ) {
		includeJQueryIfNeeded(function(){
			sendRequest(url,'/info','GET',onResponse);
		});
    };
    this.getRoute = function( waypoints, optimize, onResponse ) {
    	includeJQueryIfNeeded(function(){
			sendRequest(url,buildRouteUrl(waypoints,optimize),'GET',function(response){
				//console.log(response);
				onResponse(response);
				//routeDone(response, waypoints, onResponse);
			});
		});
    };
}

window.RoutingService = RoutingService;

//Utils functions.

function routeDone(response, inputWaypoints, callback) {
	var alts = [],
	    mappedWaypoints,
	    coordinates,
	    i,
	    path;
	if(response.hints instanceof Array&&response.hints.length>0){
		
		return callback({
			// TODO: include all errors
			status: response.hints[0].details,
			message: response.hints[0].message
		});
	}
	else if (!response.paths&&response.info.errors && response.info.errors.length) {
		return callback({
			// TODO: include all errors
			status: response.info.errors[0].details,
			message: response.pathsresponse.info.errors[0].message
		});
		
	}

	for (i = 0; i < response.paths.length; i++) {
		path = response.paths[i];

		alts.push({
			name: '',
			summary: {
				totalDistance: path.distance,
				totalTime: path.time / 1000,
			},
			inputWaypoints: inputWaypoints,
			points: path.points
		});
	}

	callback(null, alts);
}

function buildRouteUrl(waypoints,optimize) {
	if(optimize==undefined||optimize==null){
		optimize=true;
	}
	var locs = [],
	i,
	baseUrl;
	
	for (i = 0; i < waypoints.length; i++) {
		locs.push('point=' + waypoints[i].lat + ',' + waypoints[i].lng);
	}

	baseUrl =  '/route'+ '?' +
		locs.join('&');
	baseUrl +='&instructions=false&optimize='+optimize+'&points_encoded=false&type=json&calc_points=true';

	return baseUrl;
}

function includeJQueryIfNeeded(onSuccess) {
	if (typeof jQuery == 'undefined') {
		function getScript(url, onSuccess) {
			var script = document.createElement('script');
			script.src = url;

			var head = document.getElementsByTagName('head')[0];
			done = false;

			script.onload = script.onreadystatechange = function () {
				if (!done && (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete')) {
					done = true;

					onSuccess();
					script.onload = script.onreadystatechange = null;
					head.removeChild(script);

				}
			}
			head.appendChild(script);
		}

		getScript('http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js', function() {
			if (typeof jQuery == 'undefined') {
				console.log("Not found jquery");
				onSuccess();
			}
		});
	} else {
		onSuccess();
	}
}

function sendRequest(host,path,verb,onResponse){

	$.ajax({
		type: verb,
		url: host + path,
		success: function (response) {
			onResponse(response);
		},
		error: function (error) {
			console.log(error);
			onResponse(new Error('The service is currently unavailable'));
		}
	});
}

