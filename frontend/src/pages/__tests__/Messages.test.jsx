import React from "react";
import { screen, waitFor } from "@testing-library/react";
import { renderWithRouter } from "../../test-utils/renderWithProviders";
import Messages from "../Messages";
import { getUserConversations } from "../../utils/conversationsApi";

// Mock the conversationsApi module
jest.mock("../../utils/conversationsApi", () => ({
    getUserConversations: jest.fn(),
}));

// Mock the AuthContext
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
}));

const mockUser = {
    id: "user-123",
    email: "test@uqam.ca",
    fullName: "Test User",
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

const mockConversations = [
    {
        id: "conv-1",
        updated_at: new Date().toISOString(),
        otherUser: {
            fullName: "Alice Dupont",
        },
        listing: {
            title: "iPhone 13 Pro",
            price: 800,
            listing_images: [
                {
                    path: "https://example.com/iphone.jpg",
                },
            ],
        },
    },
    {
        id: "conv-2",
        updated_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        otherUser: {
            fullName: "Bob Martin",
        },
        listing: {
            title: "MacBook Pro 2021",
            price: 1500,
            listing_images: [
                {
                    path: "https://example.com/macbook.jpg",
                },
            ],
        },
    },
    {
        id: "conv-3",
        updated_at: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
        otherUser: {
            fullName: "Claire Leblanc",
        },
        listing: null, // Deleted listing
    },
];

beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    getUserConversations.mockClear();
    mockAuthContextValue.user = mockUser;
    mockAuthContextValue.loading = false;
});

