import RegisterForm from "./RegisterForm";

export default function RegisterPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-16"
      style={{
        paddingTop: "calc(var(--header-height-desktop) + 3rem)",
        backgroundColor: "var(--color-muted)",
      }}
    >
      <RegisterForm />
    </div>
  );
}
