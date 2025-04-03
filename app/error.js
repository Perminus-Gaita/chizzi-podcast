'use client'

export default function Error({ error, reset }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f7f7] dark:bg-dark px-4">
      <div className="max-w-md w-full space-y-4 text-center">
        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
          Something went wrong!
        </h2>
        <div className="space-y-2">
          <button
            onClick={reset}
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 w-full justify-center"
          >
            Try again.
          </button>
          <button
            onClick={() => window.location.href = '/lobby'}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-base font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 w-full justify-center"
          >
            Go to Lobby
          </button>
        </div>
      </div>
    </div>
  );
}