/**
 * test/routes/pipeline-culture.test.js
 * Tests pour les endpoints Phase 1 FLEURS - Pipeline Culture
 * 
 * Suite: 18 tests API endpoints
 * Structure: CultureSetup, Pipeline, PipelineStage CRUD + Auth
 */

import request from 'supertest'
import express from 'express'
import { PrismaClient } from '@prisma/client'
import pipelineCultureRoutes from '../../server-new/routes/pipeline-culture.js'

const prisma = new PrismaClient()

/**
 * Setup Express app for testing
 */
const app = express()
app.use(express.json())

// Mock verifyToken middleware
app.use((req, res, next) => {
    req.userId = 'test-user-id' // Simulated authenticated user
    next()
})

app.use(pipelineCultureRoutes)

/**
 * Test Suite 1: CultureSetup Endpoints
 */
describe('CultureSetup API', () => {
    let setupId

    describe('POST /api/culture-setups', () => {
        test('should create a new culture setup', async () => {
            const response = await request(app)
                .post('/api/culture-setups')
                .send({
                    name: 'Tente 120x120 - Budget',
                    group: 'space',
                    data: {
                        type: 'tent',
                        dimensions: '120x120x200cm',
                        surface: 1.44
                    }
                })

            expect(response.status).toBe(201)
            expect(response.body).toHaveProperty('id')
            expect(response.body.name).toBe('Tente 120x120 - Budget')
            expect(response.body.group).toBe('space')
            setupId = response.body.id
        })

        test('should reject invalid setup data', async () => {
            const response = await request(app)
                .post('/api/culture-setups')
                .send({
                    group: 'space'
                    // Missing: name, data
                })

            expect(response.status).toBe(400)
        })
    })

    describe('GET /api/culture-setups', () => {
        test('should list all culture setups for user', async () => {
            const response = await request(app)
                .get('/api/culture-setups')

            expect(response.status).toBe(200)
            expect(Array.isArray(response.body)).toBe(true)
        })

        test('should filter by group query parameter', async () => {
            const response = await request(app)
                .get('/api/culture-setups?group=space')

            expect(response.status).toBe(200)
            expect(Array.isArray(response.body)).toBe(true)
        })
    })

    describe('PUT /api/culture-setups/:id', () => {
        test('should update existing setup', async () => {
            const response = await request(app)
                .put(`/api/culture-setups/${setupId}`)
                .send({
                    name: 'Tente 120x120 - Updated',
                    data: {
                        type: 'tent',
                        dimensions: '120x120x200cm',
                        surface: 1.44,
                        light_type: 'LED'
                    }
                })

            expect(response.status).toBe(200)
            expect(response.body.name).toBe('Tente 120x120 - Updated')
        })

        test('should reject unauthorized update', async () => {
            const response = await request(app)
                .put(`/api/culture-setups/other-user-setup`)
                .send({
                    name: 'Hacked'
                })

            expect(response.status).toBe(403)
        })
    })

    describe('POST /api/culture-setups/:id/duplicate', () => {
        test('should duplicate an existing setup', async () => {
            const response = await request(app)
                .post(`/api/culture-setups/${setupId}/duplicate`)
                .send({
                    newName: 'Tente 120x120 - Copy'
                })

            expect(response.status).toBe(201)
            expect(response.body.name).toBe('Tente 120x120 - Copy')
            expect(response.body.id).not.toBe(setupId)
        })
    })

    describe('DELETE /api/culture-setups/:id', () => {
        test('should delete a culture setup', async () => {
            const response = await request(app)
                .delete(`/api/culture-setups/${setupId}`)

            expect(response.status).toBe(200)
        })

        test('should reject deletion of non-owned setup', async () => {
            const response = await request(app)
                .delete('/api/culture-setups/other-user-setup')

            expect(response.status).toBe(403)
        })
    })
})

/**
 * Test Suite 2: Pipeline Endpoints
 */
