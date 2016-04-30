var streams4 = require('./streams4');

var getModuleDetails = streams4.getModuleDetails;
var getModuleFolders = streams4.getModuleFolders;

function createProject(portalSourceFolder, pluginSourceFolders) {
	var initialCWD = process.cwd();

	process.chdir(portalSourceFolder);

	//var moduleFolders = getModuleFolders('modules', 5);
	var moduleFolders = getModuleFolders('modules/apps/marketplace', 3);

	var moduleDetails = moduleFolders.map(getModuleDetails);

	console.dir(moduleDetails, {depth: null});

	process.chdir(initialCWD);
};

exports.createProject = createProject;