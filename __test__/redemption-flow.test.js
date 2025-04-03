// __tests__/redemption-flow.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductCard from '../components/ProductCard';
import { useProductRedemption } from '../hooks/useProductRedemption';

// Mock the hooks and components
jest.mock('../hooks/useProductRedemption');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: jest.fn()
  })
}));

describe('Product Redemption Flow', () => {
  // Sample product data
  const mockProduct = {
    _id: 'product123',
    name: 'Test Product',
    description: 'A test product',
    image: '/test-image.jpg',
    currentOwner: 'user123',
    creator: 'creator123',
    isRedeemed: false
  };

  beforeEach(() => {
    // Reset mock implementations
    useProductRedemption.mockImplementation(() => ({
      redeemProduct: jest.fn(),
      updateRedemptionStatus: jest.fn(),
      getRedemptionStatus: jest.fn(),
      isRedeeming: false,
      error: null
    }));
  });

  test('Owner can see and click redeem button', async () => {
    render(<ProductCard product={mockProduct} userId="user123" />);
    
    const redeemButton = screen.getByText(/redeem product/i);
    expect(redeemButton).toBeInTheDocument();
    
    await userEvent.click(redeemButton);
    expect(screen.getByText(/shipping address/i)).toBeInTheDocument();
  });

  test('Non-owner cannot see redeem button', () => {
    render(<ProductCard product={mockProduct} userId="differentUser" />);
    
    const redeemButton = screen.queryByText(/redeem product/i);
    expect(redeemButton).not.toBeInTheDocument();
  });

  test('Redemption form submission', async () => {
    const mockRedeemProduct = jest.fn();
    useProductRedemption.mockImplementation(() => ({
      redeemProduct: mockRedeemProduct,
      updateRedemptionStatus: jest.fn(),
      getRedemptionStatus: jest.fn(),
      isRedeeming: false,
      error: null
    }));

    render(<ProductCard product={mockProduct} userId="user123" />);
    
    // Open modal
    await userEvent.click(screen.getByText(/redeem product/i));
    
    // Fill form
    await userEvent.type(
      screen.getByLabelText(/shipping address/i),
      '123 Test Street'
    );
    await userEvent.type(
      screen.getByLabelText(/phone number/i),
      '1234567890'
    );
    
    // Submit form
    await userEvent.click(screen.getByText(/redeem$/i));
    
    expect(mockRedeemProduct).toHaveBeenCalledWith({
      address: '123 Test Street',
      phoneNumber: '1234567890'
    });
  });

  test('Status updates for redeemed product', async () => {
    const redeemedProduct = {
      ...mockProduct,
      isRedeemed: true,
      redemptionDetails: {
        status: 'pending',
        shippingAddress: '123 Test St',
        phoneNumber: '1234567890'
      }
    };

    const mockStatusDetails = {
      currentStatus: 'pending',
      isCreator: true,
      availableActions: ['processing']
    };

    useProductRedemption.mockImplementation(() => ({
      redeemProduct: jest.fn(),
      updateRedemptionStatus: jest.fn(),
      getRedemptionStatus: jest.fn().mockResolvedValue(mockStatusDetails),
      isRedeeming: false,
      error: null
    }));

    render(<ProductCard product={redeemedProduct} userId="creator123" />);
    
    await waitFor(() => {
      expect(screen.getByText(/redemption status/i)).toBeInTheDocument();
      expect(screen.getByText(/PENDING/i)).toBeInTheDocument();
    });
  });

  test('Creator can update status', async () => {
    const redeemedProduct = {
      ...mockProduct,
      isRedeemed: true,
      redemptionDetails: {
        status: 'pending',
        shippingAddress: '123 Test St',
        phoneNumber: '1234567890'
      }
    };

    const mockUpdateStatus = jest.fn();
    useProductRedemption.mockImplementation(() => ({
      redeemProduct: jest.fn(),
      updateRedemptionStatus: mockUpdateStatus,
      getRedemptionStatus: jest.fn().mockResolvedValue({
        currentStatus: 'pending',
        isCreator: true,
        availableActions: ['processing']
      }),
      isRedeeming: false,
      error: null
    }));

    render(<ProductCard product={redeemedProduct} userId="creator123" />);
    
    await waitFor(() => {
      const processingButton = screen.getByText(/mark as processing/i);
      expect(processingButton).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText(/mark as processing/i));
    expect(mockUpdateStatus).toHaveBeenCalledWith('processing');
  });
});