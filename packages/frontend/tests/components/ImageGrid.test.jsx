import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ImageGrid from '../../src/components/upload/ImageGrid';

describe('ImageGrid', () => {
  it('should show empty state when no images', () => {
    render(<ImageGrid images={[]} />);

    expect(screen.getByText(/Nenhuma imagem enviada ainda/i)).toBeInTheDocument();
  });

  it('should render images in grid', () => {
    const mockImages = [
      {
        id: '1',
        url: '/uploads/image1.jpg',
        original_name: 'test1.jpg',
        size: 50000,
      },
      {
        id: '2',
        url: '/uploads/image2.png',
        original_name: 'test2.png',
        size: 75000,
      },
    ];

    render(<ImageGrid images={mockImages} />);

    expect(screen.getByText('test1.jpg')).toBeInTheDocument();
    expect(screen.getByText('test2.png')).toBeInTheDocument();
  });

  it('should display file sizes in human-readable format', () => {
    const mockImages = [
      {
        id: '1',
        url: '/uploads/image1.jpg',
        original_name: 'test.jpg',
        size: 1024, // 1 KB
      },
    ];

    render(<ImageGrid images={mockImages} />);

    expect(screen.getByText(/1 KB/i)).toBeInTheDocument();
  });
});
