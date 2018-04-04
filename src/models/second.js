var mongoose = require('mongoose');
//var timeseries = require('mongoose-timeseries');
var timeseries = require('./index');
var Schema = mongoose.Schema;

//base schema
var Seconds = new Schema({
    sensor: { type: Schema.Types.ObjectId, ref: 'sensor' },
    date: { type: Date, default: Date.now },
    analytics: {
        metric: { type: Number }
    },
    info: {
        project: { type: String },
        sensorType: { type: String },
        number: { type: String }
    }
});


//timeseries plugin
Seconds.plugin(timeseries, {
    target: 'TimeSeriesDocument',
    dateField: 'date',
    resolutions: ['minute', 'hour', 'day'],
    key: {
        sensor: 1,
        info: function(doc) {
            return doc.info.project + "-" + doc.info.sensorType + "-" + doc.info.number
        }
    },
    data: {
        metric: {
            source: 'analytics.metric',
            operations: ['sum', 'max', 'min'],
            calculations: ['average', 'range', 'range_min', 'range_max']
        }
    }
});

module.exports = mongoose.model('second', Seconds);