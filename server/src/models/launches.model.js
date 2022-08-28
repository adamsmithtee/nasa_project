const axios = require('axios')
const launchesdb = require('./launches.mongo')
const planets = require('./planets.mongo')

const DEFAULT_FLIGHT_NUMBER = 100

// const launch = {
//     flightNumber: 100,
//     mission: "Kepler Exploraton X",
//     rocket: "Explorer IS1",
//     launchDate:new Date('Decembe 27, 2030'),
//     target: 'Kepler-442 b',
//     customer: ['ZTM', 'NASA'],
//     upcoming: true,
//     success: true
// };
// saveLaunch(launch);

const SPACEX_API_URL = process.env.SPACEX_API_URL
async function loadLaunchData() {
    const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat'
    });
    if(firstLaunch) {
        console.log('Launch data already loaded');
        return;
    }
    console.log('loading launch data');
    const response = await axios.post(SPACEX_API_URL, {
        query: {},
        options: {
            pagination:false,
            populate: [
                {
                    path: 'rocket',
                    select: {
                        name: 1
                    }
                },
                {
                    path: 'payloads',
                    select: {
                        'customers': 1
                    }
                }
            ]
        }
    });
    if(response.status !== 200) {
        console.log('problem downloading data')
        throw new Error('Launch data download fail')
    }
    const launchDocs = response.data.docs;
    for(const launchDoc of launchDocs) {
        const payloads = launchDoc['payloads'];
        const customers = payloads.flatMap((payload) => {
            return payload['customers']
        })
        const launch = {
            flightNumber: launchDoc['flight_number'],
            mission: launchDoc['name'],
            rocket: launchDoc['rocket']['name'],
            launchDate:launchDoc['date_local'],
            customer: customers,
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success']
        }
        console.log(`${launch.flightNumber} ... ${launch.mission}`)
        await saveLaunch(launch)
    }
}

async function findLaunch(filter) {
    return await launchesdb.findOne(filter);
}

async function existLaunchId(launchId) {// check if launch id exist
    return await launchesdb.findOne({
        flightNumber: launchId
    })
}

async function saveLaunch(launch) {
    await launchesdb.findOneAndUpdate({
        flightNumber: launch.flightNumber,      
    }, launch, {
        upsert: true
    })
}

//trying to achieve auto increment
async function getLatestFlightNumber() {
    const latestLaunch = await launchesdb
    .findOne()
    .sort({'flightNumber': -1})

    if(!latestLaunch) {
        return DEFAULT_FLIGHT_NUMBER
    }
    return latestLaunch.flightNumber
}

async function getAllLaunches(skip, limit) {
    return await launchesdb
    .find({}, {'__v':0})
    .sort({flightNumber: 1})
    // .skip(skip)
    // .limit(limit);
}

async function addNewLaunch(launch) {
    const planet = await planets.findOne({
        keplerName: launch.target,
    });
    // console.log(planet, launch.target)
    if(!planet) {
        throw new Error('No matching planet found')
    }
    const latestFlightNumber = await getLatestFlightNumber() + 1
    const newlaunch = Object.assign(launch, {
        flightNumber: latestFlightNumber,
        upcoming: true,
        success: true,
        customer: ['ZTM', 'NASA']
    })

    await saveLaunch(newlaunch);
}


async function abortLaunch(Id) {
    // const abortedx = await launchesdb.deleteOne({flightNumber: Id});
    // console.log(abortedx)
    const aborted = await launchesdb.updateOne({
        flightNumber: Id
    }, {
        upcoming: false,
        success: false
    });
    return aborted;
}

module.exports = {
    loadLaunchData,
    existLaunchId,
    getAllLaunches,
    addNewLaunch,
    abortLaunch
}