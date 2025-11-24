import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import GameRulesPage from '../GameRulesPage';
import { BrowserRouter } from 'react-router-dom';
import { cmsService } from '../../services/cmsService';

// Mock cmsService
vi.mock('../../services/cmsService', () => ({
  cmsService: {
    getRules: vi.fn(),
    getSpells: vi.fn(),
    getWeapons: vi.fn()
  }
}));

const mockRules = [
  {
    id: '1',
    title: 'Test Section',
    order: 0,
    content: [
      {
        name: "Header 1",
        type: "entries",
        entries: ["This is a rule text."]
      }
    ]
  }
];

const mockSpells = [
  {
    id: '1',
    name: 'Fireball',
    level: 3,
    school: 'V',
    time: JSON.stringify([{ number: 1, unit: "action" }]),
    range: JSON.stringify({ type: "point", distance: { type: "feet", amount: 150 } }),
    components: JSON.stringify({ v: true, s: true, m: "bat guano" }),
    duration: JSON.stringify([{ type: "instant" }]),
    description: JSON.stringify(["A bright streak flashes..."]),
    classes: []
  }
];

const mockWeapons = [
    {
        id: '1',
        name: 'Longsword',
        category: 'Martial Melee',
        damage: '1d8',
        damageType: 'slashing',
        properties: ['Versatile (1d10)'],
        weight: '3 lb.',
        cost: '15 gp'
    }
]

describe('GameRulesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (cmsService.getRules as any).mockResolvedValue(mockRules);
    (cmsService.getSpells as any).mockResolvedValue(mockSpells);
    (cmsService.getWeapons as any).mockResolvedValue(mockWeapons);
  });

  it('renders rules tab by default after loading', async () => {
    render(
      <BrowserRouter>
        <GameRulesPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Yükleniyor...')).toBeInTheDocument();

    await waitFor(() => {
        expect(screen.getAllByText('Test Section').length).toBeGreaterThan(0);
    });

    expect(screen.getByText('This is a rule text.')).toBeInTheDocument();
  });

  it('switches to spells tab', async () => {
    render(
      <BrowserRouter>
        <GameRulesPage />
      </BrowserRouter>
    );

    await waitFor(() => {
        expect(screen.queryByText('Yükleniyor...')).not.toBeInTheDocument();
    });

    const spellsTab = screen.getByText('Büyüler');
    fireEvent.click(spellsTab);

    expect(screen.getByPlaceholderText('Büyü ara...')).toBeInTheDocument();
    // Wait for spells to render
    await waitFor(() => {
        expect(screen.getByText('Fireball')).toBeInTheDocument();
    });
  });

  it('expands spell details', async () => {
    render(
      <BrowserRouter>
        <GameRulesPage />
      </BrowserRouter>
    );

    await waitFor(() => {
        expect(screen.queryByText('Yükleniyor...')).not.toBeInTheDocument();
    });

    const spellsTab = screen.getByText('Büyüler');
    fireEvent.click(spellsTab);

    // Wait for the list to appear
    await waitFor(() => {
        expect(screen.getByText('Fireball')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Fireball'));

    expect(screen.getByText('A bright streak flashes...')).toBeInTheDocument();
  });

  it('switches to weapons tab and displays weapon', async () => {
      render(
        <BrowserRouter>
          <GameRulesPage />
        </BrowserRouter>
      );

      await waitFor(() => {
          expect(screen.queryByText('Yükleniyor...')).not.toBeInTheDocument();
      });

      const weaponsTab = screen.getByText('Silahlar');
      fireEvent.click(weaponsTab);

      await waitFor(() => {
          expect(screen.getByText('Longsword')).toBeInTheDocument();
      });
      expect(screen.getByText('1d8 slashing')).toBeInTheDocument();
  });
});
