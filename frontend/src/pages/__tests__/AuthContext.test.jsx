import React from "react";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../../test-utils/renderWithProviders";
import { AuthProvider, useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../utils/supabaseClient";

// Mock Supabase auth client
jest.mock("../../utils/supabaseClient", () => ({
    supabase: {
        auth: {
            getSession: jest.fn(),
            onAuthStateChange: jest.fn(),
            signInWithPassword: jest.fn(),
            signUp: jest.fn(),
            signOut: jest.fn(),
        },
    },
}));

// Test component that reads + triggers AuthContext
const TestComponent = () => {
    const { session, user, loading, signIn, signUp, signOut } = useAuth();

    return (
        <div>
            <div data-testid="auth-loading">
                {loading ? "Loading" : "Ready"}
            </div>

            <div data-testid="auth-status">
                {session ? "Authenticated" : "Not Authenticated"}
            </div>

            {user && <div data-testid="user-email">{user.email}</div>}

            <button
                onClick={() =>
                    signIn({ email: "test@example.com", password: "secret" })
                }
            >
                Trigger SignIn
            </button>

            <button
                onClick={() =>
                    signUp({
                        email: "new@example.com",
                        password: "signup-secret",
                        metadata: { role: "student" },
                    })
                }
            >
                Trigger SignUp
            </button>

            <button onClick={() => signOut()}>Trigger SignOut</button>
        </div>
    );
};

describe("AuthContext", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Default: no active session
        supabase.auth.getSession.mockResolvedValue({
            data: { session: null },
        });

        // Default subscription that does nothing but is cleanly unsubscribed
        supabase.auth.onAuthStateChange.mockImplementation(() => ({
            data: { subscription: { unsubscribe: jest.fn() } },
        }));
    });

    const renderWithAuth = () =>
        renderWithProviders(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

    test("provides initial unauthenticated state", async () => {
        renderWithAuth();

        await waitFor(() => {
            expect(screen.getByTestId("auth-loading")).toHaveTextContent(/ready/i);
        });

        expect(screen.getByTestId("auth-status")).toHaveTextContent(
            "Not Authenticated"
        );
        expect(screen.queryByTestId("user-email")).not.toBeInTheDocument();

        expect(supabase.auth.getSession).toHaveBeenCalledTimes(1);
        expect(supabase.auth.onAuthStateChange).toHaveBeenCalledTimes(1);
    });

    test("sets user and session when getSession returns a session", async () => {
        const fakeSession = {
            user: { id: "user-1", email: "user@example.com" },
        };

        supabase.auth.getSession.mockResolvedValueOnce({
            data: { session: fakeSession },
        });

        renderWithAuth();

        await waitFor(() => {
            expect(screen.getByTestId("auth-loading")).toHaveTextContent(/ready/i);
        });

        expect(screen.getByTestId("auth-status")).toHaveTextContent(
            "Authenticated"
        );
        expect(screen.getByTestId("user-email")).toHaveTextContent(
            "user@example.com"
        );
    });

    test("cleans up subscription on unmount", async () => {
        const unsubscribeMock = jest.fn();

        supabase.auth.onAuthStateChange.mockImplementation(() => ({
            data: { subscription: { unsubscribe: unsubscribeMock } },
        }));

        const { unmount } = renderWithAuth();

        await waitFor(() => {
            expect(screen.getByTestId("auth-loading")).toHaveTextContent(/ready/i);
        });

        unmount();

        expect(unsubscribeMock).toHaveBeenCalledTimes(1);
    });

    test("calls signIn (signInWithPassword) with correct arguments", async () => {
        supabase.auth.signInWithPassword.mockResolvedValue({
            data: { session: { user: { id: "1" } } },
            error: null,
        });

        renderWithAuth();

        await waitFor(() => {
            expect(screen.getByTestId("auth-loading")).toHaveTextContent(/ready/i);
        });

        fireEvent.click(screen.getByText("Trigger SignIn"));

        await waitFor(() => {
            expect(supabase.auth.signInWithPassword).toHaveBeenCalledTimes(1);
        });

        expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
            email: "test@example.com",
            password: "secret",
        });
    });

    test("calls signUp with redirect URL and metadata", async () => {
        supabase.auth.signUp.mockResolvedValue({
            data: { user: { id: "new-user" } },
            error: null,
        });

        renderWithAuth();

        await waitFor(() => {
            expect(screen.getByTestId("auth-loading")).toHaveTextContent(/ready/i);
        });

        fireEvent.click(screen.getByText("Trigger SignUp"));

        await waitFor(() => {
            expect(supabase.auth.signUp).toHaveBeenCalledTimes(1);
        });

        const signUpArgs = supabase.auth.signUp.mock.calls[0][0];

        expect(signUpArgs.email).toBe("new@example.com");
        expect(signUpArgs.password).toBe("signup-secret");
        expect(signUpArgs.options.data).toEqual({ role: "student" });
        expect(signUpArgs.options.emailRedirectTo).toBe(
            `${window.location.origin}/verify-email`
        );
        expect(signUpArgs.options.shouldCreateUser).toBe(true);
    });

    test("calls signOut on Trigger SignOut click", async () => {
        supabase.auth.signOut.mockResolvedValue({ error: null });

        renderWithAuth();

        await waitFor(() => {
            expect(screen.getByTestId("auth-loading")).toHaveTextContent(/ready/i);
        });

        fireEvent.click(screen.getByText("Trigger SignOut"));

        await waitFor(() => {
            expect(supabase.auth.signOut).toHaveBeenCalledTimes(1);
        });
    });
});
