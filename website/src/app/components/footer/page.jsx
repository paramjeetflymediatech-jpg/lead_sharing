export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white dark:bg-black">
      <div className="mx-auto max-w-7xl px-6 py-6 text-sm text-zinc-500">
        © {new Date().getFullYear()} Lead Sharing. All rights reserved.
      </div>
    </footer>
  );
}
