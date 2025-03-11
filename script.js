const toggleButton = document.createElement("button");
toggleButton.innerText = "Toggle Dark Mode";
toggleButton.onclick = () => {
    document.body.classList.toggle("dark-mode");
};
document.body.prepend(toggleButton);

const style = document.createElement("style");
style.innerHTML = `
    .dark-mode { background: #222; color: white; }
    .dark-mode header { background: #111; }
`;
document.head.appendChild(style);
