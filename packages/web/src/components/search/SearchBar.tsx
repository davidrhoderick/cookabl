import { useState, useEffect, useRef } from "react";
import { useQuery } from "@apollo/client";
import { SEARCH_SUGGESTIONS_QUERY } from "../../graphql/queries/search";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar = ({
  onSearch,
  placeholder = "Search recipes...",
  className = "",
}: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLUListElement>(null);

  const { data: suggestionsData, loading: suggestionsLoading } = useQuery(
    SEARCH_SUGGESTIONS_QUERY,
    {
      variables: { partial: query },
      skip: query.length < 2,
      fetchPolicy: "cache-first",
    },
  );

  const suggestions = suggestionsData?.searchSuggestions || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(value.length >= 2);
    setSelectedSuggestionIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          setQuery(suggestions[selectedSuggestionIndex]);
          onSearch(suggestions[selectedSuggestionIndex]);
          setShowSuggestions(false);
          setSelectedSuggestionIndex(-1);
        } else {
          handleSubmit(e);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (
      inputRef.current &&
      !inputRef.current.contains(e.target as Node) &&
      suggestionsRef.current &&
      !suggestionsRef.current.contains(e.target as Node)
    ) {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedSuggestionIndex >= 0 && suggestionsRef.current) {
      const selectedElement = suggestionsRef.current.children[
        selectedSuggestionIndex
      ] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedSuggestionIndex]);

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(query.length >= 2)}
            placeholder={placeholder}
            className="w-full px-4 py-2 pr-10 border border-[var(--line)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg
              className="w-4 h-4 text-[var(--muted)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <ul
            ref={suggestionsRef}
            className="absolute z-10 w-full mt-1 bg-[var(--background)] border border-[var(--line)] rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {suggestionsLoading ? (
              <li className="px-4 py-2 text-[var(--muted)]">Loading suggestions...</li>
            ) : (
              suggestions.map((suggestion: string, index: number) => (
                <li
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`px-4 py-2 cursor-pointer transition-colors ${
                    index === selectedSuggestionIndex
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]"
                  }`}
                >
                  <div className="flex items-center">
                    <svg
                      className="w-3 h-3 mr-2 text-[var(--muted)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    {suggestion}
                  </div>
                </li>
              ))
            )}
          </ul>
        )}
      </form>
    </div>
  );
};
