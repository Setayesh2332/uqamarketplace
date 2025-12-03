import { supabase } from "../supabaseClient";
import {
    getListings,
    createListing,
    deleteListing,
    updateListing,
    getListingById,
} from "../listingsApi";

jest.mock("../supabaseClient", () => {
    const supabase = {
        auth: {
            getUser: jest.fn(),
        },
        from: jest.fn(),
        storage: {
            from: jest.fn(),
        },
    };
    return { supabase };
});

const mockUser = { id: "user-123", email: "test@example.com" };

beforeEach(() => {
    jest.clearAllMocks();
});

beforeAll(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
});
afterAll(() => {
    console.error.mockRestore();
    console.warn.mockRestore();
});

/**
 * Helper to create the query-like object getListings expects:
 * supports: select, eq, gte, lte, ilike, or, order, range, and
 * resolves to finalResponse when awaited.
 */
function createListingsQueryMock(finalResponse) {
    const query = {
        select: jest.fn(() => query),
        eq: jest.fn(() => query),
        gte: jest.fn(() => query),
        lte: jest.fn(() => query),
        ilike: jest.fn(() => query),
        or: jest.fn(() => query),
        order: jest.fn(() => query),
        range: jest.fn(() => query),
        then: (resolve) => resolve(finalResponse),
    };
    return query;
}

describe("listingsApi.getListings", () => {
    test("returns listings with default filters/sort", async () => {
        const mockListings = [
            { id: "listing-1", title: "Livre de maths", price: 30 },
        ];

        // API actually returns extra fields (listing_images, profiles fields)
        const responseListings = mockListings.map((l) => ({
            ...l,
            profile_id: null,
            first_name: null,
            last_name: null,
            profile_email: null,
            profile_phone: null,
            listing_images: [],
        }));

        const queryMock = createListingsQueryMock({
            data: responseListings,
            error: null,
            count: responseListings.length,
        });

        supabase.from.mockReturnValue(queryMock);

        const { listings, total } = await getListings(
            {},
            { field: "created_at", order: "desc" },
            100
        );

        // Allow extra properties returned by the API
        expect(listings).toEqual([
            expect.objectContaining(mockListings[0]),
        ]);
        expect(total).toBe(1);

        expect(supabase.from).toHaveBeenCalledWith("listings_with_profiles");
        expect(queryMock.select).toHaveBeenCalled();
        expect(queryMock.order).toHaveBeenCalledWith("created_at", {
            ascending: false,
        });
        expect(queryMock.range).toHaveBeenCalled(); // pagination
    });

    test("applies filters for search, min/max price and condition", async () => {
        const queryMock = createListingsQueryMock({
            data: [],
            error: null,
            count: 0,
        });

        supabase.from.mockReturnValue(queryMock);

        await getListings(
            {
                search: "maths",
                min_price: 10,
                max_price: 100,
                condition: "Neuf",
                user_id: "user-123",
                status: "sold",
            },
            { field: "price", order: "asc" },
            50
        );

        expect(queryMock.or).toHaveBeenCalled();
        expect(queryMock.gte).toHaveBeenCalled();
        expect(queryMock.lte).toHaveBeenCalled();
        expect(queryMock.eq).toHaveBeenCalledWith("condition", "Neuf");
        expect(queryMock.eq).toHaveBeenCalledWith("user_id", "user-123");
        expect(queryMock.eq).toHaveBeenCalledWith("status", "sold");
        expect(queryMock.order).toHaveBeenCalledWith("price", { ascending: true });
        expect(queryMock.range).toHaveBeenCalled();
    });

    test("throws when the query returns an error", async () => {
        const queryMock = createListingsQueryMock({
            data: null,
            error: new Error("Something went wrong"),
            count: null,
        });

        supabase.from.mockReturnValue(queryMock);

        await expect(
            getListings({}, { field: "created_at", order: "desc" }, 10)
        ).rejects.toThrow(/something went wrong/i);
    });
});

