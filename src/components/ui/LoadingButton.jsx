
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function LoadingButton({ loading, children, disabled, className, ...props }) {
    return (
        <Button disabled={loading || disabled} className={className} {...props}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </Button>
    );
}
