import type { AIModelFormState, AIModelRecord } from '@/types/ai-model'

const aiModel1Form: AIModelFormState = {
  metadata: {
    name: 'Flood Risk Forecaster',
    modelType: 'forecasting',
    domain: 'disaster-management',
    description:
      'Predicts short-term flood risk for river basin districts using historical rainfall, terrain and river gauge data, helping disaster response teams prioritise where to act first.',
    targetUsers: ['government-teams', 'analysts'],
    intendedUse:
      'Run daily to generate a district-level flood risk score that district disaster management authorities use to plan evacuation and resource allocation.',
    sectors: ['environment', 'water-sanitation'],
    tags: ['Flood', 'Forecasting', 'Disaster Response'],
    languageSupportType: 'specific',
    languages: ['en', 'hi'],
    geographies: ['india'],
    website: 'https://civicdatalab.in',
    license: 'cc-by-4.0',
  },
  versions: [
    {
      id: 'version-1',
      name: '1.0',
      lifecycleStage: 'stable',
      isPrimary: true,
      updatedAt: '2026-08-09',
      accessMethods: [
        {
          id: 'access-1',
          name: 'Custom API',
          provider: 'custom',
          isPrimary: true,
          modelId: 'flood-risk-v1',
          apiKey: '',
          endpointUrl: 'https://api.civicdatalab.in/flood-risk/v1/predict',
          authType: 'api-key',
          headerName: 'X-API-Key',
          apiKeyLocation: 'header',
          credentialValue: 'demo-key-not-real',
          requestBody: '',
          responsePath: '',
          timeoutSeconds: '30',
        },
      ],
    },
  ],
}

const aiModel2Form: AIModelFormState = {
  metadata: {
    name: 'Policy Document Summarizer',
    modelType: 'llm',
    domain: 'governance',
    description: '',
    targetUsers: ['researchers'],
    intendedUse: '',
    sectors: [],
    tags: [],
    languageSupportType: 'specific',
    languages: ['en'],
    geographies: [],
    website: '',
    license: '',
  },
  versions: [
    {
      id: 'version-2',
      name: '1.0',
      lifecycleStage: 'development',
      isPrimary: true,
      updatedAt: '2026-08-17',
      accessMethods: [],
    },
  ],
}

export const MOCK_AI_MODEL_RECORDS: AIModelRecord[] = [
  {
    id: 'ai-model-1',
    status: 'published',
    updatedAt: '09/08/2026 11:20:00',
    form: aiModel1Form,
    publishedForm: aiModel1Form,
  },
  {
    id: 'ai-model-2',
    status: 'draft',
    updatedAt: '17/08/2026 16:40:00',
    form: aiModel2Form,
    publishedForm: null,
  },
]
