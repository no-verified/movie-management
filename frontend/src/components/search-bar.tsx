import {useState} from "react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onClear?: () => void;
  className?: string;
  initialValue?: string;
}

export function SearchBar({
  placeholder = "Search...",
  onSearch,
  onClear,
  className,
  initialValue = "",
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query.trim());
  };

  const handleClear = () => {
    setQuery("");
    onClear?.();
  };

  return (
    <form onSubmit={handleSubmit} className={cn("flex gap-2", className)}>
      <div className="flex-1 relative">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pr-20"
        />
        {query && (
          <Button
            type="button"
            variant="neutral"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-3 text-xs border-2 border-black box-border z-10 bg-white hover:bg-white transition-none"
          >
            Clear
          </Button>
        )}
      </div>
      <Button type="submit" variant="default" className="px-6">
        Search
      </Button>
    </form>
  );
}
