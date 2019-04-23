
function render_state_map(){
        console.log("Loading statemap");
        draw_us_plot('/stateMap',"StateWise distribution of Visa Applications");
	}


function draw_us_plot(url,title){
	$('#main_chart').empty();
	$.ajax({
	  type: 'GET',
	  url: url,
      contentType: 'application/json; charset=utf-8',

	  success: function(result) {
			console.log("logging at ajax call",title);
		    draw_us_chart(result,title);
	  },
	  error: function(result) {
	  	console.log(result);
		$("#main_chart").html(result);
	  }
	});

}

function draw_us_chart(data,title){

    console.log("Logging title:",title);
    console.log("Logging result:",data);


    var margin = {top: 30, right: 50, bottom: 40, left:40};
	var width = 960 - margin.left - margin.right;
	var height = 500 - margin.top - margin.bottom;


    var svg = d3.select('#main_chart')
			.append('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
		    .append('g')
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

//
//    // D3 Projection
//    var projection = d3.geoAlbersUsa().translate([width / 2, height / 2]) // translate to center of screen
//                      .scale([1000]); // scale things down so see entire US
//
//// Define path generator
//    var path = d3.geoPath() // path generator that will convert GeoJSON to SVG paths
//                  .projection(projection);

     console.log("Length of data:"+data.length);
     var path = d3.geoPath();
     d3.json("https://d3js.org/us-10m.v1.json", function(error, us) {

        svg.append("g")
           .attr("class", "states")
           .selectAll("path")
           .data(topojson.feature(us, us.objects.states).features)
           .enter().append("path")
           .attr("d", path);

        svg.append("path")
            .attr("class", "state-borders")
            .attr("d", path(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; })));
        });

//     var myMap = new Map()
//
//    for (var i = 0; i < data.length; i++) {
//
//        var dataState = data[i].State;
//        var dataValue = data[i].Certified;
////        for (var j = 0; j < json.features.length; j++) {
////            var jsonState = json.features[j].properties.name;
////            if ( dataState == jsonState) {
////                json.features[j].properties.value = dataValue;
////                break;
////                }
////            }
//        myMap.set(dataState,dataValue);
//
//        }
//
//        svg.selectAll("path")
//        .data(json.features)
//        .enter()
//        .append("path")
//        .attr("d", path)
//        .style("stroke", "#fff")
//        .style("stroke-width", "1")
//        .style("fill", function(d) { return ramp(d.properties.value) });

}