/**
 * test/integration/pipeline-culture.integration.test.js
 * Integration tests pour le workflow complet Phase 1 FLEURS
 * 
 * Suite: 3 tests end-to-end
 * Couvre: Full user workflows et data persistence
 */

import request from 'supertest'
import express from 'express'
import { PrismaClient } from '@prisma/client'
import pipelineCultureRoutes from '../../server-new/routes/pipeline-culture.js'

const prisma = new PrismaClient()

/**
 * Setup Express app for integration testing
 */
const app = express()
app.use(express.json())

// Mock authentication for a specific test user
const testUserId = 'integration-test-user-' + Date.now()

app.use((req, res, next) => {
    req.userId = testUserId
    next()
})

app.use(pipelineCultureRoutes)

/**
 * Integration Test Suite 1: Complete Culture Setup Workflow
 */
describe('Integration: Complete Culture Setup Workflow', () => {
    let createdSetupIds = []

    test('Workflow 1: Create multiple reusable presets and retrieve them', async () => {
        // Step 1: Create "Espace" preset
        const spaceRes = await request(app)
            .post('/api/culture-setups')
            .send({
                name: 'Tente 120x120 Professional',
                group: 'space',
                data: {
                    type: 'tent',
                    dimensions: '120x120x200cm',
                    surface: 1.44,
                    volume: 2.88
                }
            })

        expect(spaceRes.status).toBe(201)
        createdSetupIds.push(spaceRes.body.id)

        // Step 2: Create "Substrat" preset
        const substrateRes = await request(app)
            .post('/api/culture-setups')
            .send({
                name: 'Coco 60% + Terreau 40%',
                group: 'substrate',
                data: {
                    type: 'hybrid',
                    coco_percentage: 60,
                    soil_percentage: 40,
                    volume_liters: 50,
                    brand: 'Platinium + GHE'
                }
            })

        expect(substrateRes.status).toBe(201)
        createdSetupIds.push(substrateRes.body.id)

        // Step 3: Create "Lumière" preset
        const lightRes = await request(app)
            .post('/api/culture-setups')
            .send({
                name: 'LED 600W Full Spectrum',
                group: 'lighting',
                data: {
                    type: 'LED',
                    power: 600,
                    spectrum: 'full',
                    distance_cm: 60,
                    dli: 16
                }
            })

        expect(lightRes.status).toBe(201)
        createdSetupIds.push(lightRes.body.id)

        // Step 4: Retrieve all presets
        const listRes = await request(app)
            .get('/api/culture-setups')

        expect(listRes.status).toBe(200)
        expect(listRes.body.length).toBeGreaterThanOrEqual(3)

        // Step 5: Filter by group
        const spaceFilterRes = await request(app)
            .get('/api/culture-setups?group=space')

        expect(spaceFilterRes.status).toBe(200)
        expect(spaceFilterRes.body.some(s => s.group === 'space')).toBe(true)
    })

    test('Workflow 2: Duplicate a preset and modify it', async () => {
        const setupId = createdSetupIds[0]

        // Step 1: Duplicate existing setup
        const duplicateRes = await request(app)
            .post(`/api/culture-setups/${setupId}/duplicate`)
            .send({
                newName: 'Tente 120x120 - Budget Clone'
            })

        expect(duplicateRes.status).toBe(201)
        expect(duplicateRes.body.name).toBe('Tente 120x120 - Budget Clone')

        // Step 2: Update the duplicate
        const updateRes = await request(app)
            .put(`/api/culture-setups/${duplicateRes.body.id}`)
            .send({
                data: {
                    ...duplicateRes.body.data,
                    volume: 2.5 // Changed volume
                }
            })

        expect(updateRes.status).toBe(200)
        expect(updateRes.body.data.volume).toBe(2.5)

        createdSetupIds.push(duplicateRes.body.id)
    })

    afterAll(async () => {
        // Cleanup: Delete all created setups
        for (const setupId of createdSetupIds) {
            await request(app).delete(`/api/culture-setups/${setupId}`)
        }
    })
})

/**
 * Integration Test Suite 2: Pipeline Lifecycle
 */
