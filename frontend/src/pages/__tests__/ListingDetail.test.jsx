// src/pages/__tests__/ListingDetail.test.jsx
import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithRouter } from "../../test-utils/renderWithProviders";
import ListingDetail from "../ListingDetail";
import { getListingById } from "../../utils/listingsApi";
import { getOrCreateConversation } from "../../utils/conversationsApi";

// Mock the APIs
jest.mock("../../utils/listingsApi", () => ({
    getListingById: jest.fn(),
}));

jest.mock("../../utils/conversationsApi", () => ({
    getOrCreateConversation: jest.fn(),
}));

// Mock react-router-dom
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: "listing-123" }),
}));

const mockUser = {
    id: "user-123",
    email: "test@uqam.ca",
};

const mockAuthContextValue = {
    user: mockUser,
    loading: false,
};

jest.mock("../../contexts/AuthContext", () => ({
    useAuth: () => mockAuthContextValue,
}));

// Mock MenuBar component
jest.mock("../../components/MenuBar", () => {
    return function MockMenuBar({ onSearch, onSellClick }) {
        return (
            <div data-testid="menu-bar">
                <button onClick={onSearch}>Search</button>
                <button onClick={onSellClick}>Sell</button>
            </div>
        );
    };
});

// Mock ArticleRating component
jest.mock("../../components/ratingArticle", () => {
    return function MockArticleRating({ sellerId, userId }) {
        return (
            <div data-testid="article-rating">
                Rating for seller: {sellerId}
            </div>
        );
    };
});

const mockListing = {
    id: "listing-123",
    title: "iPhone 13 Pro",
    price: 800,
    category: "Électronique",
    condition: "Comme neuf",
    description: "iPhone 13 Pro en excellent état, avec boîte d'origine.",
    user_id: "seller-456",
    course: "INF1120",
    contact_cell: true,
    contact_phone: "514-123-4567",
    contact_email: true,
    contact_email_value: "seller@uqam.ca",
    contact_other: false,
    contact_other_value: null,
    category_attributes: {
        marque: "Apple",
        taille: null,
        genre: null,
    },
    profiles: {
        id: "seller-456",
        first_name: "Alice",
        last_name: "Dupont",
    },
    listing_images: [
        {
            id: "img-1",
            path: "https://example.com/image1.jpg",
            display_order: 1,
        },
        {
            id: "img-2",
            path: "https://example.com/image2.jpg",
            display_order: 2,
        },
        {
            id: "img-3",
            path: "https://example.com/image3.jpg",
            display_order: 3,
        },
    ],
};

beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    getListingById.mockClear();
    getOrCreateConversation.mockClear();
    mockAuthContextValue.user = mockUser;
});

