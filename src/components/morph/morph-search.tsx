import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface MorphSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function MorphSearch({ value, onChange }: MorphSearchProps) {
  return (
    <div className="relative max-w-2xl mx-auto">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search documentation..."
        className="pl-10 h-12 bg-background/50 backdrop-blur-sm border-muted-foreground/20"
      />
    </div>
  );
}