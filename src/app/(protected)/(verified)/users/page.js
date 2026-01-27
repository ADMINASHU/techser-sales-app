import { auth } from "@/auth";
import { getUsers } from "@/app/actions/adminActions";
import { getLocations } from "@/app/actions/settingsActions";
import AdminUserList from "@/components/AdminUserList";

export const metadata = {
  title: "Users",
};

export default async function UsersPage(props) {
  const session = await auth();
  const searchParams = await props.searchParams;

  const page = Number(searchParams?.page) || 1;
  const search = searchParams?.search || "";
  // Fix: Default to user's region if no param is present (Initial Load)
  const region =
    searchParams?.region === undefined
      ? session?.user?.region || ""
      : searchParams.region;
  const branch = searchParams?.branch || "";

  const [data, locations] = await Promise.all([
    getUsers({ page, search, region, branch }),
    getLocations(),
  ]);

  if (data.error) {
    return (
      <div className="p-8 text-red-500">Error loading users: {data.error}</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="hidden sm:flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
          User Management
        </h1>
      </div>
      <AdminUserList
        initialData={data}
        locations={locations}
        currentUserRegion={session?.user?.region}
        session={session}
      />
    </div>
  );
}
