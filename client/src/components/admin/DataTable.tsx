import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronUpIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, item: T) => ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  error?: string;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  onCreate?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  createLabel?: string;
  emptyMessage?: string;
  keyExtractor: (item: T) => string;
  searchableFields?: (keyof T)[];
  actions?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  error,
  searchPlaceholder = 'Search...',
  onSearch,
  onCreate,
  onEdit,
  onDelete,
  onView,
  createLabel = 'Create New',
  emptyMessage = 'No data found',
  keyExtractor,
  searchableFields = [],
  actions = true,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const shouldReduceMotion = useReducedMotion();

  // Filter data based on search query
  const filteredData = searchQuery
    ? data.filter((item) => {
      const searchLower = searchQuery.toLowerCase();
      return searchableFields.some((field) => {
        const value = item[field];
        return value && String(value).toLowerCase().includes(searchLower);
      });
    })
    : data;

  // Sort data
  const sortedData = sortConfig
    ? [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    })
    : filteredData;

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return {
          key,
          direction: current.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key, direction: 'asc' };
    });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  if (error) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <div className="text-destructive mb-4">
          <ExclamationTriangleIcon className="h-8 w-8 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">Error</h3>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Create Button */}
        {onCreate && (
          <Button onClick={onCreate} className="shrink-0">
            <PlusIcon className="h-4 w-4 mr-2" />
            {createLabel}
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className={cn(
                      'px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider',
                      column.sortable && 'cursor-pointer hover:bg-muted/70 transition-colors',
                      column.width && `w-${column.width}`
                    )}
                    onClick={() => column.sortable && handleSort(String(column.key))}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {column.sortable && (
                        <div className="flex flex-col">
                          <ChevronUpIcon
                            className={cn(
                              'h-3 w-3',
                              sortConfig?.key === column.key && sortConfig.direction === 'asc'
                                ? 'text-foreground'
                                : 'text-muted-foreground/50'
                            )}
                          />
                          <ChevronDownIcon
                            className={cn(
                              'h-3 w-3 -mt-1',
                              sortConfig?.key === column.key && sortConfig.direction === 'desc'
                                ? 'text-foreground'
                                : 'text-muted-foreground/50'
                            )}
                          />
                        </div>
                      )}
                    </div>
                  </th>
                ))}
                {actions && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <AnimatePresence mode="popLayout">
                {loading ? (
                  // Loading rows
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={`loading-${index}`} className="animate-pulse">
                      {columns.map((column) => (
                        <td key={String(column.key)} className="px-6 py-4">
                          <div className="h-4 bg-muted rounded" />
                        </td>
                      ))}
                      {actions && (
                        <td className="px-6 py-4 text-right">
                          <div className="h-4 bg-muted rounded w-20 ml-auto" />
                        </td>
                      )}
                    </tr>
                  ))
                ) : sortedData.length > 0 ? (
                  sortedData.map((item, index) => (
                    <motion.tr
                      key={keyExtractor(item)}
                      layout
                      initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      {columns.map((column) => (
                        <td key={String(column.key)} className="px-6 py-4 text-sm">
                          {column.render
                            ? column.render(item[column.key as keyof T], item)
                            : String(item[column.key as keyof T] || '')}
                        </td>
                      ))}
                      {actions && (
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {onView && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onView(item)}
                                className="h-8 w-8 p-0"
                              >
                                <EyeIcon className="h-4 w-4" />
                                <span className="sr-only">View</span>
                              </Button>
                            )}
                            {onEdit && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit(item)}
                                className="h-8 w-8 p-0"
                              >
                                <PencilIcon className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                            )}
                            {onDelete && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDelete(item)}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              >
                                <TrashIcon className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            )}
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={columns.length + (actions ? 1 : 0)}
                      className="px-6 py-12 text-center"
                    >
                      <div className="text-muted-foreground">
                        <MagnifyingGlassIcon className="h-8 w-8 mx-auto mb-4" />
                        <p>{emptyMessage}</p>
                        {searchQuery && (
                          <p className="text-sm mt-2">
                            No results found for "{searchQuery}"
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Results summary */}
      {!loading && (
        <div className="text-sm text-muted-foreground">
          Showing {sortedData.length} of {data.length} results
          {searchQuery && ` for "${searchQuery}"`}
        </div>
      )}
    </div>
  );
}
