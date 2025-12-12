/**
 * 3D Tic Tac Toe Cell Coordinate Utilities
 * Converts between 3D coordinates (x, y, z) and cell IDs
 */

/**
 * Convert 3D coordinates to cell ID string
 * @param {number} x - X coordinate (0-2)
 * @param {number} y - Y coordinate (0-2)
 * @param {number} z - Z coordinate (0-2)
 * @returns {string} Cell ID in format 'c0-0-0' through 'c2-2-2'
 */
export const coordsToId = (x, y, z) => `c${x}-${y}-${z}`

/**
 * Convert cell ID string to 3D coordinates
 * @param {string} id - Cell ID in format 'c0-0-0'
 * @returns {number[]} Array of [x, y, z] coordinates
 */
export const idToCoords = (id) => id.slice(1).split('-').map(Number)

/**
 * Validate if a cell ID is in the correct format
 * @param {string} id - Cell ID to validate
 * @returns {boolean} True if valid 3D cell ID
 */
export const isValidCell = (id) => /^c[0-2]-[0-2]-[0-2]$/.test(id)
