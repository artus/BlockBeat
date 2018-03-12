export class HeartRate
{
    constructor(public id : string, public doctorId : string, public patientId : string, public bpm : number, public date : Date)
    {
        // Let typescript handle the rest.
    }
}