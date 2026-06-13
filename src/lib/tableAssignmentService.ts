import { db } from './firebase';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Table, findSuitableTable, isPartySuitableForTable } from './tableUtils';

/**
 * Check if a party can be seated at suitable table(s) and notify them
 */
export async function checkAndAssignTableToParty(
  restaurantId: string,
  entryId: string,
  partySize: number,
  tables: Table[]
) {
  try {
    const suitableTable = findSuitableTable(partySize, tables);
    
    if (!suitableTable) {
      console.log(`No suitable table found for party of ${partySize}`);
      return {
        success: false,
        assigned: false,
        reason: 'no_suitable_table',
        message: 'No suitable table found. Waiting for more tables to free up.'
      };
    }

    // Update the queue entry to mark it as ready to be seated
    const entryRef = doc(db, 'restaurants', restaurantId, 'queue', entryId);
    
    await updateDoc(entryRef, {
      assignedTables: Array.isArray(suitableTable) ? suitableTable.map(t => t.id) : [suitableTable.id],
      readyToNotify: true,
      notificationPreparedAt: new Date().toISOString()
    });

    return {
      success: true,
      assigned: true,
      tables: Array.isArray(suitableTable) ? suitableTable : [suitableTable],
      message: `Party of ${partySize} can be seated at ${Array.isArray(suitableTable) ? 'combined tables' : `Table ${(suitableTable as Table).tableNumber}`}`
    };
  } catch (err) {
    console.error('Error assigning table:', err);
    return {
      success: false,
      assigned: false,
      reason: 'error',
      message: 'Error checking table availability'
    };
  }
}

/**
 * Find all waiting parties that can fit at the newly freed table(s)
 */
export async function findPartiesForTables(
  restaurantId: string,
  tables: Table[]
): Promise<Array<{ entryId: string; customerName: string; partySize: number; suitableTable: Table | Table[] }>> {
  try {
    // Get all waiting entries
    const q = query(
      collection(db, 'restaurants', restaurantId, 'queue'),
      where('status', '==', 'waiting')
    );

    const snapshot = await getDocs(q);
    const suitableParties: Array<{ entryId: string; customerName: string; partySize: number; suitableTable: Table | Table[] }> = [];

    for (const doc of snapshot.docs) {
      const entry = doc.data();
      const suitableTable = findSuitableTable(entry.partySize, tables);

      if (suitableTable) {
        suitableParties.push({
          entryId: doc.id,
          customerName: entry.customerName,
          partySize: entry.partySize,
          suitableTable
        });
      }
    }

    return suitableParties;
  } catch (err) {
    console.error('Error finding parties for tables:', err);
    return [];
  }
}

/**
 * Automatically notify the next suitable party when tables are freed
 */
export async function autoNotifyNextParty(
  restaurantId: string,
  tables: Table[]
) {
  try {
    const suitableParties = await findPartiesForTables(restaurantId, tables);

    if (suitableParties.length === 0) {
      return {
        success: true,
        notified: false,
        reason: 'no_suitable_parties',
        message: 'No suitable parties waiting'
      };
    }

    // Get the first suitable party (earliest in queue)
    const party = suitableParties[0];
    const claimExpiresAt = new Date();
    claimExpiresAt.setMinutes(claimExpiresAt.getMinutes() + 5);

    const entryRef = doc(db, 'restaurants', restaurantId, 'queue', party.entryId);

    await updateDoc(entryRef, {
      status: 'notified',
      notifiedAt: new Date().toISOString(),
      claimExpiresAt: claimExpiresAt.toISOString(),
      assignedTables: Array.isArray(party.suitableTable) 
        ? party.suitableTable.map(t => t.id) 
        : [party.suitableTable.id]
    });

    return {
      success: true,
      notified: true,
      party: {
        name: party.customerName,
        partySize: party.partySize,
        tables: Array.isArray(party.suitableTable) ? party.suitableTable : [party.suitableTable]
      },
      message: `Notified ${party.customerName} for party of ${party.partySize}`
    };
  } catch (err) {
    console.error('Error auto-notifying party:', err);
    return {
      success: false,
      notified: false,
      reason: 'error',
      message: 'Error notifying party'
    };
  }
}

/**
 * Mark specific tables as occupied by a party
 */
export async function occupyTables(
  restaurantId: string,
  tableIds: string[],
  entryId: string,
  allTables: Table[]
) {
  try {
    const updatedTables = allTables.map(t => 
      tableIds.includes(t.id)
        ? { ...t, occupied: true, occupiedBy: entryId }
        : t
    );

    const tableLayoutRef = doc(db, 'restaurants', restaurantId, 'settings', 'tableLayout');
    
    await updateDoc(tableLayoutRef, {
      tables: updatedTables,
      updatedAt: new Date().toISOString()
    });

    return {
      success: true,
      message: `${tableIds.length} table(s) marked as occupied`
    };
  } catch (err) {
    console.error('Error occupying tables:', err);
    return {
      success: false,
      message: 'Error occupying tables'
    };
  }
}

/**
 * Free tables when party leaves
 */
export async function freeTables(
  restaurantId: string,
  tableIds: string[],
  allTables: Table[]
) {
  try {
    const updatedTables = allTables.map(t => 
      tableIds.includes(t.id)
        ? { ...t, occupied: false, occupiedBy: undefined }
        : t
    );

    const tableLayoutRef = doc(db, 'restaurants', restaurantId, 'settings', 'tableLayout');
    
    await updateDoc(tableLayoutRef, {
      tables: updatedTables,
      updatedAt: new Date().toISOString()
    });

    return {
      success: true,
      message: `${tableIds.length} table(s) marked as free`
    };
  } catch (err) {
    console.error('Error freeing tables:', err);
    return {
      success: false,
      message: 'Error freeing tables'
    };
  }
}
