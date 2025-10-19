export default function Home() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Car Purchase Platform</h1>
      <p className="text-sm text-gray-700">Choose a portal from the nav to begin.</p>
      <ul className="list-disc pl-5 text-sm text-gray-700">
        <li>Customer → Onboarding → Recommendations → Updates</li>
        <li>Dealership → Dashboard → Customer detail → Send Offer</li>
      </ul>
    </div>
  );
}
