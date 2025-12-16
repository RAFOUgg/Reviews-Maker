import React from 'react'
import LiquidCard from '../../../components/LiquidCard'
import CuringMaturationTimeline from '../../../components/forms/flower/CuringMaturationTimeline'

export default function PipelineCuring({ formData, handleChange }) {
    return (
        <LiquidCard title="🔥 Pipeline Curing & Maturation CDC" bordered>
            <CuringMaturationTimeline
                data={{
                    curingTimelineConfig: {
                        type: 'jour', // seconde, minute, heure, jour, semaine, mois
                        start: '',
                        end: '',
                        duration: formData.dureeCuring || 30,
                        totalDays: formData.dureeCuring || 30
                    },
                    curingTimelineData: formData.curingTimelineData || []
                }}
                onChange={(field, value) => {
                    handleChange(field, value);
                }}
            />
        </LiquidCard>
    )
}
}
