export class HeartRate
{
    constructor(public patientId: string, public id : string, public bpm : number, public date : Date)
    {
        // Let typescript handle the rest.
    }
}