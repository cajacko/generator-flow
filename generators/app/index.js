const Generator = require('yeoman-generator');
const path = require('path');
const checkOutOfDatePackages = require('check-out-of-date-packages');
const winston = require('winston');
const npmAddScript = require('npm-add-script');

module.exports = class extends Generator {
  initializing() {
    const cwd = path.join(__dirname, '../../');
    return checkOutOfDatePackages(cwd, 'Charlie Jackson');
  }

  writing() {
    this.fs.copy(
      this.templatePath('./.babelrc'),
      this.destinationPath('./.babelrc')
    );

    this.fs.copy(
      this.templatePath('./.flowconfig'),
      this.destinationPath('./.flowconfig')
    );
  }

  addLintScript() {
    const packageJsonPath = this.destinationPath('package.json');
    let packageJson;

    try {
      packageJson = this.fs.readJSON(packageJsonPath);
    } catch (e) {
      winston.log('info', 'No package.json file, creating one');
      this.spawnCommandSync('npm', ['init']);
      packageJson = this.fs.readJSON(packageJsonPath);
    }

    winston.log('debug', 'packageJson', packageJson);

    if (!packageJson.scripts || !packageJson.scripts.flow) {
      npmAddScript({ key: 'flow', value: 'flowcheck' });
    }

    if (!packageJson.scripts || !packageJson.scripts['flow:skip']) {
      npmAddScript({ key: 'flow:check', value: 'flowcheck check --skip-check' });
    }

    winston.log('debug', 'packageJson', packageJson);

    return true;
  }

  installPackages() {
    this.npmInstall(['flow-check'], { save: true });
    this.npmInstall(['babel-cli'], { save: true });
    this.npmInstall(['babel-plugin-transform-flow-strip-types'], { save: true });
  }
};
