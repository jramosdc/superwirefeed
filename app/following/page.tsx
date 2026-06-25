import { FollowingTimeline } from "@/components/following-timeline";

export const metadata = { title: "Following — SuperWire" };

export default function FollowingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">From sources you follow</h1>
      <FollowingTimeline />
    </div>
  );
}
