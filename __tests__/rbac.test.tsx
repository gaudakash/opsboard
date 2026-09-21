import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

// Simple component representing product action dropdown based on role
function ProductActions({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div>
      <button data-testid="edit-btn">Edit Product</button>
      {isAdmin ? (
        <button data-testid="delete-btn">Delete Product</button>
      ) : (
        <span data-testid="restricted-text">Delete (Admin only)</span>
      )}
    </div>
  )
}

describe('Role-Based Access Control (RBAC) UI Tests', () => {
  it('renders Delete button when user is an Admin', () => {
    render(<ProductActions isAdmin={true} />)
    
    expect(screen.getByTestId('delete-btn')).toBeInTheDocument()
    expect(screen.queryByTestId('restricted-text')).not.toBeInTheDocument()
  })

  it('hides Delete button and shows restriction text when user is Staff', () => {
    render(<ProductActions isAdmin={false} />)
    
    expect(screen.queryByTestId('delete-btn')).not.toBeInTheDocument()
    expect(screen.getByTestId('restricted-text')).toBeInTheDocument()
    expect(screen.getByTestId('restricted-text')).toHaveTextContent('Delete (Admin only)')
  })
})