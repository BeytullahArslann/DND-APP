import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import GameRulesPage from '../GameRulesPage';
import { BrowserRouter } from 'react-router-dom';

// Mock the data files
vi.mock('../../data/rules.json', () => ({
  default: {
    reference: [
      {
        contents: [
          { name: "Test Section", headers: ["Header 1"] }
        ]
      }
    ],
    data: [
      {
        entries: [
            {
                name: "Test Section",
                type: "entries",
                entries: ["This is a rule text.", { type: "section", name: "Subsection", entries: ["Sub text"] }]
            }
        ]
      }
    ]
  }
}));

vi.mock('../../data/spells.json', () => ({
  default: {
    spell: [
      {
        name: "Fireball",
        level: 3,
        school: "V",
        time: [{ number: 1, unit: "action" }],
        range: { type: "point", distance: { type: "feet", amount: 150 } },
        components: { v: true, s: true, m: "bat guano" },
        duration: [{ type: "instant" }],
        entries: ["A bright streak flashes..."],
        source: "PHB",
        page: 241
      }
    ]
  }
}));

describe('GameRulesPage', () => {
  it('renders rules tab by default', () => {
    render(
      <BrowserRouter>
        <GameRulesPage />
      </BrowserRouter>
    );
    expect(screen.getAllByText('Test Section').length).toBeGreaterThan(0);
    expect(screen.getByText('This is a rule text.')).toBeInTheDocument();
  });

  it('switches to spells tab', () => {
    render(
      <BrowserRouter>
        <GameRulesPage />
      </BrowserRouter>
    );

    const spellsTab = screen.getByText('Büyüler');
    fireEvent.click(spellsTab);

    expect(screen.getByPlaceholderText('Büyü ara...')).toBeInTheDocument();
    expect(screen.getByText('Fireball')).toBeInTheDocument();
  });

  it('expands spell details', () => {
    render(
      <BrowserRouter>
        <GameRulesPage />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Büyüler'));
    fireEvent.click(screen.getByText('Fireball'));

    expect(screen.getByText('A bright streak flashes...')).toBeInTheDocument();
  });
});
