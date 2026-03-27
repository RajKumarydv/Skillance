import React, { useState } from "react";
import "./Login.scss";
import newRequest from "../../utils/newRequest";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { userState } from "../../../atoms";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const setUser = useSetRecoilState(userState); // ✅

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Sending login request...");
      const res = await newRequest.post("/auth/login", { username, password });
      console.log("Login response:", res.data);

      localStorage.setItem("currentUser", JSON.stringify(res.data));
      setUser(res.data);
      navigate("/");
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      setError(err.response?.data || "Something went wrong");
    }
  };

  return (
    <div className="login">
      <form onSubmit={handleSubmit}>
        <h1>Sign in</h1>
        <label htmlFor="">Username</label>
        <input
          name="username"
          type="text"
          placeholder="johndoe"
          onChange={(e) => setUsername(e.target.value)}
        />

        <label htmlFor="">Password</label>
        <input
          name="password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
        {error && error}
      </form>
    </div>
  );
}

export default Login;

const authLogin = async (request, response) => {
  const { username, password } = request.body;

  try {
    console.log("Login request received for username:", username);

    const user = await User.findOne({ username });
    if (!user) {
      console.error("User not found");
      throw CustomException("Check username or password!", 404);
    }

    const match = bcrypt.compareSync(password, user.password);
    if (!match) {
      console.error("Password mismatch");
      throw CustomException("Check username or password!", 404);
    }

    const { password: _, ...data } = user._doc;

    const accessToken = jwt.sign(
      {
        _id: user._id,
        isSeller: user.isSeller,
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    const refreshToken = jwt.sign(
      {
        _id: user._id,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("Tokens generated successfully");

    response.cookie("accessToken", accessToken, { ...cookieConfig, maxAge: 24 * 60 * 60 * 1000 });
    response.cookie("refreshToken", refreshToken, cookieConfig);

    console.log("Cookies set successfully");

    return response.status(202).send({
      error: false,
      message: "Success!",
      user: data,
    });
  } catch ({ message, status = 500 }) {
    console.error("Login error:", message);
    return response.status(status).send({
      error: true,
      message,
    });
  }
};
