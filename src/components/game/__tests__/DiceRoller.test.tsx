import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DiceRoller } from '../DiceRoller';

// Mock Firebase
// Need to mock everything exported by src/lib/firebase.ts and the SDKs used there
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  GoogleAuthProvider: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  collection: vi.fn(),
  onSnapshot: vi.fn(),
  addDoc: vi.fn(),
  serverTimestamp: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
}));

vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(),
}));

// Mock the local firebase lib which re-exports/initializes these
vi.mock('../../lib/firebase', () => ({
  db: {},
  auth: {},
  storage: {},
  app: {},
  appId: 'test-app',
}));

// Now setup the specific mock implementations for the test
import { addDoc, onSnapshot, collection, serverTimestamp } from 'firebase/firestore';

// Mock the 3D Dice Canvas to avoid WebGL errors and simulate physics callback
vi.mock('../dice3d/DiceCanvas', () => ({
  DiceCanvas: ({ dice, rolling, onDieSettled }: any) => {
    React.useEffect(() => {
      if (rolling && dice.length > 0) {
        // Simulate dice settling after a short delay
        const timer = setTimeout(() => {
          dice.forEach((d: any) => {
             // Mock a random result (e.g., 1)
             onDieSettled(d.id, 1);
          });
        }, 100);
        return () => clearTimeout(timer);
      }
    }, [rolling, dice, onDieSettled]);

    return <div data-testid="dice-canvas-mock">Mock Dice Canvas {rolling ? '(Rolling)' : '(Idle)'}</div>;
  }
}));

describe('DiceRoller Component', () => {
  const mockUser: any = { uid: 'user1', displayName: 'Test User' };
  const mockRoomCode = 'room123';

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock behaviors
    (onSnapshot as any).mockImplementation((query: any, callback: any) => {
       // Simulate initial snapshot with empty history
       callback({ docs: [] });
       return () => {}; // unsubscribe
    });

    (addDoc as any).mockResolvedValue({});

    // Fix: collection must return something defined
    (collection as any).mockReturnValue({ id: 'mock-collection-ref' });

    // Fix: serverTimestamp must return a value
    (serverTimestamp as any).mockReturnValue('mock-timestamp');
  });

  it('renders correctly and allows dice selection', () => {
    render(<DiceRoller user={mockUser} roomCode={mockRoomCode} />);

    // Check if d6 button exists
    const d6Btn = screen.getByText('6', { selector: 'span' }).closest('button');
    expect(d6Btn).toBeInTheDocument();

    // Select d6
    fireEvent.click(d6Btn!);

    // Check if selection is shown
    expect(screen.getByText('1x')).toBeInTheDocument();
    expect(screen.getByText('d6')).toBeInTheDocument();
  });

  it('handles rolling flow correctly: Selection -> Rolling -> Result', async () => {
    render(<DiceRoller user={mockUser} roomCode={mockRoomCode} />);

    // 1. Select a die
    const d6Btn = screen.getByText('6', { selector: 'span' }).closest('button');
    fireEvent.click(d6Btn!);

    // 2. Click Roll Button
    const rollBtn = screen.getByText('ZAR AT!');
    fireEvent.click(rollBtn);

    // 3. Verify State: Rolling
    expect(screen.getByText('Oynanıyor...')).toBeInTheDocument();
    expect(screen.getByTestId('dice-canvas-mock')).toHaveTextContent('(Rolling)');

    // 4. Wait for Mock Canvas to trigger onDieSettled
    await waitFor(() => {
        // "Oynanıyor..." should disappear and "ZAR AT!" comes back
        expect(screen.queryByText('Oynanıyor...')).not.toBeInTheDocument();
    }, { timeout: 1000 });

    expect(screen.getByText('ZAR AT!')).toBeInTheDocument();

    // 5. Verify Result Display
    // The total should be displayed (mocked result is 1)
    expect(screen.getByText('TOPLAM: 1')).toBeInTheDocument();

    // 6. Verify Firestore interaction
    expect(addDoc).toHaveBeenCalledTimes(1);
    expect(addDoc).toHaveBeenCalledWith(
        { id: 'mock-collection-ref' }, // collection ref
        expect.objectContaining({
            uid: mockUser.uid,
            sides: 6,
            result: 1,
            type: 'dice',
            playerName: 'Test User',
            timestamp: 'mock-timestamp'
        })
    );
  });
});
