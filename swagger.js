const express = require('express');
const fs = require('fs');
const nPath = require('path');
const port = 3000;

let [ ,, ...args] = process.argv;

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
                    res.send(`No such api ${req.params.file}`);
                } else res.render(`${__dirname}/public/index.ejs`, {file: `${req.params.file}.yaml`});

            });
        } else res.render(`${__dirname}/public/index.ejs`, {file: `${req.params.file}.json`});

    });
});

app.get('/apis/:file', (req, res) => {
    const root = __dirname + '/apis';
    res.sendFile(`${root}/${req.params.file}`, {}, (err) => {
        if(err) res.send(`No such file ${req.params.file}`);
    });
});

app.listen(port, () => console.log(`Listening on :${port}`));

if(args.length > 0){
    const opn = require('opn');
    const root = __dirname + '/apis';
    let path = args[0];
    let filename = path.split('/').pop();
    let nameWithoutExtension = filename.split('.').slice(0, -1).join('.');
    let url = `http://localhost:${port}/${nameWithoutExtension}`;
    let finalPath = nPath.resolve(root + '/' + filename);
    let resolvedPath = nPath.resolve(path);

    if(!(resolvedPath === finalPath))
        fs.copyFile(path, finalPath, () => {
            process.on('SIGINT', function() {
                fs.unlink(root + '/' + filename, () => process.exit());
            });

            console.log(`Opening ${url}`);
            opn(url);
        });
    else {
        console.log(`Opening ${url}`);
        opn(url);
    }
}

