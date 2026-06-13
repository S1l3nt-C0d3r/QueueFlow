/**
 * Table Management and Matching Utilities
 */

export interface Table {
  id: string;
  tableNumber: number;
  capacity: number;
  occupied: boolean;
  occupiedBy?: string; // entryId of the party at this table
  x?: number; // coordinates for visualization
  y?: number;
  createdAt?: string;
}

export interface TableLayout {
  restaurantId: string;
  tables: Table[];
  gridWidth?: number;
  gridHeight?: number;
  updatedAt: string;
}

/**
 * Check if two tables are adjacent based on their coordinates
 */
export function areTableAdjacent(table1: Table, table2: Table): boolean {
  if (!table1.x || !table1.y || !table2.x || !table2.y) return false;
  
  const xDiff = Math.abs(table1.x - table2.x);
  const yDiff = Math.abs(table1.y - table2.y);
  
  // Adjacent if they're one unit apart horizontally or vertically
  return (xDiff === 1 && yDiff === 0) || (xDiff === 0 && yDiff === 1);
}

/**
 * Get all tables adjacent to a given table
 */
export function getAdjacentTables(table: Table, allTables: Table[]): Table[] {
  return allTables.filter(t => t.id !== table.id && areTableAdjacent(table, t));
}

/**
 * Find suitable table(s) for a party
 * Returns:
 * - Single table if exact match or capacity within +2
 * - Array of two adjacent tables if party needs combined capacity
 * - null if no suitable table(s) available
 */
export function findSuitableTable(
  partySize: number,
  tables: Table[]
): Table | Table[] | null {
  // Get all free tables
  const freeTables = tables.filter(t => !t.occupied);
  
  if (freeTables.length === 0) return null;

  // First, try to find a single table with exact match or within +2
  for (const table of freeTables) {
    if (table.capacity >= partySize && table.capacity <= partySize + 2) {
      return table;
    }
  }

  // If no single table works, try to combine adjacent tables
  for (const table1 of freeTables) {
    const adjacentTables = getAdjacentTables(table1, freeTables);
    
    for (const table2 of adjacentTables) {
      const combinedCapacity = table1.capacity + table2.capacity;
      
      // Check if combined capacity works
      if (combinedCapacity >= partySize && combinedCapacity <= partySize + 2) {
        // Return the pair in order
        return [table1, table2].sort((a, b) => a.id.localeCompare(b.id));
      }
    }
  }

  return null;
}

/**
 * Check if a party is suitable for the given table(s)
 */
export function isPartySuitableForTable(partySize: number, table: Table | Table[]): boolean {
  const tables = Array.isArray(table) ? table : [table];
  const totalCapacity = tables.reduce((sum, t) => sum + t.capacity, 0);
  
  return totalCapacity >= partySize && totalCapacity <= partySize + 2;
}

/**
 * Get all free adjacent tables to combine for a party
 */
export function getFreeCombinedTables(partySize: number, allTables: Table[]): Table[] | null {
  const freeTables = allTables.filter(t => !t.occupied);
  
  // Try all pairs of adjacent tables
  for (const table1 of freeTables) {
    const adjacentFree = getAdjacentTables(table1, freeTables);
    
    for (const table2 of adjacentFree) {
      const combined = [table1, table2];
      const totalCapacity = combined.reduce((sum, t) => sum + t.capacity, 0);
      
      if (totalCapacity >= partySize && totalCapacity <= partySize + 2) {
        return combined;
      }
    }
  }
  
  return null;
}

/**
 * Calculate distances between tables for adjacency visualization
 */
export function calculateDistance(table1: Table, table2: Table): number {
  if (!table1.x || !table1.y || !table2.x || !table2.y) return Infinity;
  return Math.sqrt(Math.pow(table1.x - table2.x, 2) + Math.pow(table1.y - table2.y, 2));
}