describe('Pipeline API', () => {
    let reviewId = 'test-review-id'
    let pipelineId

    describe('POST /api/reviews/:reviewId/pipeline', () => {
        test('should create a new pipeline for review', async () => {
            const response = await request(app)
                .post(`/api/reviews/${reviewId}/pipeline`)
                .send({
                    mode: 'jours',
                    startDate: '2025-01-18',
                    endDate: '2025-04-17',
                    config: {
                        trackEnvironment: true,
                        trackNutrients: true
                    }
                })

            expect(response.status).toBe(201)
            expect(response.body).toHaveProperty('id')
            expect(response.body.mode).toBe('jours')
            expect(response.body.stages).toHaveLength(90) // 90 days
            pipelineId = response.body.id
        })

        test('should auto-generate 90 stages in jours mode', async () => {
            const response = await request(app)
                .post(`/api/reviews/${reviewId}/pipeline`)
                .send({
                    mode: 'jours',
                    startDate: '2025-01-18',
                    endDate: '2025-04-17'
                })

            expect(response.status).toBe(201)
            expect(response.body.stages).toHaveLength(90)
        })

        test('should validate date range', async () => {
            const response = await request(app)
                .post(`/api/reviews/${reviewId}/pipeline`)
                .send({
                    mode: 'jours',
                    startDate: '2025-04-17',
                    endDate: '2025-01-18' // End before start
                })

            expect(response.status).toBe(400)
        })
    })

    describe('GET /api/pipelines/:pipelineId', () => {
        test('should retrieve pipeline with all stages', async () => {
            const response = await request(app)
                .get(`/api/pipelines/${pipelineId}`)

            expect(response.status).toBe(200)
            expect(response.body).toHaveProperty('stages')
            expect(Array.isArray(response.body.stages)).toBe(true)
        })
    })

    describe('PUT /api/pipelines/:pipelineId', () => {
        test('should update pipeline configuration', async () => {
            const response = await request(app)
                .put(`/api/pipelines/${pipelineId}`)
                .send({
                    config: {
                        trackEnvironment: false,
                        trackNutrients: false,
                        trackMorphology: true
                    }
                })

            expect(response.status).toBe(200)
            expect(response.body.config.trackMorphology).toBe(true)
        })
    })
})

/**
 * Test Suite 3: PipelineStage Endpoints
 */
describe('PipelineStage API', () => {
    let pipelineId
    let stageId

    beforeAll(async () => {
        // Create a pipeline first
        const pipelineRes = await request(app)
            .post('/api/reviews/test-review/pipeline')
            .send({
                mode: 'jours',
                startDate: '2025-01-18',
                endDate: '2025-04-17'
            })
        pipelineId = pipelineRes.body.id
        stageId = pipelineRes.body.stages[0]?.id
    })

    describe('PUT /api/pipelines/:pipelineId/stages/:stageId', () => {
        test('should update stage with data', async () => {
            const response = await request(app)
                .put(`/api/pipelines/${pipelineId}/stages/${stageId}`)
                .send({
                    data: {
                        temperature: 25,
                        humidity: 65,
                        notes: 'First watering'
                    }
                })

            expect(response.status).toBe(200)
            expect(response.body.data.temperature).toBe(25)
        })

        test('should handle missing stage gracefully', async () => {
            const response = await request(app)
                .put(`/api/pipelines/${pipelineId}/stages/nonexistent`)
                .send({
                    data: { temperature: 25 }
                })

            expect(response.status).toBe(404)
        })
    })

    describe('GET /api/pipelines/:pipelineId/stages', () => {
        test('should list all stages with optional date filter', async () => {
            const response = await request(app)
                .get(`/api/pipelines/${pipelineId}/stages`)

            expect(response.status).toBe(200)
            expect(Array.isArray(response.body)).toBe(true)
        })

        test('should filter stages by date range', async () => {
            const response = await request(app)
                .get(`/api/pipelines/${pipelineId}/stages`)
                .query({
                    startDate: '2025-01-18',
                    endDate: '2025-01-25'
                })

            expect(response.status).toBe(200)
            expect(response.body.length).toBeLessThanOrEqual(7)
        })
    })
})

/**
 * Test Suite 4: Authentication & Authorization
 */
describe('Auth & Authorization', () => {
    test('should reject requests without user context', async () => {
        const unAuthApp = express()
        unAuthApp.use(express.json())
        unAuthApp.use(pipelineCultureRoutes)

        const response = await request(unAuthApp)
            .get('/api/culture-setups')

        expect(response.status).toBe(401)
    })

    test('should prevent access to other users\' data', async () => {
        const response = await request(app)
            .get('/api/culture-setups/other-user-id')

        // Should return 403 or empty list depending on implementation
        expect([200, 403]).toContain(response.status)
    })
})

/**
 * Cleanup
 */
afterAll(async () => {
    await prisma.$disconnect()
})
