"use strict";
window.app = {
	objectCounter: 0,
	mapCreation: true,
	visualizeGraph: false,
	tempTable:{
		fileUUID:'m85xp0dfrth1t1sbn9wrv77q',
		childElements:'jhkr9c44a68qs54rk3addmv8',
		parentElement:'5grmpy33zd3tkljbhs2j04ar',
		instanceOf:'z77dxvw1fpa4xxcy49r0klmg',
		selectedObjects:'cw3s6fl6s3p9rvqyh90d108x',
		parentConcept:'mkccvvqh38apgddwn08zx11v',
		nameEn:'dfzz0y7g6x55pq6rag5pyw43'
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
	vis:{
		nodes:[],
		links:[],
		init:function(){
			var width = 960,
    			height = 500;

			var color = d3.scale.category10();
			var force = d3.layout.force()
				.nodes(app.vis.nodes)
				.links(app.vis.links)
				.charge(-400)
				.linkDistance(120)
				.size([width, height])
				.on("tick", tick);

			app.vis.svg = d3.select("body").append("svg")
				.attr("width", width)
			   .attr("height", height);

			var node = app.vis.svg.selectAll(".node"),
				link = app.vis.svg.selectAll(".link");

			app.vis.start = function() {
				link = link.data(force.links(), function(d) { return d.source.id + "-" + d.target.id; });
				link.enter().insert("line", ".node").attr("class", "link");
				link.exit().remove();
				
				node = node.data(force.nodes(), function(d) { return d.id;});
				var objectDiv = document.getElementById('objectDiv')
				node.enter()
					.append("circle")
					.attr("class", function(d) { return "node " + d.id; })
					.attr("r", 8)
					.on("click", function(d){
						var objectContainer = d.object.accordianContainer;
						while (objectDiv.hasChildNodes()) {//make it update instead of replacing
    						objectDiv.removeChild(objectDiv.lastChild);
						}
						objectDiv.appendChild(objectContainer)
					})
			  
			  node.exit().remove();

			  force.start();
			}

			function tick() {
			  node.attr("cx", function(d) { return d.x; })
				  .attr("cy", function(d) { return d.y; })

			  link.attr("x1", function(d) { return d.source.x; })
				  .attr("y1", function(d) { return d.source.y; })
				  .attr("x2", function(d) { return d.target.x; })
				  .attr("y2", function(d) { return d.target.y; });
			}
		}
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
			this.accordianContainer.className = 'accordianObject'
			this.accordianContainer.parentObject = this
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
					obj.addAttribute(newObject,typeUUID)
					//obj.addAttributeToObjectVisualization(attributeType,[])
				})
			})
			
			
			
			
			attributeDiv.appendChild(attrListDiv)
			attributeDiv.appendChild(addAttributeButton)
			this.accordianContainer.appendChild(attributeDiv)
			
			//add node to graph
			app.vis.nodes.push({id:obj.uuid, object:obj})
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
				attributeBlock.appendChild(value.accordianContainer)
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
			
			valueListDiv.appendChild(value.accordianContainer)
			var getById = function(id){
				var nodes = app.vis.nodes;
				for (var i=0; i<nodes.length; i++){
					if (nodes[i].id === id){
						return nodes[i]
					}
				}
				console.log('didnt find any')
			}
			var source = getById(this.uuid)
			var target = getById(value.uuid)
			console.log('linking',source,target)
			app.vis.links.push({source: source, target: target});
			app.vis.start()
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
	
	newObjectSelector:function(typeRestrictions, eventLocation, cb) {
		//open object search functionality
		var typeRestrictions 	= typeRestrictions || [];
		var box 				= document.createElement('div');
		var accordianDiv 		= document.getElementById('accordianContainer');
		var accordianObjects 	= document.querySelectorAll('.accordianObject');
		
		app.selectingObject       	= true;
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
		
		accordianObjectsList.forEach(function(accordianObject,index){
			var targetBox = document.createElement('div')
			targetBox.innerText = '@'
			targetBox.className = 'target'
			targetBox.addEventListener('click', function(){
				closeSelectionBox()
				cb(accordianObject.parentObject, accordianObject.parentObject.uuid)
			})
			accordianObject.appendChild(targetBox)
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
									var accordian = ob.addObjectToVisualization()
									//accordianDiv.appendChild(accordian)
									closeSelectionBox()
									cb(ob,singleMatch)
									})
							} else {
								app.loadObject(singleMatch, function(ob){
									
									app.selectingObject = false
									var accordian = ob.addObjectToVisualization()
									console.log('creating', accordianDiv,ob.accordianContainer)
									closeSelectionBox()
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
		app.currentObject = selectedObject
		if(!window.event.shiftKey) {
			var objRep = app.serializeElement(selectedObject)
			document.getElementById('jsonText').innerHTML = JSON.stringify(objRep,null,2)
			console.log(app.fileObject)
			app.fileObject.attributes[app.tempTable.selectedObjects].values.forEach(function(object){
			app.deSelect(object)
			})
		}
		selectedObject.accordianContainer.style.backgroundColor = '#ffaaaa'
		//app.fileObject.extendAttribute(app.tempTable.selectedObjects, selectedObject)
		//selectedObject.attributes[app.tempTeble.selectedObjects].values[0].primitive.set(true)
		
	},
	
	deSelect: function(selectedObject) {
		selectedObject.accordianContainer.style.backgroundColor = 'white'
		//selectedObject.attributes.Pselected.values[0].primitive.set(false)
		//this.fileObject.removeAttributeValue(app.tempTable.selectedObjects,selectedObject)
		
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
	
	newTemplate: function(user, json, nameEn,cb){
		//adds new template with name
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
		//creates new object
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
	
	loadJson:function(uuid,cb){
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
		console.log('loadObject')
		app.loadJson(uuid,function(){
			var object = app.createObject(uuid)
			app.templateCache[uuid] = object;
			cb(object);
		})
	},
	
	createObject:function(uuid){
		console.log('createObject')
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

		if (app.objectCache.hasOwnProperty(uuid)){//if object with this uuid already exists then return reference to it
			return app.objectCache[uuid]
		} else {
			var newObject = Object.create(app.objectProto)
			newObject.uuid = template.uuid;
			newObject.attributes = {};
			newObject.attributePrimitiveBuffer = {};

			
			if (template.primitive.name !== null){
				//console.log('initializing primitive',template.primitive.name, template.primitive.value )
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
		console.log('serializeElement')
		var obj = {};

		var dependentObjects = []; //only direct descendants
		var attributes = [];
		//save primitive
		
		obj.primitive = element.primitive.save()
		console.log(element.uuid, obj.primitive)
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
				console.log('file objects: ', app.fileObjects)
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
		console.log('saveObject')
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
};

//when loading object if it has a defined type then run a git merge operation on the stored template and on the 
//subsection of the file. if the object template has an undefined then don't ask to merge



