import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface Crumb {
  label: string;
  to?: string;
}

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="flex items-center text-sm text-gray-600 mb-6">
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {item.to ? (
            <Link
              to={item.to}
              className="hover:text-blue-600 font-medium"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-semibold text-gray-900">
              {item.label}
            </span>
          )}

          {index < items.length - 1 && (
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
          )}
        </div>
      ))}
    </nav>
  );
}
