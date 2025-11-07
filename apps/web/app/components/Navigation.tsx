import Link from 'next/link';

export function Navigation() {
  return (
    <nav className="bg-black border-b border-gray-700 sticky top-0 z-[100]">
      <div className="max-w-[1200px] mx-auto px-8 py-4 flex items-center justify-between md:px-4">
        <Link href="/" className="text-xl font-semibold text-white no-underline transition-colors hover:text-blue-500">
          TisOps Hub
        </Link>
        <ul className="flex gap-8 list-none m-0 p-0 md:gap-4">
          <li>
            <Link href="/" className="text-gray-400 no-underline text-[0.95rem] transition-colors hover:text-white md:text-sm">
              Home
            </Link>
          </li>
          <li>
            <Link href="/tasks" className="text-gray-400 no-underline text-[0.95rem] transition-colors hover:text-white md:text-sm">
              Tasks
            </Link>
          </li>
          <li>
            <Link href="/imports" className="text-gray-400 no-underline text-[0.95rem] transition-colors hover:text-white md:text-sm">
              File Imports
            </Link>
          </li>
          <li>
            <Link href="/reports" className="text-gray-400 no-underline text-[0.95rem] transition-colors hover:text-white md:text-sm">
              Reports
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
