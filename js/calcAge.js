const birthDate = '2003-07-02';

function calcAge(birthDate) {
    const date = new Date(birthDate);
    const ageDifMs = Date.now() - date.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
};

document.getElementById("age").innerHTML = calcAge(birthDate);

