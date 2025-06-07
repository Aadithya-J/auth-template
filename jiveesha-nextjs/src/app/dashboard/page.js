export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="flex justify-center items-center mb-6">
          <div className="w-16 h-14 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-2xl">D</span>
          </div>
          <h1 className="text-4xl font-bold ml-3 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
        </div>
        <h2 className="text-2xl font-bold text-green-600 mb-4">Welcome to Daira!</h2>
        <p className="text-gray-600 text-lg">
          🎉 Login successful! You are now logged in.
        </p>
        <p className="text-gray-500 mt-2">
          This is where your child&apos;s learning dashboard will be.
        </p>
      </div>
    </div>
  );
}
