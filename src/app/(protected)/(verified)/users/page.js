import { getUsers } from "@/app/actions/adminActions";
import { getLocations } from "@/app/actions/settingsActions";
import AdminUserList from "@/components/AdminUserList";

export const dynamic = 'force-dynamic';

export default async function UsersPage(props) {
    const searchParams = await props.searchParams;

    const page = Number(searchParams?.page) || 1;
    const search = searchParams?.search || "";
    const region = searchParams?.region || "";
    const branch = searchParams?.branch || "";

    const data = await getUsers({ page, search, region, branch });
    const locations = await getLocations();

    if (data.error) {
        return <div className="p-8 text-red-500">Error loading users: {data.error}</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">User Management</h1>
            </div>
            <AdminUserList initialData={data} locations={locations} />
        </div>
    );
}
