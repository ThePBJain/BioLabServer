var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var Experiment = new Schema({
    name: {
        type: String,
        unique: true
    },
    deviceId:{
        type: String,
        unique: true
    },
    sensors: [
        {
            type: Schema.Types.ObjectId,
            ref: 'sensor'
        }
    ],
    password: {
        type: String,
        required: true
    },
    admin: {
        type: Boolean,
        default: false
    },
    description: {
        type: String,
        default: 'This is an Experiment'
    }
});



module.exports = mongoose.model('experiment', Experiment);
