# Portfolio Admin System

A comprehensive admin dashboard for managing portfolio content with authentication, CRUD operations, file uploads, and drag-to-reorder functionality.

## 🌟 Features

### Authentication & Security

- **JWT-based Authentication** with secure token storage
- **Protected Routes** with automatic redirects
- **Session Management** with token refresh
- **Login/Logout** functionality with beautiful UI
- **Route Guards** preventing unauthorized access

### Content Management

- **Projects CRUD** with drag-to-reorder functionality
- **Certificates Management** with image uploads
- **Timeline Management** for career milestones
- **Skills Management** with proficiency levels
- **Contact Messages** inbox with read/unread status

### File Management

- **Drag & Drop Upload** with visual feedback
- **Multiple File Support** with progress tracking
- **Cloudinary Integration** with automatic optimization
- **File Organization** by folders (projects, certificates, etc.)
- **URL Generation** with copy-to-clipboard functionality

### Data Management

- **TanStack Query** for server state management
- **Optimistic Updates** for better UX
- **Automatic Refetching** on data mutations
- **Error Handling** with retry mechanisms
- **Caching Strategy** for improved performance

## 🏗️ Architecture

### Tech Stack

- **React 18** with TypeScript
- **TanStack Query** for server state
- **React Hook Form** + **Zod** for forms
- **Framer Motion** for animations
- **DND Kit** for drag-and-drop
- **React Dropzone** for file uploads
- **Tailwind CSS** for styling

### File Structure

```
src/
├── contexts/
│   └── AuthContext.tsx           # Authentication state management
├── components/admin/
│   ├── AdminLayout.tsx           # Protected admin layout
│   ├── ProtectedRoute.tsx        # Route protection component
│   └── DataTable.tsx             # Reusable data table component
├── pages/admin/
│   ├── LoginPage.tsx             # Admin login page
│   ├── DashboardPage.tsx         # Admin dashboard overview
│   ├── ProjectsPage.tsx          # Projects CRUD with drag-reorder
│   ├── CertificatesPage.tsx      # Certificates management
│   ├── TimelinePage.tsx          # Timeline items management
│   ├── SkillsPage.tsx            # Skills management
│   ├── UploadManagerPage.tsx     # File upload interface
│   └── ContactMessagesPage.tsx   # Contact messages inbox
├── lib/
│   ├── schemas.ts                # Zod validation schemas
│   ├── api.ts                    # API client with auth headers
│   └── queries.ts                # TanStack Query hooks
└── routes/
    └── AdminRoutes.tsx           # Admin route configuration
```

## 🔐 Authentication System

### AuthContext

Provides authentication state and methods throughout the app:

```tsx
const { user, token, login, logout, isLoading, isAuthenticated } = useAuth();
```

#### Features:

- **Token Storage** in localStorage with automatic cleanup
- **Token Verification** on app startup
- **Auto-logout** on token expiration
- **Loading States** during authentication checks

### Protected Routes

Routes are protected using the `ProtectedRoute` component:

```tsx
<ProtectedRoute requireAuth={true}>
  <AdminDashboard />
</ProtectedRoute>
```

## 📊 Dashboard

### Overview Stats

- **Project Count** with link to projects page
- **Certificate Count** with management access
- **Timeline Items** count and quick access
- **Skills Count** with category breakdown
- **Unread Messages** count with alerts

### Recent Activity

- **Latest Projects** with creation dates
- **Recent Certificates** added
- **Timeline Updates** with status
- **Quick Actions** for common tasks

### Quick Actions

- **Create New Project** button
- **Add Certificate** shortcut
- **Add Timeline Item** link
- **Upload Manager** access

## 🗂️ CRUD Operations

### Projects Management

#### Features:

- **Sortable Table** with search and filters
- **Drag-to-Reorder** with visual feedback
- **Featured Project** toggle with star icons
- **Tag Management** with visual chips
- **Link Validation** for GitHub and live URLs
- **Image Gallery** with Cloudinary integration

#### Drag & Drop Reordering:

```tsx
// Uses @dnd-kit for smooth drag interactions
<DndContext onDragEnd={handleDragEnd}>
  <SortableContext items={projects}>
    {projects.map(project => (
      <SortableProjectRow key={project.id} project={project} />
    ))}
  </SortableContext>
</DndContext>
```

### Data Table Component

Reusable table with advanced features:

```tsx
<DataTable
  data={items}
  columns={columns}
  loading={isLoading}
  onSearch={setSearchQuery}
  onCreate={handleCreate}
  onEdit={handleEdit}
  onDelete={handleDelete}
  searchableFields={['title', 'description']}
/>
```

#### Features:

