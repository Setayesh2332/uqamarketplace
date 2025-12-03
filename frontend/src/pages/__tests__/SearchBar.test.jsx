import React from "react";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../../test-utils/renderWithProviders";
import SearchBar from "../../components/SearchBar";

describe("SearchBar", () => {
    test("updates search input", () => {
        renderWithProviders(<SearchBar onSearch={() => {}} />);

        const input = screen.getByPlaceholderText(/que cherchez-vous/i);

        fireEvent.change(input, { target: { value: "manuel" } });
        expect(input.value).toBe("manuel");
    });

    test("triggers search on submit", () => {
        const mockOnSearch = jest.fn();

        renderWithProviders(<SearchBar onSearch={mockOnSearch} />);

        const input = screen.getByPlaceholderText(/que cherchez-vous/i);
        fireEvent.change(input, { target: { value: "calculatrice" } });

        // submit the form
        fireEvent.submit(input.closest("form"));

        expect(mockOnSearch).toHaveBeenCalledWith("calculatrice");
    });
});
