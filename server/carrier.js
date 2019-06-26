/*
Copyright 2010 Pedro Teixeira. All rights reserved.
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
 */
var util    = require('util'),
    events = require('events');

function Carrier(reader, listener, encoding) {
  var self = this;
  
  self.reader = reader;

  if (listener) {
    self.addListener('line', listener);
  }
  
  var line = '';
  
  reader.on('data', function(data) {
    var decoded = data.toString(encoding);
    //console.log(decoded);
    var lines = decoded.split("\n");
    if (decoded.charAt(decoded.length - 1) == "\n") {
      // get rid of last "" after last "\n"
      lines.pop(1);
    }
    
    if (lines.length > 0) {
      //console.log('Have ' + lines.length + " lines\n");
      lines.forEach(function(one_line, index) {
        line += one_line;
        var emit = true;
        if (index == lines.length - 1) {
          // processing last line
          if (decoded.charAt(decoded.length - 1) != "\n") {
            // if it was not terminated by "\n" then the last line was not finished; we just buffer it.
            //console.log('last one does not have \n, not emitting');
            emit = false;
          }
        }
        if (emit) {
          line = line.replace("\r", '');
          //console.log('emiting ' + line + "\n");
          self.emit('line', line);          
          line = '';
        }
      });
    }
  });
  
  var ender = function() {
    if (line.length > 0) {
      line = line.replace("\r", '');
      self.emit('line', line);
      line = '';
    }
    self.emit('end');
  };
  
  reader.on('end', ender);
  reader.on('close', ender);
}

util.inherits(Carrier, events.EventEmitter);

exports.carry = function(reader, listener, encoding) {
  return new Carrier(reader, listener, encoding);
};
