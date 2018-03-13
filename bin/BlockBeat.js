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
        if (api_path === void 0) { api_path = "http://localhost:9984/api/v1/"; }
        this._app_id = "5f8c5f3f";
        this._app_key = "f60a520fc0c384ae9f4ccd4d02675160";
        this._api_path = "http://localhost:9984/api/v1/";
        this._persons = new Array();
        this._tx = new Array();
        this._app_id = app_id;
        this._app_key = app_key;
        this._api_path = api_path;
        this._connection = new driver.Connection(this.api_path, {
            app_id: this.app_id,
            app_key: this.app_key
        });
        this._tx = new Array();
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
     * @param [HeartRate] heartRate - The HeartRate to add.
     */
    BlockBeat.prototype.addHeartRate = function (heartRate, identity) {
        var output = [driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(identity.publicKey))
        ];
        var txNewTransaction = driver.Transaction.makeCreateTransaction(heartRate, 
        // A transaction needs an output
        output, identity.publicKey);
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
