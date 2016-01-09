window.app.objectProto = {//contains shared methods of all objects
	subscribe: function (attributeTypeUUID, linkFunction){

		var targetObject = this.attributes[attributeTypeUUID];

		var bufferObject = {
			linkFunction: linkFunction,
			parentObject: this
		};

		if (this.attributePrimitiveBuffer.hasOwnProperty(attributeTypeUUID)){
			this.attributePrimitiveBuffer[attributeTypeUUID].push(bufferObject)
		} else {
			this.attributePrimitiveBuffer[attributeTypeUUID] = [bufferObject];
		};

		if (this.attributes.hasOwnProperty(attributeTypeUUID) &&targetObject.values.length !==0){
			targetObject.values.forEach(function(value){
				console.log('add functionality here')
			})
		}

	},
	
	initPrimitive: function(primitiveName, primitiveValue){

		var primitive = Object.create(app.primitives[primitiveName])
		primitive.dependentPrimitives = [];
		this.primitive = primitive;
		primitive.init(this)
		primitive.parseString(primitiveValue)
	},
	 
	addAttribute: function(attributeObject) { 
		var app = window.app
		var parentObject = this;
		var attributeUUID = attributeObject.uuid//parentTypeUUID || attributeObject.getAttributeByUUID('uuid for instance of property')
		//this.attributePrimitiveBuffer[attributeUUID] = []
		parentObject.attributes[attributeUUID] = {attribute:attributeObject, values:[]}
		this.addAttributeToObjectVisualization(attributeObject, [])
	},
	
	getAttributeByUUID: function(typeUUID, index){
		//add support for transitive relations
		return this.attributes[typeUUID].values
	},
	
	replaceObject: function (newObject){
		var dependentObjects = this.dependentObjects
		dependentObjects.forEach(function(reference){
			reference.dependentObject.setAttribute(reference.attributeType, newObject, reference.valueIndex)
			console.log('setting attribute', reference.attributeType, newObject)
		})
	},	
	
	extendAttribute: function (attributeType,value){

		var parentObject = this;
		var valuesList = this.attributes[attributeType].values

		switch(attributeType){
			case 'cbrqn2p9fplw1xrgbln80q9y':

				break;
		}
		valuesList.push(value)
		this.addValueToAttribute(attributeType, value)//look at maybe delete?
		if(this.attributePrimitiveBuffer.hasOwnProperty(attributeType)){
			var bufferList  = this.attributePrimitiveBuffer[attributeType];

			bufferList.forEach(function(buffer){

				buffer.linkFunction(value, valuesList.length)//-1 to make 0 indexed
				value.primitive.dependentPrimitives.push(buffer.parentObject.primitive)


			})
		}
	},
	
	removeAttributeValue: function (attributeType,value){//remove instance of 'value' from values of 'attributetype'
		//check cardinality
		//check for reflexive attributes
		//check if order matters
		var index = this.attributes[attributeType].values.indexOf(value)
		this.attributes[attributeType].values.splice(index,1)
		//update primitives
	},	
	
	removeAttribute: function (attributeType){

	},
	
	updateAttribute: function (attributeType, index){
		this.attributes[attributeType].values[index]
	},
	
	setAttributeToValue: function (attributeType, index, value){

	},
	
	addObjectToVisualization: function (){
		var obj = this
		var objectVisualization = document.createElement('div')
		d3.select(objectVisualization)
			.text('abc')

		this.accordianContainer = document.createElement('div')

		this.accordianContainer.style.marginTop = '10px'
		this.accordianContainer.className = 'accordianObject'
		this.accordianContainer.parentObject = this
		this.accordianContainer.addEventListener('click', function(e){
			e.stopPropagation()
			//app.select(obj)
		})

		//add uuid
		this.accordianContainer.innerText = obj.uuid
		//add visualization for primitive
		var primitiveDiv = document.createElement('div')
		var selector = document.createElement('select')

		Object.keys(app.primitives).forEach(function(name){
			var option = document.createElement('option')
			option.innerText = name
			option.value = name
			selector.appendChild(option)
		})

		primitiveDiv.appendChild(selector)

		var primitiveValue = this.primitive.save().value;
		var primitiveValueDiv = document.createElement('span')
		primitiveValueDiv.style.width = '100%'
		primitiveValueDiv.contentEditable = 'true'
		primitiveValueDiv.innerHTML = primitiveValue;
		primitiveDiv.appendChild(primitiveValueDiv)

		primitiveValueDiv.addEventListener('keyup', function(){
			obj.primitive.parseString(primitiveValueDiv.innerText)
		})
		selector.addEventListener('change', function(event){
			obj.initPrimitive(selector.value,primitiveValueDiv.innerText)
		});
		var primitiveName = this.primitive.save().name;
		selector.value = primitiveName;
		//obj.initPrimitive(selector.value,primitiveData.innerText)
		this.accordianContainer.appendChild(primitiveDiv)


		//add visualization for attributes
		var attributeDiv = document.createElement('div')
		attributeDiv.innerText = 'attributes'

		var attrListDiv = document.createElement('div')
		attrListDiv.setAttribute('class', 'attributeList')
		attrListDiv.style.marginLeft = '10px' 	

		var addAttributeButton = document.createElement('a')
		addAttributeButton.innerText = 'add attribute'
		addAttributeButton.title = 'add new attribute to this object'
		addAttributeButton.className = 'button'
		addAttributeButton.addEventListener('click', function(event){
			app.newObjectSelector(null, null, function(newObject,typeUUID){
				obj.addAttribute(newObject,typeUUID)
			})
		})

		attributeDiv.appendChild(attrListDiv)
		attributeDiv.appendChild(addAttributeButton)
		this.accordianContainer.appendChild(attributeDiv)

		//add node to graph

		if (obj.attributes.hasOwnProperty(app.tempTable.nameEn)){
			var label = 'name'
			var temp = obj.attributes[app.tempTable.nameEn].values[0].primitive.element
			console.log('naming object', temp)
		} else {
			console.log('attributes', obj.uuid, obj.attributes)
			var label = 'obj'
		}
		app.vis.nodes.push({id:obj.uuid, object:obj, label:label})
		app.vis.start()
		return this.accordianContainer
	},

	addAttributeToObjectVisualization: function(attributeObject, values){
		var obj = this
		var attributeListDiv = this.accordianContainer.querySelector('.attributeList')
		var attributeBlock = document.createElement('div')
		var attributeType = attributeObject.uuid;
		if(attributeObject.attributes.hasOwnProperty(app.tempTable.nameEn)){
			attributeBlock.innerText = attributeObject.attributes[app.tempTable.nameEn].values[0].primitive.element;
		} else {
			attributeBlock.innerText = attributeType;
		}


		attributeBlock.className = 'UUID'+attributeType;

		values.forEach(function(value){
			var valueDiv = document.createElement('div')
			valueDiv.innertext = value.uuid
		})

		attributeListDiv.appendChild(attributeBlock)

		var addValueButton = document.createElement('a')
		addValueButton.innerText = 'add value'
		addValueButton.title = 'add new value to this attribute'
		addValueButton.className = 'button'
		addValueButton.addEventListener('click', function(event){
			app.newObjectSelector(null, null, function(newObject, typeUUID){
				obj.extendAttribute(attributeType,newObject)
			})
		})

		attributeBlock.appendChild(addValueButton)
	},
	
	addValueToAttribute: function (attributeType, value){
		var obj = this;
		var valueListDiv = this.accordianContainer.querySelector('.UUID'+attributeType)
		var valueDiv = document.createElement('div')
		valueDiv.innerText = value.uuid;
		valueListDiv.appendChild(valueDiv)
		var getById = function(id){
			var nodes = app.vis.nodes;
			for (var i=0; i<nodes.length; i++){
				if (nodes[i].id === id){
					return nodes[i]
				}
			}
			console.log('didnt find any', id)
		}
		var source = getById(this.uuid)
		var target = getById(value.uuid)

		switch(attributeType){
			case app.tempTable.instanceOf:
				target.color = '#ccc'
				//app.vis.links.push({source: source, target: target, color:'#ccc'});
				break;
			case app.tempTable.nameEn:
				target.color = '#e5ffe1'
				source.label = target.object.primitive.element
				app.vis.start()
				break;
			default:
				target.color = '#000'
				app.vis.links.push({source: source, target: target, color:'black'});
		}

		app.vis.start()
	}
};