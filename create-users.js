const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

// Varmista, että polku tietokantaan on oikein
const dbPath = path.join(__dirname, 'data', 'yhteydenotot.db');
const db = new sqlite3.Database(dbPath);

const newUser = 'admin';
const newPass = 'salasana123'; // Muista vaihtaa!

db.serialize(() => {
    // 1. Tarkistetaan, onko käyttäjä jo olemassa
    db.get("SELECT username FROM users WHERE username = ?", [newUser], (err, row) => {
        if (err) {
            console.error("Virhe kyselyssä:", err.message);
            return;
        }

        if (row) {
            console.log(`⚠️  Käyttäjä '${newUser}' on jo olemassa. Ei luotu duplikaattia.`);
            db.close();
        } else {
            // 2. Jos ei löydy, luodaan uusi
            bcrypt.hash(newPass, 10, (err, hash) => {
                if (err) {
                    console.error("Salauksen virhe:", err.message);
                    return;
                }

                db.run("INSERT INTO users (username, password) VALUES (?, ?)", [newUser, hash], (err) => {
                    if (err) {
                        console.error("Tallennusvirhe:", err.message);
                    } else {
                        console.log(`✅ Käyttäjä '${newUser}' luotu onnistuneesti!`);
                    }
                    db.close();
                });
            });
        }
    });
});

