/**
 * Module dependencies.
 */

var path = require('path')
  , helper = require('./helper')
  , Project = require('./project');

/**
 * Expose `Cin`.
 */

module.exports = Cin;

/**
 * Config defaults.
 */

var configFilename = '.cin-server.json'
  , configDefaults = {
      environments: {
        node: 'nvm'
      , ruby: 'rbenv'
      }
    , builds: {
        concurency: 2
      }
    };

/**
 * Initialize `Cin` with the given `options`.
 *
 * Options:
 *
 *   - `workingPath` the working path for commands
 *
 * @param {Object} options
 * @api private
 */

function Cin(options) {
  var defaults = {
    workingPath: process.cwd()
  };

  this.options = helper.merge(defaults, options);
  this.workingPath = this.options.workingPath;
  this.projectsPath = path.join(this.workingPath, 'projects');
  this.configFilePath = path.join(this.workingPath, configFilename);
}

/**
 * Check with Cin is installed in the current working path.
 *
 * @return {Boolean}
 * @api private
 */

Cin.prototype.installed = function() {
  return path.existsSync(this.configFilePath);
}

/**
 * Install Cin at the current working path, calling `cb` when complete.
 *
 * @param {Function} cb
 * @return {this}
 * @api private
 */

Cin.prototype.install = function(cb) {
  if(this.installed()) {
    throw new Error('Cin already installed.');
  }

  var self =  this;
  helper.mkdir(this.workingPath, function() {
    helper.mkdir(self.projectsPath);
    helper.writeJSON(self.configFilePath, configDefaults);
    return cb && cb(null, this);
  });

  return this;
}

/**
 * Return a `Project` for the given `name`. It may or may not exist.
 *
 *   `name` may take the following forms:
 *
 *       - kainosnoema/cin
 *       - kainosnoema/cin@master
 *       - git@github.com:kainosnoema/cin.git
 *
 *
 * @param {String} name
 * @return {this}
 * @api private
 */

Cin.prototype.project = function(name) {
  this.assertInstalled();
  return new Project(this.resolveAlias(name), this);
}

/**
 * Get all the projects in the given current directory.
 *
 * @return {Array}
 * @api private
 */

Cin.prototype.__defineGetter__("projects", function() {
  return Project.all(this);
});

/**
 * Create and checkout a project for the given `name` (see above),
 * and sets configuration from `options` (see Project#create).
 *
 * @param {String} name
 * @return {this}
 * @api private
 */

Cin.prototype.add = function(name, options) {
  return this.project(name).create(options);
}

/**
 * Remove the project for the given `name`. rm -rf's the directory,
 * so there's no undo for this.
 *
 * @param {String} name
 * @return {this}
 * @api private
 */

Cin.prototype.remove = function(name) {
  this.project(name).destroy();
}

/**
 * Returns a `Build` for the project for the given name, at the given `ref`.
 *
 * @param {String} name
 * @param {String} ref
 * @return {this}
 * @api private
 */

Cin.prototype.build = function(name, ref) {
  return this.project(name).build(ref);
}

/**
 * Runs a build for the project for the given `name`, at the given `ref`,
 * calling `cb` when complete.
 *
 * @param {String} name
 * @param {String} ref
 * @return {this}
 * @api private
 */

Cin.prototype.run = function(name, ref, cb) {
  return this.build(name, ref).run(cb);
}

/**
 * Resolve a given project `name` as a potential alias. Preserves any
 * specified refs after the project name.
 *
 * @param {String} name
 * @return {this}
 * @api private
 */

Cin.prototype.resolveAlias = function(name) {
  if(name instanceof Project) { return name; }

  var head = name.split('@')[1]
    , alias = name.split('@')[0]
    , match = this.projects.filter(function(project) {
    return project.config.alias === alias;
  })[0];

  if(match) { return match.name + '@' + (head || 'master'); }

  return name;
}

/**
 * Assert that cin is installed.
 */

Cin.prototype.assertInstalled = function() {
  if(!this.installed()) {
    throw new Error('Cin not installed at current working path. ' +
                    'Run `cin install .` or change working paths.');
  }
}
