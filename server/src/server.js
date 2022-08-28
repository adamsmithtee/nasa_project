const http = require('http');
require('dotenv').config()
const app = require('./app');
const { mongoConnect } = require('./services/mongo');
const { loadPlanetData } = require('./models/planets.model')
const { loadLaunchData } = require('./models/launches.model')

const server = http.createServer(app);

const PORT = process.env.PORT || 9006

async function startServer() {
    await mongoConnect();
    await loadPlanetData();
    await loadLaunchData();
    server.listen(PORT, ()=>{
        console.log(`started on port ${PORT}...`)
    });
}
startServer();
