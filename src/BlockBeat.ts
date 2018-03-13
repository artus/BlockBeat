// Bigchaindb-driver from npm
import * as driver from 'bigchaindb-driver';
import * as bip39 from 'bip39';

// Domain classes
import { HeartRate } from './HeartRate';
import { Person } from './Person';

export class BlockBeat
{
    private _app_id   : string = "5f8c5f3f";
    private _app_key  : string = "f60a520fc0c384ae9f4ccd4d02675160";
    private _api_path : string = "http://localhost:9984/api/v1/";

    private _connection : driver.connection;

    public _persons = new Array<Person>();
    public _tx      = new Array<any>();

    constructor(app_id : string = "5f8c5f3f", app_key : string = "f60a520fc0c384ae9f4ccd4d02675160", api_path : string = "http://localhost:9984/api/v1/")
    {
        this._app_id = app_id;
        this._app_key = app_key;
        this._api_path = api_path;

        this._connection = new driver.Connection(this.api_path, {
            app_id: this.app_id,
            app_key: this.app_key
        });

        this._tx = new Array();
    }

    // Getters

    private get app_id() : string
    {
        return this._app_id;
    }

    private get app_key() : string
    {
        return this._app_key;
    }

    private get api_path() : string
    {
        return this._api_path;
    }

    private get connection() : driver.connection
    {
        return this._connection;
    }

    // Methods

    /**
     * Add a new HeartRate to the BigChainDB.
     * 
     * @param [HeartRate] heartRate - The HeartRate to add.
     */
    public addHeartRate(heartRate : HeartRate, identity : any) : any
    {
        let output = 
            [ driver.Transaction.makeOutput(
                    driver.Transaction.makeEd25519Condition(identity.publicKey))
            ];

        const txNewTransaction = driver.Transaction.makeCreateTransaction(
            heartRate,
            // A transaction needs an output
            output,
            identity.publicKey
        )

        // Keep track of all transactions
        this._tx.push(txNewTransaction);
    }

    public getHeartRate(id : string) : HeartRate
    {
        // TODO
        return null;
    }

    public getAllHeartRates() : Array<HeartRate>
    {
        return null;
    }

    public generateIdentity(seed : string = "") : any
    {
        if (seed == "") return new driver.Ed25519Keypair();
        return new driver.Ed25519Keypair(bip39.mnemonicToSeed(seed).slice(0, 32));
    }
}

export * from './HeartRate';
export * from './Person';