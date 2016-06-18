window.app.objectProto = {//contains shared methods of all objects
	//primitive methods
	vis:{},




	//*********************helpers********************************


	setId: function(newId){
		this.uuid = newId
		console.log(app.objectCache)
	},

	setUUID: function(newId){
		this.uuid = newId;

	},

	/**
	 * Links the current object with a primitive assiciated with a specific attribute with Link function
	 * @param {UUID} attributeTypeUUID uuid of attribute to link with
	 * @param {function} linkFunction      function to execute upon linking
	 */
	subscribe: function (attributeTypeUUID, linkFunction){//move to primitive?
		console.log('subscribing', this.uuid,'to', attributeTypeUUID)
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
	
	/**
	 * Initializes primitive for object
	 * @param {string} primitiveName  string name of primitive
	 * @param {[[Type]]} primitiveValue value for parseString function to parse
	 */
	initPrimitive: function(primitiveName, primitiveValue){
		console.log('initializing',this.uuid,primitiveName)
		var primitive = Object.create(app.primitives[primitiveName])
		primitive.dependentPrimitives = [];
		this.primitive = primitive;
		primitive.init(this)
		primitive.parseString(primitiveValue)
		return this
	},
	 
	//attributeMethods
	
	/**
	 * Returns value of attribute of type typeUUID 
	 * @param   {UUID}     typeUUID UUID of attribute to search for
	 * @param   {jsNumber} index    maybe expand to include Lynx integers
	 * @returns {jsArray} [[Description]]
	 */
	getAttributeByUUID: function(typeUUID, index){
		
		if (this.hasOwnProperty('primitive') && this.primitive.type === ''){//handle getting attributes of attributes
			
		}
		var attributeDescriptor = this.attributes[typeUUID];
		
		//add support for transitive relations
		return this.attributes[typeUUID].values
	},

	

	hasAttribute: function(type){
		return this.attributes.hasOwnProperty(type)
	},
	
	isAnAttribute: function(){
		return this.hasOwnProperty('primitive') && this.primitive.type === "attribute"
	},
	
	getAttrs: function(){
		var attrs = [] 
		Object.keys(this.attributes).forEach(function(attrId){
			attrs.push(this.attributes[attrId].attribute)
		})
		return attrs
	},
	/**
	 * Adds instance of attribute given by attributeObject to the parent object
	 * @param {Object} attributeObject 
	 */
	addAttribute: function(attributeObject) {
		var app = window.app
		var parentObject = this;

		var attributeUUID = attributeObject.uuid
		if (this.attributes.hasOwnProperty(attributeUUID)){
			console.log('already has attribute',this.attributes,attributeUUID)
		} else if (this.isAnAttribute()){
			console.log('attribute id', attributeUUID)
			this.attributes[attributeUUID] = {attribute:attributeUUID, values:[]};
			this.addAttributeToObjectVisualization({uuid:attributeUUID, attributes:{}}, [])
		} else {
			var newAttributeObject = app.createInstance(attributeObject)
			var attributeDescriptor = {attribute:newAttributeObject, values:[]}
			parentObject.attributes[attributeUUID] = attributeDescriptor;
			this.addAttributeToObjectVisualization(attributeObject, [])
		}
		return this
	},
	

		/**
	 * Remove attribute from object and 
	 * @param {[[Type]]} attributeType [[Description]]
	 */
	removeAttribute: function (attributeType){
		//remove primitive connections
		delete this.attributes[attributeType]
		console.log(this.attributes)
		this.removeAttributeFromVisualization(attributeType)
	},

	getAttrValues: function(attributeObject){
		//current format: attrID{attribute:attributeObject, values:[]}
		//new format: map attributeObject:set
		//make the current setup work with attribute object instead of id
		Object.keys(this.attributes).forEach(function(key){
			var descriptor = this.attributes[key];
			if (descriptor.attribute === attributeObject){
				return descriptor.values
			}
		})
		console.log('attributeObject did not match')
	},
	/**
	 * Adds value to the list of values for this objects attribute
	 * @param {UUID} attributeType [[Description]]
	 * @param {object}   value         [[Description]]
	 */
	extendAttribute: function (attributeObject,value){
		console.log('extending attribute', attributeObject, value)
		var attributeId = attributeObject.uuid
		var parentObject = this;
		console.log('a',this.attributes)
		var valuesList = this.attributes[attributeId].values
		
		valuesList.push(value)
		this.addValueToAttribute(attributeId, value)//adds to visualization--should be a different name

		value.dependents.push({attribute:attributeId, value:this})
		if(this.attributePrimitiveBuffer.hasOwnProperty(attributeId)){
			var bufferList  = this.attributePrimitiveBuffer[attributeId];

			bufferList.forEach(function(buffer){
				console.log('buffer',buffer)
				buffer.linkFunction(value, valuesList.length)//-1 to make 0 indexed
				value.primitive.dependentPrimitives.push(buffer.parentObject.primitive)
			})
		}
		return this
	},

	removeAttributeValue: function (attributeType,value){//remove instance of 'value' from values of 'attributetype'
		//check cardinality
		//check for reflexive attributes
		//check for default values
		//check if order matters
		//remove from dependents
		this.removeValueFromVisualization(attributeType,value)
		var index = this.attributes[attributeType].values.indexOf(value)
		console.log('index', index)
		this.attributes[attributeType].values.splice(index,1)
		//update primitives
	},
	
	

	
	/**
	 * Replaces object with another --more rigerous definition still needed
	 * @param {object} newObject [[Description]]
	 */
	replaceWith: function (newObject){
		var updated = [];
		
		console.log('dependents', this.dependents)
		var dependents = this.dependents
		var oldObject = this;
		//be careful of modifying state and then expecting something else
		Object.keys(newObject.attributes).forEach(function(type){
			if (oldObject.hasAttribute(type)){
				//loop through attribute values
				oldObject.attributes[type].values.forEach(function(oldValue,index){
					//check for loop condition
					if (updated.indexOf(oldValue)===-1){
						var newValue = newObject.attributes[type].values[index]
						updated.push(newValue)
						oldValue.replaceWith(newValue)
					}
				})
			} 
		})
		
		dependents.forEach(function(reference){
			console.log(reference.attribute, oldObject, newObject)
			reference.value.removeAttributeValue(reference.attribute, oldObject)
			reference.value.extendAttribute(reference.attribute, newObject)
		})
		
		
	},
	
 	remove: function(){
 		var uuid = this.uuid
		$.ajax({
			type: 'GET',
			url: '/object/delete/'+uuid,
			data: '',
			success: function(response) {
				console.log("Deleted "+uuid)
			},
			error: function(err) {
				console.log('error posting to server...');
				console.log(err);
			}
		});
	},





	//object visualization methods
	createObjectVisualization: function(){
		var obj = this;
		
		//create tree
		this.vis.tree = d3.select(document.createElement('div'))
			.style('marginTop', '10px')
		var tree = this.vis.tree
		
		//add label
		tree.idLabel = tree.append('span')
			.text(this.uuid)
		
		//add replace button
		tree.replaceButton = tree.append('button')
			.text('replace')
			.on('click', function(){app.newObjectSelector(null, null, function(newObject,typeUUID){
				obj.replaceWith(newObject)
			})})
		
		//add primitive information
		tree.primitiveDiv = tree.append('div')
		var primitiveDiv = tree.primitiveDiv
		primitiveDiv.selector = primitiveDiv.append('select')
			.attr('value', this.primitive.save().name)
			.on('change', function(){
				obj.initPrimitive(this.value, primitiveDiv.text.node().innerText)
			})
		
		Object.keys(app.primitives).forEach(function(name){
			primitiveDiv.selector.append('option')
				.text(name)
				.attr('value',name)
		})
		
		
		var primitiveValue = this.primitive.save().value;
		primitiveDiv.text = primitiveDiv.append('input')
			.text('primitiveValue')
			.attr('contentEditable', true)
			.on('keyup',function(){
			console.log(this.value)
				obj.primitive.parseString(this.value)
			})
		
			
		tree.attributeDiv = tree.append('div')
		tree.addAttributeButton = tree.append('button')
			
	
	},
	addObjectToVisualization: function (){//old version of createObjectVisualization
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
		})

		//add uuid
		this.accordianContainer.innerText = obj.uuid
		var replaceButton = document.createElement('button')
		replaceButton.innerText = 'replace'
		replaceButton.addEventListener('click', function(){
			app.newObjectSelector(null, null, function(newObject,typeUUID){
				obj.replaceWith(newObject)
			})
		})
		this.accordianContainer.appendChild(replaceButton)
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
			obj.initPrimitive(selector.value, primitiveValueDiv.innerText)
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

		var label = app.vis.getDisplayText(obj)
		
		app.vis.nodes.push({id:obj.uuid, object:obj, label:label})
		app.vis.start()
		return this.accordianContainer
	},
	
	addAttributeToObjectVisualization: function(attributeObject, values){
		var obj = this
		var attributeListDiv = this.accordianContainer.querySelector('.attributeList')
		var attributeBlock = document.createElement('div')
		var attributeType = attributeObject.uuid;
		//if(attributeObject.attributes.hasOwnProperty(app.tempTable.nameEn)){
		//	attributeBlock.innerText = attributeObject.attributes[app.tempTable.nameEn].values[0].primitive.element;
		//} else {
		attributeBlock.innerText = app.vis.getDisplayText(attributeObject);
		attributeBlock.addEventListener('click',function(){
			app.vis.displayObject(attributeObject)//breaks for attribute of attribute
		})
		//}

		console.log(attributeType)
		attributeBlock.className = 'UUID'+attributeType;

		values.forEach(function(value){
			var valueDiv = document.createElement('div')
			valueDiv.innertext = value.uuid
		})

		attributeListDiv.appendChild(attributeBlock)

		var addValueButton = document.createElement('button')
		addValueButton.innerText = '+'
		addValueButton.title = 'add new value to this attribute'
		addValueButton.className = 'button'
		addValueButton.addEventListener('click', function(event){
			app.newObjectSelector(null, null, function(newObject, typeUUID){
				obj.extendAttribute(attributeType,newObject)
			})
		})

		
		var removeAttributeButton = document.createElement('button')
		removeAttributeButton.innerText = 'x'
		removeAttributeButton.title = 'remove attribute and values from object'
		removeAttributeButton.addEventListener('click', function(event){
			obj.removeAttribute(attributeType)
		})
		attributeBlock.appendChild(addValueButton)
		attributeBlock.appendChild(removeAttributeButton)
	},
	
	removeAttributeFromVisualization:function(attributeType){
		var attributeBlock = this.accordianContainer.querySelector('.UUID'+attributeType)
		this.accordianContainer.querySelector('.attributeList').removeChild(attributeBlock)
	},

	removeValueFromVisualization: function(attributeType, value){
		//find link with correct source, target and attribute id
		var currentId = this.uuid
		var link = app.vis.links.filter(function(linkData){
			console.log('linkData', linkData)
			return linkData.source.id === currentId && linkData.target.id === value.uuid && linkData.attrId === attributeType
		})[0]
		var index = app.vis.links.indexOf(link)
		if (index > -1) {
			app.vis.links.splice(index, 1);
		}
		app.vis.start()
		
	},
	
	addValueToAttribute: function (attributeType, value){
		//console.log('adding value to attribute')
		console.log(attributeType,value)
		var obj = this;
		console.log(this.accordianContainer, attributeType)
		var valueListDiv = this.accordianContainer.querySelector('.UUID' + attributeType)
		var valueDiv = document.createElement('div')
		var label = app.vis.getDisplayText(value)
		valueDiv.innerText = label;
		valueDiv.addEventListener('click',function(){
			app.vis.displayObject(value)
		})
		valueListDiv.appendChild(valueDiv)
		var getById = app.vis.getById
		var source = getById(this.uuid)
		var target = getById(value.uuid)
		switch(attributeType){
			case app.tempTable.instanceOf:
				target.color = '#ccc'
				app.vis.links.push({source: source, target: target, color:'#ccc'});
				break;
			case app.tempTable.textRepresentation:
				app.vis.links.push({source: source, target: target, attrId:attributeType, color:'#ffa5a5'});
				break;
			case app.tempTable.nameEn:
				target.color = '#9fd397'
				console.log(source,target)
				app.vis.links.push({source: source, target: target, color:'#ccffcc'});
				//source.label = target.object.primitive.element
				app.vis.start()
				break;
			default:
				target.color = '#000'
				app.vis.links.push({source: source, target: target, attrId:attributeType, color:'black'});
		}

		app.vis.start()
	}
};