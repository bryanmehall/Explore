window.app.primitives = {
	
	dataFlowHandler:function(node){
		//perform topological sort on nodes
		//add run counter for eventual optimization
		var sorted = [];
		var visited = [];
		visitNode(node)
		
		console.log('visited',visited,sorted)
		function visitNode(n){
			var subscribers = n.dependentPrimitives
			if (visited.indexOf(n) !== -1){
				//if node has been visited then graph has circular dependency
				console.log('circular graph')
        		return
			}
			
			//if (n is a state modifier){
				//modify graph
			visited.push(n)
			if (subscribers.length === 0){
				sorted.push(n)
				delete visited[visited.indexOf(n)]
				console.log('reached leaf node')
			} else {
				subscribers.forEach(function(subscriber){
					visitNode(subscriber)
					
				})
			}
		}
	},
	none:{
		init:function(parentObject){
		},
		save:function(){
			return {name:'none', value:null}
		},
		parseString(input){}
	},
	
	attribute:{
		init:function(parentObject){
			this.parentObject = parentObject
			this.element = {
				cardinality:null,//type: integer
				extensive:null,//type: bool
				types:[], //any type
				instanceOf:null, //any type
				default:null, //any type
				reflexiveAttribute:null, //type: Property
				//should all of these be here?
				reflexive:null, // type:bool
				symmetric:null, //type: bool
				transitive: null
			}
		},
		save:function(){
			return {name:'file', value:null}
		},
		parseString(input){}
	},
	
	file:{
		init:function(parentObject){
		},
		save:function(){
			return {name:'file', value:null}
		},
		parseString(input){}
	},
	
	window:{
		init:function(parentObject){

			this.parentObject = parentObject;
			this.element = document.createElement('div');
			this.element.style.width = '200px'
			this.element.style.height = '200px'
			this.element.style.backgroundColor = '#b7b7b7'
			var appContainer = document.getElementById('appContainer')

			appContainer.appendChild(this.element);
		},
		save:function(){
			return {name:'window', value:null}
		},
		parseString(input){}
	},
	
	
	svgWindow:{
		init:function(parentObject){
			var primitive = this
			this.parentObject = parentObject;
			this.element = document.createElementNS('http://www.w3.org/2000/svg','svg');
			this.element.style.width = '300px'
			this.element.style.height = '300px'
			this.element.style.backgroundColor = '#aadeff'
			var appContainer = document.getElementById('appContainer')
			appContainer.appendChild(this.element);
			
			var childElementAttributeUUID = app.tempTable.childElements
			var childElementLinkFunction = function(childElement, index){
				var SVGElement = childElement.primitive.element
				console.log('svg element', childElement)
				primitive.element.appendChild(SVGElement)
			}
			parentObject.subscribe(childElementAttributeUUID, childElementLinkFunction)
		},
		save:function(){
			return {name:'svgWindow', value:null}
		},
		parseString(input){}
	},
	
	span:{
		init:function(parentObject){
			var primitive = this
			primitive.parentObject = parentObject
			primitive.element = document.createElement('span')

			var childElementAttributeUUID = app.tempTable.childElements
			var childElementLinkFunction = function(childElement, index){

				var element = childElement.primitive.element
				var subSpan;
				if (typeof element==='string'){
					subSpan = document.createElement('span')
					subSpan.innerText = element;
				} else {
					subSpan = element;
				}
				primitive.element.appendChild(subSpan)
			}
			parentObject.subscribe(childElementAttributeUUID, childElementLinkFunction)

			var parentElementAttributeUUID = app.tempTable.parentElement
			var parentElementLinkFunction = function(parentElement, index){
				parentElement.primitive.element.appendChild(primitive.element)
			}
			parentObject.subscribe(parentElementAttributeUUID, parentElementLinkFunction)
		},
		
		save:function(){
			return {name:'span', value:null}
		},
		parseString(input){},
		update:function(){

			var node = this.element
			while (node.hasChildNodes()) {//make it update instead of replacing
				node.removeChild(node.lastChild);
			}

			this.parentObject.attributes[app.tempTable.childElements].values.forEach(function(value){
				var element = value.primitive.element;
				var subSpan;
				if (typeof element==='string'){
					subSpan = document.createElement('span')
					subSpan.innerText = element;
				} else {
					subSpan = element;
				}

				node.appendChild(subSpan)
			})
		}
	},
	
	
	
	
	boolean:{
		init:function(parentObject){
			this.parentObject = parentObject;
		},
		save:function(){
			console.log(this.element)
			return {name:'boolean', value:this.element}
		},
		parseString:function(input){
			if (input === 'true'||input===true){
				this.set(true)
				return true
			} else if (input === 'false'||input===false) {
				this.set(false)
				return true
			} else {
				return false
			}
		},
		set:function(value){

			//console.log('string primitive set to ',value,'dependent',this.dependentPrimitives)
			this.element = value;
			this.update();
		},
		update:function(){
			this.dependentPrimitives.forEach(function(primitive){

				primitive.update()
			})
		}

	},
	
	
	
	
	string:{
		init:function(parentObject){
			this.parentObject = parentObject;

		},
		save:function(){
			return {name:'string', value:this.element}
		},
		parseString:function(input){
			this.set(input)
			return true
		},
		set:function(value){

			//console.log('string primitive set to ',value,'dependent',this.dependentPrimitives)
			this.element = value;
			this.update();
		},
		update:function(){

			this.dependentPrimitives.forEach(function(primitive){
				primitive.update()
			})
		}
	},
	
	
	
	
	IEEEFloatingPoint:{

		init:function(parentObject){
			this.element = 0
		},
		save:function(){
			return {name:'IEEEFloatingPoint', value:this.element}
		},
		parseString:function(input){
			this.set(parseInt(input))
			return true
		},
		set:function(value){

			//console.log('string primitive set to ',value,'dependent',this.dependentPrimitives)
			console.log('number update to',value)
			
			this.element = value;
			app.primitives.dataFlowHandler(this)
			this.update();
		},
		update:function(){
			this.dependentPrimitives.forEach(function(primitive){
				primitive.update()
			})
		}
	},	
	
	
	
	
	additionOperator:{

		init:function(){},
		save:function(){
			return {name:'additionOperator', value:null}
		},
		element:null,
		parseString:function(input){
			return true
		},
		set:function(value){

			//console.log('string primitive set to ',value,'dependent',this.dependentPrimitives)
		},
		update:function(){
			
			this.dependentPrimitives.forEach(function(primitive){
				primitive.update()
			})
		}
	},
	
	
	rectangle:{
		//expects to be in an object with width attribute, height attribute
		init:function(parentObject){
			this.parentObject = parentObject;
			this.element = document.createElementNS('http://www.w3.org/2000/svg','rect')
			var rect = this.element
			rect.setAttribute('height', 10)
			rect.setAttribute('width', 10)
			
			var widthAttributeUUID = app.tempTable.width
			var widthLinkFunction = function(widthObject, index){
				rect.setAttribute('width', widthObject.primitive.element)
			}
			parentObject.subscribe(widthAttributeUUID,widthLinkFunction)
			
			var heightAttributeUUID = app.tempTable.height
			var heightLinkFunction = function(heightObject, index){
				rect.setAttribute('height', heightObject.primitive.element)
				
			}
			parentObject.subscribe(heightAttributeUUID,heightLinkFunction)
			
		},
		parseString:function(input){
			return true
		},
		save:function(){
			return {name:'rectangle', value:null}
		},
		set:function(value){

			//console.log('string primitive set to ',value,'dependent',this.dependentPrimitives)
		},
		update:function(){
			console.log('updating rectangle')
			var rect = this.element
			var height = this.parentObject.attributes[app.tempTable.height].values[0].primitive.element
			rect.setAttribute('height', height)
			var width = this.parentObject.attributes[app.tempTable.width].values[0].primitive.element
			rect.setAttribute('width',width)
			this.dependentPrimitives.forEach(function(primitive){
				primitive.update()
			})
		}
	},
	
	numberTextRepresentation:{
		//expects to be in object with parent concept attribute with js number as primitive element
		init:function(parentObject){
			var primitive = this
			primitive.parentObject = parentObject
			primitive.element = document.createElement('span')
			primitive.element.contentEditable = true
			primitive.element.className = 'mathText'
			primitive.element.addEventListener('input', function(){
				var text = primitive.element.textContent
				var number = parseInt(text)
				primitive.parentObject.attributes[app.tempTable.parentConcept].values[0].primitive.set(number)
				
			})
			primitive.element.addEventListener('click', function(){
				app.vis.displayObject(parentObject)
			})//get rid of this once events are handled within the language
			
			var parentConceptAttributeUUID = app.tempTable.parentConcept
			var parentConceptLinkFunction = function(parentNumber, index){

				var number = parentNumber.primitive.element
				var stringRep = number.toString();
				primitive.element.innerText = stringRep;
			}
			parentObject.subscribe(parentConceptAttributeUUID, parentConceptLinkFunction)

			var parentElementAttributeUUID = app.tempTable.parentElement
			var parentElementLinkFunction = function(parentElement, index){
				parentElement.primitive.element.appendChild(primitive.element)
			}
			parentObject.subscribe(parentElementAttributeUUID, parentElementLinkFunction)

		},
		
		save:function(){
			return {name:'numberTextRepresentation', value:null}
		},
		
		parseString(input){
			var number = parseInt(input)
			if (! isNaN(number)){

				this.parentObject.attributes[app.tempTable.parentConcept].values[0].primitive.set(number)
				return true
			} else {
				return false
			}
		},
		update:function(){
			
			var number = this.parentObject.attributes[app.tempTable.parentConcept].values[0].primitive.element
			var stringRep = number.toString();
			if (stringRep !== this.element.innertext){
				this.element.innerText = stringRep;

				this.dependentPrimitives.forEach(function(primitive){
					primitive.update()
				})
			}
			
		}
	}
}