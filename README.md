# tasky.

`tasky.` is a minimalist, single-page, fullstack Next.js task manager application designed for maximum developer aesthetic, featuring a high-contrast monochromatic (black, white, and shades of gray) layout. 

Built as an assessment submission for the CommuSync Full Stack Intern role.

---

## 🛠️ Tech Stack & Design Choices

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) for modern fullstack performance and server action routing.
- **Database ORM**: [Prisma 7](https://www.prisma.io/) utilizing the new config-based structure, client output separation, and strict driver adapters.
- **Database**: [Neon DB](https://neon.tech/) Serverless PostgreSQL connection.
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with pure CSS custom properties (`var(--background)`, `var(--foreground)`, etc.) implementing light and dark themes based on the system preferences.
- **Validation**: [Zod](https://zod.dev/) for robust, type-safe server-side input validation and error feedback.
- **Codebase**: [TypeScript](https://www.typescriptlang.org/) for complete end-to-end type safety.

---

## 📂 Folder Structure

The project has been laid out cleanly following the Next.js App Router standard, separating server-side logic from interactive client-side components:

```
CommuSync-task-manager/
├── .gitignore                      # Root Git ignores
├── tasky/                          # Primary Next.js application workspace
│   ├── prisma/
│   │   └── schema.prisma           # Prisma database schema definition (Task Model)
│   ├── src/
│   │   ├── app/
│   │   │   ├── actions.ts          # Server Actions for Task CRUD operations
│   │   │   ├── globals.css         # Minimal styling tokens (Light & Dark theme variables)
│   │   │   ├── layout.tsx          # Root HTML structures & Metadata
│   │   │   ├── page.tsx            # Server Component (Initial fetch wrapper)
│   │   │   └── TaskDashboard.tsx   # Client Component (Interactive UI/optimistic states)
│   │   ├── generated/
│   │   │   └── prisma/             # Generated Prisma 7 Client files (git-ignored)
│   │   └── lib/
│   │       ├── db.ts               # Prisma singleton client (Neon serverless adapter fallback)
│   │       └── validations.ts      # Zod validation schema schemas
│   ├── prisma.config.ts            # Prisma 7 central configurations
│   ├── tailwind.config.js          # Tailwind styling options
│   ├── tsconfig.json               # TypeScript config
│   ├── next.config.ts              # Next.js configurations
│   └── package.json                # Project script configuration & dependencies
└── README.md                       # Architecture & Documentation
```

---

## 🗄️ Database Schema

The database model is kept simple yet robust, tracking all required variables:

```prisma
model Task {
  id          String   @id @default(uuid())
  title       String   // Max 100 characters validation
  description String?  // Max 500 characters validation
  completed   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## 🔄 API Flow & Data Synchronization

Rather than exposing traditional REST API endpoints, the application leverages **Next.js Server Actions** to securely pass data between the frontend and backend with complete TypeScript support:

1. **Initial Hydration**:
   - `src/app/page.tsx` (Server Component) fetches all tasks from Neon DB via `getTasks()` during initial request hydration.
   - Initial tasks are rendered server-side and sent directly to `TaskDashboard.tsx` (Client Component) to eliminate layout shift.
2. **Task Creation**:
   - The user inputs the title and description in the form.
   - Upon submission, the form invokes `createTask` (Server Action) using React 19's `useActionState`.
   - The server validates the input against the Zod schema (`taskSchema`). If validation fails, it returns field-level validation errors immediately without touching the database.
   - On success, Prisma writes the task to Neon DB and revalidates the homepage path (`revalidatePath('/')`), which triggers a background reload to fetch the latest dataset.
3. **Task Toggle & Delete**:
   - Clicking the checkbox or delete button updates the UI **optimistically** (zero layout delay).
   - `startTransition` triggers the background Server Actions (`toggleTask` and `deleteTask`).
   - If the database write succeeds, the state remains. If it fails, the client rolls back to the previous stable state and alerts the user of the failure.

---

## 🚧 Challenges Faced & Mitigations

1. **Prisma 7 Driver Adapters**:
   - Prisma 7 mandates the use of driver adapters for serverless database connections and query optimizations.
   - *Mitigation*: We integrated `@prisma/adapter-neon` alongside `@neondatabase/serverless` and configured a singleton in `src/lib/db.ts` that dynamically wraps the database client when connecting to a standard PostgreSQL/Neon connection string, and works seamlessly with local developer database protocols.
2. **Next.js + React 19 API Changes**:
   - React 19 replaced standard `useFormState` hook patterns with the newer `useActionState` hook.
   - *Mitigation*: We designed our action state to correctly manage fields, errors, validation, and pending states directly using React 19 conventions.

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18+)
- A Neon PostgreSQL or local PostgreSQL database instance.

### Installation
1. Clone the repository and navigate to the project directory:
   ```bash
   cd CommuSync-task-manager/tasky
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables:
   Create a `.env` file inside the `tasky/` folder:
   ```env
   DATABASE_URL="your-postgresql-connection-string"
   ```
4. Run migrations to initialize the database schema:
   ```bash
   npx prisma db push
   ```
5. Run the local development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` to view the application.

---

## ✨ Future Improvements

1. **Keyboard Navigation & Accessibility**:
   - Implementing full focus rings, tab traps, and keyboard shortcuts (e.g. `n` to create a task, `d` to delete).
2. **Category / Tag Management**:
   - Allowing users to group tasks under custom tags/categories.
3. **Archived Filter Tab**:
   - Moving completed tasks off the main lists into an archive to keep the interface uncluttered.
4. **Custom Order Drag and Drop**:
   - Implementing standard item sorting options or drag-and-drop mechanics to rearrange tasks dynamically.
