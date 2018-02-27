const fs = require('fs');
const toml = require('toml');

module.exports.toml = function fromToml(path) {
  const configFile = fs.readFileSync(path, 'utf8');
  return toml.parse(configFile);
}

module.exports.json = function fromJson(path) {
  const configFile = fs.readFileSync(path, 'utf8');
  return JSON.parse(configFile);
}
