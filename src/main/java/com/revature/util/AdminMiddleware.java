package com.revature.util;

import com.revature.model.Chef;
import com.revature.service.AuthenticationService;

import io.javalin.http.Context;
import io.javalin.http.Handler;
import io.javalin.http.UnauthorizedResponse;
/**
 * The AdminMiddleware class is responsible for enforcing access control 
 * within the application by protecting specific routes from non-admin users. 
 * 
 * This class utilizes a list of protected methods to determine which HTTP 
 * methods require admin access and leverages the ChefService to validate 
 * user permissions. The middleware intercepts requests and ensures that 
 * only users with admin privileges can access protected resources.
 */

public class AdminMiddleware implements Handler {

    /**
     * An array of protected HTTP methods that require admin access.
     */

    private String[] protectedMethods;
    

    /**
     * Constructs an AdminMiddleware instance with the specified AuthenticationService and an array of protected methods.
     *
	 * (FOR REFERENCE) This method is part of the backend logic.
     * No modifications or implementations are required.
     */

    public AdminMiddleware(String... protectedMethods) {
        this.protectedMethods = protectedMethods;
    }

    /**
     * Handles the HTTP request, checking for admin access based on the HTTP method being used and the current logged in user's authentication token.
     *
	 * (FOR REFERENCE) This method is part of the backend logic.
     * No modifications or implementations are required.
     */
    @Override
    public void handle(Context ctx) {
        String httpMethod = ctx.req().getMethod();
        if (isProtectedMethod(httpMethod)) {
            String token = extractToken(ctx);
            Chef chef = AuthenticationService.loggedInUsers.get(token);
            if (chef == null || !chef.isAdmin()) {
                throw new UnauthorizedResponse("Access denied");
            }
        }
    }

    /**
     * Extracts the bearer token from the Authorization header on the context.
     *
     * @param ctx the current request context
     * @return the parsed token value
     */
    private String extractToken(Context ctx) {
        String header = ctx.header("Authorization");
        if (header == null || header.isBlank()) {
            throw new UnauthorizedResponse("Access denied");
        }

        String[] parts = header.trim().split("\\s+");
        if (parts.length == 1) {
            return parts[0];
        } else if (parts.length >= 2) {
            return parts[1];
        }

        throw new UnauthorizedResponse("Access denied");
    }

    /**
     * Checks if the specified HTTP method is among the protected methods.
     *
	 * (FOR REFERENCE) This method is part of the backend logic.
     * No modifications or implementations are required.
     */
    private boolean isProtectedMethod(String method) {
        for (String protectedMethod : protectedMethods) {
            if (protectedMethod.equalsIgnoreCase(method)) {
                return true;
            }
            if ("CREATE".equalsIgnoreCase(protectedMethod) && "POST".equalsIgnoreCase(method)) {
                return true;
            }
            if ("UPDATE".equalsIgnoreCase(protectedMethod) && "PUT".equalsIgnoreCase(method)) {
                return true;
            }
        }
        return false;
    }
}

