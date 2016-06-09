var url="http://routing.shippify.co";
var url_local="http://localhost";

axios.defaults.baseURL = url_local;
axios.defaults.headers.post['Content-Type'] = 'application/json';
var RoutingService = function() {	
	this.getInfoBase = function( onResponse ) {
		includeJQueryIfNeeded(function(){
			sendRequest(url,'/info','GET',undefined,onResponse);
		});
    };
    this.getRoute = function( waypoints, optimize, onResponse ) {
    	includeJQueryIfNeeded(function(){
			sendRequest(url,buildRouteUrl(waypoints,optimize),'GET',undefined,function(error,response){
				console.log(response);
				if(error){
					return onResponse(error);
				}
				routeDone(response, waypoints, onResponse);
			});
		});
    };

    this.getRouteOptimizationSingle = function(waypoints,onResponse) {

    	var body={
  			problem_type: {
        		fleet_size:"FINITE",
        		fleet_composition:"HOMOGENEOUS",
        		fleet_size_simulate:1,
        		fleet_types_vehicles:["Car"],
        		fleet_capacities_simulate:[100],
        		fleet_cost_by_meter:[1],
        		algorithm_iterations:100
  			}
		};



		body.services = waypoints.map(function(waypoint, index){
							return {
								id:index==0?"pickup":""+index,
								size_index:"0",
						        size_value:"2",
						        coord:{
					                lat:waypoint.lat,
					                lng:waypoint.lng
				        		}
							};
						});

		console.log(body)

    	includeJQueryIfNeeded(function(){
    		//sendRequest(url,"/optimization",'POST',JSON.stringify(body),function(error,response){
			sendRequestPostEspecial(url,"/optimization/single",'POST',JSON.stringify(body),function(error,response){
				console.log(response);
				if(error){
					return onResponse(error);
				}

				 onResponse(null,response);
				//routeDone(response, waypoints, onResponse);
			});
		});
    };

    this.getRouteOptimizationMulti = function(tasks,onResponse) {

    	var body={
  			problem_type: {
        		fleet_size:"FINITE",
        		fleet_composition:"HOMOGENEOUS",
        		fleet_size_simulate:1,
        		fleet_types_vehicles:["Car"],
        		fleet_capacities_simulate:[100],
        		fleet_cost_by_meter:[1],
        		algorithm_iterations:100
  			}
		};



		body.shipments = tasks.map(function(task, index){
							return {
								id:task.id,
								size_index:"0",
						        size_value:"2",
						        pickup_location:{
						        	lat:task.pickup_location.lat,
						        	lng:task.pickup_location.lng
						        },
						        delivery_location:{
						        	lat:task.delivery_location.lat,
						        	lng:task.delivery_location.lng
						        }
							};
						});

		console.log(JSON.stringify(body,null,4))

    	includeJQueryIfNeeded(function(){
    		//sendRequest(url,"/optimization",'POST',JSON.stringify(body),function(error,response){
			sendRequestPostEspecial(url_local,"/multiple",'POST',body,function(error,response){
				console.log(response);
				if(error){
					return onResponse(error);
				}

				 onResponse(null,response);
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
	    path,distances,times;
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
	console.log('Distances');

	for (var i = 0; i < response.paths.length; i++) {
		path = response.paths[i];
		var distances_pre = path.instructions;
		var sum=0;
		var sum1=0;
		distances=[];
		times=[];
		for(var d=0;d<distances_pre.length;d++){
			if(distances_pre[d].sign==5||distances_pre[d].sign==4){
				sum=sum/1000; //Kilometers
				sum1=sum1/1000; //Seconds
				distances.push(sum);
				times.push(sum1);
				sum1=0;
				sum=0;
			}else{
				sum+=distances_pre[d].distance;
				sum1+=distances_pre[d].time;
			}
		}

		var coordinates=path.points.coordinates.map(function(point){
			return {
				lat:point[1],
				lng:point[0]
			};
		});

		alts.push({
			summary: {
				totalDistance: path.distance/1000,
				totalTime: path.time / 1000,
			},
			inputWaypoints: inputWaypoints,
			distances:distances,
			times:times,
			points: coordinates,
			service: 'Shippify.Inc'
		});

		console.log(path.distance)
	}

	return callback(null, alts);
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
	baseUrl +='&instructions=true&optimize=true&points_encoded=false&type=json&weighting=fastest&out_array=weights&out_array=times&out_array=distances&alternative_route.max_paths=10&ch.disable=true';

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

function sendRequest(host,path,verb,body,onResponse){

	$.ajax({
		type: verb,
		url: host + path,
		data: body,
		dataType: 'json',
		success: function (response, textStatus, jqXHR) {
			return onResponse(null,response);
		},
		error: function (xhr, ajaxOptions, thrownError){
			console.log(xhr);
			return onResponse({
				status: xhr.status,
				message: thrownError
		    });
		}
	});
}

function sendRequestPostEspecial(host,path,verb,body,onResponse){

  axios.post(path, body)
  .then(function (response) {
    console.log(response);
    return onResponse(null,response.data);
  })
  .catch(function (response) {
    if (response instanceof Error) {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', response.message);
    } else {
      // The request was made, but the server responded with a status code
      // that falls out of the range of 2xx
      console.log(response.data);
      console.log(response.status);
      console.log(response.headers);
      console.log(response.config);
      return onResponse({
			status: response.status,
			message:response.data
	  });
    }
  });
/*	$.post( host+path, body) 
	.done(function( data ) {
    	return onResponse(null,response);
    })
    .fail( function(xhr, textStatus, errorThrown) {
        console.log(xhr);
		return onResponse({
			status: xhr.status,
			message: errorThrown
	    });
    });*/
}




