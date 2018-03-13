"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var HeartRate = /** @class */ (function () {
    function HeartRate(patientId, id, bpm, date) {
        this.patientId = patientId;
        this.id = id;
        this.bpm = bpm;
        this.date = date;
        // Let typescript handle the rest.
    }
    return HeartRate;
}());
exports.HeartRate = HeartRate;
