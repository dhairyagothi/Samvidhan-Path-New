import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Client, Account } from "appwrite";

// Appwrite client and account initialization
const client = new Client().setProject("675b364a00240d898950");
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
      // Attempt to create an email session
      await account.createEmailSession(formData.email, formData.password);

      // Fetch account details to check if the email is verified
      const user = await account.get();

      if (!user.emailVerification) {
        setError("Please verify your email to log in.");
        await account.createEmailVerification(); // Send email verification again
      } else {
        navigate("/dashboard"); // Redirect to dashboard after successful login
      }
    } catch (err) {
      setError("Invalid email or password."); // Handle login errors
    }
  };

  return (
    <section className="px-8 py-16 bg-gray-50">
      <div className="container mx-auto mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-800">Welcome Back!</h1>
      </div>
      <div className="flex justify-center">
        <form onSubmit={handleSubmit} className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
          {error && <p className="mb-4 text-red-500">{error}</p>}
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            onChange={handleChange}
            required
            className="w-full p-3 mb-4 border"
          />
          <input
            type="password"
            name="password"
            placeholder="Your Password"
            onChange={handleChange}
            required
            className="w-full p-3 mb-6 border"
          />
          <button type="submit" className="w-full p-3 text-white bg-yellow-500 rounded-md">
            Sign In
          </button>
        </form>
      </div>
    </section>
  );
};

export default SignIn;
