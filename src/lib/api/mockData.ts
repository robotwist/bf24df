import { GraphData } from '../../types/graph';

export const mockGraphData: GraphData = {
  nodes: [
    {
      id: 'form1',
      data: {
        name: 'Form 1',
        input_mapping: {
          string_field: 'string',
          number_field: 'number',
          boolean_field: 'boolean',
          date_field: 'date',
          text_field: 'text',
          integer_field: 'integer',
          datetime_field: 'datetime',
          phone_field: 'string',
          email_field: 'string',
          dob_field: 'date'
        },
        prerequisites: []
      }
    },
    {
      id: 'form2',
      data: {
        name: 'Form 2',
        input_mapping: {
          patient_first_name: 'string',
          patient_last_name: 'string',
          patient_dob: 'date',
          patient_gender: 'string',
          contact_phone: 'string',
          contact_email: 'string',
          contact_address: 'text',
          patient_allergies: 'text',
          patient_conditions: 'text',
          patient_medications: 'text'
        },
        prerequisites: ['form1']
      }
    },
    {
      id: 'form3',
      data: {
        name: 'Form 3',
        input_mapping: {
          phone: 'string',
          email: 'string',
          date_of_birth: 'date'
        },
        prerequisites: ['form2']
      }
    }
  ],
  edges: [
    { source: 'form1', target: 'form2' },
    { source: 'form2', target: 'form3' }
  ]
}; 