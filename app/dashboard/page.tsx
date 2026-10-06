import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";

export default async function Dashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Belt-and-braces: the middleware already redirects signed-out visitors,
  // but the server component guards itself too.
  if (!user) redirect("/");

  // RLS in action: this query can only return the current user's own row —
  // the "Users can read their own profile" policy enforces it in Postgres.
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, display_name, created_at")
    .eq("id", user.id)
    .single();

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
        <LogoutButton />
      </div>
      <p className="mt-2 text-slate-600">
        This route is protected by <code className="rounded bg-slate-200 px-1.5 py-0.5 text-sm">middleware.ts</code> —
        signed-out visitors are redirected to the login page.
      </p>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold">Your session</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">User ID</dt>
            <dd className="truncate font-mono">{user.id}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Email</dt>
            <dd className="font-medium">{user.email}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Provider</dt>
            <dd className="font-medium">
              {user.app_metadata?.provider ?? "email"}
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold">Your profile row (RLS-protected)</h2>
        {profile ? (
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Display name</dt>
              <dd className="font-medium">
                {profile.display_name ?? "— (edit it in the database)"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Created at</dt>
              <dd className="font-medium">
                {new Date(profile.created_at).toLocaleString()}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            No profile row found — did you run{" "}
            <code className="rounded bg-slate-200 px-1.5 py-0.5 text-sm">supabase/schema.sql</code>?
          </p>
        )}
        <p className="mt-4 text-xs text-slate-400">
          Try querying <code className="rounded bg-slate-100 px-1">profiles</code> for another
          user's id in the SQL editor: RLS will return zero rows.
        </p>
      </div>
    </main>
  );
}
