export default function ChatDisplay({ message, response, isEmptyMessage, isEmptyResponse }) {
  if (isEmptyMessage && isEmptyResponse) {
    return (
      <div className="flex items-center justify-center p-8">
        Nothing to process...
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-y-3 items-center max-h-[350px] overflow-y-auto my-2'>
      {!isEmptyMessage && (
        <p className="text-sm leading-6 mb-4 bg-slate-600 p-2.5 rounded-2xl w-fit self-end dark:text-white">
          {message}
        </p>
      )}
      {!isEmptyResponse && (
        <div className="flex flex-row gap-x-2 items-center">
          <img
            src="/images/logo.png"
            alt="logo"
            className="w-[40px] h-[40px] dark:invert"
          />
          <p className="text-sm leading-6 mb-4 dark:text-white">
            {response}
          </p>
        </div>
      )}
    </div>
  );
}
