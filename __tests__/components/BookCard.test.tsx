import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import BookCard from '@/components/BookCard';
import { BookWithPrices } from '@/types';

// Mock dependencies
jest.mock('next/link', () => {
    return ({ children }: { children: React.ReactNode }) => {
        return children;
    }
});

jest.mock('next/image', () => ({
    __esModule: true,
    default: (props: any) => {
        return <img {...props} />
    },
}));

jest.mock('@/contexts/CurrencyContext', () => ({
    useCurrency: () => ({ symbol: '$', currency: 'USD' })
}));

jest.mock('@/lib/supabase/client', () => ({
    createClient: () => ({
        auth: {
            getUser: jest.fn().mockResolvedValue({ data: { user: null } })
        }
    })
}));

jest.mock('@/components/SeriesBadge', () => {
    return () => <div data-testid="series-badge">SeriesBadge</div>;
});

jest.mock('@/components/collections/AddToCollectionModal', () => {
    return () => <div data-testid="add-to-collection-modal">AddToCollectionModal</div>;
});

jest.mock('@/components/SeriesEditModal', () => {
    return () => <div data-testid="series-edit-modal">SeriesEditModal</div>;
});

jest.mock('lucide-react', () => {
    return {
        Heart: () => <svg />,
        ExternalLink: () => <svg />,
        BookOpen: () => <svg />,
        MoreVertical: () => <svg />,
        Check: () => <svg />,
        ChevronDown: () => <svg />,
        Library: () => <svg />,
        Clock: () => <svg />,
        CheckCircle: () => <svg />,
        Trash2: () => <svg />,
        Plus: () => <svg />,
        Pencil: () => <svg />,
    };
});

jest.mock('@/lib/api/prices', () => ({
    getBestPrice: () => null
}));

jest.mock('@/lib/constants', () => ({
    ADMIN_EMAILS: ['test@example.com']
}));

const mockBook: BookWithPrices = {
    id: '1',
    title: 'Test Book',
    authors: ['Test Author'],
    coverUrl: '/test-cover.jpg',
    rating: 4.5,
    prices: [],
    description: 'Test description',
    pageCount: 100,
    publishedDate: '2023',
    categories: ['Fiction'],
    isbn: '1234567890',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
};

describe('BookCard', () => {
    it('renders book title and author', () => {
        render(<BookCard book={mockBook} />);

        expect(screen.getByText('Test Book')).toBeInTheDocument();
        expect(screen.getByText('Test Author')).toBeInTheDocument();
    });

    it('renders cover image', () => {
        render(<BookCard book={mockBook} />);

        const image = screen.getByRole('img', { name: 'Test Book' });
        expect(image).toHaveAttribute('src', '/test-cover.jpg');
    });

    it('renders rating correctly', () => {
        render(<BookCard book={mockBook} />);
        expect(screen.getByText(/4.5\/5/)).toBeInTheDocument();
    });
});
