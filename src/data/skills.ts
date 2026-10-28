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
        },
        {
            name: "TypeScript",
            imgSrc: typescriptIcon.src,
        },
        {
            name: "Go",
            imgSrc: goIcon.src,
        },
        {
            name: "Docker",
            imgSrc: dockerIcon.src,
        },
        {
            name: "Jest",
            imgSrc: jestIcon.src,
        },
        {
            name: "GraphQL",
            imgSrc: graphqlIcon.src,
        },
    ],
    "Back-End": [
        {
            name: "Node.js",
            imgSrc: nodejsIcon.src,
        },
        {
            name: "Deno",
            imgSrc: denoIcon.src,
            imgStyle: "border-radius: 50%",
        },
        {
            name: "Bun",
            imgSrc: bunIcon.src,
        },
        {
            name: "Hono",
            imgSrc: honoIcon.src,
        },
        {
            name: "Express",
            imgSrc: expressIcon.src,
            imgStyle: "background: white;width: 40px;border-radius: 50%;",
        },
        {
            name: "NestJS",
            imgSrc: nestjsIcon.src,
        },
        {
            name: "Nginx",
            imgSrc: nginxIcon.src,
        },
    ],
    "Databases": [
        {
            name: "MongoDB",
            imgSrc: mongodbIcon.src,
        },
        {
            name: "PostgreSQL",
            imgSrc: postgresqlIcon.src,
        },
        {
            name: "Qdrant",
            imgSrc: qdrantIcon.src,
        },
        {
            name: "Redis",
            imgSrc: redisIcon.src,
        },
    ],
    "Front-End": [
        {
            name: "React",
            imgSrc: reactIcon.src,
        },
        {
            name: "Next.js",
            imgSrc: nextjsIcon.src,
        },
        {
            name: "Vite",
            imgSrc: viteIcon.src,
        },
        {
            name: "SvelteKit",
            imgSrc: svelteIcon.src,
        },
        {
            name: "Tailwind",
            imgSrc: tailwindIcon.src,
        },
        {
            name: "React Query",
            imgSrc: reactQueryIcon.src,
        },
    ],
};
