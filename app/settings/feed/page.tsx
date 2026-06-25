import { RequireAuth } from "@/components/require-auth";
import { SettingsForm } from "@/components/settings-form";

export const metadata = { title: "Edit feed — SuperWire" };

export default function FeedSettingsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Edit your feed & profile</h1>
      <RequireAuth>
        <SettingsForm />
      </RequireAuth>
    </div>
  );
}
