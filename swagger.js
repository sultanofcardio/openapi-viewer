#!/usr/bin/env node

"use strict";

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

app.listen(port);

if(!fs.existsSync(__dirname + '/apis')) {
    fs.mkdirSync(__dirname + '/apis');
}

if(args.length > 0){
    const opn = require('opn');
    const root = __dirname + '/apis';
    let path = args[0];
    let filename = path.split('/').pop();
    let fileExtension = filename.indexOf('.') === -1 ? "" : filename.split('.').pop();
    let nameWithoutExtension = filename.indexOf('.') === -1 ? filename : filename.split('.').slice(0, -1).join('.');
    let url = `http://localhost:${port}/${nameWithoutExtension}`;
    let finalPath = nPath.resolve(`${root}/${filename}`);

    // Catch CTRL + C event
    process.on('SIGINT', function() {
        if(fs.existsSync(finalPath)) {
            fs.unlink(finalPath, () => process.exit());
        } else process.exit();
    });

    if(fileExtension.toUpperCase() !== "JSON" && fileExtension.toUpperCase() !== "YAML"
        && fileExtension.toUpperCase() !== "YML"){
        console.log(`Invalid file type ${filename}`);
        process.exit();
    }

    if(path.indexOf("http://") === 0 || path.indexOf("https://") === 0) {
        // Remote file
        const http = /https:\/\//.test(path) ? require('https') : require('http');
        const file = fs.createWriteStream(finalPath);
        let req = http.get(path,  response => {
            const { statusCode } = response;

            if(statusCode !== 200){
                console.error(`Error: Unable to locate file ${path}.`);
                if(fs.existsSync(finalPath)) {
                    fs.unlink(finalPath, () => process.exit());
                } else process.exit();
            } else {
                response.pipe(file);
                file.on('finish', function() {
                    file.close();
                    console.log(`Opening ${url}`);
                    opn(url);
                });
            }
        }).on('error', e => {
            console.error(`Error: Failed to load file ${filename}. ${e.message}`);
            if(fs.existsSync(finalPath)) {
                fs.unlink(finalPath, () => process.exit());
            } else process.exit();
        });

        req.on('socket', socket => {
            socket.setTimeout(10000); // Time out after 10 seconds
            socket.on('timeout', () => req.abort());
        });

    } else {
        // Local file

        let resolvedPath = nPath.resolve(path);
        if(!(resolvedPath === finalPath))
            fs.copyFile(path, finalPath, () => {

                console.log(`Opening ${url}`);
                opn(url);
            });
        else {
            console.log(`Opening ${url}`);
            opn(url);
        }
    }
} else {
    console.log("Usage: openapi-viewer <path_to_file>|<url>");
    process.exit(1);
}

