# Form Field Mapping Editor

A React-based form field mapping editor that allows users to create and manage field mappings between different forms. The editor supports field type validation, data transformations, and undo/redo functionality.

## Features

- 🔄 Field mapping between forms
- ✅ Type validation and compatibility checking
- 🔧 Data transformations (uppercase, lowercase, date formatting, etc.)
- ↩️ Undo/redo functionality
- 💾 Automatic persistence of mappings
- 🎯 Field type validation
- 📱 Responsive design
- ♿ Accessibility support

## Prerequisites

- Node.js 16.x or later
- npm 7.x or later

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/form-field-mapping-editor.git
cd form-field-mapping-editor
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Usage

### Basic Usage

```tsx
import { MappingEditor } from './components/mappings/MappingEditor';

function App() {
  const form = {
    id: 'form-1',
    data: {
      component_id: 'form-component-1',
      name: 'Target Form'
    }
  };

  const graphData = {
    nodes: [
      {
        id: 'form-1',
        data: {
          component_id: 'form-component-1',
          name: 'Target Form',
          prerequisites: ['form-2']
        }
      },
      {
        id: 'form-2',
        data: {
          component_id: 'form-component-2',
          name: 'Source Form'
        }
      }
    ],
    forms: [
      {
        id: 'form-component-1',
        field_schema: {
          properties: {
            name: { type: 'string', title: 'Name' },
            email: { type: 'string', title: 'Email' }
          }
        }
      },
      {
        id: 'form-component-2',
        field_schema: {
          properties: {
            fullName: { type: 'string', title: 'Full Name' },
            contactEmail: { type: 'string', title: 'Contact Email' }
          }
        }
      }
    ]
  };

  return (
    <MappingEditor
      form={form}
      graphData={graphData}
      onClose={() => console.log('Editor closed')}
    />
  );
}
```

### Using Transformations

The editor supports various data transformations:

```tsx
// Example of using transformations
const mapping = {
  id: 'mapping-1',
  targetFormId: 'form-1',
  targetFieldId: 'name',
  source: {
    type: 'direct',
    formId: 'form-2',
    fieldId: 'fullName',
    label: 'Full Name'
  },
  transformation: {
    type: 'uppercase',
    params: {}
  }
};
```

### State Management

The editor includes a custom hook for state management:

```tsx
import { useMappingState } from './hooks/useMappingState';

function MyComponent() {
  const {
    state,
    addMapping,
    removeMapping,
    updateMapping,
    undo,
    redo
  } = useMappingState({
    formId: 'form-1',
    onError: (error) => console.error(error)
  });

  // Use the state management functions
  const handleAddMapping = () => {
    addMapping(newMapping);
  };

  const handleUndo = () => {
    undo();
  };
}
```

## Development

### Project Structure

```
src/
  ├── components/
  │   └── mappings/
  │       └── MappingEditor.tsx
  ├── hooks/
  │   ├── useMappingState.ts
  │   └── useMappings.ts
  ├── lib/
  │   └── services/
  │       ├── mappingService.ts
  │       ├── transformationService.ts
  │       └── validationService.ts
  ├── types/
  │   ├── graph.ts
  │   └── mappings.ts
  └── styles/
      └── MappingEditor.module.css
```

### Running Tests

```bash
npm test
```

### Building for Production

```bash
npm run build
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```bash
git clone https://github.com/robotwist/avantos-field-mapping
cd avantos-field-mapping
pnpm install
pnpm dev
pnpm test:e2e
