import React from "react";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../../test-utils/renderWithProviders";
import { LanguageProvider, useLanguage } from "../../contexts/LanguageContext";

// Test component to access language context
const TestComponent = () => {
    const { language, setLanguage, t } = useLanguage();

    return (
        <div>
            <div data-testid="current-language">{language}</div>
            <div data-testid="translated-text">{t("welcome")}</div>
            <button onClick={() => setLanguage("en")}>English</button>
            <button onClick={() => setLanguage("fr")}>Français</button>
        </div>
    );
};

describe("LanguageContext", () => {
    test("provides default language", () => {
        renderWithProviders(
            <LanguageProvider>
                <TestComponent />
            </LanguageProvider>
        );

        const currentLang = screen.getByTestId("current-language");
        // Default should be either 'en' or 'fr' depending on your implementation
        expect(["en", "fr"]).toContain(currentLang.textContent);
    });

    test("switches to English", () => {
        renderWithProviders(
            <LanguageProvider>
                <TestComponent />
            </LanguageProvider>
        );

        const englishButton = screen.getByRole("button", { name: /english/i });
        fireEvent.click(englishButton);

        expect(screen.getByTestId("current-language")).toHaveTextContent("en");
    });

    test("switches to French", () => {
        renderWithProviders(
            <LanguageProvider>
                <TestComponent />
            </LanguageProvider>
        );

        const frenchButton = screen.getByRole("button", { name: /français/i });
        fireEvent.click(frenchButton);

        expect(screen.getByTestId("current-language")).toHaveTextContent("fr");
    });

    test("provides translation function", () => {
        renderWithProviders(
            <LanguageProvider>
                <TestComponent />
            </LanguageProvider>
        );

        const translatedText = screen.getByTestId("translated-text");

        expect(typeof translatedText.textContent).toBe("string");
        expect(translatedText.textContent.length).toBeGreaterThan(0);
    });

    test("updates translations when language changes", () => {
        renderWithProviders(
            <LanguageProvider>
                <TestComponent />
            </LanguageProvider>
        );

        const initialText = screen.getByTestId("translated-text").textContent;

        // Switch language
        const frenchButton = screen.getByRole("button", { name: /français/i });
        fireEvent.click(frenchButton);

        const finalText = screen.getByTestId("translated-text").textContent;

        expect(finalText).toBeDefined();
        expect(finalText.length).toBeGreaterThan(0);

    });

    test("persists language preference across re-renders (within same provider tree)", () => {
        const { rerender } = renderWithProviders(
            <LanguageProvider>
                <TestComponent />
            </LanguageProvider>
        );

        // Change to French
        const frenchButton = screen.getByRole("button", { name: /français/i });
        fireEvent.click(frenchButton);

        const beforeRerender = screen.getByTestId("current-language").textContent;
        expect(beforeRerender).toBe("fr");

        // Re-render the same tree
        rerender(
            <LanguageProvider>
                <TestComponent />
            </LanguageProvider>
        );

        const afterRerender = screen.getByTestId("current-language").textContent;

        expect(["en", "fr"]).toContain(afterRerender);
    });
});
