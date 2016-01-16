"use strict";
window.app = {

	tempTable:{
		fileUUID:'dl7t76bq3k76yv7mms83dc4f',
		childElements:'jhkr9c44a68qs54rk3addmv8',
		parentElement:'5grmpy33zd3tkljbhs2j04ar',
		instanceOf:'z77dxvw1fpa4xxcy49r0klmg',
		selectedObjects:'cw3s6fl6s3p9rvqyh90d108x',
		parentConcept:'mkccvvqh38apgddwn08zx11v',
		nameEn:'dfzz0y7g6x55pq6rag5pyw43',
		textRepresentation:'lsbqsxcsbty6zwp35d51vx02'
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
			},
			addEntry:function(key, value){
				this[key] = value
			},
			clear:function(){
				
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
		app.selectedObjects = Object.create(objectTable)
		app.vis.init()
		app.generateUUID()
	},

	
	generateUUID:function(){ 
		var r = new Uint32Array(16);
		window.crypto.getRandomValues(r);
    	var uuid = ''
    
		for (var i=0; i<24; i++){
			var idx = Math.round((i*5)/8), 
				pos = (i*5)%8
			var val = ((r[idx] >> pos) | (r[idx+1] << (8-pos))) & ((1<<5)-1)
			uuid += "0123456789abcdfghjklmnpqrstvwxyz"[val]
		}
		return uuid
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
				console.log('error posting to server...', err);
				
			}
		});
	},
	
	searchObjects:function(searchTerm,numberOfResults) {
		console.log('add searching functionality')
		Object.keys(app.nameTable).forEach(function(){
		})
		return []
	},
	
	newObjectSelector: function(typeRestrictions, eventLocation, cb) {
		//open object search functionality
		var typeRestrictions 	= typeRestrictions || [];
		var box 				= document.createElement('div');
		var accordianDiv 		= document.getElementById('accordianContainer');
		var accordianObjects 	= document.querySelectorAll('.accordianObject');
		
		app.selectingObject       	= true
		box.style.position        	= 'absolute'
		box.style.top             	= '100px'
		box.style.backgroundColor 	= '#fafafa'
		
		var textArea = document.createElement('input');
		box.appendChild(textArea)
		
		var options = document.createElement('div')
		box.appendChild(options)
		var appDiv = document.getElementById('appContainer')
		appDiv.appendChild(box)
		var accordianObjectsList = []
		for (var i = 0; i < accordianObjects.length; i++){
			accordianObjectsList.push(accordianObjects[i]);

		}
		//current object selection tools
		var node = app.vis.svg.selectAll("g")
		
		node.append('circle')
			.attr('r', 8)
			.on('click', function(d){
				closeSelectionBox()
				cb(d.object, d.object.uuid)
			})
		
		document.addEventListener('keyup', function(event){
			if (event.keyCode === 27){
				closeSelectionBox()
				app.selectingObject = false
			}
		})
		
		
		var closeSelectionBox = function(){
			var targets = document.querySelectorAll('.target')
			for (var i = 0; i < targets.length; i++){
				targets[i].parentNode.removeChild(targets[i])
			}
			node.selectAll('circle').remove()
			box.parentNode.removeChild(box)	
		};
		
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
							var singleMatch = matches[0][1]
							
							if (textArea.value[0] === '\\'){
								app.createInstance(singleMatch, function(ob){
									app.selectingObject = false
									closeSelectionBox()
									cb(ob,singleMatch)
									})
							} else {
								app.loadObject(singleMatch, function(ob){
									
									app.selectingObject = false
									closeSelectionBox()
									cb(ob,singleMatch)
									})
							}
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
	
	mergeAttributes: function(object1, object2) {
		Object.keys(object1.attributes).forEach(function(attributeType){
			var matchIndex = Object.keys(object2.attributes).indexOf(attributeType)
		})
	},
	
	newObject: function(uuid, nameEn, json, callback){//make this create instance of object
		//creates new object
		$.ajax({
				type: 'POST',
				url: '/object/new',
				data: JSON.stringify({uuid:uuid, nameEn:nameEn, json:json}),
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
	count:0,
	createInstance: function(parentUUID,cb) {
		var app = this;
		
		var map = {}; //mapping between template and instance objects for terminating loops
		var create = function(templateUUID){
			
			//initialize object
			var newObject = Object.create(app.objectProto);
			newObject.uuid = app.generateUUID()
			newObject.attributes = {};
			newObject.dependents = [];
			newObject.attributePrimitiveBuffer = {};
			map[templateUUID] = newObject;
			//retrieve template
			var templateObject = app.objectCache[templateUUID]
			
			//initialize primitive if needed
			if (templateObject.hasOwnProperty('primitive')){
				var primitiveString = templateObject.primitive.save()
				newObject.initPrimitive(primitiveString.name, primitiveString.value)
			}
			
			//add visualization before attributes are initialized
			newObject.addObjectToVisualization()
			
			//initialize attributes with special cases
			//add instance property
			
			
			//initialize remaining attributes
			Object.keys(templateObject.attributes).forEach(function(attributeKey){
				
				var attributeObject = app.createObject(attributeKey)//change to createInstance
				newObject.addAttribute(attributeObject) //possible loop created here

				templateObject.attributes[attributeKey].values.forEach(function(attributeValue,index){
					var targetUUID = templateObject.attributes[attributeKey].values[index].uuid
					if (map.hasOwnProperty(targetUUID)){//need to make work for multiple values
						var newValue = map[targetUUID]
					} else if (attributeKey === app.tempTable.instanceOf){
						var newValue = templateObject
						
					} else {
						var newValue = create(attributeValue.uuid)
						map[targetUUID] = newValue
						
					}
					
					newObject.extendAttribute(attributeKey,newValue)
				})
				
				
			})
			app.objectCache[newObject.uuid]=newObject
			return newObject
		};
		
		
		if (!app.templateCache.hasOwnProperty(parentUUID)){
			//console.log('templateCache does not have property')
			app.loadObject(parentUUID, function(parentObject){
				var newObject = create(parentUUID);
				app.newObject(newObject.uuid,'',app.serializeElement(newObject),function(response){
					cb(newObject);
				})
			})
		} else {
			var newObject = create(parentUUID); //parent 
			console.log(newObject)
			cb(newObject);
		}
	},
	loadJson:function(uuid,cb){
		//this.count++
		//if (this.count>100){cb()}
		
		var app = this;
		if (app.jsonCache.hasOwnProperty(uuid)) {
			cb(app.templateCache[uuid])
		} else {
			$.getJSON('/object/'+uuid, function(template) {
				app.jsonCache[uuid] = template;
				
				var remainingAJAXRequests = template.dependentObjects.length
				if (remainingAJAXRequests === 0){
					cb();
				} else {
					
					template.dependentObjects.forEach(function(UUID) {
						if (app.jsonCache.hasOwnProperty(UUID)){
							
							remainingAJAXRequests -=1;
							if (remainingAJAXRequests === 0) {
								cb();
							}
						} else {
							app.loadJson(UUID, function(innerTemplate) {
								
								remainingAJAXRequests -=1;
								if (remainingAJAXRequests === 0) {
									cb();
								}
							})
						}
					})
				}
			})
			.fail(function(a, b, c) {
				throw 'UUID not found in database'
				console.log('failed to load valid JSON file check that file is valid and there', uuid, a, b, c)
			})
		}
	},
	
	loadObject:function(uuid,cb){
		//console.log('loadObject')
		app.loadJson(uuid,function(){
			var object = app.createObject(uuid)
			app.templateCache[uuid] = object;
			cb(object);
		})
	},
	
	createObject:function(uuid){
		var app = this
		
		if (app.jsonCache.hasOwnProperty(uuid)){
			var template = app.jsonCache[uuid];
		} else {
			
			console.log('need to load json for ' + uuid + ' before calling createObject')
			throw 'JSON not in cache'
			//return 'eventually return undefined'
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
			//console.log(attrValuesUUIDs, attrTemplate)
			attrValuesUUIDs.forEach(function(valueTemplate){
				parseValueTemplate(valueTemplate)
				
			})
		};

		if (app.objectCache.hasOwnProperty(uuid)){//if object with this uuid already exists then return reference to it
			
			return app.objectCache[uuid]
		} else {
			
			var newObject = Object.create(app.objectProto)
			newObject.uuid = template.uuid;
			newObject.dependents = [];
			newObject.dependents = [];
			newObject.attributes = {};
			newObject.attributePrimitiveBuffer = {};
			app.objectCache[template.uuid] = newObject
			
			if (template.primitive.name !== null){
				////console.log('initializing primitive',template.primitive.name, template.primitive.value )
				newObject.initPrimitive(template.primitive.name, template.primitive.value)
			} else {
				newObject.initPrimitive('none', null)
			}

			newObject.addObjectToVisualization()

			template.attributes.forEach(function(attrTemplate){
				parseAttrTemplate(attrTemplate);
			});
			
			
			
			return newObject
		}
	},
	
	serializeElement : function(element){
		var obj = {};

		var dependentObjects = []; //only direct descendants
		var attributes = [];
		//save primitive
		
		obj.primitive = element.primitive.save()
		//console.log(element.uuid, obj.primitive)
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
				//console.log('file objects: ', app.fileObjects)
				if (app.userObjects.getKey(value) !== undefined){
					values.push({refType:'user', ref:app.userObjects.getKey(value)})
				} else if (app.fileObjects.getKey(value) !== undefined){
					console.log('fileObjectDetected')
					values.push({refType:'file', ref:app.fileObjects.getKey(value)})
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
		//console.log('saveObject', object)
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
			console.log(json)
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
			
		
		})
		
	}
};

//when loading object if it has a defined type then run a git merge operation on the stored template and on the 
//subsection of the file. if the object template has an undefined then don't ask to merge



