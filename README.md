# This Library is for Routing Service
You only add this library
```html 
<script src="routing.js" type="text/javascript" ></script>
```

####How to work?
You can add a array of waypoints like these and call to the service of this way:
```html
<script type="text/javascript" >
    var waypoints=[];
		waypoints.push({
			lat:-2.156012,
			lng:-79.9692138
		});
		waypoints.push({
			lat:-2.1481458,
			lng:-79.9644885
		});
		new RoutingService().getRoute(waypoints, true,function (error,response) {
			if(error){
				var json=JSON.stringify(error, null, 4);
				$('#routing').append(json);
			}
			var json=JSON.stringify(response, null, 4);
			$('#routing').append(json);
		});
</script>
```

####Basic information of the graph map
Basic request to only information of the service
```html
<script type="text/javascript" >
       new RoutingService().getInfoBase(function (error,response) {
       		if(error){
       			var json=JSON.stringify(error, null, 4);
       			$('#routing').append(json);
       		}
       		var json=JSON.stringify(response, null, 4);
       		$('#basic').append(json);
       	});
</script>
```






