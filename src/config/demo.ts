export const DEMO_CONFIG = {
  enabled: true,
  testUsers: [
    {
      id: 'demo_admin',
      name: 'Demo Admin',
      role: 'admin',
      email: 'admin@demo.com',
      permissions: ['*']
    },
    {
      id: 'demo_clinician',
      name: 'Demo Clinician',
      role: 'clinician',
      email: 'clinician@demo.com',
      permissions: [
        'read:forms',
        'write:forms',
        'read:mappings',
        'write:mappings',
        'read:workflows'
      ]
    },
    {
      id: 'demo_nurse',
      name: 'Demo Nurse',
      role: 'nurse',
      email: 'nurse@demo.com',
      permissions: [
        'read:forms',
        'write:forms',
        'read:mappings'
      ]
    }
  ],
  demoData: {
    forms: [
      {
        id: 'demo_form_1',
        name: 'Patient Intake Form',
        description: 'Initial patient registration form',
        is_reusable: true
      },
      {
        id: 'demo_form_2',
        name: 'Medical History',
        description: 'Patient medical history form',
        is_reusable: true
      },
      {
        id: 'demo_form_3',
        name: 'Treatment Plan',
        description: 'Patient treatment plan form',
        is_reusable: true
      }
    ],
    mappings: [
      {
        sourceForm: 'demo_form_1',
        targetForm: 'demo_form_2',
        mappings: [
          {
            sourceField: 'patientId',
            targetField: 'patientId',
            transformation: 'direct'
          },
          {
            sourceField: 'name',
            targetField: 'patientName',
            transformation: 'direct'
          }
        ]
      }
    ]
  }
}; 