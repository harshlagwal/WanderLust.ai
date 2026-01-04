import React, { useEffect, useState } from 'react';

interface Props {
    destination: string;
    userEmail?: string | null;
}

interface ChecklistItem {
    text: string;
    checked: boolean;
}

const SavedTripSummary: React.FC<Props> = ({ destination, userEmail }) => {
    const [notes, setNotes] = useState('');
    const [packedItems, setPackedItems] = useState<string[]>([]);
    const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

    const loadData = () => {
        if (!userEmail) return;

        // Load Notes
        const savedNotes = localStorage.getItem(`notes_${userEmail}_${destination}`) || '';
        setNotes(savedNotes);

        // Load Checklist
        const savedChecklistStr = localStorage.getItem(`checklist_${userEmail}_${destination}`);
        if (savedChecklistStr) {
            const items: ChecklistItem[] = JSON.parse(savedChecklistStr);
            setPackedItems(items.filter(i => i.checked).map(i => i.text));
        } else {
            setPackedItems([]);
        }
        setLastUpdated(Date.now());
    };

    useEffect(() => {
        loadData();

        // Listen for custom event from TripTools
        const handleUpdate = () => loadData();
        window.addEventListener('trip-data-updated', handleUpdate);

        return () => {
            window.removeEventListener('trip-data-updated', handleUpdate);
        };
    }, [destination, userEmail]);

    if (!notes && packedItems.length === 0) return null;

    return (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-800/50 rounded-2xl p-6 border border-emerald-100 dark:border-slate-700 shadow-sm animate-fade-in mb-6">
            <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">📋</span>
                <h3 className="font-bold text-emerald-800 dark:text-emerald-400">Trip Summary</h3>
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full ml-auto">
                    Last updated: {new Date(lastUpdated).toLocaleTimeString()}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Saved Notes</h4>
                    {notes ? (
                        <div className="bg-white/60 dark:bg-black/20 p-3 rounded-lg text-sm text-slate-700 dark:text-slate-300 italic min-h-[60px]">
                            "{notes}"
                        </div>
                    ) : (
                        <p className="text-xs text-slate-400 italic">No notes saved yet.</p>
                    )}
                </div>

                <div>
                    <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Packed Items ({packedItems.length})</h4>
                    {packedItems.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {packedItems.map((item, idx) => (
                                <span key={idx} className="text-xs bg-white dark:bg-slate-700 px-2 py-1 rounded border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 flex items-center gap-1">
                                    ✓ {item}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-slate-400 italic">No items packed yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SavedTripSummary;
