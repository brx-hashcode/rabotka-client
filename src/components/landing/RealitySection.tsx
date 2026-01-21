import streetWorkersImage from "@/assets/street-workers.jpg";

const RealitySection = () => {
  const workers = [
    "Domestic workers",
    "Hairdressers",
    "Tutors",
    "Mechanics",
    "Freelancers",
  ];

  return (
    <section className="py-20 lg:py-32 bg-secondary/30">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <div className="relative rounded-3xl overflow-hidden shadow-medium order-2 lg:order-1">
            <img
              src={streetWorkersImage}
              alt="Busy African street scene with informal workers"
              className="w-full h-auto object-cover aspect-[16/10]"
            />
          </div>

          {/* Content */}
          <div className="space-y-6 order-1 lg:order-2">
            <span className="inline-block px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium">
              The Challenge
            </span>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight text-balance">
              Informal work is everywhere — but opportunities are hard to find
            </h2>
            
            <p className="text-lg text-muted-foreground">
              In African cities, millions work informally:
            </p>

            <ul className="grid grid-cols-2 gap-3">
              {workers.map((worker) => (
                <li
                  key={worker}
                  className="flex items-center gap-2 text-foreground"
                >
                  <span className="w-2 h-2 rounded-full bg-whatsapp" />
                  {worker}
                </li>
              ))}
            </ul>

            <p className="text-lg text-muted-foreground pt-4">
              Yet finding work still depends on word of mouth, uncertainty, and trust issues.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RealitySection;
