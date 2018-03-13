var bbApp = new Vue({
    el: '#bbApp',
    data: {
        // The BlockBeat class connecting to BigChainDB
        blockBeat: new blockbeat_module.BlockBeat(),

        // Link to firebase database
        database: firebase.database(),

        // General
        title: "BlockBeat",
        slogan: "Take distribution to heart",

        // Routing
        activePane: "login",

        // User
        currentUser: undefined,

        // inputfields
        registerUserName: "",
        registerFirstName: "",
        registerLastName: "",
        registerPassword: "",

        loginUserName: "",
        loginPassword: "",
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

                if (snapshot.val() == null) 
                {
                    error("Wrong username or password.");
                    return "Wrong username or password.";
                }

                if (snapshot.val().password != bbApp.blockBeat.generateIdentity(bbApp.loginPassword).publicKey)
                {
                    error("Wrong username or password.");
                    return "Wrong username or password.";
                }

                bbApp.currentUser = snapshot.val();
                bbApp.clearInputFields();
            });
        },
        logOut() {
            this.currentUser = undefined;
            this.clearInputFields();
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
        }
    }
});