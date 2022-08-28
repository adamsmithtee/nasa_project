const request = require('supertest');
const app = require('../app')
const { mongoConnect, mongoDisconnect } = require('../services/mongo')

describe('lauches Api', () => {
    beforeAll( async() => {
        await mongoConnect();
    })

    afterAll( async() => {
        await mongoDisconnect();
    })

    describe('Test GET /launches', ()=>{
        test('it should respond with 200 success', async () => {
            const response = await request(app).get('/v1/launches')
            .expect('Content-Type', /json/);
            expect(response.statusCode).toBe(200);
        });
    })
    
    describe('Test POST /launch', ()=>{
        const completeLaunchData = {
            mission: 'Uss',
            rocket: 'NCC 1701',
            target: 'Kepler-442 b',
            launchDate: 'January 4, 2028'
        }
    
        const launchDateWithoutDate = {
            mission: 'Uss',
            rocket: 'NCC 1701',
            target: 'Kepler-442 b',
        }
    
        const launchDateWithoutInvalidDate = {
            mission: 'Uss',
            rocket: 'NCC 1701',
            target: 'Kepler-442 b',
            launchDate: 'zoot'
        }
    
        test('it should respond with 201 created', async () => {
            const response = await request(app)
            .post('/v1/launches')
            .send(completeLaunchData)
            .expect('Content-Type', /json/)
            .expect(201);
        
    
        const requestDate = new Date(completeLaunchData.launchDate).valueOf();
    
        const responseDate = new Date(response.body.launchDate).valueOf();
    
        expect(responseDate).toBe(requestDate)
    
        expect(response.body).toMatchObject(launchDateWithoutDate)
    
        });
    
        test('It should catch invalid dates', async () => {
            const response = await request(app)
            .post('/v1/launches')
            .send(launchDateWithoutInvalidDate)
            .expect('Content-Type', /json/)
            .expect(400);
    
            expect(response.body).toStrictEqual({
                error: 'Invalid launch date'
            })
        }); 
    })
})