- **Sortable Columns** with visual indicators
- **Search Functionality** across specified fields
- **Loading States** with skeleton animations
- **Empty States** with helpful messages
- **Action Buttons** (view, edit, delete)
- **Responsive Design** for mobile devices

## 📁 File Upload System

### Upload Manager

Comprehensive file management interface:

#### Features:

- **Drag & Drop Zone** with visual feedback
- **Multiple File Upload** with progress tracking
- **File Type Validation** (images, PDFs)
- **Size Limits** (10MB per file)
- **Folder Organization** by content type
- **Upload Queue** with retry functionality

#### Cloudinary Integration:

```tsx
const uploadFile = async (file: File, folder: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  return apiClient.uploadFile(formData);
};
```

### Upload Workflow:

1. **File Selection** via drag-drop or click
2. **Validation** of file type and size
3. **Queue Management** with visual preview
4. **Batch Upload** to Cloudinary
5. **URL Generation** with copy functionality
6. **Recent Uploads** history display

## 🔄 State Management

### TanStack Query

Server state management with optimistic updates:

```tsx
const { data, isLoading, error } = useProjects();
const updateProject = useUpdateProject();

// Optimistic update
updateProject.mutate(updatedProject, {
  onMutate: async newProject => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries(['projects']);

    // Snapshot previous value
    const previousProjects = queryClient.getQueryData(['projects']);

    // Optimistically update
    queryClient.setQueryData(['projects'], old => ({
      ...old,
      data: old.data.map(p => (p.id === newProject.id ? newProject : p)),
    }));

    return { previousProjects };
  },
  onError: (err, newProject, context) => {
    // Rollback on error
    queryClient.setQueryData(['projects'], context.previousProjects);
  },
  onSettled: () => {
    // Always refetch after error or success
    queryClient.invalidateQueries(['projects']);
  },
});
```

### Query Keys

Organized query key structure:

```tsx
export const queryKeys = {
  projects: ['projects'] as const,
  project: (id: string) => ['projects', id] as const,
  certificates: ['certificates'] as const,
  // ... other keys
};
```

## 🎨 UI Components

### Form Validation

React Hook Form with Zod schemas:

```tsx
const form = useForm<ProjectFormData>({
  resolver: zodResolver(projectSchema),
  defaultValues: project || {},
});

const onSubmit = (data: ProjectFormData) => {
  if (project?.id) {
    updateProject.mutate({ id: project.id, ...data });
  } else {
    createProject.mutate(data);
  }
};
```

### Animation System

Framer Motion for smooth interactions:

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
>
  {content}
</motion.div>
```

### Responsive Design

Mobile-first approach with Tailwind:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => (
    <ItemCard key={item.id} item={item} />
  ))}
</div>
```

## 🚀 Getting Started

### Prerequisites

1. **Backend API** running with admin endpoints
2. **Cloudinary Account** for file uploads
3. **Admin User** created in database

### Environment Setup

```bash
# API Configuration
VITE_API_URL=http://localhost:5000/api/v1

# Cloudinary Settings
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
```

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

### First Login

1. Navigate to `/admin/login`
2. Use demo credentials:
   - Email: `admin@example.com`
   - Password: `change-this-password`
3. Access admin dashboard at `/admin`

## 🔧 API Integration

### Required Endpoints

The admin system expects these backend endpoints:

#### Authentication

- `POST /api/v1/auth/login` - Admin login
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/refresh` - Refresh token

#### CRUD Operations

- `GET /api/v1/{resource}` - List resources with pagination
- `GET /api/v1/{resource}/:id` - Get single resource
- `POST /api/v1/{resource}` - Create resource (Admin only)
- `PUT /api/v1/{resource}/:id` - Update resource (Admin only)
- `DELETE /api/v1/{resource}/:id` - Delete resource (Admin only)

#### File Uploads

- `POST /api/v1/upload/single` - Upload single file
- `POST /api/v1/upload/multiple` - Upload multiple files
- `DELETE /api/v1/upload/:publicId` - Delete file

### API Response Format

All endpoints should return consistent response format:

```json
{
  "success": true,
  "data": {...},
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  },
  "message": "Success message"
}
```

## 🎯 Advanced Features

### Drag & Drop Reordering

Uses `@dnd-kit` for accessible drag-and-drop:

```tsx
const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;

  if (over && active.id !== over.id) {
    const newOrder = arrayMove(items, oldIndex, newIndex);
    reorderMutation.mutate(newOrder);
  }
};
```

### Optimistic Updates

Immediate UI feedback while API calls execute:

```tsx
const mutation = useMutation({
  mutationFn: updateItem,
  onMutate: async newItem => {
    // Cancel queries and snapshot current state
    await queryClient.cancelQueries(['items']);
    const previousItems = queryClient.getQueryData(['items']);

    // Optimistically update UI
    queryClient.setQueryData(['items'], updateItemInList(newItem));

    return { previousItems };
  },
  onError: (err, newItem, context) => {
    // Rollback on error
    queryClient.setQueryData(['items'], context.previousItems);
  },
});
```

### File Upload Progress

Real-time upload feedback:

```tsx
const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
  {}
);

