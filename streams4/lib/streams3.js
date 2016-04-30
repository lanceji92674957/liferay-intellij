var fs = require('fs');
var path = require('path');
var streams2 = require('./streams2');
var util = require('util');

var getFilePath = streams2.getFilePath;
var isDirectory = streams2.isDirectory;
var isFile = streams2.isFile;
var isHidden = streams2.isHidden;

var sourceFolders = ['docroot/WEB-INF/service', 'docroot/WEB-INF/src', 'src/main/java'];
var resourceFolders = ['src/main/resources'];
var testSourceFolders = ['src/test/java', 'src/testIntegration/java', 'test/integration', 'test/unit'];
var testResourceFolders = ['src/test/resources', 'src/testIntegration/resources'];
var webrootFolders = ['src/main/resources/META-INF/resources'];

var excludeFolderMap = {
	'docroot/WEB-INF/src': 'docroot/WEB-INF/classes',
	'src': 'classes',
	'src/main/java': 'classes',
	'src/main/resources': 'classes',
	'src/test/java': 'test-classes',
	'src/test/resources': 'test-classes',
	'src/testIntegration/java': 'test-classes',
	'src/testIntegration/resources': 'test-classes',
	'test/integration': 'test-classes',
	'test/unit': 'test-classes'
};

function getFolders(folderPath, maxDepth) {
	var folders = [];

	if (!isDirectory(folderPath)) {
		return folders;
	}

	var fileNames = fs.readdirSync(folderPath);

	var filePaths = fileNames.map(getFilePath.bind(null, folderPath));
	var visibleDirectories = filePaths.filter(isVisibleDirectory);

	for (var i = 0; i < visibleDirectories.length; i++) {
		var filePath = visibleDirectories[i];

		folders.push(filePath);

		if (maxDepth > 0) {
			Array.prototype.push.apply(
				folders, getFolders(filePath, maxDepth - 1));
		}
	}

	return folders;
};

function getModuleDependencies(folder) {
	return {
		libraryDependencies: []
	};
};

function getModuleDetails(folder) {
	var moduleOverview = getModuleOverview(folder);
	var moduleIncludeFolders = getModuleIncludeFolders(folder);
	var moduleExcludeFolders = getModuleExcludeFolders(moduleIncludeFolders);
	var moduleDependencies = getModuleDependencies(folder);

	var moduleDetailsArray = [moduleOverview, moduleIncludeFolders, moduleExcludeFolders, moduleDependencies];

	return moduleDetailsArray.reduce(util._extend, {});
};

function getModuleExcludeFolders(moduleIncludeFolders) {
	var moduleExcludeFolders = [];

	for (key in moduleIncludeFolders) {
		if (moduleIncludeFolders.hasOwnProperty(key)) {
			moduleIncludeFolders[key].reduce(updateExcludeFolders, moduleExcludeFolders);
		}
	}

	return {
		excludeFolders: moduleExcludeFolders
	};
};

function getModuleFolders(folderPath, maxDepth) {
	var findResultFolders = getFolders(folderPath, maxDepth);
	var moduleFolders = findResultFolders.filter(isModuleFolder);
	return moduleFolders;
};

function getModuleIncludeFolders(folder) {
	var isValidSourceFolder = isValidSourcePath.bind(null, folder);

	var moduleIncludeFolders = {
		sourceFolders: sourceFolders.filter(isValidSourceFolder),
		resourceFolders: resourceFolders.filter(isValidSourceFolder),
		testSourceFolders: testSourceFolders.filter(isValidSourceFolder),
		testResourceFolders: testResourceFolders.filter(isValidSourceFolder),
		webrootFolders: webrootFolders.filter(isValidSourceFolder)
	};

	return moduleIncludeFolders;
};

function getModuleOverview(folder) {
	return {
		moduleName: path.basename(folder),
		modulePath: folder
	};
};

function isModuleFolder(folder) {
	var getPath = getFilePath.bind(null, folder);

	var subfiles = ['bnd.bnd', 'build.gradle'];
	var subfolders = ['docroot', 'src'];

	return subfiles.map(getPath).every(isFile) &&
		subfolders.map(getPath).some(isDirectory);
};

function isValidSourcePath(moduleRoot, sourceFolder) {
	var sourceFolderPath = getFilePath(moduleRoot, sourceFolder);

	return isDirectory(sourceFolderPath) && !isFile(getFilePath(sourceFolderPath, '.touch'));
};

function isVisibleDirectory(filePath) {
	return isDirectory(filePath) && !isHidden(filePath);
};

function updateExcludeFolders(excludeFolders, includeFolder) {
	if (!(includeFolder in excludeFolderMap)) {
		return excludeFolders;
	}

	var excludeFolder = excludeFolderMap[includeFolder];

	if (excludeFolders.indexOf(excludeFolder) == -1) {
		excludeFolders.push(excludeFolder);
	}

	return excludeFolders;
};

exports.getFolders = getFolders;
exports.getModuleDetails = getModuleDetails;
exports.getModuleDependencies = getModuleDependencies;
exports.getModuleExcludeFolders = getModuleExcludeFolders;
exports.getModuleFolders = getModuleFolders;
exports.getModuleIncludeFolders = getModuleIncludeFolders;
exports.getModuleOverview = getModuleOverview;
exports.isValidSourcePath = isValidSourcePath;