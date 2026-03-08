# 🚀 Lauri Tikkanen - Dynaaminen CV & Portfolio

Tämä on Node.js-pohjainen, dynaaminen CV-sivusto ja yhteydenottojärjestelmä. Sovellus on rakennettu korostamaan backend-osaamista, tietoturvaa ja dynaamista sisällönhallintaa.

**Live-demo:** [lauri-tikkanen-cv.onrender.com](https://lauri-tikkanen-cv.onrender.com)

## 🛠️ Tekniikat (Tech Stack)

### Frontend
- **Handlebars.js**: Dynaamiset HTML-pohjat, layoutit ja partials-komponentit.
- **Bootstrap 5 & Bootswatch (Vapor)**: Responsiivinen ulkoasu neon-teemalla.
- **Google Maps Static API**: Dynaaminen sijaintikartan upotus modaalissa.
- **update-clock.js**: reaaliaikainen kellonajan näyttö, joka päivittyy joka sekunti
- **theme-toggler.js**: automatisoitu tumman/vaalean teeman valinta
- **Popper.js**: pudotusvalikko teeman valintaan

### Backend
- **Node.js & Express**: Palvelinlogiikka ja reititys.
- **SQLite3**: Kevyt ja nopea tiedostopohjainen SQL-tietokanta.
- **Express-Session**: Istunnonhallinta ja evästepohjainen tunnistautuminen.

### Tietoturva
- **Bcrypt**: Salasanojen turvallinen suolaus ja hajautus (hashing).
- **Middleware**: Reittien suojaus (Authentication guard).
- **Dotenv**: API-avainten ja istuntosalaisuuksien hallinta ympäristömuuttujilla.

## ✨ Tärkeimmät ominaisuudet
- **Dynaaminen CV**: Tiedot ladataan JSON-objektista, mikä tekee ylläpidosta helppoa.
- **Yhteydenottojärjestelmä**: Käyttäjien viestit tallentuvat suoraan tietokantaan.
- **Suojattu Admin-paneeli**: Ylläpitäjä voi lukea ja poistaa viestejä kirjautumisen takana.
- **Custom Helpereitä**: Itse koodatut Handlebars-apurit päivämäärien ja ikonien muotoiluun.

## 🚀 Asennus ja käyttö (Local)

1. `npm install`
2. Luo `.env` tiedosto ja aseta `SESSION_SECRET` sekä `GOOGLE_MAPS_API_KEY`.
3. `npm run dev` (käyttää Nodemonia).
4. Käyttäjän luonti: `node create-user.js`. Tämä vaihe on valinnainen, oletuskäyttäjä 'admin' luodaan automaattisesti.
