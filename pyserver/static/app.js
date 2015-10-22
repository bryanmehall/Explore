"use strict";
window.app = {
	objectCounter: 0,
	mapCreation: true,
	visualizeGraph: false,
	typeTable: {},
	nameTable: {},
	fileObjects: [],
	
	objectProto: {//contains shared methods of all objects
		subscribe: function (attributeTypeUUID, callback){
			var targetObject = this.attributes[attributeTypeUUID];
			
			if (targetObject != undefined){
				targetObject.primitive.dependantPrimitives.push(this.primitive)
				callback(primitive);
			}
			else{
				var x = this.attributePrimitiveBuffer[attributeTypeUUID];
				this.attributePrimitiveBuffer[attributeTypeUUID] = (x === undefined) ? [] : x;
				this.attributePrimitiveBuffer[attributeTypeUUID].push({primitive:this.primitive, callback:callback});
			}
		},
		initPrimitive: function(primitiveName, primitiveValue){
			var primitive = Object.create(app.primitives[primitiveName])
			primitive.dependantPrimitives = [];
			this.primitive = primitive;
			primitive.init(this)
			primitive.parseString(primitiveValue)
			console.log('adding primitive')
		},
		addAttribute: function (attributeObject, inheritedUUID){ 
			var app = window.app
			var parentObject = this;
			
			parentObject.attributes[inheritedUUID] = {attribute:attributeObject, values:[]}
			console.log(attributeObject)
			this.addAttributeToObjectVisualization(inheritedUUID, [])
			
		},	
		newAddAttribute:function (attributeType, values){
			var app = window.app
			var parentObject = this;
			values = values || []
			//values.forEach(function(value,valueIndex){
				//if (app.visualizeGraph){app.graph.addLink(parentObject.id.toString(),value.id.toString())}
				//value.dependantObjects.push({attributeType:attributeType, valueIndex:valueIndex, dependantObject:parentObject})
			//})
			//var propertyObject = app.synchronousCreateObject(attributeType)
			
			//do all type checking here
			this.attributes[attributeType] = {property:attributeType, values:values}
			
			
			if (this.attributePrimitiveBuffer.hasOwnProperty(attributeType)&&this.hasOwnProperty('primitive')) {//attribute primitive buffer enumerates all of the objects that its own primitive depends on so 
				this.attributePrimitiveBuffer[attributeType].forEach(function(primitiveLink){
					values.forEach(function(value){
						value.primitive.dependantPrimitives.push(primitiveLink.primitive)
					})
					primitiveLink.callback(values)
				})
			}
			this.addAttributeToObjectVisualization(attributeType, values)
		},	
		findAttribute:function (attributeTypeString){
			//eventually find in the prefered language
			var object = this
			//Object.keys(object.attributes).forEach()
		},
		replaceObject: function (newObject){
			var dependantObjects = this.dependantObjects
			dependantObjects.forEach(function(reference){
				reference.dependantObject.setAttribute(reference.attributeType, newObject, reference.valueIndex)
				console.log('setting attribute', reference.attributeType, newObject)
			})
		},		
		extendAttribute: function (attributeType,value){
			//check cardinality
			
			this.attributes[attributeType].values.push(value)
			this.addValueToAttribute
			//add reading of attributePrimitive buffer
		},
		referenceAttribute: function (parentObject, attributeType, valueIndex){//get rid of this. just have the value be what is intended and then deal with it in the replace attribute
			var value = parentObject.attributes[attributeType].values[valueIndex]
			value.dependantObjects.push(this)
			return value
		},
		removeAttributeValue: function (attributeType,value){//remove instance of 'value' from values of 'attributetype'
			//check cardinality
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
			this.accordianContainer = document.createElement('div')
			this.accordianContainer.style.marginLeft = '10px'
			this.accordianContainer.style.marginTop = '10px'
			
			this.accordianContainer.addEventListener('click', function(e){
				e.stopPropagation()
				app.select(obj)
				document.getElementById('jsonText').innerText = app.serializeObject(obj)
			})
			
			if (this.hasOwnProperty('primitive')){
				var primitiveDiv = document.createElement('div')
				var primitiveData = this.primitive.save();
				primitiveDiv.innerText = 'primitive:'+primitiveData.name+' '+primitiveData.value
				this.accordianContainer.appendChild(primitiveDiv)
			}
			
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
					console.log('outside add attribute', typeUUID)
					obj.addAttribute(newObject,typeUUID)
				})
			})
			
			
			
			
			attributeDiv.appendChild(attrListDiv)
			attributeDiv.appendChild(addAttributeButton)
			this.accordianContainer.appendChild(attributeDiv)
			return this.accordianContainer
		},
		addAttributeToObjectVisualization: function(attributeType, values){
			var obj = this
			var attributeListDiv = this.accordianContainer.querySelector('.attributeList')
			var attributeBlock = document.createElement('div')
			attributeBlock.innerText = attributeType;
			attributeBlock.class = attributeType;
			values.forEach(function(value){
				attributeBlock.appendChild(value.accordianContainer)
			})
			
			attributeListDiv.appendChild(attributeBlock)
			
			var addValueButton = document.createElement('a')
			addValueButton.innerText = 'add value'
			addValueButton.title = 'add new value to this attribute'
			addValueButton.className = 'button'
			addValueButton.addEventListener('click', function(event){
				app.newObjectSelector(null, null, function(newObject, typeUUID){
					obj.extendAttribute(typeUUID,newObject)
				})
			})
			
			attributeBlock.appendChild(addValueButton)
		},
		addValueToAttribute: function (attributeType){
        	var obj = this;
			var valueListDiv = this.accordianContainer.querySelector('.'+attributeType)
			console.log(valueListDiv)
			
        }
	},
	
    
	searchTemplates:function(searchTerm,cb){
		$.ajax({
			type: 'POST',
			url: '/core/query_objects',
			data: searchTerm,
			success: function(response) {
				cb(JSON.parse(response))
			},
			error: function(err) {
				console.log('error posting to server...');
				console.log(err);
			}
		});
	},
	
	searchObjects:function(searchTerm,numberOfResults){
		console.log('add searching functionality')
		Object.keys(app.nameTable).forEach(function(){
		})
		return []
	},
	
	newObjectSelector:function(typeRestrictions, eventLocation, cb){
		var typeRestrictions = typeRestrictions || [];
		var box = document.createElement('div');
		app.selectingObject = true;
		box.style.position = 'absolute'
		box.style.top = '100px'
		box.style.backgroundColor = '#fafafa'
		var textArea = document.createElement('input');
		box.appendChild(textArea)
		
		var options = document.createElement('div')
		box.appendChild(options)
		var appDiv = document.getElementById('appContainer')
		appDiv.appendChild(box)
		
		document.addEventListener('keyup', function(event){
			if (event.keyCode === 27){
				appDiv.removeChild(box)
				app.selectingObject = false
			}
		})
		
		var inputChangeHandler = function() {
			var newOptions = document.createElement('div');
			var updateMatchList = function(matches){
				matches.forEach(function(item) {
					var itemDom = document.createElement('div');
					itemDom.innerText = item[2];
					newOptions.appendChild(itemDom)
					box.replaceChild(newOptions, options)
					options = newOptions
				})
			}
			
			if (textArea.value[0] === '\\'){
				var searchTerm = textArea.value.slice(1)
				app.searchTemplates(searchTerm,function(matches){
					if (matches.length === 1) {
							appDiv.removeChild(box)
							//if (app.fileObject.attributes.PselectedObjects.values.length === 1){	
							//	app.fileObject.attributes.PselectedObjects.values[0].replaceObject(app.createObject(matches[0].templateID,{},function(){}))
							//}else{
							var singleMatch = matches[0][1]
							app.asyncCreateInstance(singleMatch, function(ob){
								app.selectingObject = false
								var accordian = ob.addObjectToVisualization()
								document.getElementById('accordianContainer').appendChild(accordian)
								
								cb(ob,singleMatch)
								})
								//app.createObject(matches[0].[3],{},function(){})
							//}
					}
					updateMatchList(matches)
				})	
			} else {
				var numberOfResults = 10
				var matches = app.searchObjects(this.value,numberOfResults)
				if (matches.length === 1){
					
				} else {
					updateMatchList(matches)
				}
			}
			
				
		}
		textArea.addEventListener('keyup', inputChangeHandler)
		textArea.focus()
	},
	
	select: function(selectedObject){//should this be a method of the object?
		if(!window.event.shiftKey) {
			app.fileObject.attributes.eyh5mcvd0a7hz3t6b7z8vhtp.values.forEach(function(object){
				app.deSelect(object)
			})
		}
		selectedObject.accordianContainer.style.backgroundColor = '#ffaaaa'
		this.fileObject.extendAttribute('eyh5mcvd0a7hz3t6b7z8vhtp', selectedObject)
		//selectedObject.attributes.Pselected.values[0].primitive.set(true)
		
	},
	
	deSelect: function(selectedObject){
		selectedObject.accordianContainer.style.backgroundColor = 'white'
		//selectedObject.attributes.Pselected.values[0].primitive.set(false)
		this.fileObject.removeAttributeValue('eyh5mcvd0a7hz3t6b7z8vhtp',selectedObject)
		
	},
	
	fileReference: function(path){
		var referencedObject = app.fileObject
			path.forEach(function(pathElement){
				referencedObject = referencedObject.attributes[pathElement].value
			})
		//console.log('returning absolute file path', referencedObject)
		return referencedObject
	},
	
	mergeAttributes: function(object1, object2){
		Object.keys(object1.attributes).forEach(function(attributeType){
			var matchIndex = Object.keys(object2.attributes).indexOf(attributeType)
		})
	},
	
	templateCache: {},
	
	loadTemplate: function(templateID, callback) {
		var app = this;
		if (app.templateCache[templateID] === undefined) {
		
			$.getJSON('/templates/'+templateID, function(template) {
				app.templateCache[templateID] = template;
				var remainingAJAXRequests = template.includedObjects.length
				if (remainingAJAXRequests === 0){callback(template)}
				template.includedObjects.forEach(function(ID) {
					app.loadTemplate(ID, function(innerTemplate) {
						remainingAJAXRequests -=1;
						if (remainingAJAXRequests === 0) {
							callback(template);
						}
					})
				})
				
			})
			.fail(function(a, b, c) {
			
				console.log('failed to load valid JSON file check that file is valid and there', templateID, a, b, c)
			})
		}
		else {
			callback(app.templateCache[templateID])
		}
	},
	
	newTemplate : function(user, json, nameEn,cb){//move to app file
		var newTemplatePath = '/'+user+'/newTemplate'
		var test = $.ajax({
					type: 'POST',
					url: newTemplatePath,
					data: JSON.stringify({nameEn:nameEn, json:json}),
					success: function(response) {
						console.log('sent to server', response)
						cb(response);
					},
					error: function(err) {
						console.log('error posting to server...');
						console.log(err);
					}
				});
	},
	
	asyncCreateObject : function(templateUUID,cb) {
		var app = this;
		app.loadTemplate(templateUUID,function(template){
			var newObject = app.synchronousCreateObject(template)
			cb(newObject);
		})
	},
	
	asyncCreateInstance : function(parentUUID,cb) {
		var app = this;
		var newObject;
		var create = function(){
			newObject = app.synchronousCreateInstance(parentUUID)
			app.newTemplate('core', 'instanceTest','',function(newUUID){
				newObject.uuid = newUUID;
				cb(newObject);
			})
			
		};
		
		
		if (!app.typeTable.hasOwnProperty(parentUUID)){
			app.asyncCreateObject(parentUUID, function(parentObject){
				app.typeTable[parentUUID] = parentObject
				create();
				
			})
		} else {
			create();
		}

	},
	
	synchronousCreateInstance:function(templateUUID){
		var app = this
		var newObject = Object.create(app.objectProto)
		newObject.attributes = {};

		if (!app.typeTable.hasOwnProperty(templateUUID)){ 
			console.log('need to call asyncCreateInstance')
		}
		//if version numbers do not match ask the user if they want to run a merge operation
		var templateObject = app.typeTable[templateUUID]
		
		if (templateObject.hasOwnProperty('primitive')){
			var primitiveString = templateObject.primitive.save()
			newObject.initPrimitive(primitiveString.name, primitiveString.value)
		}
		newObject.addObjectToVisualization()
		var instanceOfProperty = app.synchronousCreateObject(app.templateCache['bbl3gf7bk9jvb3zqqr43zvpm'])
		newObject.addAttribute(instanceOfProperty, 'bbl3gf7bk9jvb3zqqr43zvpm')
		console.log(newObject)
		Object.keys(templateObject.attributes).forEach(function(attributeKey){//this needs fixing
			var attributeObject = app.synchronousCreateInstance(attributeKey)
			newObject.addAttribute(attributeObject, templateUUID)//possible loop created here
			templateObject.attributes[attributeKey].values.forEach(function(attributeValue){
				newObject.extendAttribute(attributeKey,attributeValue)
			})
		})
		
		return newObject
	},
	
	synchronousCreateObject:function(template){//loads the objects in the template if it can be guaranteed that all objects in dependant objects are loaded
		var app = this
		var newObject = Object.create(app.objectProto)
		newObject.attributes = {}
		newObject.attributePrimitiveBuffer = {};
		var referenceTable = {}
		var parentTypeObject = undefined;
		//check type of object. if its type exists in typeTable then reference it else create it
		if (template.hasOwnProperty('uuid')){
			newObject.uuid = template.uuid
		}
		template.attributes.forEach(function(attributeTemplate){
			if (attributeTemplate.type === 'P0'){
				
				var typeString = attributeTemplate.values[0].primitive.value
				if (app.typeTable.hasOwnProperty(typeString)){
					console.log('using existing template')
					parentTypeObject = app.typeTable[typeString]
				} else {
					console.log('creating new template', typeString)
					
					parentTypeObject = app.synchronousCreateObject(expType)//the problem is that exp type is not the template for a span
					console.log('pto',parentTypeObject)
					app.typeTable[typeString] = parentTypeObject
				}
			} 
		})
		
		if (template.hasOwnProperty('primitive')){
			newObject.initPrimitive(template.primitive.name, template.primitive.value)
		}
		//newObject.debugVisualizer = new app.debugVisualizer()
		newObject.addObjectToVisualization()
		//check name of object in current language (En only for now) and then add it to a name table
		
		var parseValuesList = function(valuesList){
			var values = []
			valuesList.forEach(function(subTemplate){
				if (subTemplate.hasOwnProperty('@ref')){
					values.push(referenceTable[subTemplate['@ref']])
				} 
				else if (subTemplate.hasOwnProperty('globalRef')){
					values.push(app.fileObject.attributes[subTemplate.globalRef].values[index])
				} else{
					var value = app.synchronousCreateObject(subTemplate)
					values.push(value)
					referenceTable[subTemplate['@id']] = value
				}
			})
			return values
		}
		if (parentTypeObject !== undefined){ //if object has a parentType
			Object.keys(parentTypeObject.attributes).forEach(function(parentTypeAttributeKey){
			
				template.attributes.forEach(function(attributeTemplate){
					if (parentTypeAttributeKey === attributeTemplate.type){
						console.log('replace type attribute:', parentTypeAttributeKey, 'with a specific instance')
						newObject.newAddAttribute(attributeTemplate.type, parseValuesList(attributeTemplate.values))
						return
					}
				})
				newObject.newAddAttribute(parentTypeAttributeKey,parentTypeObject.attributes[parentTypeAttributeKey].values)
				
			})
		} else {
			template.attributes.forEach(function(attributeTemplate){
				//eventuallty use add attribute function here right now it just adds the values template to the attributes list
				
				newObject.newAddAttribute(attributeTemplate.type, parseValuesList(attributeTemplate.values)) 
			})
		}
		
		return newObject
	},
	
	serializeObject:function(object){
		var referenceTable = []
		var requiredTemplates = []
		var serializeLevel = function(object){//serialize single level of an object so that reference table is abstracted
			var obj = {}
			var attr = []
			if (object.hasOwnProperty('uuid')){
				obj.uuid = object.uuid
			}
			if (object.hasOwnProperty('primitive')){
				obj.primitive = object.primitive.save()
			}
			
			
			var referenceId = referenceTable.indexOf(object)
			if (referenceId === -1){
				obj['@id'] = referenceTable.length
				referenceTable.push(object)
			} else {
				return {'@ref':referenceId}
			}
			
			
			Object.keys(object.attributes).forEach(function(key){
				var values = []
				object.attributes[key].values.forEach(function(value){	
					values.push(serializeLevel(value))
				})
				attr.push({type:key, values:values})
				if (key === "P0"&& requiredTemplates.indexOf(object.attributes[key].values[0].primitive.element) === -1){// //to avoid duplicates
					requiredTemplates.push(object.attributes[key].values[0].primitive.element)
				}
			})
			
			obj.attributes = attr;
			//obj.uuid = object.uuid
			return obj
		}
		var serializedObject =  serializeLevel(object, []);
		serializedObject.includedObjects = requiredTemplates;
		return JSON.stringify(serializedObject,undefined,2)
	},
	
	primitives:{
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
				console.log(appContainer, this.element)
				appContainer.appendChild(this.element);
			},
			save:function(){
				return {name:'window', value:null}
			},
			parseString(input){}
		},
		addition:{
			//parentObject
			update:function(){
				parentObject.relations.expression.equivalence.value.primitive.set(parentObject.relations.operands[0].primitive.evaluate()+parentObject.relations.operands[1].primitive.evaluate())
			}
		},
		objectTypeDeclaration:{
			init:function(parentObject){
				this.parentObject = parentObject;
			},
			save:function(){
				return {name:'objectTypeDeclaration', value:this.element}
			},
			set:function(value){
				
				//console.log('string primitive set to ',value,'dependant',this.dependantPrimitives)
				this.element = value;
				this.update();
			},
			update:function(){
				this.dependantPrimitives.forEach(function(primitive){
					
					primitive.update()
				})
			}
			
		},
		span:{
			init:function(parentObject){
				var primitive = this
				this.parentObject = parentObject
				this.element = document.createElement('span')
				parentObject.subscribe('PinnerText',function(attributeObjects){
					attributeObjects.forEach(function(component){
						var text = document.createTextNode(component.primitive.element)
						primitive.element.appendChild(text)
					})
					//primitive.element.innerText = attributeObject.primitive.element///attribute not created when this is called
				})
				
				parentObject.subscribe('PparentElement',function(attributeObjects){
					//console.log('attr obj',attributeObjects)
					var attributeObject = attributeObjects[0]
					attributeObject.primitive.element.appendChild(primitive.element)
				})
				
				parentObject.subscribe('Pselected',function(attributeObjects){
				})
				this.element.addEventListener('click',function(){
					
					var expObj = parentObject.dependantObjects[0].dependantObject.dependantObjects[0].dependantObject
					if (parentObject.attributes.Pselected.values[0].primitive.element === false){
						
						app.select(expObj)
						
					}else{
						app.deSelect(expObj)
					}
					
				})
			},
			save:function(){
				return {name:'span', value:null}
			},
			parseString(input){},
			update:function(){
				//hack a selection without dealing with color
				if (this.parentObject.attributes.Pselected.values[0].primitive.element === true){
					this.element.style.backgroundColor = 'red'
				}
				else{
					this.element.style.backgroundColor = 'transparent'
				}
				//this.element.innerText = this.parentObject.attributes.innerText.value.primitive.element
			}
		},
		boolean:{
			init:function(parentObject){
				this.parentObject = parentObject;
			},
			save:function(){
				return {name:'boolean', value:this.element}
			},
			parseString:function(input){
				if (input === 'true'){
					this.set(true)
					return true
				} else if (input === 'false') {
					this.set(false)
					return true
				} else {
					return false
				}
			},
			set:function(value){
				
				//console.log('string primitive set to ',value,'dependant',this.dependantPrimitives)
				this.element = value;
				this.update();
			},
			update:function(){
				this.dependantPrimitives.forEach(function(primitive){
					
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
				
				//console.log('string primitive set to ',value,'dependant',this.dependantPrimitives)
				this.element = value;
				this.update();
			},
			update:function(){
				this.dependantPrimitives.forEach(function(primitive){
					primitive.update()
				})
			}
		},
		IEEEFloatingPoint:{

			init:function(){},
			element:null
		},	
		additionOperator:{

			init:function(){},
			save:function(){
				return {name:'additionOperator', value:null}
			},
			element:null
		}	
	}
};

//when loading object if it has a defined type then run a git merge operation on the stored template and on the subsection of the file. if the object template has an undefined then don't ask to merge



