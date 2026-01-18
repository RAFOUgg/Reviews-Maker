/**
 * server-new/seed-phase1-fleurs.js
 * Seed data pour Phase 1 FLEURS - Données de test & démonstration
 * 
 * Créer:
 * - 1 utilisateur producteur test
 * - 3 cultivars (OG Kush, GSC, Jack Herer)
 * - 1 arbre généalogique avec phénotypes
 * - 3 presets réutilisables (Espace, Substrat, Lumière)
 * - 1 pipeline complet avec 10 étapes documentées
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function seedPhase1Fleurs() {
    console.log('🌱 Phase 1 FLEURS Seed - Starting...\n')

    try {
        // ========================================
        // 1. CREATE TEST PRODUCER USER
        // ========================================
        console.log('👤 Creating test producer user...')

        const hashedPassword = await bcrypt.hash('test-producer-123', 10)

        const testUser = await prisma.user.upsert({
            where: { email: 'producer@test-reviews-maker.local' },
            update: {},
            create: {
                email: 'producer@test-reviews-maker.local',
                name: 'Test Producteur',
                password: hashedPassword,
                accountTier: 'Producteur', // Paid account
                isVerified: true,
                kyc: {
                    status: 'verified',
                    documentUrl: '/db/kyc_documents/test-producer-kyc.pdf'
                }
            }
        })

        console.log(`✓ User created: ${testUser.email} (ID: ${testUser.id})`)

        // ========================================
        // 2. CREATE CULTIVARS (Genetics Library)
        // ========================================
        console.log('\n🧬 Creating cultivars...')

        const cultivars = await Promise.all([
            prisma.cultivar.upsert({
                where: {
                    userId_name: {
                        userId: testUser.id,
                        name: 'OG Kush'
                    }
                },
                update: {},
                create: {
                    userId: testUser.id,
                    name: 'OG Kush',
                    breeder: 'Kushman',
                    type: 'Indica',
                    thcRange: { min: 18, max: 26 },
                    cbdRange: { min: 0, max: 1 },
                    description: 'Classic OG - Strong pine & fuel flavor'
                }
            }),
            prisma.cultivar.upsert({
                where: {
                    userId_name: {
                        userId: testUser.id,
                        name: 'Girl Scout Cookies'
                    }
                },
                update: {},
                create: {
                    userId: testUser.id,
                    name: 'Girl Scout Cookies',
                    breeder: 'Unknown',
                    type: 'Hybrid',
                    thcRange: { min: 16, max: 28 },
                    cbdRange: { min: 0, max: 0.5 },
                    description: 'Sweet mint & chocolate profile'
                }
            }),
            prisma.cultivar.upsert({
                where: {
                    userId_name: {
                        userId: testUser.id,
                        name: 'Jack Herer'
                    }
                },
                update: {},
                create: {
                    userId: testUser.id,
                    name: 'Jack Herer',
                    breeder: 'Sensi',
                    type: 'Sativa',
                    thcRange: { min: 15, max: 24 },
                    cbdRange: { min: 0.5, max: 1 },
                    description: 'Energetic with pine & citrus notes'
                }
            })
        ])

        console.log(`✓ Created ${cultivars.length} cultivars`)

        // ========================================
        // 3. CREATE CULTURE SETUPS (Reusable Presets)
        // ========================================
        console.log('\n📦 Creating culture setup presets...')

        const cultureSetups = await Promise.all([
            // Setup 1: Espace
            prisma.cultureSetup.upsert({
                where: {
                    userId_name: {
                        userId: testUser.id,
                        name: 'Tente 120x120 Professional'
                    }
                },
                update: {},
                create: {
                    userId: testUser.id,
                    name: 'Tente 120x120 Professional',
                    group: 'space',
                    data: {
                        type: 'tent',
                        dimensions: '120x120x200cm',
                        surface: 1.44,
                        volume: 2.88,
                        brand: 'Secret Jardin'
                    }
                }
            }),
            // Setup 2: Substrat
            prisma.cultureSetup.upsert({
                where: {
                    userId_name: {
                        userId: testUser.id,
                        name: 'Coco/Terreau 60/40'
                    }
                },
                update: {},
                create: {
                    userId: testUser.id,
                    name: 'Coco/Terreau 60/40',
                    group: 'substrate',
                    data: {
                        type: 'hybrid',
                        coco_percentage: 60,
                        soil_percentage: 40,
                        volume_liters: 50,
                        brands: {
                            coco: 'Plagron Coco',
                            soil: 'GHE BioRoots'
                        }
                    }
                }
            }),
            // Setup 3: Lumière
            prisma.cultureSetup.upsert({
                where: {
                    userId_name: {
                        userId: testUser.id,
                        name: 'LED 600W Full Spectrum'
                    }
                },
                update: {},
                create: {
                    userId: testUser.id,
                    name: 'LED 600W Full Spectrum',
                    group: 'lighting',
                    data: {
                        type: 'LED',
                        power: 600,
                        spectrum: 'full',
                        distance_cm: 60,
                        dli: 16,
                        kelvin: 4000,
                        brand: 'SpiderFarmer'
                    }
                }
            })
        ])

        console.log(`✓ Created ${cultureSetups.length} culture setup presets`)

        // ========================================
        // 4. CREATE REVIEW WITH PIPELINE
        // ========================================
        console.log('\n📋 Creating review with complete pipeline...')

        const review = await prisma.review.create({
            data: {
                userId: testUser.id,
                productType: 'Fleur',
                productName: 'OG Kush - Pheno Hunt V1',
                cultivarId: cultivars[0].id,
                farm: 'Test Farm',
                notes: 'Complete test review for Phase 1 FLEURS',
                isPrivate: true,
                status: 'draft',
                data: {
                    generalInfo: {
                        commercialName: 'OG Kush - Pheno Hunt V1',
                        cultivar: 'OG Kush',
                        farm: 'Test Farm',
                        type: 'Indica'
                    }
                }
            }
        })

        console.log(`✓ Review created: ${review.productName} (ID: ${review.id})`)

        // ========================================
        // 5. CREATE PIPELINE (90 days)
        // ========================================
        console.log('\n🔄 Creating 90-day culture pipeline...')

        const startDate = new Date('2025-01-18')
        const endDate = new Date('2025-04-17')

        // Create 90 stage objects
        const stages = []
        for (let day = 0; day < 90; day++) {
            const stageDate = new Date(startDate)
            stageDate.setDate(stageDate.getDate() + day)

            stages.push({
                date: stageDate.toISOString().split('T')[0],
                dayNumber: day + 1,
                data: {}
            })
        }

        const pipeline = await prisma.pipeline.create({
            data: {
                reviewId: review.id,
                mode: 'jours',
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0],
                config: {
                    trackEnvironment: true,
                    trackNutrients: true,
                    trackMorphology: true
                },
                stages: {
                    createMany: {
                        data: stages
                    }
                }
            },
            include: {
                stages: true
            }
        })

        console.log(`✓ Pipeline created with ${pipeline.stages.length} stages`)

        // ========================================
        // 6. POPULATE SELECTED STAGES WITH DATA
        // ========================================
        console.log('\n📊 Populating 10 selected stages with data...')

        const stageIndices = [0, 10, 20, 30, 40, 50, 60, 70, 80, 89]
        const phaseNames = [
            'Germination',
            'Plantule',
            'Croissance Début',
            'Croissance Milieu',
            'Croissance Fin',
            'Stretch Début',
            'Stretch Fin',
            'Floraison Début',
            'Floraison Fin',
            'Récolte'
        ]

        for (let idx = 0; idx < stageIndices.length; idx++) {
            const stageIdx = stageIndices[idx]
            const stage = pipeline.stages[stageIdx]

            const temp = 24 + Math.sin(stageIdx / 30) * 3
            const humidity = 65 - (stageIdx / 90) * 20
            const height = (stageIdx / 90) * 80 // 0 to 80cm

            await prisma.pipelineStage.update({
                where: { id: stage.id },
                data: {
                    data: {
                        phase: phaseNames[idx],
                        temperature: Math.round(temp * 10) / 10,
                        humidity: Math.round(humidity),
                        height_cm: Math.round(height),
                        ph: 6.0 + Math.random() * 0.5,
                        ec: 1.0 + (stageIdx / 90) * 1.5,
                        notes: `${phaseNames[idx]}: Temperature ${Math.round(temp * 10) / 10}°C, Humidity ${Math.round(humidity)}%`
                    }
                }
            })
        }

        console.log(`✓ Updated ${stageIndices.length} stages with environment data`)

        // ========================================
        // SUMMARY
        // ========================================
        console.log('\n' + '='.repeat(60))
        console.log('✅ Phase 1 FLEURS Seed Complete!\n')
        console.log('📋 Summary:')
        console.log(`   User: ${testUser.email}`)
        console.log(`   Password: test-producer-123`)
        console.log(`   Cultivars: ${cultivars.length}`)
        console.log(`   Presets: ${cultureSetups.length}`)
        console.log(`   Review: ${review.productName}`)
        console.log(`   Pipeline: ${pipeline.stages.length} stages (90 days)`)
        console.log(`   Populated stages: ${stageIndices.length}`)
        console.log('='.repeat(60))

        // Return seed data for reference
        return {
            user: testUser,
            cultivars,
            cultureSetups,
            review,
            pipeline
        }

    } catch (error) {
        console.error('❌ Seed Error:', error)
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

// Run seed
seedPhase1Fleurs()
    .then(data => {
        console.log('\n✨ Seed successful!')
        process.exit(0)
    })
    .catch(error => {
        console.error(error)
        process.exit(1)
    })
