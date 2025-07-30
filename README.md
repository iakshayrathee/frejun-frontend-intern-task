# Comments Dashboard

A single-page React application that fetches comments and posts from the public JSONPlaceholder API and presents them in an interactive, spreadsheet-like table.  Users can search, paginate, and **inline-edit** comment fields directly in the browser; edits are persisted to _localStorage_ so that they survive page reloads without mutating the public API.

**Repository:** [iakshayrathee/frejun-frontend-intern-task](https://github.com/iakshayrathee/frejun-frontend-intern-task.git)

> Built with **React 19** + **Vite 7** and styled with vanilla CSS. No external state-management or UI libraries are used.

---

## Table of Contents

1. [Features](#features)
2. [Getting Started](#getting-started)
3. [Available Scripts](#available-scripts)
4. [Project Structure](#project-structure)
5. [Data Flow & Local Storage Schema](#data-flow--local-storage-schema)
6. [API Reference](#api-reference)
7. [Contributing](#contributing)
8. [License](#license)

---

## Features

- 🔄 **Real-time Fetching** – Retrieves _comments_ and _posts_ concurrently on application load.
- 🔍 **Instant Search** – Case-insensitive filtering across email, name and body fields.
- 📄 **Pagination** – Client-side paging (10 comments per page) with status indicator.
- ✏️ **Inline Editing** – Click a row → click the ✎ icon to edit `email`, `name` or `body`. Changes are saved to localStorage.
- 💾 **Offline Persistence** – Edits are merged with fresh API data on every refresh so manual changes are never lost.
- ⚠️ **Robust Error / Loading States** – Spinner & retry button while fetching, graceful messages on API failure.

---

## Getting Started

### Prerequisites

- **Node ≥18** (18 LTS recommended)
- **npm ≥9** (bundled with Node) or **pnpm / yarn** if preferred.

### Installation

```bash
# clone the repository (replace <dest> if needed)
$ git clone https://github.com/iakshayrathee/frejun-frontend-intern-task.git

# install dependencies
$ npm install
```

### Running the App

```bash
# start Vite dev server with hot-reload at http://localhost:5173
$ npm run dev
```

### Production Build

```bash
# generate production-optimised bundle in /dist
$ npm run build

# preview the build locally
$ npm run preview
```

---

## Available Scripts

| Script          | Purpose                                  |
| --------------- | ----------------------------------------- |
| `npm run dev`   | Start Vite dev server with HMR            |
| `npm run build` | Build for production (`/dist`)            |
| `npm run preview` | Preview the production build locally    |
| `npm run lint`  | Lint the source code with ESLint          |

---

## Project Structure

```
├── public/                 # static assets (copied as-is)
├── src/
│   ├── assets/             # imported images & assets
│   ├── components/
│   │   ├── CommentRow.jsx  # single comment row
│   │   ├── EditableCell.jsx# editable <td>
│   │   ├── Pagination.jsx  # pagination controls
│   │   └── SearchBar.jsx   # search input + clear btn
│   ├── App.jsx             # root component & data logic
│   ├── App.css             # page-level styles
│   ├── index.css           # global resets
│   └── main.jsx            # ReactDOM.createRoot entry
├── vite.config.js          # Vite config
└── package.json
```

---

## Data Flow & Local Storage Schema

1. **Initial Load**
   1. Attempt to read `comments` array from `localStorage`.
   2. Regardless, send parallel `GET /comments` & `GET /posts` requests.
   3. Merge remote data with any locally-edited comment objects (by `id`).
   4. Persist merged array back to `localStorage`.
2. **Editing a Cell**
   1. Click ✎ → cell enters `<input>` mode.
   2. On _Save_, the comment object is updated in React state.
   3. Updated `comments` array is written to `localStorage`.

LocalStorage key: `comments`

```jsonc
// value example (array truncated)
[
  {
    "postId": 1,
    "id": 1,
    "name": "My edited name",
    "email": "edited@example.com",
    "body": "My custom body"
  }
]
```

---

### Post Title Mapping

When the app starts, it fetches `/posts` alongside `/comments`. The posts array is transformed into an **in-memory map** where each key is the post `id` and the value is its `title`:

```js
const titlesMap = posts.reduce(
  (acc, post) => ({ ...acc, [post.id]: post.title }),
  {}
);
```

During render, every comment row looks up `postTitles[comment.postId]` to display the human-readable title in the **Post** column. If a title is missing, the UI falls back to `Post {postId}`.

---

## API Reference

All network traffic goes to the free [JSONPlaceholder](https://jsonplaceholder.typicode.com/) REST service.

### Base URL

```
https://jsonplaceholder.typicode.com
```

### Endpoints

| Method | Endpoint                    | Purpose                         |
| ------ | --------------------------- | ------------------------------- |
| `GET`  | `/comments`                 | Fetch 500 placeholder comments  |
| `GET`  | `/posts`                    | Fetch 100 placeholder posts     |

> **Note:** The service is _read-only_; POST/PUT/DELETE requests will succeed but not actually mutate data. This app performs **only GET requests**.

### `GET /comments`

Fetch a list of comment objects.

#### Sample Request

```http
GET /comments HTTP/1.1
Host: jsonplaceholder.typicode.com
```

#### Response `200 OK`

```jsonc
[
  {
    "postId": 1,
    "id": 1,
    "name": "id labore ex et quam laborum",
    "email": "Eliseo@gardner.biz",
    "body": "laudantium enim quasi est quidem magnam voluptate ipsam eos\n..."
  },
  { "postId": 1, "id": 2, ... }
]
```

Field | Type | Description
------|------|------------
`postId` | integer | Foreign key referring to a post
`id`     | integer | Unique comment identifier
`name`   | string  | Comment title
`email`  | string  | Author email
`body`   | string  | Comment text (can include line breaks)

---

### `GET /posts`

Fetch a list of post objects used for displaying the post title in the table.

#### Sample Request

```http
GET /posts HTTP/1.1
Host: jsonplaceholder.typicode.com
```

#### Response `200 OK`

```jsonc
[
  {
    "userId": 1,
    "id": 1,
    "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
    "body": "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\n..."
  },
  { "userId": 1, "id": 2, ... }
]
```

Field | Type | Description
------|------|------------
`userId` | integer | Author identifier
`id`     | integer | Unique post identifier
`title`  | string  | Post title (rendered under **Post** column)
`body`   | string  | Post textual content (not used in UI)

---
