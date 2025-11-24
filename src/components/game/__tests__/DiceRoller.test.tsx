import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DiceRoller } from '../DiceRoller';

// Mock Firebase
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

vi.mock('../../../lib/firebase', () => ({
  db: {},
  auth: {},
  storage: {},
  app: {},
  appId: 'test-app',
}));

import { addDoc, onSnapshot, collection, serverTimestamp } from 'firebase/firestore';

// Mock the Die2D component
vi.mock('../dice2d/Die2D', () => ({
  Die2D: ({ sides, finalResult, rolling }: any) => (
    <div data-testid="die-2d">
      Sides: {sides}, Result: {finalResult}, Rolling: {rolling ? 'Yes' : 'No'}
    </div>
  )
}));

describe('DiceRoller Component', () => {
  const mockUser: any = { uid: 'user1', displayName: 'Test User' };
  const mockRoomCode = 'room123';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    (onSnapshot as any).mockImplementation((query: any, callback: any) => {
       callback({ docs: [] });
       return () => {};
    });

    (addDoc as any).mockResolvedValue({});
    (collection as any).mockReturnValue({ id: 'mock-collection-ref' });
    (serverTimestamp as any).mockReturnValue('mock-timestamp');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders correctly and allows dice selection', () => {
    render(<DiceRoller user={mockUser} roomCode={mockRoomCode} />);

    const d6Btn = screen.getByText('6', { selector: 'span' }).closest('button');
    expect(d6Btn).toBeInTheDocument();

    fireEvent.click(d6Btn!);

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

    // Check if Die2D is rendered with Rolling: Yes
    const die = screen.getByTestId('die-2d');
    expect(die).toHaveTextContent('Rolling: Yes');

    // 4. Advance timers to finish roll
    // We wrap this in act because it triggers state updates
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // 5. Verify Rolling stopped
    expect(screen.queryByText('Oynanıyor...')).not.toBeInTheDocument();
    expect(screen.getByText('ZAR AT!')).toBeInTheDocument();

    // 6. Verify Result Display
    const totalElement = screen.getByText(/TOPLAM:/);
    expect(totalElement).toBeInTheDocument();

    // 7. Verify Firestore interaction
    expect(addDoc).toHaveBeenCalledTimes(1);
    expect(addDoc).toHaveBeenCalledWith(
        { id: 'mock-collection-ref' },
        expect.objectContaining({
            uid: mockUser.uid,
            sides: 6,
            type: 'dice',
            playerName: 'Test User',
            timestamp: 'mock-timestamp'
        })
    );
  });
});
