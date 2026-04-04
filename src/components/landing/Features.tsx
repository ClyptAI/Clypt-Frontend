import { GitBranch, UserCheck, Scissors } from "lucide-react";

const columns = [
  {
    icon: GitBranch,
    heading: "Graph-first understanding",
    body: "Every video becomes a navigable semantic graph. Explore narrative structure, rhetorical relationships, and clip candidates in one surface.",
  },
  {
    icon: UserCheck,
    heading: "Human-directed grounding",
    body: "AI proposes. You decide. Assign speakers to tracklets, set camera intent, and override any automated framing with a manual crop.",
  },
  {
    icon: Scissors,
    heading: "Precise 9:16 rendering",
    body: "Follow, reaction, split, wide, or manual crop — every shot gets an explicit layout instruction before the renderer touches it.",
  },
];

const Features = () => {
  return (
    <section className="py-20 px-10">
      <div className="max-w-[1100px] mx-auto grid grid-cols-3 gap-8">
        {columns.map((col) => (
          <div key={col.heading}>
            <col.icon size={24} color="var(--color-violet)" />
            <h3 className="font-heading font-semibold text-[var(--color-text-primary)] mt-4" style={{ fontSize: 20 }}>
              {col.heading}
            </h3>
            <p className="font-sans font-normal text-[var(--color-text-secondary)] mt-2 leading-relaxed" style={{ fontSize: 15 }}>
              {col.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
