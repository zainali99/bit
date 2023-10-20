/**
 * @jest-environment jsdom
 */
const Bit = require('../js/bit.js');

test('basic init bit.js', () => {
   /** Create and add dummy div **/
   let e = document.createElement('div');
   e.setAttribute('bit-instance','')
   document.body.appendChild(e);
   const elem = document.querySelector('div[bit-instance]');
   const bit = new Bit(elem, {
       'headers': {
           'X-CSRFToken': 'test-bit-django'
       },
       'upload_url':'http://localhost:9000/test_upload'});


   expect(bit.version).toBe('0.1');



});