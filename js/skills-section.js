const skills = document.querySelectorAll(".skill");

if (skills) {

    const tooltipStyle = {
        position: "fixed",
        transition: ".3s",
        padding: "5px",
        animation: "tooltip-appearing .3s ease-in",
        backgroundColor: "black",
        textWrap: "nowrap",
        zIndex: "1000",
        borderRadius: "5px",
        boxShadow: "0 0 7px -4px var(--primary-color)"
    }
    const tooltip = document.createElement("p");
    tooltip.className = "tooltip";
    Object.assign(tooltip.style, tooltipStyle);

    skills.forEach((skill) => {
        skill.addEventListener("mouseenter", () => {
            if (!skill.querySelector(".tooltip")) {
                const skillPosition = skill.getBoundingClientRect();
                let skillPositionX = skillPosition.x + skillPosition.width / 2;
                let skillPositionY = skillPosition.y + skillPosition.height / 2;

                const skillDescriptio = skill.querySelector("img")?.getAttribute("alt");
                if (skillDescriptio) {
                    tooltip.textContent = skillDescriptio;
                    skill.appendChild(tooltip);
                    const tooltipPosition = tooltip.getBoundingClientRect();
                    const tooltipWidth = tooltipPosition.width;
                    const tooltipHeight = tooltipPosition.height;
                    const tooltipTopPosition = skillPositionY - tooltipHeight / 2
                    const tooltipLeftPosition = skillPositionX - tooltipWidth / 2
                    tooltip.style.top = `${tooltipTopPosition < 0 ? 0 : tooltipTopPosition}px`;
                    tooltip.style.left = `${tooltipLeftPosition < 0 ? 0 : tooltipLeftPosition}px`;
                }
            }
        })
        skill.addEventListener("mouseleave", () => {
            const tooltip = skill.querySelector(".tooltip")
            tooltip && skill.removeChild(tooltip)
        })
        document.addEventListener("scroll", () => {
            const tooltip = skill.querySelector(".tooltip")
            tooltip && skill.removeChild(tooltip)
        })
    })
}
