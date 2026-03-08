'use strict' 

require('dotenv').config(); // Ladataan muuttujat heti ensimmäisenä
const express = require('express'); 
const morgan = require('morgan'); 
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');

// Tuodaan CV-data tiedostosta (huomaa piste ja polku)
const cvData = require('./data/cvData.json');
const saltRounds = 10; // Määrittää, kuinka monta kertaa algoritmi ajetaan (turvataso)

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/yhteydenotot.db');

// Luodaan taulu viesteille
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS viestit (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nimi TEXT,
        email TEXT,
        viesti TEXT,
        pvm DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    // 1. Luodaan käyttäjätaulu (jos ei ole)
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    )`);
    // 2. Tarkistetaan onko käyttäjiä
    db.get("SELECT count(*) as count FROM users", (err, row) => {
        if (row.count === 0) {
            const salasana = "admin123"; // VAIHDA TÄMÄ!
            
            // Suolataan ja hajautetaan salasana
            bcrypt.hash(salasana, saltRounds, (err, hash) => {
                if (err) return console.error(err);
                
                db.run("INSERT INTO users (username, password) VALUES (?, ?)", 
                       ["admin", hash], 
                       (err) => {
                    if (err) console.error("Käyttäjän luonti epäonnistui");
                    else console.log("Ylläpitäjä 'admin' luotu tietokantaan.");
                });
            });
        }
    });
});

// "Suojamuuri" middleware: Estää pääsyn admin-sivuille ilman kirjautumista
const requireLogin = (req, res, next) => {
    if (req.session.userId) {
        next(); // Käyttäjä on kirjautunut, päästetään eteenpäin
    } else {
        res.redirect('/login'); // Ei kirjautunut, takaisin lomakkeelle
    }
};

const app = express();
const handlebars = require('express-handlebars').create({ 
    defaultLayout: 'main', 
    extname: '.handlebars',
    helpers: {
        // Palauttaa "active" jos nykyinen sivu täsmää linkkiin
        activeClass: function(currentPath, linkPath) {
            return currentPath === linkPath ? 'active' : '';
        },
        // UUSI HELPER: Palauttaa ikoniluokan nimen perusteella
        getIcon: function(taito) {
            const icons = {
                'JavaScript': 'bi-code-slash',
                'Node.js & Express': 'bi-server',
                'HTML & CSS (Handlebars)': 'bi-filetype-html',
                'SQLite, MSSQL': 'bi-database',
                'Git & GitHub': 'bi-git',
                'C#, C++': 'bi-code',
                'WPF, .NET Maui': 'bi-window',
                'ASP.NET MVC & Core': 'bi-file-earmark-code',
                'SolidWorks, Blender, GibbsCAM': 'bi-tools',
                'Default': 'bi-star' // Varavaihtoehto
            };
            return icons[taito] || icons['Default'];
        },
        // UUSI HELPER: Päivämäärän muotoilu
        formatDate: function(dateString) {
            const pvm = new Date(dateString);
            // Suomalainen muotoilu: päivä.kuukausi.vuosi klo tunnit.minuutit
            return pvm.toLocaleDateString('fi-FI') + ' klo ' + 
                   pvm.toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' });
        }
    } 
}); 

app.set('trust proxy', 1); // Tarvitaan, jos sovellus ajetaan Renderin kaltaisessa ympäristössä, joka käyttää proxyä

// Istuntojen konfigurointi
app.use(session({
    // Käytetään ympäristömuuttujaa, tai varalla kehitysaikaista avainta
    secret: process.env.SESSION_SECRET || 'kehitys-fallback-avain', 
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 30 * 60 * 1000, // 30 minuuttia (30 min * 60 s * 1000 ms)
        httpOnly: true,         // Estää JS-pääsyn evästeeseen (suojaa XSS-hyökkäyksiltä)
        sameSite: 'lax',        // Suojaa CSRF-hyökkäyksiltä
        rolling: true,          // Uusi eväste jokaisella pyynnöllä (pidennetään istunnon kestoa aktiivisille käyttäjille)
        secure: process.env.NODE_ENV === 'production'  // Jos ollaan tuotannossa (esim. Render), käytetään secure-evästettä         
    }
}));

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public'))); 
 
app.use(bodyParser.urlencoded({ extended: false })); 
app.use(bodyParser.json()); 

// Lisää tämä ennen reittejä
app.use((req, res, next) => {
    res.locals.nimi = cvData.nimi; // Nimi on nyt käytössä KAIKISSA näkymissä automaattisesti
    res.locals.vuosi = new Date().getFullYear(); // Dynaaminen vuosi
    res.locals.yhteystiedot = cvData.yhteystiedot; // Jotta saadaan sähköposti footeriin
    res.locals.sessionId = req.session.userId; // Käyttäjätiedot navia varten
    // TÄMÄ ON UUTTA: Välitetään tieto istunnosta kaikille näkymille
    res.locals.isLoggedIn = req.session.userId ? true : false;
    next();
});

app.get('/', (req, res) => {
    res.render('home', { path: '/' });
});

app.get('/cv', (req, res) => {
    // Luodaan kopio datasta, jotta voimme lisätä 'path'-tiedon navia varten
    const viewData = { 
        ...cvData, 
        path: '/cv' 
    };    
    
    // Renderöidään 'cv'-näkymä ja annetaan sille dataa
    res.render('cv', viewData);
});

// Näytetään tyhjä lomake
app.get('/yhteys', (req, res) => {
    res.render('yhteys', { path: '/yhteys' });
});

// Otetaan vastaan lomakkeen tiedot
app.post('/yhteys', (req, res) => {
    // Tässä req.body sisältää input-kenttien name-attribuutit
    const { nimi, email, viesti } = req.body;
    
    const sql = `INSERT INTO viestit (nimi, email, viesti) VALUES (?, ?, ?)`;
    const params = [nimi, email, viesti];

    db.run(sql, params, function(err) {
        if (err) {
            console.error(err.message);
            return res.status(500).send("Virhe tallennuksessa.");
        }
        
        console.log(`Viesti tallennettu id:llä ${this.lastID}`);

        // Renderöidään sama sivu uudelleen ja asetetaan viestiLahetetty-muuttuja todeksi
        res.render('yhteys', { 
            path: '/yhteys', 
            viestiLahetetty: true 
        });
    });
});

app.get('/login', (req, res) => {
    res.render('login', { path: '/login' });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
        if (user && await bcrypt.compare(password, user.password)) {
            req.session.userId = user.id; // Kirjautuminen onnistui!
            res.redirect('/admin/viestit');
        } else {
            res.render('login', { error: 'Väärä tunnus tai salasana' });
        }
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/'));
});
    
app.get('/admin/viestit', requireLogin, (req, res) => {
    db.all("SELECT * FROM viestit ORDER BY pvm DESC", [], (err, rows) => {
        if (err) throw err;
        res.render('viestilista', { viestit: rows, layout: 'main' });
    });
});

app.post('/admin/viestit/poista', requireLogin, (req, res) => {
    const id = req.body.id;
    const sql = "DELETE FROM viestit WHERE id = ?";

    db.run(sql, id, function(err) {
        if (err) {
            console.error(err.message);
            return res.status(500).send("Virhe poistettaessa viestiä.");
        }
        
        console.log(`Viesti ID ${id} poistettu.`);
        res.redirect('/admin/viestit'); // Päivitetään lista
    });
});


app.get('/lataa-cv', (req, res) => {
    const file = `${__dirname}/public/files/Lauri_Tikkanen_CV_2026.pdf`;
    res.download(file); // Tämä asettaa oikeat HTTP-otsikot automaattisesti
});

// Tämä reitti poimii kaikki pyynnöt, jotka eivät täsmänneet aiempiin reitteihin
app.use((req, res) => { 
    res.status(404).render('404', { 
        url: req.originalUrl, // Lähetetään väärä osoite näkymälle
        path: '404' // Auttaa navia tietämään, ettei mikään linkki ole "active"
    }); 
});
 
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Palvelin käynnissä portissa ${PORT}...`));
