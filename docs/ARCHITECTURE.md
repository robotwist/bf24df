# Architecture Guide

## Component Composition

### Core Components

#### 1. DAG Visualization
```typescript
// src/components/visualization/EnhancedDAG.tsx
interface DAGProps {
  nodes: FormNode[];
  edges: Edge[];
  onNodeClick: (nodeId: string) => void;
}

// Usage Example:
<EnhancedDAG
  nodes={formNodes}
  edges={formEdges}
  onNodeClick={handleNodeClick}
/>
```

#### 2. Form Mapping
```typescript
// src/components/mapping/FormMapping.tsx
interface FormMappingProps {
  targetForm: Form;
  sourceForms: Form[];
  mappings: FieldMapping[];
  onMappingChange: (mapping: FieldMapping) => void;
}

// Usage Example:
<FormMapping
  targetForm={selectedForm}
  sourceForms={availableSourceForms}
  mappings={currentMappings}
  onMappingChange={handleMappingChange}
/>
```

### Component Hierarchy
```
App
├── DAGContainer
│   ├── EnhancedDAG
│   │   ├── DAGNode
│   │   └── DAGEdge
│   └── NodeDetails
│       └── FormMapping
│           ├── MappingList
│           │   └── MappingItem
│           └── MappingModal
│               └── DataSourceSelector
└── ToastContainer
    └── Toast
```

### State Management
```typescript
// Using useMappingState hook
const {
  state,
  addMapping,
  removeMapping,
  updateMapping
} = useMappingState({
  formId: 'form-1',
  onError: handleError
});
```

## Extending Data Sources

### 1. Adding a New Data Source

```typescript
// 1. Define the data source type
interface CustomDataSource {
  type: 'custom';
  id: string;
  name: string;
  fields: CustomField[];
}

// 2. Implement the data source provider
class CustomDataSourceProvider implements DataSourceProvider {
  async getFields(): Promise<Field[]> {
    // Fetch and transform fields
    return transformedFields;
  }

  async getValue(fieldId: string): Promise<any> {
    // Fetch value for the field
    return value;
  }
}

// 3. Register the data source
const dataSourceRegistry = {
  form: new FormDataSourceProvider(),
  global: new GlobalDataSourceProvider(),
  custom: new CustomDataSourceProvider() // Add your new provider
};
```

### 2. Example: Adding a REST API Data Source

```typescript
// src/services/dataSources/RestApiSource.ts
interface RestApiConfig {
  baseUrl: string;
  authToken?: string;
}

class RestApiDataSource implements DataSource {
  constructor(private config: RestApiConfig) {}

  async getFields(): Promise<Field[]> {
    const response = await fetch(`${this.config.baseUrl}/fields`, {
      headers: {
        Authorization: `Bearer ${this.config.authToken}`
      }
    });
    return response.json();
  }

  async getValue(fieldId: string): Promise<any> {
    const response = await fetch(`${this.config.baseUrl}/values/${fieldId}`);
    return response.json();
  }
}

// Usage:
const restApiSource = new RestApiDataSource({
  baseUrl: 'https://api.example.com',
  authToken: 'your-token'
});
```

### 3. Example: Adding a Local Storage Data Source

```typescript
// src/services/dataSources/LocalStorageSource.ts
class LocalStorageDataSource implements DataSource {
  constructor(private prefix: string) {}

  async getFields(): Promise<Field[]> {
    const storedFields = localStorage.getItem(`${this.prefix}_fields`);
    return storedFields ? JSON.parse(storedFields) : [];
  }

  async getValue(fieldId: string): Promise<any> {
    return localStorage.getItem(`${this.prefix}_${fieldId}`);
  }
}

// Usage:
const localStorageSource = new LocalStorageDataSource('myApp');
```

### 4. Implementing a New Transformation

```typescript
// src/services/transformationService.ts
interface CustomTransformation {
  type: 'custom';
  config: {
    // Your custom configuration
    format: string;
    options?: any;
  };
}

class TransformationService {
  // Add new transformation type
  private static customTransform(value: any, config: CustomTransformation['config']): any {
    // Implement your transformation logic
    return transformedValue;
  }

  // Register the transformation
  static transformValue(value: any, mapping: Mapping): any {
    switch (mapping.transformation.type) {
      case 'custom':
        return this.customTransform(value, mapping.transformation.config);
      // ... other cases
    }
  }
}
```

## Best Practices

1. **Component Composition**
   - Keep components focused and single-responsibility
   - Use TypeScript interfaces for props
   - Implement proper error boundaries
   - Use React.memo for performance optimization

2. **Data Source Extension**
   - Implement the DataSource interface
   - Handle errors gracefully
   - Cache results when appropriate
   - Provide clear configuration options

3. **Testing New Components**
   ```typescript
   describe('NewComponent', () => {
     it('should render correctly', () => {
       const { getByTestId } = render(<NewComponent {...props} />);
       expect(getByTestId('component')).toBeInTheDocument();
     });

     it('should handle data source integration', async () => {
       const { getByText } = render(<NewComponent {...props} />);
       await waitFor(() => {
         expect(getByText('Expected Data')).toBeInTheDocument();
       });
     });
   });
   ```

4. **Error Handling**
   ```typescript
   try {
     const data = await dataSource.getValue(fieldId);
     return data;
   } catch (error) {
     console.error('Failed to fetch data:', error);
     throw new DataSourceError('Failed to fetch data', error);
   }
   ``` 