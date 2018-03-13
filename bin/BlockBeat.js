"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
}
Object.defineProperty(exports, "__esModule", { value: true });
// Bigchaindb-driver from npm
var driver = __importStar(require("bigchaindb-driver"));
var bip39 = __importStar(require("bip39"));
var BlockBeat = /** @class */ (function () {
    function BlockBeat(app_id, app_key, api_path) {
        if (app_id === void 0) { app_id = "5f8c5f3f"; }
        if (app_key === void 0) { app_key = "f60a520fc0c384ae9f4ccd4d02675160"; }
        if (api_path === void 0) { api_path = "https://test.bigchaindb.com/api/v1/"; }
        this._app_id = "9cc97217";
        this._app_key = "c2f607017548896f02d2bf45a7696cab";
        this._api_path = "https://test.bigchaindb.com/api/v1/";
        this._persons = new Array();
        this._app_id = app_id;
        this._app_key = app_key;
        this._api_path = api_path;
        this._connection = new driver.Connection(this.api_path, {
            app_id: this.app_id,
            app_key: this.app_key
        });
    }
    Object.defineProperty(BlockBeat.prototype, "app_id", {
        // Getters
        get: function () {
            return this._app_id;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BlockBeat.prototype, "app_key", {
        get: function () {
            return this._app_key;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BlockBeat.prototype, "api_path", {
        get: function () {
            return this._api_path;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BlockBeat.prototype, "connection", {
        get: function () {
            return this._connection;
        },
        enumerable: true,
        configurable: true
    });
    // Methods
    /**
     * Create a new asset to push to BigChainDB.
     *
     * @param [string] patientId - The ID of the patient this medical information belongs to.
     * @param [HeartRate] heartRate - The HeartRate to add.
     */
    BlockBeat.prototype.createHeartRate = function (patientId, heartRate, identity, callback) {
        var _this = this;
        var output = [driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(identity.publicKey))
        ];
        var txNewTransaction = driver.Transaction.makeCreateTransaction(
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
        output, identity.publicKey);
        // We sign this new transaction
        var signedTransaction = driver.Transaction.signTransaction(txNewTransaction, identity.privateKey);
        // Send the transaction off to BigchainDB
        this.connection.postTransaction(signedTransaction)
            .then(function () { return _this.connection.pollStatusAndFetchTransaction(signedTransaction.id); })
            .then(function (res) {
            // txSigned.id corresponds to the asset id of the painting
            callback(signedTransaction.id);
        });
    };
    BlockBeat.prototype.getAssetIdByPatientId = function (patientId, callback) {
        this.connection.searchAssets(patientId).then(function (assets) {
            callback(assets[0].id);
        });
    };
    /**
     * Append a new HeartRateReading to an existing asset.
     *
     * @param [string] assetId - The ID of the asset we want to update/transfer.
     * @param [HeartRate] heartRate - The new HeartRate reading we want to append.
     * @param [any] identity - The identity of the asset owner.
     * @param [any] callback - The callback function that needs to be executed on completion.
     */
    BlockBeat.prototype.addHeartRate = function (assetId, heartRate, identity, callback) {
        var _this = this;
        console.log("transaction started.");
        // We retrieve the transaction based on its id
        this.connection.getTransaction(assetId).then(function (transaction) {
            console.log("asset pulled");
            // We create a transfer transaction based on the returned transaction
            var transferTransaction = driver.Transaction.makeTransferTransaction([{ tx: transaction, output_index: 0 }], [driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(identity.publicKey))], 
            // Add the new HeartRate reading as metadata.
            heartRate);
            console.log("signing transaction");
            // Sign this transaction
            var signedTransaction = driver.signTransaction(transferTransaction, identity.privateKey);
            console.log("posting transaction.");
            // Submit this transaction and return the promise
            return _this.connection.postTransaction(signedTransaction);
        }).then(function (signedTransaction) {
            console.log("transaction sent.");
            // Poll for the status of the submitted transaction
            driver.pollStatusAndFetchTransaction(signedTransaction.id).then(function (response) {
                // Send the id to the callback function
                callback(response.id);
            });
        });
    };
    /**
     *
     * @param callback
     */
    BlockBeat.prototype.getAllHeartRates = function (callback) {
        this.connection.searchAssets("BlockBeatAsset").then(function (assets) {
            callback(assets);
        });
    };
    BlockBeat.prototype.getAllHeartRatesByPatientId = function (patientId, callback) {
        this.connection.searchMetadata(patientId).then(function (assets) {
            callback(assets);
        });
    };
    BlockBeat.prototype.generateIdentity = function (seed) {
        if (seed === void 0) { seed = ""; }
        if (seed == "")
            return new driver.Ed25519Keypair();
        return new driver.Ed25519Keypair(bip39.mnemonicToSeed(seed).slice(0, 32));
    };
    return BlockBeat;
}());
exports.BlockBeat = BlockBeat;
__export(require("./HeartRate"));
__export(require("./Person"));
