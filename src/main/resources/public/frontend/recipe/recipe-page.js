/**
 * This script defines the CRUD operations for Recipe objects in the Recipe Management Application.
 */

const BASE_URL = "http://localhost:8081"; // backend URL

let recipes = [];
let allRecipes = [];
let lastSearchTerm = "";

/*
 * TODO: Get references to various DOM elements
 * - Recipe name and instructions fields (add, update, delete)
 * - Recipe list container
 * - Admin link and logout button
 * - Search input
*/
const addRecipeNameInput = document.getElementById("add-recipe-name-input");
const addRecipeInstructionsInput = document.getElementById("add-recipe-instructions-input");
const addRecipeButton = document.getElementById("add-recipe-submit-input");

const updateRecipeNameInput = document.getElementById("update-recipe-name-input");
const updateRecipeInstructionsInput = document.getElementById("update-recipe-instructions-input");
const updateRecipeButton = document.getElementById("update-recipe-submit-input");

const deleteRecipeNameInput = document.getElementById("delete-recipe-name-input");
const deleteRecipeButton = document.getElementById("delete-recipe-submit-input");

const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");

const recipeListContainer = document.getElementById("recipe-list");
const adminLink = document.getElementById("admin-link");
const logoutButton = document.getElementById("logout-button");

/*
 * TODO: Show logout button if auth-token exists in sessionStorage
 */
if (sessionStorage.getItem("auth-token")) {
    logoutButton.style.display = "block";
}

/*
 * TODO: Show admin link if is-admin flag in sessionStorage is "true"
 */
if (sessionStorage.getItem("is-admin") === "true") {
    adminLink.style.display = "block";
}

/*
 * TODO: Attach event handlers
 * - Add recipe button → addRecipe()
 * - Update recipe button → updateRecipe()
 * - Delete recipe button → deleteRecipe()
 * - Search button → searchRecipes()
 * - Logout button → processLogout()
 */
addRecipeButton.onclick = addRecipe;
updateRecipeButton.onclick = updateRecipe;
deleteRecipeButton.onclick = deleteRecipe;
searchButton.onclick = searchRecipes;
logoutButton.onclick = processLogout;

/*
 * TODO: On page load, call getRecipes() to populate the list
 */
if (sessionStorage.getItem("auth-token")) {
    getRecipes();
}

async function ensureRecipesLoaded() {
    if (!allRecipes.length) {
        await getRecipes(true);
    }
}


/**
 * TODO: Search Recipes Function
 * - Read search term from input field
 * - Send GET request with name query param
 * - Update the recipe list using refreshRecipeList()
 * - Handle fetch errors and alert user
 */
async function searchRecipes() {
    try {
        const searchTerm = searchInput.value.trim().toLowerCase();
        lastSearchTerm = searchTerm;

        await ensureRecipesLoaded();

        if (!searchTerm) {
            recipes = [...allRecipes];
        } else {
            recipes = allRecipes.filter(recipe =>
                recipe.name && recipe.name.toLowerCase().includes(searchTerm)
            );
        }

        refreshRecipeList();
    } catch (error) {
        console.error("Search error:", error);
        alert("An error occurred while searching recipes");
    }
}

/**
 * TODO: Add Recipe Function
 * - Get values from add form inputs
 * - Validate both name and instructions
 * - Send POST request to /recipes
 * - Use Bearer token from sessionStorage
 * - On success: clear inputs, fetch latest recipes, refresh the list
 */
async function addRecipe() {
    try {
        const name = addRecipeNameInput.value.trim();
        const instructions = addRecipeInstructionsInput.value.trim();

        if (!name || !instructions) {
            alert("Please provide both recipe name and instructions");
            return;
        }

        const token = sessionStorage.getItem("auth-token");
        const recipeBody = { name, instructions };

        const response = await fetch(`${BASE_URL}/recipes`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(recipeBody)
        });

        if (response.ok) {
            addRecipeNameInput.value = "";
            addRecipeInstructionsInput.value = "";
            lastSearchTerm = "";
            await getRecipes();
        } else {
            alert("Failed to add recipe");
        }
    } catch (error) {
        console.error("Add recipe error:", error);
        alert("An error occurred while adding recipe");
    }
}

