export default function AuthLayout({ children }) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-900">
            {children}
        </div>
    );
}
