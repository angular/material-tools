/**
 * Node File, which will run inside of a Virtual Machine and exports an array of 50 numbers.
 * This file is used to test, that the given Virtual Machine supports the Strict Mode with Block scope.
 *
 */

let numbers = [];

for (let i = 0; i < 50; i++) {
  numbers.push(i);
}

const lol ="LOL";

module.exports = numbers;