window.onload = function(){
	var app = window.app
	var path = window.location.pathname
	app.init()
	
	var saveToFile = function(){
		var jsonData = app.serializeObject(app.fileObject)//change to selected object
		JSON.stringify(jsonData,null, 2)
		$.ajax({
			type: 'PUT',
			url: path,
			data: json,
			success: function(response) {
				console.log('sent to server', response)
				document.getElementById('jsonText').innerHTML = json
			},
			error: function(err) {
				console.log('error posting to server...');
				console.log(err);
			}
		});
	}

	
	var commitTemplate = function(){
		
		app.saveObject(app.currentObject, function(){})
		var json = document.getElementById('jsonText').innerText//app.serializeElement(app.currentObject)
	};
	
	var addTemplateHandler = function(){
		var templateNameInput = document.createElement('input')
		templateNameInput.placeholder = 'new template name';
		var saveteplateDiv = document.getElementById('saveTemplateDiv')
		saveteplateDiv.appendChild(templateNameInput)
		templateNameInput.addEventListener('keypress', function(event){
			if (event.keyCode === 13){
				var user = path.split('/').slice(-3)[0]
				var nameEn = templateNameInput.value
				var json = document.getElementById('jsonText').innerText
				
				app.newTemplate(user, json, nameEn, function(){})
				saveteplateDiv.removeChild(templateNameInput)
			}
		})
	};
	
	var addObjectEventHandler = function(event){
		var key = String.fromCharCode(event.keyCode);
			if (key ==="\\" && !app.selectingObject){
				
				app.newObjectSelector(null,null,function(){})
			}
			if (key === "_"){
				selectPropertyMenu()
			}
	};
	
	var saveFileButton = document.getElementById('saveFile')
	saveFileButton.addEventListener('click', saveToFile)
	
	var commitTemplateButton = document.getElementById('commitTemplate')
	commitTemplateButton.addEventListener('click', commitTemplate)
	
	var newTemplateButton = document.getElementById('newTemplate')
	newTemplateButton.addEventListener('click', addTemplateHandler)
	

	
	
	document.addEventListener('keypress', addObjectEventHandler)
	
	var importTemplateToFile = function(){//for now assume that always loading templates
		app.tempTable.currentUUID = path.split('/').slice(-1)[0]
		
		var initializationObjects = [
			app.tempTable.fileUUID,
			app.tempTable.currentUUID,
			app.tempTable.instanceOf
		];	
			
		
		initializationObjects.forEach(function(uuid){
			
			app.loadObject(uuid, function(object){
				
				if (uuid === app.tempTable.fileUUID){
					app.fileObject = object
					
					//initialize app.fileObjects
				} 
				if(uuid === app.tempTable.currentUUID){
					//document.getElementById('jsonText').innerText = app.jsonCache[uuid]
					app.currentObject = object
					
				}
			})
		})
	}
	importTemplateToFile()
	
	
}
