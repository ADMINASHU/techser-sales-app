import Link from "next/link";

const PoweredLogo = () => {
  return (
    <Link
      href="https://aasoftlabs.com"
      className="flex items-center gap-2 group"
    >
      <div className="flex items-center bg-transparent">
        <span className="text-blue-700 font-bold text-base mr-1">AA</span>
        <span className="text-slate-600 font-bold text-base">SoftLabs</span>
        <span className="text-slate-400 text-xs align-super ml-0.5">™</span>
      </div>
    </Link>
  );
};

export default PoweredLogo;
