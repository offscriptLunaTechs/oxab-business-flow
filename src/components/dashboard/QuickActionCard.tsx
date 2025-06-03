
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: "blue" | "green" | "purple" | "orange" | "red";
  onClick: () => void;
  badge?: string;
}

const colorClasses = {
  blue: "border-blue-200 hover:border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100",
  green: "border-green-200 hover:border-green-300 bg-gradient-to-br from-green-50 to-green-100",
  purple: "border-purple-200 hover:border-purple-300 bg-gradient-to-br from-purple-50 to-purple-100",
  orange: "border-orange-200 hover:border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100",
  red: "border-red-200 hover:border-red-300 bg-gradient-to-br from-red-50 to-red-100",
};

const iconColorClasses = {
  blue: "text-blue-600",
  green: "text-green-600",
  purple: "text-purple-600",
  orange: "text-orange-600",
  red: "text-red-600",
};

const QuickActionCard = ({ 
  title, 
  description, 
  icon: Icon, 
  color, 
  onClick, 
  badge 
}: QuickActionCardProps) => {
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-2",
        colorClasses[color]
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <div className={cn(
                "p-3 rounded-lg bg-white shadow-sm",
                iconColorClasses[color]
              )}>
                <Icon className="h-6 w-6" />
              </div>
              {badge && (
                <span className="bg-white px-2 py-1 rounded-full text-xs font-medium text-gray-600 shadow-sm">
                  {badge}
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {title}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionCard;
