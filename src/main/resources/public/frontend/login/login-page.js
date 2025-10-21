/**
 * This script handles the login functionality for the Recipe Management Application.
 * It manages user authentication by sending login requests to the server and handling responses.
*/
const BASE_URL = "http://localhost:8081"; // backend URL

/*
 * TODO: Get references to DOM elements
 * - username input
 * - password input
 * - login button
 * - logout button (optional, for token testing)
 */
const usernameInput = document.getElementById("login-input");
const passwordInput = document.getElementById("password-input");
const loginButton = document.getElementById("login-button");
const logoutButton = document.getElementById("logout-button");

/*
 * TODO: Add click event listener to login button
 * - Call processLogin on click
 */
loginButton.onclick = processLogin;


/**
 * TODO: Process Login Function
 * 
 * Requirements:
 * - Retrieve values from username and password input fields
 * - Construct a request body with { username, password }
 * - Configure request options for fetch (POST, JSON headers)
 * - Send request to /login endpoint
 * - Handle responses:
 *    - If 200: extract token and isAdmin from response text
 *      - Store both in sessionStorage
 *      - Redirect to recipe-page.html
 *    - If 401: alert user about incorrect login
 *    - For others: show generic alert
 * - Add try/catch to handle fetch/network errors
 * 
 * Hints:
 * - Use fetch with POST method and JSON body
 * - Use sessionStorage.setItem("key", value) to store auth token and admin flag
 * - Use `window.location.href` for redirection
 */
async function processLogin() {
    // Retrieve username and password from input fields
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    // Validate that neither is empty
    if (!username || !password) {
        alert("Please enter both username and password!");
        return;
    }

    // Create a requestBody object with username and password
    const requestBody = { username, password };

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
        body: JSON.stringify(requestBody)
    };

    try {
        // Send POST request to http://localhost:8081/login using fetch with requestOptions
        const response = await fetch(`${BASE_URL}/login`, requestOptions);

        // If response status is 200
        if (response.status === 200) {
            // Read the response as text
            const responseText = await response.text();

            // Response will be a space-separated string: "token123 true"
            // Split the string into token and isAdmin flag
            const parts = responseText.split(" ");
            const token = parts[0];
            const isAdmin = parts[1];

            // Store both in sessionStorage using sessionStorage.setItem()
            sessionStorage.setItem("auth-token", token);
            sessionStorage.setItem("is-admin", isAdmin);

            // Optionally show the logout button if applicable
            if (logoutButton) {
                logoutButton.style.display = "block";
            }

            // Add a small delay (e.g., 500ms) using setTimeout before redirecting
            setTimeout(() => {
                // Use window.location.href to redirect to the recipe page
                window.location.href = "../recipe/recipe-page.html";
            }, 500);
        } else if (response.status === 401) {
            // If response status is 401
            // Alert the user with "Incorrect login!"
            alert("Incorrect login!");
        } else {
            // For any other status code
            // Alert the user with a generic error like "Unknown issue!"
            alert("Unknown issue!");
        }
    } catch (error) {
        // Handle any network or unexpected errors
        // Log the error and alert the user
        console.error("Login error:", error);
        alert("An error occurred during login. Please try again.");
    }
}

