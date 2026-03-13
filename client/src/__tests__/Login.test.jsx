import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Login from '../components/auth/Login';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { MemoryRouter } from 'react-router-dom';

// Mock useAuth hook
vi.mock('../context/AuthContext', async () => {
    const actual = await vi.importActual('../context/AuthContext');
    return {
        ...actual,
        useAuth: vi.fn(),
    };
});

// Mock react-router-dom hooks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('Login Component', () => {
    const mockLogin = vi.fn();
    const mockClearErrors = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({
            login: mockLogin,
            isAuthenticated: false,
            error: null,
            loading: false,
            clearErrors: mockClearErrors,
        });
    });

    it('renders login form correctly', () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        expect(screen.getByRole('heading', { name: /DevConnector/i })).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    });

    it('submits form with native validation', async () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        const emailInput = screen.getByPlaceholderText(/you@example.com/i);
        const passwordInput = screen.getByPlaceholderText(/••••••••/i);
        
        expect(emailInput).toBeRequired();
        expect(passwordInput).toBeRequired();
        
        fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));
        expect(mockLogin).not.toHaveBeenCalled();
    });

    it('calls login function with correct data on valid submission', async () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), {
            target: { value: 'test@example.com' },
        });
        fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
            target: { value: 'password123' },
        });

        fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password123',
            });
        });
    });

    it('displays error message when authentication fails', () => {
        useAuth.mockReturnValue({
            login: mockLogin,
            isAuthenticated: false,
            error: 'Invalid credentials',
            loading: false,
            clearErrors: mockClearErrors,
        });

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
    });

    it('disables login button when loading is true', () => {
        useAuth.mockReturnValue({
            login: mockLogin,
            isAuthenticated: false,
            error: null,
            loading: true,
            clearErrors: mockClearErrors,
        });

        const { container } = render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        expect(container.querySelector('.dc-spinner')).toBeInTheDocument();
    });
});
