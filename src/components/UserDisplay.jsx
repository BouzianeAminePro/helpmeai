import Button from "./ui/button";
import Dropdown from "./ui/dropdown";
import SigninIcon from "./ui/svgs/SigninIcon";
import SignoutIcon from "./ui/svgs/SignoutIcon";

export default function UserDisplay({ user, onLogout, onLogin }) {
    if (!user) {
        return (
            <Button
                tooltip="Signin"
                onClick={onLogin}
            >
                <SigninIcon />
            </Button>
        );
    }

    // Create options for the dropdown
    const options = ["Add ✨", "Logout", "Info"];

    const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

    const onAddCredit = async () => {
        await chrome.tabs.create({ url: `${API_URL}/checkout` });
    }

    // Custom renderer for the dropdown button
    const customButton = (
        <div className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 px-3 py-1 rounded-full text-xs transition-colors duration-200">
            {user.image ? (
                <img
                    src={user.image}
                    alt={user.name || "User"}
                    className="w-5 h-5 rounded-full"
                />
            ) : (
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold">
                    {(user.name || "U").charAt(0).toUpperCase()}
                </div>
            )}
            <span className="max-w-[100px] truncate font-semibold">{user.name || user.email || "User"}</span>
        </div>
    );

    // Custom renderer for dropdown items
    const renderOption = (option) => {
        return (
            <div className="px-2 py-1">
                {option === "Add ✨" &&
                    <button
                        onClick={() => onAddCredit()}
                        className="w-full text-left px-4 py-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 rounded font-semibold"
                    >
                        Add ✨
                    </button>
                }
                {option === "Logout" &&
                    <button
                        onClick={() => onLogout()}
                        className="w-full text-left px-4 py-2 text-xs text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                        <SignoutIcon />
                    </button>
                }
                {option === "Info" &&
                    <div className="px-4 py-1 border-b border-gray-200 dark:border-gray-700 mb-2">
                        <p className="font-medium text-xs truncate">{user.name}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs truncate font-semibold">{user.email}</p>
                    </div>
                }
            </div>
        );
    }

    const handleOptionClick = (option) => {
        if (option === "Logout") {
            onLogout();
        }
    };

    return (
        <div className="user-display">
            <Dropdown
                options={options}
                selected={null}
                onClick={handleOptionClick}
                customButton={customButton}
                renderOption={renderOption}
                dropdownClassName="absolute right-0 bottom-full mb-2 bg-white dark:bg-gray-800 shadow-lg rounded-md py-1 w-40 z-10"
            />
        </div>
    );
}
