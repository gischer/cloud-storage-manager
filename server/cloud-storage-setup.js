const fs = require('fs');
const { exec } = require('child_process');
const util = require('util');

const execute = util.promisify(exec);
const Config = require('./config.js');
console.log(Config);

const subdirList = ['backgrounds', 'primaries', 'tiles', 'static'];

ensureBaseDirectory(Config.fileroot);

var chain = Promise.resolve(true)

subdirList.forEach(ensureDirectory);

subdirList.forEach(chainPromise);

function ensureBaseDirectory(root) {
	ensurePath(root);
};

function ensureDirectory(subdir) {
	const path = `${Config.fileroot}/${subdir}`;
	ensurePath(path)
}

function ensurePath(path) {
	try {
		fs.statSync(path);
	} catch (error) {
		fs.mkdirSync(path);
	}
};

function chainPromise(subdir) {
	chain = chain.then(() => {rsyncSubdir(subdir)});
};

function rsyncSubdir(subdir) {
	return execute(`rsync -av ../assets/${subdir} ${Config.fileroot}`);
};