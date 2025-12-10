import React, { useState } from 'react';
import { NPC, NPCNote, UserRole } from '../../../types';
import { NPCList } from './NPCList';
import { NPCDetail } from './NPCDetail';
import { NPCEditor } from './NPCEditor';

interface NPCViewProps {
  roomId: string;
  userRole: UserRole;
  currentUserUid: string;
}

// MOCK DATA FOR PROTOTYPE
const MOCK_NPCS: NPC[] = [
  {
    id: '1',
    name: 'Hancı Barmen',
    description: 'Yorgun ama güler yüzlü bir adam. Eski bir maceracı olduğunu iddia ediyor.',
    age: '45',
    height: '1.80m',
    weight: '90kg',
    appearance: 'Kel, gür bıyıklı, önlüğü kirli.',
    isPrivate: false,
    roomId: 'room1',
    createdBy: 'dm1',
    imageUrl: 'https://images.unsplash.com/photo-1585504198199-20277593b94f?w=400&h=600&fit=crop'
  },
  {
    id: '2',
    name: 'Gizemli Büyücü',
    description: 'Karanlık cübbeler giyen, yüzü görünmeyen bir figür.',
    age: '???',
    height: '1.70m',
    weight: '60kg',
    appearance: 'Karanlık aura yayıyor.',
    isPrivate: true, // Hidden
    roomId: 'room1',
    createdBy: 'dm1'
  }
];

export const NPCView: React.FC<NPCViewProps> = ({ roomId, userRole, currentUserUid }) => {
  const isDM = userRole === 'dm';
  const [viewState, setViewState] = useState<'list' | 'detail' | 'create' | 'edit'>('list');
  const [selectedNPC, setSelectedNPC] = useState<NPC | null>(null);

  // Mock State
  const [npcs, setNpcs] = useState<NPC[]>(MOCK_NPCS);
  const [mockNotes, setMockNotes] = useState<NPCNote[]>([]);

  // Filtering
  const visibleNpcs = npcs.filter(npc => isDM || !npc.isPrivate);

  const handleCreate = async (data: Omit<NPC, 'id' | 'roomId' | 'createdBy'>) => {
    const newNPC: NPC = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      roomId,
      createdBy: currentUserUid
    };
    setNpcs([...npcs, newNPC]);
    setViewState('list');
  };

  const handleUpdate = async (data: Omit<NPC, 'id' | 'roomId' | 'createdBy'>) => {
    if (!selectedNPC) return;
    const updatedNPC = { ...selectedNPC, ...data };
    setNpcs(npcs.map(n => n.id === selectedNPC.id ? updatedNPC : n));
    setSelectedNPC(updatedNPC);
    setViewState('detail');
  };

  const handleDelete = () => {
    if (!selectedNPC) return;
    setNpcs(npcs.filter(n => n.id !== selectedNPC.id));
    setSelectedNPC(null);
    setViewState('list');
  };

  const handleAddNote = (content: string, isPublic: boolean) => {
    if (!selectedNPC) return;
    const newNote: NPCNote = {
      id: Math.random().toString(),
      npcId: selectedNPC.id,
      authorId: currentUserUid,
      content,
      isPublic,
      timestamp: Date.now()
    };
    setMockNotes([newNote, ...mockNotes]);
  };

  if (viewState === 'create') {
    return (
      <NPCEditor
        onSubmit={handleCreate}
        onCancel={() => setViewState('list')}
      />
    );
  }

  if (viewState === 'edit' && selectedNPC) {
    return (
      <NPCEditor
        initialData={selectedNPC}
        onSubmit={handleUpdate}
        onCancel={() => setViewState('detail')}
      />
    );
  }

  if (viewState === 'detail' && selectedNPC) {
    return (
      <NPCDetail
        npc={selectedNPC}
        currentUserUid={currentUserUid}
        isDM={isDM}
        notes={mockNotes.filter(n => n.npcId === selectedNPC.id)}
        onClose={() => {
          setSelectedNPC(null);
          setViewState('list');
        }}
        onEdit={() => setViewState('edit')}
        onDelete={handleDelete}
        onAddNote={handleAddNote}
      />
    );
  }

  return (
    <NPCList
      npcs={visibleNpcs}
      canCreate={isDM}
      onAdd={() => setViewState('create')}
      onSelect={(npc) => {
        setSelectedNPC(npc);
        setViewState('detail');
      }}
    />
  );
};
