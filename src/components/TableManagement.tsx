import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Plus, Trash2, Grid3X3, Save, X, Edit2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { Table, TableLayout } from '../lib/tableUtils';

interface TableManagementProps {
  restaurantId: string;
}

export default function TableManagement({ restaurantId }: TableManagementProps) {
  const [tables, setTables] = useState<Table[]>([]);
  const [gridWidth, setGridWidth] = useState(8);
  const [gridHeight, setGridHeight] = useState(8);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingTable, setEditingTable] = useState<string | null>(null);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newCapacity, setNewCapacity] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const loadTables = async () => {
      try {
        const tableLayoutDoc = await getDoc(doc(db, 'restaurants', restaurantId, 'settings', 'tableLayout'));
        if (tableLayoutDoc.exists()) {
          const data = tableLayoutDoc.data() as TableLayout;
          setTables(data.tables || []);
          setGridWidth(data.gridWidth || 8);
          setGridHeight(data.gridHeight || 8);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error loading table layout:', err);
        setLoading(false);
      }
    };
    
    loadTables();
  }, [restaurantId]);

  const handleAddTable = async () => {
    if (!newTableNumber || !newCapacity) return;
    
    const newTable: Table = {
      id: `table-${Date.now()}`,
      tableNumber: parseInt(newTableNumber),
      capacity: parseInt(newCapacity),
      occupied: false,
      createdAt: new Date().toISOString()
    };
    
    setTables([...tables, newTable]);
    setNewTableNumber('');
    setNewCapacity('');
    setShowForm(false);
  };

  const handleDeleteTable = (id: string) => {
    setTables(tables.filter(t => t.id !== id));
  };

  const handleUpdateTable = (id: string, field: string, value: any) => {
    setTables(tables.map(t => 
      t.id === id ? { ...t, [field]: value } : t
    ));
  };

  const handlePositionTable = (id: string, x: number, y: number) => {
    setTables(tables.map(t => 
      t.id === id ? { ...t, x, y } : t
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const tableLayout: TableLayout = {
        restaurantId,
        tables,
        gridWidth,
        gridHeight,
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'restaurants', restaurantId, 'settings', 'tableLayout'), tableLayout);
      setEditingTable(null);
    } catch (err) {
      console.error('Error saving table layout:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading table layout...</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-display font-bold text-white flex items-center gap-3">
            <Grid3X3 className="h-6 w-6 text-blue-400" />
            Restaurant Layout
          </h3>
          <p className="text-white/50 text-sm mt-2">Configure tables, seating capacity, and layout</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          Save Layout
        </button>
      </div>

      {/* Grid Configuration */}
      <div className="glass-morphism p-6 rounded-2xl space-y-6">
        <h4 className="font-bold text-white/80">Grid Configuration</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-white/60 block mb-2">Grid Width</label>
            <input
              type="number"
              min="4"
              max="20"
              value={gridWidth}
              onChange={(e) => setGridWidth(parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white"
            />
          </div>
          <div>
            <label className="text-sm text-white/60 block mb-2">Grid Height</label>
            <input
              type="number"
              min="4"
              max="20"
              value={gridHeight}
              onChange={(e) => setGridHeight(parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white"
            />
          </div>
        </div>
      </div>

      {/* Table Grid Visualization */}
      <div className="glass-morphism p-8 rounded-2xl">
        <h4 className="font-bold text-white/80 mb-6">Table Layout</h4>
        <div 
          className="grid gap-2 bg-white/[0.02] p-6 rounded-xl border border-white/10"
          style={{
            gridTemplateColumns: `repeat(${gridWidth}, minmax(0, 1fr))`,
            minHeight: '400px'
          }}
        >
          {Array.from({ length: gridWidth * gridHeight }).map((_, idx) => {
            const x = idx % gridWidth;
            const y = Math.floor(idx / gridWidth);
            const table = tables.find(t => t.x === x && t.y === y);
            
            return (
              <div
                key={`cell-${x}-${y}`}
                className="aspect-square border border-white/10 rounded-lg flex items-center justify-center bg-white/[0.02] hover:bg-white/5 cursor-pointer transition-colors relative group"
                onClick={() => {
                  if (!table) {
                    setEditingTable(`new-${x}-${y}`);
                    setNewTableNumber('');
                    setNewCapacity('');
                  }
                }}
              >
                {table ? (
                  <div className="text-center w-full h-full flex flex-col items-center justify-center">
                    <div 
                      className="bg-gradient-to-br from-purple-500 to-blue-600 text-white rounded-lg p-2 text-xs font-bold text-center min-w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTable(table.id);
                      }}
                    >
                      <div className="font-display text-sm">T{table.tableNumber}</div>
                      <div className="text-[10px] opacity-90">{table.capacity}p</div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTable(table.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-0.5 right-0.5 p-1 bg-red-500/20 rounded border border-red-500/30 text-red-400 hover:bg-red-500/30"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="text-[10px] text-white/20 font-mono">({x},{y})</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tables List */}
      <div className="glass-morphism p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-bold text-white/80 flex items-center gap-2">
            <span>Tables ({tables.length})</span>
          </h4>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingTable(null);
            }}
            className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-xl hover:bg-blue-500/30 transition-all flex items-center gap-2 text-sm font-bold"
          >
            <Plus className="h-4 w-4" />
            Add Table
          </button>
        </div>

        {showForm && (
          <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-white/60 block mb-2">Table Number</label>
                <input
                  type="number"
                  value={newTableNumber}
                  onChange={(e) => setNewTableNumber(e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white"
                  placeholder="e.g., 1"
                />
              </div>
              <div>
                <label className="text-sm text-white/60 block mb-2">Capacity</label>
                <input
                  type="number"
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white"
                  placeholder="e.g., 4"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddTable}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-all"
              >
                Add
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl font-bold hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {tables
            .sort((a, b) => a.tableNumber - b.tableNumber)
            .map(table => (
              <div
                key={table.id}
                className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="bg-gradient-to-br from-purple-500 to-blue-600 text-white rounded-lg px-3 py-1 font-display font-bold min-w-12 text-center">
                    T{table.tableNumber}
                  </div>
                  <div>
                    <p className="text-white font-medium">Table {table.tableNumber}</p>
                    <p className="text-white/50 text-sm">{table.capacity} seats</p>
                  </div>
                  {table.x !== undefined && table.y !== undefined && (
                    <p className="text-white/40 text-sm ml-auto">Position: ({table.x}, {table.y})</p>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteTable(table.id)}
                  className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-all border border-transparent hover:border-red-500/30"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
