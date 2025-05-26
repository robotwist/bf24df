# Shared Module

This directory contains shared components, layouts, and styles used across the application.

## Structure

- `components/`: Reusable UI components
  - Buttons
  - Forms
  - Cards
  - Modals
  - Tables
  - Navigation

- `layouts/`: Page layouts and templates
  - Main layout
  - Dashboard layout
  - Auth layout
  - Error pages

- `styles/`: Global styles and themes
  - Theme configuration
  - Global CSS
  - CSS modules
  - Animation styles

## Usage

Import shared components and styles from this directory:

```typescript
import { Button } from '@/shared/components/Button';
import { MainLayout } from '@/shared/layouts/MainLayout';
import '@/shared/styles/global.css';
``` 