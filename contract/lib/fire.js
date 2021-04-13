const firebase = require('firebase');

const firebaseConfig = {
    apiKey: "AIzaSyDYA3KJa8ZMDX_S7VT9-35mhotMes2x_DE",
    authDomain: "kyber-wallet.firebaseapp.com",
    projectId: "kyber-wallet",
    storageBucket: "kyber-wallet.appspot.com",
    messagingSenderId: "44614392003",
    appId: "1:44614392003:web:cf22fdfa3588712871aa76",
    measurementId: "G-FG9CP6MFWX"
};

const fire = firebase.initializeApp(firebaseConfig);

module.exports = fire;