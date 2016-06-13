// Configure Mocha, telling both it and chai to use BDD-style tests.

mocha.setup("bdd");
chai.should();
window.app.init();
describe('Object Prototype', function(){
	describe('#addAttribute',function(){
		var object;
		var attributeObject;
		beforeEach(function() {
			app.jsonCache.testEmptyObjectUUID = {"primitive":{"name":"none","value":null},"uuid":"testEmptyObjectUUID","dependentObjects":[],"attributes":[]}
			object = window.app.createObject("testEmptyObjectUUID")

			app.jsonCache.testAttributeObjectUUID = {"primitive":{"name":"none","value":null},"uuid":"testAttributeObjectUUID","dependentObjects":[],"attributes":[]}
			attributeObject = window.app.createObject("testAttributeObjectUUID")
		});
		
		it('should create an attribute with no values', function(){
			object.addAttribute(attributeObject)
			object.attributes.testAttributeObjectUUID.attribute.should.equal(attributeObject)
		});
		
	});
})

describe('#createObject', function(){
	var object;
	var attributeObject;
	beforeEach(function() {
		app.objectCache
		app.jsonCache.testEmptyObjectUUID = {"primitive":{"name":"none","value":null},"uuid":"testEmptyObjectUUID","dependentObjects":[],"attributes":[]}
		object = window.app.createObject("testEmptyObjectUUID")
	});
	
	it('should return the same serialized value for empty object',function(){
		var savedObject = app.serializeElement(object)
		JSON.stringify(app.jsonCache.testEmptyObjectUUID).should.equal(JSON.stringify(savedObject))
	})
})




