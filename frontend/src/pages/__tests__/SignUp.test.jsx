import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithRouter } from "../../test-utils/renderWithProviders";
import SignUp from "../signUp";

// Mock AuthContext
const mockSignUp = jest.fn().mockResolvedValue(undefined);

jest.mock("../../contexts/AuthContext", () => ({
    useAuth: () => ({
        signUp: mockSignUp,
    }),
}));

beforeEach(() => {
    mockSignUp.mockClear();
});

describe("SignUp page", () => {
    test("render la page d'inscription avec au moins un champ et un bouton submit", () => {
        renderWithRouter(<SignUp />);

        // au moins un champ texte (first name, email, etc.)
        const textInputs = screen.getAllByRole("textbox");
        expect(textInputs.length).toBeGreaterThan(0);

        // bouton de submit principal : "Sign up"
        const submitButton = screen.getByRole("button", { name: /sign up/i });
        expect(submitButton).toBeInTheDocument();
    });

    test("validates email format", async () => {
        renderWithRouter(<SignUp />);

        // Champ email : placeholder unique
        const emailInput = screen.getByPlaceholderText(/prenom\.nom@uqam\.ca/i);
        const submitButton = screen.getByRole("button", { name: /sign up/i });

        // Email invalide (pas uqam)
        fireEvent.change(emailInput, { target: { value: "invalid@gmail.com" } });
        fireEvent.click(submitButton);

        // Message d'erreur global du formulaire
        await waitFor(() => {
            expect(
                screen.getByText(/please correct the errors in the form/i)
            ).toBeInTheDocument();
        });
    });

    test("shows error when passwords do not match", async () => {
        renderWithRouter(<SignUp />);

        const firstNameInput = screen.getByPlaceholderText(/ex\. amira/i);
        const lastNameInput = screen.getByPlaceholderText(/ex\. tremblay/i);
        const emailInput = screen.getByPlaceholderText(/prenom\.nom@uqam\.ca/i);

        // Utiliser les placeholders uniques pour les 2 mots de passe
        const passwordInput = screen.getByPlaceholderText(
            /min\. 8 characters, uppercase, lowercase, digit, symbol/i
        );
        const confirmInput = screen.getByPlaceholderText(/repeat the password/i);

        const studyCycleSelect = screen.getByLabelText(/study cycle/i);
        const schoolYearSelect = screen.getByLabelText(/school year/i);
        const submitButton = screen.getByRole("button", { name: /sign up/i });

        fireEvent.change(firstNameInput, { target: { value: "Amira" } });
        fireEvent.change(lastNameInput, { target: { value: "Tremblay" } });

        // Email UQAM valide selon validateEmail (termine par ".uqam.ca")
        fireEvent.change(emailInput, {
            target: { value: "amira.tremblay@etud.uqam.ca" },
        });

        fireEvent.change(passwordInput, {
            target: { value: "ValidPass123!" },
        });
        // Mot de passe différent pour le confirm
        fireEvent.change(confirmInput, {
            target: { value: "DifferentPass!" },
        });

        fireEvent.change(studyCycleSelect, { target: { value: "bachelor" } });
        fireEvent.change(schoolYearSelect, { target: { value: "1" } });

        fireEvent.click(submitButton);

        // On se contente de vérifier qu'il y a bien une erreur globale
        await waitFor(() => {
            expect(
                screen.getByText(/please correct the errors in the form/i)
            ).toBeInTheDocument();
        });
    });

    test("submits form with valid data (ou au moins appelle signUp)", async () => {
        renderWithRouter(<SignUp />);

        const firstNameInput = screen.getByPlaceholderText(/ex\. amira/i);
        const lastNameInput = screen.getByPlaceholderText(/ex\. tremblay/i);
        const emailInput = screen.getByPlaceholderText(/prenom\.nom@uqam\.ca/i);

        const passwordInput = screen.getByPlaceholderText(
            /min\. 8 characters, uppercase, lowercase, digit, symbol/i
        );
        const confirmInput = screen.getByPlaceholderText(/repeat the password/i);

        const studyCycleSelect = screen.getByLabelText(/study cycle/i);
        const schoolYearSelect = screen.getByLabelText(/school year/i);

        const submitButton = screen.getByRole("button", { name: /sign up/i });

        fireEvent.change(firstNameInput, { target: { value: "Alice" } });
        fireEvent.change(lastNameInput, { target: { value: "Tremblay" } });

        // Email UQAM valide (doit se terminer par ".uqam.ca")
        fireEvent.change(emailInput, {
            target: { value: "alice.tremblay@etud.uqam.ca" },
        });

        fireEvent.change(passwordInput, {
            target: { value: "ValidPass123!" },
        });
        fireEvent.change(confirmInput, {
            target: { value: "ValidPass123!" },
        });

        fireEvent.change(studyCycleSelect, { target: { value: "bachelor" } });
        fireEvent.change(schoolYearSelect, { target: { value: "1" } });

        fireEvent.click(submitButton);

        // Vérifier que signUp a bien été appelé une fois dans CE test
        await waitFor(() => {
            expect(mockSignUp).toHaveBeenCalledTimes(1);
        });
    });

    // NEW: field-level validation via onBlur (covers handleBlur + validateField path)
    test("shows a field-level error on blur when first name is empty", async () => {
        renderWithRouter(<SignUp />);

        const firstNameInput = screen.getByPlaceholderText(/ex\. amira/i);

        // blur without entering anything
        fireEvent.blur(firstNameInput);

        // We don't assert exact message (depends on i18n), just that an error span appears
        await waitFor(() => {
            const errorMessages = document.querySelectorAll(
                ".signup-error-message"
            );
            expect(errorMessages.length).toBeGreaterThan(0);
        });
    });

    // NEW: password visibility toggles (covers showPassword/showConfirmPassword state)
    test("toggles password and confirm password visibility when clicking eye icons", () => {
        const { container } = renderWithRouter(<SignUp />);

        const passwordInput = screen.getByPlaceholderText(
            /min\. 8 characters, uppercase, lowercase, digit, symbol/i
        );
        const confirmInput = screen.getByPlaceholderText(/repeat the password/i);

        const toggleButtons = container.querySelectorAll(".signup-password-toggle");
        const passwordToggle = toggleButtons[0];
        const confirmToggle = toggleButtons[1];

        expect(passwordInput).toHaveAttribute("type", "password");
        expect(confirmInput).toHaveAttribute("type", "password");

        fireEvent.click(passwordToggle);
        expect(passwordInput).toHaveAttribute("type", "text");

        fireEvent.click(confirmToggle);
        expect(confirmInput).toHaveAttribute("type", "text");
    });

    // NEW: backend error – special case (status 400 + "confirm" in message)
    test("shows backend email confirmation error when signUp throws 400 confirm error", async () => {
        // This test uses the special branch: code === 400 && message includes "confirm"
        mockSignUp.mockRejectedValueOnce({
            status: 400,
            message: "Please confirm your email address",
        });

        const { container } = renderWithRouter(<SignUp />);

        const firstNameInput = screen.getByPlaceholderText(/ex\. amira/i);
        const lastNameInput = screen.getByPlaceholderText(/ex\. tremblay/i);
        const emailInput = screen.getByPlaceholderText(/prenom\.nom@uqam\.ca/i);

        const passwordInput = screen.getByPlaceholderText(
            /min\. 8 characters, uppercase, lowercase, digit, symbol/i
        );
        const confirmInput = screen.getByPlaceholderText(/repeat the password/i);

        const studyCycleSelect = screen.getByLabelText(/study cycle/i);
        const schoolYearSelect = screen.getByLabelText(/school year/i);

        const submitButton = screen.getByRole("button", { name: /sign up/i });

        fireEvent.change(firstNameInput, { target: { value: "Alice" } });
        fireEvent.change(lastNameInput, { target: { value: "Tremblay" } });
        fireEvent.change(emailInput, {
            target: { value: "alice.tremblay@etud.uqam.ca" },
        });
        fireEvent.change(passwordInput, {
            target: { value: "ValidPass123!" },
        });
        fireEvent.change(confirmInput, {
            target: { value: "ValidPass123!" },
        });
        fireEvent.change(studyCycleSelect, { target: { value: "bachelor" } });
        fireEvent.change(schoolYearSelect, { target: { value: "1" } });

        fireEvent.click(submitButton);

        await waitFor(() => {
            const errorDiv = container.querySelector(".signup-alert--error");
            expect(errorDiv).toBeInTheDocument();
        });

        // Make sure success is not shown in this failure case
        const successDiv = container.querySelector(".signup-alert--success");
        expect(successDiv).toBeNull();
    });

    // NEW: backend error – generic error branch (else part of catch)
    test("shows generic backend error when signUp throws non-400 error", async () => {
        mockSignUp.mockRejectedValueOnce({
            status: 500,
            message: "Server exploded",
        });

        const { container } = renderWithRouter(<SignUp />);

        const firstNameInput = screen.getByPlaceholderText(/ex\. amira/i);
        const lastNameInput = screen.getByPlaceholderText(/ex\. tremblay/i);
        const emailInput = screen.getByPlaceholderText(/prenom\.nom@uqam\.ca/i);

        const passwordInput = screen.getByPlaceholderText(
            /min\. 8 characters, uppercase, lowercase, digit, symbol/i
        );
        const confirmInput = screen.getByPlaceholderText(/repeat the password/i);

        const studyCycleSelect = screen.getByLabelText(/study cycle/i);
        const schoolYearSelect = screen.getByLabelText(/school year/i);

        const submitButton = screen.getByRole("button", { name: /sign up/i });

        fireEvent.change(firstNameInput, { target: { value: "Alice" } });
        fireEvent.change(lastNameInput, { target: { value: "Tremblay" } });
        fireEvent.change(emailInput, {
            target: { value: "alice.tremblay@etud.uqam.ca" },
        });
        fireEvent.change(passwordInput, {
            target: { value: "ValidPass123!" },
        });
        fireEvent.change(confirmInput, {
            target: { value: "ValidPass123!" },
        });
        fireEvent.change(studyCycleSelect, { target: { value: "bachelor" } });
        fireEvent.change(schoolYearSelect, { target: { value: "1" } });

        fireEvent.click(submitButton);

        await waitFor(() => {
            const errorDiv = container.querySelector(".signup-alert--error");
            expect(errorDiv).toBeInTheDocument();
            // Here we *can* assert message, since we control it
            expect(errorDiv.textContent).toMatch(/server exploded/i);
        });
    });
});
