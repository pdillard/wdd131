const character = {
    name: "Swamp Beast Diplomat",
    class: "Diplomat",
    level: 1,
    health: 100,
    image: "swamp-beast.jpg",

    attacked() {
        this.health -= 20;

        if (this.health <= 0) {
            this.health = 0;
            updateCard();
            alert(this.name + " has died.");
            return;
        }

        updateCard();
    },

    levelUp() {
        this.level += 1;
        updateCard();
    }
};

function updateCard() {
    document.getElementById("name").textContent = character.name;
    document.getElementById("class").textContent = "Class: " + character.class;
    document.getElementById("level").textContent = "Level: " + character.level;
    document.getElementById("health").textContent = "Health: " + character.health;
}

document.getElementById("attackBtn").addEventListener("click", function () {
    character.attacked();
});

document.getElementById("levelBtn").addEventListener("click", function () {
    character.levelUp();
});

updateCard();