export default async () => {
    try {
      // Create a payload matching your backend's expected fields:
      //   - username
      //   - password
      //   - primary_contact_email (mapped from our "email" field)
      const payload = {
        username: username.value,
        password: password.value,
        primary_contact_email: email.value,
      };

      const response = await fetch('http://localhost:8080/create-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.text();

      if (!response.ok) throw new Error(result);

      // On success, navigate to the home page.
      router.push('/');
    } catch (err) {
        console.error(err.message);
      if (err.message.includes('UNIQUE constraint failed: users.username')) {
        return { username: 'Sorry, that username is taken. Please try again.' };
      } else {
        return { message: 'Registration failed. Please try again.' };
      }
    }
  };