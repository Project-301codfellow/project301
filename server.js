`use strict`;

/// packages
require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const { Translate } = require('@google-cloud/translate').v2;
const unirest = require("unirest");

const translate = new Translate();
const client = new pg.Client(process.env.DATABASE_URL)
const PORT = process.env.PORT || 8080;
const app = express();


app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');


app.get('/', proofOfLife);
app.get('/dictionary', getFromDictionary)
app.post('/info', getInfo)
app.get('/newTerm', NewWordForm)
app.post('/addNewCard', renderForm)
app.post('/dictionary', addNewWord)
app.get('/test', data)
app.get('/main', renderHome)
app.post('/main', getRandomWord)
app.put('/update/:card_id', updateCard)

app.use('*', notFoundHandler);
app.use(errorHandler);

function data(req, res) {

    console.log('testing');
    const app_id = "d6324635"; // insert your APP Id
    const app_key = "285981e5b60037743d3e6301a5a386a3"; // insert your APP Key
    let url = `https://od-api.oxforddictionaries.com/api/v2/entries/en-us/ball?fields=pronunciations&strictMatch=false`;
    superagent.get(url)
        .set('app_id', app_id)
        .set('app_key', app_key)
        .set('Accept', 'application/json')
        .then(data => {
            res.json(data.body)
        })
        .catch(console.error);
}

// function collection(req, res) {
//     let url = `https://wordsapiv1.p.rapidapi.com/words/hatchback/typeOf`;
//     superagent.get(url)
//         .set('x-rapidapi-key', "861a23e564msh9e59c3b41ee0870p1bc725jsn80dfae1d8670")
//         .set('x-rapidapi-host', "wordsapiv1.p.rapidapi.com")
//         .then(data => {
//             res.status(200).json(data.body)
//         })
//         .catch(console.error);
// }

function getInfo(req, res) {
    const app_id = "d6324635"; // insert your APP Id
    const app_key = "285981e5b60037743d3e6301a5a386a3"; // insert your APP Key

    let term = req.body.randword
    console.log('req', term);

    let url = `https://od-api.oxforddictionaries.com/api/v2/entries/en-gb/${term}?fields=pronunciations&strictMatch=false`;
    superagent.get(url)
        .set('app_id', app_id)
        .set('app_key', app_key)
        .set('Accept', 'application/json')
        .then(data => {
            // res.json(data.body)
            res.render('pages/info', { card: data.body.results[0].lexicalEntries[0].pronunciations[0].audioFile })
        })
}

function getRandomWord(req, res) {
    let file = require('./data/words.json')
    let index = Math.floor(Math.random() * file.word.length)
    console.log('test', index)
    res.render('pages/main', { randword: file.word[index] })
}
function renderHome(req, res) {
    res.render('pages/introduction')
}
function proofOfLife(req, res) {
    res.status(200).send(`hello form our app`)
    // res.render('pages/info')
}

function getFromDictionary(req, res) {
    let SQL = 'SELECT * FROM words';
    client.query(SQL)
        .then(results => {
            res.render('pages/dictionary', { card: results.rows });
            console.log('res', results.rows);

        })
}

function renderForm(req, res) {
    let { term, description, image_url, notes } = req.body

    res.render('pages/add', { card: req.body })
}

function NewWordForm(req, res) {
    let SQL = 'SELECT * FROM words';
    client.query(SQL)
        .then(results => {
            res.render('pages/info', { card: results.rows[0] });
            console.log('res', results.rows[0]);

        })
}

function addNewWord(req, res) {
    let SQL = `INSERT INTO words (term, description, image_url, notes) VALUES ($1,$2,$3,$4) RETURNING *`;
    let values = ['dog', 'mammal animal', 'https://i.dailymail.co.uk/1s/2019/11/23/09/21370544-7717313-image-a-1_1574501083030.jpg', 'hello doggoy'];
    client.query(SQL, values)
        .then(results => {
            res.json(results.rows);
        })
}

function updateCard(req, res) {

}

function errorHandler(error, req, res) {
    res.status(500).send('We R Sorry')
}

function notFoundHandler(req, res) {
    res.status(404).send('WHERE ARE YOU GOING!!')
}

client.connect()
    .then(() => app.listen(PORT, () => {
        console.log(`Welcome aboard on port ${PORT}`);
    }));