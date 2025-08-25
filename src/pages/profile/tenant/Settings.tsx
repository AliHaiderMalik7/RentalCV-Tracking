import { useQuery, useMutation } from "convex/react";
import { useState } from "react";
import {
  FaCheckCircle,
  FaLink,
  FaQrcode,
  FaUpload,
  FaShieldAlt,
  FaCopy,
  FaEnvelope,
  FaLock,
  FaTimes,
} from "react-icons/fa";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

const SettingsPage = () => {
  const user: any = useQuery(api.auth.getCurrentUser);
  const generateUploadUrl = useMutation(api.properties.generateUrl);
  const updateUser = useMutation(api.auth.updateUser);
  
  console.log("user data is ", user);

  // Local UI-only settings
  const [settings, setSettings] = useState({
    shareId: null as string | null,
    showContactInfo: true,
    showRentalHistory: true,
    searchable: true,
    requireApproval: true,
  });

  // Form data for document uploads
  const [formData, setFormData] = useState({
    landlordLicense: [] as File[],
    proofOfAddress: [] as File[],
    idVerificationDocs: [] as File[],
  });

  // Loading states
  const [uploading, setUploading] = useState(false);

  // Check verification status directly from DB (user)
  const isVerified = Boolean(
    user?.landlordLicense &&
      user?.landlordLicense.length > 0 &&
      user?.proofOfAddress?.length > 0 &&
      user?.idVerificationDocs?.length > 0
  );

  // Handle file upload for verification documents
  const handleVerificationUpload = (field: keyof typeof formData, files: File[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ...files], // append if multiple files
    }));
  };

  // Remove a file from the upload queue
  const removeFile = (field: keyof typeof formData, index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  // Process files and upload to Convex storage
  const processFiles = async (files: File[]): Promise<Id<"_storage">[]> => {
    const uploadPromises = files.map(async (file) => {
      // Get upload URL
      const postUrl = await generateUploadUrl();

      // Upload file
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) {
        throw new Error(`Upload failed: ${result.statusText}`);
      }

      const json = await result.json();
      return json.storageId as Id<"_storage">;
    });

    return Promise.all(uploadPromises);
  };

  // Submit all documents for verification
  const submitVerification = async () => {
    if (uploading) return;
    
    setUploading(true);
    try {
      // Process all document types
      const [landlordDocs, proofDocs, idDocs] = await Promise.all([
        processFiles(formData.landlordLicense),
        processFiles(formData.proofOfAddress),
        processFiles(formData.idVerificationDocs),
      ]);

      let validate = false;
            if (user.roles === "landlord") {
              const hasAllDocs =
                formData.idVerificationDocs.length > 0 &&
                formData.proofOfAddress.length > 0 &&
                formData.landlordLicense.length > 0;

              validate = hasAllDocs;
            }


      // Update user with the new documents
      const updateUserResponse = await updateUser({
        email:user.email,
        idVerificationDocs: idDocs,
        proofOfAddress: proofDocs,
        landlordLicense: landlordDocs,
        verified: validate,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        gender: user.gender,
        address: user.address,
        city: user.city,
        state: user.state,
        postalCode: user.postalCode,
        roles: user.roles,
       
      });
      
      console.log("updateUserResponse", updateUserResponse);
      
      // Clear the form data after successful upload
      setFormData({
        landlordLicense: [],
        proofOfAddress: [],
        idVerificationDocs: [],
      });
      
      alert("Documents uploaded successfully!");
    } catch (error) {
      console.error("Error uploading documents:", error);
      alert("Failed to upload documents. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Toggle UI settings
  const toggleSetting = (setting: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  if (user === undefined) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Account Settings
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your profile visibility and security
            </p>
          </div>
        </div>

        {/* Verification Status Card */}
        {user.roles === "landlord" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                  <FaShieldAlt className="text-[#0369a1]" />
                  Identity Verification
                </h2>
                <p className="text-gray-600 mt-1">
                  {isVerified
                    ? "Your identity has been verified"
                    : "Please upload the required documents"}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isVerified
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {isVerified ? "Verified" : "Pending"}
              </span>
            </div>

            {!isVerified && (
              <div className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {/* Profile Picture Upload */}
                  {(!user?.landlordLicense || user?.landlordLicense?.length === 0) && (
                    <label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition cursor-pointer">
                        <FaUpload className="mx-auto text-gray-400 text-2xl" />
                        <p className="text-sm text-gray-600 mt-2">
                          Upload Landlord License
                        </p>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*,.pdf"
                          onChange={(e) =>
                            handleVerificationUpload(
                              "landlordLicense",
                              Array.from(e.target.files || [])
                            )
                          }
                          multiple
                        />
                      </div>
                    </label>
                  )}

                  {/* Proof of Address Upload */}
                  {(!user?.proofOfAddress || user?.proofOfAddress?.length === 0) && (
                    <label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition cursor-pointer">
                        <FaUpload className="mx-auto text-gray-400 text-2xl" />
                        <p className="text-sm text-gray-600 mt-2">
                          Upload Proof of Address
                        </p>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*,.pdf"
                          onChange={(e) =>
                            handleVerificationUpload(
                              "proofOfAddress",
                              Array.from(e.target.files || [])
                            )
                          }
                          multiple
                        />
                      </div>
                    </label>
                  )}

                  {/* ID Verification Upload */}
                  {(!user?.idVerificationDocs || user?.idVerificationDocs?.length === 0) && (
                    <label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition cursor-pointer">
                        <FaUpload className="mx-auto text-gray-400 text-2xl" />
                        <p className="text-sm text-gray-600 mt-2">
                          Upload Government ID
                        </p>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*,.pdf"
                          onChange={(e) =>
                            handleVerificationUpload(
                              "idVerificationDocs",
                              Array.from(e.target.files || [])
                            )
                          }
                          multiple
                        />
                      </div>
                    </label>
                  )}
                </div>

                {/* Show selected files */}
                {(formData.landlordLicense.length > 0 ||
                 formData.proofOfAddress.length > 0 ||
                 formData.idVerificationDocs.length > 0) && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Files</h3>
                    <div className="space-y-2">
                      {formData.landlordLicense.map((file, index) => (
                        <div key={`landlord-${index}`} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span className="text-sm text-gray-600 truncate">{file.name}</span>
                          <button 
                            onClick={() => removeFile("landlordLicense", index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ))}
                      {formData.proofOfAddress.map((file, index) => (
                        <div key={`proof-${index}`} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span className="text-sm text-gray-600 truncate">{file.name}</span>
                          <button 
                            onClick={() => removeFile("proofOfAddress", index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ))}
                      {formData.idVerificationDocs.map((file, index) => (
                        <div key={`id-${index}`} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span className="text-sm text-gray-600 truncate">{file.name}</span>
                          <button 
                            onClick={() => removeFile("idVerificationDocs", index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submit button */}
                {(formData.landlordLicense.length > 0 ||
                 formData.proofOfAddress.length > 0 ||
                 formData.idVerificationDocs.length > 0) && (
                  <button
                    onClick={submitVerification}
                    disabled={uploading}
                    className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                      uploading ? "bg-gray-400" : "bg-[#0369a1] hover:bg-[#075985]"
                    } transition`}
                  >
                    {uploading ? "Uploading..." : "Submit Documents for Verification"}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Shareable Profile Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
            <FaLink className="text-[#0369a1]" />
            Shareable Profile Link
          </h2>

          {isVerified || user.roles === "tenant" ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Profile URL
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      readOnly
                      value={
                        settings.shareId
                          ? `https://rentalcv.ai/t/${settings.shareId}`
                          : "Generate your link first"
                      }
                      className="flex-1 p-2 border border-gray-300 rounded-l-md bg-gray-50 text-gray-700"
                    />
                    <button
                      onClick={() => {
                        if (settings.shareId) {
                          copyToClipboard(
                            `https://rentalcv.ai/t/${settings.shareId}`
                          );
                        } else {
                          setSettings((prev) => ({
                            ...prev,
                            shareId:
                              "t_" +
                              Math.random().toString(36).substring(2, 8),
                          }));
                        }
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-r-md transition ${
                        settings.shareId
                          ? "bg-[#0369a1] hover:bg-[#075985] text-white"
                          : "bg-green-500 hover:bg-green-600 text-white"
                      }`}
                    >
                      {settings.shareId ? (
                        <>
                          <FaCopy /> Copy
                        </>
                      ) : (
                        "Generate Link"
                      )}
                    </button>
                  </div>
                </div>
                {settings.shareId && (
                  <div className="bg-white p-2 rounded border border-gray-200">
                    <div className="w-20 h-20 bg-white border border-gray-300 flex items-center justify-center">
                      <div className="text-center text-xs p-1">
                        <FaQrcode className="mx-auto text-gray-400 text-2xl" />
                        <div className="text-[8px] opacity-70">QR Code</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {settings.shareId && (
                <>
                  <div className="flex items-center gap-3">
                    <button
                      className="flex items-center gap-2 text-sm text-[#0369a1] hover:text-[#075985] cursor-pointer"
                      onClick={() =>
                        alert("QR code download functionality would go here")
                      }
                    >
                      <FaQrcode /> Download QR Code
                    </button>
                    <button
                      className="flex items-center gap-2 text-sm text-[#0369a1] hover:text-[#075985] cursor-pointer"
                      onClick={() => {
                        window.open(
                          `mailto:?subject=My RentalCV Profile&body=View my rental profile: https://rentalcv.ai/t/${settings.shareId}`,
                          "_blank"
                        );
                      }}
                    >
                      <FaEnvelope /> Share via Email
                    </button>
                  </div>

                  <div className="pt-4 mt-4 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Visibility Settings
                    </h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.showContactInfo}
                          onChange={() => toggleSetting("showContactInfo")}
                          className="h-4 w-4 text-[#0369a1] rounded"
                        />
                        <span className="text-sm text-gray-700">
                          Show my contact information
                        </span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.showRentalHistory}
                          onChange={() => toggleSetting("showRentalHistory")}
                          className="h-4 w-4 text-[#0369a1] rounded"
                        />
                        <span className="text-sm text-gray-700">
                          Include rental history
                        </span>
                      </label>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <FaCheckCircle className="mx-auto text-[#0369a1] text-2xl mb-2" />
              <p className="text-[#0369a1]">
                Complete identity verification to generate your shareable
                profile link
              </p>
            </div>
          )}
        </div>

        {/* Privacy Settings Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
            <FaLock className="text-[#0369a1]" />
            Privacy Settings
          </h2>
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.searchable}
                  onChange={() => toggleSetting("searchable")}
                  className="h-4 w-4 text-[#0369a1] rounded"
                />
                <span className="text-sm text-gray-700">
                  Allow landlords to find me by email
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                Landlords can request access to your profile if they have your
                email
              </p>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.requireApproval}
                  onChange={() => toggleSetting("requireApproval")}
                  className="h-4 w-4 text-[#0369a1] rounded"
                />
                <span className="text-sm text-gray-700">
                  Require my approval for each profile access
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                You'll need to approve each landlord before they can view your
                profile
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;