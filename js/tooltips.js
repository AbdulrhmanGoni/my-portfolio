const targets = document.querySelectorAll(".tooltip-target");

if (targets) {
    const tooltip = document.createElement("p");
    tooltip.className = "tooltip";

    targets.forEach((target) => {
        target.addEventListener("mouseenter", () => {
            if (!target.querySelector(".tooltip")) {
                const targetPosition = target.getBoundingClientRect();
                let targetPositionX = targetPosition.x + targetPosition.width / 2;
                let targetPositionY = targetPosition.y + targetPosition.height / 2;

                if (target.dataset.tooltip) {
                    tooltip.textContent = target.dataset.tooltip;
                    console.log(tooltip)
                    tooltip.style.textWrap = "nowrap"
                    target.appendChild(tooltip);
                    const tooltipPosition = tooltip.getBoundingClientRect();
                    const tooltipWidth = tooltipPosition.width;
                    const tooltipHeight = tooltipPosition.height;
                    const tooltipTopPosition = targetPositionY - tooltipHeight / 2
                    let tooltipLeftPosition = targetPositionX - tooltipWidth / 2

                    if (tooltipLeftPosition + tooltipWidth > window.innerWidth) {
                        const overflowGap = (tooltipLeftPosition + tooltipWidth) - window.innerWidth
                        tooltipLeftPosition -= overflowGap
                    }

                    tooltip.style.left = `${tooltipLeftPosition < 0 ? 0 : tooltipLeftPosition}px`;
                    tooltip.style.top = `${tooltipTopPosition < 0 ? 0 : tooltipTopPosition}px`;

                    if (tooltipWidth > window.innerWidth) {
                        tooltip.style.textWrap = "wrap"
                    }
                }
            }
        })
        target.addEventListener("mouseleave", () => {
            const tooltip = target.querySelector(".tooltip")
            tooltip && target.removeChild(tooltip)
        })
        document.addEventListener("scroll", () => {
            const tooltip = target.querySelector(".tooltip")
            tooltip && target.removeChild(tooltip)
        })
    })
}
