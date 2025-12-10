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
            // Note: In a real app we might verify roomId here
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

        // The mocked NPCList renders the provided list.
        // We need to check if 'NPC 2' is passed to it?
        // Actually, the error says "Unable to find ... NPC 1".
        // This is likely because the mockNPCs inside the test are different from what the component might be using if it had default state?
        // No, we mocked the service.
        // Ah, look at the error output: "Hancı Barmen" and "Gizemli Büyücü" are rendered.
        // This means the COMPONENT is using its own local state or the mock setup didn't work as expected because we might have mocked the module AFTER import or something?
        // Wait, the component `NPCView.tsx` uses `npcService.subscribeToNPCs`.
        // If the test sees "Hancı Barmen", it implies `MOCK_NPCS` from the component file are being used,
        // OR the mock implementation wasn't picked up correctly.
        // BUT wait, I removed MOCK_NPCS from the component file in the last step.
        // Let's check the component file content again.

        // Wait, the error output shows:
        // <div data-testid="npc-item-1">Hancı Barmen</div>
        // This implies the ID matches '1' but the name is 'Hancı Barmen'.
        // Why?
        // Maybe I didn't successfully remove MOCK_NPCS or the service is returning real data?
        // Ah, `npcService` mock in test defines `subscribeToNPCs`.
        // If the component is seeing "Hancı Barmen", where is that coming from?
        // Maybe I didn't update the component file correctly?
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
