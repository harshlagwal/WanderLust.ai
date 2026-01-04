import React, { useState, useEffect } from 'react';

interface Props {
    destination: string;
    initialPackingList: string[];
    userEmail?: string | null;
}

interface ChecklistItem {
    text: string;
    checked: boolean;
}

const TripTools: React.FC<Props> = ({ destination, initialPackingList, userEmail }) => {
    const [activeTab, setActiveTab] = useState<'notes' | 'checklist'>('checklist');
    const [notes, setNotes] = useState('');
    const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
    const [saved, setSaved] = useState(false);

    // Load Saved Data
    useEffect(() => {
        if (!userEmail) return;

        // Notes
        const savedNotes = localStorage.getItem(`notes_${userEmail}_${destination}`);
        if (savedNotes) setNotes(savedNotes);
        else setNotes(''); // Clear if no new notes

        // Checklist
        const savedChecklist = localStorage.getItem(`checklist_${userEmail}_${destination}`);
        if (savedChecklist) {
            setChecklist(JSON.parse(savedChecklist));
        } else {
            // Initialize with AI suggestions if no save exists
            setChecklist(initialPackingList.map(item => ({ text: item, checked: false })));
        }
    }, [destination, initialPackingList, userEmail]);

    // Manual Save Handler
    const handleSave = () => {
        if (!userEmail) return;

        localStorage.setItem(`notes_${userEmail}_${destination}`, notes);
        localStorage.setItem(`checklist_${userEmail}_${destination}`, JSON.stringify(checklist));

        // Notify other components
        window.dispatchEvent(new Event('trip-data-updated'));

        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const toggleCheck = (index: number) => {
        const newList = [...checklist];
        newList[index].checked = !newList[index].checked;
        setChecklist(newList);
    };

    const handleAddNote = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNotes(e.target.value);
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden relative">
            {/* Header & Tabs */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pr-4 bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex flex-1">
                    <button
                        onClick={() => setActiveTab('checklist')}
                        className={`px-6 py-3 font-bold text-sm transition-colors border-b-2 ${activeTab === 'checklist' ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/30 dark:bg-blue-900/10' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'}`}
                    >
                        🎒 Packing
                    </button>
                    <button
                        onClick={() => setActiveTab('notes')}
                        className={`px-6 py-3 font-bold text-sm transition-colors border-b-2 ${activeTab === 'notes' ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/30 dark:bg-blue-900/10' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'}`}
                    >
                        📝 Notes
                    </button>
                </div>

                <button
                    onClick={handleSave}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${saved ? 'bg-green-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                >
                    {saved ? (
                        <><span>✓</span> Saved!</>
                    ) : (
                        <><span>💾</span> Save Changes</>
                    )}
                </button>
            </div>

            <div className="p-4 h-64 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-800">
                {activeTab === 'checklist' ? (
                    <ul className="space-y-2">
                        {checklist.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg cursor-pointer transition border border-transparent hover:border-slate-100 dark:hover:border-slate-700" onClick={() => toggleCheck(idx)}>
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${item.checked ? 'bg-green-500 border-green-500 scale-110' : 'border-slate-300 dark:border-slate-500'}`}>
                                    {item.checked && <span className="text-white text-xs font-bold">✓</span>}
                                </div>
                                <span className={`flex-1 text-sm transition-colors ${item.checked ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                                    {item.text}
                                </span>
                            </li>
                        ))}
                        {checklist.length === 0 && <p className="text-center text-slate-400 text-sm mt-10">No items in packing list.</p>}
                    </ul>
                ) : (
                    <textarea
                        className="w-full h-full resize-none bg-transparent outline-none text-slate-700 dark:text-slate-300 text-sm leading-relaxed p-1"
                        placeholder="Write your travel notes, reservation numbers, or reminders here..."
                        value={notes}
                        onChange={handleAddNote}
                    />
                )}
            </div>

            {/* Status Footer */}
            <div className="bg-slate-50 dark:bg-slate-900/50 px-4 py-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex justify-between">
                <span>{activeTab === 'checklist' ? `${checklist.filter(i => i.checked).length}/${checklist.length} items packed` : `${notes.length} characters`}</span>
                <span className={saved ? 'text-green-500' : ''}>{saved ? 'All changes saved.' : 'Remember to save your changes.'}</span>
            </div>
        </div>
    );
};

export default TripTools;
