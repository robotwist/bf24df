# Core Module

This directory contains the core business logic and shared functionality of the application.

## Structure

- `services/`: Core business logic services
  - FHIR service
  - HL7 service
  - Workflow service
  - Authentication service

- `hooks/`: Custom React hooks
  - useFHIR
  - useWorkflow
  - useAuth
  - useForm

- `utils/`: Utility functions
  - FHIR validation
  - HL7 parsing
  - Error handling
  - Logging

- `types/`: TypeScript type definitions
  - FHIR types
  - HL7 types
  - Workflow types
  - Common interfaces

## Usage

Import core functionality from this directory:

```typescript
import { FHIRService } from '@/core/services/fhir';
import { useWorkflow } from '@/core/hooks/useWorkflow';
import { validateFHIR } from '@/core/utils/validation';
import type { FHIRResource } from '@/core/types/fhir';
``` 