var bbApp = new Vue({
    el: '#bbApp',
    data: {
        // The BlockBeat class connecting to BigChainDB
        blockBeat: new blockbeat_module.BlockBeat(),

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

        // inputfields
        registerUserName: "",
        registerFirstName: "",
        registerLastName: "",
        registerPassword: "",

        loginUserName: "",
        loginPassword: "",

        inputHeartrate: "",
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
                bbApp.blockBeat.getAssetIdByPatientId(bbApp.currentUser.id, bbApp.loadAssetId);
                bbApp.clearInputFields();
            });
        },
        logOut() {
            this.currentUser = undefined;
            this.currentIdentity = undefined;
            this.assetId = undefined;
            this.clearInputFields();
            this.setActive('login');
        },
        generateGuid() {
            var S4 = function () {
                return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
            };
            return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
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
        loadAssetId(id) {
            this.assetId = id;
            this.getAllHeartRatesForCurrentUser();
        },
        addHeartRateClicked() {
            let bpm = this.inputHeartrate;
            this.addHeartRate(bpm);
            this.clearInputFields();
        }
        ,
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
                this.log("Sending TRANSFER transaction to BigChainDB to update patient asset with ID: " + this.assetId + ", bpm: " + bpm);
                this.blockBeat.addHeartRate(this.assetId, heartRate, this.currentIdentity, this.transactionPosted);
            }

            this.getAllHeartRatesForCurrentUser();
        },
        transactionPosted() {
            this.blockBeat.getAssetIdByPatientId(this.currentUser.id, this.loadAssetId);
        },
        getAllHeartRatesForCurrentUser() {
            if (this.isLoggedIn() && this.enablePulling) {
                this.log("Pulling patient data.");

                // Load metadata for certain
                this.blockBeat.getAllHeartRatesByPatientId(this.currentUser.id, (response) => {

                    bbApp.heartRates = response;
                });
            }
        },
        log(message) {
            console.log(new Date().toLocaleTimeString() + " - " + message);
        }
    }
});

bbApp.getAllHeartRatesForCurrentUser();
setInterval(bbApp.getAllHeartRatesForCurrentUser, 60000);