describe('Integration: Complete Pipeline Lifecycle', () => {
    let reviewId = 'integration-review-' + Date.now()
    let pipelineId

    test('Workflow 3: Create pipeline, populate stages, and retrieve data', async () => {
        // Step 1: Create a 90-day pipeline in "jours" mode
        const createRes = await request(app)
            .post(`/api/reviews/${reviewId}/pipeline`)
            .send({
                mode: 'jours',
                startDate: '2025-01-18',
                endDate: '2025-04-17',
                config: {
                    trackEnvironment: true,
                    trackNutrients: true,
                    trackMorphology: true
                }
            })

        expect(createRes.status).toBe(201)
        expect(createRes.body.stages.length).toBe(90)
        pipelineId = createRes.body.id

        // Step 2: Update multiple stages with data
        const stagesToUpdate = [0, 30, 60, 89] // Days 1, 31, 61, 90

        for (const dayIndex of stagesToUpdate) {
            const stage = createRes.body.stages[dayIndex]
            const updateRes = await request(app)
                .put(`/api/pipelines/${pipelineId}/stages/${stage.id}`)
                .send({
                    data: {
                        temperature: 24 + (dayIndex / 30),
                        humidity: 65 - (dayIndex / 15),
                        ph: 6.0 + Math.random() * 0.5,
                        ec: 1.0 + (dayIndex / 90),
                        notes: `Day ${dayIndex + 1}: Regular monitoring - All systems OK`
                    }
                })

            expect(updateRes.status).toBe(200)
        }

        // Step 3: Retrieve pipeline and verify updates
        const getRes = await request(app)
            .get(`/api/pipelines/${pipelineId}`)

        expect(getRes.status).toBe(200)
        expect(getRes.body.id).toBe(pipelineId)

        // Step 4: Retrieve stages with date filter
        const filteredRes = await request(app)
            .get(`/api/pipelines/${pipelineId}/stages`)
            .query({
                startDate: '2025-02-01',
                endDate: '2025-02-28'
            })

        expect(filteredRes.status).toBe(200)
        expect(filteredRes.body.length).toBeLessThanOrEqual(28)

        // Step 5: List all stages with data
        const allStagesRes = await request(app)
            .get(`/api/pipelines/${pipelineId}/stages`)

        expect(allStagesRes.status).toBe(200)
        expect(allStagesRes.body.length).toBe(90)

        // Verify some stages have data
        const stagesWithData = allStagesRes.body.filter(s =>
            s.data && Object.keys(s.data).length > 0
        )
        expect(stagesWithData.length).toBeGreaterThan(0)
    })

    test('Workflow 4: Update pipeline configuration mid-culture', async () => {
        // Step 1: Get initial config
        const initialRes = await request(app)
            .get(`/api/pipelines/${pipelineId}`)

        const initialConfig = initialRes.body.config

        // Step 2: Update config to add morphology tracking
        const updateRes = await request(app)
            .put(`/api/pipelines/${pipelineId}`)
            .send({
                config: {
                    ...initialConfig,
                    trackMorphology: true,
                    customFields: [
                        {
                            name: 'Taille plante',
                            unit: 'cm',
                            type: 'number'
                        }
                    ]
                }
            })

        expect(updateRes.status).toBe(200)
        expect(updateRes.body.config.trackMorphology).toBe(true)

        // Step 3: Verify config persisted
        const verifyRes = await request(app)
            .get(`/api/pipelines/${pipelineId}`)

        expect(verifyRes.body.config.trackMorphology).toBe(true)
    })
})

/**
 * Integration Test Suite 3: Data Persistence & Consistency
 */
describe('Integration: Data Persistence & Consistency', () => {
    test('Workflow 5: Verify data consistency across multiple operations', async () => {
        const testReviewId = 'persistence-test-' + Date.now()

        // Step 1: Create culture setups
        const setupIds = []
        const setupNames = ['Setup A', 'Setup B', 'Setup C']

        for (const name of setupNames) {
            const res = await request(app)
                .post('/api/culture-setups')
                .send({
                    name,
                    group: 'space',
                    data: { type: 'test' }
                })
            setupIds.push(res.body.id)
        }

        // Step 2: Create pipeline with these presets referenced
        const pipelineRes = await request(app)
            .post(`/api/reviews/${testReviewId}/pipeline`)
            .send({
                mode: 'jours',
                startDate: '2025-01-18',
                endDate: '2025-01-25', // 7 days
                config: {
                    presetRefs: setupIds.slice(0, 2)
                }
            })

        expect(pipelineRes.status).toBe(201)
        const pipelineId = pipelineRes.body.id

        // Step 3: Add data to every stage
        const stagePromises = pipelineRes.body.stages.map((stage, idx) => {
            return request(app)
                .put(`/api/pipelines/${pipelineId}/stages/${stage.id}`)
                .send({
                    data: {
                        index: idx,
                        value: Math.random() * 100
                    }
                })
        })

        const results = await Promise.all(stagePromises)
        results.forEach(res => expect(res.status).toBe(200))

        // Step 4: Retrieve all stages and verify count
        const retrieveRes = await request(app)
            .get(`/api/pipelines/${pipelineId}/stages`)

        expect(retrieveRes.status).toBe(200)
        expect(retrieveRes.body.length).toBe(7)

        // Step 5: Verify all stages have data
        const stagesWithData = retrieveRes.body.filter(s =>
            s.data && s.data.index !== undefined
        )
        expect(stagesWithData.length).toBe(7)

        // Step 6: Cleanup
        setupIds.forEach(id => {
            request(app).delete(`/api/culture-setups/${id}`)
        })
    })
})

/**
 * Cleanup after all tests
 */
afterAll(async () => {
    await prisma.$disconnect()
})
