// Bigchaindb-driver from npm
import * as driver from 'bigchaindb-driver';
import * as bip39 from 'bip39';

// Domain classes
import { HeartRate } from './HeartRate';
import { Person } from './Person';

export class BlockBeat {
    private _app_id: string = "9cc97217";
    private _app_key: string = "c2f607017548896f02d2bf45a7696cab";
    private _api_path: string = "https://test.bigchaindb.com/api/v1/";

    private _connection: driver.connection;

    public _persons = new Array<Person>();

    constructor(public log : any = console.log, app_id: string = "5f8c5f3f", app_key: string = "f60a520fc0c384ae9f4ccd4d02675160", api_path: string = "https://test.bigchaindb.com/api/v1/") {
        this._app_id = app_id;
        this._app_key = app_key;
        this._api_path = api_path;

        this._connection = new driver.Connection(this.api_path, {
            app_id: this.app_id,
            app_key: this.app_key
        });
    }

    // Getters

    private get app_id(): string {
        return this._app_id;
    }

    private get app_key(): string {
        return this._app_key;
    }

    private get api_path(): string {
        return this._api_path;
    }

    private get connection(): driver.connection {
        return this._connection;
    }

    // Methods

    /**
     * Create a new asset to push to BigChainDB.
     * 
     * @param [string] patientId - The ID of the patient this medical information belongs to.
     * @param [HeartRate] heartRate - The HeartRate to add.
     */
    public createHeartRate(patientId: string, heartRate: HeartRate, identity: any, callback: any): any {
        let output =
            [driver.Transaction.makeOutput(
                driver.Transaction.makeEd25519Condition(identity.publicKey))
            ];

        const txNewTransaction = driver.Transaction.makeCreateTransaction(
            // Asset: is of the patient this heartrate is from
            {
                "data": {
                    "type": "BlockBeatAsset",
                    "patient": patientId
                }
            },

            // Meta: the heartrate reading
            heartRate,

            // A transaction needs an output
            output,
            identity.publicKey
        );

        // We sign this new transaction
        const signedTransaction = driver.Transaction.signTransaction(txNewTransaction, identity.privateKey)

        // Send the transaction off to BigchainDB
        this.connection.postTransaction(signedTransaction)
            // Check the status of the transaction
            .then(() => this.connection.pollStatusAndFetchTransaction(signedTransaction.id))
            .then(res => {
                // txSigned.id corresponds to the asset id of the painting
                callback(res.id);
            })
    }

    public getAssetByPatientId(patientId, callback) {
        this.connection.searchAssets(patientId).then(assets => {
            callback(assets[0]);
        })
    }

    /**
     * Append a new HeartRateReading to an existing asset.
     * 
     * @param {any} transaction - The transaction we want to update/transfer.
     * @param {HeartRate} heartRate - The new HeartRate reading we want to append.
     * @param {any} identity - The identity of the asset owner.
     * @param {any} callback - The callback function that needs to be executed on completion.
     */
    public addHeartRate(transaction: any, heartRate: HeartRate, identity: any, callback: any): any {

        this.log("transaction started.");

        // We retrieve the transaction based on its id
        this.connection.getTransaction(transaction.id).then(transaction => {

            this.log("asset pulled");

            // We create a transfer transaction based on the returned transaction
            const transferTransaction = driver.Transaction.makeTransferTransaction(
                [{ tx: transaction, output_index: 0 }],

                [driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(identity.publicKey))],

                // Add the new HeartRate reading as metadata.
                heartRate
            );

            this.log("signing transaction");

            // Sign this transaction
            const signedTransaction = driver.Transaction.signTransaction(transferTransaction, identity.privateKey);

            this.log("posting transaction.");

            // Submit this transaction and return the promise
            return this.connection.postTransaction(signedTransaction);
        }).then(signedTransaction => {

            this.log("transaction sent.");

            // Poll for the status of the submitted transaction
            return this.connection.pollStatusAndFetchTransaction(signedTransaction.id);

        }).then(response => {

            this.log("transaction sucesfully appended.");

            // Send the id to the callback function
            callback(response.id);
        });
    }

    /**
     * 
     * @param callback 
     */
    public getAllHeartRates(callback: any) {
        this.connection.searchAssets("BlockBeatAsset").then(assets => {
            callback(assets);
        })
    }

    public getAllHeartRatesByPatientId(patientId: string, callback: any) {
        this.connection.searchMetadata(patientId).then(assets => {
            callback(assets);
        })
    }

    public generateIdentity(seed: string = ""): any {
        if (seed == "") return new driver.Ed25519Keypair();
        return new driver.Ed25519Keypair(bip39.mnemonicToSeed(seed).slice(0, 32));
    }

    /**
     * Get an array of transactions for a certain asset with supplied ID.
     * 
     * @param {string} assetId - The ID of the asset you want to pull the transactions from.
     * @param {any} callback - The function that should handle the response.
     */
    public getTransactionsByAssetId(assetId: string, callback: any) {
        const request = new XMLHttpRequest();

        request.onreadystatechange = () => {
            if (request.status == 200 && request.readyState == 4) {
                callback(request.response);
            };
        };

        request.open("GET", "https://test.bigchaindb.com/api/v1/transactions?asset_id=" + assetId);
        request.send();
    }
}

export * from './HeartRate';
export * from './Person';