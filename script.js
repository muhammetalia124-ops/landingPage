const themeSwitch = document.getElementById("theme-switch");
const themeColor = document.querySelector('meta[name="theme-color"]');

function applyTheme(theme) {
    const isLight = theme === "light";

    document.body.classList.toggle("light-theme", isLight);
    if (themeSwitch) {
        themeSwitch.checked = isLight;
        themeSwitch.setAttribute("aria-checked", String(isLight));
    }
    if (themeColor) {
        themeColor.content = isLight ? "#f6f8fb" : "#0b1020";
    }
}

if (themeSwitch) {
    applyTheme(localStorage.getItem("theme") || "dark");
    themeSwitch.addEventListener("change", () => {
        const theme = themeSwitch.checked ? "light" : "dark";
        applyTheme(theme);
        localStorage.setItem("theme", theme);
    });
}
