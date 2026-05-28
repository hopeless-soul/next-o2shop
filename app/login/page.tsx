import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-16"
      style={{
        paddingTop: "calc(var(--header-height-desktop) + 3rem)",
        backgroundColor: "var(--color-muted)",
      }}
    >
      <LoginForm />
    </div>
  );
}
