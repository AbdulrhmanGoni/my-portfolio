import javascriptIcon from "../assets/icons/javascript.svg";
import typescriptIcon from "../assets/icons/typescript.svg";
import goIcon from "../assets/icons/go.svg";
import dockerIcon from "../assets/icons/docker.svg";
import jestIcon from "../assets/icons/jest.svg";
import graphqlIcon from "../assets/icons/graphql.svg";
import nodejsIcon from "../assets/icons/nodejs.svg";
import denoIcon from "../assets/icons/deno.svg";
import honoIcon from "../assets/icons/hono.svg";
import expressIcon from "../assets/icons/express.svg";
import bunIcon from "../assets/icons/bun.svg";
import nestjsIcon from "../assets/icons/nestjs.svg";
import nginxIcon from "../assets/icons/nginx.svg";
import mongodbIcon from "../assets/icons/mongodb.svg";
import redisIcon from "../assets/icons/redis.svg";
import postgresqlIcon from "../assets/icons/postgresql.svg";
import qdrantIcon from "../assets/icons/qdrant.svg";
import reactIcon from "../assets/icons/react.svg";
import nextjsIcon from "../assets/icons/nextjs.svg";
import viteIcon from "../assets/icons/vite.svg";
import svelteIcon from "../assets/icons/svelte.svg";
import tailwindIcon from "../assets/icons/tailwind-css.svg";
import reactQueryIcon from "../assets/icons/react-query.svg";

export type Skill = {
    name: string;
    imgSrc: string;
    description: string;
    imgStyle?: string;
};

type SkillsData = {
    [category: string]: Skill[];
};

export const skillsData: SkillsData = {
    "Languages & Technologies": [
        {
            name: "JavaScript",
            imgSrc: javascriptIcon.src,
            description: "JavaScript Language",
        },
        {
            name: "TypeScript",
            imgSrc: typescriptIcon.src,
            description: "TypeScript Language",
        },
        {
            name: "Go",
            imgSrc: goIcon.src,
            description: "Go - Programming Language",
        },
        {
            name: "Docker",
            imgSrc: dockerIcon.src,
            description: "Docker - Containerization Technology",
        },
        {
            name: "Jest",
            imgSrc: jestIcon.src,
            description: "Jest - Testing Framework for JavaScript",
        },
        {
            name: "GraphQL",
            imgSrc: graphqlIcon.src,
            description: "GraphQL - A query language for your APIs",
        },
    ],
    "Back-End": [
        {
            name: "Node.js",
            imgSrc: nodejsIcon.src,
            description: "Node.js - JavaScript runtime environment",
        },
        {
            name: "Deno",
            imgSrc: denoIcon.src,
            description:
                "Secure & Modern JavaScript + TypeScript runtime environment",
            imgStyle: "border-radius: 50%",
        },
        {
            name: "Bun",
            imgSrc: bunIcon.src,
            description: "Bun - An Incredibly fast JavaScript runtime",
        },
        {
            name: "Hono",
            imgSrc: honoIcon.src,
            description: "Hono — JavaScript + TypeScript Web apps framework",
        },
        {
            name: "Express",
            imgSrc: expressIcon.src,
            description: "Express.js - JavaScript framework",
            imgStyle: "background: white;width: 40px;border-radius: 50%;",
        },
        {
            name: "NestJS",
            imgSrc: nestjsIcon.src,
            description: "Nest.js - JavaScript + TypeScript Back-End Framework",
        },
        {
            name: "Nginx",
            imgSrc: nginxIcon.src,
            description: "Nginx - as Proxy server and load balancer",
        },
    ],
    "Databases": [
        {
            name: "MongoDB",
            imgSrc: mongodbIcon.src,
            description: "Mongo Database (NoSQL)",
        },
        {
            name: "PostgreSQL",
            imgSrc: postgresqlIcon.src,
            description: "PostgreSQL - Relational Database",
        },
        {
            name: "Qdrant",
            imgSrc: qdrantIcon.src,
            description:
                "Qdrant - Vector database and semantic search engine",
        },
        {
            name: "Redis",
            imgSrc: redisIcon.src,
            description: "Redis - Multi-usage database",
        },
    ],
    "Front-End": [
        {
            name: "React",
            imgSrc: reactIcon.src,
            description: "React - JavaScript front-end library",
        },
        {
            name: "Next.js",
            imgSrc: nextjsIcon.src,
            description: "Next.js - React framework",
        },
        {
            name: "Vite",
            imgSrc: viteIcon.src,
            description: "Vite.js - Web dev builder tool",
        },
        {
            name: "SvelteKit",
            imgSrc: svelteIcon.src,
            description: "Sveltekit - Front-End framework",
        },
        { name: "Tailwind", imgSrc: tailwindIcon.src, description: "Tailwind - CSS Framework" },
        {
            name: "React Query",
            imgSrc: reactQueryIcon.src,
            description: "Asynchronous state manager for React",
        },
    ],
};