describe("Messages page", () => {
    test("renders loading state initially", () => {
        getUserConversations.mockImplementation(
            () => new Promise(() => {}) // Never resolves
        );

        renderWithRouter(<Messages />);

        expect(screen.getByText(/chargement\.\.\./i)).toBeInTheDocument();
    });

    test("redirects to login when user is not authenticated", () => {
        mockAuthContextValue.user = null;

        renderWithRouter(<Messages />);

        expect(mockNavigate).toHaveBeenCalledWith("/login");
    });

    test("renders empty state when there are no conversations", async () => {
        getUserConversations.mockResolvedValue([]);

        renderWithRouter(<Messages />);

        await waitFor(() => {
            expect(
                screen.getByText(/vous n'avez pas encore de conversations/i)
            ).toBeInTheDocument();
        });

        expect(
            screen.getByText(/contactez un vendeur depuis une annonce/i)
        ).toBeInTheDocument();
    });

    test("renders list of conversations when data is loaded", async () => {
        getUserConversations.mockResolvedValue(mockConversations);

        renderWithRouter(<Messages />);

        await waitFor(() => {
            expect(screen.getByText("Alice Dupont")).toBeInTheDocument();
        });

        expect(screen.getByText("Bob Martin")).toBeInTheDocument();
        expect(screen.getByText("Claire Leblanc")).toBeInTheDocument();
        expect(screen.getByText("iPhone 13 Pro")).toBeInTheDocument();
        expect(screen.getByText("MacBook Pro 2021")).toBeInTheDocument();
        expect(screen.getByText("800 $")).toBeInTheDocument();
        expect(screen.getByText("1500 $")).toBeInTheDocument();
    });

    test("displays 'Annonce supprimée' for conversations with deleted listings", async () => {
        getUserConversations.mockResolvedValue(mockConversations);

        renderWithRouter(<Messages />);

        await waitFor(() => {
            expect(screen.getByText(/annonce supprimée/i)).toBeInTheDocument();
        });
    });

    test("displays error message when API call fails", async () => {
        getUserConversations.mockRejectedValue(
            new Error("Network error")
        );

        renderWithRouter(<Messages />);

        await waitFor(() => {
            expect(
                screen.getByText(/impossible de charger les conversations/i)
            ).toBeInTheDocument();
        });
    });

    test("navigates to chat when clicking on a conversation", async () => {
        getUserConversations.mockResolvedValue(mockConversations);

        const { container } = renderWithRouter(<Messages />);

        await waitFor(() => {
            expect(screen.getByText("Alice Dupont")).toBeInTheDocument();
        });

        const conversationItems = container.querySelectorAll(".conversation-item");
        expect(conversationItems.length).toBe(3);

        conversationItems[0].click();

        expect(mockNavigate).toHaveBeenCalledWith("/chat/conv-1");
    });

    test("displays placeholder image when listing has no images", async () => {
        const conversationsWithoutImages = [
            {
                id: "conv-no-img",
                updated_at: new Date().toISOString(),
                otherUser: {
                    fullName: "David Tremblay",
                },
                listing: {
                    title: "No Image Listing",
                    price: 100,
                    listing_images: [],
                },
            },
        ];

        getUserConversations.mockResolvedValue(
            conversationsWithoutImages
        );

        const { container } = renderWithRouter(<Messages />);

        await waitFor(() => {
            expect(screen.getByText("David Tremblay")).toBeInTheDocument();
        });

        const placeholderImg = container.querySelector(
            ".conversation-image-placeholder-img"
        );
        expect(placeholderImg).toBeInTheDocument();
        expect(placeholderImg.src).toContain("picsum.photos");
    });

    test("formats date correctly for today", async () => {
        const todayConversation = [
            {
                id: "conv-today",
                updated_at: new Date().toISOString(),
                otherUser: {
                    fullName: "Today User",
                },
                listing: {
                    title: "Today Listing",
                    price: 50,
                    listing_images: [],
                },
            },
        ];

        getUserConversations.mockResolvedValue(todayConversation);

        const { container } = renderWithRouter(<Messages />);

        await waitFor(() => {
            expect(screen.getByText("Today User")).toBeInTheDocument();
        });

        const dateSpan = container.querySelector(".conversation-date");
        expect(dateSpan).toBeInTheDocument();
        // Should display time format (HH:MM)
        expect(dateSpan.textContent).toMatch(/\d{1,2}:\d{2}/);
    });

    test("formats date correctly for yesterday", async () => {
        const yesterdayConversation = [
            {
                id: "conv-yesterday",
                updated_at: new Date(Date.now() - 86400000).toISOString(),
                otherUser: {
                    fullName: "Yesterday User",
                },
                listing: {
                    title: "Yesterday Listing",
                    price: 75,
                    listing_images: [],
                },
            },
        ];

        getUserConversations.mockResolvedValue(
            yesterdayConversation
        );

        const { container } = renderWithRouter(<Messages />);

        await waitFor(() => {
            expect(screen.getByText("Yesterday User")).toBeInTheDocument();
        });

        const dateSpan = container.querySelector(".conversation-date");
        expect(dateSpan.textContent).toBe("Hier");
    });

    test("renders Messages title in header", async () => {
        getUserConversations.mockResolvedValue([]);

        renderWithRouter(<Messages />);

        await waitFor(() => {
            expect(screen.getByText("Messages")).toBeInTheDocument();
        });

        const title = screen.getByText("Messages");
        expect(title.tagName).toBe("H1");
    });

    test("does not render when auth is still loading", () => {
        mockAuthContextValue.loading = true;

        getUserConversations.mockResolvedValue([]);

        renderWithRouter(<Messages />);

        expect(screen.getByText(/chargement\.\.\./i)).toBeInTheDocument();
    });

    test("does not display price when listing has no price", async () => {
        const conversationNoPri = [
            {
                id: "conv-no-price",
                updated_at: new Date().toISOString(),
                otherUser: {
                    fullName: "No Price User",
                },
                listing: {
                    title: "Free Item",
                    price: null,
                    listing_images: [],
                },
            },
        ];

        getUserConversations.mockResolvedValue(conversationNoPri);

        const { container } = renderWithRouter(<Messages />);

        await waitFor(() => {
            expect(screen.getByText("No Price User")).toBeInTheDocument();
        });

        const priceElement = container.querySelector(".conversation-listing-price");
        expect(priceElement).toBeInTheDocument();
        expect(priceElement.textContent).toBe("");
    });
});