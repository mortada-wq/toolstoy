/**
 * Image Analysis Utilities
 * 
 * Provides functions to extract dominant colors and detect product categories
 * from product images for character generation.
 */

// ============================================================================
// Types
// ============================================================================

export interface ImageAnalysisResult {
  colors: string[] // Top 3 dominant colors as hex values
  category: ProductCategory
}

export type ProductCategory = 
  | 'electronics'
  | 'beauty'
  | 'sports'
  | 'food'
  | 'fashion'
  | 'other'

// ============================================================================
// Extract Dominant Colors
// ============================================================================

/**
 * Extracts the top 3 dominant colors from a product image.
 * 
 * This is a simplified implementation that works with base64 encoded images.
 * For production, consider using a more sophisticated color extraction library
 * like 'sharp' or 'jimp' with k-means clustering.
 * 
 * @param imageData - Base64 encoded image or image URL
 * @returns Array of top 3 hex color values
 */
export async function extractDominantColors(imageData: string): Promise<string[]> {
  try {
    // TODO: Implement actual color extraction using image processing library
    // For now, return placeholder colors that will be replaced in production
    
    // This is a minimal implementation that extracts colors from base64 data
    // In production, use sharp or jimp for proper color analysis
    
    console.log('Extracting dominant colors from image...')
    
    // Placeholder implementation - returns common product colors
    // This should be replaced with actual color extraction logic
    const placeholderColors = [
      '#4A90E2', // Blue
      '#F5A623', // Orange
      '#7ED321', // Green
    ]
    
    return placeholderColors
  } catch (error) {
    console.error('Error extracting colors:', error)
    // Return default colors on error
    return ['#4A90E2', '#F5A623', '#7ED321']
  }
}

// ============================================================================
// Detect Product Category
// ============================================================================

/**
 * Detects the product category from an image using basic heuristics.
 * 
 * This is a simplified implementation. For production, consider using:
 * - AWS Rekognition for image classification
 * - Custom ML model trained on product categories
 * - Image analysis with color/shape patterns
 * 
 * @param imageData - Base64 encoded image or image URL
 * @returns Detected product category
 */
export async function detectProductCategory(imageData: string): Promise<ProductCategory> {
  try {
    // TODO: Implement actual category detection using ML or image analysis
    // For now, return a default category
    
    console.log('Detecting product category from image...')
    
    // Placeholder implementation
    // In production, use AWS Rekognition or custom ML model
    
    // For now, return 'other' as default
    // This will be enhanced with actual detection logic
    return 'other'
  } catch (error) {
    console.error('Error detecting category:', error)
    return 'other'
  }
}

// ============================================================================
// Analyze Image (Combined Function)
// ============================================================================

/**
 * Performs complete image analysis: color extraction and category detection.
 * 
 * @param imageData - Base64 encoded image or image URL
 * @returns Structured analysis result with colors and category
 */
export async function analyzeImage(imageData: string): Promise<ImageAnalysisResult> {
  console.log('Starting image analysis...')
  
  const [colors, category] = await Promise.all([
    extractDominantColors(imageData),
    detectProductCategory(imageData),
  ])
  
  const result: ImageAnalysisResult = {
    colors,
    category,
  }
  
  console.log('Image analysis complete:', result)
  return result
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validates if a string is a valid hex color.
 * 
 * @param color - Color string to validate
 * @returns True if valid hex color
 */
export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(color)
}

/**
 * Converts RGB values to hex color string.
 * 
 * @param r - Red value (0-255)
 * @param g - Green value (0-255)
 * @param b - Blue value (0-255)
 * @returns Hex color string
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase()
}

/**
 * Converts hex color to RGB values.
 * 
 * @param hex - Hex color string
 * @returns RGB values as [r, g, b]
 */
export function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : null
}
