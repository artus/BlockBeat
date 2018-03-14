var bbApp = new Vue({
    el: '#bbApp',
    data: {
        // The BlockBeat class connecting to BigChainDB
        blockBeat: new blockbeat_module.BlockBeat(this.log),

        // List of all transactions
        heartRates: new Array(),

        // Link to firebase database
        database: firebase.database(),

        // General
        title: "BlockBeat",
        slogan: "Take distribution to heart",

        // Flags
        enablePulling: true,

        // Routing
        activePane: "login",

        // User
        currentUser: undefined,
        currentIdentity: undefined,
        assetId: undefined,
        asset:  undefined,

        // inputfields
        registerUserName: "",
        registerFirstName: "",
        registerLastName: "",
        registerPassword: "",

        loginUserName: "",
        loginPassword: "",

        inputHeartrate: "",

        logText:  "",
    },
    methods: {
        isActive(pane) {
            return (this.activePane == pane);
        },
        setActive(pane) {
            this.activePane = pane;
        },
        isLoggedIn() {
            return (typeof this.currentUser != "undefined");
        },
        logIn() {
            return firebase.database().ref('/users/' + this.loginUserName).once('value').then(function (snapshot) {
                let error = function (message) {
                    alert(message);
                };

                if (snapshot.val() == null) {
                    error("Wrong username or password.");
                    return "Wrong username or password.";
                }

                if (snapshot.val().password != bbApp.blockBeat.generateIdentity(bbApp.loginPassword).publicKey) {
                    error("Wrong username or password.");
                    return "Wrong username or password.";
                }

                bbApp.currentUser = snapshot.val();
                bbApp.currentIdentity = bbApp.blockBeat.generateIdentity(bbApp.loginPassword);
                bbApp.getAllHeartRatesForCurrentUser();
                bbApp.setActive('overview');
                bbApp.blockBeat.getAssetByPatientId(bbApp.currentUser.id, bbApp.loadAsset);
                bbApp.clearInputFields();
            });
        },
        logOut() {
            this.currentUser = undefined;
            this.currentIdentity = undefined;
            this.assetId = undefined;
            this.asset = undefined;
            this.clearInputFields();
            this.setActive('login');
        },
        generateGuid() {
            var S4 = function () {
                return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
            };
            return (S4() + S4() + "-" + S4() + S4() +  "-" + S4() + S4() + "-" + S4() + S4() + "-" + S4() + S4() + S4());
        },
        register() {
            return firebase.database().ref('/users/').once('value').then(function (snapshot) {
                let users = snapshot.val();


                if (users != null) {
                    for (let key in users) {
                        if (key.toLowerCase() == bbApp.registerUserName.toLowerCase()) {
                            alert("Username already exists.");
                            return "Username already exists.";
                        }

                    }
                }

                let newId = bbApp.generateGuid();
                let keyPair = bbApp.blockBeat.generateIdentity(bbApp.registerPassword);
                let newPerson = new blockbeat_module.Person(newId, bbApp.registerUserName, bbApp.registerFirstName, bbApp.registerLastName, keyPair.publicKey);

                firebase.database().ref('users/' + newPerson.userName).set(newPerson);
                alert("Registration successful!");
                bbApp.setActive("login");

                bbApp.clearInputFields();
            });
        },
        clearInputFields() {
            this.registerUserName = "";
            this.registerFirstName = "";
            this.registerLastName = "";
            this.registerPassword = "";

            this.loginUserName = "";
            this.loginPassword = "";

            this.inputHeartrate = "";
        },
        loadAsset(asset) {
            this.log("Asset for patient with id " + this.currentUser.id + " loaded: " + asset.id);
            this.asset = asset;
            this.assetId = asset.id;
            this.getAllHeartRatesForCurrentUser();
        },
        addHeartRateClicked() {
            let bpm = this.inputHeartrate;
            this.addHeartRate(bpm);
            this.clearInputFields();
        },
        addHeartRate(bpm) {

            // Initialise a new HeartRate
            let heartRate = new blockbeat_module.HeartRate(this.currentUser.id, this.generateGuid(), bpm, new Date());

            // We check if the active user already has an asset stored on BigChainDB:
            if (typeof this.assetId == "undefined") {

                // No asset ID found, we will add a HeartRate using a CREATE transaction.
                this.log("Sending CREATE transaction to BigChainDB to create a new patient asset. bpm: " + bpm);
                this.blockBeat.createHeartRate(this.currentUser.id, heartRate, this.currentIdentity, this.transactionPosted);
            }
            else {

                // Asset ID found, we will append a HeartRate using an UPDATE transaction.
                this.log("Sending TRANSFER transaction to BigChainDB to update patient asset with latest transaction ID: " + this.latestTransaction().id + ", bpm: " + bpm);
                this.blockBeat.addHeartRate(this.latestTransaction(), heartRate, this.currentIdentity, this.transactionPosted);
            }

            this.getAllHeartRatesForCurrentUser();
        },
        latestTransaction() {
            return this.heartRates[this.heartRates.length - 1];
        },
        transactionPosted() {
            this.blockBeat.getAssetByPatientId(this.currentUser.id, this.loadAsset);
            this.getAllHeartRatesForCurrentUser()
        },
        getAllHeartRatesForCurrentUser() {
            if (this.isLoggedIn() && this.enablePulling) {
                this.log("Pulling patient data.");

                // Load metadata for certain
                this.blockBeat.getTransactionsByAssetId(this.assetId, (response) => {
                    bbApp.heartRates = JSON.parse(response);
                });
            }
        },
        log(message) {
            
            let timedMessage = new Date().toLocaleTimeString() + " - " + message;
            this.logText = timedMessage + '\n' + this.logText;
            console.log(timedMessage);
        }
    }
});

bbApp.getAllHeartRatesForCurrentUser();
setInterval(bbApp.getAllHeartRatesForCurrentUser, 60000);