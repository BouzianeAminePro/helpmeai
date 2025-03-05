import Dropdown from "./ui/dropdown";

export default function Header({ selectedModel, setSelectedModel, models }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-10">
      <div className="flex flex-row items-center p-2">
        <div className="flex flex-row items-center">
          <img
            src="/images/logo.png"
            alt="logo"
            className="w-[60px] h-[60px] dark:invert"
          />
          <h1 className="text-sm">helpmeai</h1>
        </div>
        <div className="ml-auto">
          <Dropdown
            onClick={async (option) => await setSelectedModel(option)}
            selected={selectedModel}
            options={models}
          />
        </div>
      </div>
    </header>
  );
}
