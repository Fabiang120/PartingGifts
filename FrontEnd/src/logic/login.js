export default async (e, router) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.value, password: password.value }),
      });

      if (!response.ok) {
        return "You entered the wrong username and password";
      }

      const data = await response.json();
      console.log("Login response:", data);

      if (data.error) {
        throw data.error;
      }

      // Store the username in sessionStorage.
      if (typeof window !== "undefined") {
        sessionStorage.setItem("username", username.value);
      }

      // Redirect based on the forceChange flag.
      if (data.forceChange) {
        router.push("/forcechange");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      return "There was a connection error!";
    }
  };