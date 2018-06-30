const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');

const dbName = 'dev';
const colName = 'todo';
const url = 'mongodb://localhost:27017/' + dbName;
const app = express();
const port = 3001;

app.use(function (req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	res.setHeader('Access-Control-Allow-Credentials', true);
	next();
});

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
	extended: true
}));

app.post('/api/item', (req, res) => {
	console.log(`text: ${JSON.stringify(req.body.text)}`);
	MongoClient.connect(url, (err, db) => {
		if (err) throw err;
		const dbo = db.db(dbName); //here
		dbo.createCollection(colName, function (dbErr, collection) {
			if (dbErr) throw dbErr;

			// console.log(`insertOne before ${JSON.stringify(res)}`);
			collection.insertOne({
				text: JSON.stringify(req.body.text),
			}, (dbErr) => {
				if (dbErr) {
					// console.log(`insertOne returned err: ${err}`);
					res.end(`error: ${dbErr}`);
					return;
				}

				dbo.collection(colName).find().toArray(function (dbErr, dbRes) {
					if (dbErr) throw dbErr;
					// const resStr = 'db find result: ' + JSON.stringify(dbRes);
					res.end(JSON.stringify(dbRes));
					db.close();
				});
				// // console.log(`insertOne returned succ: ${JSON.stringify(returnObj)}`);
				// res.end(JSON.stringify(dbRes.ops));
				// db.close();
			});
		});
	});
});

app.get('/api/list', function (req, res) {

	MongoClient.connect(url, function (err, db) {
		if (err) throw err;

		const dbo = db.db(dbName);
		dbo.collection(colName).find().toArray(function (dbErr, dbRes) {
			if (dbErr) throw dbErr;
			// const resStr = 'db find result: ' + JSON.stringify(dbRes);
			res.status(200).send(dbRes);
			db.close();
		});
	});
});

app.listen(port, function () {
	console.log('todo_svr running at port:  ' + port);
});