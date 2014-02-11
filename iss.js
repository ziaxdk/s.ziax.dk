// var requestify = require('requestify');

// var uri = 'http://spaceflight.nasa.gov/realdata/sightings/SSapplications/Post/JavaSSOP/orbit/ISS/SVPOST.html';

// requestify.get(uri).then(function(response) {
//     // Get the response body
//     var data = response.getBody();

//     data = data.split("<PRE>")[1];
//     // data = data.split("</PRE>")[0];
//     // data = data.split("Vector Time (GMT): ")[1];
    
//     console.log(data);

//     // data.forEach(function(d) {
//     //   console.log(d);

//     // });
// });

var fs = require('fs');

var data = fs.readFileSync('iss-tle.html').toString();


data = data.split("<PRE>")[1];
data = data.split("</PRE>")[0];
data = data.split("Vector Time (GMT): ");

data.forEach(function(elm) {
  console.log(elm.substring(0,1000));

});
