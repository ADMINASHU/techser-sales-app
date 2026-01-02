import fs from "fs";
import path from "path";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Tag, Calendar, ChevronDown } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { auth } from "@/auth";

export const metadata = {
  title: "Release Notes | Techser Sales App",
  description: "Recent updates and improvements.",
};

function parseChangelog(markdown) {
  const versions = [];
  const lines = markdown.split("\n");
  let currentVersion = null;
  let currentType = null;

  const versionRegex = /^###? \[?(\d+\.\d+\.\d+)\]?.*?\((\d{4}-\d{2}-\d{2})\)/;
  const typeRegex = /^### (.*)/;
  const itemRegex = /^[\*\-] (.*)/;

  lines.forEach(line => {
    // 1. Detect Version
    const versionMatch = line.match(versionRegex);
    if (versionMatch) {
      if (currentVersion) versions.push(currentVersion);
      currentVersion = {
        version: versionMatch[1],
        date: versionMatch[2],
        features: [],
        fixes: [],
        breaking: [],
        others: []
      };
      currentType = null;
      return;
    }

    if (!currentVersion) return;

    // 2. Detect Type (Features, Bug Fixes)
    const typeMatch = line.match(typeRegex);
    if (typeMatch) {
        const type = typeMatch[1].toLowerCase();
        if (type.includes("features")) currentType = "features";
        else if (type.includes("bug")) currentType = "fixes";
        else if (type.includes("breaking")) currentType = "breaking";
        else currentType = "others";
        return;
    }

    // 3. Detect List Items
    const itemMatch = line.match(itemRegex);
    if (itemMatch && currentType) {
        // Remove hash links
        let cleanText = itemMatch[1].replace(/\s*\(\[[0-9a-f]+\]\(.*?\)\)/g, ""); 
        // Remove trailing parens if any
        cleanText = cleanText.replace(/\s*\([a-f0-9]+\)$/, "");
        
        currentVersion[currentType].push(cleanText);
    }
  });

  if (currentVersion) versions.push(currentVersion);
  return versions;
}

export default async function ReleasesPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";
  let releaseData = [];
  
  try {
    const changelogPath = path.join(process.cwd(), "CHANGELOG.md");
    if (fs.existsSync(changelogPath)) {
      const rawContent = fs.readFileSync(changelogPath, "utf-8");
      releaseData = parseChangelog(rawContent);
    }
  } catch (error) {
    console.error("Failed to read CHANGELOG.md", error);
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-200 p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
            <Link href="/dashboard">
                <Button variant="ghost" className="text-gray-400 hover:text-white pl-0 mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Button>
            </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-linear-to-r from-blue-400 to-violet-500 bg-clip-text text-transparent">
                Release Notes
              </h1>
              <p className="text-gray-500 mt-2">
                History of improvements, fixes, and updates.
              </p>
            </div>
            {isAdmin && (
                <Link href="/features">
                  <Button className="glass-btn-primary rounded-full px-6">
                    View All Features
                  </Button>
                </Link>
            )}
          </div>
        </div>

        <div className="space-y-8">
            {releaseData.length === 0 && (
                <div className="p-8 text-center text-gray-500 glass-panel rounded-xl">No release notes available.</div>
            )}

            {releaseData.map((release, idx) => {
                const improvements = release.features;
                const fixes = release.fixes;
                const patches = [...release.breaking, ...release.others];

                return (
                    <div key={idx} className="glass-panel rounded-xl border border-white/5 overflow-hidden">
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 bg-white/2">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-xl font-bold text-white">v{release.version}</h2>
                                    {idx === 0 && <span className="bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-500/20 uppercase tracking-wide">Latest</span>}
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                    <Calendar className="w-4 h-4 mr-2 opacity-50" />
                                    {release.date}
                                </div>
                            </div>
                        </div>

                        {/* Accordion Content */}
                        <div className="p-2">
                            <Accordion type="multiple" className="w-full">
                                {/* Improvements (Features) */}
                                <AccordionItem value="improvements" className="border-b-0">
                                    <AccordionTrigger className="px-4 py-3 hover:bg-white/5 rounded-lg hover:no-underline data-[state=open]:bg-white/5">
                                        <div className="flex items-center justify-between flex-1 mr-4">
                                            <span className="text-gray-300 font-medium">Improvements</span>
                                            <span className="text-gray-500 text-sm">({improvements.length})</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pb-4 pt-2">
                                        {improvements.length > 0 ? (
                                            <ul className="space-y-3">
                                                {improvements.map((item, i) => (
                                                    <li key={i} className="text-gray-400 text-sm leading-relaxed pl-4 relative before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-blue-400 before:rounded-full">
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-gray-600 text-sm italic">No new improvements in this release.</p>
                                        )}
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Fixes */}
                                <AccordionItem value="fixes" className="border-b-0">
                                    <AccordionTrigger className="px-4 py-3 hover:bg-white/5 rounded-lg hover:no-underline data-[state=open]:bg-white/5">
                                        <div className="flex items-center justify-between flex-1 mr-4">
                                            <span className="text-gray-300 font-medium">Fixes</span>
                                            <span className="text-gray-500 text-sm">({fixes.length})</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pb-4 pt-2">
                                        {fixes.length > 0 ? (
                                            <ul className="space-y-3">
                                                {fixes.map((item, i) => (
                                                    <li key={i} className="text-gray-400 text-sm leading-relaxed pl-4 relative before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-rose-400 before:rounded-full">
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-gray-600 text-sm italic">No bug fixes in this release.</p>
                                        )}
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Patches (Breaking + Others) */}
                                <AccordionItem value="patches" className="border-b-0">
                                    <AccordionTrigger className="px-4 py-3 hover:bg-white/5 rounded-lg hover:no-underline data-[state=open]:bg-white/5">
                                        <div className="flex items-center justify-between flex-1 mr-4">
                                            <span className="text-gray-300 font-medium">Patches</span>
                                            <span className="text-gray-500 text-sm">({patches.length})</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pb-4 pt-2">
                                        {patches.length > 0 ? (
                                            <ul className="space-y-3">
                                                {patches.map((item, i) => (
                                                    <li key={i} className="text-gray-400 text-sm leading-relaxed pl-4 relative before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-amber-500 before:rounded-full">
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-gray-600 text-sm italic">No patches in this release.</p>
                                        )}
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
}
