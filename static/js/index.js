
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

    var data=JSON.parse(data);
    console.log("Logging result:",data);


    var min_val=d3.min(data, function(d){return +d.Certified;})
    var max_val=d3.max(data, function(d){return +d.Certified;})
    console.log("Logging min val:",min_val,max_val)

    var margin = {top: 30, right: 50, bottom: 40, left:40};
	var width = 1200 - margin.left - margin.right;
	var height = 800 - margin.top - margin.bottom;


    var svg = d3.select('#main_chart')
			.append('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
		    .append('g')
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


//    var color=d3.scaleThreshold().domain([0,55]).range(["#1f77b4","#17becf"]);
    var color = d3.scaleLinear().domain([min_val, max_val]).range(['beige', 'red']);

//    var color = d3.scaleThreshold()
//            .domain(d3.range(2, 50).map(function(d) { return d * 1000; }))
//            .range(d3.schemeBlues[9]);


    var color = d3.scaleQuantile()
	      .domain([d3.min(data, function(d) { return +d.Certified; }), d3.max(data, function(d) { return +d.Certified; })])
	      .range(['#deebf7','#c6dbef','#AFE4FD','#9DE1FF','#AEDFF2','#9ecae1','#6baed6','#54CBFF','#42C0FB','#0BB5FF','#2171b5','#08519c','#08306b']);


    var final_data = d3.map();
  data.forEach(function(d) {
    final_data.set(+d.state_code, { State:d.State,Certified: +d.Certified });
  });

    console.log("final data:");
    console.log(final_data)
    var path=d3.geoPath();

    var text = svg.append('text')
                  .attr('width', width)
                  .attr('x', "14em" )
                  .attr('y', "1em")
                  .style('font-size', '1.5em')
                  .style('text-anchor', 'middle')
                  .text('Certified Visa Distribution Across US')
  	              .style("fill", "black")


    svg.append("g")
    .attr("class", "key")
    .attr("transform", "translate(0,0)")



    //d3.json("https://unpkg.com/us-atlas@1/us/10m.json",function(error,us){
    d3.json("https://d3js.org/us-10m.v1.json",function(error,us){
        if(error) throw error;

        var project=d3.geoIdentity().fitSize([width,height],topojson.feature(us,us.objects.states));
        //var path=d3.geoPath().projection(project);

//        svg.append("g")
//            .attr("class","state")
//            .selectAll("path")
//            .data(topojson.feature(us,us.objects.states).features)
//            .enter().append("path")
            //.attr("fill",function(d) { console.log("Inside color map:",d.id,+d.id);return color(+d.id);});


//        svg.append("path")
//            .datum(topojson.mesh(us,us.objects.states,function(a,b){return a!==b;}))
//            .attr("class","states")
//            //.attr('fill','none')
//            .attr("d",path)


//          svg.append("path")
//      .attr("fill", "none")
//      .attr("stroke", "#777")
//      .attr("stroke-width", 0.35)
//      .attr("d", path(topojson.mesh(us, us.objects.counties, function(a, b) { return (a.id / 1000 | 0) === (b.id / 1000 | 0); })));



//console.log('here is how the data map works', data);

   var tip_disp = d3.tip().attr('class', 'd3-tip').offset([-5, 0])
   svg.call(tip_disp);

  var states = topojson.feature(us, us.objects.states).features;

    svg.append("path")
      .attr("id", "nation")
      .attr("d", path(topojson.feature(us, us.objects.nation)));

    svg.append("path")
      .attr("fill", function(d){console.log("Inside mesh fill:",d)})
      .attr("stroke", "#777")
      .attr("stroke-width", 0.70)
      .attr("d", path(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; })))

  svg.selectAll('path.state')
      .data( states )
    .enter().append("path")
      .attr("d", path)
      .attr("stroke", "#aaa")
      .attr("stroke-width", 0.5)
      .attr("fill",function(d){ console.log("Inside fill:",+d.id);return color(final_data.get(+d.id).Certified)})
      .on('mouseover', function(d) {
        var name = d3.select(this);
		console.log("name:"+name);
		tip_disp.html( "<div style='color:blue,font-weight: bold,font-size: 150%;'>" +final_data.get(+d.id).State + ", " + final_data.get(+d.id).Certified + "</div>");
        tip_disp.show(this);
        //d3.select("#info").html(+d.id+", "+final_data.get(+d.id).State + ", " + final_data.get(+d.id).Certified )
      })

//https://www2.census.gov/geo/docs/reference/state.txt





    });
}