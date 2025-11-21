import usePrice from "../hooks/usePrice";

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
  const { getPrice } = usePrice();

  const rows = [
    { label: "1 hour casual",         student: false, morning: false },
    { label: "1 hour student",        student: true,  morning: false },
    { label: "1 hour casual morning", student: false, morning: true },
    { label: "1 hour student morning",student: true,  morning: true },
  ];

  const summer = {
    outside: rows.map(({ label, student, morning }) => ({
      label,
      price: getPrice({
        season: "summer",
        outside: true,
        student,
        morning,
      }),
    })),
    inside: rows.map(({ label, student, morning }) => ({
      label,
      price: getPrice({
        season: "summer",
        outside: false,
        student,
        morning,
      }),
    })),
  };

  const winter = {
    outside: rows.map(({ label, student, morning }) => ({
      label,
      price: getPrice({
        season: "winter",
        outside: true,
        student,
        morning,
      }),
    })),
    inside: rows.map(({ label, student, morning }) => ({
      label,
      price: getPrice({
        season: "winter",
        outside: false,
        student,
        morning,
      }),
    })),
  };

  return (
    <section className="relative py-16 sm:py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-[#e9f6ea] to-[#cfeccc] -z-10" />

      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col items-center gap-3">
          <h2 className="text-3xl sm:text-5xl font-semibold text-dark-green text-center">
            Simple, transparent pricing
          </h2>
          <p className="text-dark-green-half text-center">No contracts. No surprise fees.</p>
        </div>

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
      </div>
    </section>
  );
}
