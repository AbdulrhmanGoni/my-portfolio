const skillsData = {
    "Languages & Technologies": [
        {
            imgSrc: "./icons/javascript.svg",
            description: "JavaScript Language",
        },
        {
            imgSrc: "./icons/typescript.svg",
            description: "TypeScript Language",
        },
        {
            imgSrc: "./icons/docker.svg",
            description: "Docker - Containerization Technology",
            style: "width: 120px;",
        },
        {
            imgSrc: "./icons/jest.svg",
            description: "Jest - Testing Framework for JavaScript",
        },
        {
            imgSrc: "./icons/git.svg",
            description: "Git - Version Control System",
        },
        {
            imgSrc: "./icons/graphql.svg",
            description: "GraphQL - A query language for your APIs",
        },
    ],
    "Back-End": [
        {
            imgSrc: "./icons/nodejs.svg",
            description: "Node.js - JavaScript runtime environment",
            style: "width: 120px;",
        },
        {
            imgSrc: "./icons/deno.svg",
            description:
                "Secure & Modern JavaScript + TypeScript runtime environment",
            style: "width: 65px;",
            imgStyle: "border-radius: 50%",
        },
        {
            imgSrc: "./icons/hono.svg",
            description: "Hono 🔥 - JavaScript + TypeScript Web apps framework",
        },
        {
            imgSrc: "./icons/express.svg",
            description: "Express.js - JavaScript framework",
            imgStyle: "background: white;width: 40px;border-radius: 50%;",
        },
        {
            imgSrc: "./icons/bun.svg",
            description: "Bun - An Incredibly fast JavaScript runtime",
        },
        {
            imgSrc: "./icons/nestjs.svg",
            description: "Nest.js - JavaScript + TypeScript Back-End Framework",
        },
        {
            imgSrc: "./icons/nginx.svg",
            description: "Nginx - as Proxy server and load balancer",
            style: "width: 120px;",
        },
    ],
    "Databases": [
        {
            imgSrc: "./icons/mongodb.svg",
            description: "Mongo Database (NoSQL)",
        },
        {
            imgSrc: "./icons/redis.svg",
            description: "Redis - Multi-usage database",
        },
        {
            imgSrc: "./icons/postgresql.svg",
            description: "PostgreSQL - Relational Database",
        },
        {
            imgSrc: "./icons/sql.svg",
            description: "SQL Language - for any relational database",
        },
        {
            imgSrc: "./icons/qdrant.svg",
            description:
                "Qdrant - Vector database and semantic search engine",
            style: "width: 120px;",
        },
    ],
    "Fron-End": [
        {
            imgSrc: "./icons/react.svg",
            description: "React - JavaScript front-end library",
        },
        {
            imgSrc: "./icons/nextjs.svg",
            description: "Next.js - React framework",
            style: "width: 100px;",
        },
        {
            imgSrc: "./icons/vite.svg",
            description: "Vite.js - Web dev builder tool",
        },
        {
            imgSrc: "./icons/svelte.svg",
            description: "Sveltekit - Front-End framework",
        },
        { imgSrc: "./icons/tailwind-css.svg", description: "Tailwind - CSS Framework" },
        {
            imgSrc: "./icons/react-query.svg",
            description: "Asynchronous state manager for React",
        },
    ],
};

const skillsSectionContainer = document.getElementById(
    "skills-section-container",
);

Object.entries(skillsData).forEach(([title, skills]) => {
    let skillsList = "";

    skills.forEach((skill) => {
        skillsList += `
        <div class="skill tooltip-target" data-tooltip="${skill.description}" style="${skill.style}">
        <img loading="lazy" src="${skill.imgSrc}" alt="${skill.description}" style="${skill.imgStyle}">
        </div>
        `;
    });

    const skillsContainer = document.createElement("div");
    skillsContainer.className = "skills-container";
    skillsContainer.innerHTML = `
        <h2>${title}</h2>
        <div class="skills">${skillsList}</div>
    `;
    skillsSectionContainer.appendChild(skillsContainer);
});
