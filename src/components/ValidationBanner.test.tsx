import { render, screen } from '@testing-library/react';
import ValidationBanner from './ValidationBanner';

// Mock the Zustand stores
vi.mock('../store/useWorkflowStore', () => ({
  useWorkflowStore: () => ({
    nodes: [],
    edges: []
  })
}));

vi.mock('../store/useConnectionsStore', () => ({
  useConnectionsStore: () => ({
    connections: []
  })
}));

describe('ValidationBanner', () => {
  it('renders a warning when there are no nodes', () => {
    render(<ValidationBanner />);
    expect(screen.getByText(/No trigger node/i)).toBeInTheDocument();
  });
});
