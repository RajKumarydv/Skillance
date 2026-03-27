import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosFetch } from "../../../utils";
import { useRecoilState } from "recoil";
import { userState } from "../../../atoms";
import "./Login.scss";

const initialState = {
  username: "",
  password: "",
};

const Login = () => {
  const [formInput, setFormInput] = useState(initialState);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useRecoilState(userState);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Handling form input changes
  const handleFormInput = (e) => {
    const { name, value } = e.target;
    setFormInput((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    // Validate inputs
    for (let key in formInput) {
      if (formInput[key] === "") {
        toast.error("Please fill all input fields: " + key);
        return;
      }
    }

    setLoading(true);
    try {
      const { data } = await axiosFetch.post("/auth/login", formInput);
      localStorage.setItem("token", data.token); // Token ko store karo
      localStorage.setItem("user", JSON.stringify(data.user)); // User ko store karo

      setUser(data.user); // User ko state me set karo
      toast.success("Welcome back!", {
        duration: 3000,
        icon: "😃",
      });
      navigate("/"); // Redirect to home page
    } catch ({ response: { data } }) {
      setError(data.message);
      toast.error(data.message, {
        duration: 3000,
      });
    } finally {
      setLoading(false);
      setError(null);
    }
  };

  return (
    <div className="login">
      <form action="" onSubmit={handleFormSubmit}>
        <h1>Sign in</h1>
        <label htmlFor="">Username</label>
        <input
          name="username"
          placeholder="johndoe"
          value={formInput.username} // Added value prop for two-way binding
          onChange={handleFormInput} // Updated onChange to handle input change
        />
        <label htmlFor="">Password</label>
        <input
          name="password"
          type="password"
          placeholder="password"
          value={formInput.password} // Added value prop for two-way binding
          onChange={handleFormInput} // Updated onChange to handle input change
        />
        <button disabled={loading} type="submit">
          {loading ? "Loading" : "Login"}
        </button>
        {error && <span>{error}</span>} {/* Display error message */}
      </form>
    </div>
  );
};

export default Login;
