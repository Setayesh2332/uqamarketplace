import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import MyListings from "../MyListings";
import { useAuth } from "../../contexts/AuthContext";
import { getListings, deleteListing } from "../../utils/listingsApi";

// mock navigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
}));

// mock contexts & API
jest.mock("../../contexts/AuthContext", () => ({
    useAuth: jest.fn(),
}));

jest.mock("../../utils/listingsApi", () => ({
    getListings: jest.fn(),
    deleteListing: jest.fn(),
}));

// mock MenuBar (avoid rendering full header)
jest.mock("../../components/MenuBar", () => ({
    __esModule: true,
    default: () => <div data-testid="menu-bar">MenuBar</div>,
}));

// mock react-icons
jest.mock("react-icons/fa", () => ({
    FaEdit: () => <span>Edit Icon</span>,
    FaTrash: () => <span>Trash Icon</span>,
    FaPlus: () => <span>Plus Icon</span>,
}));

const mockUser = {
    id: "user-123",
    email: "test@example.com",
};

const mockListings = [
    {
        id: "listing-1",
        title: "Test Product 1",
        category: "Electronics",
        price: 100,
        condition: "Neuf",
        status: "active",
        description: "This is a test product description",
        created_at: "2024-01-15T10:00:00Z",
        listing_images: [{ path: "https://example.com/image1.jpg" }],
    },
    {
        id: "listing-2",
        title: "Test Product 2",
        category: "Furniture",
        price: 250,
        condition: "Comme neuf",
        status: "inactive",
        description:
            "This is another test product with a very long description that should be truncated when displayed on the card because it exceeds the character limit",
        created_at: "2024-02-20T14:30:00Z",
        listing_images: [],
    },
];

const mockedUseAuth = useAuth; // already a jest.fn from jest.mock
const mockedGetListings = getListings;
const mockedDeleteListing = deleteListing;

