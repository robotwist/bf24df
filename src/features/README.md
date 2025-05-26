# Features Module

This directory contains feature-specific components and logic, organized by domain.

## Structure

- `workflow/`: Workflow automation features
  - Workflow templates
  - Workflow editor
  - Workflow execution
  - Workflow monitoring

- `integration/`: Integration features
  - FHIR integration
  - HL7 integration
  - External system connectors
  - Data mapping

- `analytics/`: Analytics features
  - Data visualization
  - Reporting
  - Metrics
  - Dashboards

## Usage

Import feature components from this directory:

```typescript
import { WorkflowTemplates } from '@/features/workflow/components/WorkflowTemplates';
import { FHIRIntegration } from '@/features/integration/components/FHIRIntegration';
import { AnalyticsDashboard } from '@/features/analytics/components/Dashboard';
``` 