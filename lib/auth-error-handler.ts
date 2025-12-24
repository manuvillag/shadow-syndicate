/**
 * Parse Supabase authentication errors into user-friendly messages
 */

export interface AuthError {
  message: string
  status?: number
  code?: string
}

/**
 * Get user-friendly error message from Supabase auth error
 */
export function parseAuthError(error: any): string {
  if (!error) return "An unexpected error occurred"

  // Handle string errors
  if (typeof error === 'string') {
    return error
  }

  // Handle Error objects (including AuthApiError)
  if (error instanceof Error) {
    // Check for Supabase AuthApiError specific properties
    if ('message' in error) {
      return parseErrorMessage(error.message)
    }
    return parseErrorMessage(error.toString())
  }

  // Handle Supabase error objects with message property
  if (error.message) {
    return parseErrorMessage(error.message)
  }

  // Handle error codes
  if (error.code) {
    return parseErrorCode(error.code)
  }

  // Fallback: try to stringify the error
  try {
    const errorStr = JSON.stringify(error)
    if (errorStr !== '{}') {
      return parseErrorMessage(errorStr)
    }
  } catch (e) {
    // Ignore stringify errors
  }

  return "An unexpected error occurred"
}

/**
 * Parse error message string for common patterns
 */
function parseErrorMessage(message: string): string {
  const lowerMessage = message.toLowerCase()

  // Invalid credentials (check this first as it's most common)
  if (
    lowerMessage.includes('invalid login') ||
    lowerMessage.includes('invalid credentials') ||
    lowerMessage.includes('email or password') ||
    lowerMessage.includes('wrong password') ||
    lowerMessage.includes('incorrect password') ||
    lowerMessage === 'invalid login credentials'
  ) {
    return "Invalid email or password. Please check your credentials and try again."
  }

  // Email not confirmed
  if (
    lowerMessage.includes('email not confirmed') ||
    lowerMessage.includes('email not verified') ||
    lowerMessage.includes('confirm your email') ||
    lowerMessage.includes('verification')
  ) {
    return "Please check your email and confirm your account before signing in."
  }

  // User already exists
  if (
    lowerMessage.includes('user already registered') ||
    lowerMessage.includes('already registered') ||
    lowerMessage.includes('email already exists')
  ) {
    return "An account with this email already exists. Try signing in instead."
  }

  // Weak password
  if (
    lowerMessage.includes('password') && (
      lowerMessage.includes('weak') ||
      lowerMessage.includes('too short') ||
      lowerMessage.includes('minimum')
    )
  ) {
    return "Password must be at least 6 characters long."
  }

  // Invalid email format
  if (
    lowerMessage.includes('invalid email') ||
    lowerMessage.includes('email format') ||
    lowerMessage.includes('valid email')
  ) {
    return "Please enter a valid email address."
  }

  // Rate limiting
  if (
    lowerMessage.includes('too many requests') ||
    lowerMessage.includes('rate limit') ||
    lowerMessage.includes('too many attempts')
  ) {
    return "Too many attempts. Please wait a moment and try again."
  }

  // Network errors
  if (
    lowerMessage.includes('network') ||
    lowerMessage.includes('fetch') ||
    lowerMessage.includes('connection') ||
    lowerMessage.includes('timeout')
  ) {
    return "Network error. Please check your connection and try again."
  }

  // Session expired
  if (
    lowerMessage.includes('session') ||
    lowerMessage.includes('expired') ||
    lowerMessage.includes('token')
  ) {
    return "Your session has expired. Please sign in again."
  }

  // Return original message if no pattern matches (but clean it up)
  return message.charAt(0).toUpperCase() + message.slice(1)
}

/**
 * Parse error code for common Supabase error codes
 */
function parseErrorCode(code: string): string {
  const codeMap: Record<string, string> = {
    // Auth errors
    'invalid_credentials': "Invalid email or password. Please check your credentials and try again.",
    'email_not_confirmed': "Please check your email and confirm your account before signing in.",
    'signup_disabled': "New account registration is currently disabled.",
    'email_address_not_authorized': "This email address is not authorized to sign up.",
    'weak_password': "Password is too weak. Please use a stronger password.",
    'user_already_registered': "An account with this email already exists. Try signing in instead.",
    
    // Rate limiting
    'too_many_requests': "Too many attempts. Please wait a moment and try again.",
    
    // Network/server errors
    'network_error': "Network error. Please check your connection and try again.",
    'service_unavailable': "Service temporarily unavailable. Please try again later.",
  }

  return codeMap[code] || `Error code: ${code}`
}

/**
 * Get error title based on error type
 */
export function getAuthErrorTitle(error: any): string {
  if (!error) return "Error"

  const message = typeof error === 'string' 
    ? error 
    : error.message || ''
  
  const lowerMessage = message.toLowerCase()

  if (
    lowerMessage.includes('invalid') ||
    lowerMessage.includes('wrong') ||
    lowerMessage.includes('incorrect')
  ) {
    return "Sign in failed"
  }

  if (lowerMessage.includes('email not confirmed') || lowerMessage.includes('verification')) {
    return "Email confirmation required"
  }

  if (lowerMessage.includes('already registered') || lowerMessage.includes('already exists')) {
    return "Account exists"
  }

  if (lowerMessage.includes('password') && (lowerMessage.includes('weak') || lowerMessage.includes('short'))) {
    return "Password too weak"
  }

  if (lowerMessage.includes('too many') || lowerMessage.includes('rate limit')) {
    return "Too many attempts"
  }

  if (lowerMessage.includes('network') || lowerMessage.includes('connection')) {
    return "Connection error"
  }

  return "Error"
}

