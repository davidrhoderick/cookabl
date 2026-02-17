import { useState } from "react";
import { useQuery } from "@apollo/client";
import { GROUPS_QUERY } from "../../graphql/queries/groups";

interface SearchFiltersProps {
  onFiltersChange: (filters: {
    categories: string[];
    groupIds: string[];
    maxResults: number;
  }) => void;
  initialFilters?: {
    categories: string[];
    groupIds: string[];
    maxResults: number;
  };
  className?: string;
}

export const SearchFilters = ({
  onFiltersChange,
  initialFilters = { categories: [], groupIds: [], maxResults: 20 },
  className = "",
}: SearchFiltersProps) => {
  const [categories, setCategories] = useState<string[]>(initialFilters.categories);
  const [selectedGroups, setSelectedGroups] = useState<string[]>(initialFilters.groupIds);
  const [maxResults, setMaxResults] = useState(initialFilters.maxResults);
  const [categoryInput, setCategoryInput] = useState("");

  const { data: groupsData } = useQuery(GROUPS_QUERY);
  const groups = groupsData?.groups || [];

  const handleCategoryAdd = () => {
    const trimmed = categoryInput.trim();
    if (trimmed && !categories.includes(trimmed)) {
      const newCategories = [...categories, trimmed];
      setCategories(newCategories);
      setCategoryInput("");
      onFiltersChange({
        categories: newCategories,
        groupIds: selectedGroups,
        maxResults,
      });
    }
  };

  const handleCategoryRemove = (category: string) => {
    const newCategories = categories.filter(c => c !== category);
    setCategories(newCategories);
    onFiltersChange({
      categories: newCategories,
      groupIds: selectedGroups,
      maxResults,
    });
  };

  const handleGroupToggle = (groupId: string) => {
    const newGroups = selectedGroups.includes(groupId)
      ? selectedGroups.filter(id => id !== groupId)
      : [...selectedGroups, groupId];
    setSelectedGroups(newGroups);
    onFiltersChange({
      categories,
      groupIds: newGroups,
      maxResults,
    });
  };

  const handleMaxResultsChange = (value: number) => {
    setMaxResults(value);
    onFiltersChange({
      categories,
      groupIds: selectedGroups,
      maxResults: value,
    });
  };

  const handleCategoryInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCategoryAdd();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Categories Filter */}
      <div>
        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
          Categories
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {categories.map(category => (
            <span
              key={category}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-[var(--accent)] text-[var(--accent-foreground)]"
            >
              {category}
              <button
                onClick={() => handleCategoryRemove(category)}
                className="ml-1 text-[var(--muted)] hover:text-[var(--foreground)]"
                aria-label={`Remove ${category} filter`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={categoryInput}
            onChange={(e) => setCategoryInput(e.target.value)}
            onKeyDown={handleCategoryInputKeyDown}
            placeholder="Add category..."
            className="flex-1 px-3 py-1 text-sm border border-[var(--line)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
          <button
            onClick={handleCategoryAdd}
            disabled={!categoryInput.trim()}
            className="px-3 py-1 text-sm bg-[var(--primary)] text-[var(--primary-foreground)] rounded hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
      </div>

      {/* Groups Filter */}
      {groups.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
            Groups
          </label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {groups.map((group: any) => (
              <label
                key={group.id}
                className="flex items-center space-x-2 cursor-pointer hover:bg-[var(--accent)]/50 p-1 rounded"
              >
                <input
                  type="checkbox"
                  checked={selectedGroups.includes(group.id)}
                  onChange={() => handleGroupToggle(group.id)}
                  className="rounded border-[var(--line)] text-[var(--primary)] focus:ring-[var(--primary)]"
                />
                <span className="text-sm">{group.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Max Results Filter */}
      <div>
        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
          Max Results: {maxResults}
        </label>
        <input
          type="range"
          min="5"
          max="50"
          step="5"
          value={maxResults}
          onChange={(e) => handleMaxResultsChange(Number(e.target.value))}
          className="w-full h-2 bg-[var(--line)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
        />
        <div className="flex justify-between text-xs text-[var(--muted)] mt-1">
          <span>5</span>
          <span>50</span>
        </div>
      </div>

      {/* Clear Filters */}
      {(categories.length > 0 || selectedGroups.length > 0 || maxResults !== 20) && (
        <button
          onClick={() => {
            setCategories([]);
            setSelectedGroups([]);
            setMaxResults(20);
            onFiltersChange({ categories: [], groupIds: [], maxResults: 20 });
          }}
          className="w-full px-3 py-2 text-sm border border-[var(--line)] rounded hover:bg-[var(--accent)] transition-colors"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
};
