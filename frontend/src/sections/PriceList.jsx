import { useState } from "react";

const CheckItem = ({ text, light = false }) => (
  <div className="flex items-start gap-3">
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green text-white text-xs">✓</span>
    <span className={light ? "text-white/80" : "text-dark-green-half"}>{text}</span>
  </div>
);

const MembershipCard = ({ title, price, period = "/month", features, highlighted = false, badge }) => (
  <div
    className={
      "relative rounded-[28px] p-6 sm:p-8 shadow-xl transition-all duration-300 " +
      (highlighted
        ? "bg-dark-green text-white scale-[1.02] shadow-2xl ring-1 ring-green/30"
        : "bg-white text-dark-green")
    }
  >
    {badge && (
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-green text-white text-xs font-semibold shadow-md">
        {badge}
      </div>
    )}

    <div className="text-2xl sm:text-3xl font-semibold tracking-tight">
      Ft {price.toLocaleString("hu-HU")}<span className={highlighted ? "text-white/60 text-base" : "text-dark-green-half text-base"}>{period}</span>
    </div>

    <div className="mt-3 text-xl sm:text-2xl font-semibold">{title}</div>
    <div className={"mt-2 text-sm sm:text-base " + (highlighted ? "text-white/70" : "text-dark-green-half")}>
      For everyday players who enjoy maximum flexibility.
    </div>

    <div className="mt-6 flex flex-col gap-3">
      {features.map((f, i) => (
        <CheckItem key={i} text={f} light={highlighted} />
      ))}
    </div>

    <button
      className={
        "mt-8 w-full h-[50px] sm:h-[56px] rounded-full font-semibold transition-all duration-200 cursor-pointer " +
        (highlighted
          ? "bg-green text-dark-green hover:scale-105 shadow-lg"
          : "bg-green/20 text-green hover:bg-green hover:text-white")
      }
    >
      {highlighted ? "Choose plan" : "Choose"}
    </button>
  </div>
);

const SeasonTable = ({ title, data }) => (
  <div className="bg-white rounded-[28px] p-6 sm:p-8 shadow-xl">
    <div className="flex items-center justify-between mb-6">
      <div className="text-xl sm:text-2xl font-semibold text-dark-green">Service</div>
      <div className="text-xl sm:text-2xl font-semibold text-dark-green">Price</div>
    </div>

    <div className="mt-2">
      <div className="text-dark-green font-semibold mb-2 border-b pb-2">Outside</div>
      <div className="flex flex-col gap-3">
        {data.outside.map((row, i) => (
          <div key={i} className="flex items-center justify-between text-dark-green-half">
            <div>{row.label}</div>
            <div>Ft {row.price?.toLocaleString("hu-HU") ?? "–"}</div>
          </div>
        ))}
      </div>
    </div>

    <div className="mt-6">
      <div className="text-dark-green font-semibold mb-2 border-b pb-2">Inside</div>
      <div className="flex flex-col gap-3">
        {data.inside.map((row, i) => (
          <div key={i} className="flex items-center justify-between text-dark-green-half">
            <div>{row.label}</div>
            <div>Ft {row.price?.toLocaleString("hu-HU") ?? "–"}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default function PriceList() {
  const [tab, setTab] = useState("membership");

  const membership = [
    {
      title: "Student",
      price: 20000,
      features: [
        "Student discount rate",
        "Unlimited booking",
        "Priority court booking",
        "Full access to events",
        "Free gear rental",
      ],
    },
    {
      title: "Casual",
      price: 38000,
      highlighted: true,
      badge: "MOST POPULAR",
      features: [
        "Best overall value",
        "Unlimited booking",
        "Priority court booking",
        "Full access to events",
        "Free gear rental",
      ],
    },
    {
      title: "Morning",
      price: 28000,
      features: [
        "Access until 12:00 PM",
        "Unlimited booking",
        "Priority court booking",
        "Full access to events",
        "Free gear rental",
      ],
    },
  ];

  const summer = {
    outside: [
      { label: "1 hour casual", price: 4000 },
      { label: "1 hour student", price: 3600 },
      { label: "1 hour casual morning", price: 3200 },
      { label: "1 hour student morning", price: 2800 },
    ],
    inside: [
      { label: "1 hour casual", price: 9000 },
      { label: "1 hour student", price: 8600 },
      { label: "1 hour casual morning", price: 8200 },
      { label: "1 hour casual student", price: 7800 },
    ],
  };

  const winter = {
    outside: [
      { label: "1 hour casual" },
      { label: "1 hour student" },
      { label: "1 hour casual morning" },
      { label: "1 hour student morning" },
    ],
    inside: [
      { label: "1 hour casual", price: 7000 },
      { label: "1 hour student", price: 6600 },
      { label: "1 hour casual morning", price: 6200 },
      { label: "1 hour casual student", price: 5800 },
    ],
  };

  return (
    <section className="relative py-16 sm:py-24">
      {/* háttér átmenet */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-[#e9f6ea] to-[#cfeccc] -z-10" />

      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col items-center gap-3">
          <h2 className="text-3xl sm:text-5xl font-semibold text-dark-green text-center">Simple, transparent pricing</h2>
          <p className="text-dark-green-half text-center">No contracts. No surprise fees.</p>

          {/* Tabs */}
          <div className="mt-4 inline-flex items-center p-1 bg-white rounded-full shadow-sm border border-dark-green-octa">
            <button
              onClick={() => setTab("membership")}
              className={
                "px-4 sm:px-6 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer " +
                (tab === "membership"
                  ? "bg-green text-white"
                  : "text-dark-green hover:bg-[#eef7f0]")
              }
            >
              MEMBERSHIP
            </button>
            <button
              onClick={() => setTab("single")}
              className={
                "px-4 sm:px-6 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer " +
                (tab === "single"
                  ? "bg-green text-white"
                  : "text-dark-green hover:bg-[#eef7f0]")
              }
            >
              SINGLE
            </button>
          </div>
        </div>

        {tab === "membership" ? (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {membership.map((m, idx) => (
              <MembershipCard key={idx} {...m} />
            ))}
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div>
              <div className="mb-4">
                <div className="inline-flex items-center gap-2 bg-green text-white px-6 py-3 rounded-full shadow-md">
                  <span>🌞</span>
                  <span className="font-semibold">Summer Season</span>
                </div>
              </div>
              <SeasonTable title="Summer" data={summer} />
            </div>

            <div>
              <div className="mb-4">
                <div className="inline-flex items-center gap-2 bg-green text-white px-6 py-3 rounded-full shadow-md">
                  <span>❄️</span>
                  <span className="font-semibold">Winter Season</span>
                </div>
              </div>
              <SeasonTable title="Winter" data={winter} />
            </div>
          </div>
        )}
      </div>

      {/* alsó árnyék a maketthez hasonló lebegő hatásért */}
      {tab === "membership" && (
        <div className="mx-auto mt-10 max-w-5xl h-10 bg-gradient-to-b from-dark-green-octa/40 to-transparent blur-2xl rounded-full" />
      )}
    </section>
  );
}
