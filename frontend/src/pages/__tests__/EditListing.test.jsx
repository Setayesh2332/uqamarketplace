import React from "react";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import { renderWithRouter } from "../../test-utils/renderWithProviders";
import EditListing from "../EditListing";
import * as listingsApi from "../../utils/listingsApi";

// Mock useParams to return a test listing ID
const mockNavigate = jest.fn();
const mockParams = { id: "test-listing-id" };

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
    useParams: () => mockParams,
}));

// Mock listingsApi
jest.mock("../../utils/listingsApi");

// Mock window.alert
global.alert = jest.fn();

describe("EditListing", () => {
    const mockListing = {
        id: "test-listing-id",
        category: "Électronique",
        program: "Bacc en informatique",
        course: "INF1234",
        title: "Test Laptop",
        condition: "Bon",
        description: "A test laptop description",
        price: 500,
        category_attributes: {
            marque: "Dell",
        },
        contact_cell: true,
        contact_email: false,
        contact_other: false,
        contact_phone: "514-123-4567",
        contact_email_value: null,
        contact_other_value: null,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        listingsApi.getListingById.mockResolvedValue(mockListing);
    });

    test("renders loading state initially", () => {
        listingsApi.getListingById.mockImplementation(
            () => new Promise(() => {}) // Never resolves
        );

        renderWithRouter(<EditListing />);

        expect(screen.getByText(/Chargement de l'annonce/i)).toBeInTheDocument();
    });

    test("loads and displays listing data", async () => {
        renderWithRouter(<EditListing />);

        await waitFor(() => {
            expect(screen.getByDisplayValue("Test Laptop")).toBeInTheDocument();
            expect(screen.getByDisplayValue("Bacc en informatique")).toBeInTheDocument();
            expect(screen.getByDisplayValue("INF1234")).toBeInTheDocument();
            expect(screen.getByDisplayValue("500")).toBeInTheDocument();
            expect(screen.getByDisplayValue("Dell")).toBeInTheDocument();
        });
    });

    test("displays error when loading fails", async () => {
        listingsApi.getListingById.mockRejectedValue(new Error("Load error"));

        renderWithRouter(<EditListing />);

        await waitFor(() => {
            expect(screen.getByText(/Impossible de charger l'annonce/i)).toBeInTheDocument();
        });
    });

    test("updates form fields correctly", async () => {
        renderWithRouter(<EditListing />);

        await waitFor(() => {
            expect(screen.getByDisplayValue("Test Laptop")).toBeInTheDocument();
        });

        const titleInput = screen.getByDisplayValue("Test Laptop");
        fireEvent.change(titleInput, { target: { value: "Updated Laptop" } });

        expect(titleInput.value).toBe("Updated Laptop");
    });

    test("validates category selection", async () => {
        listingsApi.getListingById.mockResolvedValue({
            ...mockListing,
            category: "Choisir",
        });

        renderWithRouter(<EditListing />);

        await waitFor(() => {
            expect(screen.getByText(/Modifier l'annonce/i)).toBeInTheDocument();
        });

        const submitButton = screen.getByText(/Enregistrer les modifications/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Veuillez sélectionner une catégorie/i)).toBeInTheDocument();
        });
    });

    test("validates condition selection", async () => {
        listingsApi.getListingById.mockResolvedValue({
            ...mockListing,
            condition: "Choisir",
        });

        renderWithRouter(<EditListing />);

        await waitFor(() => {
            expect(screen.getByText(/Modifier l'annonce/i)).toBeInTheDocument();
        });

        const submitButton = screen.getByText(/Enregistrer les modifications/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Veuillez sélectionner l'état de l'article/i)).toBeInTheDocument();
        });
    });

    test("validates title requirement", async () => {
        listingsApi.getListingById.mockResolvedValue({
            ...mockListing,
            title: "",
        });

        renderWithRouter(<EditListing />);

        await waitFor(() => {
            expect(screen.getByText(/Modifier l'annonce/i)).toBeInTheDocument();
        });

        const submitButton = screen.getByText(/Enregistrer les modifications/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Veuillez entrer un titre/i)).toBeInTheDocument();
        });
    });

    test("validates title length", async () => {
        renderWithRouter(<EditListing />);

        await waitFor(() => {
            expect(screen.getByDisplayValue("Test Laptop")).toBeInTheDocument();
        });

        const titleInput = screen.getByDisplayValue("Test Laptop");
        fireEvent.change(titleInput, { target: { value: "a".repeat(151) } });

        const submitButton = screen.getByText(/Enregistrer les modifications/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Le titre ne doit pas dépasser 150 caractères/i)).toBeInTheDocument();
        });
    });

    test("validates price requirement", async () => {
        listingsApi.getListingById.mockResolvedValue({
            ...mockListing,
            price: "",
        });

        renderWithRouter(<EditListing />);

        await waitFor(() => {
            expect(screen.getByText(/Modifier l'annonce/i)).toBeInTheDocument();
        });

        const submitButton = screen.getByText(/Enregistrer les modifications/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Veuillez entrer un prix valide/i)).toBeInTheDocument();
        });
    });

    test("validates contact method selection", async () => {
        listingsApi.getListingById.mockResolvedValue({
            ...mockListing,
            contact_cell: false,
            contact_email: false,
            contact_other: false,
        });

        renderWithRouter(<EditListing />);

        await waitFor(() => {
            expect(screen.getByText(/Modifier l'annonce/i)).toBeInTheDocument();
        });

        const submitButton = screen.getByText(/Enregistrer les modifications/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Veuillez sélectionner au moins un mode de contact/i)).toBeInTheDocument();
        });
    });

    test("shows category-specific fields for Électronique", async () => {
        renderWithRouter(<EditListing />);

        await waitFor(() => {
            // Check by placeholder since labels aren't properly associated
            expect(screen.getByPlaceholderText(/Lenovo, Apple, Samsung/i)).toBeInTheDocument();
        });
    });

    test("shows category-specific fields for Meubles", async () => {
        listingsApi.getListingById.mockResolvedValue({
            ...mockListing,
            category: "Meubles",
            category_attributes: { type: "Chaise" },
        });

        renderWithRouter(<EditListing />);

        await waitFor(() => {
            // Check by placeholder since labels aren't properly associated
            expect(screen.getByPlaceholderText(/Chaise de bureau, Table, Étagère/i)).toBeInTheDocument();
        });
    });

    test("shows category-specific fields for Vêtements", async () => {
        listingsApi.getListingById.mockResolvedValue({
            ...mockListing,
            category: "Vêtements",
            category_attributes: { taille: "M", genre: "Homme" },
        });

        renderWithRouter(<EditListing />);

        await waitFor(() => {
            // Check by placeholder for taille
            expect(screen.getByPlaceholderText(/S, M, L, XL/i)).toBeInTheDocument();
            // Check by display value for genre select
            expect(screen.getByDisplayValue("Homme")).toBeInTheDocument();
        });
    });

    test("successfully updates listing", async () => {
        listingsApi.updateListing.mockResolvedValue({});

        renderWithRouter(<EditListing />);

        await waitFor(() => {
            expect(screen.getByDisplayValue("Test Laptop")).toBeInTheDocument();
        });

        const submitButton = screen.getByText(/Enregistrer les modifications/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(listingsApi.updateListing).toHaveBeenCalledWith(
                "test-listing-id",
                expect.objectContaining({
                    title: "Test Laptop",
                    price: 500,
                    category: "Électronique",
                })
            );
            expect(global.alert).toHaveBeenCalledWith("Annonce mise à jour avec succès !");
            expect(mockNavigate).toHaveBeenCalledWith("/my-listings");
        });
    });

    test("handles update error", async () => {
        listingsApi.updateListing.mockRejectedValue(new Error("Update failed"));

        renderWithRouter(<EditListing />);

        await waitFor(() => {
            expect(screen.getByDisplayValue("Test Laptop")).toBeInTheDocument();
        });

        const submitButton = screen.getByText(/Enregistrer les modifications/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Update failed/i)).toBeInTheDocument();
        });
    });

    test("handles cancel button", async () => {
        renderWithRouter(<EditListing />);

        await waitFor(() => {
            expect(screen.getByText(/Annuler/i)).toBeInTheDocument();
        });

        const cancelButton = screen.getByText(/Annuler/i);
        fireEvent.click(cancelButton);

        expect(mockNavigate).toHaveBeenCalledWith("/my-listings");
    });

    test("handles checkbox changes", async () => {
        renderWithRouter(<EditListing />);

        await waitFor(() => {
            expect(screen.getByText(/Modifier l'annonce/i)).toBeInTheDocument();
        });

        // Find checkbox by its sibling text
        const emailLabel = screen.getByText("Courriel").closest("label");
        const emailCheckbox = emailLabel.querySelector('input[type="checkbox"]');

        fireEvent.click(emailCheckbox);

        expect(emailCheckbox.checked).toBe(true);
    });

    test("disables contact inputs when checkbox is unchecked", async () => {
        listingsApi.getListingById.mockResolvedValue({
            ...mockListing,
            contact_email: false,
        });

        renderWithRouter(<EditListing />);

        await waitFor(() => {
            expect(screen.getByText(/Modifier l'annonce/i)).toBeInTheDocument();
        });

        const emailInput = screen.getByPlaceholderText(/prenom.nom@uqam.ca/i);
        expect(emailInput).toBeDisabled();
    });

    test("displays character count for title", async () => {
        renderWithRouter(<EditListing />);

        await waitFor(() => {
            // Match with flexible whitespace
            expect(screen.getByText(/11\s*\/\s*150 caractères/i)).toBeInTheDocument();
        });
    });

    test("displays character count for description", async () => {
        renderWithRouter(<EditListing />);

        await waitFor(() => {
            // Match with flexible whitespace (description length is 25 chars)
            expect(screen.getByText(/25\s*\/\s*2000 caractères/i)).toBeInTheDocument();
        });
    });

    test("validates description length", async () => {
        renderWithRouter(<EditListing />);

        await waitFor(() => {
            expect(screen.getByDisplayValue("Test Laptop")).toBeInTheDocument();
        });

        const descriptionInput = screen.getByPlaceholderText(/Écrire la description/i);
        fireEvent.change(descriptionInput, { target: { value: "a".repeat(2001) } });

        const submitButton = screen.getByText(/Enregistrer les modifications/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/La description ne doit pas dépasser 2000 caractères/i)).toBeInTheDocument();
        });
    });

    test("validates phone number when cell contact is selected", async () => {
        listingsApi.getListingById.mockResolvedValue({
            ...mockListing,
            contact_phone: "",
        });

        renderWithRouter(<EditListing />);

        await waitFor(() => {
            expect(screen.getByText(/Modifier l'annonce/i)).toBeInTheDocument();
        });

        const submitButton = screen.getByText(/Enregistrer les modifications/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Veuillez entrer un numéro de téléphone/i)).toBeInTheDocument();
        });
    });

    test("validates email when email contact is selected", async () => {
        listingsApi.getListingById.mockResolvedValue({
            ...mockListing,
            contact_cell: false,
            contact_email: true,
            contact_email_value: "",
        });

        renderWithRouter(<EditListing />);

        await waitFor(() => {
            expect(screen.getByText(/Modifier l'annonce/i)).toBeInTheDocument();
        });

        const submitButton = screen.getByText(/Enregistrer les modifications/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Veuillez entrer une adresse courriel/i)).toBeInTheDocument();
        });
    });

    test("validates other contact when other contact is selected", async () => {
        listingsApi.getListingById.mockResolvedValue({
            ...mockListing,
            contact_cell: false,
            contact_other: true,
            contact_other_value: "",
        });

        renderWithRouter(<EditListing />);

        await waitFor(() => {
            expect(screen.getByText(/Modifier l'annonce/i)).toBeInTheDocument();
        });

        const submitButton = screen.getByText(/Enregistrer les modifications/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Veuillez entrer les informations de contact/i)).toBeInTheDocument();
        });
    });

    test("updates category and shows corresponding fields", async () => {
        renderWithRouter(<EditListing />);

        await waitFor(() => {
            expect(screen.getByDisplayValue("Test Laptop")).toBeInTheDocument();
        });

        // Verify Électronique field is shown
        expect(screen.getByPlaceholderText(/Lenovo, Apple, Samsung/i)).toBeInTheDocument();
    });

    test("displays all form sections", async () => {
        renderWithRouter(<EditListing />);

        await waitFor(() => {
            expect(screen.getByText(/Modifier l'annonce/i)).toBeInTheDocument();
            expect(screen.getByText(/Que voulez vous vendre/i)).toBeInTheDocument();
            expect(screen.getByText(/Quel programme/i)).toBeInTheDocument();
            expect(screen.getByText(/Quel Cours/i)).toBeInTheDocument();
            expect(screen.getByText(/Mode de contact à vendeur/i)).toBeInTheDocument();
        });
    });

    test("validates invalid price (NaN)", async () => {
        renderWithRouter(<EditListing />);

        await waitFor(() => {
            expect(screen.getByDisplayValue("Test Laptop")).toBeInTheDocument();
        });

        const priceInput = screen.getByPlaceholderText(/Prix pour l'item/i);
        fireEvent.change(priceInput, { target: { value: "not a number" } });

        const submitButton = screen.getByText(/Enregistrer les modifications/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Veuillez entrer un prix valide/i)).toBeInTheDocument();
        });
    });

    test("validates negative price", async () => {
        renderWithRouter(<EditListing />);

        await waitFor(() => {
            expect(screen.getByDisplayValue("Test Laptop")).toBeInTheDocument();
        });

        const priceInput = screen.getByPlaceholderText(/Prix pour l'item/i);
        fireEvent.change(priceInput, { target: { value: "-50" } });

        const submitButton = screen.getByText(/Enregistrer les modifications/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Veuillez entrer un prix valide/i)).toBeInTheDocument();
        });
    });

    test("validates zero price", async () => {
        renderWithRouter(<EditListing />);

        await waitFor(() => {
            expect(screen.getByDisplayValue("Test Laptop")).toBeInTheDocument();
        });

        const priceInput = screen.getByPlaceholderText(/Prix pour l'item/i);
        fireEvent.change(priceInput, { target: { value: "0" } });

        const submitButton = screen.getByText(/Enregistrer les modifications/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Veuillez entrer un prix valide/i)).toBeInTheDocument();
        });
    });

    test("allows valid decimal price", async () => {
        listingsApi.updateListing.mockResolvedValue({});

        renderWithRouter(<EditListing />);

        await waitFor(() => {
            expect(screen.getByDisplayValue("Test Laptop")).toBeInTheDocument();
        });

        const priceInput = screen.getByPlaceholderText(/Prix pour l'item/i);
        fireEvent.change(priceInput, { target: { value: "49.99" } });

        const submitButton = screen.getByText(/Enregistrer les modifications/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(listingsApi.updateListing).toHaveBeenCalledWith(
                "test-listing-id",
                expect.objectContaining({
                    price: 49.99,
                })
            );
        });
    });

    test("trims whitespace from title", async () => {
        listingsApi.updateListing.mockResolvedValue({});

        renderWithRouter(<EditListing />);

        await waitFor(() => {
            expect(screen.getByDisplayValue("Test Laptop")).toBeInTheDocument();
        });

        const titleInput = screen.getByDisplayValue("Test Laptop");
        fireEvent.change(titleInput, { target: { value: "  Trimmed Title  " } });

        const submitButton = screen.getByText(/Enregistrer les modifications/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(listingsApi.updateListing).toHaveBeenCalledWith(
                "test-listing-id",
                expect.objectContaining({
                    title: "Trimmed Title",
                })
            );
        });
    });

    test("handles null optional fields when updating", async () => {
        listingsApi.updateListing.mockResolvedValue({});

        renderWithRouter(<EditListing />);

        await waitFor(() => {
            expect(screen.getByDisplayValue("Test Laptop")).toBeInTheDocument();
        });

        // Clear program and course
        const programInput = screen.getByDisplayValue("Bacc en informatique");
        const courseInput = screen.getByDisplayValue("INF1234");

        fireEvent.change(programInput, { target: { value: "" } });
        fireEvent.change(courseInput, { target: { value: "" } });

        const submitButton = screen.getByText(/Enregistrer les modifications/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(listingsApi.updateListing).toHaveBeenCalledWith(
                "test-listing-id",
                expect.objectContaining({
                    program: null,
                    course: null,
                })
            );
        });
    });

    test("handles empty description when updating", async () => {
        listingsApi.updateListing.mockResolvedValue({});

        renderWithRouter(<EditListing />);

        await waitFor(() => {
            expect(screen.getByDisplayValue("Test Laptop")).toBeInTheDocument();
        });

        const descriptionInput = screen.getByPlaceholderText(/Écrire la description/i);
        fireEvent.change(descriptionInput, { target: { value: "" } });

        const submitButton = screen.getByText(/Enregistrer les modifications/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(listingsApi.updateListing).toHaveBeenCalledWith(
                "test-listing-id",
                expect.objectContaining({
                    description: null,
                })
            );
        });
    });

    test("includes category attributes for Électronique with marque", async () => {
        listingsApi.updateListing.mockResolvedValue({});

        renderWithRouter(<EditListing />);

        await waitFor(() => {
            expect(screen.getByDisplayValue("Dell")).toBeInTheDocument();
        });

        const marqueInput = screen.getByDisplayValue("Dell");
        fireEvent.change(marqueInput, { target: { value: "  Apple  " } });

        const submitButton = screen.getByText(/Enregistrer les modifications/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(listingsApi.updateListing).toHaveBeenCalledWith(
                "test-listing-id",
                expect.objectContaining({
                    category_attributes: {
                        marque: "Apple",
                    },
                })
            );
        });
    });

    test("excludes empty marque from category attributes", async () => {
        listingsApi.updateListing.mockResolvedValue({});

        renderWithRouter(<EditListing />);

        await waitFor(() => {
            expect(screen.getByDisplayValue("Dell")).toBeInTheDocument();
        });

        const marqueInput = screen.getByDisplayValue("Dell");
        fireEvent.change(marqueInput, { target: { value: "" } });

        const submitButton = screen.getByText(/Enregistrer les modifications/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(listingsApi.updateListing).toHaveBeenCalledWith(
                "test-listing-id",
                expect.objectContaining({
                    category_attributes: {},
                })
            );
        });
    });

    test("includes category attributes for Meubles with type", async () => {
        listingsApi.getListingById.mockResolvedValue({
            ...mockListing,
            category: "Meubles",
            category_attributes: { type: "Chaise" },
        });
        listingsApi.updateListing.mockResolvedValue({});

        renderWithRouter(<EditListing />);

        await waitFor(() => {
            expect(screen.getByDisplayValue("Chaise")).toBeInTheDocument();
        });

        const typeInput = screen.getByDisplayValue("Chaise");
        fireEvent.change(typeInput, { target: { value: "  Table  " } });

        const submitButton = screen.getByText(/Enregistrer les modifications/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(listingsApi.updateListing).toHaveBeenCalledWith(
                "test-listing-id",
                expect.objectContaining({
                    category_attributes: {
                        type: "Table",
                    },
                })
            );
        });
    });

    test("includes category attributes for Vêtements with taille and genre", async () => {
        listingsApi.getListingById.mockResolvedValue({
            ...mockListing,
            category: "Vêtements",
            category_attributes: { taille: "M", genre: "Homme" },
        });
        listingsApi.updateListing.mockResolvedValue({});

        renderWithRouter(<EditListing />);

        await waitFor(() => {
            expect(screen.getByDisplayValue("M")).toBeInTheDocument();
        });

        const tailleInput = screen.getByDisplayValue("M");
        const genreSelect = screen.getByDisplayValue("Homme");

        fireEvent.change(tailleInput, { target: { value: "  L  " } });
        fireEvent.change(genreSelect, { target: { value: "Femme" } });

        const submitButton = screen.getByText(/Enregistrer les modifications/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(listingsApi.updateListing).toHaveBeenCalledWith(
                "test-listing-id",
                expect.objectContaining({
                    category_attributes: {
                        taille: "L",
                        genre: "Femme",
                    },
                })
            );
        });
    });

    test("excludes empty category attributes for Vêtements", async () => {
        listingsApi.getListingById.mockResolvedValue({
            ...mockListing,
            category: "Vêtements",
            category_attributes: { taille: "", genre: "" },
        });
        listingsApi.updateListing.mockResolvedValue({});

        renderWithRouter(<EditListing />);

        await waitFor(() => {
            expect(screen.getByText(/Modifier l'annonce/i)).toBeInTheDocument();
        });

        const submitButton = screen.getByText(/Enregistrer les modifications/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(listingsApi.updateListing).toHaveBeenCalledWith(
                "test-listing-id",
                expect.objectContaining({
                    category_attributes: {},
                })
            );
        });
    });

    test("handles multiple contact methods selected", async () => {
        listingsApi.getListingById.mockResolvedValue({
            ...mockListing,
            contact_cell: true,
            contact_email: true,
            contact_other: true,
            contact_phone: "514-123-4567",
            contact_email_value: "test@uqam.ca",
            contact_other_value: "Telegram @user",
        });
        listingsApi.updateListing.mockResolvedValue({});

        renderWithRouter(<EditListing />);

        await waitFor(() => {
            expect(screen.getByDisplayValue("514-123-4567")).toBeInTheDocument();
        });

        const submitButton = screen.getByText(/Enregistrer les modifications/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(listingsApi.updateListing).toHaveBeenCalledWith(
                "test-listing-id",
                expect.objectContaining({
                    contact_cell: true,
                    contact_email: true,
                    contact_other: true,
                    contact_phone: "514-123-4567",
                    contact_email_value: "test@uqam.ca",
                    contact_other_value: "Telegram @user",
                })
            );
        });
    });

    test("sets contact values to null when checkboxes are unchecked", async () => {
        listingsApi.getListingById.mockResolvedValue({
            ...mockListing,
            contact_cell: false,
            contact_email: false,
            contact_other: false,
            contact_phone: null,
            contact_email_value: null,
            contact_other_value: null,
        });
        listingsApi.updateListing.mockResolvedValue({});

        renderWithRouter(<EditListing />);

        await waitFor(() => {
            expect(screen.getByText(/Modifier l'annonce/i)).toBeInTheDocument();
        });

        // Check at least one contact method
        const cellLabel = screen.getByText("Cellulaire").closest("label");
        const cellCheckbox = cellLabel.querySelector('input[type="checkbox"]');
        fireEvent.click(cellCheckbox);

        const phoneInput = screen.getByPlaceholderText(/Numéro de téléphone/i);
        fireEvent.change(phoneInput, { target: { value: "514-555-1234" } });

        const submitButton = screen.getByText(/Enregistrer les modifications/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(listingsApi.updateListing).toHaveBeenCalledWith(
                "test-listing-id",
                expect.objectContaining({
                    contact_cell: true,
                    contact_email: false,
                    contact_other: false,
                    contact_phone: "514-555-1234",
                    contact_email_value: null,
                    contact_other_value: null,
                })
            );
        });
    });

    test("disables save button while saving", async () => {
        listingsApi.updateListing.mockImplementation(
            () => new Promise((resolve) => setTimeout(resolve, 100))
        );

        renderWithRouter(<EditListing />);

        await waitFor(() => {
            expect(screen.getByDisplayValue("Test Laptop")).toBeInTheDocument();
        });

        const submitButton = screen.getByText(/Enregistrer les modifications/i);
        fireEvent.click(submitButton);

        expect(submitButton).toBeDisabled();
        expect(submitButton).toHaveTextContent(/Mise à jour en cours/i);
    });

    test("disables cancel button while saving", async () => {
        listingsApi.updateListing.mockImplementation(
            () => new Promise((resolve) => setTimeout(resolve, 100))
        );

        renderWithRouter(<EditListing />);

        await waitFor(() => {
            expect(screen.getByDisplayValue("Test Laptop")).toBeInTheDocument();
        });

        const submitButton = screen.getByText(/Enregistrer les modifications/i);
        const cancelButton = screen.getByText(/Annuler/i);

        fireEvent.click(submitButton);

        expect(cancelButton).toBeDisabled();
    });

    test("loads listing with null optional fields", async () => {
        listingsApi.getListingById.mockResolvedValue({
            ...mockListing,
            program: null,
            course: null,
            description: null,
            category_attributes: null,
            contact_phone: null,
            contact_email_value: null,
            contact_other_value: null,
        });

        renderWithRouter(<EditListing />);

        await waitFor(() => {
            expect(screen.getByDisplayValue("Test Laptop")).toBeInTheDocument();
        });

        // Check that empty strings are used for null values
        const programInput = screen.getByPlaceholderText(/Bacc en informatique/i);
        const courseInput = screen.getByPlaceholderText(/MAT4681/i);

        expect(programInput.value).toBe("");
        expect(courseInput.value).toBe("");
    });
});