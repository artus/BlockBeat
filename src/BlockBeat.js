"use strict";
exports.__esModule = true;
// Bigchaindb-driver from npm
var driver = require("bigchaindb-driver");
var BlockBeat = /** @class */ (function () {
    function BlockBeat(app_id, app_key, api_path) {
        if (app_id === void 0) { app_id = "5f8c5f3f"; }
        if (app_key === void 0) { app_key = "f60a520fc0c384ae9f4ccd4d02675160"; }
        if (api_path === void 0) { api_path = "http://localhost:9984/api/v1/"; }
        this._app_id = "5f8c5f3f";
        this._app_key = "f60a520fc0c384ae9f4ccd4d02675160";
        this._api_path = "http://localhost:9984/api/v1/";
        this.identity = new driver.ED25519Keypair();
        this.public_tx = Array();
        this._app_id = app_id;
        this._app_key = app_key;
        this._api_path = api_path;
        this._connection = new driver.connection(this.api_path, {
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
     * Add a new HeartRate to the BigChainDB.
     *
     * @param [HeartRate] The HeartRate to add.
     */
    BlockBeat.prototype.addHeartRate = function (heartRate) {
        var output = [driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(this.identity.publicKey))
        ];
        var txNewTransaction = driver.Transaction.makeCreateTransaction(heartRate, 
        // A transaction needs an output
        output, this.identity.publicKey);
        // Keep track of all transactions
        this._tx.push(txNewTransaction);
    };
    BlockBeat.prototype.getHeartRate = function (id) {
        // TODO
        return null;
    };
    BlockBeat.prototype.getAllHeartRates = function () {
        return null;
    };
    return BlockBeat;
}());
exports.BlockBeat = BlockBeat;
