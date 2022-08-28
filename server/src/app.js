const express  = require('express');
const cors = require('cors')
const path = require('path');
const morgan = require('morgan')

const apirouter = require('./routes/api')

const app = express();

//for cross origin platform
app.use(cors({
    origin: 'http://localhost:3001'
}))

//logging request
app.use(morgan('combined'))

//used to output json
app.use(express.json());
//serving static file
app.use(express.static(path.join(__dirname, '..', 'public')))

//versioning
app.use('/v1', apirouter);


app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});


module.exports = app