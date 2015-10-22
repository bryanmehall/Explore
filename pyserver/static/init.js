window.onload = function(){
	var app = window.app
	var path = window.location.pathname
	var json;
	
	var saveToFile = function(){
		var json = app.serializeObject(app.fileObject)//change to selected object
		$.ajax({
			type: 'PUT',
			url: path,
			data: json,
			success: function(response) {
				console.log('sent to server', response)
				document.getElementById('jsonText').innerText = json
			},
			error: function(err) {
				console.log('error posting to server...');
				console.log(err);
			}
		});
	}

	
	var commitTemplate = function(){
		var json = document.getElementById('jsonText').innerText
		//do check that uuid in json and url match also do this on server side
		$.ajax({
			type: 'PUT',
			url: path,
			data: JSON.stringify(json),
			success: function(response) {
				console.log('sent to server', response)
				document.getElementById('jsonText').innerText = json
			},
			error: function(err) {
				console.log('error posting to server...');
				console.log(err);
			}
		});
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

	var saveFileButton = document.getElementById('saveFile')
	saveFileButton.addEventListener('click', saveToFile)
	
	var commitTemplateButton = document.getElementById('commitTemplate')
	commitTemplateButton.addEventListener('click', commitTemplate)
	
	var newTemplateButton = document.getElementById('newTemplate')
	newTemplateButton.addEventListener('click', addTemplateHandler)
	
	var addObjectEventHandler = function(event){
		var key = String.fromCharCode(event.keyCode);
			if (key ==="\\" && !app.selectingObject){
				
				app.newObjectSelector(null,null,function(){})
			}
			if (key === "_"){
				selectPropertyMenu()
			}
	}
	document.addEventListener('keypress', addObjectEventHandler)
	
	var importTemplateToFile = function(){	
		var initializationObjects = [
			'ayh5mcvd0a7hz3t6b7z8vhtp',//file object
			'bbl3gf7bk9jvb3zqqr43zvpm',//instanceOf object
			path.split('/').slice(-1)[0]
		];
		initializationObjects.forEach(function(templateID){
			app.asyncCreateObject(templateID, function(object){
				document.getElementById('accordianContainer').appendChild(object.accordianContainer)
				if (templateID === 'ayh5mcvd0a7hz3t6b7z8vhtp'){
					app.fileObject = object
				}
			})
		})
	}
	importTemplateToFile()
	
	
}
