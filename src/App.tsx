import { useState, useCallback, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { WheelCanvas } from '@/components/WheelCanvas';
import { ItemEditor } from '@/components/ItemEditor';
import { QuestionModal } from '@/components/QuestionModal';
import { SpeedSelector } from '@/components/SpeedSelector';
import { ExportImport } from '@/components/ExportImport';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { WheelItem, WheelConfig, SpinSpeed } from '@/types/wheel';
import { generateId, STORAGE_KEY } from '@/lib/wheelUtils';
import './App.css';

const DEFAULT_WHEEL: WheelConfig = {
  id: generateId(),
  name: 'Wheel Of Pain',
  items: [],
};

function App() {
  const [wheelConfig, setWheelConfig] = useLocalStorage<WheelConfig>(
    STORAGE_KEY,
    DEFAULT_WHEEL
  );
  const [removedIds, setRemovedIds] = useLocalStorage<string[]>(
    'wheel-removed-ids',
    []
  );
  const [speed, setSpeed] = useLocalStorage<SpinSpeed>('wheel-speed', 'medium');
  const [selectedItem, setSelectedItem] = useState<WheelItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [lastCompletedTask, setLastCompletedTask] = useState<string | null>(null);

  const activeItems = useMemo(
    () => wheelConfig.items.filter((item) => !removedIds.includes(item.id)),
    [wheelConfig.items, removedIds]
  );

  const removedCount = removedIds.filter((id) =>
    wheelConfig.items.some((item) => item.id === id)
  ).length;

  const totalCount = wheelConfig.items.length;
  const progressPercent = totalCount > 0 ? Math.round((removedCount / totalCount) * 100) : 0;

  const handleSpinComplete = useCallback((item: WheelItem) => {
    setSelectedItem(item);
    setModalOpen(true);
  }, []);

  const handleItemsChange = useCallback(
    (items: WheelItem[]) => {
      setWheelConfig((prev) => ({
        ...prev,
        items,
      }));
    },
    [setWheelConfig]
  );

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setWheelConfig((prev) => ({
        ...prev,
        name: e.target.value,
      }));
    },
    [setWheelConfig]
  );

  const handleRemoveItem = useCallback(
    (id: string) => {
      const item = wheelConfig.items.find((i) => i.id === id);
      if (item) {
        setLastCompletedTask(item.question);
      }
      setRemovedIds((prev) => [...prev, id]);
    },
    [setRemovedIds, wheelConfig.items]
  );

  const handleKeepItem = useCallback(() => {
    // Item stays on wheel, just close modal
  }, []);

  const handleRestoreAll = useCallback(() => {
    setRemovedIds([]);
    setLastCompletedTask(null);
  }, [setRemovedIds]);

  const handleImport = useCallback(
    (config: WheelConfig) => {
      setWheelConfig(config);
      setRemovedIds([]);
    },
    [setWheelConfig, setRemovedIds]
  );

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-left">
          <Label htmlFor="wheel-name" className="sr-only">
            Wheel Name
          </Label>
          <Input
            id="wheel-name"
            value={wheelConfig.name}
            onChange={handleNameChange}
            className="text-xl font-semibold border-none shadow-none focus-visible:ring-0 p-0 h-auto bg-transparent"
            placeholder="Name your wheel..."
          />
        </div>
        <div className="header-right">
          <SpeedSelector value={speed} onChange={setSpeed} />
        </div>
      </header>

      <main className="app-main">
        <div className="wheel-section">
          <WheelCanvas
            items={activeItems}
            speed={speed}
            onSpinComplete={handleSpinComplete}
            completedCount={removedCount}
            lastCompletedTask={lastCompletedTask ?? undefined}
            onRestart={handleRestoreAll}
          />
        </div>

        <div className="sidebar">
          {/* Stats Cards */}
          <div className="stats-bar">
            <div className="stat-card cyan">
              <span className="label">Remaining</span>
              <span className="value">{activeItems.length}</span>
            </div>
            <div className="stat-card magenta">
              <span className="label">Completed</span>
              <span className="value">{removedCount}</span>
            </div>
          </div>

          {/* Progress Bar */}
          {totalCount > 0 && (
            <div className="progress-section">
              <div className="progress-header">
                <span className="title">Session Progress</span>
                <span className="percentage">{progressPercent}%</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Questions Editor */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 flex-1 min-h-0 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Questions</h2>
              {removedCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRestoreAll}
                  className="text-[#3498db] hover:text-[#3498db] hover:bg-[#3498db]/10 text-xs font-semibold"
                >
                  Restore All
                </Button>
              )}
            </div>

            <ItemEditor
              items={wheelConfig.items}
              onChange={handleItemsChange}
            />

            <div className="mt-5 pt-4 border-t border-[#2a2a2a] shrink-0">
              <ExportImport wheelConfig={wheelConfig} onImport={handleImport} />
            </div>
          </div>
        </div>
      </main>

      <QuestionModal
        item={selectedItem}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onRemove={handleRemoveItem}
        onKeep={handleKeepItem}
      />
    </div>
  );
}

export default App;
