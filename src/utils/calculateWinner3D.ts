export type SquareValue = 'X' | 'O' | null;
export type CubeValue = SquareValue[][][];

export const calculateWinner = (cube: CubeValue): { winner: SquareValue; line: number[][] | null } => {
  const directions = [
    // Straight lines
    { dx: 1, dy: 0, dz: 0 }, // X-axis
    { dx: 0, dy: 1, dz: 0 }, // Y-axis
    { dx: 0, dy: 0, dz: 1 }, // Z-axis

    // Diagonals within planes
    { dx: 1, dy: 1, dz: 0 }, // XY-plane
    { dx: 1, dy: -1, dz: 0 }, // XY-plane (anti-diagonal)
    { dx: 1, dy: 0, dz: 1 }, // XZ-plane
    { dx: 0, dy: 1, dz: 1 }, // YZ-plane

    // Diagonals across layers
    { dx: 1, dy: 1, dz: 1 }, // XYZ diagonal
    { dx: 1, dy: -1, dz: 1 }, // XYZ anti-diagonal
  ];

  for (let x = 0; x < 4; x++) {
    for (let y = 0; y < 4; y++) {
      for (let z = 0; z < 4; z++) {
        const currentValue = cube[x][y][z];
        if (!currentValue) continue; // Skip empty cells

        for (const { dx, dy, dz } of directions) {
          const line = [[x, y, z]];
          let isWinningLine = true;

          for (let step = 1; step < 4; step++) {
            const nx = x + dx * step;
            const ny = y + dy * step;
            const nz = z + dz * step;

            // Check bounds and value consistency
            if (
              nx < 0 || nx >= 4 ||
              ny < 0 || ny >= 4 ||
              nz < 0 || nz >= 4 ||
              cube[nx][ny][nz] !== currentValue
            ) {
              isWinningLine = false;
              break;
            }

            line.push([nx, ny, nz]);
          }

          if (isWinningLine && line.length === 4) { // Ensure the line has exactly 4 cells
            return { winner: currentValue, line };
          }
        }
      }
    }
  }

  return { winner: null, line: null };
};
