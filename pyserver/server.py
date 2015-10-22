import os
import os.path
import sqlite3
import json
from flask import Flask, request, url_for, Response, render_template, send_from_directory, g, redirect
from socket import *

sock=socket()
sock.setsockopt(SOL_SOCKET, SO_REUSEADDR, 1)

app = Flask(__name__, static_url_path='/static')


##########################request routing#####################################
@app.route("/")
def introPage():
	fileList = []
	for obj in query_db('select * from files'):
		fileList.append(obj) #2 is the nameEn field
		
	templateList = []
	for obj in query_db("select * from templates WHERE nameEn not like'' "):
		templateList.append(obj)
	return render_template('index.html', fileList=fileList, templateList=templateList)
	
@app.route("/functionTest")
def functionTest():
	templateList = []
	for obj in query_db('select * from templates'):
		templateList.append(obj)
	return render_template('functionTest.html', templateList=templateList)
	
@app.route('/<user>/<file_name>/<id>', methods=['GET', 'POST', 'PUT'])
def jsonData(user,file_name, id):
	if request.method == 'GET':
		if request_wants_json():
			return readJsonFile(id)
		else:
			return send_from_directory('static', 'app.html')
	elif request.method == 'PUT':
		data = json.loads(request.get_data())
		modifyJson(user, id, data)
		return 'save accepted'
	else:
		return "can't do that", 405


@app.route('/templates/<uuid>', methods=['GET', 'POST', 'PUT'])
def templateData(uuid):
	if request.method == 'GET':
		return readJsonFile(uuid)

@app.route('/<user>/newTemplate', methods=['POST'])
def addTemplate(user):
	data = json.loads(request.get_data())
	id = newTemplate(user,data[u'json'], data[u'nameEn'])
	return id

@app.route('/<user>/newfile', methods=['POST'])
def addObject(user):
	dataString = request.get_data()
	data = json.loads(dataString)
	object_name = data['nameEn']
	fileId = createJson(user,object_name)
	return fileId
	

@app.route('/<user>/<file_name>/<id>/delete', methods=['POST'])
def deleteObject(user,file_name,id):
	get_db().execute("DELETE FROM files WHERE uuid=?",[id])
	get_db().commit()
	
	templates = []
	for obj in query_db('select * from templates'):
		templates.append(obj) #2 is the nameEn field
	 
	return 'a'


@app.route('/core/query_objects', methods=['POST'])
def search_by_name():
	searchTerm = request.get_data()
	results = query_name(searchTerm,'nameEn')
	return json.dumps(results)
	

##########################database functions#################################

DATABASE = 'database.db'

def connect_to_database():
    return sqlite3.connect(DATABASE)

def get_db():
    db = getattr(g, '_database', None)
    
    if db is None:
        db = g._database = connect_to_database()
    return db


@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()


def query_db(query, args=(), one=False):
    cur = get_db().execute(query, args)
    rv = cur.fetchall()
    cur.close()
    return (rv[0] if rv else None) if one else rv

 
def init_db():
    with app.app_context():
        db = get_db()
        with app.open_resource('schema.sql', mode='r') as f:
            db.cursor().executescript(f.read())
        db.commit()
     

     
###############################data handlers#######################################

def request_wants_json():
    best = request.accept_mimetypes.best_match(['application/json', 'text/html'])
    return best == 'application/json' and request.accept_mimetypes[best] > request.accept_mimetypes['text/html']


def readJsonFile(id):
	data = query_db('select * from templates where uuid = ?',[id], one=True)
	return Response(data[3],  mimetype='application/json')

def modifyJson(user, id, data):
	get_db().execute("UPDATE templates SET json=? WHERE uuid=?",[data,id])
	get_db().commit()
	return
	
def newTemplate(user, json_data, nameEn):
	uuid = randId()
	print 'adding new template', user, json_data, nameEn
	get_db().execute('insert into templates (uuid, json, nameEn) values (?, ?, ?)',[uuid,json_data, nameEn])
	get_db().commit()
	return uuid

def createJson(user, json_data, nameEn):
	fileId = randId()
	get_db().execute('insert into files (uuid, json, nameEn) values (?, ?, ?)',[fileId,json_data, nameEn])
	get_db().commit()
	return fileId
	
def query_name(string, language, number = 10):
	results = query_db("SELECT * FROM templates WHERE nameEn LIKE '%' || ? ||'%' ORDER BY abs(length(?) - length(nameEn)), nameEn LIMIT ?",[string,string, number])
	return results


def storagePath(user, id):
	return os.path.join('storage', user, id)

		
def randId():
    r = bytearray(os.urandom(16))
    s = ""
    
    for i in range(24):
        idx, pos = (i*5)/8, (i*5)%8
        val = ((r[idx] >> pos) | (r[idx+1] << (8-pos))) & ((1<<5)-1)
        s += "0123456789abcdfghjklmnpqrstvwxyz"[val]
        
    return s
   
    
if __name__ == "__main__":
    app.run(debug=True)
#use heroku to host
