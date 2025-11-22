import denoKvGuiClientImage from "../assets/projects-images/kv-entries-table-dark.png";
import mechaAgentServerImage from "../assets/projects-images/mecha-agent.jpg";
import mechaAgentClientImage from "../assets/projects-images/mecha-agent-client.png";
import mechaAgentDocsImage from "../assets/projects-images/mecha-agent-docs.png";
import llmsTdmServerImage from "../assets/projects-images/llms-tdm-server.jpg";
import llmsTdmAppImage from "../assets/projects-images/llms-tdm-app.png";
import amStoreClientImage from "../assets/projects-images/am-store-client.png";
import amStoreAdminImage from "../assets/projects-images/am-store-admin.png";
import amStoreServerImage from "../assets/projects-images/am-store-server.png";
import amStoreLibraryImage from "../assets/projects-images/am-store-library.png";

export type ProjectData = {
    name: string;
    description: string;
    image: string;
    imageAlt: string;
    techStack: string[];
    repoUrl: string;
    liveUrl?: string;
    docsUrl?: string;
}

export type Project =
    Pick<ProjectData, "name" | "description" | "docsUrl" | "liveUrl"> &
    Partial<Pick<ProjectData, "image" | "imageAlt" | "techStack" | "repoUrl">> &
    { components?: ProjectData[] }

export const projectsData: Project[] = [
    {
        name: "Deno KV GUI Client",
        description: "Open Source cross-platform desktop application client for browsing, managing, and performing CRUD operations on Deno KV databases with a modern user interface.",
        image: denoKvGuiClientImage.src,
        imageAlt: "Deno KV GUI Client Interface",
        techStack: ["Deno", "Node", "TypeScript", "Electron", "Svelte", "SQLite"],
        repoUrl: "https://github.com/AbdulrhmanGoni/denokv-gui-client",
        liveUrl: "https://abdulrhmangoni.github.io/denokv-gui-client/",
    },
    {
        name: "Mecha Agent Platform",
        description: "A comprehensive SaaS platform that enables users to create, customize, and deploy AI chatbots with custom knowledge bases.",
        docsUrl: "https://abdulrhmangoni.github.io/mecha_agent_docs/",
        liveUrl: "https://mecha-agent.netlify.app",
        components: [
            {
                name: "Mecha Agent Server",
                description: "Backend API handling agents, datasets, API keys, and AI inference.",
                image: mechaAgentServerImage.src,
                imageAlt: "Mecha Agent Server",
                techStack: ["Deno", "Postgres", "Qdrant", "Hono", "Deno KV", "Docker", "Stripe"],
                repoUrl: "https://github.com/AbdulrhmanGoni/mecha_agent",
            },
            {
                name: "Mecha Agent Client",
                description: "Web application for managing agents, datasets, API keys with agent chat testing.",
                image: mechaAgentClientImage.src,
                imageAlt: "Mecha Agent Client",
                techStack: ["Svelte", "TypeScript", "Tailwind CSS", "Skeleton UI", "Auth.js"],
                repoUrl: "https://github.com/AbdulrhmanGoni/mecha_agent_client",
            },
            {
                name: "Mecha Agent Documentation",
                description: "Documentation site with onboarding guide and inference client integration instructions for developers",
                image: mechaAgentDocsImage.src,
                imageAlt: "Mecha Agent Documentation",
                techStack: ["Docusaurus", "React", "Markdown", "MDX"],
                repoUrl: "https://github.com/AbdulrhmanGoni/mecha_agent_docs",
            }
        ]
    },
    {
        name: "LLMs Training Dataset Manager",
        description: "A web application designed for creating, managing, exporting training datasets in various formats optimized for Large Language Models and RAG systems.",
        // liveUrl: "https://llms-tdm.abdulrhman.icu",
        components: [
            {
                name: "LLMs TDM Server",
                description: "Backend API for datasets managing, processing, and format conversion.",
                image: llmsTdmServerImage.src,
                imageAlt: "LLMs TDM Server",
                techStack: ["Bun", "MongoDB", "Docker", "TypeScript"],
                repoUrl: "https://github.com/abdulrhmangoni/LLMs-TDM-Server",
            },
            {
                name: "LLMs TDM Application",
                description: "Web interface for managing datasets",
                image: llmsTdmAppImage.src,
                imageAlt: "LLMs TDM Application",
                techStack: ["Next.js", "TypeScript", "Shadcn/ui"],
                repoUrl: "https://github.com/abdulrhmangoni/LLMs-TDM-App",
            }
        ]
    },
    {
        name: "AM Store E-commerce Platform",
        description: "A complete e-commerce solution for Japanese Anime & Manga products, featuring a customer-facing store, comprehensive admin panel, and shared component library.",
        liveUrl: "https://am-store-client.vercel.app",
        components: [
            {
                name: "AM Store Server",
                description: "Backend API handling authentication and business logic",
                image: amStoreServerImage.src,
                imageAlt: "AM Store Server",
                techStack: ["Node.js", "Express", "MongoDB", "Jest", "Docker"],
                repoUrl: "https://github.com/AbdulrhmanGoni/AM-store-server",
            },
            {
                name: "AM Store Client",
                description: "Customer-facing e-commerce website with products browsing and cart management",
                image: amStoreClientImage.src,
                imageAlt: "AM Store Client",
                techStack: ["Next.js", "TypeScript", "Material-UI", "Redux"],
                repoUrl: "https://github.com/AbdulrhmanGoni/AM-store-client",
            },
            {
                name: "AM Store Admin Panel",
                description: "Admin dashboard for products and users management, orders tracking, and business analytics and statistics.",
                image: amStoreAdminImage.src,
                imageAlt: "AM Store Admin Panel",
                techStack: ["React", "TypeScript", "Material-UI", "Chart.js", "React Query", "Vite"],
                repoUrl: "https://github.com/AbdulrhmanGoni/AM-store-admin",
            },
            {
                name: "AM Store Library",
                description: "Shared component library containing reusable UI components, custom hooks, and utility functions between the admin panel and the e-commerce website",
                image: amStoreLibraryImage.src,
                imageAlt: "AM Store Library",
                techStack: ["TypeScript", "React", "Material-UI", "Rollup"],
                repoUrl: "https://github.com/AbdulrhmanGoni/AM-store-library",
            }
        ]
    },
]