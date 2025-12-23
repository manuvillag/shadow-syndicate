/**
 * Standardized API error handling utilities
 */

export interface ApiError {
  error: string
  message?: string
  details?: any
  code?: string
  status?: number
}

/**
 * Parse API error response consistently
 */
export async function parseApiError(response: Response): Promise<ApiError> {
  let errorData: any = {}
  
  try {
    const contentType = response.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      errorData = await response.json()
    } else {
      const text = await response.text()
      errorData = { error: text || response.statusText || 'Unknown error' }
    }
  } catch (parseError) {
    errorData = { error: response.statusText || 'Failed to parse error response' }
  }

  return {
    error: errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`,
    message: errorData.message,
    details: errorData.details,
    code: errorData.code,
    status: response.status,
  }
}

/**
 * Handle API errors consistently in API routes
 */
export function handleApiError(error: unknown, context: string): { error: string; status: number } {
  console.error(`[API] ${context} error:`, error)

  if (error instanceof Error) {
    // Check for known error types
    if (error.message.includes('Unauthorized') || error.message.includes('authentication')) {
      return { error: 'Unauthorized', status: 401 }
    }
    if (error.message.includes('not found')) {
      return { error: error.message, status: 404 }
    }
    if (error.message.includes('constraint') || error.message.includes('duplicate')) {
      return { error: 'Data conflict: ' + error.message, status: 409 }
    }
    return { error: error.message, status: 500 }
  }

  return { error: 'Internal server error', status: 500 }
}

/**
 * Create standardized error response
 */
export function createErrorResponse(error: string, status: number = 500, details?: any) {
  return {
    error,
    ...(details && { details }),
    ...(process.env.NODE_ENV === 'development' && { stack: new Error().stack }),
  }
}

