## General Guidelines

Prefer full client-side rendering (`"use client"`).

## Folder Structure

- `app/`: Application logic, including components, pages, and API routes.
  - `_components/`: Shared components.
  - `_hooks/`: Shared hooks.
  - `(authenticated)/`: Components and pages requiring authentication. See [Module Structure](#module-structure) for more details.
  - `(public)/`: Publicly accessible components and pages. See [Module Structure](#module-structure) for more details.
  - `api/`: Next.js API Route Handlers.
- `common/`: Common utilities, global types, enums, and constants (e.g., `common/types/response.ts`).
- `libs/`: Application-level providers and context (e.g., `libs/auth-context.tsx`).
- `types/`: TypeScript declaration files (e.g., `types/react-slider.d.ts`).
- `utils/`: Utility functions.
- `api/`: Client-side API functions and their type definitions.

## Overview

```
├── app/
│   ├── _components/
│   ├── (authenticated)/
│   │   └── <module>/
│   │       ├── _components/
│   │       ├── _hooks/
│   │       ├── _types/
│   │       ├── page.tsx
│   │       └── <nested-module>/
│   │           ├── _components/
│   │           ├── _hooks/
│   │           ├── _types/
│   │           └── page.tsx
│   ├── (public)/
│   │   └── <module>/
│   │       ├── _components/
│   │       ├── _hooks/
│   │       └── page.tsx
│   └── api/
├── common/
│   ├── enums/
│   ├── constants/
│   └── types/
├── libs/
├── types/
├── utils/
└── api/
```

## Module Structure

Each module can contain the following private folders (prefixed with `_`):

- `_components/`: Components scoped to the module.
- `_hooks/`: Hooks scoped to the module.
- `_const/`: Constants scoped to the module.
- `_utils/`: Utilities scoped to the module.
- `page.tsx`: The page component (entry point).

## Module Page Path Naming

| Action | Path           |
| ------ | -------------- |
| Create | `/create`      |
| Update | `/[id]/update` |
| List   | `/`            |
| Detail | `/[id]`        |

## How to Create a Module

### 1. Determine the Name and Location

- Choose a descriptive name that reflects the module's purpose.
- Decide whether the module belongs under `(authenticated)` or `(public)` route group.
- Create the folder inside the appropriate route group (e.g., `app/(authenticated)/users`).

### 2. Create `page.tsx`

This file serves as the entry point for the module. Implement the main UI and logic here.

```tsx
// app/(authenticated)/users/page.tsx
"use client";

import React from "react";

const UsersPage = () => {
  return <div>{/* ...UI implementation... */}</div>;
};

export default UsersPage;
```

### 3. Create Constants (If Needed)

If the module has constants, create a `_const` folder within the module.

```ts
// app/(authenticated)/users/_const/user-status-color.ts
export const USER_STATUS_COLOR = {
  PENDING: "processing",
  SUCCESS: "success",
  ERROR: "error",
};
```

### 4. Create Supporting Components (If Needed)

If the module has complex or reusable components, create a `_components` folder within the module.

```tsx
// app/(authenticated)/users/_components/user-table.tsx
"use client";

import React from "react";
import type { TUser } from "@/api/user/type";

interface UserTableProps {
  users: TUser[];
}

const UserTable = ({ users }: UserTableProps) => {
  return (
    <table>
      {/* ...table implementation... */}
    </table>
  );
};

export default UserTable;
```

### 5. Create Hooks (If Needed)

If the module has complex or reusable logic, create a `_hooks` folder within the module.

```ts
// app/(authenticated)/users/_hooks/use-users-query.ts
import { useQuery } from "@tanstack/react-query";
import { getUsers } from "@/api/user";
import type { TGetUsersParams } from "@/api/user/type";

export const useUsersQuery = (params: TGetUsersParams) => {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => getUsers(params),
  });
};
```

### 6. Create Utilities (If Needed)

If the module has utility functions, create a `_utils` folder within the module.

```ts
// app/(authenticated)/users/_utils/format-user.ts
const formatUser = (user: { firstName: string; lastName: string }) => {
  return {
    ...user,
    fullName: `${user.firstName} ${user.lastName}`,
  };
};

export default formatUser;
```

### 7. Assemble in `page.tsx`

Import the components, hooks, utilities, or constants you created into `page.tsx` and use them to implement the module's UI and logic.

```tsx
// app/(authenticated)/users/page.tsx
"use client";

import React from "react";
import UserTable from "./_components/user-table";
import { useUsersQuery } from "./_hooks/use-users-query";

const UsersPage = () => {
  const { data: users } = useUsersQuery({});

  return (
    <div>
      <h1>Users</h1>
      {users && <UserTable users={users} />}
    </div>
  );
};

export default UsersPage;
```

## State Management

Choose the appropriate state management approach based on the application's complexity:

- **`useState`**: For simple, local component state that changes infrequently.
- **`useContext`**: For global data that changes infrequently and needs to be accessed by many components (e.g., user data, theme).
- **React Query (`@tanstack/react-query`)**: For server state management related to data fetching and caching.