# subscription-api

NWO.ai assessment

Installation:

1. Clone the repository (git clone https://github.com/emmagawd/subscription-api.git)
2. Navigate to project directory (cd subscription-api)
3. Install the necessary packages (npm install)

Environment Setup:

1. Copy the ‘.env.example’ file to ‘.env’ (cp .env.example .env)
2. Open the `.env` file and replace the placeholder with your actual PostgreSQL database credentials.

Create Database Schema:

1. Log in to your PostgreSQL command line tool (psql –U your_username –d your_database)
2. Execute the following SQL commands:

```sql
CREATE TABLE subscriptions (
	id SERIAL PRIMARY KEY,
	user_id INT NOT NULL,
	industry VARCHAR(255),
	source VARCHAR(255),
	subcategory VARCHAR(255),
	active BOOLEAN DEFAULT true,
	CONSTRAINT fk_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);
CREATE TABLE users (
	id SERIAL PRIMARY KEY,
	email VARCHAR(255) UNIQUE NOT NULL
);
INSERT INTO users (email) VALUES ('user1@testEmail.com');
```

Running the program:

1. Start the PostgreSQL server (ensure it's configured as per the `.env` settings).
2. Test to see if database is properly connected using ‘node dbTest.js’. If you aren't getting 'Connection Test Successful', verify that your PostgreSQL service is running and that `.env` contains the correct credentials.
3. Launch the application (npm start)
4. The server should now be running on http://localhost:3000

### Database Relationships

The `subscriptions` table contains a foreign key that links each subscription to a user in the `users` table. This foreign key ensures that:

- Each subscription is associated with an existing user.
- Deleting a user from the `users` table will automatically remove all their subscriptions (due to the `ON DELETE CASCADE` rule).
  It is crucial to maintain these relationships to ensure data integrity and correct application behavior.
