import Experience from "@/components/Experience";
import { loadContent } from "@/lib/content";

export default function Page() {
  const content = loadContent();
  return <Experience content={content} />;
}
