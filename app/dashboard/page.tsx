import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] py-8 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400">Manage your account and credits</p>
        </div>

        {/* Credits Card */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 md:col-span-2 rounded-2xl border border-[#2a2a3e] bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Credits Balance</h2>
              <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-sm text-indigo-400">Free Tier</span>
            </div>
            <div className="mb-4">
              <span className="text-5xl font-bold text-white">10</span>
              <span className="ml-2 text-gray-400">credits available</span>
            </div>
              <div className="h-2 rounded-full bg-[#2a2a3e] overflow-hidden">
              <div className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: "10%" }}></div>
            </div>
            <p className="mt-2 text-sm text-gray-500">10 more credits every month</p>
            <Link
              href="/pricing"
              className="mt-4 inline-block rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-2 font-semibold text-white hover:opacity-90"
            >
              Upgrade Plan
            </Link>
          </div>

          <div className="rounded-2xl border border-[#2a2a3e] bg-[#12121c] p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Quick Stats</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Images Created</p>
                <p className="text-2xl font-bold text-white">0</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="text-lg font-semibold text-white">Today</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Generations */}
        <div className="rounded-2xl border border-[#2a2a3e] bg-[#12121c] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Recent Generations</h2>
            <Link href="/generate" className="text-indigo-400 hover:text-indigo-300 text-sm">
              Create New →
            </Link>
          </div>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 text-5xl opacity-30">🎨</div>
            <p className="text-gray-500">No images yet. Start creating!</p>
            <Link
              href="/generate"
              className="mt-4 rounded-lg bg-[#2a2a3e] px-6 py-2 font-semibold text-white hover:bg-[#3a3a4e]"
            >
              Create Your First Image
            </Link>
          </div>
        </div>

        {/* Account */}
        <div className="mt-6 rounded-2xl border border-[#2a2a3e] bg-[#12121c] p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Account</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-[#2a2a3e]">
              <span className="text-gray-400">Email</span>
              <span className="text-white">user@example.com</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-400">Plan</span>
              <span className="text-white">Free (10 credits/month)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
