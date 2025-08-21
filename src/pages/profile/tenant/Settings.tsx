import { useState } from 'react';
import { FaCheckCircle, FaLink, FaQrcode, FaUpload, FaShieldAlt, FaCopy, FaEnvelope, FaLock } from 'react-icons/fa';

const SettingsPage = () => {
  // Mock data state
  const [settings, setSettings] = useState({
    verified: false,
    shareId: null as string | null,
    showContactInfo: true,
    showRentalHistory: true,
    searchable: true,
    requireApproval: true,
    idPhoto: null as File | null
  });

  // Handle ID verification upload
  const handleVerificationUpload = (files: File[]) => {
    if (files.length > 0) {
      setSettings(prev => ({
        ...prev,
        idPhoto: files[0],
        verified: true,
        shareId: 't_' + Math.random().toString(36).substring(2, 8)
      }));
    }
  };

  // Toggle settings
  const toggleSetting = (setting: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Account Settings</h1>
            <p className="text-gray-600 mt-1">
              Manage your profile visibility and security
            </p>
          </div>
        </div>

        {/* Verification Status Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <FaShieldAlt className="text-[#0369a1]" />
                Identity Verification
              </h2>
              <p className="text-gray-600 mt-1">
                {settings.verified 
                  ? "Your identity has been verified" 
                  : "Verify your identity to access all features"}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              settings.verified 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {settings.verified ? 'Verified' : 'Pending'}
            </span>
          </div>

          {!settings.verified && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Government ID
              </label>
              <div className="flex items-center gap-4">
                <label className="flex-1 cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition">
                    <FaUpload className="mx-auto text-gray-400 text-2xl" />
                    <p className="text-sm text-gray-600 mt-2">
                      Click to upload ID (JPG, PNG, PDF)
                    </p>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*,.pdf"
                      onChange={(e) => handleVerificationUpload(Array.from(e.target.files || []))}
                    />
                  </div>
                </label>
              </div>
              {settings.idPhoto && (
                <p className="text-sm text-green-600 mt-2">
                  Uploaded: {settings.idPhoto.name}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                We verify your identity to protect your account and enable sharing with landlords.
              </p>
            </div>
          )}
        </div>

        {/* Shareable Profile Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
            <FaLink className="text-[#0369a1]" />
            Shareable Profile Link
          </h2>

          {settings.verified ? (
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
                          copyToClipboard(`https://rentalcv.ai/t/${settings.shareId}`);
                        } else {
                          setSettings(prev => ({
                            ...prev,
                            shareId: 't_' + Math.random().toString(36).substring(2, 8)
                          }));
                        }
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-r-md transition ${
                        settings.shareId
                          ? 'bg-[#0369a1] hover:bg-[#075985] text-white'
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                    >
                      {settings.shareId ? (
                        <>
                          <FaCopy /> Copy
                        </>
                      ) : (
                        'Generate Link'
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
                      className="flex items-center gap-2 text-sm text-[#0369a1] hover:text-[#075985]"
                      onClick={() => alert('QR code download functionality would go here')}
                    >
                      <FaQrcode /> Download QR Code
                    </button>
                    <button 
                      className="flex items-center gap-2 text-sm text-[#0369a1] hover:text-[#075985]"
                      onClick={() => {
                        window.open(
                          `mailto:?subject=My RentalCV Profile&body=View my rental profile: https://rentalcv.ai/t/${settings.shareId}`,
                          '_blank'
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
                          onChange={() => toggleSetting('showContactInfo')}
                          className="h-4 w-4 text-[#0369a1] rounded"
                        />
                        <span className="text-sm text-gray-700">Show my contact information</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={settings.showRentalHistory}
                          onChange={() => toggleSetting('showRentalHistory')}
                          className="h-4 w-4 text-[#0369a1] rounded"
                        />
                        <span className="text-sm text-gray-700">Include rental history</span>
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
                Complete identity verification to generate your shareable profile link
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
                  onChange={() => toggleSetting('searchable')}
                  className="h-4 w-4 text-[#0369a1] rounded"
                />
                <span className="text-sm text-gray-700">
                  Allow landlords to find me by email
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                Landlords can request access to your profile if they have your email
              </p>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={settings.requireApproval}
                  onChange={() => toggleSetting('requireApproval')}
                  className="h-4 w-4 text-[#0369a1] rounded"
                />
                <span className="text-sm text-gray-700">    
                  Require my approval for each profile access
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                You'll need to approve each landlord before they can view your profile
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;