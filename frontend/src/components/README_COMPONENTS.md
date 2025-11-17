# Reusable Components

This directory contains reusable components that can be used throughout the application.

## PaginatedTable

A generic table component with built-in pagination support.

### Props

- `data` (T[]): Array of data to display
- `columns` (Column<T>[]): Array of column definitions
- `itemsPerPage` (number, optional): Number of items per page (default: 10)
- `getItemKey` (function): Function to get unique key from each item
- `emptyMessage` (string, optional): Message to show when no data (default: "No items found")

### Column Definition

```typescript
interface Column<T> {
  key: string           // Unique key for the column
  header: string        // Column header text
  render: (item: T) => React.ReactNode  // Function to render cell content
  width?: string        // Optional width (e.g., "200px")
}
```

### Example Usage

```typescript
import PaginatedTable from './PaginatedTable'

interface User {
  id: number
  name: string
  email: string
}

const users: User[] = [...]

const columns = [
  {
    key: 'name',
    header: 'Name',
    render: (user: User) => <strong>{user.name}</strong>
  },
  {
    key: 'email',
    header: 'Email',
    render: (user: User) => user.email
  },
  {
    key: 'actions',
    header: 'Actions',
    width: '150px',
    render: (user: User) => (
      <button onClick={() => handleEdit(user)}>Edit</button>
    )
  }
]

<PaginatedTable
  data={users}
  columns={columns}
  itemsPerPage={10}
  getItemKey={(user) => user.id}
  emptyMessage="No users found"
/>
```

## ActionsDropdown

A dropdown menu component for action buttons (edit, delete, etc.).

### Props

- `actions` (Action[]): Array of action definitions
- `buttonLabel` (string, optional): Aria label for the button (default: "Actions")
- `size` ('small' | 'medium', optional): Size of the button (default: 'medium')

### Action Definition

```typescript
interface Action {
  label: string                    // Action label
  icon?: React.ReactNode          // Optional icon
  onClick: () => void             // Click handler
  variant?: 'default' | 'danger'  // Style variant
}
```

### Example Usage

```typescript
import ActionsDropdown, { EditIcon, DeleteIcon } from './ActionsDropdown'

<ActionsDropdown
  actions={[
    {
      label: 'Edit',
      icon: <EditIcon />,
      onClick: () => handleEdit(item)
    },
    {
      label: 'Delete',
      icon: <DeleteIcon />,
      onClick: () => handleDelete(item.id),
      variant: 'danger'
    },
    {
      label: 'View Details',
      onClick: () => handleView(item)
    }
  ]}
  size="small"
/>
```

### Built-in Icons

The component exports two commonly used icons:
- `EditIcon` - Pencil icon for edit actions
- `DeleteIcon` - Trash icon for delete actions

You can also use custom icons by passing any React node to the `icon` prop.

## Styling

All components come with their own CSS files that are automatically imported. The styles use CSS variables and classes that match the application's design system.

### Customization

If you need to customize the styling:

1. Override CSS classes in your component's CSS file
2. Use CSS variables for colors and spacing
3. Wrap components in a custom div with specific classes

## Best Practices

1. **Type Safety**: Always define proper TypeScript interfaces for your data
2. **Performance**: Use `useMemo` for column definitions if they depend on state
3. **Accessibility**: Provide meaningful labels and ARIA attributes
4. **Error Handling**: Handle edge cases like empty data gracefully
5. **Consistency**: Use these components wherever possible to maintain UI consistency
