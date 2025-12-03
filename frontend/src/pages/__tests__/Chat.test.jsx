// src/pages/__tests__/Chat.test.jsx
import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithRouter } from "../../test-utils/renderWithProviders";
import Chat from "../Chat";

// Polyfill scrollIntoView for jsdom (avoids TypeError in useEffect)
if (!HTMLElement.prototype.scrollIntoView) {
    // eslint-disable-next-line no-extend-native
    HTMLElement.prototype.scrollIntoView = jest.fn();
}

// ---- Mocks ----

// AuthContext mock: we'll control the return value per test
const mockUseAuth = jest.fn();

jest.mock("../../contexts/AuthContext", () => ({
    useAuth: () => mockUseAuth(),
}));

// react-router-dom mocks
const mockUseParams = jest.fn();
const mockUseNavigate = jest.fn();
const mockUseLocation = jest.fn();

jest.mock("react-router-dom", () => {
    const actual = jest.requireActual("react-router-dom");
    return {
        ...actual,
        useParams: () => mockUseParams(),
        useNavigate: () => mockUseNavigate(),
        useLocation: () => mockUseLocation(),
    };
});

// conversationsApi mocks
const mockGetConversationWithMessages = jest.fn();
const mockSendMessage = jest.fn();
const mockSubscribeToMessages = jest.fn();

jest.mock("../../utils/conversationsApi", () => ({
    getConversationWithMessages: (...args) =>
        mockGetConversationWithMessages(...args),
    sendMessage: (...args) => mockSendMessage(...args),
    subscribeToMessages: (...args) => mockSubscribeToMessages(...args),
}));

// ---- Helpers ----
const buildBaseConversation = () => ({
    id: "conv-123",
    otherUser: {
        id: "other-1",
        fullName: "Bob Martin",
    },
    listing: {
        id: "listing-1",
        title: "Calculatrice TI-84",
        price: 30,
        listing_images: [
            {
                path: "https://example.com/image.jpg",
            },
        ],
    },
    messages: [
        {
            id: "msg-1",
            content: "Bonjour !",
            created_at: new Date().toISOString(),
            isFromCurrentUser: false,
            sender: {
                id: "other-1",
                fullName: "Bob Martin",
            },
            image_url: null,
        },
        {
            id: "msg-2",
            content: "Salut Bob",
            created_at: new Date().toISOString(),
            isFromCurrentUser: true,
            sender: {
                id: "user-123",
                fullName: "Alicia",
            },
            image_url: null,
        },
    ],
});

beforeEach(() => {
    jest.clearAllMocks();

    mockUseParams.mockReturnValue({ id: "conv-123" });
    mockUseNavigate.mockReturnValue(jest.fn());
    mockUseLocation.mockReturnValue({ state: undefined });

    mockUseAuth.mockReturnValue({
        user: { id: "user-123", email: "user@uqam.ca" },
        loading: false,
    });

    mockGetConversationWithMessages.mockResolvedValue(buildBaseConversation());
    mockSubscribeToMessages.mockReturnValue(() => {});
});

