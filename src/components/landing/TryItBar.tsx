import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const TryItBar = () => {
  return (
    <section className="bg-[var(--color-surface-1)] py-20 px-10">
      <div className="max-w-[600px] mx-auto text-center">
        <h2 className="font-heading font-bold text-[var(--color-text-primary)] mb-2" style={{ fontSize: 30 }}>
          Try it with any video
        </h2>
        <p className="font-sans font-normal text-[var(--color-text-secondary)] mb-8" style={{ fontSize: 15 }}>
          No account needed for demo runs.
        </p>
        <div className="flex items-center gap-3">
          <Input
            placeholder="youtube.com/watch?v=..."
            className="h-[52px] text-base flex-1"
          />
          <Button variant="default" className="h-[52px] px-7 flex-shrink-0">
            Analyze →
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TryItBar;
