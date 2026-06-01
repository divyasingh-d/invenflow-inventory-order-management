import { useState } from "react";
import { Search } from "lucide-react";

export default function DataTable({
  columns,
  data,
  isLoading,
  emptyIcon,
  emptyTitle,
  emptyMessage,
  emptyAction,
  searchable = true,
  searchPlaceholder = "Search...",
  searchKeys = [],
}) {
  const [query, setQuery] = useState("");

  const filtered = searchable && query.trim()
    ? data.filter((row) =>
        searchKeys.some((key) => {
          const val = String(row[key] ?? "").toLowerCase();
          return val.includes(query.toLowerCase());
        })
      )
    : data;

  return (
    <div className="table-container">
      {searchable && (
        <div className="table-toolbar">
          <div className="table-search">
            <Search className="table-search-icon" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              id="table-search-input"
            />
          </div>
          <span className="table-count">
            {filtered.length} of {data.length} records
          </span>
        </div>
      )}

      {isLoading ? (
        <div className="loading-overlay">
          <div className="spinner" />
          <span className="loading-text">Loading data...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          {emptyIcon && (
            <div className="empty-state-icon">{emptyIcon}</div>
          )}
          <h3>{query ? "No results found" : (emptyTitle || "No data")}</h3>
          <p>
            {query
              ? `No records match "${query}". Try a different search.`
              : (emptyMessage || "Get started by adding your first record.")}
          </p>
          {!query && emptyAction}
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.key}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, idx) => (
                <tr key={row.id ?? idx}>
                  {columns.map((col) => (
                    <td key={col.key} className={col.primary ? "td-primary" : ""}>
                      {col.render ? col.render(row) : row[col.key] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
