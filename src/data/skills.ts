import javascriptIcon from "../assets/icons/javascript.svg";
import typescriptIcon from "../assets/icons/typescript.svg";
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
    imgSrc: string;
    description: string;
    style?: string;
    imgStyle?: string;
};

export type SkillsData = {
    [category: string]: Skill[];
};

export const skillsData: SkillsData = {
    "Languages & Technologies": [
        {
            imgSrc: javascriptIcon.src,
            description: "JavaScript Language",
        },
        {
            imgSrc: typescriptIcon.src,
            description: "TypeScript Language",
        },
        {
            imgSrc: dockerIcon.src,
            description: "Docker - Containerization Technology",
            style: "width: 120px;",
        },
        {
            imgSrc: jestIcon.src,
            description: "Jest - Testing Framework for JavaScript",
        },
        {
            imgSrc: graphqlIcon.src,
            description: "GraphQL - A query language for your APIs",
        },
    ],
    "Back-End": [
        {
            imgSrc: nodejsIcon.src,
            description: "Node.js - JavaScript runtime environment",
            style: "width: 120px;",
        },
        {
            imgSrc: denoIcon.src,
            description:
                "Secure & Modern JavaScript + TypeScript runtime environment",
            style: "width: 65px;",
            imgStyle: "border-radius: 50%",
        },
        {
            imgSrc: bunIcon.src,
            description: "Bun - An Incredibly fast JavaScript runtime",
        },
        {
            imgSrc: honoIcon.src,
            description: "Hono 🔥 - JavaScript + TypeScript Web apps framework",
        },
        {
            imgSrc: expressIcon.src,
            description: "Express.js - JavaScript framework",
            imgStyle: "background: white;width: 40px;border-radius: 50%;",
        },
        {
            imgSrc: nestjsIcon.src,
            description: "Nest.js - JavaScript + TypeScript Back-End Framework",
        },
        {
            imgSrc: nginxIcon.src,
            description: "Nginx - as Proxy server and load balancer",
            style: "width: 120px;",
        },
    ],
    "Databases": [
        {
            imgSrc: mongodbIcon.src,
            description: "Mongo Database (NoSQL)",
        },
        {
            imgSrc: postgresqlIcon.src,
            description: "PostgreSQL - Relational Database",
        },
        {
            imgSrc: qdrantIcon.src,
            description:
                "Qdrant - Vector database and semantic search engine",
            style: "width: 120px;",
        },
        {
            imgSrc: redisIcon.src,
            description: "Redis - Multi-usage database",
        },
    ],
    "Fron-End": [
        {
            imgSrc: reactIcon.src,
            description: "React - JavaScript front-end library",
        },
        {
            imgSrc: nextjsIcon.src,
            description: "Next.js - React framework",
            style: "width: 100px;",
        },
        {
            imgSrc: viteIcon.src,
            description: "Vite.js - Web dev builder tool",
        },
        {
            imgSrc: svelteIcon.src,
            description: "Sveltekit - Front-End framework",
        },
        { imgSrc: tailwindIcon.src, description: "Tailwind - CSS Framework" },
        {
            imgSrc: reactQueryIcon.src,
            description: "Asynchronous state manager for React",
        },
    ],
};
