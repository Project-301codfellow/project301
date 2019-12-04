`use strict`;

///// packages \\\\\

require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const { Translate } = require('@google-cloud/translate').v2;
const methodOverride = require('method-override');
const unirest = require("unirest");


const translate = new Translate();
const client = new pg.Client(process.env.DATABASE_URL)
const PORT = process.env.PORT || 8080;
const app = express();


app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Middleware to handle PUT and DELETE
app.use(methodOverride((request, response) => {
    if (request.body && typeof request.body === 'object' && '_method' in request.body) {
        // look in urlencoded POST bodies and delete it
        let method = request.body._method;
        delete request.body._method;
        return method;
    }
}))

///// All Routs \\\\\
app.get('/john', john)
app.get('/', proofOfLife);
app.get('/main', renderHome)
app.get('/dictionary', getFromDictionary)
app.get('/newTerm', NewWordForm)
app.get('/test', data)
app.post('/main', getRandomWord)
app.post('/info', john)
app.post('/addNewCard', renderForm)
app.post('/dictionary', addNewWord)
app.post('/updateCard/:card_id', getOneCard)
app.put('/update/:card_id', updateCard)
app.delete('/delete/:card_id', deletCard)

app.use('*', notFoundHandler);
app.use(errorHandler);


///// The main functions \\\\\

function data(req, res) {

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
    let { term, description, image_url, notes } = req.body
    let SQL = `INSERT INTO words (term, description, image_url, notes) VALUES ($1,$2,$3,$4) RETURNING *`;
    let values = [term, description, image_url, notes]
    client.query(SQL, values)
        .then(res.redirect('/dictionary'))
}
function getOneCard(req, res) {
    res.render('pages/updateForm', { card: req.body })
    // .catch(handleError);
}

function updateCard(req, res) {

    let { term, description, image_url, notes } = req.body
    let SQL = 'UPDATE words SET term=$1, description=$2, image_url=$3, notes=$4 WHERE id=$5'
    let values = [term, description, image_url, notes, req.params.card_id]
    console.log('hello', req.params);
    console.log('values', values)
        ;
    client.query(SQL, values)
        .then(res.redirect(`/dictionary`))
}

function deletCard(req, res) {
    let SQL = 'DELETE FROM words WHERE id=$1'
    let values = [req.params.card_id]
    client.query(SQL, values)
        .then(res.redirect(`/dictionary`))
}

///// Super Cool Function \\\\\
async function john(req, res) {

    const translate = new Translate();

    let text = req.body.randword;
    console.log('text', text);

    let target = 'ar';

    let imageURL = `https://app.zenserp.com/api/v2/search?q=${text}&hl=en&gl=US&location=United%20States&search_engine=google.com&tbm=isch&num=10&start=0&apikey=${process.env.IMAGE_API_KEY}`;

    try {
        let [translated] = await translate.translate(text, target);
        let images = await superagent.get(imageURL);

        let results = {
            text: text,
            translated: translated,
            images: images.body.image_results[0]
        };
        res.render('pages/info', { card: results })
        // res.status(200).json(results);

    } catch (error) {
        res.status(500).send(error);
    }


};
//////////////////////////////          \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

///// Erorr Sections \\\\\
function errorHandler(error, req, res) {
    res.status(500).send('We R Sorry')
}

function notFoundHandler(req, res) {
    res.status(404).send('WHERE ARE YOU GOING!!')
}


///// Listening to the app \\\\\
client.connect()
    .then(() => app.listen(PORT, () => {
        console.log(`Welcome aboard on port ${PORT}`);
    }));