import { platform } from '../platform';

function DebugStrip() {
  return (
    <div className="fixed bottom-2 left-2 rounded-md border bg-background/80 px-2 py-1 text-[10px]">
      <span>ver: {platform.getVersion()}</span>
      <button
        className="ml-2 rounded border px-1"
        onClick={() => platform.notify({ title: "Hello from platform", body: "This is a test." })}
      >
        test notify
      </button>
    </div>
  );
}

export default DebugStrip;