/**
 * TODO: Update Recipe Function
 * - Get values from update form inputs
 * - Validate both name and updated instructions
 * - Fetch current recipes to locate the recipe by name
 * - Send PUT request to update it by ID
 * - On success: clear inputs, fetch latest recipes, refresh the list
 */
async function updateRecipe() {
    try {
        const name = updateRecipeNameInput.value.trim();
        const newInstructions = updateRecipeInstructionsInput.value.trim();

        if (!name || !newInstructions) {
            alert("Please provide both recipe name and new instructions");
            return;
        }

        await ensureRecipesLoaded();

        // Find the recipe by name
        const recipe = allRecipes.find(r => r.name === name);
        if (!recipe) {
            alert("Recipe not found");
            return;
        }

        const token = sessionStorage.getItem("auth-token");
        const updateBody = { ...recipe, instructions: newInstructions };

        const response = await fetch(`${BASE_URL}/recipes/${recipe.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(updateBody)
        });

        if (response.ok) {
            updateRecipeNameInput.value = "";
            updateRecipeInstructionsInput.value = "";
            lastSearchTerm = "";
            await getRecipes();
        } else {
            alert("Failed to update recipe");
        }
    } catch (error) {
        console.error("Update recipe error:", error);
        alert("An error occurred while updating recipe");
    }
}

/**
 * TODO: Delete Recipe Function
 * - Get recipe name from delete input
 * - Find matching recipe in list to get its ID
 * - Send DELETE request using recipe ID
 * - On success: refresh the list
 */
async function deleteRecipe() {
    try {
        const name = deleteRecipeNameInput.value.trim();

        if (!name) {
            alert("Please provide recipe name");
            return;
        }

        await ensureRecipesLoaded();

        // Find the recipe by name
        const recipe = allRecipes.find(r => r.name === name);
        if (!recipe) {
            alert("Recipe not found");
            return;
        }

        const token = sessionStorage.getItem("auth-token");

        const response = await fetch(`${BASE_URL}/recipes/${recipe.id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.ok) {
            deleteRecipeNameInput.value = "";
            lastSearchTerm = "";
            await getRecipes();
        } else {
            alert("Failed to delete recipe");
        }
    } catch (error) {
        console.error("Delete recipe error:", error);
        alert("An error occurred while deleting recipe");
    }
}

/**
 * TODO: Get Recipes Function
 * - Fetch all recipes from backend
 * - Store in recipes array
 * - Call refreshRecipeList() to display
 */
async function getRecipes(silent = false) {
    try {
        const token = sessionStorage.getItem("auth-token");

        const response = await fetch(`${BASE_URL}/recipes`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.ok) {
            allRecipes = await response.json();

            if (lastSearchTerm) {
                recipes = allRecipes.filter(recipe =>
                    recipe.name && recipe.name.toLowerCase().includes(lastSearchTerm)
                );
            } else {
                recipes = [...allRecipes];
            }

            if (!silent) {
                refreshRecipeList();
            }

            return recipes;
        } else {
            if (!silent) {
                alert("Failed to fetch recipes");
            }
        }
    } catch (error) {
        console.error("Get recipes error:", error);
        if (!silent) {
            alert("An error occurred while fetching recipes");
        }
    }

    return recipes;
}

/**
 * TODO: Refresh Recipe List Function
 * - Clear current list in DOM
 * - Create <li> elements for each recipe with name + instructions
 * - Append to list container
 */
function refreshRecipeList() {
    // Clear current list in DOM
    recipeListContainer.innerHTML = "";

    // Create <li> elements for each recipe with name + instructions
    recipes.forEach(recipe => {
        const li = document.createElement("li");
        li.textContent = `${recipe.name}: ${recipe.instructions}`;
        recipeListContainer.appendChild(li);
    });
}

/**
 * TODO: Logout Function
 * - Send POST request to /logout
 * - Use Bearer token from sessionStorage
 * - On success: clear sessionStorage and redirect to login
 * - On failure: alert the user
 */
async function processLogout() {
    try {
        const token = sessionStorage.getItem("auth-token");

        const response = await fetch(`${BASE_URL}/logout`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.ok) {
            sessionStorage.clear();
            window.location.href = "../login/login-page.html";
        } else {
            alert("Failed to logout");
        }
    } catch (error) {
        console.error("Logout error:", error);
        alert("An error occurred during logout");
    }
}
