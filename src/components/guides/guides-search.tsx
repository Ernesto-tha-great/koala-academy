import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface GuideSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function GuideSearch({ value, onChange }: GuideSearchProps) {
  return (
    <div className="relative max-w-2xl mx-auto">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search guides and tutorials..."
        className="pl-10 h-12 bg-background/50 backdrop-blur-sm border-muted-foreground/20"
      />
    </div>
  );
}