import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Coupons() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;

        const fetchCoupons = async () => {
            try {
                const res = await fetch("http://localhost:5044/api/coupon/my", {
                    credentials: "include",
                });

                if (!res.ok) {
                    throw new Error("Failed to load coupons");
                }

                const data = await res.json();

                if (isMounted) {
                    setCoupons(data || []);
                }
            } catch (err) {
                if (isMounted) {
                    setError(
                        err.message || "Something went wrong while loading coupons."
                    );
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchCoupons();

        return () => {
            isMounted = false;
        };
    }, []);

    if (loading) {
        return (
            <div className="mt-10 flex flex-col items-center justify-center text-dark-green-half">
                <div className="w-full max-w-xl animate-pulse space-y-4">
                    <div className="h-16 rounded-2xl bg-lighter-green" />
                    <div className="h-16 rounded-2xl bg-lighter-green" />
                    <div className="h-16 rounded-2xl bg-lighter-green" />
                </div>
                <p className="mt-4 text-sm">Loading your coupons...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mt-10 flex flex-col items-center justify-center text-red-600">
                <p className="text-sm">Could not load coupons.</p>
                <p className="mt-1 text-xs text-red-400">{error}</p>
            </div>
        );
    }

    if (!coupons.length) {
        return (
            <div className="mt-10 flex flex-col items-center justify-center text-dark-green-half">
                <button
                    onClick={() => navigate("/minigame")}
                    className="mb-5 inline-flex cursor-pointer items-center gap-2 rounded-full bg-green px-5 py-2 text-sm font-semibold text-white shadow-md shadow-dark-green-octa hover:scale-[1.02] hover:shadow-lg active:scale-95 transition-transform duration-150"
                >
                    🎾 Play mini game &amp; win a coupon
                </button>

                <p className="mb-1 text-base font-semibold">No coupons yet</p>
                <p className="max-w-md text-center text-sm text-dark-green-half">
                    Play a match in the mini tennis game and win a sweet discount for
                    your next reservation!
                </p>
            </div>
        );
    }

    return (
        <div className="mt-3">
            {/* Funky gomb a kuponok előtt */}
            <div className="flex w-full items-center justify-center px-2 mb-2">
                <button
                    onClick={() => navigate("/minigame")}
                    className="inline-flex items-center gap-2 rounded-full bg-green px-4 py-1.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-dark-green-octa hover:scale-[1.02] hover:shadow-lg active:scale-95 transition-transform duration-150 cursor-pointer"
                >
                    🎾 Play mini game and earn a new coupon
                </button>
            </div>

            {/* scroll – history pattern: max-h + overflow-y + padding-right */}
            <div className="mt-1 px-2 max-h-[270px] pt-2 pb-5 overflow-y-auto pr-2">
                {/* több kupon egy sorban – dobozos grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {coupons.map((coupon) => {
                        const isUsed = coupon.used;

                        return (
                            <div
                                key={coupon.id}
                                className={`
                                    relative overflow-hidden rounded-2xl border bg-white] 
                                    shadow-sm transition-all duration-200 cursor-pointer
                                    ${
                                        isUsed
                                            ? "border-dark-green-octa opacity-80"
                                            : "border-light-green hover:-translate-y-1 hover:shadow-md"
                                    }
                                `}
                            >
                                {/* finom háttér overlay */}
                                <div
                                    className="pointer-events-none absolute inset-0 opacity-70"
                                    style={{
                                        backgroundImage:
                                            "radial-gradient(circle at 0 0, #eaf9e7 0, #eaf9e7 35%, transparent 60%)",
                                    }}
                                />

                                {/* dekor “ticket” pöttyök oldalt */}
                                <div className="pointer-events-none absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2">
                                    <div className="h-5 w-5 rounded-full bg-lighter-green border border-lighter-green" />
                                </div>
                                <div className="pointer-events-none absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2">
                                    <div className="h-5 w-5 rounded-full bg-lighter-green border border-lighter-green" />
                                </div>

                                {/* felső kis címke sáv */}
                                <div className="relative z-10 flex items-center justify-between px-3 pt-3">
                                    <span className="rounded-full bg-lighter-green px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-dark-green-half">
                                        Coupon
                                    </span>

                                    <span
                                        className={`
                                            rounded-full px-3 py-1 text-[11px] font-semibold 
                                            ${
                                                isUsed
                                                    ? "bg-dark-green-octa text-dark-green-half"
                                                    : "bg-light-green text-dark-green"
                                            }
                                        `}
                                    >
                                        {isUsed ? "Used" : "Active"}
                                    </span>
                                </div>

                                {/* fő tartalom */}
                                <div className="relative z-10 px-3 pb-3 pt-1">
                                    {/* szaggatott elválasztó */}
                                    <div className="mt-2 border-t border-dashed border-light-green" />

                                    <div className="mt-3 flex flex-col gap-2">
                                        <div>
                                            <div className="text-[10px] uppercase tracking-[0.16em] text-dark-green-half">
                                                Coupon code
                                            </div>
                                            <div className="mt-1 font-mono text-xl tracking-[0.3em] text-dark-green">
                                                {coupon.code}
                                            </div>
                                        </div>

                                        {coupon.expiresAt && (
                                            <div className="mt-1 text-[10px] uppercase tracking-[0.12em] text-dark-green-half">
                                                Expires:&nbsp;
                                                <span className="font-semibold text-dark-green">
                                                    {new Date(
                                                        coupon.expiresAt
                                                    ).toLocaleDateString()}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default Coupons;
