/**
 * 3D Tic Tac Toe Win Set Generator
 * Generates all 49 winning combinations for a 3x3x3 cube:
 * - 27 straight lines (9 rows + 9 columns + 9 pillars)
 * - 18 planar diagonals (6 per XY, XZ, YZ planes)
 * - 4 space diagonals (corner to corner through center)
 */

/**
 * Generate all 49 winning combinations for 3D tic tac toe
 * @returns {string[][]} Array of 49 win sets, each containing 3 cell IDs
 */
export const generate3DWinSets = () => {
  const sets = []

  // 1. Straight lines (27 total)
  // Lines parallel to each axis through all 9 positions
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      // X-axis lines (rows)
      sets.push([[0, i, j], [1, i, j], [2, i, j]])
      // Y-axis lines (columns)
      sets.push([[i, 0, j], [i, 1, j], [i, 2, j]])
      // Z-axis lines (pillars)
      sets.push([[i, j, 0], [i, j, 1], [i, j, 2]])
    }
  }

  // 2. Planar diagonals (18 total)
  // Diagonals on each of the 9 planes (3 per axis)

  // XY planes (z constant) - 6 diagonals
  for (let z = 0; z < 3; z++) {
    sets.push([[0, 0, z], [1, 1, z], [2, 2, z]]) // Main diagonal
    sets.push([[2, 0, z], [1, 1, z], [0, 2, z]]) // Anti-diagonal
  }

  // XZ planes (y constant) - 6 diagonals
  for (let y = 0; y < 3; y++) {
    sets.push([[0, y, 0], [1, y, 1], [2, y, 2]]) // Main diagonal
    sets.push([[2, y, 0], [1, y, 1], [0, y, 2]]) // Anti-diagonal
  }

  // YZ planes (x constant) - 6 diagonals
  for (let x = 0; x < 3; x++) {
    sets.push([[x, 0, 0], [x, 1, 1], [x, 2, 2]]) // Main diagonal
    sets.push([[x, 2, 0], [x, 1, 1], [x, 0, 2]]) // Anti-diagonal
  }

  // 3. Space diagonals (4 total)
  // Corner to corner through the center of the cube
  sets.push([[0, 0, 0], [1, 1, 1], [2, 2, 2]]) // (0,0,0) to (2,2,2)
  sets.push([[2, 0, 0], [1, 1, 1], [0, 2, 2]]) // (2,0,0) to (0,2,2)
  sets.push([[0, 2, 0], [1, 1, 1], [2, 0, 2]]) // (0,2,0) to (2,0,2)
  sets.push([[0, 0, 2], [1, 1, 1], [2, 2, 0]]) // (0,0,2) to (2,2,0)

  // Convert coordinates to cell ID format: 'c0-0-0' through 'c2-2-2'
  return sets.map(set =>
    set.map(([x, y, z]) => `c${x}-${y}-${z}`)
  )
}
