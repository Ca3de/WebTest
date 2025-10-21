/**
 * This script defines the registration functionality for the Registration page in the Recipe Management Application.
 */

const BASE_URL = "http://localhost:8081"; // backend URL

/*
 * TODO: Get references to various DOM elements
 * - usernameInput, emailInput, passwordInput, repeatPasswordInput, registerButton
 */
const usernameInput = document.getElementById("username-input");
const emailInput = document.getElementById("email-input");
const passwordInput = document.getElementById("password-input");
const repeatPasswordInput = document.getElementById("repeat-password-input");
const registerButton = document.getElementById("register-button");

/*
 * TODO: Ensure the register button calls processRegistration when clicked
 */
registerButton.onclick = processRegistration;


/**
 * TODO: Process Registration Function
 * 
 * Requirements:
 * - Retrieve username, email, password, and repeat password from input fields
 * - Validate all fields are filled
 * - Check that password and repeat password match
 * - Create a request body with username, email, and password
 * - Define requestOptions using method POST and proper headers
 * 
 * Fetch Logic:
 * - Send POST request to `${BASE_URL}/register`
 * - If status is 201:
 *      - Redirect user to login page
 * - If status is 409:
 *      - Alert that user/email already exists
 * - Otherwise:
 *      - Alert generic registration error
 * 
 * Error Handling:
 * - Wrap in try/catch
 * - Log error and alert user
 */
async function processRegistration() {
    try {
        // Retrieve values from input fields
        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const repeatPassword = repeatPasswordInput.value.trim();

        // Validate all fields are filled
        if (!username || !email || !password || !repeatPassword) {
            alert("All fields are required!");
            return;
        }

        // Check that password and repeat password match
        if (password !== repeatPassword) {
            alert("Passwords do not match!");
            return;
        }

        // Create request body
        const registerBody = { username, email, password };

        const requestOptions = {
            method: "POST",
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            },
            redirect: "follow",
            referrerPolicy: "no-referrer",
            body: JSON.stringify(registerBody)
        };

        // Send POST request to register endpoint
        const response = await fetch(`${BASE_URL}/register`, requestOptions);

        if (response.status === 201) {
            // Registration successful - redirect to login page
            window.location.href = "../login/login-page.html";
        } else if (response.status === 409) {
            // User/email already exists
            alert("Username or email already exists!");
        } else {
            // Generic error
            alert("Registration failed. Please try again.");
        }
    } catch (error) {
        console.error("Registration error:", error);
        alert("An error occurred during registration. Please try again.");
    }
}
