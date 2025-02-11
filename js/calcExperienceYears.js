const startDate = '2022-9-01';

function calcExperienceYears(startDate) {
    const date = new Date(startDate);
    const yearsDifMs = Date.now() - date.getTime();
    const experienceYearsDate = new Date(yearsDifMs);

    const years = Math.abs(experienceYearsDate.getUTCFullYear() - 1970);
    const months = experienceYearsDate.getMonth();

    return `${years} years${months > 0 ? ` and ${months} ${months > 1 ? "months" : "month"}` : ""}`
};

document.getElementById("experience-years").innerHTML = calcExperienceYears(startDate);
