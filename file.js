
window.app = {
	objCounter:0,
	objectProto:{//contains shared methods of all objects
		subscribe:function(attributeName){
			var targetObject = this.attributes[attributeName];
			if (targetObject != undefined){
				targetObject.primitive.dependantPrimitives.push(this.primitive)
			}
			else{
				var x = this.attributePrimitiveBuffer[attributeName];
				this.attributePrimitiveBuffer[attributeName] = (x === undefined) ? [] : x;
				this.attributePrimitiveBuffer[attributeName].push(this.primitive);
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
				this.parentObject = parentObject
				this.element = document.createElement('span')
				parentObject.subscribe('innerText')
				document.body.appendChild(this.element)
				this.element.addEventListener('click',function(){})
			},
			update:function(){
				console.log(this.parentObject)
				this.element.innerText = this.parentObject.attributes.innerText.value.primitive.element
			}
		},
		
		
		
		
		string:{
			dependantPrimitives:[],
			init:function(parentObject){
				this.parentObject = parentObject;
			},
			
			set:function(value){
				
				console.log('string primitive set to ',value,'dependant',this.dependantPrimitives)
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
	
	createSynchronous : function(templateID,args){
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
			
			newObject.attributes[attribute.name] = Object.create(app.attributeProto)
			var newAttr = newObject.attributes[attribute.name]
			newAttr.name = attribute.name
			
			if (newObject.attributePrimitiveBuffer.hasOwnProperty(attribute.name)){
				var bufferedPrimitive = newObject.attributePrimitiveBuffer[attribute.name];
			}
			else{bufferedPrimitive = []}
			
			if (args.hasOwnProperty(attribute.name)){

				var objectProperties = args[attribute.name]
				newAttr.value = app.createSynchronous(objectProperties.templateID,objectProperties.arguments)
				
				if (newAttr.value.primitive != undefined){
					newAttr.value.primitive.dependantPrimitives = bufferedPrimitive;
				}
				if (objectProperties.primitive != undefined){
					newAttr.value.primitive.set(objectProperties.primitive)//this code is ugly but the attributre needs to be defined when the set method is called on the primitive
				}
			}
			else{
				newAttr.value = app.createSynchronous(attribute.value.templateID,attribute.value.arguments)
				if (newAttr.value.primitive != undefined){
					newAttr.value.primitive.dependantPrimitives = bufferedPrimitive;
				}
			}
			
			
		})
		return newObject
	}
	
};