describe("listingsApi.createListing", () => {
    test("throws if no authenticated user", async () => {
        supabase.auth.getUser.mockResolvedValue({
            data: { user: null },
            error: null,
        });

        await expect(
            createListing(
                { title: "Test listing", price: 20, category: "Autre" },
                []
            )
        ).rejects.toThrow(/utilisateur doit être authentifié/i);
    });

    test("creates listing and uploads images when user is authenticated", async () => {
        supabase.auth.getUser.mockResolvedValue({
            data: { user: mockUser },
            error: null,
        });

        // 1) insert listing
        const insertSingleMock = jest.fn().mockResolvedValue({
            data: { id: "listing-1", title: "Test listing", price: 20 },
            error: null,
        });

        const listingsInsertMock = jest.fn(() => ({
            select: () => ({
                single: insertSingleMock,
            }),
        }));

        // 2) insert image row after upload + getPublicUrl
        const imagesInsertMock = jest.fn(() =>
            Promise.resolve({
                data: { id: "image-1" },
                error: null,
            })
        );

        // 3) final select of listing with relations
        const finalListing = {
            id: "listing-1",
            title: "Test listing",
            price: 20,
            listing_images: [{ id: "image-1", path: "https://example.com/user-123/photo.jpg", display_order: 0 }],
            profile_id: null,
            first_name: null,
            last_name: null,
            profile_email: null,
            profile_phone: null,
        };

        const finalSelectSingleMock = jest.fn().mockResolvedValue({
            data: finalListing,
            error: null,
        });

        const listingsSelectMock = jest.fn(() => ({
            eq: () => ({
                single: finalSelectSingleMock,
            }),
        }));

        // supabase.from behaviour for different tables and operations
        supabase.from.mockImplementation((table) => {
            if (table === "listings") {
                return {
                    insert: listingsInsertMock,
                    select: listingsSelectMock,
                };
            }
            if (table === "listing_images") {
                return {
                    insert: imagesInsertMock,
                };
            }
            return {};
        });

        // storage mocks
        const storageUploadMock = jest.fn().mockResolvedValue({
            data: { path: "user-123/photo.jpg" },
            error: null,
        });
        const storageGetPublicUrlMock = jest.fn(() => ({
            data: { publicUrl: "https://example.com/user-123/photo.jpg" },
            error: null,
        }));

        supabase.storage.from.mockReturnValue({
            upload: storageUploadMock,
            getPublicUrl: storageGetPublicUrlMock,
        });

        const fakeFile = new File(["content"], "photo.jpg", {
            type: "image/jpeg",
        });

        const result = await createListing(
            {
                title: "Test listing",
                price: 20,
                category: "Autre",
                condition: "Neuf",
                description: "Cool stuff",
                contact_email: true,
                email: "seller@example.com",
                contact_cell: true,
                phone: "555-5555",
            },
            [fakeFile]
        );

        // Allow extra relational fields
        expect(result).toMatchObject({
            id: "listing-1",
            title: "Test listing",
            price: 20,
        });

        expect(listingsInsertMock).toHaveBeenCalledTimes(1);
        const payload =
            listingsInsertMock.mock.calls[0][0][0] ||
            listingsInsertMock.mock.calls[0][0];
        expect(payload.user_id).toBe(mockUser.id);

        expect(storageUploadMock).toHaveBeenCalled();
        expect(storageGetPublicUrlMock).toHaveBeenCalled();
        expect(imagesInsertMock).toHaveBeenCalled();
        expect(listingsSelectMock).toHaveBeenCalled(); // final fetch
    });

    test("propagates insert error from Supabase", async () => {
        supabase.auth.getUser.mockResolvedValue({
            data: { user: mockUser },
            error: null,
        });

        const failedSingleMock = jest.fn().mockResolvedValue({
            data: null,
            error: new Error("Insert failed"),
        });

        const listingsInsertMock = jest.fn(() => ({
            select: () => ({
                single: failedSingleMock,
            }),
        }));

        supabase.from.mockReturnValue({ insert: listingsInsertMock });

        await expect(
            createListing({ title: "Oops", price: 5, category: "Autre" }, [])
        ).rejects.toThrow(/insert failed/i);
    });
});

