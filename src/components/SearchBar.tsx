import React from 'react';
import { Search, Filter, Upload, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GraphNode } from '@/data/graphData';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onExportGraph: () => void;
  nodes: GraphNode[];
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  onFileUpload,
  onExportGraph,
  nodes
}) => {
  // Get unique categories from nodes
  const categories = ['all', ...new Set(nodes.map(node => node.group))];

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4 bg-card border-b border-border">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder="Search nodes..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-graph-surface border-graph-border focus:border-primary transition-colors"
        />
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 min-w-[200px]">
        <Filter className="text-muted-foreground h-4 w-4" />
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="bg-graph-surface border-graph-border">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category === 'all' ? 'All Categories' : 
                 category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {/* File Upload */}
        <div className="relative">
          <input
            type="file"
            accept=".json"
            onChange={onFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer"
            id="file-upload"
          />
          <Button 
            variant="outline" 
            size="sm"
            className="bg-graph-surface border-graph-border hover:bg-accent"
            asChild
          >
            <label htmlFor="file-upload" className="cursor-pointer flex items-center gap-2">
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Upload</span>
            </label>
          </Button>
        </div>

        {/* Export Button */}
        <Button 
          variant="outline" 
          size="sm"
          onClick={onExportGraph}
          className="bg-graph-surface border-graph-border hover:bg-accent flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </div>
    </div>
  );
};

export default SearchBar;