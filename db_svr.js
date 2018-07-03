const express = require('express');
const bodyParser = require('body-parser');

const dbClient = require('mongodb').MongoClient;
const dbName = 'todo';
const colName = 'todo_item';
const dbUrl = 'mongodb://localhost:27017/' + dbName;

const app = express();
const port = 8081;

// SERVER SYSTEM

svrApp.listen(port, function () {
	console.log('Start to server. port is: ' + port);
});

svrApp.use(function (req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	res.setHeader('Access-Control-Allow-Credentials', true);
	next();
});

svrApp.use(bodyParser.json());
svrApp.use(bodyParser.urlencoded({
	extended: true
}));

// REST

svrApp.post('/api/item', (req, res) => {
  // Register a todo item
	dbClient.connect(dbUrl, (err, db) => {
		if (err) throw err;

		const dbIo = db.db(dbName);
		dbIo.createCollection(colName, function (dbErr, collection) {
			if (dbErr) throw dbErr;

			collection.insertOne({
				text: JSON.stringify(req.body.text),
			}, (dbErr) => {
				if (dbErr) {
					res.end(`error: ${dbErr}`);
					return;
				}

				dbIo.collection(colName).find().toArray(function (dbErr, dbRes) {
					if (dbErr) throw dbErr;
					res.end(JSON.stringify(dbRes));
					db.close();
				});
			});
		});
	});
});

svrApp.get('/api/list', function (req, res) {
  // Get todo items
	dbClient.connect(dbUrl, function (err, db) {
		if (err) throw err;

		const dbIo = db.db(dbName);
		dbIo.collection(colName).find().toArray(function (dbErr, dbRes) {
			if (dbErr) throw dbErr;
			res.status(200).send(dbRes);
			db.close();
		});
	});
});
