const express = require("express");
const FS = require('fs');
const busboy = require('connect-busboy');
const mustacheExpress = require('mustache-express');
const { exec } = require('child-process');
const utils = require('utils');

const Config = require("./config.js");

const app = express();

// Set up busboy
app.use(busboy());

// Set up mustache
app.engine('html', mustacheExpress())
app.set('view engine', 'html');
app.set('views', __dirname + '/views');


// Handling GET / request 
app.use("/index.json", (req, res, next) => {
    res.send("{[]}");
}) 
  
app.get("/static/index.html", (req, res) => {
	processIndexGetRequest('static', req, res);
});

app.get("/backgrounds/index.html", (req, res) => {
	processIndexGetRequest('backgrounds', req, res);
});

app.get("/primaries/index.html", (req, res) => {
	processIndexGetRequest('primaries', req, res);
});

app.get("/tiles/index.html", (req, res) => {
	processIndexGetRequest('tiles', req, res);
});

// Handling GET /hello request 
app.get("/backgrounds/:filename", (req, res, next) => {
	processGetRequest('backgrounds', req, res);
});

app.get("/primaries/:filename", (req, res, next) => {
	processGetRequest('primaries', req, res);
});

app.get("/tiles/:filename", (req, res, next) => {
	processGetRequest("tiles", req, res);
});

app.get("/static/:filename", (req, res, next) => {
	processGetRequest("static", req, res);
});


app.post("/static", (req, res) => {
	processPostRequest('static', req, res);
});	
  
// Server setup 
app.listen(3000, () => { 
    console.log("Server is Running") 
}) 

function processIndexGetRequest(subdir, req, res) {
	const list = FS.readdirSync(Config.fileroot + subdir);
	const data = {subdir: subdir, files: []};
	list.forEach(function(filename) {
		data.files.push({link: `/${subdir}/${filename}`, name: filename})
	});
	res.render("index", data);
}

function processGetRequest(subdir, req, res) {
	const path = Config.fileroot + subdir + "/";
	res.sendFile(path + req.params.filename);

	//res.send(`Downloading ${subdir} named ${req.params.filename}, path is ${path}`)
}

function processPostRequest(subdir, req, res) {
	var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {
        console.log("Uploading: " + filename); 
        fstream = FS.createWriteStream(__dirname + `/${{subdir}}/` + filename);
        file.pipe(fstream);
        fstream.on('close', function () {
            res.redirect('back');
        });
    });
}