# 🚀 ReadmeGenAI

**ReadmeGenAI** is an automated documentation engine that transforms GitHub repository data into professional, high-quality `README.md` files. By analyzing your project's codebase, dependencies, and metadata via the GitHub API, it uses Large Language Models (LLMs) to draft comprehensive documentation in seconds.

[**Explore the Demo »**](https://readmegenai.vercel.app)

---

## 📑 Table of Contents
* [About the Project](#about-the-project)
* [Key Features](#key-features)
* [Tech Stack](#tech-stack)
* [Getting Started](#getting-started)
* [Architecture Flow](#architecture-flow)
* [Roadmap](#roadmap)
* [Contributing](#contributing)
* [License](#license)

---

## 🧐 About the Project

Writing documentation is often the most neglected part of the development cycle. **ReadmeGenAI** bridges the gap between "code complete" and "documentation complete." 

Unlike generic AI prompts, this tool specifically scrapes your `package.json`, language distribution, and repository description to provide the AI with context-aware data, ensuring the generated README is accurate and relevant to your actual tech stack.

## ✨ Key Features

* **Repo-to-Readme:** Just paste a URL; the engine handles the rest.
* **Contextual Intelligence:** Automatically detects frameworks, libraries, and project intent.
* **Live Preview:** Real-time Markdown rendering using `react-markdown`.
* **One-Click Copy:** Seamlessly move your new documentation into your local editor.
* **Developer-Centric:** Built with Type Safety and Serverless architecture.

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | [Next.js 15](https://nextjs.org/), TypeScript |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) |
| **Backend** | Next.js API Routes (Node.js) |
| **AI Intelligence** | OpenAI GPT-3.5 / GPT-4 |
| **Data Source** | [GitHub REST API](https://docs.github.com/en/rest) |
| **Deployment** | [Vercel](https://vercel.com/) |

---

## 🚀 Getting Started

### Prerequisites

* A GitHub [Personal Access Token](https://github.com/settings/tokens) (for higher rate limits).
* An [OpenAI API Key](https://platform.openai.com/api-keys).

### Installation

1.  **Clone the Repo**
    ```bash
    git clone [https://github.com/your-username/readmegenai.git](https://github.com/your-username/readmegenai.git)
    cd readmegenai
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Variables**
    Create a `.env.local` file in the root directory:
    ```env
    GITHUB_TOKEN=your_github_token
    OPENAI_API_KEY=your_openai_key
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

---

## 🏗 Architecture Flow

The application follows a streamlined data pipeline to ensure accuracy:

1.  **Ingestion:** User submits a GitHub URL.
2.  **Parsing:** `parseRepoUrl.ts` extracts the owner and repository name.
3.  **Data Fetching:** `/api/fetchRepo` queries GitHub for metadata and `package.json` content.
4.  **AI Processing:** `/api/generateReadme` feeds a structured prompt into the AI engine.
5.  **Rendering:** The frontend receives the Markdown string and renders it via `MarkdownPreview.tsx`.

---

## 🗺 Roadmap

- [x] **Phase 1:** MVP with URL input and Markdown copy.
- [ ] **Phase 2:** GitHub OAuth integration for one-click "Commit to Repo."
- [ ] **Phase 3:** Multiple visual templates (Minimalist, Corporate, Creative).
- [ ] **Phase 4:** Support for local LLMs (GPT4All / Ollama) for privacy-conscious users.

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create.

1.  Fork the Project.
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the Branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
*Built with ❤️ by the ReadmeGenAI Team*
