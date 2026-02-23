import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ContactForm from "../../components/ContactForm";
import toast from "react-hot-toast";

// Mock react-hot-toast
jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

describe("ContactForm Component", () => {
  const mockOnClose = jest.fn();

  const defaultProps = {
    carId: "123",
    carBrand: "BMW",
    carModel: "M3",
    listingType: "sale" as const,
    carYear: "2023",
    carMileage: 10000,
    carColor: "Black",
    isExclusive: false,
    onClose: mockOnClose,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    ) as jest.Mock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders correctly for a sale listing", () => {
    render(<ContactForm {...defaultProps} />);

    expect(screen.getByLabelText(/Full Name\*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email\*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone\*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Message\*/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Send Appointment Request/i })).toBeInTheDocument();
  });

  it("renders correctly for a rental listing", () => {
    render(<ContactForm {...defaultProps} listingType="rental" />);

    expect(screen.getByRole("button", { name: /Request Rental Information/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Your rental details/i)).toBeInTheDocument();
  });

  it("shows an error and prevents submission if privacy policy is not accepted", () => {
    render(<ContactForm {...defaultProps} />);

    // Fill form
    fireEvent.change(screen.getByLabelText(/Full Name\*/i), { target: { value: "John Doe" } });
    fireEvent.change(screen.getByLabelText(/Email\*/i), { target: { value: "john@example.com" } });
    fireEvent.change(screen.getByLabelText(/Phone\*/i), { target: { value: "123456789" } });
    fireEvent.change(screen.getByLabelText(/Message\*/i), { target: { value: "Interested in this car." } });

    // Submit using the form directly to bypass HTML5 validation in JSDOM testing
    const form = screen.getByRole("button", { name: /Send Appointment Request/i }).closest("form");
    fireEvent.submit(form!);

    expect(toast.error).toHaveBeenCalledWith("You must accept the privacy policy to continue");
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("submits the form successfully and calls onClose", async () => {
    render(<ContactForm {...defaultProps} />);

    // Fill the required fields
    fireEvent.change(screen.getByLabelText(/Full Name\*/i), { target: { value: "Jane Doe" } });
    fireEvent.change(screen.getByLabelText(/Email\*/i), { target: { value: "jane@example.com" } });
    fireEvent.change(screen.getByLabelText(/Phone\*/i), { target: { value: "987654321" } });
    fireEvent.change(screen.getByLabelText(/Message\*/i), { target: { value: "Hello" } });

    // Check privacy policy
    fireEvent.click(screen.getByLabelText(/I accept the/i));

    fireEvent.click(screen.getByRole("button", { name: /Send Appointment Request/i }));

    expect(screen.getByRole("button", { name: /Sending.../i })).toBeDisabled();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    const fetchCallPayload = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);

    expect(fetchCallPayload).toMatchObject({
      name: "Jane Doe",
      email: "jane@example.com",
      phone: "987654321",
      message: "Hello",
      car_id: "123",
      car_model: "BMW M3",
      listing_type: "sale",
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Your request has been submitted successfully!");
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it("shows an error message if fetch fails", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
      })
    ) as jest.Mock;

    render(<ContactForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/Full Name\*/i), { target: { value: "Jane Doe" } });
    fireEvent.change(screen.getByLabelText(/Email\*/i), { target: { value: "jane@example.com" } });
    fireEvent.change(screen.getByLabelText(/Phone\*/i), { target: { value: "987654321" } });
    fireEvent.change(screen.getByLabelText(/Message\*/i), { target: { value: "Hello" } });

    fireEvent.click(screen.getByLabelText(/I accept the/i));

    fireEvent.click(screen.getByRole("button", { name: /Send Appointment Request/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Submission failed. Please try again.");
    });
  });
});
