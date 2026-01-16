export default function Header() {
  return (
    <header className="w-full border-b border-zinc-200 bg-white dark:bg-black">
      <div className="mx-auto max-w-7xl px-6 py-4 flex justify-between items-center">
        <h1 className="text-lg font-bold">Lead Sharing</h1>

        <nav className="space-x-6 text-sm font-medium">
          <a href="/auth/login">Login</a>
          <a href="/auth/register">Register</a>
        </nav>
      </div>
    </header>
  );
}
