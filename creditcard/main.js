const form = document.getElementById("paymentForm");
const message = document.getElementById("message");

form.addEventListener("submit", function(e) {
    e.preventDefault();

    const number = document.getElementById("cardNumber").value.trim();
    const month = document.getElementById("month").value.trim();
    const year = document.getElementById("year").value.trim();

    if (number !== "1234123412341234") {
        message.textContent = "Invalid card number.";
        message.style.color = "red";
        return;
    }

    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);

    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
        message.textContent = "Invalid expiration month.";
        message.style.color = "red";
        return;
    }

    if (isNaN(yearNum)) {
        message.textContent = "Invalid expiration year.";
        message.style.color = "red";
        return;
    }

    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;

    if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
        message.textContent = "Card is expired.";
        message.style.color = "red";
        return;
    }

    message.textContent = "Payment successful.";
    message.style.color = "green";
});