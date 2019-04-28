
function render_state_map(){
        console.log("Loading statemap");
        draw_us_plot('/stateMap',"StateWise distribution of Visa Applications");
	}

function company_bar_chart(){
        console.log("Loading bar chart");
        draw_company_bar_plot('/companybar',"Top 20 companies of total Visa Applications");
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


function draw_company_bar_plot(url,title){
	$('#main_chart').empty();
	$.ajax({
	  type: 'GET',
	  url: url,
      contentType: 'application/json; charset=utf-8',

	  success: function(result) {
			console.log("logging at ajax call",title);
		    draw_company_chart(result,title);
	  },
	  error: function(result) {
	  	console.log(result);
		$("#main_chart").html(result);
	  }
	});

}


function draw_us_chart(data,title){


    console.log("Logging title:",title);

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

    var color = d3.scaleQuantile()
	      .domain([d3.min(data, function(d) { return +d.Certified; }), d3.max(data, function(d) { return +d.Certified; })])
	      .range(['#deebf7','#c6dbef','#AFE4FD','#9DE1FF','#AEDFF2','#9ecae1','#6baed6','#54CBFF','#42C0FB','#0BB5FF','#2171b5','#08519c','#08306b']);

    var final_data = d3.map();
    data.forEach(function(d) {
            final_data.set(+d.state_code, {
            State:d.State,
            Certified: +d.Certified,
            Denied:+d.Denied,
            Expired:+d.Expired});
    });

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
            .attr("fill",function(d){return color(final_data.get(+d.id).Certified)})
            .on('mouseover', function(d) {
                tip_disp.html( "<div>" +"State:&nbsp;"+final_data.get(+d.id).State +
                 "&nbsp;</br> " +"Certified:&nbsp;"+ final_data.get(+d.id).Certified + "&nbsp;"+
                 "&nbsp;</br> " +"Denied:&nbsp;"+ final_data.get(+d.id).Denied + "&nbsp;"+
                 "&nbsp;</br> " +"Expired:&nbsp;"+ final_data.get(+d.id).Expired + "&nbsp;"+

                 "</div>"
                ).style("color","blue").style("font-weight","bold")
                .style("font-size","110%").style("border","thin solid black")
                .style("border-radius","8px");
                tip_disp.show(this);
            })


    });
}



function draw_company_chart(data,title){

    console.log("Logging title:",title);
    var data=JSON.parse(data);
    console.log("Logging result:",data);


    var margin = {top: 30, right: 50, bottom: 40, left:40};
	var width = 800 - margin.left - margin.right;
	var height = 600 - margin.top - margin.bottom;


    var svg = d3.select('#main_chart')
			.append('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
		    .append('g')
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var text = svg.append('text')
                  .attr('width', width)
                  .attr('x', "14em" )
                  .attr('y', "1em")
                  .style('font-size', '1.5em')
                  .style('text-anchor', 'middle')
                  .text('Company wise  Visa Distribution')
  	              .style("fill", "black")

        // set the ranges
    var x = d3.scaleBand()
              .range([0, width])
              .padding(0.1);
    var y = d3.scaleLinear()
              .range([height, 0]);


     data.forEach(function(d) {
            d.Count = +d.Count1;
        });

    console.log("Changed Data:",data);
  // Scale the range of the data in the domains
  x.domain(data.map(function(d) { return d.employer_name; }));
  y.domain([0, d3.max(data, function(d) { return d.Count; })+1000]);


  svg.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.employer_name); })
      .attr("width", x.bandwidth())
      .attr("y", function(d) { return y(d.Count); })
      .attr("height", function(d) { return height - y(d.Count); });

  // add the x Axis
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).ticks(20))
      .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-90)");;

  // add the y Axis
  svg.append("g")
      .call(d3.axisLeft(y));





}