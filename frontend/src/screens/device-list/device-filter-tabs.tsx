import { BuildingOfficeIcon, UserIcon } from "@heroicons/react/20/solid";
import { classNames } from "../../utils/common";

const tabs = [
  { name: "Devices", href: "#", icon: UserIcon, current: true },
  { name: "Filters", href: "#", icon: BuildingOfficeIcon, current: false },
];

export default function DeviceFilterTabs() {
  return (
    <div>
      <div className="sm:hidden">
        <label htmlFor="tabs" className="sr-only">
          Select a tab
        </label>
        {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
        <select
          id="tabs"
          name="tabs"
          className="block w-full rounded-md border-gray-300 focus:border-custom-blue-500 focus:ring-custom-blue-500"
          defaultValue={tabs.find((tab) => tab.current)!.name}>
          {tabs.map((tab) => (
            <option key={tab.name}>{tab.name}</option>
          ))}
        </select>
      </div>
      <div className="hidden sm:block">
        {/* <div className="border-b border-gray-200"> */}
        <div>
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <a
                key={tab.name}
                href={tab.href}
                className={classNames(
                  tab.current
                    ? "border-custom-blue-500 text-custom-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
                  "group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm"
                )}
                aria-current={tab.current ? "page" : undefined}>
                <tab.icon
                  className={classNames(
                    tab.current
                      ? "text-custom-blue-500"
                      : "text-gray-400 group-hover:text-gray-500",
                    "-ml-0.5 mr-2 h-5 w-5"
                  )}
                  aria-hidden="true"
                />
                <span>{tab.name}</span>
              </a>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
