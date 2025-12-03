import React from "react";
import { screen, waitFor, fireEvent, within } from "@testing-library/react";
import { renderWithRouter } from "../../test-utils/renderWithProviders";
import Profile from "../Profile";
import { supabase } from "../../utils/supabaseClient";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

// Mock useNavigate so we can assert navigation
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: jest.fn(),
}));

// Mock AuthContext
jest.mock("../../contexts/AuthContext");

// Mock Supabase client
jest.mock("../../utils/supabaseClient", () => {
    return {
        supabase: {
            from: jest.fn(),
        },
    };
});

const mockUseAuth = useAuth;
const mockUseNavigate = useNavigate;
const mockFrom = supabase.from;

describe("Profile page", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("shows loading state when auth is still loading", () => {
        mockUseAuth.mockReturnValue({
            user: null,
            loading: true,
        });

        renderWithRouter(<Profile />);

        expect(screen.getByText(/Chargement/i)).toBeInTheDocument();
    });

    test("shows error when user is not authenticated", async () => {
        mockUseAuth.mockReturnValue({
            user: null,
            loading: false,
        });

        renderWithRouter(<Profile />);

        await waitFor(() => {
            expect(
                screen.getByText(/vous devez être connecté pour voir votre profil/i)
            ).toBeInTheDocument();
        });
    });

    test("loads and displays profile data", async () => {
        const fakeUser = { id: "user-123" };

        mockUseAuth.mockReturnValue({
            user: fakeUser,
            loading: false,
        });

        const profileData = {
            id: "user-123",
            first_name: "Alice",
            last_name: "Martin",
            email: "alice.martin@uqam.ca",
            study_cycle: "Bachelor",
            school_year: "2",
            created_at: "2024-01-01T00:00:00.000Z",
            phone: "514-000-1111",
        };

        const mockSingle = jest.fn().mockResolvedValue({
            data: profileData,
            error: null,
        });

        mockFrom.mockReturnValueOnce({
            select: () => ({
                eq: () => ({
                    single: mockSingle,
                }),
            }),
        });

        renderWithRouter(<Profile />);

        await waitFor(() => {
            expect(screen.getByText(/mon profil/i)).toBeInTheDocument();
            expect(screen.getByText(/alice martin/i)).toBeInTheDocument();
            expect(screen.getByText(/alice\.martin@uqam\.ca/i)).toBeInTheDocument();
            expect(screen.getByText("514-000-1111")).toBeInTheDocument();
            expect(screen.getAllByText(/bachelor/i).length).toBeGreaterThan(0);
        });
    });

    test("allows editing and saving profile, calls supabase update and shows success message", async () => {
        const fakeUser = { id: "user-123" };

        mockUseAuth.mockReturnValue({
            user: fakeUser,
            loading: false,
        });

        const profileData = {
            id: "user-123",
            first_name: "Alice",
            last_name: "Martin",
            email: "alice.martin@uqam.ca",
            study_cycle: "Bachelor",
            school_year: "2",
            created_at: "2024-01-01T00:00:00.000Z",
            phone: "514-000-1111",
        };

        const mockSingle = jest.fn().mockResolvedValue({
            data: profileData,
            error: null,
        });

        const mockUpdateEq = jest.fn().mockResolvedValue({ error: null });

        // 1st from(): load profile
        mockFrom.mockReturnValueOnce({
            select: () => ({
                eq: () => ({
                    single: mockSingle,
                }),
            }),
        });

        // 2nd from(): update profile
        mockFrom.mockReturnValueOnce({
            update: (updateData) => ({
                eq: (column, value) => mockUpdateEq(updateData, column, value),
            }),
        });

        renderWithRouter(<Profile />);

        await waitFor(() => {
            expect(screen.getByText(/alice martin/i)).toBeInTheDocument();
        });

        const editButton = screen.getByRole("button", {
            name: /modifier le profil/i,
        });
        fireEvent.click(editButton);

        // Change first name and phone
        const firstNameInput = screen.getByDisplayValue("Alice");
        fireEvent.change(firstNameInput, { target: { value: "Alicia" } });

        const phoneInput = screen.getByDisplayValue("514-000-1111");
        fireEvent.change(phoneInput, { target: { value: "514-999-8888" } });

        // Save
        const saveButton = screen.getByRole("button", { name: /sauvegarder/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(mockUpdateEq).toHaveBeenCalledTimes(1);

            const [updatePayload, column, value] = mockUpdateEq.mock.calls[0];
            expect(column).toBe("id");
            expect(value).toBe(fakeUser.id);

            expect(updatePayload).toEqual(
                expect.objectContaining({
                    first_name: "Alicia",
                    last_name: "Martin",
                    study_cycle: "Bachelor",
                    school_year: "2",
                    phone: "514-999-8888",
                })
            );

            expect(
                screen.getByText(/sauvegarde effectuée avec succès/i)
            ).toBeInTheDocument();
        });
    });

    test("shows error notification when profile fetch fails", async () => {
        const fakeUser = { id: "user-123" };

        mockUseAuth.mockReturnValue({
            user: fakeUser,
            loading: false,
        });

        const mockSingle = jest.fn().mockResolvedValue({
            data: null,
            error: { message: "fetch failed" },
        });

        mockFrom.mockReturnValueOnce({
            select: () => ({
                eq: () => ({
                    single: mockSingle,
                }),
            }),
        });

        renderWithRouter(<Profile />);

        await waitFor(() => {
            expect(screen.getByText(/mon profil/i)).toBeInTheDocument();
            expect(
                screen.getByText(/erreur lors du chargement du profil/i)
            ).toBeInTheDocument();
        });
    });

    test('clicking "Mes Annonces" card navigates to /my-listings', async () => {
        const fakeUser = { id: "user-123" };

        mockUseAuth.mockReturnValue({
            user: fakeUser,
            loading: false,
        });

        const profileData = {
            id: "user-123",
            first_name: "Alice",
            last_name: "Martin",
            email: "alice.martin@uqam.ca",
            study_cycle: "Bachelor",
            school_year: "2",
            created_at: "2024-01-01T00:00:00.000Z",
            phone: "514-000-1111",
        };

        const mockSingle = jest.fn().mockResolvedValue({
            data: profileData,
            error: null,
        });

        mockFrom.mockReturnValueOnce({
            select: () => ({
                eq: () => ({
                    single: mockSingle,
                }),
            }),
        });

        const navigateMock = jest.fn();
        mockUseNavigate.mockReturnValue(navigateMock);

        renderWithRouter(<Profile />);

        // Wait until the "Mes Annonces" card is actually rendered
        const mesAnnoncesTitle = await screen.findByText(/mes annonces/i);
        const mesAnnoncesCard =
            mesAnnoncesTitle.closest(".profile-action-card") ||
            mesAnnoncesTitle.closest("div");

        const voirButton = within(mesAnnoncesCard).getByRole("button", {
            name: /voir/i,
        });

        fireEvent.click(voirButton);

        expect(navigateMock).toHaveBeenCalledWith("/my-listings");
    });
});