describe("listingsApi.updateListing", () => {
    test("updates listing with given fields", async () => {
        supabase.auth.getUser.mockResolvedValue({
            data: { user: mockUser },
            error: null,
        });

        // Ownership check
        const userIdSingleMock = jest.fn().mockResolvedValue({
            data: { user_id: mockUser.id },
            error: null,
        });
        const selectUserIdMock = jest.fn(() => ({
            eq: () => ({
                single: userIdSingleMock,
            }),
        }));

        // Update and return updated listing
        const updatedSingleMock = jest.fn().mockResolvedValue({
            data: { id: "listing-1", title: "Updated title" },
            error: null,
        });

        const updateMock = jest.fn(() => ({
            eq: () => ({
                select: () => ({
                    single: updatedSingleMock,
                }),
            }),
        }));

        supabase.from.mockImplementation((table) => {
            if (table === "listings") {
                return {
                    select: selectUserIdMock,
                    update: updateMock,
                };
            }
            return {};
        });

        const result = await updateListing("listing-1", {
            title: "Updated title",
            contact_cell: false,
            contact_email: false,
            contact_other: false,
        });

        expect(supabase.from).toHaveBeenCalledWith("listings");
        expect(updateMock).toHaveBeenCalledWith(
            expect.objectContaining({
                title: "Updated title",
                contact_cell: false,
                contact_email: false,
                contact_other: false,
            })
        );
        expect(result).toEqual({ id: "listing-1", title: "Updated title" });
    });
});

describe("listingsApi.getListingById", () => {
    test("returns listing with sorted images and profiles object", async () => {
        const singleMock = jest.fn().mockResolvedValue({
            data: {
                id: "listing-1",
                title: "Item",
                profile_id: "profile-1",
                first_name: "Alice",
                last_name: "Doe",
                profile_email: "alice@example.com",
                profile_phone: "123",
                listing_images: [
                    { id: "img2", path: "b.jpg", display_order: 2 },
                    { id: "img1", path: "a.jpg", display_order: 1 },
                ],
            },
            error: null,
        });

        const selectMock = jest.fn(() => ({
            eq: () => ({
                single: singleMock,
            }),
        }));

        supabase.from.mockImplementation((table) => {
            if (table === "listings_with_profiles") {
                return { select: selectMock };
            }
            return {};
        });

        const result = await getListingById("listing-1");

        expect(supabase.from).toHaveBeenCalledWith("listings_with_profiles");
        expect(selectMock).toHaveBeenCalled();
        expect(singleMock).toHaveBeenCalled();

        expect(result).toEqual({
            id: "listing-1",
            title: "Item",
            listing_images: [
                { id: "img1", path: "a.jpg", display_order: 1 },
                { id: "img2", path: "b.jpg", display_order: 2 },
            ],
            profiles: {
                id: "profile-1",
                first_name: "Alice",
                last_name: "Doe",
                email: "alice@example.com",
            },
        });
    });

    test("throws when Supabase returns an error", async () => {
        const singleMock = jest.fn().mockResolvedValue({
            data: null,
            error: new Error("Not found"),
        });

        const selectMock = jest.fn(() => ({
            eq: () => ({
                single: singleMock,
            }),
        }));

        supabase.from.mockImplementation((table) => {
            if (table === "listings_with_profiles") {
                return { select: selectMock };
            }
            return {};
        });

        await expect(getListingById("does-not-exist")).rejects.toThrow(/not found/i);
    });
});

