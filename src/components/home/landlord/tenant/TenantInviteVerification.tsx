import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "@/components/common/Button";
import { FaArrowLeft } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";

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
    const [timestamp, setTimestamp] = useState<number>(Date.now());
    const [device, setDevice] = useState<string>("");

    const tenancyDetails:any = useQuery(
        api.tenancy.getTenancyDetailsByEmail,
        email ? { email } : "skip"
      );

      const propertyData = useQuery(
        api.properties.getPropertyById,
        tenancyDetails?.propertyId ? { propertyId: tenancyDetails.propertyId } : "skip"
      );

      const landlordData = useQuery(
        api.users.getUserById,
        tenancyDetails?.landlordId ? { userId: tenancyDetails?.landlordId } : "skip"
      );

    
    useEffect(() => {
        setDevice(navigator.userAgent);
    }, []);

    const [hasValidated, setHasValidated] = useState(false);

    useEffect(() => {
        console.log("tenancyDetails", tenancyDetails);
        if (!tenancyDetails || hasValidated) return;
      
        if (!tenancyDetails.inviteToken || tenancyDetails.inviteToken !== token) {
          setInviteData(null);
          setLoading(false);
          toast.error("❌ Invalid invitation link.");
          setHasValidated(true);
          return;
        }
      
        const tokenExpiry = Number(tenancyDetails.inviteTokenExpiry);
        console.log("Now:", Date.now(), "Token Expiry:", tokenExpiry, "Expired:", Date.now() > tokenExpiry);
      
        if (!tokenExpiry || Date.now() > tokenExpiry) {
          setInviteData(null);
          setLoading(false);
          toast.error("❌ Invitation link has expired.");
          setHasValidated(true);
          return;
        }
      
        if (!propertyData || !landlordData) return;
      
        setInviteData({
          tenantEmail: email,
          landlordName: landlordData.name ?? "Unknown Landlord",
          property: propertyData.address ?? "Unknown Address",
          startDate: tenancyDetails.startDate
            ? new Date(tenancyDetails.startDate).toISOString()
            : null,
          endDate: tenancyDetails.endDate
            ? new Date(tenancyDetails.endDate).toISOString()
            : null,
        });
      
        setLoading(false);
        setHasValidated(true);
      }, [tenancyDetails, propertyData, landlordData, token, email, hasValidated]);
      
      
      
      

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
                    setRegion(data.region || "");
                    setDetected(true);
                }
            })
            .catch(() => {
                setDetected(false);
            });
    }, []);

    // Fetch regions when country changes
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
                console.log("regions list", regionList);
                
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
                device,
                timestamp,
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
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#0369a1] to-[#0284c7] p-8 text-center">
                        <h2 className="text-3xl font-light text-white mb-1 tracking-wide">
                            Tenant Invitation Verification
                        </h2>
                    </div>

                    {/* Content */}
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
                                {/* Summary instead of raw details */}
                                <div className="bg-slate-50 border rounded-lg p-4 text-slate-700 text-sm leading-relaxed">
                                    <p>
                                        You have been invited by{" "}
                                        <span className="font-semibold">{inviteData.landlordName}</span>{" "}
                                        to enter into a tenancy agreement for{" "}
                                        <span className="font-semibold">{inviteData.property}</span>.
                                    </p>
                                    <p className="mt-2">
                                        The tenancy period will run from{" "}
                                        <span className="font-medium">
                                            {new Date(inviteData.startDate).toLocaleDateString()}
                                        </span>{" "}
                                        to{" "}
                                        <span className="font-medium">
                                            {new Date(inviteData.endDate).toLocaleDateString()}
                                        </span>.
                                    </p>
                                </div>

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

                                {/* Logs Section */}
                                {/* <div className="mt-6 p-4 bg-slate-100 border rounded-lg text-sm text-slate-700">
                                    <p className="font-semibold mb-2">📜 Verification Logs</p>
                                    <p>🌍 <span className="font-medium">Country:</span> {country || "N/A"}</p>
                                    <p>🗺️ <span className="font-medium">Region:</span> {region || "N/A"}</p>
                                    <p>⏱️ <span className="font-medium">Timestamp:</span> {new Date(timestamp).toLocaleString()}</p>
                                    <p>💻 <span className="font-medium">Device:</span> {device || "N/A"}</p>
                                    <p>🔗 <span className="font-medium">IP:</span> {ip || "N/A"}</p>
                                </div> */}

                                {/* Buttons */}
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
