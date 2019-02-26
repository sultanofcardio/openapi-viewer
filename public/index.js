'use strict';

const css = require('./index.css');
console.log(css);

const SwaggerUI = require('swagger-ui');

SwaggerUI({
    dom_id: '#swagger-ui',
    url: `${window.location.protocol}//${window.location.host}/apis/${file}`
});




// window.onload = function() {
//     // Begin Swagger UI call region
//     const ui = SwaggerUIBundle({
//         url: "https://petstore.swagger.io/v2/swagger.json",
//         dom_id: '#swagger-ui',
//         deepLinking: true,
//         presets: [
//             SwaggerUIBundle.presets.apis,
//             SwaggerUIStandalonePreset
//         ],
//         plugins: [
//             SwaggerUIBundle.plugins.DownloadUrl
//         ],
//         layout: "StandaloneLayout"
//     });
//     // End Swagger UI call region
//
//     window.ui = ui
// }