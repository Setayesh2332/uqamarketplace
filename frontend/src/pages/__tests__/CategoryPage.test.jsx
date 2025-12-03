import React from "react";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import CategoryPage from "../CategoryPage";
import { renderWithRouter } from "../../test-utils/renderWithProviders";
import * as listingsApi from "../../utils/listingsApi";
import * as routerDom from "react-router-dom";

jest.mock("../../utils/listingsApi");

jest.mock("react-router-dom", () => {
    const actual = jest.requireActual("react-router-dom");
    return {
        ...actual,
        useParams: jest.fn(),
        useNavigate: () => jest.fn(),
    };
});

const mockedUseParams = routerDom.useParams;

describe("CategoryPage", () => {
    const mockListings = [
        {
            id: 1,
            title: "Calculus Textbook",
            price: 45,
            category: "Manuel scolaire",
            condition: "Bon",
            status: "active",
            created_at: "2025-01-01T00:00:00.000Z",
        },
        {
            id: 2,
            title: "Scientific Calculator",
            price: 25,
            category: "Manuel scolaire",
            condition: "Excellent",
            status: "active",
            created_at: "2025-01-02T00:00:00.000Z",
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        mockedUseParams.mockReset();
    });

    test("displays page with category header", async () => {
        listingsApi.getListings.mockResolvedValue({ listings: [] });
        mockedUseParams.mockReturnValue({ category: "manuels" }); // ✅ valid category

        renderWithRouter(<CategoryPage />);

        // Wait for initial fetch
        await waitFor(() =>
            expect(listingsApi.getListings).toHaveBeenCalledTimes(1)
        );

        // Check for category-related heading
        expect(
            screen.getByRole("heading", { name: /annonces dans la catégorie/i })
        ).toBeInTheDocument();
    });

    test("displays toolbar with sort options", async () => {
        listingsApi.getListings.mockResolvedValue({ listings: mockListings });
        mockedUseParams.mockReturnValue({ category: "manuels" });

        renderWithRouter(<CategoryPage />);

        await waitFor(() =>
            expect(listingsApi.getListings).toHaveBeenCalledTimes(1)
        );

        // Check for sort dropdown
        expect(screen.getByText(/trier par/i)).toBeInTheDocument();
        expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    test("handles invalid category gracefully", async () => {
        // getListings should never be called because category is invalid
        listingsApi.getListings.mockResolvedValue({ listings: [] });
        mockedUseParams.mockReturnValue({ category: "invalid-category" }); // ❌ not in CATEGORY_MAP

        renderWithRouter(<CategoryPage />);

        const errorTexts = await screen.findAllByText(/catégorie non reconnue/i);
        expect(errorTexts.length).toBeGreaterThan(0);
        expect(listingsApi.getListings).not.toHaveBeenCalled();
    });

    test("displays search bar (via MenuBar)", async () => {
        listingsApi.getListings.mockResolvedValue({ listings: mockListings });
        mockedUseParams.mockReturnValue({ category: "manuels" });

        renderWithRouter(<CategoryPage />);

        await waitFor(() =>
            expect(listingsApi.getListings).toHaveBeenCalledTimes(1)
        );

        const searchInput = screen.getByPlaceholderText(/que cherchez-vous/i);
        expect(searchInput).toBeInTheDocument();
    });

    test("displays header navigation", async () => {
        listingsApi.getListings.mockResolvedValue({ listings: mockListings });
        mockedUseParams.mockReturnValue({ category: "manuels" });

        renderWithRouter(<CategoryPage />);

        await waitFor(() =>
            expect(listingsApi.getListings).toHaveBeenCalledTimes(1)
        );

        expect(screen.getByText(/uqamarketplace/i)).toBeInTheDocument();

        expect(
            screen.getByRole("button", { name: /vendre/i })
        ).toBeInTheDocument();
    });

    test("displays sort options correctly", async () => {
        listingsApi.getListings.mockResolvedValue({ listings: mockListings });
        mockedUseParams.mockReturnValue({ category: "manuels" });

        renderWithRouter(<CategoryPage />);

        await waitFor(() =>
            expect(listingsApi.getListings).toHaveBeenCalledTimes(1)
        );

        expect(screen.getByText(/prix le plus bas/i)).toBeInTheDocument();
        expect(screen.getByText(/prix le plus élevé/i)).toBeInTheDocument();
        expect(screen.getByText(/plus récent/i)).toBeInTheDocument();
    });

    test("renders main structure", async () => {
        listingsApi.getListings.mockResolvedValue({ listings: [] });
        mockedUseParams.mockReturnValue({ category: "manuels" });

        renderWithRouter(<CategoryPage />);

        await waitFor(() =>
            expect(listingsApi.getListings).toHaveBeenCalledTimes(1)
        );

        expect(screen.getByRole("main")).toBeInTheDocument();
        expect(screen.getByRole("search")).toBeInTheDocument();
    });

    test("refetches listings when search query changes", async () => {
        listingsApi.getListings.mockResolvedValue({ listings: mockListings });
        mockedUseParams.mockReturnValue({ category: "manuels" });

        renderWithRouter(<CategoryPage />);

        // Initial fetch
        await waitFor(() =>
            expect(listingsApi.getListings).toHaveBeenCalledTimes(1)
        );

        const searchInput = screen.getByPlaceholderText(/que cherchez-vous/i);

        fireEvent.change(searchInput, { target: { value: "Calculus" } });
        fireEvent.submit(searchInput.closest("form"));

        await waitFor(() =>
            expect(listingsApi.getListings).toHaveBeenCalledTimes(2)
        );

        const lastCall = listingsApi.getListings.mock.calls[1];
        const filters = lastCall[0];

        expect(filters.search).toBe("Calculus");
        expect(filters.category).toBe("Manuel scolaire");
    });

    test("refetches listings when sort option changes", async () => {
        listingsApi.getListings.mockResolvedValue({ listings: mockListings });
        mockedUseParams.mockReturnValue({ category: "manuels" });

        renderWithRouter(<CategoryPage />);

        // Initial fetch: default sort = prix_asc
        await waitFor(() =>
            expect(listingsApi.getListings).toHaveBeenCalledTimes(1)
        );

        const firstCall = listingsApi.getListings.mock.calls[0];
        const firstSort = firstCall[1];
        expect(firstSort).toEqual({ field: "price", order: "asc" });

        const sortSelect = screen.getByRole("combobox");

        fireEvent.change(sortSelect, { target: { value: "prix_desc" } });

        await waitFor(() =>
            expect(listingsApi.getListings).toHaveBeenCalledTimes(2)
        );

        const secondCall = listingsApi.getListings.mock.calls[1];
        const secondSort = secondCall[1];
        expect(secondSort).toEqual({ field: "price", order: "desc" });
    });

    test("shows error message when API call fails", async () => {
        listingsApi.getListings.mockRejectedValue(new Error("Boom"));
        mockedUseParams.mockReturnValue({ category: "manuels" });

        renderWithRouter(<CategoryPage />);

        const errorTexts = await screen.findAllByText(
            /erreur lors du chargement des annonces/i
        );

        expect(errorTexts.length).toBeGreaterThan(0);
    });


    test("shows empty state when no listings available", async () => {
        listingsApi.getListings.mockResolvedValue({ listings: [] });
        mockedUseParams.mockReturnValue({ category: "manuels" });

        renderWithRouter(<CategoryPage />);

        const emptyText = await screen.findByText(
            /aucune annonce disponible dans cette catégorie/i
        );
        expect(emptyText).toBeInTheDocument();
    });
});
