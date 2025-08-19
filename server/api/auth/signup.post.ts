import * as argon2 from "@node-rs/argon2";
import { users } from "../../db/auth-schema.js";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event); // Retrieve request body
    if (!body) {
      return { error: "Request body is empty or undefined" };
    }

    const { email, name, password } = body;

    if (!name || !password) {
      return { error: "Username and password are required" };
    }

    const db = useDB(); // Initialize database connection
    const hashedPassword = await argon2.hash(password); // Hash password

    try {
      // Insert user data into database
      const user = await db.insert(users).values({
        username: name,
        email: email,
        hashedPassword: hashedPassword
      }).returning();

      const userData = { username: user.username };
      await setUserSession(event, {
        user: userData,
        loggedInAt: new Date(),
      });
      return { success: true, user };
    } catch (error) {
      console.error("Error creating user:", error);
      return createError({
        statusCode: 409,
        statusMessage: "Username already exists",
      });
    }
  } catch (error) {
    console.error("Error handling signup request:", error);
    return createError({
      statusCode: 400,
      statusMessage: "Failed to process request",
    });
  }
});
