window.app = {


	objectProto:{
		link:function(){},
		unlink:function(){}
	},
	
	
	
	objLib :{
		T0:{
			name:'unknown',
			type:['T0'],
			properties:[],
			relations:[],
			representations:[],
			isomorphisms:[]
			
		},
		T1:{
			name:'integer',
			type:['T1','whatever code for real number'],
			properties:[
				{value:'O0'}
			],
			relations:[],
			isomorphisms:[]
		},
		T2:{
			type:[
		}
		
	},
	objList:[],
	
	createObject : function(templateID){
		var template = this.objLib[templateID];
		var newObject = Object.create(this.objectProto)
		newObject.id = this.objList.length;
		this.objList.push(newObject)
		newObject.type = template.type
		console.log(newObject)
		
	}
}


