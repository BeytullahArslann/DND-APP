import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DiceRoller } from './DiceRoller';

// Mock Firebase
vi.mock('../../lib/firebase', () => ({
  db: {},
  appId: 'test-app'
}));

// Mock Firestore
const mockAddDoc = vi.fn();
const mockOnSnapshot = vi.fn();
const mockCollection = vi.fn();
const mockQuery = vi.fn();

vi.mock('firebase/firestore', () => ({
  collection: (...args) => mockCollection(...args),
  addDoc: (...args) => mockAddDoc(...args),
  onSnapshot: (...args) => mockOnSnapshot(...args),
  query: (...args) => mockQuery(...args),
  orderBy: vi.fn(),
  limit: vi.fn(),
  serverTimestamp: () => 'timestamp'
}));

// Mock Three.js components
vi.mock('./dice3d/DiceCanvas', () => ({
  DiceCanvas: () => <div data-testid="dice-canvas">Mock Dice Canvas</div>
}));

// Mock Lucide React Icons
vi.mock('lucide-react', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    Trash2: () => <svg data-testid="trash-icon" />,
    History: () => <svg data-testid="history-icon" />
  };
});

describe('DiceRoller', () => {
  const mockUser = {
    uid: 'user123',
    displayName: 'Test User',
    email: 'test@example.com'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSnapshot.mockImplementation((q, callback) => {
      callback({ docs: [] });
      return () => {};
    });
  });

  it('renders correctly', () => {
    render(<DiceRoller user={mockUser} roomCode="room1" />);

    expect(screen.getByTestId('dice-canvas')).toBeInTheDocument();
    expect(screen.getByText(/Zar Geçmişi/i)).toBeInTheDocument();
    expect(screen.getByText(/Zar seçmek için aşağıya tıkla/i)).toBeInTheDocument();
  });

  it('allows selecting dice', () => {
    render(<DiceRoller user={mockUser} roomCode="room1" />);

    // Click d6 button (look for the number 6 inside the button)
    const d6Button = screen.getByText('6', { selector: 'span' }).closest('button');
    fireEvent.click(d6Button!);

    // Check that it is added to selection (1x d6)
    expect(screen.getByText('1x')).toBeInTheDocument();
  });

  it('enables roll button when dice are selected', () => {
    render(<DiceRoller user={mockUser} roomCode="room1" />);

    const rollBtn = screen.getByText(/ZAR AT!/i).closest('button');
    expect(rollBtn).toBeDisabled();

    const d20Button = screen.getByText('20', { selector: 'span' }).closest('button');
    fireEvent.click(d20Button!);

    expect(rollBtn).not.toBeDisabled();
  });

  it('clears selection when trash icon is clicked', () => {
    render(<DiceRoller user={mockUser} roomCode="room1" />);

    const d8Button = screen.getByText('8', { selector: 'span' }).closest('button');
    fireEvent.click(d8Button!);

    expect(screen.getByText('1x')).toBeInTheDocument();

    const trashIcon = screen.getByTestId('trash-icon');
    const trashButton = trashIcon.closest('button');
    fireEvent.click(trashButton!);

    expect(screen.queryByText('1x')).not.toBeInTheDocument();
    expect(screen.getByText(/Zar seçmek için aşağıya tıkla/i)).toBeInTheDocument();
  });
});
