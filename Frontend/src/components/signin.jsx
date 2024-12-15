import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Client, Account } from "appwrite";

// Appwrite client and account initialization
const client = new Client().setEndpoint("https://cloud.appwrite.io/v1").setProject("675b364a00240d898950");
const account = new Account(client);

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Attempt to create a session
      const session = await account.createSession(formData.email, formData.password);
      navigate("/dashboard");
    } catch (err) {
      if (err.message.includes("Rate limit exceeded")) {
        // Implementing a simple backoff strategy: wait 1 minute before retrying
        console.log("Rate limit exceeded. Retrying in 1 minute...");
        setTimeout(async () => {
          try {
            const session = await account.createSession(formData.email, formData.password);
            navigate("/");
          } catch (err) {
            if (err.response && err.response.headers) {
              const resetTimestamp = err.response.headers["X-RateLimit-Reset"];
              const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
              const waitTime = resetTimestamp - currentTime; // Time to wait in seconds
              
              console.log(`Rate limit exceeded. Try again in ${waitTime} seconds.`);
              setTimeout(() => {
                handleSubmit(); // Retry after waiting
              }, waitTime * 1000); // Convert seconds to milliseconds
            }
            setError("Login error: " + err.message);
          }
        }, 60000); // 1 minute delay
      } else {
        setError("Login error: " + err.message);
      }
    }
  };

  return (
    <section className="px-8 py-16 bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="container mx-auto mb-12 text-center">
        <h1 className="text-4xl font-extrabold text-white">Welcome Back!</h1>
        <p className="mt-2 text-xl text-white">Please log in to your account</p>
      </div>

      <div className="flex justify-center">
        <form onSubmit={handleSubmit} className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl">
          {/* Error message */}
          {error && <p className="text-center text-red-500">{error}</p>}

          <div>
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              onChange={handleChange}
              required
              className="w-full p-4 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <input
              type="password"
              name="password"
              placeholder="Your Password"
              onChange={handleChange}
              required
              className="w-full p-4 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full p-4 text-white transition-all duration-300 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 hover:scale-105"
          >
            Sign In
          </button>

          <div className="mt-4 text-center">
            <p className="text-gray-600 ">
              Don't have an account?{" "}
              <a
                href="/signup"
                className="font-semibold text-yellow-500 hover:text-yellow-800"
              >
                Sign Up
              </a>
            </p>
          </div>
        </form>
      </div>
    </section>
  );
};

export default SignIn;
