var request = require('request');
var fs = require('fs');

function RemoteResolver() {
  this.baseUrl = 'https://github.com/angular/bower-material/archive/v';
  this.extension = '.tar.gz';
}

RemoteResolver.prototype.resolve = function(version) {
    if (!version) throw new Error('You have to specify a version.');

    var filename = version + this.extension;
    var self = this;

    request(self.baseUrl + filename, function(error, response) {
      var status = response.statusCode;

      if (!error && status > 0 && 200 <= status && status < 300) {
        // TODO: still needs to unpack the file
        fs.writeFile('./' + filename, response.body);
      } else {
        console.error(error || status);
      }
    });
};

module.exports = RemoteResolver;
