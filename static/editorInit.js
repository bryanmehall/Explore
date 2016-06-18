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
	
	function saveSelected(){
		app.saveObject(app.displayedObject,function(){})
	}
	
	/*var addTemplateHandler = function(){//remove this soon
		var templateNameInput = document.createElement('input')
		templateNameInput.placeholder = 'new template name';
		var saveteplateDiv = document.getElementById('saveTemplateDiv')
		saveteplateDiv.appendChild(templateNameInput)
		templateNameInput.addEventListener('keypress', function(event){
			if (event.keyCode === 13){
				var user = path.split('/').slice(-3)[0]
				var nameEn = templateNameInput.value
				var json = document.getElementById('jsonText').innerText
				
				app.newObject(user, json, nameEn, function(){})
				saveteplateDiv.removeChild(templateNameInput)
			}
		})
	};*/
	
	var addObjectEventHandler = function(event){
		var key = String.fromCharCode(event.keyCode);
			if (key ==="\\" && !app.selectingObject){
				
				app.newObjectSelector(null,null,function(){})
			}
			if (key === "_"){
				//selectPropertyMenu()
			}
	};
	
	var saveFileButton = document.getElementById('saveFile')
	saveFileButton.addEventListener('click', saveToFile)
	
	var commitTemplateButton = document.getElementById('commitTemplate')
	commitTemplateButton.addEventListener('click', commitTemplate)
	
	var saveSelectedButton = document.getElementById('saveSelected')
	saveSelectedButton.addEventListener('click', saveSelected)
	
	//var newTemplateButton = document.getElementById('newTemplate')
	//newTemplateButton.addEventListener('click', addTemplateHandler)
	
	var reloadDatabaseButton = document.getElementById('reloadDatabase');
	reloadDatabaseButton.addEventListener('click', app.initDatabase)
	

	
	
	document.addEventListener('keypress', addObjectEventHandler)
	
	var importTemplateToFile = function(){//for now assume that always loading templates
		app.tempTable.currentUUID = path.split('/').slice(-1)[0]
		app.initDatabase(function(){
			app.loadObject(app.tempTable.fileUUID, function(masterFileObject){
				app.createInstance(masterFileObject, function(fileObject){
					//load file into dom here
				})
			})
		})
		
	}
	importTemplateToFile()
	
	
}
