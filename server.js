var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var axios = require('axios');
var google = require('googleapis');
var civicinfo = google.civicinfo('v2');
var Lob = require('lob')('test_7d5d556c4703b0aa260df9f933933f6b74c');
var fs = require('fs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// configure a public directory to host static content
app.use(express.static(__dirname + '/public/'));

var htmlTemp = fs.readFileSync(__dirname + '/public/sample.html');
htmlTemp = htmlTemp.toString();

app.post('/api/details', function(req, res) {
    
    //console.log(req.body);
    var address = req.body.address1+" "+req.body.address2 +" "+ req.body.city +" "+ req.body.state;
    var html = "<html><h1> This is my Yard</h1> </html>";    
    civicinfo.representatives.representativeInfoByAddress({
      address: address,
      includeOffices: 'true',
      levels: 'administrativeArea1',
      roles: 'headOfGovernment',
      key: "AIzaSyCPfOmqGFLFhCcF4e2FJif0K1GYc20ovJQ"
    }, function(er, data){      
      
      Lob.letters.create({
        description: "Demo letter",
        to: {
          name: data.officials[0].name,
          address_line1: data.officials[0].address[0].line1,
          address_line2: '',
          address_city: data.officials[0].address[0].city,
          address_state: data.officials[0].address[0].state,
          address_zip: data.officials[0].address[0].zip,
          address_country: 'US',
          phone: data.officials[0].phones[0]
        },
        from: {
          name: req.body.from,
          address_line1: req.body.address1,
          address_line2: req.body.address2,
          address_city: req.body.city,
          address_state: req.body.state,
          address_zip: req.body.zip,
          address_country: 'US',
        },
        file: htmlTemp,        
        color: true,
        double_sided: false,
        merge_variables: {
          message: req.body.message
        }
      }, function (err, resp) {
        //console.log(err);
        //console.log(resp);
        if(err){
          res.send("Error With Data");
          return;
        }
        res.redirect(resp.url);
      });
    })
    // axios.get('https://www.googleapis.com/civicinfo/v2/representatives', 
    //   {
    //     
    //   })
    //   .then(function(response){
    //     console.log(response)
    //     //html = response;
        
    //   })
    //   .catch(function(err){
    //     //html = err;
    //     //console.dir(err);
    //   })

});


var port = 3000;

app.listen(port);