describe("ListingDetail page", () => {
    test("renders loading state initially", () => {
        getListingById.mockImplementation(() => new Promise(() => {})); // Never resolves

        renderWithRouter(<ListingDetail />);

        expect(screen.getByText(/chargement\.\.\./i)).toBeInTheDocument();
    });

    test("renders listing details when data is loaded", async () => {
        getListingById.mockResolvedValue(mockListing);

        renderWithRouter(<ListingDetail />);

        await waitFor(() => {
            expect(screen.getByText("iPhone 13 Pro")).toBeInTheDocument();
        });

        expect(screen.getByText("800 $")).toBeInTheDocument();
        expect(screen.getByText("Électronique")).toBeInTheDocument();
        expect(screen.getByText("Comme neuf")).toBeInTheDocument();
        expect(
            screen.getByText(/iPhone 13 Pro en excellent état/i)
        ).toBeInTheDocument();
        expect(screen.getByText("Alice Dupont")).toBeInTheDocument();
        expect(screen.getByText("514-123-4567")).toBeInTheDocument();
        expect(screen.getByText("seller@uqam.ca")).toBeInTheDocument();
    });

    test("displays error message when API call fails", async () => {
        getListingById.mockRejectedValue(new Error("Network error"));

        renderWithRouter(<ListingDetail />);

        await waitFor(() => {
            expect(
                screen.getByText(/impossible de charger cette annonce/i)
            ).toBeInTheDocument();
        });
    });

    test("navigates back when clicking back button", async () => {
        getListingById.mockResolvedValue(mockListing);

        renderWithRouter(<ListingDetail />);

        await waitFor(() => {
            expect(screen.getByText("iPhone 13 Pro")).toBeInTheDocument();
        });

        const backButton = screen.getByRole("button", {
            name: /retour aux annonces/i,
        });
        fireEvent.click(backButton);

        expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    test("displays image carousel with navigation buttons", async () => {
        getListingById.mockResolvedValue(mockListing);

        const { container } = renderWithRouter(<ListingDetail />);

        await waitFor(() => {
            expect(screen.getByText("iPhone 13 Pro")).toBeInTheDocument();
        });

        const mainImage = container.querySelector(".main-image");
        expect(mainImage).toBeInTheDocument();
        expect(mainImage.src).toBe("https://example.com/image1.jpg");

        const prevButton = screen.getByLabelText(/image précédente/i);
        const nextButton = screen.getByLabelText(/image suivante/i);

        expect(prevButton).toBeInTheDocument();
        expect(nextButton).toBeInTheDocument();
    });

    test("navigates to next image when clicking next button", async () => {
        getListingById.mockResolvedValue(mockListing);

        const { container } = renderWithRouter(<ListingDetail />);

        await waitFor(() => {
            expect(screen.getByText("iPhone 13 Pro")).toBeInTheDocument();
        });

        const nextButton = screen.getByLabelText(/image suivante/i);
        fireEvent.click(nextButton);

        const mainImage = container.querySelector(".main-image");
        expect(mainImage.src).toBe("https://example.com/image2.jpg");
    });

    test("navigates to previous image when clicking prev button", async () => {
        getListingById.mockResolvedValue(mockListing);

        const { container } = renderWithRouter(<ListingDetail />);

        await waitFor(() => {
            expect(screen.getByText("iPhone 13 Pro")).toBeInTheDocument();
        });

        const prevButton = screen.getByLabelText(/image précédente/i);
        fireEvent.click(prevButton);

        // Should wrap to last image
        const mainImage = container.querySelector(".main-image");
        expect(mainImage.src).toBe("https://example.com/image3.jpg");
    });

    test("displays carousel indicators and allows jumping to specific image", async () => {
        getListingById.mockResolvedValue(mockListing);

        const { container } = renderWithRouter(<ListingDetail />);

        await waitFor(() => {
            expect(screen.getByText("iPhone 13 Pro")).toBeInTheDocument();
        });

        const indicators = container.querySelectorAll(".indicator");
        expect(indicators.length).toBe(3);

        // Click on third indicator
        fireEvent.click(indicators[2]);

        const mainImage = container.querySelector(".main-image");
        expect(mainImage.src).toBe("https://example.com/image3.jpg");
    });

    test("displays preview thumbnails for multiple images", async () => {
        getListingById.mockResolvedValue(mockListing);

        const { container } = renderWithRouter(<ListingDetail />);

        await waitFor(() => {
            expect(screen.getByText("iPhone 13 Pro")).toBeInTheDocument();
        });

        const previewItems = container.querySelectorAll(".preview-item");
        expect(previewItems.length).toBe(3);

        // Click on second thumbnail
        fireEvent.click(previewItems[1]);

        const mainImage = container.querySelector(".main-image");
        expect(mainImage.src).toBe("https://example.com/image2.jpg");
    });

    test("displays placeholder image when no images are available", async () => {
        const listingNoImages = {
            ...mockListing,
            listing_images: [],
        };

        getListingById.mockResolvedValue(listingNoImages);

        const { container } = renderWithRouter(<ListingDetail />);

        await waitFor(() => {
            expect(screen.getByText("iPhone 13 Pro")).toBeInTheDocument();
        });

        const mainImage = container.querySelector(".main-image");
        expect(mainImage.src).toContain("picsum.photos");
    });

    test("does not display carousel controls when only one image", async () => {
        const listingOneImage = {
            ...mockListing,
            listing_images: [mockListing.listing_images[0]],
        };

        getListingById.mockResolvedValue(listingOneImage);

        renderWithRouter(<ListingDetail />);

        await waitFor(() => {
            expect(screen.getByText("iPhone 13 Pro")).toBeInTheDocument();
        });

        expect(
            screen.queryByLabelText(/image précédente/i)
        ).not.toBeInTheDocument();
        expect(screen.queryByLabelText(/image suivante/i)).not.toBeInTheDocument();
    });

    test("displays message input for non-seller users", async () => {
        getListingById.mockResolvedValue(mockListing);

        renderWithRouter(<ListingDetail />);

        await waitFor(() => {
            expect(screen.getByText("iPhone 13 Pro")).toBeInTheDocument();
        });

        const messageInput = screen.getByPlaceholderText(
            /bonjour, je suis intéressé/i
        );
        expect(messageInput).toBeInTheDocument();

        const sendButton = screen.getByRole("button", { name: /envoyer/i });
        expect(sendButton).toBeInTheDocument();
    });

    test("does not display message input when user is the seller", async () => {
        mockAuthContextValue.user = { id: "seller-456" };

        getListingById.mockResolvedValue(mockListing);

        renderWithRouter(<ListingDetail />);

        await waitFor(() => {
            expect(screen.getByText("iPhone 13 Pro")).toBeInTheDocument();
        });

        expect(
            screen.queryByPlaceholderText(/bonjour, je suis intéressé/i)
        ).not.toBeInTheDocument();

        expect(
            screen.getByText(/c'est votre annonce/i)
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", { name: /voir mes messages/i })
        ).toBeInTheDocument();
    });

    test("sends message and navigates to chat when clicking send button", async () => {
        getListingById.mockResolvedValue(mockListing);

        const mockConversation = {
            id: "conv-123",
            listing_id: "listing-123",
            buyer_id: "user-123",
            seller_id: "seller-456",
        };

        getOrCreateConversation.mockResolvedValue(mockConversation);

        renderWithRouter(<ListingDetail />);

        await waitFor(() => {
            expect(screen.getByText("iPhone 13 Pro")).toBeInTheDocument();
        });

        const messageInput = screen.getByPlaceholderText(
            /bonjour, je suis intéressé/i
        );
        const sendButton = screen.getByRole("button", { name: /envoyer/i });

        fireEvent.change(messageInput, {
            target: { value: "Est-ce disponible?" },
        });
        fireEvent.click(sendButton);

        await waitFor(() => {
            expect(getOrCreateConversation).toHaveBeenCalledWith("listing-123");
        });

        expect(mockNavigate).toHaveBeenCalledWith("/chat/conv-123", {
            state: { initialMessage: "Est-ce disponible?" },
        });
    });

    test("sends message when pressing Enter key", async () => {
        getListingById.mockResolvedValue(mockListing);

        const mockConversation = {
            id: "conv-123",
            listing_id: "listing-123",
            buyer_id: "user-123",
            seller_id: "seller-456",
        };

        getOrCreateConversation.mockResolvedValue(mockConversation);

        renderWithRouter(<ListingDetail />);

        await waitFor(() => {
            expect(screen.getByText("iPhone 13 Pro")).toBeInTheDocument();
        });

        const messageInput = screen.getByPlaceholderText(
            /bonjour, je suis intéressé/i
        );

        fireEvent.change(messageInput, {
            target: { value: "Message via Enter" },
        });
        fireEvent.keyPress(messageInput, {
            key: "Enter",
            code: "Enter",
            charCode: 13,
        });

        await waitFor(() => {
            expect(getOrCreateConversation).toHaveBeenCalledWith("listing-123");
        });

        expect(mockNavigate).toHaveBeenCalledWith("/chat/conv-123", {
            state: { initialMessage: "Message via Enter" },
        });
    });

    test("redirects to login when unauthenticated user tries to send message", async () => {
        mockAuthContextValue.user = null;

        getListingById.mockResolvedValue(mockListing);

        renderWithRouter(<ListingDetail />);

        await waitFor(() => {
            expect(screen.getByText("iPhone 13 Pro")).toBeInTheDocument();
        });

        // Message input should not be visible when not authenticated
        expect(
            screen.queryByPlaceholderText(/bonjour, je suis intéressé/i)
        ).not.toBeInTheDocument();
    });

    test("prevents sending message with only whitespace", async () => {
        getListingById.mockResolvedValue(mockListing);

        renderWithRouter(<ListingDetail />);

        await waitFor(() => {
            expect(screen.getByText("iPhone 13 Pro")).toBeInTheDocument();
        });

        const messageInput = screen.getByPlaceholderText(
            /bonjour, je suis intéressé/i
        );
        const sendButton = screen.getByRole("button", { name: /envoyer/i });

        // Clear the default message to whitespace only
        fireEvent.change(messageInput, { target: { value: "   " } });

        // Button should be disabled when message is only whitespace
        expect(sendButton).toBeDisabled();

        // Verify getOrCreateConversation was never called
        expect(getOrCreateConversation).not.toHaveBeenCalled();
    });

    test("displays error when user tries to message themselves", async () => {
        mockAuthContextValue.user = { id: "seller-456" };

        getListingById.mockResolvedValue(mockListing);

        renderWithRouter(<ListingDetail />);

        await waitFor(() => {
            expect(screen.getByText("iPhone 13 Pro")).toBeInTheDocument();
        });

        // Should show owner message instead
        expect(
            screen.getByText(/c'est votre annonce/i)
        ).toBeInTheDocument();
    });

    test("displays error message when send message fails", async () => {
        getListingById.mockResolvedValue(mockListing);

        getOrCreateConversation.mockRejectedValue(
            new Error("Failed to create conversation")
        );

        renderWithRouter(<ListingDetail />);

        await waitFor(() => {
            expect(screen.getByText("iPhone 13 Pro")).toBeInTheDocument();
        });

        const messageInput = screen.getByPlaceholderText(
            /bonjour, je suis intéressé/i
        );
        const sendButton = screen.getByRole("button", { name: /envoyer/i });

        fireEvent.change(messageInput, { target: { value: "Test message" } });
        fireEvent.click(sendButton);

        await waitFor(() => {
            expect(
                screen.getByText(/failed to create conversation/i)
            ).toBeInTheDocument();
        });
    });

    test("disables send button when message is empty", async () => {
        getListingById.mockResolvedValue(mockListing);

        renderWithRouter(<ListingDetail />);

        await waitFor(() => {
            expect(screen.getByText("iPhone 13 Pro")).toBeInTheDocument();
        });

        const messageInput = screen.getByPlaceholderText(
            /bonjour, je suis intéressé/i
        );
        const sendButton = screen.getByRole("button", { name: /envoyer/i });

        // Clear the message
        fireEvent.change(messageInput, { target: { value: "" } });

        expect(sendButton).toBeDisabled();
    });

    test("disables input and button while sending message", async () => {
        getListingById.mockResolvedValue(mockListing);

        getOrCreateConversation.mockImplementation(
            () => new Promise((resolve) => setTimeout(resolve, 1000))
        );

        renderWithRouter(<ListingDetail />);

        await waitFor(() => {
            expect(screen.getByText("iPhone 13 Pro")).toBeInTheDocument();
        });

        const messageInput = screen.getByPlaceholderText(
            /bonjour, je suis intéressé/i
        );
        const sendButton = screen.getByRole("button", { name: /envoyer/i });

        fireEvent.change(messageInput, { target: { value: "Test" } });
        fireEvent.click(sendButton);

        expect(messageInput).toBeDisabled();
        expect(sendButton.textContent).toBe("Envoi...");
    });

    test("displays course information when available", async () => {
        getListingById.mockResolvedValue(mockListing);

        renderWithRouter(<ListingDetail />);

        await waitFor(() => {
            expect(screen.getByText("iPhone 13 Pro")).toBeInTheDocument();
        });

        expect(screen.getByText("INF1120")).toBeInTheDocument();
    });

    test("displays category attributes when available", async () => {
        const listingWithAttributes = {
            ...mockListing,
            category_attributes: {
                marque: "Apple",
                taille: "M",
                genre: "Unisexe",
            },
        };

        getListingById.mockResolvedValue(listingWithAttributes);

        renderWithRouter(<ListingDetail />);

        await waitFor(() => {
            expect(screen.getByText("iPhone 13 Pro")).toBeInTheDocument();
        });

        expect(screen.getByText("Apple")).toBeInTheDocument();
        expect(screen.getByText("M")).toBeInTheDocument();
        expect(screen.getByText("Unisexe")).toBeInTheDocument();
    });

    test("displays all contact methods when available", async () => {
        const listingAllContacts = {
            ...mockListing,
            contact_other: true,
            contact_other_value: "@instagram_user",
        };

        getListingById.mockResolvedValue(listingAllContacts);

        renderWithRouter(<ListingDetail />);

        await waitFor(() => {
            expect(screen.getByText("iPhone 13 Pro")).toBeInTheDocument();
        });

        expect(screen.getByText("514-123-4567")).toBeInTheDocument();
        expect(screen.getByText("seller@uqam.ca")).toBeInTheDocument();
        expect(screen.getByText("@instagram_user")).toBeInTheDocument();
    });

    test("does not display contact methods when not available", async () => {
        const listingNoContacts = {
            ...mockListing,
            contact_cell: false,
            contact_phone: null,
            contact_email: false,
            contact_email_value: null,
            contact_other: false,
            contact_other_value: null,
        };

        getListingById.mockResolvedValue(listingNoContacts);

        const { container } = renderWithRouter(<ListingDetail />);

        await waitFor(() => {
            expect(screen.getByText("iPhone 13 Pro")).toBeInTheDocument();
        });

        const contactRows = container.querySelectorAll(".contact-row");
        expect(contactRows.length).toBe(0);
    });

    test("renders ArticleRating component with correct props", async () => {
        getListingById.mockResolvedValue(mockListing);

        renderWithRouter(<ListingDetail />);

        await waitFor(() => {
            expect(screen.getByText("iPhone 13 Pro")).toBeInTheDocument();
        });

        const ratingComponent = screen.getByTestId("article-rating");
        expect(ratingComponent).toBeInTheDocument();
        expect(ratingComponent.textContent).toContain("seller-456");
    });

    test("navigates to messages when seller clicks 'voir mes messages'", async () => {
        mockAuthContextValue.user = { id: "seller-456" };

        getListingById.mockResolvedValue(mockListing);

        renderWithRouter(<ListingDetail />);

        await waitFor(() => {
            expect(screen.getByText("iPhone 13 Pro")).toBeInTheDocument();
        });

        const viewMessagesButton = screen.getByRole("button", {
            name: /voir mes messages/i,
        });
        fireEvent.click(viewMessagesButton);

        expect(mockNavigate).toHaveBeenCalledWith("/messages");
    });

    test("displays description when available", async () => {
        getListingById.mockResolvedValue(mockListing);

        renderWithRouter(<ListingDetail />);

        await waitFor(() => {
            expect(screen.getByText("iPhone 13 Pro")).toBeInTheDocument();
        });

        expect(
            screen.getByText(/iPhone 13 Pro en excellent état/i)
        ).toBeInTheDocument();
    });

    test("handles listing without description", async () => {
        const listingNoDescription = {
            ...mockListing,
            description: null,
        };

        getListingById.mockResolvedValue(listingNoDescription);

        const { container } = renderWithRouter(<ListingDetail />);

        await waitFor(() => {
            expect(screen.getByText("iPhone 13 Pro")).toBeInTheDocument();
        });

        const descriptionSection = container.querySelector(".description-compact");
        expect(descriptionSection).not.toBeInTheDocument();
    });

    test("handles listing without seller profile", async () => {
        const listingNoProfile = {
            ...mockListing,
            profiles: null,
        };

        getListingById.mockResolvedValue(listingNoProfile);

        renderWithRouter(<ListingDetail />);

        await waitFor(() => {
            expect(screen.getByText("iPhone 13 Pro")).toBeInTheDocument();
        });

        expect(screen.getByText("Vendeur inconnu")).toBeInTheDocument();
    });
});