# Error Handling & Loading States

## Overview

This document describes the improved error handling and loading skeleton system implemented across the application.

## Components Created

### Loading Skeletons (`components/loading-skeletons.tsx`)

Reusable skeleton components for better UX during data loading:

- **`PageLoadingSkeleton`** - Full page loading state with HUD bar skeleton
- **`CardGridSkeleton`** - Grid of card skeletons (configurable count)
- **`ContractCardSkeleton`** - Specific skeleton for contract cards
- **`OutpostCardSkeleton`** - Specific skeleton for outpost cards
- **`HudBarSkeleton`** - HUD bar loading state
- **`ListSkeleton`** - List item skeletons (configurable count)

### Error Display (`components/error-display.tsx`)

Consistent error display components:

- **`ErrorDisplay`** - Reusable error card with optional retry button
- **`ErrorPage`** - Full-page error display with retry functionality

### API Error Handler (`lib/api-error-handler.ts`)

Standardized error handling utilities:

- **`parseApiError(response)`** - Parses API error responses consistently
- **`handleApiError(error, context)`** - Handles errors in API routes with proper status codes
- **`createErrorResponse(error, status, details)`** - Creates standardized error responses

## Updated Pages

### Contracts Page
- ✅ Uses `PageLoadingSkeleton` for initial load
- ✅ Uses `ContractCardSkeleton` for contract list loading
- ✅ Uses `ErrorPage` for error states
- ✅ Improved error parsing with `parseApiError`

### Outposts Page
- ✅ Uses `PageLoadingSkeleton` for initial load
- ✅ Uses `CardGridSkeleton` for outpost lists
- ✅ Uses `ErrorPage` for error states
- ✅ Improved error handling in fetch calls

### Skirmish Page
- ✅ Uses `CardGridSkeleton` for opponent list loading
- ✅ Uses `ErrorPage` for error states

### Crew Page
- ✅ Uses `ListSkeleton` for crew member list loading
- ✅ Uses `ErrorPage` for error states

## Updated API Routes

### Contracts API (`/api/contracts`)
- ✅ Uses `handleApiError` for consistent error handling
- ✅ Uses `createErrorResponse` for standardized responses
- ✅ Better error context logging

### Outposts API (`/api/outposts`)
- ✅ Uses `handleApiError` for consistent error handling
- ✅ Uses `createErrorResponse` for standardized responses
- ✅ Improved error messages

## Error Handling Patterns

### Frontend Pattern

```typescript
// Loading state
if (loading) {
  return <PageLoadingSkeleton />
}

// Error state
if (error || !player) {
  return <ErrorPage error={error || "Player not found"} onRetry={() => window.location.reload()} />
}

// API call with error handling
try {
  const res = await fetch('/api/endpoint')
  if (!res.ok) {
    const error = await parseApiError(res)
    throw new Error(error.error)
  }
  const data = await res.json()
  // Handle success
} catch (error) {
  toast({
    title: "Error",
    description: error instanceof Error ? error.message : "Operation failed",
    variant: "destructive",
  })
}
```

### Backend Pattern

```typescript
import { handleApiError, createErrorResponse } from '@/lib/api-error-handler'

export async function GET() {
  try {
    // ... API logic
    
    if (error) {
      const { error: errorMessage, status } = handleApiError(error, 'Context name')
      return NextResponse.json(createErrorResponse(errorMessage, status), { status })
    }
    
    return NextResponse.json({ data })
  } catch (error) {
    const { error: errorMessage, status } = handleApiError(error, 'Context name')
    return NextResponse.json(createErrorResponse(errorMessage, status), { status })
  }
}
```

## Benefits

1. **Consistent UX** - All pages now have similar loading and error states
2. **Better Error Messages** - Standardized error parsing provides clearer messages
3. **Improved Debugging** - Better error context and logging
4. **User-Friendly** - Loading skeletons show structure while data loads
5. **Retry Functionality** - Error pages include retry buttons for easy recovery

## Future Improvements

- [ ] Add error boundaries for React error catching
- [ ] Implement retry logic with exponential backoff
- [ ] Add offline detection and handling
- [ ] Create more specific skeleton variants for different content types
- [ ] Add error reporting/analytics integration

