"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var HeartRate = /** @class */ (function () {
    function HeartRate(id, doctorId, patientId, bpm, date) {
        this.id = id;
        this.doctorId = doctorId;
        this.patientId = patientId;
        this.bpm = bpm;
        this.date = date;
        // Let typescript handle the rest.
    }
    return HeartRate;
}());
exports.HeartRate = HeartRate;
