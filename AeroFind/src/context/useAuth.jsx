import { useContext } from "react";
import AuthContext from "./AuthContext";

// convenience hook
export default function useAuth() {
  return useContext(AuthContext);
}
