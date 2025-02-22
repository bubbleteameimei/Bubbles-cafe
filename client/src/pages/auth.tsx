import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

export default function AuthPage() {
  // Redirect to home page since we removed authentication
  return <Redirect to="/" />;
}