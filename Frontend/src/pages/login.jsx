import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Login.module.css";
import { backendURL } from "../definedURL";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (email?.length === 0 || password?.length === 0) {
      alert("Please enter email and password");
      return;
    }

    try {
      const response = await fetch(`${backendURL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        
        localStorage.setItem("access_token", data.session.access_token);
        localStorage.setItem("refresh_token", data.session.refresh_token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        const defaultHeaders = {
          Authorization: `Bearer ${data.session.access_token}`,
          "Content-Type": "application/json",
        };
        
        onLogin(defaultHeaders);
        navigate("/");
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.log(error)
      alert("An error occurred while logging in. Please try again.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <h1>Login</h1>
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin}>Login</button>
        </div>
      </div>
    </div>
  );
};

export default Login;