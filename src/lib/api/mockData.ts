import { GraphData } from '../../types/graph';

export const mockGraphData: GraphData = {
  $schema: "http://localhost:9000/schemas/ActionBlueprintGraphDescription.json",
  id: "bp_01jk766tckfwx84xjcxazggzyc",
  tenant_id: "1",
  name: "Onboard Customer 0",
  description: "Automated test action",
  category: "Category 4",
  nodes: [
    {
      id: "form-bad163fd-09bd-4710-ad80-245f31b797d5",
      type: "form",
      position: {
        x: 1437,
        y: 264
      },
      data: {
        id: "bp_c_01jka1e3jwewhb2177h7901c5j",
        component_key: "form-bad163fd-09bd-4710-ad80-245f31b797d5",
        component_type: "form",
        component_id: "f_01jk7ap2r3ewf9gx6a9r09gzjv",
        name: "test form",
        prerequisites: [
          "form-0f58384c-4966-4ce6-9ec2-40b96d61f745",
          "form-e15d42df-c7c0-4819-9391-53730e6d47b3"
        ],
        permitted_roles: [],
        input_mapping: {},
        sla_duration: {
          number: 0,
          unit: "minutes"
        },
        approval_required: false,
        approval_roles: []
      }
    },
    {
      id: "form-0f58384c-4966-4ce6-9ec2-40b96d61f745",
      type: "form",
      position: {
        x: 1093.4015147514929,
        y: 155.2205909169969
      },
      data: {
        id: "bp_c_01jka1e3jzewhb9eqfq08rk90b",
        component_key: "form-0f58384c-4966-4ce6-9ec2-40b96d61f745",
        component_type: "form",
        component_id: "f_01jk7ap2r3ewf9gx6a9r09gzjv",
        name: "Form D",
        prerequisites: [
          "form-a4750667-d774-40fb-9b0a-44f8539ff6c4"
        ],
        permitted_roles: [],
        input_mapping: {},
        sla_duration: {
          number: 0,
          unit: "minutes"
        },
        approval_required: false,
        approval_roles: []
      }
    },
    {
      id: "form-47c61d17-62b0-4c42-8ca2-0eff641c9d88",
      type: "form",
      position: {
        x: 494,
        y: 269
      },
      data: {
        id: "bp_c_01jka1e3k0ewha8jbgeayz4cwp",
        component_key: "form-47c61d17-62b0-4c42-8ca2-0eff641c9d88",
        component_type: "form",
        component_id: "f_01jk7ap2r3ewf9gx6a9r09gzjv",
        name: "Form A",
        prerequisites: [],
        permitted_roles: [],
        input_mapping: {},
        sla_duration: {
          number: 0,
          unit: "minutes"
        },
        approval_required: false,
        approval_roles: []
      }
    }
  ],
  edges: [
    {
      source: "form-0f58384c-4966-4ce6-9ec2-40b96d61f745",
      target: "form-bad163fd-09bd-4710-ad80-245f31b797d5"
    },
    {
      source: "form-47c61d17-62b0-4c42-8ca2-0eff641c9d88",
      target: "form-0f58384c-4966-4ce6-9ec2-40b96d61f745"
    }
  ],
  forms: [
    {
      id: "f_01jk7ap2r3ewf9gx6a9r09gzjv",
      name: "test form",
      description: "test",
      is_reusable: false,
      field_schema: {
        type: "object",
        properties: {
          button: {
            avantos_type: "button",
            title: "Button",
            type: "object"
          },
          dynamic_checkbox_group: {
            avantos_type: "checkbox-group",
            items: {
              enum: ["foo", "bar", "foobar"],
              type: "string"
            },
            type: "array",
            uniqueItems: true
          },
          dynamic_object: {
            avantos_type: "object-enum",
            enum: null,
            title: "Dynamic Object",
            type: "object"
          },
          email: {
            avantos_type: "short-text",
            format: "email",
            title: "Email",
            type: "string"
          },
          id: {
            avantos_type: "short-text",
            title: "ID",
            type: "string"
          },
          multi_select: {
            avantos_type: "multi-select",
            items: {
              enum: ["foo", "bar", "foobar"],
              type: "string"
            },
            type: "array",
            uniqueItems: true
          },
          name: {
            avantos_type: "short-text",
            title: "Name",
            type: "string"
          },
          notes: {
            avantos_type: "multi-line-text",
            title: "Notes",
            type: "string"
          }
        },
        required: ["id", "name", "email"]
      },
      ui_schema: {
        type: "VerticalLayout",
        elements: [
          {
            type: "Control",
            scope: "#/properties/multi_select",
            label: "Multi Select",
            options: {
              format: "multi-select"
            }
          },
          {
            type: "Control",
            scope: "#/properties/dynamic_checkbox_group",
            label: "Dynamic Checkbox Group"
          },
          {
            type: "Button",
            scope: "#/properties/button",
            label: "Button"
          },
          {
            type: "Control",
            scope: "#/properties/dynamic_object",
            label: "Dynamic Object"
          },
          {
            type: "Control",
            scope: "#/properties/id",
            label: "ID"
          },
          {
            type: "Control",
            scope: "#/properties/name",
            label: "Name"
          },
          {
            type: "Control",
            scope: "#/properties/email",
            label: "Email"
          },
          {
            type: "Control",
            scope: "#/properties/notes",
            label: "Notes"
          }
        ]
      },
      dynamic_field_config: {
        button: {
          selector_field: "title",
          payload_fields: {
            userId: {
              type: "form_field",
              value: "id"
            }
          },
          endpoint_id: "te_01jk7ap2r0ewfbrfd53sx46hd2"
        },
        dynamic_checkbox_group: {
          selector_field: "title",
          payload_fields: {
            userId: {
              type: "form_field",
              value: "id"
            }
          },
          endpoint_id: "te_01jk7ap2r0ewfbrfd53sx46hd2"
        },
        dynamic_object: {
          selector_field: "title",
          payload_fields: {
            userId: {
              type: "form_field",
              value: "id"
            }
          },
          endpoint_id: "te_01jk7ap2r0ewfbrfd53sx46hd2"
        }
      }
    }
  ],
  branches: [],
  triggers: []
}; 