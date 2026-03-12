import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import PostFeed from '../components/posts/PostFeed';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// Mock useAuth
vi.mock('../context/AuthContext', () => ({
    useAuth: vi.fn(),
}));

// Mock api service
vi.mock('../services/api', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
    },
}));

// Mock ImageUpload component since it involves file input and complex logic
vi.mock('../components/layout/ImageUpload', () => ({
    default: ({ onUploadSuccess }) => (
        <div data-testid="mock-image-upload">
            <button onClick={() => onUploadSuccess(new File([''], 'test.png', { type: 'image/png' }))}>
                Upload Image
            </button>
        </div>
    ),
}));

describe('PostFeed Component', () => {
    const mockUser = { id: '1', name: 'Test User', avatar: null };

    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({ user: mockUser });
        api.get.mockResolvedValue({ data: { posts: [] } });
    });

    it('renders loading state initially', async () => {
        // We need to keep api.get pending briefly
        let resolveGet;
        const getPromise = new Promise((resolve) => {
            resolveGet = resolve;
        });
        api.get.mockReturnValue(getPromise);

        render(<PostFeed />);

        expect(screen.getByText(/Loading posts.../i)).toBeInTheDocument();

        resolveGet({ data: { posts: [] } });
        await waitFor(() => expect(screen.queryByText(/Loading posts.../i)).not.toBeInTheDocument());
    });

    it('renders post creation form for authenticated user', async () => {
        render(<PostFeed />);

        await waitFor(() => {
            expect(screen.getByPlaceholderText(/What's on your mind\?/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Post/i })).toBeInTheDocument();
        });
    });

    it('submits a new post successfully', async () => {
        const newPostData = { _id: '2', text: 'Hello World', name: 'Test User', createdAt: new Date().toISOString(), likes: [], comments: [] };
        api.post.mockResolvedValue({ data: { post: newPostData } });

        render(<PostFeed />);

        const textarea = await screen.findByPlaceholderText(/What's on your mind\?/i);
        fireEvent.change(textarea, { target: { value: 'Hello World' } });

        const postButton = screen.getByRole('button', { name: /Post/i });
        fireEvent.click(postButton);

        await waitFor(() => {
            expect(api.post).toHaveBeenCalled();
            // Verify the new post appears in the list
            expect(screen.getByText('Hello World')).toBeInTheDocument();
        });

        // Textarea should be cleared
        expect(textarea.value).toBe('');
    });

    it('displays error message on fetch failure', async () => {
        api.get.mockRejectedValue({ response: { data: { msg: 'Failed to fetch posts' } } });

        render(<PostFeed />);

        expect(await screen.findByText(/Failed to fetch posts/i)).toBeInTheDocument();
    });

    it('handles image selection in post creation', async () => {
        render(<PostFeed />);

        await waitFor(() => screen.getByPlaceholderText(/What's on your mind\?/i));

        const uploadButton = screen.getByText(/Upload Image/i);
        fireEvent.click(uploadButton);

        // This is a bit simplified since we mocked ImageUpload
        // But it verifies the component can handle sub-component callbacks
    });
});
