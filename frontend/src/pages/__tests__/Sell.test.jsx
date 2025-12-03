import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import Sell from "../Sell";
import { renderWithRouter } from "../../test-utils/renderWithProviders";
import * as listingsApi from "../../utils/listingsApi";
import { useNavigate } from "react-router-dom";

jest.mock("../../utils/listingsApi");

jest.mock("react-router-dom", () => {
    const actual = jest.requireActual("react-router-dom");
    return {
        ...actual,
        useNavigate: jest.fn(),
    };
});

beforeEach(() => {
    jest.clearAllMocks();
    if (typeof localStorage !== "undefined") {
        localStorage.clear();
    }
});

describe("Sell page", () => {
    test("valide le formulaire et appelle createListing", async () => {
        const mockNavigate = jest.fn();
        useNavigate.mockReturnValue(mockNavigate);

        listingsApi.createListing.mockResolvedValue({
            id: 1,
            title: "Test",
            price: 10,
            status: "active",
        });

        renderWithRouter(<Sell />);

        const selects = screen.getAllByRole("combobox");

        fireEvent.change(selects[0], {
            target: { value: "Manuel scolaire" },
        });

        fireEvent.change(selects[1], {
            target: { value: "Bon" },
        });

        fireEvent.change(screen.getByPlaceholderText(/Titre pour l'item/i), {
            target: { value: "INF3135 Notes" },
        });

        fireEvent.change(screen.getByPlaceholderText(/Prix pour l'item/i), {
            target: { value: "25" },
        });

        fireEvent.click(screen.getByLabelText(/Courriel/i));
        fireEvent.change(
            screen.getByPlaceholderText(/prenom.nom@uqam.ca/i),
            { target: { value: "test@uqam.ca" } }
        );

        fireEvent.click(
            screen.getByRole("button", { name: /Sauvegarder/i })
        );

        await waitFor(() => {
            expect(listingsApi.createListing).toHaveBeenCalledTimes(1);
        });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalled();
        });

        const [path] = mockNavigate.mock.calls[0];
        expect(path).toBe("/publish-success");
    });

    test("affiche un message d'erreur si le formulaire est incomplet", async () => {
        const mockNavigate = jest.fn();
        useNavigate.mockReturnValue(mockNavigate);

        renderWithRouter(<Sell />);

        fireEvent.click(
            screen.getByRole("button", { name: /Sauvegarder/i })
        );

        const error = await screen.findByText(/Veuillez sélectionner une catégorie/i);
        expect(error).toBeInTheDocument();

        expect(listingsApi.createListing).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    test("affiche un message d'erreur si createListing échoue", async () => {
        const mockNavigate = jest.fn();
        useNavigate.mockReturnValue(mockNavigate);

        listingsApi.createListing.mockRejectedValueOnce(
            new Error("Boom test")
        );

        renderWithRouter(<Sell />);

        const selects = screen.getAllByRole("combobox");

        fireEvent.change(selects[0], {
            target: { value: "Manuel scolaire" },
        });
        fireEvent.change(selects[1], {
            target: { value: "Bon" },
        });

        fireEvent.change(screen.getByPlaceholderText(/Titre pour l'item/i), {
            target: { value: "Livre de maths" },
        });

        fireEvent.change(screen.getByPlaceholderText(/Prix pour l'item/i), {
            target: { value: "30" },
        });

        fireEvent.click(screen.getByLabelText(/Courriel/i));
        fireEvent.change(
            screen.getByPlaceholderText(/prenom.nom@uqam.ca/i),
            { target: { value: "test@uqam.ca" } }
        );

        fireEvent.click(
            screen.getByRole("button", { name: /Sauvegarder/i })
        );

        const error = await screen.findByText(/Boom test/i);
        expect(error).toBeInTheDocument();

        expect(mockNavigate).not.toHaveBeenCalled();
    });

    test("envoie les attributs spécifiques pour la catégorie Électronique", async () => {
        const mockNavigate = jest.fn();
        useNavigate.mockReturnValue(mockNavigate);

        listingsApi.createListing.mockResolvedValue({
            id: 2,
            title: "Laptop",
            price: 999,
        });

        renderWithRouter(<Sell />);

        const selects = screen.getAllByRole("combobox");

        fireEvent.change(selects[0], {
            target: { value: "Électronique" },
        });

        fireEvent.change(selects[1], {
            target: { value: "Neuf" },
        });

        fireEvent.change(
            screen.getByPlaceholderText(/Lenovo, Apple, Samsung/i),
            { target: { value: "Apple" } }
        );

        fireEvent.change(screen.getByPlaceholderText(/Titre pour l'item/i), {
            target: { value: "MacBook Pro" },
        });

        fireEvent.change(screen.getByPlaceholderText(/Prix pour l'item/i), {
            target: { value: "1200" },
        });

        fireEvent.click(screen.getByLabelText(/Courriel/i));
        fireEvent.change(
            screen.getByPlaceholderText(/prenom.nom@uqam.ca/i),
            { target: { value: "test@uqam.ca" } }
        );

        fireEvent.click(
            screen.getByRole("button", { name: /Sauvegarder/i })
        );

        await waitFor(() => {
            expect(listingsApi.createListing).toHaveBeenCalledTimes(1);
        });

        const [payload] = listingsApi.createListing.mock.calls[0];
        expect(payload.category).toBe("Électronique");
        expect(payload.category_attributes).toEqual({
            marque: "Apple",
        });
    });

    test("envoie les attributs spécifiques pour la catégorie Meubles", async () => {
        const mockNavigate = jest.fn();
        useNavigate.mockReturnValue(mockNavigate);

        listingsApi.createListing.mockResolvedValue({
            id: 3,
            title: "Chaise",
            price: 40,
        });

        renderWithRouter(<Sell />);

        const selects = screen.getAllByRole("combobox");

        fireEvent.change(selects[0], {
            target: { value: "Meubles" },
        });

        fireEvent.change(selects[1], {
            target: { value: "Bon" },
        });

        fireEvent.change(
            screen.getByPlaceholderText(/Chaise de bureau, Table, Étagère/i),
            { target: { value: "Chaise de bureau" } }
        );

        fireEvent.change(screen.getByPlaceholderText(/Titre pour l'item/i), {
            target: { value: "Chaise ergonomique" },
        });

        fireEvent.change(screen.getByPlaceholderText(/Prix pour l'item/i), {
            target: { value: "40" },
        });

        fireEvent.click(screen.getByLabelText(/Courriel/i));
        fireEvent.change(
            screen.getByPlaceholderText(/prenom.nom@uqam.ca/i),
            { target: { value: "test@uqam.ca" } }
        );

        fireEvent.click(
            screen.getByRole("button", { name: /Sauvegarder/i })
        );

        await waitFor(() => {
            expect(listingsApi.createListing).toHaveBeenCalledTimes(1);
        });

        const [payload] = listingsApi.createListing.mock.calls[0];
        expect(payload.category).toBe("Meubles");
        expect(payload.category_attributes).toEqual({
            type: "Chaise de bureau",
        });
    });

    test("envoie les attributs spécifiques pour la catégorie Vêtements", async () => {
        const mockNavigate = jest.fn();
        useNavigate.mockReturnValue(mockNavigate);

        listingsApi.createListing.mockResolvedValue({
            id: 4,
            title: "T-shirt",
            price: 15,
        });

        renderWithRouter(<Sell />);

        const selects = screen.getAllByRole("combobox");

        fireEvent.change(selects[0], {
            target: { value: "Vêtements" },
        });

        fireEvent.change(selects[1], {
            target: { value: "Comme neuf" },
        });

        fireEvent.change(
            screen.getByPlaceholderText(/S, M, L, XL/i),
            { target: { value: "M" } }
        );

        fireEvent.change(
            screen.getByDisplayValue("Sélectionner"),
            { target: { value: "Unisexe" } }
        );

        fireEvent.change(screen.getByPlaceholderText(/Titre pour l'item/i), {
            target: { value: "T-shirt UQAM" },
        });

        fireEvent.change(screen.getByPlaceholderText(/Prix pour l'item/i), {
            target: { value: "15" },
        });

        fireEvent.click(screen.getByLabelText(/Courriel/i));
        fireEvent.change(
            screen.getByPlaceholderText(/prenom.nom@uqam.ca/i),
            { target: { value: "test@uqam.ca" } }
        );

        fireEvent.click(
            screen.getByRole("button", { name: /Sauvegarder/i })
        );

        await waitFor(() => {
            expect(listingsApi.createListing).toHaveBeenCalledTimes(1);
        });

        const [payload] = listingsApi.createListing.mock.calls[0];
        expect(payload.category).toBe("Vêtements");
        expect(payload.category_attributes).toEqual({
            taille: "M",
            genre: "Unisexe",
        });
    });

    test("affiche une erreur si aucun mode de contact n'est sélectionné", async () => {
        const mockNavigate = jest.fn();
        useNavigate.mockReturnValue(mockNavigate);

        renderWithRouter(<Sell />);

        const selects = screen.getAllByRole("combobox");

        fireEvent.change(selects[0], {
            target: { value: "Manuel scolaire" },
        });

        fireEvent.change(selects[1], {
            target: { value: "Bon" },
        });

        fireEvent.change(screen.getByPlaceholderText(/Titre pour l'item/i), {
            target: { value: "Livre INF" },
        });

        fireEvent.change(screen.getByPlaceholderText(/Prix pour l'item/i), {
            target: { value: "20" },
        });

        // ne clique sur aucun mode de contact
        fireEvent.click(
            screen.getByRole("button", { name: /Sauvegarder/i })
        );

        const error = await screen.findByText(/Veuillez sélectionner au moins un mode de contact/i);
        expect(error).toBeInTheDocument();

        expect(listingsApi.createListing).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    test("affiche une erreur si 'Autre' est sélectionné sans info de contact", async () => {
        const mockNavigate = jest.fn();
        useNavigate.mockReturnValue(mockNavigate);

        renderWithRouter(<Sell />);

        const selects = screen.getAllByRole("combobox");

        fireEvent.change(selects[0], {
            target: { value: "Autre" },
        });

        fireEvent.change(selects[1], {
            target: { value: "Acceptable" },
        });

        fireEvent.change(screen.getByPlaceholderText(/Titre pour l'item/i), {
            target: { value: "Objet random" },
        });

        fireEvent.change(screen.getByPlaceholderText(/Prix pour l'item/i), {
            target: { value: "5" },
        });

        // Sélectionne "Autre" mais ne remplit pas le champ
        fireEvent.click(screen.getByLabelText(/Autre/i));

        fireEvent.click(
            screen.getByRole("button", { name: /Sauvegarder/i })
        );

        const error = await screen.findByText(/Veuillez entrer les informations de contact/i);
        expect(error).toBeInTheDocument();

        expect(listingsApi.createListing).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    // NOUVEAU TEST : prix invalide (couvre la branche de validation du prix)
    test("n'appelle pas createListing si le prix est invalide", async () => {
        const mockNavigate = jest.fn();
        useNavigate.mockReturnValue(mockNavigate);

        renderWithRouter(<Sell />);

        const selects = screen.getAllByRole("combobox");

        fireEvent.change(selects[0], {
            target: { value: "Manuel scolaire" },
        });

        fireEvent.change(selects[1], {
            target: { value: "Bon" },
        });

        fireEvent.change(screen.getByPlaceholderText(/Titre pour l'item/i), {
            target: { value: "Livre INF" },
        });

        // prix négatif ou invalide
        fireEvent.change(screen.getByPlaceholderText(/Prix pour l'item/i), {
            target: { value: "-10" },
        });

        fireEvent.click(screen.getByLabelText(/Courriel/i));
        // ne remplit pas forcément l'email, on veut juste stopper avant l'API
        fireEvent.click(
            screen.getByRole("button", { name: /Sauvegarder/i })
        );

        await waitFor(() => {
            expect(listingsApi.createListing).not.toHaveBeenCalled();
            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });

    // NOUVEAU TEST : Cellulaire sélectionné mais numéro vide
    test("n'appelle pas createListing si 'Cellulaire' est coché sans numéro", async () => {
        const mockNavigate = jest.fn();
        useNavigate.mockReturnValue(mockNavigate);

        renderWithRouter(<Sell />);

        const selects = screen.getAllByRole("combobox");

        fireEvent.change(selects[0], {
            target: { value: "Manuel scolaire" },
        });

        fireEvent.change(selects[1], {
            target: { value: "Bon" },
        });

        fireEvent.change(screen.getByPlaceholderText(/Titre pour l'item/i), {
            target: { value: "Livre INF" },
        });

        fireEvent.change(screen.getByPlaceholderText(/Prix pour l'item/i), {
            target: { value: "20" },
        });

        // coche Cellulaire mais ne remplit pas le champ téléphone
        fireEvent.click(screen.getByLabelText(/Cellulaire/i));

        fireEvent.click(
            screen.getByRole("button", { name: /Sauvegarder/i })
        );

        await waitFor(() => {
            expect(listingsApi.createListing).not.toHaveBeenCalled();
            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });

    // NOUVEAU TEST : Courriel sélectionné mais email vide
    test("n'appelle pas createListing si 'Courriel' est coché sans email", async () => {
        const mockNavigate = jest.fn();
        useNavigate.mockReturnValue(mockNavigate);

        renderWithRouter(<Sell />);

        const selects = screen.getAllByRole("combobox");

        fireEvent.change(selects[0], {
            target: { value: "Manuel scolaire" },
        });

        fireEvent.change(selects[1], {
            target: { value: "Bon" },
        });

        fireEvent.change(screen.getByPlaceholderText(/Titre pour l'item/i), {
            target: { value: "Livre INF" },
        });

        fireEvent.change(screen.getByPlaceholderText(/Prix pour l'item/i), {
            target: { value: "20" },
        });

        // coche Courriel mais ne remplit pas l'email
        fireEvent.click(screen.getByLabelText(/Courriel/i));

        fireEvent.click(
            screen.getByRole("button", { name: /Sauvegarder/i })
        );

        await waitFor(() => {
            expect(listingsApi.createListing).not.toHaveBeenCalled();
            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });

    test("gère l'ajout et la suppression d'images", async () => {
        const mockNavigate = jest.fn();
        useNavigate.mockReturnValue(mockNavigate);

        // mock URL + crypto pour les images
        global.URL.createObjectURL = jest.fn(() => "blob:mock-url");
        global.URL.revokeObjectURL = jest.fn();

        Object.defineProperty(global, "crypto", {
            value: { randomUUID: jest.fn(() => "mock-uuid") },
        });

        const { container } = renderWithRouter(<Sell />);

        const fileInput = container.querySelector('input[type="file"]');

        const file = new File(["dummy"], "photo.png", { type: "image/png" });

        Object.defineProperty(fileInput, "files", {
            value: [file],
        });

        fireEvent.change(fileInput);

        // image preview visible
        const img = await screen.findByAltText(/aperçu/i);
        expect(img).toBeInTheDocument();

        // bouton de suppression
        const deleteBtn = screen.getByRole("button", {
            name: /Supprimer cette image/i,
        });

        fireEvent.click(deleteBtn);

        // l'image doit disparaître
        await waitFor(() => {
            expect(screen.queryByAltText(/aperçu/i)).toBeNull();
        });

        // revokeObjectURL appelé
        expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });
});