describe("listingsApi.deleteListing", () => {
    test("throws if user is not authenticated", async () => {
        supabase.auth.getUser.mockResolvedValue({
            data: { user: null },
            error: null,
        });

        await expect(deleteListing("listing-1")).rejects.toThrow(
            /authentifié pour supprimer une annonce/i
        );
        expect(supabase.from).not.toHaveBeenCalled();
    });

    test("throws if listing does not belong to current user", async () => {
        supabase.auth.getUser.mockResolvedValue({
            data: { user: mockUser },
            error: null,
        });

        const userIdSingleMock = jest.fn().mockResolvedValue({
            data: { user_id: "other-user" },
            error: null,
        });

        const selectUserIdMock = jest.fn(() => ({
            eq: () => ({
                single: userIdSingleMock,
            }),
        }));

        supabase.from.mockImplementation((table) => {
            if (table === "listings") {
                return { select: selectUserIdMock };
            }
            return {};
        });

        await expect(deleteListing("listing-1")).rejects.toThrow(/propres annonces/i);
        expect(selectUserIdMock).toHaveBeenCalled();
    });

    test("deletes listing by id and removes associated images from storage", async () => {
        supabase.auth.getUser.mockResolvedValue({
            data: { user: mockUser },
            error: null,
        });

        // Ownership check
        const userIdSingleMock = jest.fn().mockResolvedValue({
            data: { user_id: mockUser.id },
            error: null,
        });
        const selectUserIdMock = jest.fn(() => ({
            eq: () => ({
                single: userIdSingleMock,
            }),
        }));

        // Images select
        const imagesSelectMock = jest.fn(() => ({
            eq: () =>
                Promise.resolve({
                    data: [
                        {
                            path: "https://xyz.supabase.co/storage/v1/object/public/listing-images/listings/listing-1/photo.jpg",
                        },
                    ],
                    error: null,
                }),
        }));

        const deleteListingMock = jest.fn(() => ({
            eq: () =>
                Promise.resolve({
                    data: null,
                    error: null,
                }),
        }));

        supabase.from.mockImplementation((table) => {
            if (table === "listings") {
                return {
                    select: selectUserIdMock,
                    delete: deleteListingMock,
                };
            }
            if (table === "listing_images") {
                return {
                    select: imagesSelectMock,
                };
            }
            return {};
        });

        const removeMock = jest.fn().mockResolvedValue({
            data: null,
            error: null,
        });

        supabase.storage.from.mockReturnValue({
            remove: removeMock,
        });

        await expect(deleteListing("listing-1")).resolves.toBeUndefined();

        expect(selectUserIdMock).toHaveBeenCalled();
        expect(imagesSelectMock).toHaveBeenCalled();
        expect(removeMock).toHaveBeenCalledWith([
            "listings/listing-1/photo.jpg",
        ]);
        expect(deleteListingMock).toHaveBeenCalled();
    });

    test("throws when delete returns an error", async () => {
        supabase.auth.getUser.mockResolvedValue({
            data: { user: mockUser },
            error: null,
        });

        const userIdSingleMock = jest.fn().mockResolvedValue({
            data: { user_id: mockUser.id },
            error: null,
        });
        const selectUserIdMock = jest.fn(() => ({
            eq: () => ({
                single: userIdSingleMock,
            }),
        }));

        const imagesSelectMock = jest.fn(() => ({
            eq: () =>
                Promise.resolve({
                    data: [],
                    error: null,
                }),
        }));

        const deleteListingMock = jest.fn(() => ({
            eq: () =>
                Promise.resolve({
                    data: null,
                    error: new Error("Delete failed"),
                }),
        }));

        supabase.from.mockImplementation((table) => {
            if (table === "listings") {
                return {
                    select: selectUserIdMock,
                    delete: deleteListingMock,
                };
            }
            if (table === "listing_images") {
                return {
                    select: imagesSelectMock,
                };
            }
            return {};
        });

        await expect(deleteListing("listing-1")).rejects.toThrow(/delete failed/i);

        expect(selectUserIdMock).toHaveBeenCalled();
        expect(imagesSelectMock).toHaveBeenCalled();
        expect(deleteListingMock).toHaveBeenCalled();
    });
});
