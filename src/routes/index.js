var express = require('express');

var Second = require('../models/second');
var TSData = require('../models/index');
var Sensor = require('../models/sensor');
var router = express.Router();


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
router.post('/data', function(req, res, next){
    //pass in sensor information
    //find sensor or create one
    console.log("Level 1");
    /*
    Request body format
    {
	"temp": {
		"analytics": {
			"metric": 80
		},
		"info": {
			"project": "BioLab",
			"sensorType": "Temperature(F)",
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
