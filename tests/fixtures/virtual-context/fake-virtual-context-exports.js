/**
 * Basic Node File, which will run inside of a Virtual Machine and exports an array of 50 numbers.
 * This file is used to test, that nested requires inside of a VM are working properly.
 */

var numbers = [];

for (var i = 0; i < 50; i++) {
  numbers.push(i);
}

module.exports = numbers;