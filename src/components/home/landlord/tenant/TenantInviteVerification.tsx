import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "@/components/common/Button";
import { FaArrowLeft } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";

function TenantInviteVerification() {
    const location = useLocation();
    const navigate = useNavigate();

    // Extract token + email from URL
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");
    const email = queryParams.get("email");

    const [loading, setLoading] = useState(true);
    const [inviteData, setInviteData] = useState<any>(null);

    const [countries, setCountries] = useState<string[]>([]);
    const [country, setCountry] = useState("");
    const [regions, setRegions] = useState<string[]>([]);
    const [region, setRegion] = useState("");

    const [ip, setIp] = useState("");
    const [detected, setDetected] = useState(false);
    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
    const disclaimerRef = useRef<HTMLDivElement | null>(null);

    // Mock: verify invite token
    useEffect(() => {
        setTimeout(() => {
            if (!token) {
                setInviteData(null);
            } else {
                setInviteData({
                    tenantEmail: email,
                    landlordName: "John Landlord",
                    property: "Apartment 5B, Main Street",
                    startDate: "2025-09-01",
                    endDate: "2026-09-01",
                });
            }
            setLoading(false);
        }, 1000);
    }, [token, email]);

    // Fetch countries
    useEffect(() => {
        fetch("https://countriesnow.space/api/v0.1/countries/")
            .then((res) => res.json())
            .then((data) => {
                const countryList = data.data
                    .map((c: any) => c.country)
                    .sort((a: string, b: string) => a.localeCompare(b));
                setCountries(countryList);
            })
            .catch((err) => {
                console.error("❌ Failed to fetch countries:", err);
                setCountries([]);
            });
    }, []);

    // Detect country + region + IP
    useEffect(() => {
        fetch("https://ipwho.is/")
            .then((res) => res.json())
            .then((data) => {
                if (data.country) {
                    setCountry(data.country);
                    setIp(data.ip);
                    setRegion(data.region || ""); // detect region
                    setDetected(true);
                }
            })
            .catch(() => {
                setDetected(false);
            });
    }, []);

    useEffect(() => {
        if (!country) return;

        fetch("https://countriesnow.space/api/v0.1/countries/states", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ country }),
        })
            .then((res) => res.json())
            .then((data) => {
                const regionList = data.data.states.map((s: any) => s.name);
                setRegions(regionList);

                if (region && regionList.includes(region)) {
                    setRegion(region);
                } else {
                    setRegion(""); 
                }
            })
            .catch((err) => {
                console.error("❌ Failed to fetch regions:", err);
                setRegions([]);
            });
    }, [country]);

    const handleScroll = () => {
        const el = disclaimerRef.current;
        if (el && el.scrollTop + el.clientHeight >= el.scrollHeight) {
            setHasScrolledToBottom(true);
        }
    };

    const handleAccept = async () => {
        try {
            setLoading(true);
            const payload = {
                token,
                email,
                country,
                region,
                ip,
                device: navigator.userAgent,
                timestamp: Date.now(),
            };

            console.log("✅ Accept payload:", payload);

            toast.success("Invitation accepted successfully!");
            navigate("/tenant/dashboard");
        } catch (err: any) {
            toast.error("❌ Failed to accept invitation.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-50 font-sans antialiased">
            <ToastContainer />
            <div className="w-full flex items-center justify-center p-6">
                <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                    <div className="bg-gradient-to-r from-[#0369a1] to-[#0284c7] p-8 text-center">
                        <h2 className="text-3xl font-light text-white mb-1 tracking-wide">
                            Tenant Invitation Verification
                        </h2>
                    </div>

                    <div className="p-8 space-y-6 text-center">
                        {loading && (
                            <p className="text-slate-600">⏳ Checking your invitation...</p>
                        )}

                        {!loading && !inviteData && (
                            <>
                                <p className="text-red-500 font-medium">
                                    ❌ Invalid or expired invitation link.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => navigate("/login")}
                                    className="flex items-center justify-center text-sm text-[#0369a1] hover:text-[#0284c7] transition-colors duration-300 mx-auto mt-4"
                                >
                                    <FaArrowLeft className="mr-2" />
                                    Back to Login
                                </button>
                            </>
                        )}

                        {!loading && inviteData && (
                            <div className="space-y-4 text-left">
                                <p className="text-slate-700">
                                    📧 <span className="font-semibold">Tenant Email:</span>{" "}
                                    {inviteData.tenantEmail}
                                </p>
                                <p className="text-slate-700">
                                    🏠 <span className="font-semibold">Property:</span>{" "}
                                    {inviteData.property}
                                </p>
                                <p className="text-slate-700">
                                    👤 <span className="font-semibold">Landlord:</span>{" "}
                                    {inviteData.landlordName}
                                </p>
                                <p className="text-slate-700">
                                    📅 <span className="font-semibold">Tenancy Period:</span>{" "}
                                    {inviteData.startDate} → {inviteData.endDate}
                                </p>

                                {/* Country Dropdown */}
                                <label className="block text-sm font-medium text-slate-700 mt-4">
                                    🌍 Country of Residence
                                </label>
                                <Select
                                    options={countries.map((c) => ({ value: c, label: c }))}
                                    value={country ? { value: country, label: country } : null}
                                    onChange={(selected) => setCountry(selected?.value || "")}
                                    placeholder="Select Country"
                                    isSearchable
                                    className="w-full text-sm"
                                />

                                {/* Region Dropdown */}
                                {regions.length > 0 && (
                                    <>
                                        <label className="block text-sm font-medium text-slate-700 mt-4">
                                            🗺️ Region / State
                                        </label>
                                        <Select
                                            options={regions.map((r) => ({ value: r, label: r }))}
                                            value={region ? { value: region, label: region } : null}
                                            onChange={(selected) => setRegion(selected?.value || "")}
                                            placeholder="Select Region"
                                            isSearchable
                                            className="w-full text-sm"
                                        />
                                    </>
                                )}

                                {detected && country && (
                                    <p className="text-xs text-green-600 mt-1">
                                        ✅ Detected automatically by system (IP: {ip})
                                    </p>
                                )}

                                {/* Scrollable Disclaimer */}
                                <div
                                    ref={disclaimerRef}
                                    onScroll={handleScroll}
                                    className="mt-6 p-4 bg-slate-50 border rounded-lg text-sm text-slate-600 h-32 overflow-y-scroll"
                                >
                                    <p className="font-semibold mb-2">⚖️ Disclaimer:</p>
                                    <p>
                                        Please review the tenancy terms carefully. By accepting, you
                                        agree to the legal obligations under your country’s housing
                                        regulations. This includes rental payment responsibilities,
                                        property care, and termination rules.
                                    </p>
                                    <p className="mt-2">
                                        Ensure you are the invited tenant and confirm your details
                                        match the provided invitation. Any misuse of this link is
                                        subject to legal consequences.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-4 mt-6">
                                    <Button
                                        disabled={!country || !region || !hasScrolledToBottom}
                                        onClick={handleAccept}
                                        className={`w-full font-medium py-3 px-6 rounded-lg shadow-lg transition-all duration-300 ${
                                            !country || !region || !hasScrolledToBottom
                                                ? "bg-gray-400 cursor-not-allowed"
                                                : "bg-gradient-to-r from-[#28c76f] to-[#20a955] text-white hover:shadow-xl"
                                        }`}
                                    >
                                        Accept Invitation
                                    </Button>

                                    <button
                                        type="button"
                                        onClick={() => navigate("/login")}
                                        className="flex items-center justify-center text-sm text-[#0369a1] hover:text-[#0284c7] transition-colors duration-300 mx-auto"
                                    >
                                        <FaArrowLeft className="mr-2" />
                                        Back to Login
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TenantInviteVerification;