const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  return axios.post('/api/upload', formData, {
    onUploadProgress: progressEvent => {
      const progress = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
    },
  });
};
```

## 🔍 Search & Filtering

### Advanced Table Search

Multi-field search with debouncing:

```tsx
const [searchQuery, setSearchQuery] = useState('');
const [debouncedQuery] = useDebounce(searchQuery, 300);

const filteredData = useMemo(() => {
  if (!debouncedQuery) return data;

  return data.filter(item =>
    searchableFields.some(field =>
      item[field]?.toLowerCase().includes(debouncedQuery.toLowerCase())
    )
  );
}, [data, debouncedQuery, searchableFields]);
```

### Filter Combinations

Multiple filter support:

```tsx
const filteredItems = items.filter(item => {
  const matchesSearch =
    !searchQuery ||
    item.title.toLowerCase().includes(searchQuery.toLowerCase());
  const matchesCategory =
    !selectedCategory || item.category === selectedCategory;
  const matchesStatus = !selectedStatus || item.status === selectedStatus;

  return matchesSearch && matchesCategory && matchesStatus;
});
```

## 📱 Mobile Responsiveness

### Responsive Table

Mobile-friendly data display:

```tsx
// Desktop: Full table
// Mobile: Card layout
<div className="hidden md:block">
  <DataTable />
</div>
<div className="md:hidden">
  <CardList />
</div>
```

### Touch-Friendly Interface

Optimized for mobile interaction:

```tsx
<button className="min-h-[44px] min-w-[44px] touch-manipulation">
  Action Button
</button>
```

## 🔐 Security Considerations

### Token Management

- **Secure Storage** with automatic cleanup
- **Token Refresh** before expiration
- **Auto-logout** on invalid tokens
- **CSRF Protection** with secure headers

### Route Protection

- **Authentication Guards** on all admin routes
- **Role-based Access** (admin only)
- **Automatic Redirects** for unauthorized access

### Input Validation

- **Client-side** validation with Zod
- **Server-side** validation expected
- **XSS Prevention** with proper escaping
- **File Upload** type and size validation

## 🚀 Performance Optimizations

### Code Splitting

```tsx
const AdminRoutes = lazy(() => import('./routes/AdminRoutes'));
```

### Query Optimization

```tsx
// Prefetch related data
queryClient.prefetchQuery(['projects'], fetchProjects);

// Background refetch
useQuery(['items'], fetchItems, {
  staleTime: 5 * 60 * 1000, // 5 minutes
  refetchOnWindowFocus: false,
});
```

### Image Optimization

```tsx
// Cloudinary transformations
const optimizedUrl = buildCloudinaryUrl(
  publicId,
  'w_400,h_300,c_fill,f_auto,q_auto'
);
```

## 🧪 Testing Strategy

### Component Testing

```tsx
test('should render data table with items', () => {
  render(<DataTable data={mockData} columns={mockColumns} />);
  expect(screen.getByText('Test Item')).toBeInTheDocument();
});
```

### Integration Testing

```tsx
test('should create new project', async () => {
  render(<ProjectsPage />);

  fireEvent.click(screen.getByText('Create Project'));
  // ... form interactions

  await waitFor(() => {
    expect(screen.getByText('New Project')).toBeInTheDocument();
  });
});
```

## 📚 Future Enhancements

### Planned Features

- [ ] **Bulk Operations** for mass updates
- [ ] **Export Functionality** (CSV, JSON)
- [ ] **Audit Logs** for change tracking
- [ ] **Real-time Notifications** with WebSocket
- [ ] **Advanced Analytics** dashboard
- [ ] **Content Versioning** system
- [ ] **Multi-user Admin** support
- [ ] **API Rate Limiting** display
- [ ] **Backup/Restore** functionality
- [ ] **Theme Customization** options

### Technical Improvements

- [ ] **Offline Support** with service workers
- [ ] **Progressive Web App** features
- [ ] **Advanced Caching** strategies
- [ ] **Bundle Size** optimization
- [ ] **Accessibility** improvements
- [ ] **Performance Monitoring** integration

This admin system provides a robust, user-friendly interface for managing portfolio content with modern web technologies and best practices.
