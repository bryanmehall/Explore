window.app = {
	objCounter:0,
	objectProto:{//contains shared methods of all objects
		subscribe:function(attributeName, callback){
			
			var targetObject = this.attributes[attributeName];
			if (targetObject != undefined){
				targetObject.primitive.dependantPrimitives.push(this.primitive)
				callback(primitive);
			}
			else{
				var x = this.attributePrimitiveBuffer[attributeName];
				this.attributePrimitiveBuffer[attributeName] = (x === undefined) ? [] : x;
				this.attributePrimitiveBuffer[attributeName].push({primitive:this.primitive, callback:callback});
			}
		}
	},
	
	relationProto:{
		link:function(target){
			if (this.objects.length<this.dimension.value){
				this.objects.push(target)
			}
		},
		unlink:function(){}
	},
	primitives:{
		file:{
			init:function(parentObject){
			}
		},
		window:{
			dependantPrimitives:[],
			init:function(parentObject){
				this.parentObject = parentObject;
				this.element = document.createElement('div');
				this.element.style.width = '200px'
				this.element.style.height = '200px'
				this.element.style.backgroundColor = '#eeeeee'
				
				document.body.appendChild(this.element);
			}
		},
		
		
		
		
		addition:{
			//parentObject
			dependantPrimitives:[],
			update:function(){
				parentObject.relations.expression.equivalence.value.primitive.set(parentObject.relations.operands[0].primitive.evaluate()+parentObject.relations.operands[1].primitive.evaluate())
			}
		},
		
		
		span:{
			dependantPrimitives:[],
			init:function(parentObject){
				var primitive = this
				this.parentObject = parentObject
				this.element = document.createElement('span')
				parentObject.subscribe('innerText',function(attributeObject){
					primitive.element.innerText = attributeObject.primitive.element///attribute not created when this is called
				})
				
				parentObject.subscribe('parentElement',function(attributeObject){
					console.log('span', attributeObject)
					attributeObject.primitive.element.appendChild(primitive.element)
				})
				this.element.addEventListener('click',function(){})
			},
			update:function(){
				
				//this.element.innerText = this.parentObject.attributes.innerText.value.primitive.element
			}
		},
		
		
		
		
		string:{
			dependantPrimitives:[],
			init:function(parentObject){
				this.parentObject = parentObject;
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
			dependantPrimitives:[],
			init:function(){},
			element:null
		}
		
			
	},
	
	attributeProto:{},
	
	objList:[],//store list of all objects within the app
	templateCache:{},
	
	loadTemplate: function(templateID, callback) {
		var app = this;
		if (app.templateCache[templateID] === undefined) {
		
			$.getJSON('templates/' + templateID, function(template) {
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
			
				console.log('failed to load valid JSON file check that file is valid and there', a, b, c)
			})
		}
		else {
			callback(app.templateCache[templateID])
		}
	},

	
	createObject : function(templateID,args,cb) {
		var app = this;
		
		app.loadTemplate(templateID,function(template){
			var newObject = app.createSynchronous(templateID,args)
			cb(newObject);
		})
		
	},
	
	createSynchronous : function(templateID,args) {
		//console.log('creating',templateID)
		var app = this
		var template = app.templateCache[templateID]
		var newObject = Object.create(app.objectProto);
		newObject.id = app.objCounter;
		app.objCounter+=1;
		newObject.type = template.type;
		newObject.attributes = {};
		newObject.attributePrimitiveBuffer = {};
		//initialize object primitive
		if (template.primitive != undefined){
			var primitive = Object.create(app.primitives[template.primitive])
			newObject.primitive = primitive;
			primitive.init(newObject)
		}

		//add all templates
		template.attributes.forEach(function(attribute){
			//console.log('a',attribute.value)
			
			var newAttr = newObject.attributes[attribute.name] = Object.create(app.attributeProto)
			
			newAttr.name = attribute.name
			
			if (newObject.attributePrimitiveBuffer.hasOwnProperty(attribute.name)) {
				//attributePrimitiveBuffer is in the form:
				//{attribute_name:[{primitive:primitive_object,callback:callback_function}, ...]}
				var bufferedPrimitive = [];
				var bufferedCallback = [];
				newObject.attributePrimitiveBuffer[attribute.name].forEach(function(item){
					bufferedPrimitive.push(item.primitive)
					bufferedCallback.push(item.callback)
				});
				
				
			}
			else {
				var bufferedPrimitive = [];
				var bufferedCallback = [];
			}
			
			if (args.hasOwnProperty(attribute.name)){
			//consolidate this and code in second else into a function
				var argument = args[attribute.name]//consollidate by changing all instances of argument
				
				
				if (argument.hasOwnProperty('reference')) {
					if (argument.reference === 'global') {
						var referencedObject = app.fileObject
						argument.path.forEach(function(pathElement){
							referencedObject = referencedObject.attributes[pathElement]
						})
						newObject.attributes[attribute.name] = referencedObject
						console.log(referencedObject.value.primitive)
						bufferedCallback[0](referencedObject.value)//not fully working...just temporary
					}
					else if(argument.reference ==='local'){
						console.log('local',argument)
					}
					
				}
				else{
					newObject.attributes[attribute.name].value = app.createSynchronous(argument.templateID,argument.arguments)
				
				
					if (argument.primitive != undefined){
						newAttr.value.primitive.set(argument.primitive)//this code is ugly but the attributre needs to be defined when the set method is called on the primitive
					}
				
					if (newAttr.value.primitive != undefined){
						newAttr.value.primitive.dependantPrimitives = bufferedPrimitive;
						bufferedCallback.forEach(function(primitiveCallback){
						
							primitiveCallback(newAttr.value)
						})
					}
				}
			}//c
			else{
				if (newObject.attributes[attribute.name].hasOwnProperty('reference')){
					
				}
				else{
					newObject.attributes[attribute.name].value = app.createSynchronous(attribute.value.templateID,attribute.value.arguments)
					if (newAttr.value.primitive != undefined){
						newAttr.value.primitive.dependantPrimitives = bufferedPrimitive;
						bufferedCallback.forEach(function(primitiveCallback){
							//console.log('b')
							primitiveCallback(newAttr.value)
						})
					}
				}
			}
			
			
			
		})
		return newObject
	}
	
};


