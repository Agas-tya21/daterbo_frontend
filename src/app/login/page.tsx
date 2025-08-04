import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-100 px-4 dark:bg-gray-950">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
            Selamat Datang Kembali
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Masuk ke akun Anda untuk melanjutkan.
          </p>
        </div>
        <form className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Alamat Email
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-50 dark:placeholder-gray-500"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Kata Sandi
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-50 dark:placeholder-gray-500"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-900 dark:text-gray-50"
              >
                Ingat saya
              </label>
            </div>
            <div className="text-sm">
              <Link
                href="#"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Lupa kata sandi Anda?
              </Link>
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Masuk
            </button>
          </div>
        </form>
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          Belum punya akun?{" "}
          <Link
            href="#"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Daftar
          </Link>
        </div>
      </div>
    </div>
  );
}