describe("MyListings", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockNavigate.mockReset();

        mockedUseAuth.mockReturnValue({ user: mockUser });
        mockedGetListings.mockResolvedValue({ listings: mockListings });

        // mock window methods
        window.confirm = jest.fn();
        window.alert = jest.fn();
    });

    const renderComponent = () => {
        return render(
            <BrowserRouter>
                <MyListings />
            </BrowserRouter>
        );
    };

    // ---------------- Component Rendering ----------------
    describe("Component Rendering", () => {
        test("renders MyListings component with header", async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText("Mes Annonces")).toBeInTheDocument();
            });
        });

        test("renders MenuBar component", () => {
            renderComponent();
            expect(screen.getByTestId("menu-bar")).toBeInTheDocument();
        });

        test("renders create button in header", async () => {
            renderComponent();

            await waitFor(() => {
                const createButtons = screen.getAllByText(/Créer une annonce/i);
                expect(createButtons.length).toBeGreaterThan(0);
            });
        });
    });

    // ---------------- Data Fetching ----------------
    describe("Data Fetching", () => {
        test("fetches listings on mount", async () => {
            renderComponent();

            await waitFor(() => {
                expect(mockedGetListings).toHaveBeenCalledWith(
                    { user_id: mockUser.id },
                    { field: "created_at", order: "desc" },
                    100
                );
            });
        });

        test("displays loading state initially", () => {
            renderComponent();
            expect(
                screen.getByText("Chargement de vos annonces...")
            ).toBeInTheDocument();
        });

        test("displays listings after successful fetch", async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText("Test Product 1")).toBeInTheDocument();
                expect(screen.getByText("Test Product 2")).toBeInTheDocument();
            });
        });

        test("displays error message on fetch failure", async () => {
            mockedGetListings.mockRejectedValueOnce(new Error("API Error"));

            renderComponent();

            await waitFor(() => {
                expect(
                    screen.getByText("Erreur lors du chargement de vos annonces")
                ).toBeInTheDocument();
            });
        });

        test("displays empty state when no listings", async () => {
            mockedGetListings.mockResolvedValueOnce({ listings: [] });

            renderComponent();

            await waitFor(() => {
                expect(
                    screen.getByText("Vous n'avez pas encore d'annonces.")
                ).toBeInTheDocument();
                expect(
                    screen.getByText("Créer votre première annonce")
                ).toBeInTheDocument();
            });
        });

        test("does not fetch listings when user is not authenticated", async () => {
            mockedUseAuth.mockReturnValueOnce({ user: null });

            renderComponent();

            await waitFor(() => {
                expect(mockedGetListings).not.toHaveBeenCalled();
            });
        });
    });

    // ---------------- Listing Display ----------------
    describe("Listing Display", () => {
        test("displays listing information correctly", async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText("Test Product 1")).toBeInTheDocument();
                expect(screen.getByText("Electronics")).toBeInTheDocument();
                expect(screen.getByText("100 $")).toBeInTheDocument();
                expect(screen.getByText("État : Neuf")).toBeInTheDocument();
            });
        });

        test("displays formatted date", async () => {
            renderComponent();

            await waitFor(() => {
                // Just check the prefix; exact French date text can vary by locale
                expect(screen.getAllByText(/Publié le/).length).toBeGreaterThan(0);
            });
        });

        test("displays status badges correctly", async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText("Active")).toBeInTheDocument();
                expect(screen.getByText("Inactive")).toBeInTheDocument();
            });
        });

        test("truncates long descriptions", async () => {
            renderComponent();

            await waitFor(() => {
                const truncated = screen.getByText(
                    /This is another test product with a very long description/
                );
                expect(truncated.textContent).toContain("...");
            });
        });

        test("uses placeholder image when no images available", async () => {
            renderComponent();

            await waitFor(() => {
                const images = screen.getAllByRole("img");
                const placeholderImage = images.find((img) =>
                    img.src.includes("picsum.photos")
                );
                expect(placeholderImage).toBeInTheDocument();
            });
        });
    });

    // ---------------- User Interactions ----------------
    describe("User Interactions", () => {
        test("navigates to /sell when create button is clicked", async () => {
            renderComponent();

            await waitFor(() => {
                const createButton = screen.getAllByText(/Créer une annonce/i)[0];
                fireEvent.click(createButton);
            });

            expect(mockNavigate).toHaveBeenCalledWith("/sell");
        });

        test("navigates to edit page when edit button is clicked", async () => {
            renderComponent();

            await waitFor(() => {
                const editButtons = screen.getAllByText(/Modifier/);
                fireEvent.click(editButtons[0]);
            });

            expect(mockNavigate).toHaveBeenCalledWith("/edit-listing/listing-1");
        });

        test("shows confirmation dialog when delete button is clicked", async () => {
            window.confirm.mockReturnValue(false);
            renderComponent();

            await waitFor(() => {
                const deleteButtons = screen.getAllByText(/Supprimer/);
                fireEvent.click(deleteButtons[0]);
            });

            expect(window.confirm).toHaveBeenCalledWith(
                "Êtes-vous sûr de vouloir supprimer cette annonce ?"
            );
        });

        test("cancels deletion when user clicks cancel", async () => {
            window.confirm.mockReturnValue(false);
            renderComponent();

            await waitFor(() => {
                const deleteButtons = screen.getAllByText(/Supprimer/);
                fireEvent.click(deleteButtons[0]);
            });

            expect(mockedDeleteListing).not.toHaveBeenCalled();
        });

        test("deletes listing when user confirms", async () => {
            window.confirm.mockReturnValue(true);
            mockedDeleteListing.mockResolvedValueOnce({});

            renderComponent();

            await waitFor(() => {
                const deleteButtons = screen.getAllByText(/Supprimer/);
                fireEvent.click(deleteButtons[0]);
            });

            await waitFor(() => {
                expect(mockedDeleteListing).toHaveBeenCalledWith("listing-1");
                expect(window.alert).toHaveBeenCalledWith(
                    "Annonce supprimée avec succès !"
                );
            });
        });

        test("removes listing from UI after successful deletion", async () => {
            window.confirm.mockReturnValue(true);
            mockedDeleteListing.mockResolvedValueOnce({});

            renderComponent();

            await waitFor(() => {
                expect(screen.getByText("Test Product 1")).toBeInTheDocument();
            });

            const deleteButtons = screen.getAllByText(/Supprimer/);
            fireEvent.click(deleteButtons[0]);

            await waitFor(() => {
                expect(
                    screen.queryByText("Test Product 1")
                ).not.toBeInTheDocument();
            });
        });

        test("shows error alert when deletion fails", async () => {
            window.confirm.mockReturnValue(true);
            mockedDeleteListing.mockRejectedValueOnce(new Error("Delete failed"));

            renderComponent();

            await waitFor(() => {
                const deleteButtons = screen.getAllByText(/Supprimer/);
                fireEvent.click(deleteButtons[0]);
            });

            await waitFor(() => {
                expect(window.alert).toHaveBeenCalledWith(
                    "Erreur lors de la suppression de l'annonce"
                );
            });
        });

        test("disables buttons during deletion", async () => {
            window.confirm.mockReturnValue(true);
            mockedDeleteListing.mockImplementation(
                () => new Promise((resolve) => setTimeout(resolve, 100))
            );

            renderComponent();

            await waitFor(() => {
                const deleteButtons = screen.getAllByText(/Supprimer/);
                fireEvent.click(deleteButtons[0]);
            });

            await waitFor(() => {
                expect(screen.getByText("Suppression...")).toBeInTheDocument();
            });
        });
    });
});
