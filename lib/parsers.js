const fs = require('fs');
const toml = require('toml');

module.exports.toml = function fromToml(data) {
  return toml.parse(data);
}

module.exports.json = function fromJson(data) {
  return JSON.parse(data);
}
