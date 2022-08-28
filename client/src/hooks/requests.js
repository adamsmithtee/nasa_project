// import planets from "../../../server/src/models/planets.model";

const API_URL = 'http://localhost:9006/v1'
async function httpGetPlanets() {
  console.log(`${API_URL}/planets`)
  // Load planets and return as JSON.
  const response = await fetch(`${API_URL}/planets`)
  console.log('response: ', response)
  return await response.json();
}

async function httpGetLaunches() {
  // Load launches, sort by flight number, and return as JSON.
  const response = await fetch(`${API_URL}/launches`)
  console.log(response)
  const fetchedLaunches = await response.json();
  return fetchedLaunches.sort((a,b) => {
    return a.flightNumber - b.flightNumber
  })
}

async function httpSubmitLaunch(launch) {
  // Submit given launch data to launch system.
  try {
    return await fetch(`${API_URL}/launches`, {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(launch)
    })
  } catch (error) {
    return {
      ok: false
    }
  }
}

async function httpAbortLaunch(id) {
  // Delete launch with given ID.
  try {
    return await fetch(`${API_URL}/launches/${id}`,{
      method: "delete"
    });
  } catch (error) {
    return {
      ok: false
    }
  }
}

export {
  httpGetPlanets,
  httpGetLaunches,
  httpSubmitLaunch,
  httpAbortLaunch,
};