// ---- Tests ----
describe("Chat page", () => {
    test("redirects to /login when user is not authenticated", async () => {
        const navigateMock = jest.fn();
        mockUseNavigate.mockReturnValue(navigateMock);
        mockUseAuth.mockReturnValue({
            user: null,
            loading: false,
        });

        renderWithRouter(<Chat />);

        await waitFor(() => {
            expect(navigateMock).toHaveBeenCalledWith("/login");
        });
    });

    test("shows loading state when auth is still loading", () => {
        mockUseAuth.mockReturnValue({
            user: null,
            loading: true,
        });

        renderWithRouter(<Chat />);

        expect(screen.getByText(/chargement/i)).toBeInTheDocument();
    });

    test("shows error screen when conversation fetch fails", async () => {
        const navigateMock = jest.fn();
        mockUseNavigate.mockReturnValue(navigateMock);

        mockGetConversationWithMessages.mockRejectedValueOnce(
            new Error("Impossible de charger la conversation")
        );

        renderWithRouter(<Chat />);

        await waitFor(() => {
            expect(
                screen.getByText(/impossible de charger la conversation/i)
            ).toBeInTheDocument();
        });

        const backBtn = screen.getByRole("button", {
            name: /retour aux messages/i,
        });
        fireEvent.click(backBtn);

        expect(navigateMock).toHaveBeenCalledWith("/messages");
    });

    test("loads and displays conversation header and messages", async () => {
        renderWithRouter(<Chat />);

        // header: only take the heading 'Bob Martin'
        await waitFor(() => {
            expect(
                screen.getByRole("heading", { name: /bob martin/i })
            ).toBeInTheDocument();
        });

        // listing info
        expect(
            screen.getByText(/calculatrice ti-84/i)
        ).toBeInTheDocument();
        expect(screen.getByText(/30\s*\$/i)).toBeInTheDocument();

        // messages
        expect(screen.getByText("Bonjour !")).toBeInTheDocument();
        expect(screen.getByText("Salut Bob")).toBeInTheDocument();

        // time formatting (for "now" it should be "À l'instant")
        expect(screen.getAllByText(/à l'instant/i).length).toBeGreaterThan(0);
    });

    test("uses initialMessage from location state", async () => {
        mockUseLocation.mockReturnValue({
            state: { initialMessage: "Bonjour, je suis intéressé" },
        });

        renderWithRouter(<Chat />);

        await waitFor(() => {
            const input = screen.getByPlaceholderText(/tapez votre message/i);
            expect(input).toHaveValue("Bonjour, je suis intéressé");
        });
    });

    test("sends text message when clicking Envoyer", async () => {
        mockSendMessage.mockResolvedValueOnce({
            id: "msg-3",
            content: "Nouveau message",
            created_at: new Date().toISOString(),
            isFromCurrentUser: true,
            sender: {
                id: "user-123",
                fullName: "Alicia",
            },
            image_url: null,
        });

        renderWithRouter(<Chat />);

        // wait for conversation loaded
        await waitFor(() => {
            expect(
                screen.getByRole("heading", { name: /bob martin/i })
            ).toBeInTheDocument();
        });

        const input = screen.getByPlaceholderText(/tapez votre message/i);
        const sendBtn = screen.getByRole("button", { name: /envoyer/i });

        fireEvent.change(input, { target: { value: "   Nouveau message   " } });
        fireEvent.click(sendBtn);

        await waitFor(() => {
            expect(mockSendMessage).toHaveBeenCalledWith(
                "conv-123",
                "Nouveau message",
                null
            );
        });

        // we do NOT assert that the input is cleared,
        // because the Chat component keeps "Nouveau message" in the input

        // new message appears in the list
        await waitFor(() => {
            expect(
                screen.getByText("Nouveau message")
            ).toBeInTheDocument();
        });
    });

    test("sends message when pressing Enter key", async () => {
        mockSendMessage.mockResolvedValueOnce({
            id: "msg-4",
            content: "Via Enter",
            created_at: new Date().toISOString(),
            isFromCurrentUser: true,
            sender: {
                id: "user-123",
                fullName: "Alicia",
            },
            image_url: null,
        });

        renderWithRouter(<Chat />);

        await waitFor(() => {
            expect(
                screen.getByRole("heading", { name: /bob martin/i })
            ).toBeInTheDocument();
        });

        const input = screen.getByPlaceholderText(/tapez votre message/i);
        fireEvent.change(input, { target: { value: "Via Enter" } });

        fireEvent.keyPress(input, { key: "Enter", charCode: 13 });

        await waitFor(() => {
            expect(mockSendMessage).toHaveBeenCalledWith(
                "conv-123",
                "Via Enter",
                null
            );
        });
    });

    test("validates image size and shows error if too large", async () => {
        renderWithRouter(<Chat />);

        await waitFor(() => {
            expect(
                screen.getByRole("heading", { name: /bob martin/i })
            ).toBeInTheDocument();
        });

        const attachBtn = screen.getByRole("button", {
            name: /joindre une image/i,
        });

        // Click to open hidden file input
        fireEvent.click(attachBtn);

        // Find the hidden input in the DOM
        const fileInput = document.querySelector("input[type='file']");

        const bigFile = new File(
            [new ArrayBuffer(6 * 1024 * 1024)], // 6MB
            "big.png",
            { type: "image/png" }
        );

        fireEvent.change(fileInput, {
            target: { files: [bigFile] },
        });

        expect(
            await screen.findByText(/l'image est trop grande/i)
        ).toBeInTheDocument();
    });

    test("shows image preview for valid image and allows removing it", async () => {
        renderWithRouter(<Chat />);

        await waitFor(() => {
            expect(
                screen.getByRole("heading", { name: /bob martin/i })
            ).toBeInTheDocument();
        });

        const attachBtn = screen.getByRole("button", {
            name: /joindre une image/i,
        });
        fireEvent.click(attachBtn);

        const fileInput = document.querySelector("input[type='file']");
        const smallFile = new File(
            [new ArrayBuffer(1024)],
            "small.png",
            { type: "image/png" }
        );

        fireEvent.change(fileInput, {
            target: { files: [smallFile] },
        });

        // FileReader is async; wait for preview to appear
        await waitFor(() => {
            expect(
                screen.getByAltText(/aperçu/i)
            ).toBeInTheDocument();
        });

        const removeBtn = screen.getByRole("button", {
            name: /retirer l'image/i,
        });
        fireEvent.click(removeBtn);

        await waitFor(() => {
            expect(
                screen.queryByAltText(/aperçu/i)
            ).not.toBeInTheDocument();
        });
    });

    test("subscribes to new messages and deduplicates them", async () => {
        let subscriptionCallback;
        mockSubscribeToMessages.mockImplementation((convId, cb) => {
            subscriptionCallback = cb;
            return () => {};
        });

        renderWithRouter(<Chat />);

        await waitFor(() => {
            expect(
                screen.getByRole("heading", { name: /bob martin/i })
            ).toBeInTheDocument();
        });

        expect(mockSubscribeToMessages).toHaveBeenCalledWith(
            "conv-123",
            expect.any(Function)
        );

        const newMessage = {
            id: "msg-sub",
            content: "Message en temps réel",
            created_at: new Date().toISOString(),
            isFromCurrentUser: false,
            sender: { id: "other-1", fullName: "Bob Martin" },
            image_url: null,
        };

        // Call subscription callback
        subscriptionCallback(newMessage);

        await waitFor(() => {
            expect(
                screen.getByText("Message en temps réel")
            ).toBeInTheDocument();
        });

        // Call again with same ID => should not duplicate
        subscriptionCallback(newMessage);

        const foundMessages = screen.getAllByText("Message en temps réel");
        expect(foundMessages.length).toBe(1);
    });

    test("back button in header navigates to /messages", async () => {
        const navigateMock = jest.fn();
        mockUseNavigate.mockReturnValue(navigateMock);

        renderWithRouter(<Chat />);

        await waitFor(() => {
            expect(
                screen.getByRole("heading", { name: /bob martin/i })
            ).toBeInTheDocument();
        });

        const backBtn = screen.getByRole("button", { name: /retour/i });
        fireEvent.click(backBtn);

        expect(navigateMock).toHaveBeenCalledWith("/messages");
    });

    test("MenuBar 'Vendre' button navigates to /sell", async () => {
        const navigateMock = jest.fn();
        mockUseNavigate.mockReturnValue(navigateMock);

        renderWithRouter(<Chat />);

        await waitFor(() => {
            expect(
                screen.getByRole("heading", { name: /bob martin/i })
            ).toBeInTheDocument();
        });

        const sellBtn = screen.getByRole("button", { name: /vendre/i });
        fireEvent.click(sellBtn);

        expect(navigateMock).toHaveBeenCalledWith("/sell");
    });
});
