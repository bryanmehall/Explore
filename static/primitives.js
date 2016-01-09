window.app.primitives = {
	none:{
		init:function(parentObject){
		},
		save:function(){
			return {name:'none', value:null}
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
				var element = value.primitive.element
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
			this.element = value;
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
	numberTextRepresentation:{
		init:function(parentObject){
			var primitive = this
			primitive.parentObject = parentObject
			primitive.element = document.createElement('span')

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
			this.element.innerText = stringRep;

			this.dependentPrimitives.forEach(function(primitive){
				primitive.update()
			})
		}
	}
}