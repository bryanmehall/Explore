"use strict";
window.app = {
	count : 0,
	loopStop: function(){
		if (this.count>20){
			throw 'count exceded'
		}
		this.count += 1
	},
	tempTable:{
		fileUUID:'fileId',
		attribute:'attributeId',
		instanceOf:'instanceOfId',
		string:'stringid',
		childElements:'jhkr9c44a68qs54rk3addmv8',
		parentElement:'5grmpy33zd3tkljbhs2j04ar',
		selectedObjects:'cw3s6fl6s3p9rvqyh90d108x',
		parentConcept:'mkccvvqh38apgddwn08zx11v',
		nameEn:'nameEnId',
		textRepresentation:'lsbqsxcsbty6zwp35d51vx02',
		width:'4tkkhvs7xs157gvmvhzvzj30',
		height:' h9rfmjwtwlawx6fqycrpbylj',
		firstElement: 'p1xlx8akxcakhg41tvr7zjcn',
		nextElement:'fcvv6mrkcj8htzhgf7lm17kv'
	},
	
	initDatabase: function(cb){
		//to use, delete all entries in database and then crete new enter 
		//init file object
		createFileObject()
		var objects = {}
		function createFileObject(){
			app.newObject(app.tempTable.fileUUID,function(fileObject){
				fileObject.initPrimitive('file',null)
				objects.file = fileObject
				createAttributeObject()
			})
		}
		
		function createAttributeObject(){
			app.newObject(app.tempTable.attribute,function(attributeObject){
				attributeObject.initPrimitive('attribute',null)
				objects.attribute = attributeObject
				createStringObject()
				
			})
			
		}

		function createStringObject(){
			app.newObject(app.tempTable.string, function(stringObject){
				stringObject.initPrimitive('string',null)
				objects.string = stringObject
				createInstanceOfObject()
			})
		}

		function createInstanceOfObject(){
			var attributeObject = objects.attribute
			app.createInstance(objects.attribute, function(instanceOfObject){
				instanceOfObject.initPrimitive('attribute',null)
					.addAttribute(instanceOfObject)
					.extendAttribute(instanceOfObject,objects.attribute)
				instanceOfObject.setId(app.tempTable.instanceOf)
				objects.instanceOf = instanceOfObject
				createnameEnObject()

			})
		}

		function createnameEnObject(){
			app.createInstance(objects.attribute, function(nameEnObject){
					
					nameEnObject.initPrimitive('attribute',null)
						.addAttribute(objects.instanceOf)
						.extendAttribute(objects.instanceOf,objects.attribute)
						//.addAttribute(nameEnObject,)
					nameEnObject.uuid = app.tempTable.nameEn
					objects.nameEn = nameEnObject
				addNamesToObjects()
			})
		}

		function addNamesToObjects(){
			function addName(obj){
				app.createInstance(objects.string, function(stringObject){
					stringObject.primitive.set(obj.uuid)
					obj.addAttribute(objects.nameEn)
						.extendAttribute(objects.nameEn, stringObject)
				})
				
			}
			//addName(objects.attribute)
			//addName(objects.file)
			cb()
		}
		
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
	
	newObject: function(uuid, callback){
		//creates new object
		console.log('run',uuid)
		$.ajax({
				type: 'POST',
				url: '/object/new',
				data: JSON.stringify({uuid:uuid, nameEn:'abc', json:null}),
				success: function(response) {
					var data = JSON.parse(response);
					//data is in the form: {uuid:'fjiwje...',json:json}
					app.loadObject(data.uuid, function(object){
						callback(object);
					})
					
				},
				error: function(err) {
					console.log('error posting to server...');
					console.log(err);
				}
			});
	},
	/**
	 * creates attribute of attribute
	 * @param   {object}   templateObject [[Description]]
	 * @param   {[[Type]]} newObject      [[Description]]
	 * @returns {[[Type]]} [[Description]]
	 */
	
	
	createInstance: function(parentObject,cb) {//should this just be parentObject instead of uuid?
		
		console.log('creating instance----------------------', parentObject.uuid)
		var app = this;
		
		var map = {}; //mapping between template and instance objects for terminating loops
		var create = function(){
			
			//initialize object
			var newObject = Object.create(app.objectProto);
			newObject.uuid = app.generateUUID()
			newObject.attributes = {};
			newObject.dependents = [];
			newObject.attributePrimitiveBuffer = {};
			map[parentObject.uuid] = newObject;
			//retrieve template
			var templateObject = parentObject//app.objectCache[parentObject.uuid]
			
			//initialize primitive if needed
			if (templateObject.hasOwnProperty('primitive')){
				var primitiveString = templateObject.primitive.save()
				newObject.initPrimitive(primitiveString.name, primitiveString.value)
				if(templateObject.isAnAttribute()){
					var attributeObject = app.createAttribute(templateObject,newObject)
					if(cb===undefined){
						return attributeObject
					} else {
						cb(attributeObject)
					}
				}
			}
			
			//add visualization before attributes are initialized
			newObject.addObjectToVisualization()//eventually replace
			newObject.createObjectVisualization()	
			
			//initialize remaining attributes
			templateObject.getAttrs().forEach(function(attrObj){
				
				var newAttrObj = app.createInstance(attrObj)
				newObject.addAttribute(newAttrObj)
				templateObject.getAttrValues(attrObj).forEach(function(attributeValue){
					var targetUUID = attributeValue.uuid
					if (map.hasOwnProperty(targetUUID)){
						var newValue = map[targetUUID];
					} else if (attributeValue === app.tempTable.instanceOf){//won't work yet
						var newValue = templateObject;
					} else {
						var newValue = create(attributeValue);
						map[targetUUID] = newValue;
						
					}
					newObject.extendAttribute(attributeValue,newValue)
				})
				
				 //possible loop created here

				
			})
			app.objectCache[newObject.uuid]=newObject

			return newObject
		};
		//this is ugly but it makes it either a synchronous function or async
		if(cb===undefined){
			return create(parentObject)
		} else {
			cb(create(parentObject))
		}
		

	},
	
	createAttribute: function(templateObject, newObject){//move to within createInstance?
		Object.keys(templateObject.attributes).forEach(function(attributeName){
			var attributeDescriptor = templateObject.attributes[attributeName]
			if(attributeDescriptor.values.length > 1){
				throw 'attribute of '+ templateObject.uuid + ' has a cardinality greater than one'
			} else {
				templateObject.addAttribute(templateObject)
			}
		})
		newObject.addObjectToVisualization()//eventually replace
		newObject.createObjectVisualization()
				console.log(newObject)
		return newObject
	},

	/**
	 * Loads object with uuid from database, creates it and places it in the templateCache
	 * @param {[[Type]]} uuid [[Description]]
	 * @param {[[Type]]} cb   [[Description]]
	 */
	loadObject:function(uuid,cb){
		var loadJson = function(uuid,cb){	
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
								loadJson(UUID, function(innerTemplate) {

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
					console.log('failed to load valid JSON ', uuid, a, b, c)
					throw 'UUID "' +uuid+'" not found in database'
				})
			}
		}
		console.log('load object',uuid)
		loadJson(uuid,function(){
			var object = app.createObject(uuid)
			app.templateCache[uuid] = object;
			cb(object);
		})
		
	},
	/**
	 * Creates object where JSON data is already loaded into JSONCache
	 * @param   {[[Type]]} uuid uuid of object to be created
	 * @returns {[[Type]]} [[Description]]
	 */
	createObject:function(uuid){
		var app = this
		if (app.jsonCache.hasOwnProperty(uuid)){
			var template = app.jsonCache[uuid];
		} else {
			console.log('need to load json for ' + uuid + ' before calling createObject')
			throw 'JSON not in cache' + uuid
			//return 'eventually return undefined'
		}
		
		var parseAttrTemplate = function(attrTemplate){
			/*attrTemplate is in the form {
				type:attrObjectUUID, //uuid of attribute object
				values:[ValueUUID or reference]
			}*/
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
			newObject.createObjectVisualization()
			
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
			console.log(element,attribute)
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
								app.loadObject(singleMatch,function(template){
									app.createInstance(template, function(ob){
									app.selectingObject = false
									closeSelectionBox()
									cb(ob,singleMatch)
								})
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
	}

};

//when loading object if it has a defined type then run a git merge operation on the stored template and on the 
//subsection of the file. if the object template has an undefined then don't ask to merge



