var m = require('./server-utils')();

var o = {
  '_test1_1': 'no1',
  'test1_2': 'no1',

  '_test2_1': ['no1'],
  'test2_2': ['no1'],

  '_test3_1': [{ 'key': 'key', 'value': 'value' }],
  'test3_2': [{ 'key': 'key', 'value': 'value' }],

  '_test4_1': [{ '_key': 'key', 'value': 'value' }],
  'test4_2': [{ 'key': 'key', '_value': 'value' }]
};

console.log(m.ngPrivateRemover(o));