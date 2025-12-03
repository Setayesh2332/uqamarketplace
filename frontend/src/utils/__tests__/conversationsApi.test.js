import {
    getOrCreateConversation,
    getUserConversations,
    getConversationWithMessages,
    sendMessage,
    subscribeToMessages,
} from "../conversationsApi";
import { supabase } from "../supabaseClient";

// Mock supabase client
jest.mock("../supabaseClient", () => ({
    supabase: {
        auth: {
            getUser: jest.fn(),
        },
        from: jest.fn(),
        storage: {
            from: jest.fn(),
        },
        channel: jest.fn(),
        removeChannel: jest.fn(),
    },
}));

const mockUser = {
    id: "user-123",
    email: "test@uqam.ca",
};

const mockListing = {
    id: "listing-789",
    user_id: "seller-456",
    title: "iPhone 13 Pro",
    price: 800,
};

const mockConversation = {
    id: "conv-123",
    listing_id: "listing-789",
    buyer_id: "user-123",
    seller_id: "seller-456",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
};

const mockProfile = {
    id: "seller-456",
    first_name: "Alice",
    last_name: "Dupont",
};

beforeEach(() => {
    jest.clearAllMocks();
});

describe("conversationsApi", () => {
    describe("getOrCreateConversation", () => {
        test("creates a new conversation when none exists", async () => {
            supabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
            });

            const fromMock = jest.fn().mockReturnThis();
            const selectMock = jest.fn().mockReturnThis();
            const eqMock = jest.fn().mockReturnThis();
            const singleMock = jest.fn();
            const insertMock = jest.fn().mockReturnThis();

            // Mock listing query
            singleMock
                .mockResolvedValueOnce({
                    data: mockListing,
                    error: null,
                })
                // Mock existing conversation query (not found)
                .mockResolvedValueOnce({
                    data: null,
                    error: { code: "PGRST116" }, // No rows returned
                })
                // Mock new conversation insert
                .mockResolvedValueOnce({
                    data: mockConversation,
                    error: null,
                });

            supabase.from.mockImplementation(() => ({
                select: selectMock,
                eq: eqMock,
                single: singleMock,
                insert: insertMock,
            }));

            selectMock.mockReturnValue({
                eq: eqMock,
                single: singleMock,
                insert: insertMock,
            });

            eqMock.mockReturnValue({
                eq: eqMock,
                single: singleMock,
            });

            insertMock.mockReturnValue({
                select: selectMock,
            });

            const result = await getOrCreateConversation("listing-789");

            expect(result).toEqual(mockConversation);
            expect(supabase.auth.getUser).toHaveBeenCalled();
        });

        test("returns existing conversation if it exists", async () => {
            supabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
            });

            const fromMock = jest.fn().mockReturnThis();
            const selectMock = jest.fn().mockReturnThis();
            const eqMock = jest.fn().mockReturnThis();
            const singleMock = jest.fn();

            // Mock listing query
            singleMock
                .mockResolvedValueOnce({
                    data: mockListing,
                    error: null,
                })
                // Mock existing conversation query (found)
                .mockResolvedValueOnce({
                    data: mockConversation,
                    error: null,
                });

            supabase.from.mockImplementation(() => ({
                select: selectMock,
                eq: eqMock,
                single: singleMock,
            }));

            selectMock.mockReturnValue({
                eq: eqMock,
                single: singleMock,
            });

            eqMock.mockReturnValue({
                eq: eqMock,
                single: singleMock,
            });

            const result = await getOrCreateConversation("listing-789");

            expect(result).toEqual(mockConversation);
        });

        test("throws error when user is not authenticated", async () => {
            supabase.auth.getUser.mockResolvedValue({
                data: { user: null },
            });

            await expect(getOrCreateConversation("listing-789")).rejects.toThrow(
                "L'utilisateur doit être authentifié"
            );
        });

        test("throws error when user tries to create conversation for own listing", async () => {
            supabase.auth.getUser.mockResolvedValue({
                data: { user: { id: "user-123" } },
            });

            const singleMock = jest.fn().mockResolvedValue({
                data: { user_id: "user-123" }, // Same as current user
                error: null,
            });

            supabase.from.mockImplementation(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: singleMock,
            }));

            await expect(getOrCreateConversation("listing-789")).rejects.toThrow(
                "Vous ne pouvez pas créer une conversation pour votre propre annonce"
            );
        });

        test("throws error when listing is not found", async () => {
            supabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
            });

            const listingError = { message: "Listing not found" };

            const singleMock = jest.fn().mockRejectedValue(listingError);

            supabase.from.mockImplementation(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: singleMock,
            }));

            await expect(getOrCreateConversation("listing-789")).rejects.toEqual(listingError);
        });
    });

    describe("getUserConversations", () => {
        test("returns list of conversations for authenticated user", async () => {
            supabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
            });

            const mockConversations = [
                {
                    id: "conv-1",
                    buyer_id: "user-123",
                    seller_id: "seller-456",
                    listing_id: "listing-789",
                    updated_at: "2024-01-01T00:00:00Z",
                    listings: {
                        id: "listing-789",
                        title: "iPhone 13 Pro",
                        price: 800,
                        listing_images: [
                            { id: "img-1", path: "/image1.jpg", display_order: 1 },
                        ],
                    },
                },
            ];

            const mockMessages = [{ conversation_id: "conv-1" }];

            const mockProfiles = [mockProfile];

            const selectMock = jest.fn().mockReturnThis();
            const orMock = jest.fn().mockReturnThis();
            const orderMock = jest.fn().mockResolvedValue({
                data: mockConversations,
                error: null,
            });
            const inMock = jest.fn().mockResolvedValue({
                data: mockProfiles,
                error: null,
            });

            supabase.from.mockImplementation((table) => {
                if (table === "conversations") {
                    return {
                        select: selectMock,
                        or: orMock,
                        order: orderMock,
                    };
                }
                if (table === "profiles") {
                    return {
                        select: () => ({
                            in: inMock,
                        }),
                    };
                }
                if (table === "messages") {
                    return {
                        select: () => ({
                            in: jest.fn().mockResolvedValue({
                                data: mockMessages,
                                error: null,
                            }),
                        }),
                    };
                }
            });

            selectMock.mockReturnValue({
                or: orMock,
            });

            orMock.mockReturnValue({
                order: orderMock,
            });

            const result = await getUserConversations();

            expect(result).toHaveLength(1);
            expect(result[0].otherUser.fullName).toBe("Alice Dupont");
            expect(result[0].isBuyer).toBe(true);
        });

        test("filters out conversations without messages", async () => {
            supabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
            });

            const mockConversations = [
                {
                    id: "conv-1",
                    buyer_id: "user-123",
                    seller_id: "seller-456",
                    listing_id: "listing-789",
                    updated_at: "2024-01-01T00:00:00Z",
                    listings: {
                        id: "listing-789",
                        title: "iPhone 13 Pro",
                        price: 800,
                        listing_images: [],
                    },
                },
                {
                    id: "conv-2",
                    buyer_id: "user-123",
                    seller_id: "seller-789",
                    listing_id: "listing-456",
                    updated_at: "2024-01-02T00:00:00Z",
                    listings: {
                        id: "listing-456",
                        title: "MacBook",
                        price: 1500,
                        listing_images: [],
                    },
                },
            ];

            const mockMessages = [{ conversation_id: "conv-1" }]; // Only conv-1 has messages

            const mockProfiles = [mockProfile];

            const selectMock = jest.fn().mockReturnThis();
            const orMock = jest.fn().mockReturnThis();
            const orderMock = jest.fn().mockResolvedValue({
                data: mockConversations,
                error: null,
            });

            supabase.from.mockImplementation((table) => {
                if (table === "conversations") {
                    return {
                        select: selectMock,
                        or: orMock,
                        order: orderMock,
                    };
                }
                if (table === "profiles") {
                    return {
                        select: () => ({
                            in: jest.fn().mockResolvedValue({
                                data: mockProfiles,
                                error: null,
                            }),
                        }),
                    };
                }
                if (table === "messages") {
                    return {
                        select: () => ({
                            in: jest.fn().mockResolvedValue({
                                data: mockMessages,
                                error: null,
                            }),
                        }),
                    };
                }
            });

            selectMock.mockReturnValue({
                or: orMock,
            });

            orMock.mockReturnValue({
                order: orderMock,
            });

            const result = await getUserConversations();

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe("conv-1");
        });

        test("throws error when user is not authenticated", async () => {
            supabase.auth.getUser.mockResolvedValue({
                data: { user: null },
            });

            await expect(getUserConversations()).rejects.toThrow(
                "L'utilisateur doit être authentifié"
            );
        });
    });

    describe("getConversationWithMessages", () => {
        test("returns conversation with messages for authorized user", async () => {
            supabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
            });

            const mockConvData = {
                id: "conv-123",
                buyer_id: "user-123",
                seller_id: "seller-456",
                listing_id: "listing-789",
                listings: {
                    id: "listing-789",
                    title: "iPhone 13 Pro",
                    price: 800,
                    user_id: "seller-456",
                    listing_images: [
                        { id: "img-1", path: "/image1.jpg", display_order: 1 },
                    ],
                },
            };

            const mockMessages = [
                {
                    id: "msg-1",
                    conversation_id: "conv-123",
                    sender_id: "seller-456",
                    content: "Hello",
                    created_at: "2024-01-01T00:00:00Z",
                },
            ];

            const mockBuyerProfile = {
                id: "user-123",
                first_name: "Test",
                last_name: "User",
            };

            const mockSellerProfile = mockProfile;

            const selectMock = jest.fn().mockReturnThis();
            const eqMock = jest.fn().mockReturnThis();
            const singleMock = jest.fn();
            const orderMock = jest.fn().mockResolvedValue({
                data: mockMessages,
                error: null,
            });

            // Conversation query
            singleMock
                .mockResolvedValueOnce({
                    data: mockConvData,
                    error: null,
                })
                // Buyer profile
                .mockResolvedValueOnce({
                    data: mockBuyerProfile,
                    error: null,
                })
                // Seller profile
                .mockResolvedValueOnce({
                    data: mockSellerProfile,
                    error: null,
                });

            supabase.from.mockImplementation((table) => {
                if (table === "conversations") {
                    return {
                        select: selectMock,
                        eq: eqMock,
                        single: singleMock,
                    };
                }
                if (table === "profiles") {
                    return {
                        select: () => ({
                            eq: () => ({
                                single: singleMock,
                            }),
                            in: jest.fn().mockResolvedValue({
                                data: [mockSellerProfile],
                                error: null,
                            }),
                        }),
                    };
                }
                if (table === "messages") {
                    return {
                        select: () => ({
                            eq: () => ({
                                order: orderMock,
                            }),
                        }),
                    };
                }
            });

            selectMock.mockReturnValue({
                eq: eqMock,
            });

            eqMock.mockReturnValue({
                single: singleMock,
            });

            const result = await getConversationWithMessages("conv-123");

            expect(result).toBeDefined();
            expect(result.id).toBe("conv-123");
            expect(result.messages).toHaveLength(1);
            expect(result.otherUser.fullName).toBe("Alice Dupont");
        });

        test("throws error when user is not authenticated", async () => {
            supabase.auth.getUser.mockResolvedValue({
                data: { user: null },
            });

            await expect(getConversationWithMessages("conv-123")).rejects.toThrow(
                "L'utilisateur doit être authentifié"
            );
        });

        test("throws error when user is not part of conversation", async () => {
            supabase.auth.getUser.mockResolvedValue({
                data: { user: { id: "other-user" } },
            });

            const mockConvData = {
                id: "conv-123",
                buyer_id: "user-123",
                seller_id: "seller-456",
            };

            const singleMock = jest.fn().mockResolvedValue({
                data: mockConvData,
                error: null,
            });

            supabase.from.mockImplementation(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: singleMock,
            }));

            await expect(getConversationWithMessages("conv-123")).rejects.toThrow(
                "Vous n'avez pas accès à cette conversation"
            );
        });

        test("throws error when user is both buyer and seller", async () => {
            supabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
            });

            const mockConvData = {
                id: "conv-123",
                buyer_id: "user-123",
                seller_id: "user-123", // Same as buyer
            };

            const singleMock = jest.fn().mockResolvedValue({
                data: mockConvData,
                error: null,
            });

            supabase.from.mockImplementation(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: singleMock,
            }));

            await expect(getConversationWithMessages("conv-123")).rejects.toThrow(
                "Vous ne pouvez pas accéder à cette conversation"
            );
        });

        test("filters out messages from invalid senders", async () => {
            supabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
            });

            const mockConvData = {
                id: "conv-123",
                buyer_id: "user-123",
                seller_id: "seller-456",
                listing_id: "listing-789",
                listings: {
                    id: "listing-789",
                    title: "iPhone 13 Pro",
                    price: 800,
                    user_id: "seller-456",
                    listing_images: [],
                },
            };

            const mockMessages = [
                {
                    id: "msg-1",
                    conversation_id: "conv-123",
                    sender_id: "seller-456",
                    content: "Valid message",
                    created_at: "2024-01-01T00:00:00Z",
                },
                {
                    id: "msg-2",
                    conversation_id: "conv-123",
                    sender_id: "invalid-user", // Not buyer or seller
                    content: "Invalid message",
                    created_at: "2024-01-01T00:00:00Z",
                },
            ];

            const singleMock = jest.fn();
            singleMock
                .mockResolvedValueOnce({ data: mockConvData, error: null })
                .mockResolvedValueOnce({ data: mockProfile, error: null })
                .mockResolvedValueOnce({ data: mockProfile, error: null });

            supabase.from.mockImplementation((table) => {
                if (table === "conversations") {
                    return {
                        select: jest.fn().mockReturnThis(),
                        eq: jest.fn().mockReturnThis(),
                        single: singleMock,
                    };
                }
                if (table === "profiles") {
                    return {
                        select: () => ({
                            eq: () => ({ single: singleMock }),
                            in: jest.fn().mockResolvedValue({
                                data: [mockProfile],
                                error: null,
                            }),
                        }),
                    };
                }
                if (table === "messages") {
                    return {
                        select: () => ({
                            eq: () => ({
                                order: jest.fn().mockResolvedValue({
                                    data: mockMessages,
                                    error: null,
                                }),
                            }),
                        }),
                    };
                }
            });

            const result = await getConversationWithMessages("conv-123");

            expect(result.messages).toHaveLength(1);
            expect(result.messages[0].id).toBe("msg-1");
        });
    });

    describe("sendMessage", () => {
        test("sends text message successfully", async () => {
            supabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
            });

            const mockConvData = {
                buyer_id: "user-123",
                seller_id: "seller-456",
                listing_id: "listing-789",
            };

            const mockMessage = {
                id: "msg-new",
                conversation_id: "conv-123",
                sender_id: "user-123",
                content: "Hello!",
                image_url: null,
                created_at: "2024-01-01T00:00:00Z",
            };

            const singleMock = jest.fn();
            singleMock
                .mockResolvedValueOnce({ data: mockConvData, error: null })
                .mockResolvedValueOnce({ data: mockMessage, error: null })
                .mockResolvedValueOnce({
                    data: { id: "user-123", first_name: "Test", last_name: "User" },
                    error: null,
                });

            const insertMock = jest.fn().mockReturnThis();
            const selectMock = jest.fn().mockReturnThis();

            supabase.from.mockImplementation(() => ({
                select: selectMock,
                eq: jest.fn().mockReturnThis(),
                single: singleMock,
                insert: insertMock,
            }));

            selectMock.mockReturnValue({
                eq: jest.fn().mockReturnThis(),
                single: singleMock,
            });

            insertMock.mockReturnValue({
                select: selectMock,
            });

            const result = await sendMessage("conv-123", "Hello!", null);

            expect(result).toBeDefined();
            expect(result.content).toBe("Hello!");
            expect(result.isFromCurrentUser).toBe(true);
        });

        test("throws error when user is not authenticated", async () => {
            supabase.auth.getUser.mockResolvedValue({
                data: { user: null },
            });

            await expect(sendMessage("conv-123", "Hello!", null)).rejects.toThrow(
                "L'utilisateur doit être authentifié"
            );
        });

        test("throws error when user is not part of conversation", async () => {
            supabase.auth.getUser.mockResolvedValue({
                data: { user: { id: "other-user" } },
            });

            const mockConvData = {
                buyer_id: "user-123",
                seller_id: "seller-456",
            };

            const singleMock = jest.fn().mockResolvedValue({
                data: mockConvData,
                error: null,
            });

            supabase.from.mockImplementation(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: singleMock,
            }));

            await expect(sendMessage("conv-123", "Hello!", null)).rejects.toThrow(
                "Vous n'avez pas accès à cette conversation"
            );
        });

        test("throws error when message has no content and no image", async () => {
            supabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
            });

            const mockConvData = {
                buyer_id: "user-123",
                seller_id: "seller-456",
            };

            const singleMock = jest.fn().mockResolvedValue({
                data: mockConvData,
                error: null,
            });

            supabase.from.mockImplementation(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: singleMock,
            }));

            await expect(sendMessage("conv-123", "   ", null)).rejects.toThrow(
                "Le message doit contenir du texte ou une image"
            );
        });

        test("uploads image and sends message with image", async () => {
            supabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
            });

            const mockConvData = {
                buyer_id: "user-123",
                seller_id: "seller-456",
                listing_id: "listing-789",
            };

            const mockMessage = {
                id: "msg-new",
                conversation_id: "conv-123",
                sender_id: "user-123",
                content: null,
                image_url: "https://example.com/uploaded.jpg",
                created_at: "2024-01-01T00:00:00Z",
            };

            const mockFile = new File(["image"], "test.png", { type: "image/png" });

            const singleMock = jest.fn();
            singleMock
                .mockResolvedValueOnce({ data: mockConvData, error: null })
                .mockResolvedValueOnce({ data: mockMessage, error: null })
                .mockResolvedValueOnce({
                    data: { id: "user-123", first_name: "Test", last_name: "User" },
                    error: null,
                });

            const uploadMock = jest.fn().mockResolvedValue({
                error: null,
            });

            const getPublicUrlMock = jest.fn().mockReturnValue({
                data: { publicUrl: "https://example.com/uploaded.jpg" },
            });

            supabase.storage.from.mockReturnValue({
                upload: uploadMock,
                getPublicUrl: getPublicUrlMock,
            });

            const insertMock = jest.fn().mockReturnThis();
            const selectMock = jest.fn().mockReturnThis();

            supabase.from.mockImplementation(() => ({
                select: selectMock,
                eq: jest.fn().mockReturnThis(),
                single: singleMock,
                insert: insertMock,
            }));

            selectMock.mockReturnValue({
                eq: jest.fn().mockReturnThis(),
                single: singleMock,
            });

            insertMock.mockReturnValue({
                select: selectMock,
            });

            const result = await sendMessage("conv-123", "", mockFile);

            expect(result).toBeDefined();
            expect(result.image_url).toBe("https://example.com/uploaded.jpg");
            expect(uploadMock).toHaveBeenCalled();
        });

        test("throws error when user is both buyer and seller", async () => {
            supabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
            });

            const mockConvData = {
                buyer_id: "user-123",
                seller_id: "user-123", // Same as buyer
            };

            const singleMock = jest.fn().mockResolvedValue({
                data: mockConvData,
                error: null,
            });

            supabase.from.mockImplementation(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: singleMock,
            }));

            await expect(sendMessage("conv-123", "Hello!", null)).rejects.toThrow(
                "Vous ne pouvez pas envoyer de messages dans cette conversation"
            );
        });
    });

    describe("subscribeToMessages", () => {
        test("subscribes to real-time messages and calls callback", () => {
            const mockCallback = jest.fn();
            const mockChannel = {
                on: jest.fn().mockReturnThis(),
                subscribe: jest.fn().mockReturnThis(),
            };

            supabase.channel.mockReturnValue(mockChannel);

            const unsubscribe = subscribeToMessages("conv-123", mockCallback);

            expect(supabase.channel).toHaveBeenCalledWith("messages:conv-123");
            expect(mockChannel.on).toHaveBeenCalled();
            expect(mockChannel.subscribe).toHaveBeenCalled();

            // Test unsubscribe
            expect(typeof unsubscribe).toBe('function');
            unsubscribe();
            expect(supabase.removeChannel).toHaveBeenCalled();
        });

        test("fetches message details when new message arrives", async () => {
            const mockCallback = jest.fn();
            let insertHandler;

            const mockChannel = {
                on: jest.fn((event, config, handler) => {
                    insertHandler = handler;
                    return mockChannel;
                }),
                subscribe: jest.fn(),
            };

            supabase.channel.mockReturnValue(mockChannel);

            const mockNewMessage = {
                id: "msg-new",
                conversation_id: "conv-123",
                sender_id: "seller-456",
                content: "New message",
                created_at: "2024-01-01T00:00:00Z",
            };

            const singleMock = jest.fn();
            singleMock
                .mockResolvedValueOnce({
                    data: mockNewMessage,
                    error: null,
                })
                .mockResolvedValueOnce({
                    data: mockProfile,
                    error: null,
                });

            supabase.from.mockImplementation(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: singleMock,
            }));

            supabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
            });

            subscribeToMessages("conv-123", mockCallback);

            // Simulate INSERT event
            await insertHandler({ new: { id: "msg-new" } });

            expect(mockCallback).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: "msg-new",
                    content: "New message",
                    sender: expect.objectContaining({
                        fullName: "Alice Dupont",
                    }),
                    isFromCurrentUser: false,
                })
            );
        });
    });
});