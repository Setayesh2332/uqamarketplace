import React from "react";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import HomePage from "../HomePage";
import { renderWithRouter } from "../../test-utils/renderWithProviders";
import { getListings } from "../../utils/listingsApi";

jest.mock("../../utils/listingsApi");

describe("HomePage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Default: no listings, but the call still succeeds
        getListings.mockResolvedValue({ listings: [] });
    });

    const renderPage = () => renderWithRouter(<HomePage />, { route: "/" });

    test("renders main page structure", () => {
        renderPage();
        expect(screen.getByRole("main")).toBeInTheDocument();
    });

    test("displays brand/logo", () => {
        renderPage();
        expect(screen.getByText(/uqamarketplace/i)).toBeInTheDocument();
    });

    test("renders search functionality", () => {
        renderPage();
        const searchInput = screen.getByPlaceholderText(/que cherchez-vous/i);
        expect(searchInput).toBeInTheDocument();
    });

    test("renders call-to-action button to sell", () => {
        renderPage();
        const sellButton = screen.getByRole("button", { name: /vendre/i });
        expect(sellButton).toBeInTheDocument();
    });

    test("has navigation structure", () => {
        renderPage();
        const navigation = screen.getByRole("banner") || document.querySelector("header");
        expect(navigation).toBeInTheDocument();
    });

    test("displays user profile icon/button", () => {
        renderPage();
        const profileButton = screen.getByRole("button", {
            name: /profil utilisateur/i,
        });
        expect(profileButton).toBeInTheDocument();
    });

    test("renders without crashing", () => {
        renderPage();
        expect(document.body).toBeInTheDocument();
    });

    test("displays search button", () => {
        renderPage();
        const searchButton = screen.getByRole("button", {
            name: /rechercher/i,
        });
        expect(searchButton).toBeInTheDocument();
    });

    test("has logout functionality visible", () => {
        renderPage();
        const logoutButton = screen.getByRole("button", {
            name: /déconnecter/i,
        });
        expect(logoutButton).toBeInTheDocument();
    });

    test("renders hero section", () => {
        renderPage();
        const headings = screen.getAllByRole("heading");
        expect(headings.length).toBeGreaterThan(0);
    });

    test("shows initial loading state in toolbar and grid", () => {
        // Default mock resolves, but initial render still shows loading UI
        renderPage();

        expect(screen.getByText("Chargement...")).toBeInTheDocument();
        expect(screen.getByText("Chargement des annonces...")).toBeInTheDocument();
    });

    test("calls getListings with default filters and sort", async () => {
        renderPage();

        await waitFor(() => {
            expect(getListings).toHaveBeenCalled();
        });

        const [filters, sort, limit] = getListings.mock.calls[0];

        expect(filters).toEqual({ status: "active" });
        expect(sort).toEqual({ field: "price", order: "asc" }); // sort = "prix_asc" by default
        expect(limit).toBe(100);
    });

    test("displays listings count and success state when fetch succeeds", async () => {
        const mockListings = [
            {
                id: "1",
                title: "Livre de maths",
                category: "Manuel scolaire",
                price: 30,
                condition: "Neuf",
                status: "active",
                description: "Un super livre",
                created_at: "2024-01-01T10:00:00Z",
                listing_images: [],
            },
            {
                id: "2",
                title: "Chaise de bureau",
                category: "Meubles",
                price: 60,
                condition: "Bon",
                status: "active",
                description: "Chaise confortable",
                created_at: "2024-02-01T10:00:00Z",
                listing_images: [],
            },
        ];

        getListings.mockResolvedValueOnce({ listings: mockListings });

        renderPage();
        await waitFor(() => {
            const matches = screen.getAllByText(/Livre de maths/i);
            expect(matches.length).toBeGreaterThan(0);
        });

        expect(
            screen.getByText("2 annonces disponibles")
        ).toBeInTheDocument();
    });

    test("displays empty state when there are no listings", async () => {
        getListings.mockResolvedValueOnce({ listings: [] });

        renderPage();

        await waitFor(() => {
            expect(
                screen.getByText("Aucune annonce disponible pour le moment.")
            ).toBeInTheDocument();
        });

        expect(
            screen.getByText("0 annonce disponible")
        ).toBeInTheDocument();
    });

    test("displays error message when API call fails", async () => {
        getListings.mockRejectedValueOnce(new Error("API Error"));

        renderPage();

        await waitFor(() => {
            const errors = screen.getAllByText("Erreur lors du chargement des annonces");
            expect(errors.length).toBeGreaterThanOrEqual(1);
        });
    });

    test("applies price and condition filters and calls getListings with them", async () => {
        getListings.mockResolvedValue({ listings: [] });

        renderPage();

        // Ensure initial call happened
        await waitFor(() => {
            expect(getListings).toHaveBeenCalled();
        });

        const minInput = screen.getByLabelText(/Prix minimum/i);
        const maxInput = screen.getByLabelText(/Prix maximum/i);
        const conditionSelect = screen.getByLabelText(/État/i);

        fireEvent.change(minInput, { target: { value: "10" } });
        fireEvent.change(maxInput, { target: { value: "100" } });
        fireEvent.change(conditionSelect, { target: { value: "Neuf" } });

        await waitFor(() => {
            expect(getListings.mock.calls.length).toBeGreaterThan(1);
        });

        const lastCall = getListings.mock.calls[getListings.mock.calls.length - 1];
        const [filters, sort, limit] = lastCall;

        expect(filters).toEqual({
            status: "active",
            min_price: 10,
            max_price: 100,
            condition: "Neuf",
        });
        expect(sort).toEqual({ field: "price", order: "asc" });
        expect(limit).toBe(100);
    });

    test("enables and uses 'Réinitialiser les filtres' button", async () => {
        getListings.mockResolvedValue({ listings: [] });

        renderPage();

        const minInput = screen.getByLabelText(/Prix minimum/i);
        const maxInput = screen.getByLabelText(/Prix maximum/i);
        const conditionSelect = screen.getByLabelText(/État/i);
        const resetButton = screen.getByRole("button", {
            name: /Réinitialiser les filtres/i,
        });

        // Initially disabled (no filters)
        expect(resetButton).toBeDisabled();

        fireEvent.change(minInput, { target: { value: "5" } });
        fireEvent.change(maxInput, { target: { value: "50" } });
        fireEvent.change(conditionSelect, { target: { value: "Bon" } });

        await waitFor(() => {
            expect(resetButton).not.toBeDisabled();
        });

        const callsBeforeReset = getListings.mock.calls.length;

        fireEvent.click(resetButton);

        await waitFor(() => {
            expect(minInput.value).toBe("");
            expect(maxInput.value).toBe("");
            expect(conditionSelect.value).toBe("");
        });

        await waitFor(() => {
            expect(getListings.mock.calls.length).toBeGreaterThan(callsBeforeReset);
        });
    });
});
