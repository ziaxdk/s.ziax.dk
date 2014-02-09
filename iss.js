var requestify = require('requestify');

var uri = 'http://spaceflight.nasa.gov/realdata/sightings/SSapplications/Post/JavaSSOP/orbit/ISS/SVPOST.html';

requestify.get(uri).then(function(response) {
    // Get the response body
    var data = response.getBody();

    data = data.split("<PRE>")[1];
    data = data.split("</PRE>")[0];
    data = data.split("Vector Time (GMT): ")[1];
    
    console.log(data.substring(0,100));

    // data.forEach(function(d) {
    //   console.log(d);

    // });
});

