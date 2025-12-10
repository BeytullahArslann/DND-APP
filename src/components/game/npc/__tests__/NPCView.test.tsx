import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NPCView } from '../NPCView';
import { npcService } from '../../../../services/npcService';

// Mock dependencies
vi.mock('../../../../services/npcService', () => ({
  npcService: {
    subscribeToNPCs: vi.fn(),
    createNPC: vi.fn(),
    updateNPC: vi.fn(),
    deleteNPC: vi.fn(),
    subscribeToNotes: vi.fn(),
    addNote: vi.fn(),
    uploadNPCImage: vi.fn(),
  }
}));

// Mock child components
vi.mock('../NPCEditor', () => ({
    NPCEditor: ({ onSubmit, onCancel }: any) => (
        <div data-testid="npc-editor">
            <button onClick={() => onSubmit({ name: 'New NPC' })}>Save</button>
            <button onClick={onCancel}>Cancel</button>
        </div>
    )
}));

vi.mock('../NPCDetail', () => ({
    NPCDetail: ({ onClose }: any) => (
        <div data-testid="npc-detail">
            <button onClick={onClose}>Close</button>
        </div>
    )
}));

vi.mock('../NPCList', () => ({
    NPCList: ({ npcs, onAdd, onSelect }: any) => (
        <div data-testid="npc-list">
            <button onClick={onAdd}>Add</button>
            {npcs.map((npc: any) => (
                <div key={npc.id} onClick={() => onSelect(npc)} data-testid={`npc-item-${npc.id}`}>
                    {npc.name}
                </div>
            ))}
        </div>
    )
}));

describe('NPCView', () => {
    const mockNPCs = [
        { id: '1', name: 'NPC 1', isPrivate: false },
        { id: '2', name: 'NPC 2', isPrivate: true }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        // Setup subscription mock
        (npcService.subscribeToNPCs as any).mockImplementation((roomId: string, cb: Function) => {
            cb(mockNPCs);
            return () => {};
        });
    });

    it('renders NPC list initially', async () => {
        render(<NPCView roomId="room1" userRole="dm" currentUserUid="user1" />);
        await waitFor(() => {
            expect(screen.getByTestId('npc-list')).toBeInTheDocument();
        });
    });

    it('filters private NPCs for players', async () => {
        render(<NPCView roomId="room1" userRole="player" currentUserUid="user1" />);

        await waitFor(() => {
            expect(screen.getByTestId('npc-list')).toBeInTheDocument();
        });

        expect(screen.queryByText('NPC 2')).not.toBeInTheDocument();
        expect(screen.getByText('NPC 1')).toBeInTheDocument();
    });

    it('shows private NPCs for DM', async () => {
        render(<NPCView roomId="room1" userRole="dm" currentUserUid="user1" />);
        await waitFor(() => {
             expect(screen.getByText('NPC 2')).toBeInTheDocument();
        });
    });

    it('switches to editor on Add click', async () => {
        render(<NPCView roomId="room1" userRole="dm" currentUserUid="user1" />);
        await waitFor(() => screen.getByTestId('npc-list'));

        fireEvent.click(screen.getByText('Add'));

        expect(screen.getByTestId('npc-editor')).toBeInTheDocument();
    });

    it('switches to detail on NPC select', async () => {
        render(<NPCView roomId="room1" userRole="dm" currentUserUid="user1" />);
        await waitFor(() => screen.getByTestId('npc-list'));

        fireEvent.click(screen.getByTestId('npc-item-1'));

        expect(screen.getByTestId('npc-detail')).toBeInTheDocument();
    });
});
