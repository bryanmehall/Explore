window.app.vis = {
	nodes: [],
	links: [],
	displayObject:function(object){
		var objectContainer = object.accordianContainer;
		var objectDiv = document.getElementById('objectDiv')
		while (objectDiv.hasChildNodes()) { //make it update instead of replacing
			objectDiv.removeChild(objectDiv.lastChild);
		}
		var objRep = app.serializeElement(object)
		document.getElementById('jsonText').innerHTML = JSON.stringify(objRep, null, 2)
		objectDiv.appendChild(objectContainer)
	},
	init: function() {
		var width = 400,
			height = 400;

		var color = d3.scale.category10();
		var force = d3.layout.force()
			.nodes(app.vis.nodes)
			.links(app.vis.links)
			.charge(-200)
			.linkDistance(60)
			.size([width, height])
			.on("tick", tick);


		app.vis.svg = d3.select("#graphDiv").append("svg")
			.attr("width", width)
			.attr("height", height);

		app.vis.svg.append('defs').append('marker')
			.attr({
				'id': 'arrowhead',
				'viewBox': '-0 -5 10 10',
				'refX': 15,
				'refY': 0,
				'orient': 'auto',
				'markerWidth': 5,
				'markerHeight': 5,
				'xoverflow': 'visible'
			})
			.append('svg:path')
			.attr('d', 'M 0,-5 L 10 ,0 L 0,5')
			.attr('fill', '#000')
			.attr('stroke', '#000');

		var node = app.vis.svg.selectAll(".node"),
			link = app.vis.svg.selectAll(".link");


		
		
		
		app.vis.start = function() {
			link = link.data(force.links(), function(d) {
				return d.source.id + "-" + d.target.id;
			});
			
			link.enter()
				.insert("line", ".node")
				.attr("class", "link")
				.attr('marker-end', 'url(#arrowhead)')
				.attr("stroke", function(d) {
					return d.color
				});
			link.exit().remove();

			node = node.data(force.nodes(), function(d) {
				return d.id;
			});
			
			var objectDiv = document.getElementById('objectDiv')
			
			node.enter()
				.append("g")
				.attr("class", 'unselectable')
				.call(force.drag)
				.on("click", function(d) {
					app.vis.displayObject(d.object)
					
				}).append("text")
				.attr("dx", 0)
				.attr("dy", ".35em")
				.text(function(d) {
					return d.label;
				})

			node.select('text')
				.text(function(d) {
					return d.label;
				})
				.attr('fill', function(d) {
					return d.color
				})

			node.exit()
				.append('circle')
				.attr('r', 10)
				//.select('text')
				//.attr('fill', 'red')
			//remove();
			

			force.start();
		}

		function tick() {
			node.attr("transform", function(d) {
				return "translate(" + d.x + "," + d.y + ")";
			})
			
			link.attr("x1", function(d) {
					return d.source.x;
				})
				.attr("y1", function(d) {
					return d.source.y;
				})
				.attr("x2", function(d) {
					return d.target.x;
				})
				.attr("y2", function(d) {
					return d.target.y;
				});

		}
	}
}