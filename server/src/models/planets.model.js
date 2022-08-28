const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');

const planets = require('./planets.mongo');

const habitablePlanets = [];

function isHabitablePlanet(planet) {
  return planet['koi_disposition'] === 'CONFIRMED'
    && planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11
    && planet['koi_prad'] < 1.6;
}

function loadPlanetData() {
    return new Promise((resolve, reject) => {
        fs.createReadStream(path.join(__dirname, '..', '..', 'data', 'kepler_data.csv'))
        .pipe(parse({
            comment: '#',
            columns: true,
        }))
        .on('data', (data) => {
            if (isHabitablePlanet(data)) {

                savePlanet(data)
            }
        })
        .on('error', (err) => {
            console.log(err);
            reject(err)
        })
        .on('end', async() => {
            const countPlanet = (await getAllPlanets()).length
            console.log(`${countPlanet} habitable planets found!`);
            resolve();
        });
    });
}

async function savePlanet(planet)
{
    await planets.updateOne({
        keplerName: planet.kepler_name
    }, { keplerName: planet.kepler_name}, 
    {
        upsert: true
    });
}

async function getAllPlanets() {
    // return [
    //     {
    //     id: '74843898943',
    //     keplername: 'kepp'
    //     },
    //     {
    //     id: '74843898943',
    //     keplername: 'kettl'
    //     }
    // ];
    return await planets.find({}, {'__v': 0});
}

  module.exports = {
      loadPlanetData,
      getAllPlanets
  };