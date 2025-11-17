import { useState, useMemo, useEffect } from 'react'
import './PaginatedTable.css'

interface Column<T> {
  key: string
  header: string
  render: (item: T) => React.ReactNode
  width?: string
}

interface PaginatedTableProps<T> {
  data: T[]
  columns: Column<T>[]
  itemsPerPage?: number
  getItemKey: (item: T) => string | number
  emptyMessage?: string
}

export default function PaginatedTable<T>({
  data,
  columns,
  itemsPerPage = 10,
  getItemKey,
  emptyMessage = 'No items found'
}: PaginatedTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1)

  // Calculate pagination
  const totalPages = Math.ceil(data.length / itemsPerPage)
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return data.slice(startIndex, startIndex + itemsPerPage)
  }, [data, currentPage, itemsPerPage])

  // Reset to page 1 when data changes
  useEffect(() => {
    setCurrentPage(1)
  }, [data])

  return (
    <div className="paginated-table-container">
      <div className="table-wrapper">
        <table className="paginated-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} style={column.width ? { width: column.width } : undefined}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item) => (
                <tr key={getItemKey(item)}>
                  {columns.map((column) => (
                    <td key={column.key}>{column.render(item)}</td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="no-results-table">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data.length > 0 && totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-button"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            ← Previous
          </button>
          <div className="pagination-info">
            Page {currentPage} of {totalPages}
          </div>
          <button
            className="pagination-button"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next →
          </button>
        </div>
      )}

      <div className="results-count">
        Showing {paginatedData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-
        {Math.min(currentPage * itemsPerPage, data.length)} of {data.length} items
      </div>
    </div>
  )
}
