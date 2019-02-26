const express = require('express');
const fs = require('fs');

const app = express();

app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.send('Try putting the /name of an API at the end');
});

app.get('/:file', (req, res) => {
    const root = __dirname + '/apis';

    fs.access(`${root}/${req.params.file}.json`, fs.F_OK, err => {
        if (err) {
            fs.access(`${root}/${req.params.file}.yaml`, fs.F_OK, err => {
                if (err) {
                    console.error(err);
                    res.send(`No such api ${req.params.file}`);
                } else res.render(`${__dirname}/public/index.ejs`, {file: `${req.params.file}.yaml`});

            });
        } else res.render(`${__dirname}/public/index.ejs`, {file: `${req.params.file}.json`});

    });
});

app.get('/apis/:file', (req, res) => {
    const root = __dirname + '/apis';
    res.sendFile(`${root}/${req.params.file}`, {}, (err) => {
        if (err) res.send(`No such file ${req.params.file}`)
    });
});

app.listen(3000);
