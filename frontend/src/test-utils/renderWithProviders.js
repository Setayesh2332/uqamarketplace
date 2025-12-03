import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LanguageProvider } from "../contexts/LanguageContext";

// re-export RTL helpers (screen, fireEvent, etc.)
export * from "@testing-library/react";

// render only with LanguageProvider
export function renderWithProviders(ui, options) {
    return render(
        <LanguageProvider>
            {ui}
        </LanguageProvider>,
        options
    );
}

// render with LanguageProvider + Router
export function renderWithRouter(
    ui,
    { route = "/", ...options } = {}
) {
    window.history.pushState({}, "Test page", route);

    return render(
        <LanguageProvider>
            <MemoryRouter initialEntries={[route]}>
                {ui}
            </MemoryRouter>
        </LanguageProvider>,
        options
    );
}
