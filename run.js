



window.onload = function(){
	var app = window.app
	var box = document.getElementById('box')

	var appLoaded = function(){
		var app = window.app
		var box = document.getElementById('box')
		app.createObject('T13',{},function(file){
			app.fileObject = file;
		})
		document.addEventListener('keypress',function(event){
			var key = String.fromCharCode(event.keyCode);
			if (key ==="\\"){
				newObjectMenu()
			}
		})
	
	
		box.addEventListener('click',function(){
			box.focus()
		})

	}
	
	var searchTag = function(tag, lib) {
		var matches = [];
		for (var i in lib) {
			if (lib[i].name.indexOf(tag) > -1) {
				matches.push(lib[i])
			}
		}
		return matches
	}
	
	var newObjectMenu = function() {
		var box = document.createElement('div');
		box.style.position = 'absolute'
		box.style.top = '100px'
		box.style.backgroundColor = '#fafafa'
		var textArea = document.createElement('input');
		box.appendChild(textArea)
		var options = document.createElement('div')
		box.appendChild(options)
		document.body.appendChild(box)

		textArea.addEventListener('keyup', function() {
			var matches = searchTag(this.value, app.templateCache)
			if (matches.length === 1) {
				document.body.removeChild(box)
				console.time('someFunction');
				app.createObject(matches[0].templateID,{},function(){})
				console.timeEnd('someFunction');
			}
			var newOptions = document.createElement('div');
			matches.forEach(function(item) {
				var itemDom = document.createElement('div');
				itemDom.innerText = item.name;
				newOptions.appendChild(itemDom)
			})
			box.replaceChild(newOptions, options)
			options = newOptions
		})
		textArea.focus()
	}
	
	var baseTemplates = ['T0','T1','T9','T10','T12','T13']  //make it so objects can load dymanically on search
	var loadCount = 1;
	var target = baseTemplates.length
	baseTemplates.forEach(function(item){
		app.loadTemplate(item,function(){
			if (loadCount === target){
				appLoaded()
			}
			else{
				loadCount+=1
			}
		})
	})
	
	
}


