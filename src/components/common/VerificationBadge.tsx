import { FaCheckCircle, FaStar, FaShieldAlt, FaCrown } from "react-icons/fa";

interface VerificationBadgeProps {
  type:
    | "verified_landlord"
    | "reviewing_landlord"
    | "mutual_review_landlord"
    | "verified_tenant";
  className?: string;
  size?: "sm" | "md" | "lg";
}

const VerificationBadge = ({
  type,
  className = "",
  size = "md",
}: VerificationBadgeProps) => {
  const getBadgeConfig = () => {
    switch (type) {
      case "verified_landlord":
        return {
          icon: <FaShieldAlt />,
          text: "Verified Landlord",
          bgColor: "bg-green-100",
          textColor: "text-green-800",
          borderColor: "border-green-200",
          description:
            "This landlord has been verified with proper documentation and licensing",
        };
      case "reviewing_landlord":
        return {
          icon: <FaStar />,
          text: "Reviewing Landlord",
          bgColor: "bg-blue-100",
          textColor: "text-blue-800",
          borderColor: "border-blue-200",
          description:
            "This landlord actively provides reviews to help tenants build their RentalCV",
        };
      case "mutual_review_landlord":
        return {
          icon: <FaCrown />,
          text: "Mutual Review Landlord",
          bgColor: "bg-purple-100",
          textColor: "text-purple-800",
          borderColor: "border-purple-200",
          description:
            "This landlord participates in mutual reviews, building trust on both sides",
        };
      case "verified_tenant":
        return {
          icon: <FaCheckCircle />,
          text: "Verified Tenant",
          bgColor: "bg-emerald-100",
          textColor: "text-emerald-800",
          borderColor: "border-emerald-200",
          description:
            "This tenant has verified rental history and positive reviews",
        };
      default:
        return {
          icon: <FaCheckCircle />,
          text: "Verified",
          bgColor: "bg-gray-100",
          textColor: "text-gray-800",
          borderColor: "border-gray-200",
          description: "Verified user",
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return {
          container: "px-2 py-1 text-xs",
          icon: "text-xs",
          text: "text-xs",
        };
      case "lg":
        return {
          container: "px-4 py-2 text-base",
          icon: "text-base",
          text: "text-base",
        };
      default: // md
        return {
          container: "px-3 py-1 text-sm",
          icon: "text-sm",
          text: "text-sm",
        };
    }
  };

  const config = getBadgeConfig();
  const sizeClasses = getSizeClasses();

  return (
    <div
      className={`
        inline-flex items-center space-x-1 rounded-full border font-medium
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        ${sizeClasses.container}
        ${className}
      `}
      title={config.description}
    >
      <span className={sizeClasses.icon}>{config.icon}</span>
      <span className={sizeClasses.text}>{config.text}</span>
    </div>
  );
};

export default VerificationBadge;
