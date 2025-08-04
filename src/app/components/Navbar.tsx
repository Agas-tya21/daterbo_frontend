import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white text-lg font-bold">
          <Link href="/">Daterbo</Link>
        </div>
        <div className="space-x-4">
          <Link href="/" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
            Home
          </Link>
          <Link href="/customer-management" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
            Costumer Management
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;