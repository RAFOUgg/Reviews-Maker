import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * REVIEWS-MAKER MVP - Pipeline Store
 * Gestion état des pipelines (culture, curing, extraction, etc.)
 */

export const usePipelineStore = create(
  persist(
    (set, get) => ({
      // État actuel des pipelines en édition
      culturePipeline: {
        config: {
          intervalType: 'days', // 'days', 'weeks', 'phases'
          startDate: null,
          endDate: null,
          duration: null,
          season: null,
        },
        steps: [], // [{stepIndex, stepName, data, notes}, ...]
      },

      curingPipeline: {
        config: {
          intervalType: 'days',
          duration: null,
          curingType: 'cold', // 'cold', 'warm'
        },
        steps: [],
      },

      extractionPipeline: {
        config: {
          method: null,
        },
        steps: [],
      },

      // Actions Culture Pipeline
      setCultureConfig: (config) => {
        set((state) => ({
          culturePipeline: {
            ...state.culturePipeline,
            config: { ...state.culturePipeline.config, ...config },
          },
        }));
      },

      addCultureStep: (step) => {
        set((state) => ({
          culturePipeline: {
            ...state.culturePipeline,
            steps: [...state.culturePipeline.steps, step].sort((a, b) => a.stepIndex - b.stepIndex),
          },
        }));
      },

      updateCultureStep: (stepIndex, data) => {
        set((state) => ({
          culturePipeline: {
            ...state.culturePipeline,
            steps: state.culturePipeline.steps.map((s) =>
              s.stepIndex === stepIndex ? { ...s, ...data } : s
            ),
          },
        }));
      },

      deleteCultureStep: (stepIndex) => {
        set((state) => ({
          culturePipeline: {
            ...state.culturePipeline,
            steps: state.culturePipeline.steps.filter((s) => s.stepIndex !== stepIndex),
          },
        }));
      },

      clearCulturePipeline: () => {
        set({
          culturePipeline: {
            config: {
              intervalType: 'days',
              startDate: null,
              endDate: null,
              duration: null,
              season: null,
            },
            steps: [],
          },
        });
      },

      // Actions Curing Pipeline
      setCuringConfig: (config) => {
        set((state) => ({
          curingPipeline: {
            ...state.curingPipeline,
            config: { ...state.curingPipeline.config, ...config },
          },
        }));
      },

      addCuringStep: (step) => {
        set((state) => ({
          curingPipeline: {
            ...state.curingPipeline,
            steps: [...state.curingPipeline.steps, step].sort((a, b) => a.stepIndex - b.stepIndex),
          },
        }));
      },

      updateCuringStep: (stepIndex, data) => {
        set((state) => ({
          curingPipeline: {
            ...state.curingPipeline,
            steps: state.curingPipeline.steps.map((s) =>
              s.stepIndex === stepIndex ? { ...s, ...data } : s
            ),
          },
        }));
      },

      deleteCuringStep: (stepIndex) => {
        set((state) => ({
          curingPipeline: {
            ...state.curingPipeline,
            steps: state.curingPipeline.steps.filter((s) => s.stepIndex !== stepIndex),
          },
        }));
      },

      clearCuringPipeline: () => {
        set({
          curingPipeline: {
            config: {
              intervalType: 'days',
              duration: null,
              curingType: 'cold',
            },
            steps: [],
          },
        });
      },

      // Load pipeline from API
      loadCulturePipeline: (pipelineData) => {
        set({
          culturePipeline: pipelineData,
        });
      },

      loadCuringPipeline: (pipelineData) => {
        set({
          curingPipeline: pipelineData,
        });
      },

      // Reset all
      resetAllPipelines: () => {
        get().clearCulturePipeline();
        get().clearCuringPipeline();
      },
    }),
    {
      name: 'reviews-maker-pipelines',
      version: 1,
    }
  )
);
