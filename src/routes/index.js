var express = require('express');

var Second = require('../models/second');
var TSData = require('../models/index');
var Sensor = require('../models/sensor');
var twilio = require('twilio');
var client = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);
var router = express.Router();
var User = require('../models/user');

router.get('/', function(req, res, next) {
  res.render('index', {
    user: req.user,
    message: req.flash('message')[0]
  });
});

router.get('/ping', function(req, res, next) {
  res.send("pong!");
});

router.get('/data', function(req, res){
    console.log("WE IN HERE bitches");
    //{$gte: new Date("2018-03-31 00:00:00.000"), $lte: new Date("2018-03-31 00:59:59.000")}
    var startDateFromUI = new Date("2018-03-31 00:00:00.000");
    var endDateFromUI = new Date("2018-03-31 00:59:59.000");
    console.log("DATE Start: " + startDateFromUI);
    console.log("DATE End: " + endDateFromUI);
    Sensor.findOne({name: 'BioLab-Light-1'}, function (err, sensor) {
        if (err) {
            console.log("err: " + err);
        } else {
            console.log(sensor);
            Second.find({
                sensor: sensor.id
            }, function(err, results) {
                console.log("made it here");
                if(err){
                    console.log(err);
                    res.status(500).send({
                        status: "err",
                        data: err,
                        message: 'Something went wrong'
                    });
                }else{

                    console.log(results);
                    res.status(200).send({
                        status: "success",
                        data: results,
                        message: 'You made it'
                    });
                }

            });
        }
    });/*
    Second.find({
        resolution: 'day',
        sensor: '5abe97bfc3ceae9e0cf5e33d'
    }, function(err, results) {
        console.log("made it here");
        if(err){
            console.log(err);
            res.status(500).send({
                status: "err",
                data: err,
                message: 'Something went wrong'
            });
        }else{

            console.log(results);
            res.status(200).send({
                status: "success",
                data: results,
                message: 'You made it'
            });
        }

    });*/

});
///*
var wasOnAlready = true;
var lastMessageTime = 0;
router.post('/data', function(req, res, next){
    //pass in sensor information
    //find sensor or create one
    console.log("Level 1");
    /*
    Request body format
    {
	"data": {
		"analytics": {
			"metric": 80
		},
		"info": {
			"project": "BioLab",
			"sensorType": "Temperature",
			"number": "1"
		}
	}
    }*/

    var tempSecond = new Second(req.body.data);

    var tempData = new Sensor({
        name: tempSecond.info.project + '-' + tempSecond.info.sensorType + '-' + tempSecond.info.number,
        sensorType: tempSecond.info.sensorType,
        info:  tempSecond.info
    });
    console.log("LEVEL 2");
    // will only send one Temperature issue per hour, and only sends a light message when it's changed from on to off or vice versa
    // temperature bounds are 22 C and 28 C
    if( ( ((Date.now() - lastMessageTime)/1000 > 3600) && tempData.sensorType == "Temperature" &&  (tempSecond.analytics.metric > 28.0 || tempSecond.analytics.metric < 22.0))
        || (  tempData.sensorType == "Light" &&  ( (tempSecond.analytics.metric > 1000 && wasOnAlready) || (tempSecond.analytics.metric <= 1000 && !wasOnAlready )  ))   ){
        if(tempData.sensorType == "Temperature"){
            lastMessageTime = Date.now();
            //message Temperature level   Moez: +17174971251‬
            User.find({ }, { "phoneNum": 1,"_id": 0 }, function(err, data) {
                if (err) {
                    res.status(500)
                        .json({
                            status: 'err',
                            data: err,
                            message: 'An error occured.'
                        });
                }else{
                    for(var i=0; i < data.length; i++){
                        let userNum = data[i].phoneNum;
                        let x = client.messages.create({
                            body: 'Temperature for the BioLab is at ' + tempSecond.analytics.metric + '°C!',
                            to: userNum,  // Text this number
                            from: '+15108769409' // From a valid Twilio number
                        }).then((message) => console.dir(message));
                    }

                }
            });

        }else{
            //if >1000 then its off... so false
            wasOnAlready = !(tempSecond.analytics.metric > 1000);
            var lights = wasOnAlready? 'on!':'off!';
            //message that lights switched
            User.find({ }, { "phoneNum": 1,"_id": 0 }, function(err, data) {
                if (err) {
                    res.status(500)
                        .json({
                            status: 'err',
                            data: err,
                            message: 'An error occured.'
                        });
                }else{
                    for(var i=0; i < data.length; i++){
                        let userNum = data[i].phoneNum;
                        let x = client.messages.create({
                            body: 'BioLab lights are now ' + lights,
                            to: userNum,  // Text this number
                            from: '+15108769409' // From a valid Twilio number
                        }).then((message) => console.dir(message));
                    }

                }
            });
        }
    }
    console.log("LEVEL 3");


    console.log(JSON.stringify(tempData));
    Sensor.findOne({name: tempData.name}, function (err, sensor){
        if(err){
            console.log("err: " + err);
        }else{
            console.log("SENSOR IS: " + sensor);
            if(sensor){
                //found old sensor
                console.log("FOUND OLD SENSOR");
                console.log("Level 2");
                tempSecond.sensor = sensor._id;
                tempSecond.save(function (err, doc) {
                    if (err){
                        console.log("Error: " + err);
                    }else{
                        console.log("Success: " + doc);
                        res.status(200)
                            .json({
                                status: 'success',
                                data: doc,
                                message: 'Posted temp data.'
                            });

                    }
                });
            }else{
                //doesn't exist
                console.log("DIDN'T FIND IT");
                tempData.save(function (err, sensor) {
                    if (err){
                        console.log("Saving Error: " + err);
                        res.status(500)
                            .json({
                                status: 'err',
                                data: err,
                                message: 'Failed to save data.'
                            });
                    }else{
                        console.log("Success: " + sensor);
                        //temp._id
                        console.log("Level 2");
                        tempSecond.sensor = sensor._id;
                        tempSecond.save(function (err, doc) {
                            if (err){
                                console.log("Saving Error: " + err);
                                res.status(200)
                                    .json({
                                        status: 'success',
                                        data: users,
                                        message: 'Retrieved users.'
                                    });
                            }else{
                                console.log("Success: " + doc);
                                res.status(200)
                                    .json({
                                        status: 'success',
                                        data: doc,
                                        message: 'Posted temp data.'
                                    });
                            }
                        });
                    }
                });
            }
        }
    });

});



module.exports = router;
