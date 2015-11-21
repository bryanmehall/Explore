"use strict";
window.app = {
	objectCounter: 0,
	mapCreation: true,
	visualizeGraph: false,
	tempTable:{
		fileUUID:'0zltxffg54zzt5xgwnf6wz3w',
		childElements:'rm3vwsxcb5hl44l5ktptvz4z',
		parentElement:'w69n9k17p5gxx6nyptx0xj40',
		instanceOf:'x320kt1p9x4y3qkkp8n525yw'
	},
	
	init: function(){
		var objectTable = {
			getKey: function(value){
				var table = this
				Object.keys(table).forEach(function(key){
					if (table[key] === value){
						return key
					}
				})
				return undefined
			}
		}
		app.jsonCache = Object.create(objectTable)
		//table containing template objects (any object with an instance of it)
		app.templateCache = Object.create(objectTable) //{uuid:object}
		//table containing all objects currently in the file
		app.objectCache = Object.create(objectTable) //{uuid:object}
		//table with all named objects (current language) in the file
		app.nameTable = Object.create(objectTable)  //{jsStringForName:object}
		//table with all file reference 
		app.fileObjects = Object.create(objectTable) //{fileIdentifier:object}
		app.userObjects = Object.create(objectTable) //{useridentifier: object}
	},
	
	generateUUID : function(){
		var d = new Date().getTime();
		var uuid = 'untrustedxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = (d + Math.random()*16)%16 | 0;
			d = Math.floor(d/16);
			return (c=='x' ? r : (r&0x3|0x8)).toString(16);
		});
		return uuid;
	},
	
	objectProto: {//contains shared methods of all objects
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
			this.addAttributeToObjectVisualization(attributeUUID, [])
		},
		getAttributeByUUID: function(typeUUID){
			return this.attributes[typeUUID].values
		},
		newAddAttribute: function(attributeType, values) {//actually this is old 
			var app = window.app
			var parentObject = this;
			values = values || []
			var attributeObject = app.synchronousCreateInstance(attributeType)
			this.attributes[attributeType] = {attribute:attributeObject, values:values}
			
			
			if (this.attributePrimitiveBuffer.hasOwnProperty(attributeType)&&this.hasOwnProperty('primitive')) {//attribute primitive buffer enumerates all of the objects that its own primitive depends on so 
				this.attributePrimitiveBuffer[attributeType].forEach(function(primitiveLink){
					values.forEach(function(value){
						value.primitive.dependentPrimitives.push(primitiveLink.primitive)
					})
					primitiveLink.callback(values)
				})
			}
			this.addAttributeToObjectVisualization(attributeType, values)
		},
		replaceObject: function (newObject){
			var dependentObjects = this.dependentObjects
			dependentObjects.forEach(function(reference){
				reference.dependentObject.setAttribute(reference.attributeType, newObject, reference.valueIndex)
				console.log('setting attribute', reference.attributeType, newObject)
			})
		},		
		extendAttribute: function (attributeType,value){
			
			//check cardinality
			var parentObject = this;
			var valuesList = this.attributes[attributeType].values
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
		referenceAttribute: function (parentObject, attributeType, valueIndex){//get rid of this. just have the value be what is intended and then deal with it in the replace attribute
			var value = parentObject.attributes[attributeType].values[valueIndex]
			value.dependentObjects.push(this)
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
			})
			
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

			attributeBlock.className = 'UUID'+attributeType;
			
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
					console.log('adingValue')
					obj.extendAttribute(attributeType,newObject)
				})
			})
			
			attributeBlock.appendChild(addValueButton)
		},
		addValueToAttribute: function (attributeType, value){
        	var obj = this;
			var valueListDiv = this.accordianContainer.querySelector('.UUID'+attributeType)
			var valueDiv = document.createElement('div')
			
			valueListDiv.appendChild(value.accordianContainer)
			
        }
	},
	   
	searchTemplates:function(searchTerm,cb) {
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
	
	searchObjects:function(searchTerm,numberOfResults) {
		console.log('add searching functionality')
		Object.keys(app.nameTable).forEach(function(){
		})
		return []
	},
	
	newObjectSelector:function(typeRestrictions, eventLocation, cb) {
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
			
			if (textArea.value[0] === '\\' ||textArea.value[0] === '\_'){
				var searchTerm = textArea.value.slice(1)
				app.searchTemplates(searchTerm,function(matches){
					if (matches.length === 1) {
							appDiv.removeChild(box)
							//if (app.fileObject.attributes.PselectedObjects.values.length === 1){	
							//	app.fileObject.attributes.PselectedObjects.values[0].replaceObject(app.createObject(matches[0].templateID,{},function(){}))
							//}else{
							var singleMatch = matches[0][1]
							if (textArea.value[0] === '\\'){
								app.createInstance(singleMatch, function(ob){
									app.selectingObject = false
									var accordian = ob.addObjectToVisualization()
									document.getElementById('accordianContainer').appendChild(accordian)

									cb(ob,singleMatch)
									})
							} else {
								app.loadObject(singleMatch, function(ob){
									app.selectingObject = false
									var accordian = ob.addObjectToVisualization()
									document.getElementById('accordianContainer').appendChild(accordian)

									cb(ob,singleMatch)
									})
							}
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
	
	select: function(selectedObject) {//should this be a method of the object?
		if(!window.event.shiftKey) {
			var objRep = app.serializeElement(selectedObject)
			document.getElementById('jsonText').innerText = JSON.stringify(objRep,'  ')
			//console.log(app.fileObject)
			//app.fileObject.attributes.eyh5mcvd0a7hz3t6b7z8vhtp.values.forEach(function(object){
			//app.deSelect(object)
			//})
		}
		selectedObject.accordianContainer.style.backgroundColor = '#ffaaaa'
		//this.fileObject.extendAttribute('eyh5mcvd0a7hz3t6b7z8vhtp', selectedObject)
		//selectedObject.attributes.Pselected.values[0].primitive.set(true)
		
	},
	
	deSelect: function(selectedObject) {
		selectedObject.accordianContainer.style.backgroundColor = 'white'
		//selectedObject.attributes.Pselected.values[0].primitive.set(false)
		this.fileObject.removeAttributeValue('eyh5mcvd0a7hz3t6b7z8vhtp',selectedObject)
		
	},
	
	fileReference: function(path) {
		var referencedObject = app.fileObject
			path.forEach(function(pathElement){
				referencedObject = referencedObject.attributes[pathElement].value
			})
		//console.log('returning absolute file path', referencedObject)
		return referencedObject
	},
	
	mergeAttributes: function(object1, object2) {
		Object.keys(object1.attributes).forEach(function(attributeType){
			var matchIndex = Object.keys(object2.attributes).indexOf(attributeType)
		})
	},
	
	loadTemplate: function(templateUUID, callback) {//change function name to loadJSON
		var app = this;
		if (app.templateCache[templateUUID] === undefined) {
		
			$.getJSON('/templates/'+templateUUID, function(template) {
				app.templateCache[templateUUID] = template;
				var remainingAJAXRequests = template.includedObjects.length
				if (remainingAJAXRequests === 0){callback(template)}
				template.includedObjects.forEach(function(UUID) {
					app.loadTemplate(UUID, function(innerTemplate) {
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
	
	newTemplate: function(user, json, nameEn,cb){//move to app file
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
	
	newObject: function(nameEn, json, callback){
		$.ajax({
				type: 'POST',
				url: '/object/new',
				data: JSON.stringify({nameEn:nameEn, json:json}),
				success: function(response) {
					var data = JSON.parse(response);
					//data is in the form: {uuid:'fjiwje...',json:json}
					callback(data);
				},
				error: function(err) {
					console.log('error posting to server...');
					console.log(err);
				}
			});
	},
	
	asyncCreateObject: function(templateUUID,cb) {
		var app = this;
		app.loadTemplate(templateUUID,function(template){
			var newObject = app.synchronousCreateObject(template)
			cb(newObject);
		})
	},
	
	createInstance: function(parentUUID,cb) {
		var app = this;
		console.log(parentUUID, app.templateCache)
		var create = function(templateUUID){
			
			var newObject = Object.create(app.objectProto);
			newObject.attributes = {};
			newObject.attributePrimitiveBuffer = {};
			console.log('templateID',templateUUID, templateObject)
			var templateObject = app.templateCache[templateUUID]
			if (templateObject.hasOwnProperty('primitive')){
				var primitiveString = templateObject.primitive.save()
				newObject.initPrimitive(primitiveString.name, primitiveString.value)
			}
			newObject.addObjectToVisualization()
			var instanceOfProperty = app.createObject(app.tempTable.instanceOf)
			newObject.addAttribute(instanceOfProperty)
			newObject.extendAttribute(app.tempTable.instanceOf, templateObject)
			Object.keys(templateObject.attributes).forEach(function(attributeKey){//this needs fixing
				var attributeObject = app.createObject(attributeKey)
				newObject.addAttribute(attributeObject, templateUUID) //possible loop created here
				templateObject.attributes[attributeKey].values.forEach(function(attributeValue){
					var newValue = create(attributeValue.uuid)
					console.log('instance')
					newObject.extendAttribute(attributeKey,newValue)
				})
			})
			return newObject
		};
		
		if (!app.templateCache.hasOwnProperty(parentUUID)){
			console.log('templateCache does not have property')
			app.loadObject(parentUUID, function(parentObject){
				
				console.log('after', app.templateCache)
				var newObject = create(parentUUID);
				app.newObject('',app.serializeElement(newObject),function(response){
					newObject.uuid = response.uuid
					cb(newObject);
				})
			})
		} else {
			console.log('templateCache has property')
			var newObject = create(parentUUID);
			cb(newObject);
		}
	},
	
	synchronousCreateInstance: function(templateUUID){
		var app = this
		var newObject = Object.create(app.objectProto)
		newObject.attributes = {};
		
		if (!app.templateCache.hasOwnProperty(templateUUID)){ 
			console.log('need to call asyncCreateInstance')
		}
		//if version numbers do not match ask the user if they want to run a merge operation
		var templateObject = app.templateCache[templateUUID]
		
		if (templateObject.hasOwnProperty('primitive')){
			console.log(templateObject)
			var primitiveString = templateObject.primitive.save()
			newObject.initPrimitive(primitiveString.name, primitiveString.value)
		}
		newObject.addObjectToVisualization()
		var instanceOfProperty = app.createObject(app.templateCache['bbl3gf7bk9jvb3zqqr43zvpm'])
		newObject.addAttribute(instanceOfProperty, 'bbl3gf7bk9jvb3zqqr43zvpm')
		console.log(newObject)
		Object.keys(templateObject.attributes).forEach(function(attributeKey){//this needs fixing
			var attributeObject = app.synchronousCreateInstance(attributeKey)
			newObject.addAttribute(attributeObject, templateUUID)//possible loop created here
			templateObject.attributes[attributeKey].values.forEach(function(attributeValue){
				console.log('synchronous')
				newObject.extendAttribute(attributeKey,attributeValue)
			})
		})
		newObject.uuid = app.generateUUID()
		return newObject
	},
	
	synchronousCreateObject: function(template){//loads the objects in the template if it can be guaranteed that all objects in dependent objects are loaded
		var app = this
		var newObject = Object.create(app.objectProto)
		newObject.attributes = {}
		newObject.attributePrimitiveBuffer = {};
		var referenceTable = {};
		var parentTypeObject = undefined;
		//check type of object. if its type exists in typeTable then reference it else create it
		if (template.hasOwnProperty('uuid')){
			newObject.uuid = template.uuid;
		} else {
			newObject.uuid = app.generateUUID();
		}
		
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
	
	serializeObject: function(object){
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
	
	loadJson:function(uuid,cb){
		var app = this;
		if (app.jsonCache.hasOwnProperty(uuid)) {
			cb(app.templateCache[uuid])
		} else {
			$.getJSON('/object/'+uuid, function(template) {
				app.jsonCache[uuid] = template;
				var remainingAJAXRequests = template.dependentObjects.length
				console.log('dependentObjects',template.dependentObjects)
				if (remainingAJAXRequests === 0){
					cb();
				} else {
					template.dependentObjects.forEach(function(UUID) {
					app.loadObject(UUID, function(innerTemplate) {
							remainingAJAXRequests -=1;
							if (remainingAJAXRequests === 0) {
								cb();
							}
						})
					})
				}
			})
			.fail(function(a, b, c) {
				console.log('failed to load valid JSON file check that file is valid and there', uuid, a, b, c)
			})
		}
	},
	
	loadObject:function(uuid,cb){
		app.loadJson(uuid,function(){
			var object = app.createObject(uuid)
			app.templateCache[uuid] = object;
			cb(object);
		})
	},
	
	createObject:function(uuid){//load object only is called when loading 
		//a template or loading objects from a file, not instantiating new objects
		var app = this
		if (app.jsonCache.hasOwnProperty(uuid)){
			var template = app.jsonCache[uuid];
		} else {
			console.log('need to load json for ' + uuid + ' before calling createObject')
			return 'eventually return undefined'
		}
		
		
		
		var parseAttrTemplate = function(attrTemplate){
			//attrTemplate is in the form {type:attrObjectUUID, values:[ValueUUID or reference]}
			var attrObjectUUID = attrTemplate.type;
			var attributeObject = app.createObject(attrObjectUUID);
			newObject.addAttribute(attributeObject);
			
			var attrValuesUUIDs = attrTemplate.values
			
			var parseValueTemplate = function(valueTemplate){
				var value;
				if (typeof(valueTemplate)==='string'){
					value = app.createObject(valueTemplate)
					
				} else {
					if (valueTemplate.refType === 'file'){
						value = app.fileObjects.getKey(valueTemplate.ref)
					} else if (valueTemplate.refType === 'user') {
						value = app.userObjects.getKey(valueTemplate.ref)
					}
				}
				var attributeParentUUID = attributeObject.uuid

				newObject.extendAttribute(attributeParentUUID, value)
			};
			
			attrValuesUUIDs.forEach(function(valueTemplate){
				parseValueTemplate(valueTemplate)
				
			})
		};

		if (app.objectCache.hasOwnProperty(uuid)){
			return app.objectCache[uuid]
		} else {
			var newObject = Object.create(app.objectProto)
			newObject.uuid = template.uuid;
			newObject.attributes = {};
			newObject.attributePrimitiveBuffer = {};

			
			if (template.primitive.name !== null){
				newObject.initPrimitive(template.primitive.name, template.primitive.value)
			} else {
				newObject.initPrimitive('none', null)
			}

			newObject.addObjectToVisualization()

			template.attributes.forEach(function(attrTemplate){
				parseAttrTemplate(attrTemplate);
			});
			app.objectCache[uuid]=newObject
			return newObject
		}
		
	},
	
	serializeElement : function(element){//new verson of serialize object --replace when done
		var obj = {};

		var dependentObjects = []; //only direct descendants
		var attributes = [];
		//save primitive
		
		obj.primitive = element.primitive.save()
		var addDepencency = function(includedObject){
			//add uuid to dependent Objects if it is not already there
			if (dependentObjects.indexOf(includedObject.uuid)===-1){
				dependentObjects.push(includedObject.uuid)
			}
		};

		//save attributes
		Object.keys(element.attributes).forEach(function(key){
			var attribute = element.attributes[key];

			var typeUUID = attribute.attribute.uuid
			addDepencency(attribute.attribute)
			var values = [];
			attribute.values.forEach(function(value){
				if (app.userObjects.getKey(value) !== undefined){
					values.push({refType:'user', ref:app.userObjects.getKey(value)})
				} else if (app.fileObjects.getKey(value) !== undefined){
					values.push({refType:'file', ref:app.userObjects.getKey(value)})
				} else {
					values.push(value.uuid)
					addDepencency(value)
				}
			})

			attributes.push({type:typeUUID, values:values})
		})

		obj.uuid = element.uuid
		obj.dependentObjects = dependentObjects;
		obj.attributes = attributes
		return obj
	},
		
	saveObject: function(object, cb){
		var objectsToSave = [];
		var dependentObjects = [];	
		var serializeElement = app.serializeElement
		
		
		
		
		var listIncludedObjects = function(subObject){
			if (objectsToSave.indexOf(subObject)=== -1){
				//maybe switch so objectsToSave is internal
				objectsToSave.push(subObject)
				Object.keys(subObject.attributes).forEach(function(key){
					var attribute = subObject.attributes[key];
					listIncludedObjects(attribute.attribute)//switch to attribute.attribute
					attribute.values.forEach(function(value){
						listIncludedObjects(value)
					})	
				})
			}
		};
		
		listIncludedObjects(object)
		
		var remainingObjectsToSave = objectsToSave.length
		
		objectsToSave.forEach( function(objectToSave,index){
			var json = JSON.stringify(serializeElement(objectToSave))
			if (index === 0 ){
				console.log(json)
			}
			/*
			$.ajax({
				type: 'PUT',
				url: '/object/'+objectToSave.uuid,
				data: json,
				success: function(response) {
					remainingObjectsToSave -= 1
					if (remainingObjectsToSave === 0){
						cb()
					}
				},
				error: function(err) {
					console.log('error posting to server...');
					console.log(err);
				}
			});
			*/
		
		})
		
	},
	
	primitives: {
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
				
				/*parentObject.subscribe('Pselected',function(attributeObjects){
				})
				this.element.addEventListener('click',function(){
					
					var expObj = parentObject.dependentObjects[0].dependentObject.dependentObjects[0].dependentObject
					if (parentObject.attributes.Pselected.values[0].primitive.element === false){
						
						app.select(expObj)
						
					}else{
						app.deSelect(expObj)
					}
					
				})*/
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

//when loading object if it has a defined type then run a git merge operation on the stored template and on the 
//subsection of the file. if the object template has an undefined then don't ask to merge



