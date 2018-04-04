var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var Sensor = new Schema({
    date: { type: Date, default: Date.now },
    name: {
        type: String,
        unique: true
    },
    sensorType:{
        type: String
    },
    info: {
        project: { type: String },
        sensorType: { type: String },
        number: { type: String }
    },
    description: {
        type: String,
        default: 'This is a sensor.'
    }
});



module.exports = mongoose.model('sensor', Sensor);
