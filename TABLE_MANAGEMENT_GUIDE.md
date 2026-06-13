# Table Management System Documentation

## Overview

The QueueFlow table management system enables restaurant owners to configure their dining layout and provides waiters/receptionists with an intelligent system to manage table availability and automatically seat customers.

## Key Features

### 1. **Restaurant Owner Setup (Admin Panel)**
- Configure restaurant layout with table numbers and seating capacity
- Set up grid-based table positioning for easy visualization
- Define which tables are adjacent to each other

### 2. **Intelligent Party-to-Table Matching**
- Matches party size with available table capacity
- Exact match or up to +2 people allowance
- Automatically combines adjacent tables when a single table isn't suitable
- Waits for multiple tables to free up simultaneously before notifying customers

### 3. **Waiter/Receptionist Management**
- Mark specific tables as free when customers leave
- View real-time table occupancy status
- See which waiting customers can be seated at freed tables
- Get automatic notifications when suitable tables are available

## How to Use

### Setting Up Tables (Owner/Manager)

1. **Access Admin Panel**
   - Navigate to QueueFlow Admin
   - Click on your restaurant
   - Click "Tables" tab

2. **Configure Grid Layout**
   - Set Grid Width and Height (represents your restaurant floor)
   - Adjust based on your actual restaurant size

3. **Add Tables**
   - Click "Add Table" button
   - Enter table number (e.g., 1, 2, 3)
   - Enter capacity (number of seats)
   - Tables will appear on the grid

4. **Position Tables**
   - Click on any cell in the grid to place a table
   - Position tables to reflect your actual floor layout
   - Adjacent tables in the grid will be considered "combinable"

5. **Save Layout**
   - Click "Save Layout" to persist your configuration

### Managing Tables (Waiter)

1. **Navigate to Tables Tab**
   - From Waiter View, click "Tables" tab

2. **View Table Status**
   - Red boxes with table numbers = Occupied
   - Empty cells = Available for seating

3. **Free a Table**
   - Click on an occupied table to mark it as free
   - System automatically:
     - Updates table status
     - Checks waiting customers
     - Notifies next suitable party if they fit

4. **See Suitable Customers**
   - After freeing a table, see which customers can be seated
   - Shows party names and sizes
   - Displays which tables they'll be assigned to

### Managing from Reception (Receptionist)

1. **Navigate to Tables Tab**
   - From Receptionist View, click "Tables" tab

2. **Same features as Waiter**
   - View table occupancy
   - Free tables when customers leave
   - See which customers should be notified next

## Party-to-Table Matching Algorithm

### Primary Logic

1. **Single Table Match**
   - If a party's size ≤ table capacity ≤ party size + 2
   - Customer is seated immediately

2. **Exact Capacity Match**
   - If multiple tables fit exactly, any can be used
   - System picks the first available

3. **Adjacent Table Combination**
   - If no single table fits
   - System looks for 2+ adjacent free tables
   - Combined capacity must be within range: capacity ≥ party size and capacity ≤ party size + 2

4. **Waiting Logic**
   - If no tables (single or combined) match the party size
   - Customer remains in waiting queue
   - When another table frees up, system checks again
   - Automatic notification sent when suitable seating appears

### Example Scenarios

**Scenario 1: Exact Match**
- Party of 4 arrives
- Table 5 has capacity of 4
- System immediately notifies and seats them

**Scenario 2: +2 Buffer**
- Party of 4 arrives
- Table 2 has capacity of 5 (4 ≤ 5 ≤ 6) ✓
- System seats them at Table 2

**Scenario 3: Combined Tables**
- Party of 6 arrives
- No single table available
- Tables 3 & 4 (both capacity 4, adjacent) = 8 seats
- 6 ≤ 8 ≤ 8 ✓
- System combines and assigns both tables

**Scenario 4: Must Wait**
- Party of 8 arrives
- Table 5 (capacity 6) too small
- Tables 3 & 4 (combined 8) occupied
- Party stays in queue until suitable seating available
- System auto-notifies when they free up

## Workflow

### Standard Service Flow

```
1. Customer joins queue → Queue shows "P{partySize}"
2. Waiter marks table free → Table status updates
3. System checks all waiting customers
4. First suitable match found → Customer status changes to "notified"
5. Customer comes to host stand
6. Receptionist clicks "Seat" → Customer seated
7. Queue updates, next customer ready for notification
```

### Multi-Table Service Flow

```
1. Party of 6 arrives, no single table available
2. Receptionist sees: "Waiting for adjacent tables"
3. One table frees → Still no match
4. Another adjacent table frees → Now have 8 seats available
5. Party of 6 automatically notified
6. Can be seated at combined tables
```

## Important Notes

### Table Positioning
- Tables directly next to each other (horizontally or vertically) are considered adjacent
- Diagonal tables are NOT considered adjacent
- This affects which table combinations are possible

### Automatic Notifications
- When a table is freed, the system automatically checks all waiting customers
- The first customer(s) in queue that fit are notified
- Notifications have a 5-minute claim time

### Occupied Tracking
- Tables show as occupied when waiter marks them as such
- System tracks which party is at which table
- When table is freed, occupation is cleared

### Best Practices

1. **Layout Configuration**
   - Arrange tables on grid to match actual layout
   - Keep frequently combined tables adjacent
   - Use symmetrical layouts when possible

2. **During Service**
   - Mark tables as free promptly when customers leave
   - Check notified customers before freeing tables
   - Use both Waiter and Receptionist views for efficiency

3. **Customer Communication**
   - System notifies suitable customers automatically
   - Clear notification provides table assignment
   - 5-minute window for customer to acknowledge

## Troubleshooting

### No Customers Being Notified
- Check if any suitable customers are in waiting queue
- Verify table layout is saved
- Ensure table capacities are realistic

### Customers Staying in Queue Too Long
- May need to combine tables
- Check if adjacent tables are actually positioned adjacent
- Consider table layout optimization

### Table Layout Not Saving
- Ensure you click "Save Layout" button
- Check Firestore permissions
- Verify restaurantId is correct

## Data Structure

Tables are stored in Firestore under:
```
restaurants/{restaurantId}/settings/tableLayout
{
  tables: [
    {
      id: string,
      tableNumber: number,
      capacity: number,
      occupied: boolean,
      occupiedBy: string (optional),
      x: number,
      y: number
    }
  ],
  gridWidth: number,
  gridHeight: number,
  updatedAt: timestamp
}
```

Queue entries are enhanced with:
```
{
  ...existing fields,
  assignedTables: string[], // Array of table IDs
  readyToNotify: boolean
}
```
